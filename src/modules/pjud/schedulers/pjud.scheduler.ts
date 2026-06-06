import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PjudService } from '../services/pjud.service';

@Injectable()
export class PjudScheduler {
  private readonly logger = new Logger(PjudScheduler.name);

  constructor(private readonly pjudService: PjudService) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async procesarColaEntrante(): Promise<void> {
    try {
      const resultado = await this.pjudService.reprocesarPendientes();

      if (resultado.total > 0) {
        this.logger.log(
          `Cola PJUD: ${resultado.total} tomadas, ${resultado.procesados} OK, ${resultado.fallidos} fallidas`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error en ciclo de procesamiento de cola PJUD',
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
