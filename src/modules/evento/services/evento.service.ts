import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository, IsNull, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Evento } from '../entities/evento.entity';
import { EventoValidacion } from '../entities/evento-validacion.entity';
import { Resolucion } from '../entities/resolucion.entity';
import { ResolucionCambioDomicilio } from '../entities/resolucion-cambio-domicilio.entity';
import { Proceso } from '../entities/proceso.entity';
import { ProcesoSoporteDetalle } from '../entities/proceso-soporte-detalle.entity';
import { ProcesoSoporteMotivo } from '../entities/proceso-soporte-motivo.entity';
import { ProcesoDispositivo } from '../../dispositivo/entities/proceso-dispositivo.entity';
import { AccionUsuario } from '../../carga-laboral/entities/accion-usuario.entity';
import { Agendamiento } from '../../agendamiento/entities/agendamiento.entity';
import { CatTipoEvento } from '../../catalogo/entities/cat-tipo-evento.entity';
import { CatTipoEventoValidacion } from '../../catalogo/entities/cat-tipo-evento-validacion.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateEventoCompletoDto } from '../dto/create-evento-completo.dto';
import { ReagendarEventoDto } from '../dto/reagendar-evento.dto';

@Injectable()
export class EventoService {
  private readonly logger = new Logger(EventoService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Evento)
    private readonly eventoRepo: Repository<Evento>,
    @InjectRepository(EventoValidacion)
    private readonly eventoValidacionRepo: Repository<EventoValidacion>,
    @InjectRepository(Resolucion)
    private readonly resolucionRepo: Repository<Resolucion>,
    @InjectRepository(ResolucionCambioDomicilio)
    private readonly resolucionCdRepo: Repository<ResolucionCambioDomicilio>,
    @InjectRepository(Proceso)
    private readonly procesoRepo: Repository<Proceso>,
    @InjectRepository(ProcesoSoporteDetalle)
    private readonly soporteDetalleRepo: Repository<ProcesoSoporteDetalle>,
    @InjectRepository(ProcesoSoporteMotivo)
    private readonly soporteMotivoRepo: Repository<ProcesoSoporteMotivo>,
    @InjectRepository(ProcesoDispositivo)
    private readonly procesoDispositivoRepo: Repository<ProcesoDispositivo>,
    @InjectRepository(CatTipoEvento)
    private readonly tipoEventoRepo: Repository<CatTipoEvento>,
    @InjectRepository(CatTipoEventoValidacion)
    private readonly tipoEventoValidacionRepo: Repository<CatTipoEventoValidacion>,
    @InjectRepository(Agendamiento)
    private readonly agendamientoRepo: Repository<Agendamiento>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(
    filters: PaginationDto & {
      solicitudId?: number;
      tipoEventoId?: number;
      estadoEvento?: string;
      asignadoA?: number;
    },
  ) {
    const {
      page = 1,
      limit = 20,
      solicitudId,
      tipoEventoId,
      estadoEvento,
      asignadoA,
    } = filters;

    const qb = this.eventoRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.tipoEvento', 'te')
      .leftJoinAndSelect('e.solicitud', 's')
      .leftJoinAndSelect('s.condenado', 'c')
      .leftJoinAndSelect('e.asignado', 'a')
      .where('e.deletedAt IS NULL');

    if (solicitudId) qb.andWhere('e.solicitudId = :sid', { sid: solicitudId });
    if (tipoEventoId)
      qb.andWhere('e.tipoEventoId = :tid', { tid: tipoEventoId });
    if (estadoEvento)
      qb.andWhere('e.estadoEvento = :est', { est: estadoEvento });
    if (asignadoA) qb.andWhere('e.asignadoA = :uid', { uid: asignadoA });

    qb.orderBy('e.fechaEvento', 'DESC');

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
    const evento = await this.eventoRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: {
        tipoEvento: true,
        solicitud: { condenado: true },
        asignado: true,
      },
    });
    if (!evento)
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    return evento;
  }

  async findValidaciones(eventoId: number) {
    return this.eventoValidacionRepo.find({
      where: { eventoId },
      relations: { rol: true, usuario: true },
      order: { id: 'ASC' },
    });
  }

  async findProceso(agendamientoId: number) {
    return this.procesoRepo.findOne({
      where: { agendamientoId },
      relations: {
        evento: true,
        region: true,
        comuna: true,
        tipoLugar: true,
        motivoNoRealizado: true,
        cerradoPor: true,
        agendamiento: {
          condenado: true,
          victima: true,
        },
      },
    });
  }

  async findAllProcesos(
    filters: PaginationDto & {
      crsId?: number;
      tecnicoId?: number;
      tipoEventoId?: number;
    },
  ) {
    const { page = 1, limit = 20, crsId, tecnicoId, tipoEventoId } = filters;

    const qb = this.procesoRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.evento', 'e')
      .leftJoinAndSelect('p.agendamiento', 'ag')
      .leftJoinAndSelect('p.region', 'r')
      .leftJoinAndSelect('p.comuna', 'co')
      .leftJoinAndSelect('p.motivoNoRealizado', 'mnr')
      .leftJoinAndSelect('p.cerradoPor', 'cp')
      .leftJoinAndSelect('ag.condenado', 'cond')
      .leftJoinAndSelect('ag.victima', 'vic')
      .leftJoinAndSelect('ag.asignado', 'agAsig')
      .leftJoinAndSelect('ag.crs', 'agCrs')
      .where('e.deletedAt IS NULL');

    if (crsId) qb.andWhere('ag.crsId = :crsId', { crsId });
    if (tecnicoId) qb.andWhere('ag.asignadoA = :tecnicoId', { tecnicoId });
    if (tipoEventoId)
      qb.andWhere('e.tipoEventoId = :tipoEventoId', { tipoEventoId });

    qb.orderBy('e.fechaEvento', 'DESC');

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

  async findResolucion(eventoId: number) {
    return this.resolucionRepo.findOne({
      where: { eventoId },
      relations: { tribunal: true, tipoLey: true, crs: true, tipoCausa: true },
    });
  }

  async create(dto: any, userId: number): Promise<Evento> {
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const tipoEvento = await this.tipoEventoRepo.findOne({
        where: { id: dto.tipoEventoId as number },
      });
      if (!tipoEvento)
        throw new BadRequestException('Tipo de evento no encontrado');

      const evento = manager.create(Evento, {
        tipoEventoId: dto.tipoEventoId as number,
        solicitudId: dto.solicitudId as number,
        estadoEvento: 'PENDIENTE',
        origenCreacion: (dto.origenCreacion as string) || 'FORMULARIO_WEB',
        fechaEvento: dto.fechaEvento
          ? new Date(dto.fechaEvento as string)
          : new Date(),
        asignadoA: dto.asignadoA as number | undefined,
        observaciones: dto.observaciones as string | undefined,
        createdBy: userId,
      });
      const saved = await manager.save(evento);

      const validacionesConfig = await this.tipoEventoValidacionRepo.find({
        where: { tipoEventoId: dto.tipoEventoId as number, activo: true },
        order: { orden: 'ASC' },
      });

      for (const config of validacionesConfig) {
        const validacion = manager.create(EventoValidacion, {
          eventoId: saved.id,
          tipoEventoValidacionId: config.id,
          rolId: config.rolId,
          estado: 'PENDIENTE',
        });
        await manager.save(validacion);
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `Evento ${saved.id} (tipo ${dto.tipoEventoId as number}) creado por usuario ${userId}`,
      );

      return this.findOne(saved.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  }

  async createCompleto(
    dtos: CreateEventoCompletoDto[],
    userId: number,
  ): Promise<Evento[]> {
    if (!dtos.length) {
      throw new BadRequestException('Debe enviar al menos un evento');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const saved: Evento[] = [];

      const tipoEventoIds = [...new Set(dtos.map((d) => d.tipoEventoId))];
      const tiposEvento = await manager.find(CatTipoEvento, {
        where: { id: In(tipoEventoIds) },
      });
      const tipoMap = new Map(tiposEvento.map((t: CatTipoEvento) => [t.id, t]));

      const codigosUnicos = ['DECRETO_MONITOREO_INICIAL', 'CESE_CONTROL'];
      const tiposUnicosIds = [...tipoMap.values()]
        .filter((t) => codigosUnicos.includes(t.codigo))
        .map((t) => t.id);

      const dtosUnicos = dtos.filter((d) =>
        tiposUnicosIds.includes(d.tipoEventoId),
      );

      if (dtosUnicos.length > 0) {
        const vistos = new Map<string, number>();
        for (const dto of dtosUnicos) {
          const key = `${dto.solicitudId}-${dto.tipoEventoId}`;
          if (vistos.has(key)) {
            const tipo = tipoMap.get(dto.tipoEventoId)!;
            throw new ConflictException(
              `No se pueden crear múltiples eventos de tipo "${tipo.descripcionEvento}" para la solicitud ${dto.solicitudId} en una misma petición`,
            );
          }
          vistos.set(key, dto.solicitudId);
        }

        const solicitudIdsUnicos = [
          ...new Set(dtosUnicos.map((d) => d.solicitudId)),
        ];
        const existentes = await manager.find(Evento, {
          where: {
            solicitudId: In(solicitudIdsUnicos),
            tipoEventoId: In(tiposUnicosIds),
            deletedAt: IsNull(),
          },
        });

        if (existentes.length > 0) {
          const primero = existentes[0];
          const tipo = tipoMap.get(primero.tipoEventoId)!;
          throw new ConflictException(
            `La solicitud ${primero.solicitudId} ya tiene un evento de tipo "${tipo.descripcionEvento}" (ID: ${primero.id})`,
          );
        }
      }

      const codigosAprobadoUnico = ['INSTALACION', 'DESINSTALACION'];
      const tiposAprobadoUnicoIds = [...tipoMap.values()]
        .filter((t) => codigosAprobadoUnico.includes(t.codigo))
        .map((t) => t.id);

      const dtosAprobadoUnico = dtos.filter((d) =>
        tiposAprobadoUnicoIds.includes(d.tipoEventoId),
      );

      if (dtosAprobadoUnico.length > 0) {
        const solicitudIdsAprobado = [
          ...new Set(dtosAprobadoUnico.map((d) => d.solicitudId)),
        ];
        const aprobadosExistentes = await manager.find(Evento, {
          where: {
            solicitudId: In(solicitudIdsAprobado),
            tipoEventoId: In(tiposAprobadoUnicoIds),
            estadoEvento: 'APROBADO',
            deletedAt: IsNull(),
          },
        });

        if (aprobadosExistentes.length > 0) {
          const primero = aprobadosExistentes[0];
          const tipo = tipoMap.get(primero.tipoEventoId)!;
          throw new ConflictException(
            `La solicitud ${primero.solicitudId} ya tiene un evento de tipo "${tipo.descripcionEvento}" en estado APROBADO (ID: ${primero.id})`,
          );
        }
      }

      const dtosDesinstalacion = dtos.filter((d) => {
        const tipo = tipoMap.get(d.tipoEventoId);
        return tipo?.codigo === 'DESINSTALACION';
      });
      const dtosSoporte = dtos.filter((d) => {
        const tipo = tipoMap.get(d.tipoEventoId);
        return tipo?.codigo === 'SOPORTE';
      });

      if (dtosDesinstalacion.length > 0 || dtosSoporte.length > 0) {
        const tiposProceso = await manager.find(CatTipoEvento, {
          where: { codigo: In(['INSTALACION', 'DESINSTALACION', 'SOPORTE']) },
        });
        const tipoInstId = tiposProceso.find(
          (t) => t.codigo === 'INSTALACION',
        )?.id;
        const tipoDesinstId = tiposProceso.find(
          (t) => t.codigo === 'DESINSTALACION',
        )?.id;

        const solicitudesAValidar = [
          ...new Set([
            ...dtosDesinstalacion.map((d) => d.solicitudId),
            ...dtosSoporte.map((d) => d.solicitudId),
          ]),
        ];

        const tipoIdsConsulta: number[] = [];
        if (tipoInstId != null) tipoIdsConsulta.push(tipoInstId);
        if (tipoDesinstId != null) tipoIdsConsulta.push(tipoDesinstId);

        if (tipoIdsConsulta.length > 0) {
          const eventosPrevios = await manager.find(Evento, {
            where: {
              solicitudId: In(solicitudesAValidar),
              tipoEventoId: In(tipoIdsConsulta),
              estadoEvento: 'APROBADO',
              deletedAt: IsNull(),
            },
          });

          const solicitudesConInstalacion = new Set(
            eventosPrevios
              .filter((e) => e.tipoEventoId === tipoInstId)
              .map((e) => e.solicitudId),
          );
          const solicitudesConDesinstalacion = new Set(
            eventosPrevios
              .filter((e) => e.tipoEventoId === tipoDesinstId)
              .map((e) => e.solicitudId),
          );

          for (const dto of dtosDesinstalacion) {
            if (!solicitudesConInstalacion.has(dto.solicitudId)) {
              throw new ConflictException(
                `No se puede crear un evento de desinstalación para la solicitud ${dto.solicitudId} porque no existe un evento de instalación previo en estado APROBADO`,
              );
            }
          }

          for (const dto of dtosSoporte) {
            if (!solicitudesConInstalacion.has(dto.solicitudId)) {
              throw new ConflictException(
                `No se puede crear un evento de soporte para la solicitud ${dto.solicitudId} porque no existe un evento de instalación previo en estado APROBADO`,
              );
            }
            if (solicitudesConDesinstalacion.has(dto.solicitudId)) {
              throw new ConflictException(
                `No se puede crear un evento de soporte para la solicitud ${dto.solicitudId} porque ya existe un evento de desinstalación`,
              );
            }
          }
        }
      }

      const codigosResolucion = [
        'DECRETO_MONITOREO_INICIAL',
        'PRORROGA_EXTENSION',
        'CESE_CONTROL',
        'INFORME_CONTROL',
        'INCOMPETENCIA',
      ];
      const resolucionDtos = dtos.filter((d) => {
        const tipo = tipoMap.get(d.tipoEventoId);
        return tipo && codigosResolucion.includes(tipo.codigo);
      });
      const noResolucionDtos = dtos.filter((d) => {
        const tipo = tipoMap.get(d.tipoEventoId);
        return !tipo || !codigosResolucion.includes(tipo.codigo);
      });

      for (const dto of resolucionDtos) {
        const evento = await this.crearEventoConHijas(
          dto,
          userId,
          manager,
          tipoMap,
        );
        saved.push(evento);
      }

      const ordenParaQuien: Record<string, number> = {
        CONDENADO: 1,
        VICTIMA: 2,
      };
      const sortedNoResolucion = [...noResolucionDtos].sort(
        (a, b) =>
          (ordenParaQuien[a.agendamiento?.paraQuien ?? ''] ?? 3) -
          (ordenParaQuien[b.agendamiento?.paraQuien ?? ''] ?? 3),
      );

      for (const dto of sortedNoResolucion) {
        const evento = await this.crearEventoConHijas(
          dto,
          userId,
          manager,
          tipoMap,
        );
        saved.push(evento);
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `${saved.length} evento(s) creado(s) por usuario ${userId}: [${saved.map((e) => e.id).join(', ')}]`,
      );

      const ids = saved.map((e) => e.id);
      return this.eventoRepo.find({
        where: { id: In(ids), deletedAt: IsNull() },
        relations: {
          tipoEvento: true,
          solicitud: { condenado: true },
          asignado: true,
        },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async crearEventoConHijas(
    dto: CreateEventoCompletoDto,
    userId: number,
    manager: EntityManager,
    tipoMap: Map<number, CatTipoEvento>,
  ): Promise<Evento> {
    if (dto.resolucion && dto.agendamiento) {
      throw new BadRequestException(
        'No se pueden enviar resolución y agendamiento en el mismo evento. Use uno solo.',
      );
    }

    const tipoEvento = tipoMap.get(dto.tipoEventoId);
    if (!tipoEvento) {
      throw new BadRequestException('Tipo de evento no encontrado');
    }

    const { codigo } = tipoEvento;

    const esResolucion = [
      'DECRETO_MONITOREO_INICIAL',
      'PRORROGA_EXTENSION',
      'CESE_CONTROL',
      'INFORME_CONTROL',
      'INCOMPETENCIA',
    ].includes(codigo);

    const esProceso = ['INSTALACION', 'DESINSTALACION', 'SOPORTE'].includes(
      codigo,
    );

    if (dto.resolucion && !esResolucion) {
      throw new BadRequestException(
        `El tipo de evento "${codigo}" no admite datos de resolución`,
      );
    }

    if (dto.agendamiento && !esProceso) {
      throw new BadRequestException(
        `El tipo de evento "${codigo}" no admite datos de agendamiento`,
      );
    }

    const evento = manager.create(Evento, {
      tipoEventoId: dto.tipoEventoId,
      solicitudId: dto.solicitudId,
      estadoEvento: 'APROBADO',
      origenCreacion: dto.origenCreacion || 'FORMULARIO_WEB',
      fechaEvento: dto.fechaEvento ? new Date(dto.fechaEvento) : new Date(),
      asignadoA: dto.asignadoA,
      observaciones: dto.observaciones,
      createdBy: userId,
    });
    const saved = await manager.save(evento);

    if (dto.resolucion) {
      const resolucion = manager.create(Resolucion, {
        eventoId: saved.id,
        ...dto.resolucion,
      });
      await manager.save(resolucion);
      this.logger.log(
        `Resolución creada para evento ${saved.id} (tipo: ${codigo})`,
      );
    }

    if (dto.agendamiento) {
      const agData = dto.agendamiento;
      const paraQuien = agData.paraQuien ?? 'CONDENADO';
      const condenadoId = agData.condenadoId ?? null;
      const victimaId = agData.victimaId ?? null;

      if (paraQuien === 'CONDENADO' && !condenadoId) {
        throw new BadRequestException(
          'Debe especificar condenadoId cuando paraQuien es CONDENADO',
        );
      }
      if (paraQuien === 'VICTIMA' && !victimaId) {
        throw new BadRequestException(
          'Debe especificar victimaId cuando paraQuien es VICTIMA',
        );
      }

      const agendamiento = manager.create(Agendamiento, {
        eventoId: saved.id,
        fechaAgendada: new Date(agData.fechaAgendada),
        horaInicioRango: agData.horaInicioRango ?? null,
        horaFinRango: agData.horaFinRango ?? null,
        asignadoA: agData.asignadoA ?? dto.asignadoA ?? null,
        crsId: agData.crsId,
        regionId: agData.regionId ?? null,
        comunaId: agData.comunaId ?? null,
        tipoLugarId: agData.tipoLugarId ?? null,
        direccionAgenda: agData.direccionAgenda ?? null,
        urlAcceso: agData.urlAcceso ?? null,
        tipoSoporte: agData.tipoSoporte ?? null,
        notas: agData.notas ?? null,
        paraQuien: agData.paraQuien ?? 'CONDENADO',
        condenadoId: agData.condenadoId ?? null,
        victimaId: agData.victimaId ?? null,
        estadoAgenda: 'EN_PROCESO',
        esVigente: true,
        estaAbierto: true,
        createdBy: userId,
      } as any);
      const savedAgenda = await manager.save(agendamiento);
      this.logger.log(
        `Agendamiento ${savedAgenda.id} creado para evento ${saved.id} (tipo: ${codigo})`,
      );
    }

    const accion = manager.create(AccionUsuario, {
      usuarioId: userId,
      tipoAccion: 'CREAR_EVENTO',
      entidad: 'EVENTO',
      entidadId: saved.id,
      solicitudId: saved.solicitudId,
      fechaAccion: new Date(),
    });
    await manager.save(accion);

    return saved;
  }

  async update(
    id: number,
    dto: Record<string, unknown>,
    userId: number,
  ): Promise<Evento> {
    const evento = await this.findOne(id);
    Object.assign(evento, dto, { updatedBy: userId });
    return this.eventoRepo.save(evento);
  }

  async ejecutarValidacion(
    eventoId: number,
    validacionId: number,
    dto: { estado: string; observaciones?: string },
    userId: number,
  ) {
    const validacion = await this.eventoValidacionRepo.findOne({
      where: { id: validacionId, eventoId },
      relations: { tipoEventoValidacion: true },
    });

    if (!validacion) throw new NotFoundException('Validación no encontrada');
    if (validacion.estado !== 'PENDIENTE') {
      throw new UnprocessableEntityException(
        'Esta validación ya fue ejecutada',
      );
    }

    validacion.estado = dto.estado;
    validacion.usuarioId = userId;
    validacion.fechaValidacion = new Date();
    validacion.observaciones = dto.observaciones ?? null;
    await this.eventoValidacionRepo.save(validacion);

    if (
      dto.estado === 'RECHAZADO' &&
      validacion.tipoEventoValidacion?.obligatorio
    ) {
      const evento = await this.findOne(eventoId);
      evento.estadoEvento = 'RECHAZADO';
      await this.eventoRepo.save(evento);
    }

    this.logger.log(
      `Validación ${validacionId} del evento ${eventoId}: ${dto.estado}`,
    );
    return validacion;
  }

  async updateProceso(agendamientoId: number, dto: any) {
    const existente = await this.procesoRepo.findOne({
      where: { agendamientoId },
    });
    if (existente) {
      Object.assign(existente, dto);
      return this.procesoRepo.save(existente);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const nuevo = this.procesoRepo.create({ agendamientoId, ...dto });
    return this.procesoRepo.save(nuevo);
  }

  async createProceso(
    dto: {
      agendamientoId: number;
      regionId?: number;
      comunaId?: number;
      tipoLugarId?: number;
      direccionProceso?: string;
      fechaEjecucion?: string;
      horaLlegada?: string;
      horaSalida?: string;
      realizado?: boolean;
      motivoNoRealizadoId?: number;
      detalleNoRealizado?: string;
      notas?: string;
      dispositivos?: {
        numeroSerie?: string;
        rolDispositivoId: number;
        talla?: string;
        observaciones?: string;
        entregado?: boolean;
      }[];
      soporteDetalle?: {
        medioContacto?: string;
        observacionesSoporte?: string;
      };
      motivos?: {
        tipoProblemaId: number;
        momento?: string;
        observacion?: string;
      }[];
    },
    userId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const agendamiento = await manager.findOne(Agendamiento, {
        where: { id: dto.agendamientoId, deletedAt: IsNull() },
      });
      if (!agendamiento) {
        throw new NotFoundException(
          `Agendamiento con ID ${dto.agendamientoId} no encontrado`,
        );
      }

      const existente = await manager.findOne(Proceso, {
        where: { agendamientoId: dto.agendamientoId },
      });
      if (existente) {
        throw new ConflictException(
          `Ya existe un proceso para el agendamiento ${dto.agendamientoId}. Use PUT /procesos/${dto.agendamientoId} para actualizarlo.`,
        );
      }

      const {
        agendamientoId,
        dispositivos,
        soporteDetalle,
        motivos,
        ...restDto
      } = dto;
      const nuevo = manager.create(Proceso, {
        agendamientoId,
        eventoId: agendamiento.eventoId,
        ...restDto,
      });
      const procesoGuardado = await manager.save(nuevo);

      let dispositivosGuardados: ProcesoDispositivo[] = [];
      if (dispositivos && dispositivos.length > 0) {
        const entities = dispositivos.map((dispDto) =>
          manager.create(ProcesoDispositivo, {
            agendamientoId,
            ...dispDto,
            fechaRegistro: new Date(),
          }),
        );
        dispositivosGuardados = await manager.save(entities);
      }

      let soporteDetalleGuardado: ProcesoSoporteDetalle | null = null;
      if (soporteDetalle) {
        soporteDetalleGuardado = manager.create(ProcesoSoporteDetalle, {
          agendamientoId,
          ...soporteDetalle,
        });
        soporteDetalleGuardado = await manager.save(soporteDetalleGuardado);
      }

      let motivosGuardados: ProcesoSoporteMotivo[] = [];
      if (motivos && motivos.length > 0) {
        const entities = motivos.map((m) =>
          manager.create(ProcesoSoporteMotivo, {
            agendamientoId,
            tipoProblemaId: m.tipoProblemaId,
            observacion: m.observacion ?? null,
            momento: m.momento ?? 'EJECUCION',
          }),
        );
        motivosGuardados = await manager.save(entities);
      }

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: 'CREAR_PROCESO',
        entidad: 'PROCESO',
        entidadId: agendamientoId,
        fechaAccion: new Date(),
        detalles: JSON.stringify({
          agendamientoId,
          cantidadDispositivos: dispositivosGuardados.length,
          tieneSoporteDetalle: !!soporteDetalleGuardado,
          cantidadMotivos: motivosGuardados.length,
        }),
      });
      await manager.save(accion);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Proceso creado para agendamiento ${agendamientoId} (evento ${agendamiento.eventoId}) con ${dispositivosGuardados.length} dispositivo(s), soporte=${!!soporteDetalleGuardado}, ${motivosGuardados.length} motivo(s) por usuario ${userId}`,
      );

      return {
        ...procesoGuardado,
        dispositivos: dispositivosGuardados,
        soporteDetalle: soporteDetalleGuardado,
        motivos: motivosGuardados,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cerrarProceso(
    agendamientoId: number,
    dto: {
      realizado: boolean;
      motivoNoRealizadoId?: number;
      detalleNoRealizado?: string;
    },
    userId: number,
  ) {
    const proceso = await this.procesoRepo.findOne({
      where: { agendamientoId },
    });
    if (!proceso) throw new NotFoundException('Proceso no encontrado');

    proceso.realizado = dto.realizado;
    proceso.fechaCierre = new Date();
    proceso.cerradoBy = userId;

    if (!dto.realizado) {
      proceso.motivoNoRealizadoId = dto.motivoNoRealizadoId ?? null;
      proceso.detalleNoRealizado = dto.detalleNoRealizado ?? null;
    }

    await this.procesoRepo.save(proceso);

    await this.agendamientoRepo.update(agendamientoId, {
      estadoAgenda: dto.realizado ? 'COMPLETADO' : 'NO_REALIZADO',
    });

    return this.procesoRepo.findOne({
      where: { agendamientoId },
    });
  }

  async cerrarProcesoCompleto(
    agendamientoId: number,
    dto: {
      realizado: boolean;
      motivoNoRealizadoId?: number;
      detalleNoRealizado?: string;
      horaLlegada?: string;
      horaSalida?: string;
      dispositivos?: {
        numeroSerie: string;
        rolDispositivoId: number;
        talla?: string;
        observaciones?: string;
        entregado?: boolean;
      }[];
    },
    userId: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const proceso = await manager.findOne(Proceso, {
        where: { agendamientoId },
      });
      if (!proceso) throw new NotFoundException('Proceso no encontrado');

      if (dto.horaLlegada !== undefined) proceso.horaLlegada = dto.horaLlegada;
      if (dto.horaSalida !== undefined) proceso.horaSalida = dto.horaSalida;

      proceso.realizado = dto.realizado;
      proceso.fechaCierre = new Date();
      proceso.cerradoBy = userId;

      if (!dto.realizado) {
        proceso.motivoNoRealizadoId = dto.motivoNoRealizadoId ?? null;
        proceso.detalleNoRealizado = dto.detalleNoRealizado ?? null;
      }

      await manager.save(proceso);

      await manager.update(Agendamiento, agendamientoId, {
        estadoAgenda: dto.realizado ? 'COMPLETADO' : 'NO_REALIZADO',
      });

      if (dto.dispositivos !== undefined && dto.dispositivos.length > 0) {
        await manager.delete(ProcesoDispositivo, { agendamientoId });

        const nuevos = dto.dispositivos.map((d) =>
          manager.create(ProcesoDispositivo, {
            agendamientoId,
            ...d,
            fechaRegistro: new Date(),
          }),
        );
        await manager.save(nuevos);
      }

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: 'CERRAR_PROCESO',
        entidad: 'PROCESO',
        entidadId: agendamientoId,
        fechaAccion: new Date(),
        detalles: JSON.stringify({
          realizado: dto.realizado,
          horaLlegada: dto.horaLlegada ?? null,
          horaSalida: dto.horaSalida ?? null,
          dispositivosActualizados: dto.dispositivos !== undefined,
          cantidadDispositivos: dto.dispositivos?.length ?? null,
        }),
      });
      await manager.save(accion);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Proceso ${agendamientoId} cerrado por usuario ${userId}`,
      );

      return manager.findOne(Proceso, { where: { agendamientoId } });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error al cerrar proceso ${agendamientoId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async finalizarEventoCompleto(
    eventoId: number,
    dto: {
      estadoEvento?: string;
      estadoAgenda?: string;
      realizado?: boolean;
      motivoNoRealizadoId?: number;
      detalleNoRealizado?: string;
    },
    userId: number,
  ) {
    if (
      !dto.estadoEvento &&
      dto.estadoAgenda === undefined &&
      dto.realizado === undefined
    ) {
      throw new BadRequestException(
        'Debe enviar al menos uno de: estadoEvento, estadoAgenda, realizado',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const evento = await manager.findOne(Evento, {
        where: { id: eventoId, deletedAt: IsNull() },
      });
      if (!evento) {
        throw new NotFoundException(`Evento con ID ${eventoId} no encontrado`);
      }

      const resumen: string[] = [];

      if (dto.estadoEvento !== undefined) {
        evento.estadoEvento = dto.estadoEvento;
        evento.updatedBy = userId;
        await manager.save(evento);
        resumen.push(`estadoEvento=${dto.estadoEvento}`);
      }

      if (dto.estadoAgenda !== undefined || dto.realizado !== undefined) {
        const agendamiento = await manager.findOne(Agendamiento, {
          where: { eventoId, esVigente: true, deletedAt: IsNull() },
        });
        if (!agendamiento) {
          throw new NotFoundException(
            `No se encontró un agendamiento vigente para el evento ${eventoId}`,
          );
        }

        const proceso = await manager.findOne(Proceso, {
          where: { agendamientoId: agendamiento.id },
        });
        if (!proceso) {
          throw new NotFoundException(
            `Proceso no encontrado para el agendamiento ${agendamiento.id}`,
          );
        }

        if (dto.estadoAgenda !== undefined) {
          agendamiento.estadoAgenda = dto.estadoAgenda;
          agendamiento.updatedBy = userId;
          await manager.save(agendamiento);
          resumen.push(`estadoAgenda=${dto.estadoAgenda}`);
        }

        if (dto.realizado !== undefined) {
          proceso.realizado = dto.realizado;
          proceso.fechaCierre = new Date();
          proceso.cerradoBy = userId;
          if (!dto.realizado) {
            proceso.motivoNoRealizadoId = dto.motivoNoRealizadoId ?? null;
            proceso.detalleNoRealizado = dto.detalleNoRealizado ?? null;
          }
          await manager.save(proceso);
          resumen.push(`realizado=${dto.realizado}`);
        }
      }

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: 'FINALIZAR_EVENTO',
        entidad: 'EVENTO',
        entidadId: evento.id,
        solicitudId: evento.solicitudId,
        fechaAccion: new Date(),
      });
      await manager.save(accion);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Evento ${eventoId} finalizado por usuario ${userId}: ${resumen.join(', ')}`,
      );

      return this.findOne(eventoId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async reagendar(
    dto: ReagendarEventoDto,
    userId: number,
  ): Promise<Agendamiento> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const evento = await manager.findOne(Evento, {
        where: { id: dto.eventoId, deletedAt: IsNull() },
      });

      if (!evento) {
        throw new NotFoundException(
          `No se encontro el evento con ID ${dto.eventoId}`,
        );
      }

      const oldAgenda = await manager.findOne(Agendamiento, {
        where: { eventoId: dto.eventoId, esVigente: true, deletedAt: IsNull() },
      });

      if (oldAgenda) {
        oldAgenda.estadoAgenda = 'NO_REALIZADO';
        oldAgenda.esVigente = false;
        oldAgenda.updatedBy = userId;
        await manager.save(oldAgenda);
      }

      const paraQuien = dto.paraQuien ?? 'CONDENADO';
      const condenadoId = dto.condenadoId ?? null;
      const victimaId = dto.victimaId ?? null;

      if (paraQuien === 'CONDENADO' && !condenadoId) {
        throw new BadRequestException(
          'Debe especificar condenadoId cuando paraQuien es CONDENADO',
        );
      }
      if (paraQuien === 'VICTIMA' && !victimaId) {
        throw new BadRequestException(
          'Debe especificar victimaId cuando paraQuien es VICTIMA',
        );
      }

      const agendamiento = manager.create(Agendamiento, {
        eventoId: dto.eventoId,
        fechaAgendada: new Date(dto.fechaAgendada),
        horaInicioRango: dto.horaInicioRango ?? null,
        horaFinRango: dto.horaFinRango ?? null,
        asignadoA: dto.asignadoA ?? oldAgenda?.asignadoA ?? null,
        crsId: dto.crsId ?? oldAgenda?.crsId ?? null,
        regionId: dto.regionId ?? oldAgenda?.regionId ?? null,
        comunaId: dto.comunaId ?? oldAgenda?.comunaId ?? null,
        tipoLugarId: dto.tipoLugarId ?? oldAgenda?.tipoLugarId ?? null,
        direccionAgenda:
          dto.direccionAgenda ?? oldAgenda?.direccionAgenda ?? null,
        urlAcceso: dto.urlAcceso ?? oldAgenda?.urlAcceso ?? null,
        tipoSoporte: dto.tipoSoporte ?? oldAgenda?.tipoSoporte ?? null,
        notas: dto.notas ?? null,
        paraQuien,
        condenadoId,
        victimaId,
        estadoAgenda: 'EN_PROCESO',
        esVigente: true,
        estaAbierto: true,
        numeroIntento: (oldAgenda?.numeroIntento ?? 0) + 1,
        createdBy: userId,
      } as any);
      const savedAgenda = await manager.save(agendamiento);

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: 'REAGENDAR_EVENTO',
        entidad: 'AGENDAMIENTO',
        entidadId: savedAgenda.id,
        solicitudId: evento.solicitudId,
        fechaAccion: new Date(),
      });
      await manager.save(accion);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Agendamiento ${savedAgenda.id} creado para evento ${dto.eventoId} (reagendamiento)`,
      );

      return savedAgenda;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateResolucion(eventoId: number, dto: any) {
    const existente = await this.resolucionRepo.findOne({
      where: { eventoId },
    });
    if (existente) {
      Object.assign(existente, dto);
      return this.resolucionRepo.save(existente);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const nueva = this.resolucionRepo.create({ eventoId, ...dto });
    return this.resolucionRepo.save(nueva);
  }

  async updateCambioDomicilio(eventoId: number, dto: any) {
    const existente = await this.resolucionCdRepo.findOne({
      where: { eventoId },
    });
    if (existente) {
      Object.assign(existente, dto);
      return this.resolucionCdRepo.save(existente);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const nuevo = this.resolucionCdRepo.create({ eventoId, ...dto });
    return this.resolucionCdRepo.save(nuevo);
  }

  async addSoporteDetalle(agendamientoId: number, dto: any) {
    const existente = await this.soporteDetalleRepo.findOne({
      where: { agendamientoId },
    });
    if (existente) {
      Object.assign(existente, dto);
      return this.soporteDetalleRepo.save(existente);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const nuevo = this.soporteDetalleRepo.create({ agendamientoId, ...dto });
    return this.soporteDetalleRepo.save(nuevo);
  }

  async findSoporteMotivos(agendamientoId: number) {
    return this.soporteMotivoRepo.find({
      where: { agendamientoId },
      relations: { tipoProblema: true },
    });
  }

  async addSoporteMotivo(
    agendamientoId: number,
    dto: {
      tipoProblemaId: number;
      momento?: string;
      observacion?: string;
    },
  ) {
    const motivo = this.soporteMotivoRepo.create({
      agendamientoId,
      ...dto,
      momento: dto.momento ?? 'AGENDAMIENTO',
    });
    return this.soporteMotivoRepo.save(motivo);
  }

  async updateSoporteMotivo(
    motivoId: number,
    agendamientoId: number,
    dto: {
      tipoProblemaId?: number;
      momento?: string;
      observacion?: string;
    },
  ) {
    const motivo = await this.soporteMotivoRepo.findOne({
      where: { id: motivoId, agendamientoId },
    });
    if (!motivo) throw new NotFoundException('Motivo de soporte no encontrado');

    Object.assign(motivo, dto);
    return this.soporteMotivoRepo.save(motivo);
  }

  async deleteSoporteMotivo(motivoId: number, agendamientoId: number) {
    const motivo = await this.soporteMotivoRepo.findOne({
      where: { id: motivoId, agendamientoId },
    });
    if (!motivo) throw new NotFoundException('Motivo de soporte no encontrado');
    await this.soporteMotivoRepo.delete(motivoId);
  }

  async findDispositivosReferencia(agendamientoId: number) {
    const agendamiento = await this.dataSource
      .getRepository(Agendamiento)
      .findOne({
        where: { id: agendamientoId, deletedAt: IsNull() },
        relations: { evento: { tipoEvento: true } },
      });

    if (!agendamiento) {
      throw new NotFoundException(
        `Agendamiento ${agendamientoId} no encontrado`,
      );
    }

    if (!agendamiento.evento) {
      throw new BadRequestException(
        `El agendamiento ${agendamientoId} no tiene evento asociado`,
      );
    }

    const { solicitudId } = agendamiento.evento;
    const { paraQuien, condenadoId, victimaId } = agendamiento;
    const personaField =
      paraQuien === 'VICTIMA' ? 'ag.victimaId' : 'ag.condenadoId';
    const personaId = paraQuien === 'VICTIMA' ? victimaId : condenadoId;

    if (!personaId) {
      throw new BadRequestException(
        `El agendamiento no tiene ${paraQuien === 'VICTIMA' ? 'víctima' : 'condenado'} asociado`,
      );
    }

    const ultimoSoporte = await this.procesoRepo
      .createQueryBuilder('p')
      .innerJoin('p.agendamiento', 'ag')
      .innerJoin('p.evento', 'e')
      .innerJoin('e.tipoEvento', 'te')
      .where('te.codigo = :codigo', { codigo: 'SOPORTE' })
      .andWhere('e.solicitudId = :solicitudId', { solicitudId })
      .andWhere(`${personaField} = :personaId`, { personaId })
      .andWhere('p.realizado = :realizado', { realizado: true })
      .andWhere('p.agendamientoId != :currentId', {
        currentId: agendamientoId,
      })
      .orderBy('p.fechaEjecucion', 'DESC')
      .getOne();

    if (ultimoSoporte) {
      const dispositivos = await this.procesoDispositivoRepo.find({
        where: { agendamientoId: ultimoSoporte.agendamientoId },
        relations: { rolDispositivo: true },
      });
      return {
        fuente: 'SOPORTE' as const,
        agendamientoOrigenId: ultimoSoporte.agendamientoId,
        fechaEjecucion: ultimoSoporte.fechaEjecucion,
        dispositivos,
      };
    }

    const instalacion = await this.procesoRepo
      .createQueryBuilder('p')
      .innerJoin('p.agendamiento', 'ag')
      .innerJoin('p.evento', 'e')
      .innerJoin('e.tipoEvento', 'te')
      .where('te.codigo = :codigo', { codigo: 'INSTALACION' })
      .andWhere('e.solicitudId = :solicitudId', { solicitudId })
      .andWhere(`${personaField} = :personaId`, { personaId })
      .andWhere('p.realizado = :realizado', { realizado: true })
      .orderBy('p.fechaEjecucion', 'DESC')
      .getOne();

    if (!instalacion) {
      throw new NotFoundException(
        'No se encontró ningún proceso previo realizado para esta persona en la solicitud',
      );
    }

    const dispositivos = await this.procesoDispositivoRepo.find({
      where: { agendamientoId: instalacion.agendamientoId },
      relations: { rolDispositivo: true },
    });

    return {
      fuente: 'INSTALACION' as const,
      agendamientoOrigenId: instalacion.agendamientoId,
      fechaEjecucion: instalacion.fechaEjecucion,
      dispositivos,
    };
  }

  async findTrazabilidadInstalacion(eventoId: number) {
    const eventoDesinstalacion = await this.eventoRepo.findOne({
      where: { id: eventoId, deletedAt: IsNull() },
      relations: { tipoEvento: true },
    });

    if (!eventoDesinstalacion) {
      throw new NotFoundException(`Evento con ID ${eventoId} no encontrado`);
    }

    const agendamiento = await this.dataSource
      .getRepository(Agendamiento)
      .findOne({
        where: { eventoId, esVigente: true, deletedAt: IsNull() },
      });

    if (!agendamiento) {
      throw new BadRequestException(
        'No se encontró un agendamiento vigente para el evento de desinstalación',
      );
    }

    const procesoDesinstalacion = await this.procesoRepo.findOne({
      where: { agendamientoId: agendamiento.id },
      relations: { agendamiento: true },
    });

    if (!procesoDesinstalacion) {
      throw new NotFoundException(
        `El agendamiento ${agendamiento.id} no tiene un proceso asociado`,
      );
    }

    const { solicitudId } = eventoDesinstalacion;
    const { paraQuien, victimaId, condenadoId } = agendamiento;
    const personaId = paraQuien === 'VICTIMA' ? victimaId : condenadoId;
    const personaField =
      paraQuien === 'VICTIMA' ? 'ag.victimaId' : 'ag.condenadoId';

    if (personaId === null || personaId === undefined) {
      throw new BadRequestException(
        `El proceso de desinstalación no tiene ${paraQuien === 'VICTIMA' ? 'víctima' : 'condenado'} asociado en el agendamiento`,
      );
    }

    const instalacionProceso = await this.procesoRepo
      .createQueryBuilder('p')
      .innerJoinAndSelect('p.evento', 'e')
      .innerJoinAndSelect('p.agendamiento', 'ag')
      .innerJoinAndSelect('e.tipoEvento', 'te')
      .leftJoinAndSelect('p.crs', 'crs')
      .leftJoinAndSelect('p.region', 'region')
      .leftJoinAndSelect('p.comuna', 'comuna')
      .leftJoinAndSelect('p.tipoLugar', 'tl')
      .leftJoinAndSelect('p.tecnico', 'tecnico')
      .leftJoinAndSelect('ag.condenado', 'condenado')
      .leftJoinAndSelect('ag.victima', 'victima')
      .leftJoinAndSelect('p.motivoNoRealizado', 'mnr')
      .leftJoinAndSelect('ag.asignado', 'agAsignado')
      .leftJoinAndSelect('ag.crs', 'agCrs')
      .leftJoinAndSelect('ag.region', 'agRegion')
      .leftJoinAndSelect('ag.comuna', 'agComuna')
      .leftJoinAndSelect('ag.tipoLugar', 'agTl')
      .where('te.codigo = :codigo', { codigo: 'INSTALACION' })
      .andWhere('e.solicitudId = :solicitudId', { solicitudId })
      .andWhere('e.id != :eventoId', { eventoId })
      .andWhere('e.deletedAt IS NULL')
      .andWhere(`${personaField} = :personaId`, { personaId })
      .orderBy('e.createdAt', 'DESC')
      .getOne();

    if (!instalacionProceso) {
      throw new NotFoundException(
        'No se encontró un evento de instalación correspondiente a esta desinstalación',
      );
    }

    const instalacionAgendamientoId = instalacionProceso.agendamientoId;

    const [resolucion, dispositivos] = await Promise.all([
      this.resolucionRepo.findOne({
        where: { eventoId: instalacionProceso.eventoId },
        relations: {
          tribunal: true,
          tipoCausa: true,
          tipoLey: true,
          crs: true,
          tipoPena: true,
        },
      }),
      this.procesoDispositivoRepo.find({
        where: { agendamientoId: instalacionAgendamientoId },
        relations: { rolDispositivo: true },
      }),
    ]);

    const { evento, ...proceso } = instalacionProceso;

    return {
      evento,
      proceso,
      resolucion: resolucion || null,
      agendamiento: proceso?.agendamiento || null,
      dispositivos,
    };
  }
}
