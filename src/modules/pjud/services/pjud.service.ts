import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PjudLlamada } from '../entities/pjud-llamada.entity';
import { SolicitudService } from '../../solicitud/services/solicitud.service';
import { EventoService } from '../../evento/services/evento.service';
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

  async findAllLlamadas(
    filters: PaginationDto & {
      endpoint?: string;
      procesadoOk?: string;
      solicitudId?: number;
    },
  ) {
    const {
      page = 1,
      limit = 20,
      endpoint,
      procesadoOk,
      solicitudId,
    } = filters;

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

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
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
      where: {
        procesadoOk: false,
        direccion: 'ENTRANTE',
      },
      order: { fechaLlamada: 'ASC' },
    });
  }

  async recepcionIft(dto: RecepcionIftDto): Promise<PjudLlamada> {
    const start = Date.now();

    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'RECEPCION_IFT',
      direccion: 'ENTRANTE',
      crrIdSolicitud: dto.crrIdSolicitud,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
    });

    try {
      const createDto = this.mapIftToCreateSolicitudDto(dto);
      const userId = this.systemUserId;

      const solicitud = await this.solicitudService.create(
        createDto,
        userId,
        'INTERCONEXION_PJUD',
      );

      llamada.solicitudId = solicitud.id;
      llamada.procesadoOk = true;
      llamada.procesadoAt = new Date();
      llamada.duracionMs = Date.now() - start;

      this.logger.log(
        `IFT CRR ${dto.crrIdSolicitud} procesada → Solicitud ${solicitud.id}`,
      );
    } catch (error) {
      llamada.errorDesc =
        error instanceof Error ? error.message : String(error);
      llamada.duracionMs = Date.now() - start;

      this.logger.error(
        `Error al procesar IFT CRR ${dto.crrIdSolicitud}: ${llamada.errorDesc}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    } finally {
      await this.pjudLlamadaRepo.save(llamada);
    }

    return llamada;
  }

  async recepcionDecreto(dto: RecepcionDecretoDto): Promise<PjudLlamada> {
    const start = Date.now();

    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'RECEPCION_DECRETO',
      direccion: 'ENTRANTE',
      solicitudId: dto.solicitudId,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
    });

    try {
      const createEventoDto = this.mapDecretoToCreateEventoCompletoDto(dto);
      const userId = this.systemUserId;

      const eventos = await this.eventoService.createCompleto(
        [createEventoDto],
        userId,
      );

      llamada.procesadoOk = true;
      llamada.procesadoAt = new Date();
      llamada.duracionMs = Date.now() - start;

      const eventoIds = eventos.map((e) => e.id).join(', ');
      this.logger.log(
        `Decreto CRR ${dto.crrIdPjud} procesado → Evento(s) ${eventoIds}`,
      );
    } catch (error) {
      llamada.errorDesc =
        error instanceof Error ? error.message : String(error);
      llamada.duracionMs = Date.now() - start;

      this.logger.error(
        `Error al procesar decreto CRR ${dto.crrIdPjud}: ${llamada.errorDesc}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    } finally {
      await this.pjudLlamadaRepo.save(llamada);
    }

    return llamada;
  }

  async consultaIft(crrId: number): Promise<PjudLlamada[]> {
    return this.pjudLlamadaRepo.find({
      where: { crrIdSolicitud: crrId },
      order: { fechaLlamada: 'DESC' },
    });
  }

  async enviarFactibilidad(
    solicitudId: number,
    dto: PjudEnvioDto,
  ): Promise<PjudLlamada> {
    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'ENVIAR_FACTIBILIDAD',
      direccion: 'SALIENTE',
      solicitudId,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
    });
    return this.pjudLlamadaRepo.save(llamada);
  }

  async enviarIncumplimiento(
    solicitudId: number,
    dto: PjudEnvioDto,
  ): Promise<PjudLlamada> {
    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'ENVIAR_INCUMPLIMIENTO',
      direccion: 'SALIENTE',
      solicitudId,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
    });
    return this.pjudLlamadaRepo.save(llamada);
  }

  async enviarAlarmaCenco(dto: PjudEnvioDto): Promise<PjudLlamada> {
    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'ENVIAR_ALARMA_CENCO',
      direccion: 'SALIENTE',
      solicitudId: dto.solicitudId,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
    });
    return this.pjudLlamadaRepo.save(llamada);
  }

  async reprocesar(id: number): Promise<PjudLlamada> {
    const llamada = await this.findOne(id);

    if (llamada.procesadoOk) {
      throw new BadRequestException(
        `La llamada ${id} ya fue procesada exitosamente`,
      );
    }

    llamada.procesadoOk = false;
    llamada.procesadoAt = null;
    llamada.errorDesc = null;
    return this.pjudLlamadaRepo.save(llamada);
  }

  async reprocesarPendientes(): Promise<{
    total: number;
    procesados: number;
    fallidos: number;
  }> {
    const pendientes = await this.findPendientes();
    let procesados = 0;
    let fallidos = 0;

    for (const llamada of pendientes) {
      const start = Date.now();

      try {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
        if (!llamada.requestBody) {
          throw new Error('requestBody vacío, no se puede reprocesar');
        }

        const dto = JSON.parse(llamada.requestBody);

        if (llamada.endpoint === 'RECEPCION_IFT') {
          const createDto = this.mapIftToCreateSolicitudDto(dto);
          const solicitud = await this.solicitudService.create(
            createDto,
            this.systemUserId,
            'INTERCONEXION_PJUD',
          );
          llamada.solicitudId = solicitud.id;
        } else if (llamada.endpoint === 'RECEPCION_DECRETO') {
          const createEventoDto = this.mapDecretoToCreateEventoCompletoDto(dto);
          await this.eventoService.createCompleto(
            [createEventoDto],
            this.systemUserId,
          );
        }

        llamada.procesadoOk = true;
        llamada.procesadoAt = new Date();
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
        llamada.duracionMs = (llamada.duracionMs || 0) + (Date.now() - start);
        llamada.errorDesc = null;
        procesados++;

        this.logger.log(`Llamada ${llamada.id} reprocesada exitosamente`);
      } catch (error) {
        llamada.errorDesc =
          error instanceof Error ? error.message : String(error);
        llamada.duracionMs = (llamada.duracionMs || 0) + (Date.now() - start);
        fallidos++;

        this.logger.error(
          `Error al reprocesar llamada ${llamada.id}: ${llamada.errorDesc}`,
        );
      } finally {
        await this.pjudLlamadaRepo.save(llamada);
      }
    }

    return { total: pendientes.length, procesados, fallidos };
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
