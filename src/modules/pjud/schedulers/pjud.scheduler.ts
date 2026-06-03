import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PjudService } from '../services/pjud.service';

@Injectable()
export class PjudScheduler {
  private readonly logger = new Logger(PjudScheduler.name);

  constructor(private readonly pjudService: PjudService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async reprocesarLlamadasPendientes(): Promise<void> {
    this.logger.log(
      'Iniciando reprocesamiento programado de llamadas PJUD pendientes',
    );

    try {
      const resultado = await this.pjudService.reprocesarPendientes();

      if (resultado.total > 0) {
        this.logger.log(
          `Reprocesamiento completado: ${resultado.total} pendientes, ${resultado.procesados} procesados, ${resultado.fallidos} fallidos`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error en reprocesamiento programado de llamadas PJUD',
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
