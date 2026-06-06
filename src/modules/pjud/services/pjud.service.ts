import {
  Injectable,
  NotFoundException,
  BadRequestException,
  BadGatewayException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs/promises';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PjudLlamada } from '../entities/pjud-llamada.entity';
import { SolicitudService } from '../../solicitud/services/solicitud.service';
import { EventoService } from '../../evento/services/evento.service';
import { ArchivoService } from '../../archivo/services/archivo.service';
import { CreateSolicitudDto } from '../../solicitud/dto/create-solicitud.dto';
import { RecepcionIftDto } from '../dto/recepcion-ift.dto';
import { RecepcionDecretoDto } from '../dto/recepcion-decreto.dto';
import { PjudEnvioDto } from '../dto/pjud-envio.dto';

@Injectable()
export class PjudService {
  private readonly logger = new Logger(PjudService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(PjudLlamada)
    private readonly pjudLlamadaRepo: Repository<PjudLlamada>,
    private readonly solicitudService: SolicitudService,
    private readonly eventoService: EventoService,
    private readonly archivoService: ArchivoService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get systemUserId(): number {
    const id = this.configService.get<string>('PJUD_SYSTEM_USER_ID');
    if (!id) {
      throw new BadRequestException(
        'PJUD_SYSTEM_USER_ID no configurado en variables de entorno',
      );
    }
    return parseInt(id, 10);
  }

  // ---------------------------------------------------------------------------
  // Consultas / admin
  // ---------------------------------------------------------------------------

  async findAllLlamadas(
    filters: PaginationDto & {
      endpoint?: string;
      procesadoOk?: string;
      solicitudId?: number;
    },
  ) {
    const { page = 1, limit = 20, endpoint, procesadoOk, solicitudId } = filters;

    const qb = this.pjudLlamadaRepo
      .createQueryBuilder('pl')
      .leftJoinAndSelect('pl.solicitud', 's');

    if (endpoint) qb.andWhere('pl.endpoint = :ep', { ep: endpoint });
    if (procesadoOk !== undefined)
      qb.andWhere('pl.procesadoOk = :pok', { pok: procesadoOk === 'true' });
    if (solicitudId) qb.andWhere('pl.solicitudId = :sid', { sid: solicitudId });

    qb.orderBy('pl.fechaLlamada', 'DESC');

    const skip = (page - 1) * limit;
    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number): Promise<PjudLlamada> {
    const llamada = await this.pjudLlamadaRepo.findOne({
      where: { id },
      relations: { solicitud: true },
    });
    if (!llamada)
      throw new NotFoundException(`Llamada PJUD con ID ${id} no encontrada`);
    return llamada;
  }

  async findPendientes(): Promise<PjudLlamada[]> {
    return this.pjudLlamadaRepo.find({
      where: { procesadoOk: false, direccion: 'ENTRANTE' },
      order: { fechaLlamada: 'ASC' },
    });
  }

  async consultaIft(solicitudPjudId: number): Promise<PjudLlamada[]> {
    return this.pjudLlamadaRepo.find({
      where: { solicitudPjudId },
      order: { fechaLlamada: 'DESC' },
    });
  }

  // ---------------------------------------------------------------------------
  // Recepción entrante — solo encola, el scheduler procesa
  // ---------------------------------------------------------------------------

  async recepcionIft(dto: RecepcionIftDto): Promise<PjudLlamada> {
    // Idempotencia: si ya existe un registro con el mismo solicitudPjudId, devolver sin duplicar
    const existente = await this.pjudLlamadaRepo.findOne({
      where: { solicitudPjudId: dto.solicitudPjudId, endpoint: 'RECEPCION_IFT' },
    });
    if (existente) {
      this.logger.warn(
        `IFT solicitudPjudId=${dto.solicitudPjudId} ya registrada (llamada ${existente.id}), ignorando duplicado`,
      );
      return existente;
    }

    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'RECEPCION_IFT',
      direccion: 'ENTRANTE',
      solicitudPjudId: dto.solicitudPjudId,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
      createdBy: this.systemUserId,
    });

    await this.pjudLlamadaRepo.save(llamada);
    this.logger.log(
      `IFT solicitudPjudId=${dto.solicitudPjudId} encolada como llamada ${llamada.id}`,
    );
    return llamada;
  }

  async recepcionDecreto(dto: RecepcionDecretoDto): Promise<PjudLlamada> {
    // Idempotencia: crrIdPjud es el identificador único del decreto en PJUD
    const existente = await this.pjudLlamadaRepo.findOne({
      where: { folioExterno: dto.crrIdPjud, endpoint: 'RECEPCION_DECRETO' },
    });
    if (existente) {
      this.logger.warn(
        `Decreto crrIdPjud=${dto.crrIdPjud} ya registrado (llamada ${existente.id}), ignorando duplicado`,
      );
      return existente;
    }

    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'RECEPCION_DECRETO',
      direccion: 'ENTRANTE',
      folioExterno: dto.crrIdPjud,
      solicitudId: dto.solicitudId,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
      createdBy: this.systemUserId,
    });

    await this.pjudLlamadaRepo.save(llamada);
    this.logger.log(
      `Decreto crrIdPjud=${dto.crrIdPjud} encolado como llamada ${llamada.id}`,
    );
    return llamada;
  }

  // ---------------------------------------------------------------------------
  // Envíos salientes
  // ---------------------------------------------------------------------------

  async enviarFactibilidad(solicitudId: number, userId: number): Promise<PjudLlamada> {
    this.logger.log(`Enviando factibilidad solicitud ${solicitudId} a PJUD (usuario ${userId})`);

    const envioPrevio = await this.pjudLlamadaRepo.findOne({
      where: { solicitudId, endpoint: 'ENVIAR_FACTIBILIDAD', procesadoOk: true },
    });
    if (envioPrevio) {
      throw new ConflictException(
        `La factibilidad de la solicitud ${solicitudId} ya fue enviada a PJUD (llamada ${envioPrevio.id})`,
      );
    }

    const solicitud = await this.solicitudService.findOne(solicitudId);
    if (!solicitud.solicitudPjudId) {
      throw new BadRequestException('La solicitud no tiene ID PJUD asignado');
    }

    const factibilidad = await this.solicitudService.findFactibilidad(solicitudId);
    if (!factibilidad) {
      throw new NotFoundException('No existe informe de factibilidad emitido para esta solicitud');
    }

    const refs = await this.archivoService.findByEntidad('SOLICITUD_FACTIBILIDAD', factibilidad.id);
    if (!refs.length) {
      throw new BadRequestException(
        'No se encontró el PDF de factibilidad. Debe subirse antes de enviar a PJUD.',
      );
    }

    const storageRoot = process.env.STORAGE_ROOT || 'C:/sga-storage';
    const rutaAbs = path.join(storageRoot, refs[0].archivo.rutaRelativa);
    const pdfBuffer = await fs.readFile(rutaAbs);
    const pdfBase64 = pdfBuffer.toString('base64');

    const fechaRespuesta = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const payload = {
      crrIdSolicitud: solicitud.solicitudPjudId,
      fechaRespuesta,
      tipoFactibilidad: factibilidad.tipoFactibilidad.codigo,
      ...(factibilidad.motivoNoFactible && { tipoMotivo: factibilidad.motivoNoFactible.codigo }),
      docFactibilidad: pdfBase64,
    };

    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'ENVIAR_FACTIBILIDAD',
      direccion: 'SALIENTE',
      solicitudId,
      requestBody: JSON.stringify({ ...payload, docFactibilidad: '[base64 omitido]' }),
      fechaLlamada: new Date(),
      createdBy: userId,
    });
    await this.pjudLlamadaRepo.save(llamada);

    const baseUrl = this.configService.getOrThrow<string>('PJUD_BASE_URL');
    const factPath = this.configService.get<string>('PJUD_FACTIBILIDAD_PATH', '/factibilidad');
    const start = Date.now();

    try {
      const res = await firstValueFrom(this.httpService.post(`${baseUrl}${factPath}`, payload));
      llamada.httpStatus = res.status;
      llamada.responseBody = JSON.stringify(res.data);
      llamada.procesadoOk = true;
      llamada.procesadoAt = new Date();
      this.logger.log(`Factibilidad solicitud ${solicitudId} enviada a PJUD OK (${res.status})`);
    } catch (error) {
      const axiosError = error as AxiosError;
      llamada.httpStatus = axiosError.response?.status ?? null;
      llamada.responseBody = JSON.stringify(axiosError.response?.data ?? null);
      llamada.errorDesc = axiosError.message;
      llamada.procesadoOk = false;
      this.logger.error(
        `Error al enviar factibilidad solicitud ${solicitudId} a PJUD`,
        axiosError.stack,
      );
    } finally {
      llamada.duracionMs = Date.now() - start;
      await this.pjudLlamadaRepo.save(llamada);
    }

    if (!llamada.procesadoOk) {
      throw new BadGatewayException(`PJUD rechazó la solicitud: ${llamada.errorDesc}`);
    }

    return llamada;
  }

  async enviarIncumplimiento(solicitudId: number, dto: PjudEnvioDto, userId: number): Promise<PjudLlamada> {
    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'ENVIAR_INCUMPLIMIENTO',
      direccion: 'SALIENTE',
      solicitudId,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
      createdBy: userId,
    });
    return this.pjudLlamadaRepo.save(llamada);
  }

  async enviarAlarmaCenco(dto: PjudEnvioDto, userId: number): Promise<PjudLlamada> {
    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'ENVIAR_ALARMA_CENCO',
      direccion: 'SALIENTE',
      solicitudId: dto.solicitudId,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
      createdBy: userId,
    });
    return this.pjudLlamadaRepo.save(llamada);
  }

  // ---------------------------------------------------------------------------
  // Reprocesamiento manual (admin)
  // ---------------------------------------------------------------------------

  async reprocesar(id: number): Promise<PjudLlamada> {
    const llamada = await this.findOne(id);

    if (llamada.procesadoOk) {
      throw new BadRequestException(
        `La llamada ${id} ya fue procesada exitosamente`,
      );
    }

    // Resetea para que el scheduler la tome en el próximo ciclo
    llamada.procesando = false;
    llamada.intentos = 0;
    llamada.proximoIntento = null;
    llamada.errorDesc = null;
    return this.pjudLlamadaRepo.save(llamada);
  }

  // ---------------------------------------------------------------------------
  // Cola de procesamiento — llamado por el scheduler
  // ---------------------------------------------------------------------------

  async reprocesarPendientes(): Promise<{
    total: number;
    procesados: number;
    fallidos: number;
  }> {
    const pendientes = await this.findPendientesParaProcesar(50);
    let procesados = 0;
    let fallidos = 0;

    for (const llamada of pendientes) {
      const start = Date.now();

      try {
        await this.procesarLlamada(llamada);
        llamada.procesadoOk = true;
        llamada.procesadoAt = new Date();
        procesados++;
        this.logger.log(`Llamada ${llamada.id} (${llamada.endpoint}) procesada OK`);
      } catch (error) {
        llamada.intentos += 1;
        llamada.errorDesc = error instanceof Error ? error.message : String(error);

        if (llamada.intentos < llamada.maxIntentos) {
          llamada.proximoIntento = this.calcularProximoIntento(llamada.intentos);
        }

        fallidos++;
        this.logger.error(
          `Llamada ${llamada.id} falló (intento ${llamada.intentos}/${llamada.maxIntentos}): ${llamada.errorDesc}`,
        );
      } finally {
        llamada.procesando = false;
        llamada.duracionMs = (llamada.duracionMs ?? 0) + (Date.now() - start);
        await this.pjudLlamadaRepo.save(llamada);
      }
    }

    return { total: pendientes.length, procesados, fallidos };
  }

  // ---------------------------------------------------------------------------
  // Privados
  // ---------------------------------------------------------------------------

  private async findPendientesParaProcesar(limit: number): Promise<PjudLlamada[]> {
    // UPDATE atómico: marca procesando=1 y retorna los IDs tomados.
    // Evita que dos ejecuciones concurrentes del scheduler tomen el mismo lote.
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);

    const result: Array<{ id: number }> = await this.dataSource.query(`
      UPDATE TOP(${safeLimit}) sga.PJUD_LLAMADA
      SET procesando = 1
      OUTPUT INSERTED.id
      WHERE procesado_ok  = 0
        AND procesando    = 0
        AND direccion     = 'ENTRANTE'
        AND intentos      < max_intentos
        AND (proximo_intento IS NULL OR proximo_intento <= GETDATE())
    `);

    if (!result.length) return [];

    const ids = result.map((r) => r.id);
    return this.pjudLlamadaRepo.findBy({ id: In(ids) });
  }

  private async procesarLlamada(llamada: PjudLlamada): Promise<void> {
    if (!llamada.requestBody) {
      throw new Error('requestBody vacío, no se puede procesar');
    }

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
    const dto = JSON.parse(llamada.requestBody);

    if (llamada.endpoint === 'RECEPCION_IFT') {
      const createDto = this.mapIftToCreateSolicitudDto(dto as RecepcionIftDto);
      const solicitud = await this.solicitudService.create(
        createDto,
        this.systemUserId,
        'INTERCONEXION_PJUD',
      );
      llamada.solicitudId = solicitud.id;
    } else if (llamada.endpoint === 'RECEPCION_DECRETO') {
      const createEventoDto = this.mapDecretoToCreateEventoCompletoDto(
        dto as RecepcionDecretoDto,
      );
      await this.eventoService.createCompleto([createEventoDto], this.systemUserId);
    } else {
      throw new Error(
        `Endpoint '${llamada.endpoint}' no soporta procesamiento automático`,
      );
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
  }

  private calcularProximoIntento(intentos: number): Date {
    // Backoff exponencial: intento 1 → 30s, 2 → 60s, 3 → 120s…
    const segundos = Math.pow(2, intentos) * 30;
    return new Date(Date.now() + segundos * 1000);
  }

  private mapIftToCreateSolicitudDto(dto: RecepcionIftDto): CreateSolicitudDto {
    return {
      tipoCausaId: dto.tipoCausaId,
      rucCausa: dto.rucCausa,
      ritCausa: dto.ritCausa,
      rolCausa: dto.rolCausa,
      tribunalId: dto.tribunalId,
      condenadoId: dto.condenadoId,
      condenado: dto.condenado,
      crsId: dto.crsId,
      tipoLeyId: dto.tipoLeyId,
      tipoPenaId: dto.tipoPenaId,
      medidaControlId: dto.medidaControlId,
      tipoHorarioId: dto.tipoHorarioId,
      horaDesde: dto.horaDesde,
      horaHasta: dto.horaHasta,
      tipoDiaInicioId: dto.tipoDiaInicioId,
      tipoDiaTerminoId: dto.tipoDiaTerminoId,
      conBeacon: dto.conBeacon,
      observaciones: dto.observaciones,
      solicitudPjudId: dto.solicitudPjudId,
      causaPjudId: dto.causaPjudId,
      tramitePjudId: dto.tramitePjudId,
      nomenclaturaPjudId: dto.nomenclaturaPjudId,
      usuarioSolicitantePjudId: dto.usuarioSolicitantePjudId,
      zonas: dto.zonas,
      delitoIds: dto.delitoIds,
      victimas: dto.victimas,
    };
  }

  private mapDecretoToCreateEventoCompletoDto(dto: RecepcionDecretoDto) {
    return {
      tipoEventoId: dto.tipoEventoId,
      solicitudId: dto.solicitudId,
      asignadoA: dto.asignadoA,
      fechaEvento: dto.fechaEvento,
      origenCreacion: 'INTERCONEXION_PJUD' as const,
      observaciones: dto.observaciones,
      resolucion: {
        crrIdPjud: dto.crrIdPjud,
        tribunalId: dto.tribunalId,
        tipoCausaId: dto.tipoCausaId,
        rucRes: dto.rucRes,
        ritRes: dto.ritRes,
        tipoLeyId: dto.tipoLeyId,
        crsId: dto.crsId,
        numPena: dto.numPena,
        tipoPenaId: dto.tipoPenaId,
        fechaDicto: dto.fechaDicto,
        fechaRecepcionCrs: dto.fechaRecepcionCrs,
        diasCondena: dto.diasCondena,
        diasAbono: dto.diasAbono,
        diasMonitoreo: dto.diasMonitoreo,
        ejecutoriada: dto.ejecutoriada,
        plazoMonitoreoDias: dto.plazoMonitoreoDias,
        fechaInicioMonitoreo: dto.fechaInicioMonitoreo,
        fechaTerminoAnterior: dto.fechaTerminoAnterior,
        fechaTerminoNueva: dto.fechaTerminoNueva,
        victimaConsentimiento: dto.victimaConsentimiento,
      },
    };
  }
}
