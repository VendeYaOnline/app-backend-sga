import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface SqlServerError {
  number?: number;
  message?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const resObj = res as { message?: string | string[]; errors?: unknown };
      const message =
        typeof res === 'string' ? res : (resObj.message ?? exception.message);
      const errors = resObj.errors;

      return response.status(status).json({
        statusCode: status,
        error: exception.name.replace('Exception', ''),
        message: Array.isArray(message) ? message[0] : message,
        errors:
          errors ??
          (Array.isArray(message)
            ? message.map((m: string) => ({ message: m }))
            : undefined),
      });
    }

    if (exception instanceof QueryFailedError) {
      return this.handleQueryFailedError(exception, response);
    }

    this.logger.error(
      'Error no controlado',
      exception instanceof Error ? exception.stack : exception,
    );
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Ha ocurrido un error inesperado',
    });
  }

  private handleQueryFailedError(
    exception: QueryFailedError & { driverError?: SqlServerError },
    response: Response,
  ) {
    const driverErr = exception.driverError as SqlServerError | undefined;
    const errNumber = driverErr?.number;
    const errMessage = driverErr?.message ?? exception.message;

    this.logger.error(
      `Error de base de datos (código ${errNumber ?? 'N/A'}): ${errMessage}`,
      exception.stack,
    );

    const constraintName = this.extractConstraintName(errMessage);
    const duplicateValue = this.extractDuplicateValue(errMessage);
    const tableName = this.extractTableName(errMessage);

    switch (errNumber) {
      case 2627:
      case 2601: {
        const campo = this.mapConstraintToField(constraintName);
        const msg = duplicateValue
          ? `El valor "${duplicateValue}" para "${campo}" ya existe en ${tableName}`
          : `Registro duplicado: violación de restricción "${constraintName}" en ${tableName}`;
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: msg,
          errors: [{ field: campo, message: msg, constraint: constraintName }],
        });
      }

      case 547: {
        const isCheckConstraint = /CHECK constraint/i.test(errMessage);
        if (isCheckConstraint) {
          return response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Bad Request',
            message: `Datos inválidos: la combinación de campos no cumple la restricción "${constraintName}"`,
            errors: [{ constraint: constraintName, table: tableName }],
          });
        }

        const isDeleteConflict = /\b(DELETE|REFERENCE)\b/i.test(errMessage);
        const field = this.mapFkConstraintToField(constraintName);
        const message = isDeleteConflict
          ? `No se puede eliminar el registro porque está referenciado en "${field}"`
          : `El valor enviado para "${field}" no existe`;
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message,
          errors: [{ field, constraint: constraintName, table: tableName }],
        });
      }

      case 515: {
        const column = this.extractColumnFromNullError(errMessage);
        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          message: column
            ? `El campo "${column}" no puede ser nulo`
            : 'Un campo obligatorio no puede ser nulo',
        });
      }

      case 245: {
        return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          error: 'Unprocessable Entity',
          message: 'Error de conversión de tipo de dato en la base de datos',
        });
      }

      default:
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'Error inesperado en la base de datos',
        });
    }
  }

  private extractConstraintName(message: string): string {
    // English SQL Server: "UNIQUE KEY constraint 'UQ_NAME'" or "PRIMARY KEY constraint 'PK_NAME'"
    const matchEn = message.match(/\bconstraint\s+'(\w+)'/i);
    if (matchEn) return matchEn[1];

    // English with double quotes: constraint "NAME"
    const matchEnDq = message.match(/\bconstraint\s+"(\w+)"/i);
    if (matchEnDq) return matchEnDq[1];

    // Spanish SQL Server: "restricción UNIQUE KEY 'UQ_NAME'"
    const matchEs = message.match(/UNIQUE KEY\s+'(\w+)'/i);
    if (matchEs) return matchEs[1];

    // Spanish generic: "restricción 'NAME'"
    const matchEsGen = message.match(/restricci[oó]n\s+(?:de\s+)?'(\w+)'/i);
    if (matchEsGen) return matchEsGen[1];

    // Fallback: any constraint-like name in single quotes (UQ_, PK_, FK_, etc.)
    const matchGeneric = message.match(/'((?:UQ|PK|FK|CK|IX)_\w+)'/i);
    if (matchGeneric) return matchGeneric[1];

    return 'DESCONOCIDA';
  }

  private extractTableName(message: string): string {
    const match = message.match(/(?:object|objeto)\s+'?([\w.]+)'?/i);
    return match?.[1] ?? 'tabla';
  }

  private extractDuplicateValue(message: string): string | null {
    const match = message.match(/duplicate key value is\s*\(([^)]+)\)/i);
    if (match) return match[1].trim();

    const match2 = message.match(
      /duplicate key row in object\s+'?[\w.]+'?\s+with unique index\s+'?(\w+)'?/i,
    );
    if (match2) return match2[1];

    const match3 = message.match(
      /el valor de clave duplicada es\s*\(([^)]+)\)/i,
    );
    if (match3) return match3[1].trim();

    return null;
  }

  private extractColumnFromNullError(message: string): string | null {
    const match = message.match(/(?:column|columna)\s+'([^']+)'/i);
    return match?.[1] ?? null;
  }

  private mapFkConstraintToField(constraint: string): string {
    const mapping: Record<string, string> = {
      // AGENDAMIENTO
      FK_AGENDA_CRS: 'crsId',
      FK_AGENDA_CONDENADO: 'condenadoId',
      FK_AGENDA_VICTIMA: 'victimaId',
      FK_AGENDA_ASIGNADO: 'asignadoA',
      FK_AGENDA_TECNICO: 'tecnicoId',
      FK_AGENDA_REGION: 'regionId',
      FK_AGENDA_COMUNA: 'comunaId',
      FK_AGENDA_TIPO_LUGAR: 'tipoLugarId',
      FK_AGENDA_EVENTO: 'eventoId',
      FK_AGENDA_MOTIVO: 'motivoNoRealizadoId',
      // EVENTO
      FK_EVENTO_SOLICITUD: 'solicitudId',
      FK_EVENTO_TIPO: 'tipoEventoId',
      FK_EVENTO_ASIGNADO: 'asignadoA',
      // RESOLUCION
      FK_RESOLUCION_TRIBUNAL: 'tribunalId',
      FK_RESOLUCION_CRS: 'crsId',
      FK_RESOLUCION_TIPO_LEY: 'tipoLeyId',
      FK_RESOLUCION_TIPO_CAUSA: 'tipoCausaId',
      FK_RESOLUCION_TIPO_PENA: 'tipoPenaId',
      // SOLICITUD
      FK_SOLICITUD_CONDENADO: 'condenadoId',
      FK_SOLICITUD_TRIBUNAL: 'tribunalId',
      FK_SOLICITUD_CRS: 'crsId',
      FK_SOLICITUD_ASIGNADO: 'asignadaA',
    };

    const upper = constraint.toUpperCase();
    for (const [key, value] of Object.entries(mapping)) {
      if (upper.includes(key.toUpperCase())) return value;
    }
    return constraint;
  }

  private mapConstraintToField(constraint: string): string {
    const mapping: Record<string, string> = {
      UQ_USUARIO_USERNAME: 'username',
      UQ_USUARIO_EMAIL: 'email',
      UQ_USUARIO_RUN: 'RUN',
      PK_USUARIO: 'ID',
      UQ_CAT_REGION_CODIGO: 'código de región',
      UQ_CAT_COMUNA_CODIGO: 'código de comuna',
      UQ_CAT_TRIBUNAL_CODIGOS: 'códigos de tribunal',
      UQ_CAT_CRS_CODIGO: 'código de CRS',
      UQ_CONDENADO: 'RUN/pasaporte',
      UQ_SOLICITUD_FACTIBILIDAD_SOLICITUD: 'solicitud (ya tiene factibilidad)',
      UQ_SOLICITUD_FACTIBILIDAD_FOLIO: 'folio interno',
      UQ_SOLICITUD_VICTIMA: 'asociación solicitud-víctima',
    };

    for (const [key, value] of Object.entries(mapping)) {
      if (constraint.toUpperCase().includes(key)) {
        return value;
      }
    }

    return constraint;
  }
}
