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
import { DataSource, Repository, IsNull, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaginationMeta } from '../../../common/interfaces/pagination-meta.interface';
import { Evento } from '../entities/evento.entity';
import { EventoValidacion } from '../entities/evento-validacion.entity';
import { Resolucion } from '../entities/resolucion.entity';
import { ResolucionCambioDomicilio } from '../entities/resolucion-cambio-domicilio.entity';
import { Proceso } from '../entities/proceso.entity';
import { ProcesoSoporteDetalle } from '../entities/proceso-soporte-detalle.entity';
import { ProcesoSoporteMotivo } from '../entities/proceso-soporte-motivo.entity';
import { AccionUsuario } from '../../carga-laboral/entities/accion-usuario.entity';
import { Agendamiento } from '../../agendamiento/entities/agendamiento.entity';
import { CatTipoEvento } from '../../catalogo/entities/cat-tipo-evento.entity';
import { CatTipoEventoValidacion } from '../../catalogo/entities/cat-tipo-evento-validacion.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateEventoCompletoDto } from '../dto/create-evento-completo.dto';
import { CreateEventoConProcesoDto } from '../dto/create-evento-con-proceso.dto';

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
    @InjectRepository(CatTipoEvento)
    private readonly tipoEventoRepo: Repository<CatTipoEvento>,
    @InjectRepository(CatTipoEventoValidacion)
    private readonly tipoEventoValidacionRepo: Repository<CatTipoEventoValidacion>,
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
      .leftJoinAndSelect('e.asignado', 'a')
      .leftJoinAndSelect('e.eventoPadre', 'ep')
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
        solicitud: true,
        asignado: true,
        eventoPadre: true,
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

  async findProceso(eventoId: number) {
    return this.procesoRepo.findOne({
      where: { eventoId },
      relations: {
        tecnico: true,
        crs: true,
        region: true,
        comuna: true,
        motivoNoRealizado: true,
        agendamiento: true,
      },
    });
  }

  async findAllProcesos(
    filters: PaginationDto & {
      crsId?: number;
      tecnicoId?: number;
      paraQuien?: string;
      tipoEventoId?: number;
    },
  ) {
    const { page = 1, limit = 20, crsId, tecnicoId, paraQuien, tipoEventoId } = filters;

    const qb = this.procesoRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.evento', 'e')
      .leftJoinAndSelect('p.agendamiento', 'ag')
      .leftJoinAndSelect('p.tecnico', 't')
      .leftJoinAndSelect('p.crs', 'c')
      .leftJoinAndSelect('p.region', 'r')
      .leftJoinAndSelect('p.comuna', 'co')
      .leftJoinAndSelect('p.motivoNoRealizado', 'mnr')
      .leftJoinAndSelect('ag.asignado', 'agAsig')
      .leftJoinAndSelect('ag.crs', 'agCrs')
      .where('e.deletedAt IS NULL');

    if (crsId) qb.andWhere('p.crsId = :crsId', { crsId });
    if (tecnicoId) qb.andWhere('p.tecnicoId = :tecnicoId', { tecnicoId });
    if (paraQuien) qb.andWhere('p.paraQuien = :paraQuien', { paraQuien });
    if (tipoEventoId) qb.andWhere('e.tipoEventoId = :tipoEventoId', { tipoEventoId });

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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const tipoEvento = await this.tipoEventoRepo.findOne({
        where: { id: dto.tipoEventoId },
      });
      if (!tipoEvento)
        throw new BadRequestException('Tipo de evento no encontrado');

      const evento = manager.create(Evento, {
        tipoEventoId: dto.tipoEventoId,
        solicitudId: dto.solicitudId,
        estadoEvento: 'PENDIENTE',
        origenCreacion: dto.origenCreacion || 'FORMULARIO_WEB',
        fechaEvento: dto.fechaEvento ? new Date(dto.fechaEvento) : new Date(),
        asignadoA: dto.asignadoA,
        eventoPadreId: dto.eventoPadreId ?? null,
        observaciones: dto.observaciones,
        createdBy: userId,
      });
      const saved = await manager.save(evento);

      const validacionesConfig = await this.tipoEventoValidacionRepo.find({
        where: { tipoEventoId: dto.tipoEventoId, activo: true },
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
        `Evento ${saved.id} (tipo ${dto.tipoEventoId}) creado por usuario ${userId}`,
      );

      return this.findOne(saved.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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

        const solicitudIdsUnicos = [...new Set(dtosUnicos.map((d) => d.solicitudId))];
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

      const codigosResolucion = [
        'DECRETO_MONITOREO_INICIAL',
        'PRORROGA_EXTENSION',
        'CESE_CONTROL',
        'INFORME_CONTROL',
        'INCOMPETENCIA',
      ];
      const codigosProceso = ['INSTALACION', 'DESINSTALACION', 'SOPORTE'];

      const resolucionDtos = dtos.filter((d) => {
        const tipo = tipoMap.get(d.tipoEventoId);
        return tipo && codigosResolucion.includes(tipo.codigo);
      });
      const noResolucionDtos = dtos.filter((d) => {
        const tipo = tipoMap.get(d.tipoEventoId);
        return !tipo || !codigosResolucion.includes(tipo.codigo);
      });

      let resolucionEventoId: number | null = null;

      for (const dto of resolucionDtos) {
        const evento = await this.crearEventoConHijas(dto, userId, manager);
        saved.push(evento);
        if (!resolucionEventoId) resolucionEventoId = evento.id;
      }

      if (resolucionEventoId) {
        for (const dto of noResolucionDtos) {
          const tipo = tipoMap.get(dto.tipoEventoId);
          if (tipo && codigosProceso.includes(tipo.codigo)) {
            dto.eventoPadreId = resolucionEventoId;
          }
        }
      }

      const condDtos = noResolucionDtos.filter((d) => d.proceso?.paraQuien === 'CONDENADO');
      const victimaDtos = noResolucionDtos.filter(
        (d) => d.proceso?.paraQuien === 'VICTIMA',
      );
      const otros = noResolucionDtos.filter(
        (d) =>
          d.proceso?.paraQuien !== 'CONDENADO' &&
          d.proceso?.paraQuien !== 'VICTIMA',
      );

      let condEventoId: number | null = null;

      for (const dto of condDtos) {
        const evento = await this.crearEventoConHijas(dto, userId, manager);
        saved.push(evento);
        if (!condEventoId) condEventoId = evento.id;
      }

      for (const dto of victimaDtos) {
        if (condEventoId) {
          dto.proceso = { ...dto.proceso!, procesoPadreId: condEventoId };
        }
        saved.push(await this.crearEventoConHijas(dto, userId, manager));
      }

      for (const dto of otros) {
        saved.push(await this.crearEventoConHijas(dto, userId, manager));
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
          solicitud: true,
          asignado: true,
          eventoPadre: true,
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
    manager: any,
  ): Promise<Evento> {
    if (dto.resolucion && dto.proceso) {
      throw new BadRequestException(
        'No se pueden enviar resolución y proceso en el mismo evento. Use uno solo.',
      );
    }

    const tipoEvento = await manager.findOne(CatTipoEvento, {
      where: { id: dto.tipoEventoId },
    });
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

    if (dto.proceso && !esProceso) {
      throw new BadRequestException(
        `El tipo de evento "${codigo}" no admite datos de proceso`,
      );
    }

    const evento = manager.create(Evento, {
      tipoEventoId: dto.tipoEventoId,
      solicitudId: dto.solicitudId,
      estadoEvento: 'APROBADO',
      origenCreacion: dto.origenCreacion || 'FORMULARIO_WEB',
      fechaEvento: dto.fechaEvento ? new Date(dto.fechaEvento) : new Date(),
      asignadoA: dto.asignadoA,
      eventoPadreId: dto.eventoPadreId ?? null,
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

    if (dto.proceso) {
      const { agendamiento: agData, ...procesoData } = dto.proceso as any;

      const proceso = manager.create(Proceso, {
        eventoId: saved.id,
        ...procesoData,
        paraQuien: dto.proceso.paraQuien || 'CONDENADO',
        numeroIntento: dto.proceso.numeroIntento || 1,
        realizado: dto.proceso.realizado ?? false,
      });
      await manager.save(proceso);
      this.logger.log(
        `Proceso creado para evento ${saved.id} (tipo: ${codigo}, para: ${proceso.paraQuien})`,
      );

      if (agData) {
        const agendamiento = manager.create(Agendamiento, {
          eventoId: saved.id,
          fechaAgendada: new Date(agData.fechaAgendada),
          horaInicioRango: agData.horaInicioRango ?? null,
          horaFinRango: agData.horaFinRango ?? null,
          asignadoA: agData.asignadoA ?? dto.asignadoA ?? null,
          crsId: agData.crsId ?? dto.proceso.crsId ?? null,
          regionId: agData.regionId ?? dto.proceso.regionId ?? null,
          comunaId: agData.comunaId ?? dto.proceso.comunaId ?? null,
          tipoLugarId: agData.tipoLugarId ?? null,
          direccionAgenda:
            agData.direccionAgenda ?? dto.proceso.direccionProceso ?? null,
          paraCondenado: dto.proceso.paraQuien === 'CONDENADO',
          notas: agData.notas ?? null,
          estadoAgenda: 'EN_PROCESO',
          createdBy: userId,
        });
        const savedAgenda = await manager.save(agendamiento);

        proceso.agendamientoId = savedAgenda.id;
        await manager.save(proceso);
        this.logger.log(
          `Agendamiento ${savedAgenda.id} creado y vinculado a proceso ${saved.id}`,
        );
      }
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

  async createConProceso(
    dto: CreateEventoConProcesoDto,
    userId: number,
  ): Promise<Evento> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const tipoEvento = await manager.findOne(CatTipoEvento, {
        where: { id: dto.tipoEventoId },
      });
      if (!tipoEvento) {
        throw new BadRequestException('Tipo de evento no encontrado');
      }

      const { codigo } = tipoEvento;
      const esProceso = ['INSTALACION', 'DESINSTALACION', 'SOPORTE'].includes(
        codigo,
      );

      if (!esProceso) {
        throw new BadRequestException(
          `El tipo de evento "${codigo}" no es de categoria Proceso. Use /eventos/completo con resolucion.`,
        );
      }

      const evento = manager.create(Evento, {
        tipoEventoId: dto.tipoEventoId,
        solicitudId: dto.solicitudId,
        estadoEvento: 'APROBADO',
        origenCreacion: dto.origenCreacion || 'FORMULARIO_WEB',
        fechaEvento: dto.fechaEvento ? new Date(dto.fechaEvento) : new Date(),
        asignadoA: dto.asignadoA,
        eventoPadreId: dto.eventoPadreId ?? null,
        observaciones: dto.observaciones,
        createdBy: userId,
      });
      const saved = await manager.save(evento);

      const { agendamiento: agData, ...procesoData } = dto.proceso as any;

      const proceso = manager.create(Proceso, {
        eventoId: saved.id,
        ...procesoData,
        paraQuien: dto.proceso.paraQuien || 'CONDENADO',
        numeroIntento: dto.proceso.numeroIntento || 1,
        realizado: dto.proceso.realizado ?? false,
      });
      await manager.save(proceso);
      this.logger.log(
        `Proceso creado para evento ${saved.id} (tipo: ${codigo}, para: ${proceso.paraQuien})`,
      );

      if (agData) {
        const agendamiento = manager.create(Agendamiento, {
          eventoId: saved.id,
          fechaAgendada: new Date(agData.fechaAgendada),
          horaInicioRango: agData.horaInicioRango ?? null,
          horaFinRango: agData.horaFinRango ?? null,
          asignadoA: agData.asignadoA ?? dto.asignadoA ?? null,
          crsId: agData.crsId ?? dto.proceso.crsId ?? null,
          regionId: agData.regionId ?? dto.proceso.regionId ?? null,
          comunaId: agData.comunaId ?? dto.proceso.comunaId ?? null,
          tipoLugarId: agData.tipoLugarId ?? null,
          direccionAgenda:
            agData.direccionAgenda ?? dto.proceso.direccionProceso ?? null,
          paraCondenado: dto.proceso.paraQuien === 'CONDENADO',
          notas: agData.notas ?? null,
          estadoAgenda: 'EN_PROCESO',
          createdBy: userId,
        });
        const savedAgenda = await manager.save(agendamiento);

        proceso.agendamientoId = savedAgenda.id;
        await manager.save(proceso);
        this.logger.log(
          `Agendamiento ${savedAgenda.id} creado y vinculado a proceso ${saved.id}`,
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

      await queryRunner.commitTransaction();
      this.logger.log(
        `Evento ${saved.id} (tipo: ${codigo}) con proceso creado por usuario ${userId}`,
      );

      return this.findOne(saved.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, dto: any, userId: number): Promise<Evento> {
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

  async updateProceso(eventoId: number, dto: any) {
    const existente = await this.procesoRepo.findOne({ where: { eventoId } });
    if (existente) {
      Object.assign(existente, dto);
      return this.procesoRepo.save(existente);
    }
    const nuevo = this.procesoRepo.create({ eventoId, ...dto });
    return this.procesoRepo.save(nuevo) as unknown as Promise<Proceso>;
  }

  async cerrarProceso(
    eventoId: number,
    dto: {
      realizado: boolean;
      motivoNoRealizadoId?: number;
      detalleNoRealizado?: string;
    },
    userId: number,
  ) {
    const proceso = await this.procesoRepo.findOne({ where: { eventoId } });
    if (!proceso) throw new NotFoundException('Proceso no encontrado');

    proceso.realizado = dto.realizado;
    proceso.fechaCierre = new Date();
    proceso.cerradoBy = userId;

    if (!dto.realizado) {
      proceso.motivoNoRealizadoId = dto.motivoNoRealizadoId ?? null;
      proceso.detalleNoRealizado = dto.detalleNoRealizado ?? null;
    }

    return this.procesoRepo.save(proceso);
  }

  async updateResolucion(eventoId: number, dto: any) {
    const existente = await this.resolucionRepo.findOne({
      where: { eventoId },
    });
    if (existente) {
      Object.assign(existente, dto);
      return this.resolucionRepo.save(existente);
    }
    const nueva = this.resolucionRepo.create({ eventoId, ...dto });
    return this.resolucionRepo.save(nueva) as unknown as Promise<Resolucion>;
  }

  async updateCambioDomicilio(eventoId: number, dto: any) {
    const existente = await this.resolucionCdRepo.findOne({
      where: { eventoId },
    });
    if (existente) {
      Object.assign(existente, dto);
      return this.resolucionCdRepo.save(existente);
    }
    const nuevo = this.resolucionCdRepo.create({ eventoId, ...dto });
    return this.resolucionCdRepo.save(nuevo);
  }

  async addSoporteDetalle(eventoId: number, dto: any) {
    const existente = await this.soporteDetalleRepo.findOne({
      where: { eventoId },
    });
    if (existente) {
      Object.assign(existente, dto);
      return this.soporteDetalleRepo.save(existente);
    }
    const nuevo = this.soporteDetalleRepo.create({ eventoId, ...dto });
    return this.soporteDetalleRepo.save(nuevo);
  }

  async findSoporteMotivos(eventoId: number) {
    return this.soporteMotivoRepo.find({
      where: { eventoId },
      relations: { tipoProblema: true },
    });
  }

  async addSoporteMotivo(
    eventoId: number,
    dto: {
      tipoProblemaId: number;
      esMotivoPrincipal?: boolean;
      observacion?: string;
    },
  ) {
    if (dto.esMotivoPrincipal) {
      await this.soporteMotivoRepo.update(
        { eventoId, esMotivoPrincipal: true },
        { esMotivoPrincipal: false },
      );
    }
    const motivo = this.soporteMotivoRepo.create({ eventoId, ...dto });
    return this.soporteMotivoRepo.save(motivo);
  }

  async updateSoporteMotivo(
    motivoId: number,
    eventoId: number,
    dto: {
      tipoProblemaId?: number;
      esMotivoPrincipal?: boolean;
      observacion?: string;
    },
  ) {
    const motivo = await this.soporteMotivoRepo.findOne({
      where: { id: motivoId, eventoId },
    });
    if (!motivo) throw new NotFoundException('Motivo de soporte no encontrado');

    if (dto.esMotivoPrincipal) {
      await this.soporteMotivoRepo.update(
        { eventoId, esMotivoPrincipal: true },
        { esMotivoPrincipal: false },
      );
    }

    Object.assign(motivo, dto);
    return this.soporteMotivoRepo.save(motivo);
  }

  async deleteSoporteMotivo(motivoId: number, eventoId: number) {
    const motivo = await this.soporteMotivoRepo.findOne({
      where: { id: motivoId, eventoId },
    });
    if (!motivo) throw new NotFoundException('Motivo de soporte no encontrado');
    await this.soporteMotivoRepo.delete(motivoId);
  }
}
