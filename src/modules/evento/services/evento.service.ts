import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
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
import { CatTipoEvento } from '../../catalogo/entities/cat-tipo-evento.entity';
import { CatTipoEventoValidacion } from '../../catalogo/entities/cat-tipo-evento-validacion.entity';
import { PaginationDto } from '../../../common/dto/pagination.dto';

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
      relations: { tipoEvento: true, solicitud: true, asignado: true },
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
      },
    });
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
