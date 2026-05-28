import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message = typeof res === 'string' ? res : (res as any).message;
      const errors = (res as any).errors;

      return response.status(status).json({
        statusCode: status,
        error: exception.name.replace('Exception', ''),
        message: Array.isArray(message) ? message[0] : message,
        errors: errors ?? (Array.isArray(message) ? message.map((m) => ({ message: m })) : undefined),
      });
    }

    this.logger.error('Error no controlado', exception instanceof Error ? exception.stack : exception);
    return response.status(500).json({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Ha ocurrido un error inesperado',
    });
  }
}
