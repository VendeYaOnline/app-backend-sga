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
import { Solicitud } from '../entities/solicitud.entity';
import { SolicitudSolicitante } from '../entities/solicitud-solicitante.entity';
import { SolicitudVictima } from '../entities/solicitud-victima.entity';
import { SolicitudDelito } from '../entities/solicitud-delito.entity';
import { SolicitudZona } from '../entities/solicitud-zona.entity';
import { SolicitudFactibilidad } from '../entities/solicitud-factibilidad.entity';
import { SolicitudSentencia } from '../entities/solicitud-sentencia.entity';
import { SolicitudEstadoHist } from '../entities/solicitud-estado-hist.entity';
import { AccionUsuario } from '../../carga-laboral/entities/accion-usuario.entity';
import { CreateSolicitudDto } from '../dto/create-solicitud.dto';
import { UpdateSolicitudDto } from '../dto/update-solicitud.dto';
import { FindSolicitudDto } from '../dto/find-solicitud.dto';
import { TransicionEstadoDto } from '../dto/transicion-estado.dto';
import { EstadoSolicitud } from '../enums/solicitud.enum';

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  [EstadoSolicitud.RECEPCIONADA]: [
    EstadoSolicitud.APROBADA,
    EstadoSolicitud.DEVUELTA,
    EstadoSolicitud.ANULADA,
  ],
  [EstadoSolicitud.APROBADA]: [
    EstadoSolicitud.INFORME_EMITIDO,
    EstadoSolicitud.DEVUELTA,
    EstadoSolicitud.ANULADA,
  ],
  [EstadoSolicitud.INFORME_EMITIDO]: [
    EstadoSolicitud.INSTALADA,
    EstadoSolicitud.ANULADA,
  ],
  [EstadoSolicitud.INSTALADA]: [
    EstadoSolicitud.EN_CONTROL,
    EstadoSolicitud.ANULADA,
  ],
  [EstadoSolicitud.EN_CONTROL]: [
    EstadoSolicitud.CERRADA,
    EstadoSolicitud.ANULADA,
  ],
};

@Injectable()
export class SolicitudService {
  private readonly logger = new Logger(SolicitudService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Solicitud)
    private readonly solicitudRepo: Repository<Solicitud>,
    @InjectRepository(SolicitudSolicitante)
    private readonly solicitanteRepo: Repository<SolicitudSolicitante>,
    @InjectRepository(SolicitudVictima)
    private readonly solicitudVictimaRepo: Repository<SolicitudVictima>,
    @InjectRepository(SolicitudDelito)
    private readonly solicitudDelitoRepo: Repository<SolicitudDelito>,
    @InjectRepository(SolicitudZona)
    private readonly solicitudZonaRepo: Repository<SolicitudZona>,
    @InjectRepository(SolicitudFactibilidad)
    private readonly factibilidadRepo: Repository<SolicitudFactibilidad>,
    @InjectRepository(SolicitudSentencia)
    private readonly sentenciaRepo: Repository<SolicitudSentencia>,
    @InjectRepository(SolicitudEstadoHist)
    private readonly estadoHistRepo: Repository<SolicitudEstadoHist>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(filters: FindSolicitudDto) {
    const { page = 1, limit = 20, ...where } = filters;

    const qb = this.solicitudRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.condenado', 'c')
      .leftJoinAndSelect('s.tribunal', 't')
      .leftJoinAndSelect('s.crs', 'crs')
      .leftJoinAndSelect('s.asignado', 'a')
      .where('s.deletedAt IS NULL');

    if (where.estado)
      qb.andWhere('s.estadoActual = :estado', { estado: where.estado });
    if (where.rucCausa)
      qb.andWhere('s.rucCausa LIKE :ruc', { ruc: `%${where.rucCausa}%` });
    if (where.ritCausa)
      qb.andWhere('s.ritCausa LIKE :rit', { rit: `%${where.ritCausa}%` });
    if (where.condenadoId)
      qb.andWhere('s.condenadoId = :cid', { cid: where.condenadoId });
    if (where.crsId) qb.andWhere('s.crsId = :crs', { crs: where.crsId });
    if (where.asignadaA)
      qb.andWhere('s.asignadaA = :uid', { uid: where.asignadaA });
    if (where.origenCreacion)
      qb.andWhere('s.origenCreacion = :origen', {
        origen: where.origenCreacion,
      });
    if (where.rutCondenado)
      qb.andWhere('c.rutCondenado LIKE :rut', {
        rut: `%${where.rutCondenado}%`,
      });
    if (where.fechaDesde)
      qb.andWhere('s.createdAt >= :desde', { desde: where.fechaDesde });
    if (where.fechaHasta)
      qb.andWhere('s.createdAt <= :hasta', {
        hasta: `${where.fechaHasta} 23:59:59`,
      });

    qb.orderBy('s.estadoAt', 'DESC');

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

  async findOne(id: number): Promise<Solicitud> {
    const solicitud = await this.solicitudRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: {
        condenado: true,
        tribunal: true,
        crs: true,
        tipoCausa: true,
        tipoLey: true,
        tipoPena: true,
        medidaControl: true,
        tipoDiaInicio: true,
        tipoDiaTermino: true,
        asignado: true,
      },
    });
    if (!solicitud)
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    return solicitud;
  }

  async findHistorial(solicitudId: number) {
    return this.estadoHistRepo.find({
      where: { solicitudId },
      relations: { usuario: true },
      order: { fechaCambio: 'DESC' },
    });
  }

  async findZonas(solicitudId: number) {
    return this.solicitudZonaRepo.find({
      where: { solicitudId, deletedAt: IsNull() },
      relations: { tipoZona: true, region: true, comuna: true },
    });
  }

  async findSolicitantes(solicitudId: number) {
    return this.solicitanteRepo.find({ where: { solicitudId } });
  }

  async findVictimas(solicitudId: number) {
    return this.solicitudVictimaRepo.find({
      where: { solicitudId },
      relations: { victima: true },
    });
  }

  async findDelitos(solicitudId: number) {
    return this.solicitudDelitoRepo.find({
      where: { solicitudId },
      relations: { delito: true },
    });
  }

  async findFactibilidad(solicitudId: number) {
    return this.factibilidadRepo.findOne({
      where: { solicitudId },
      relations: { motivoNoFactible: true },
    });
  }

  async findSentencia(solicitudId: number) {
    return this.sentenciaRepo.findOne({
      where: { solicitudId },
      relations: { tipoPena: true, motivoNoCumple: true },
    });
  }

  async create(dto: CreateSolicitudDto, userId: number): Promise<Solicitud> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const solicitud = manager.create(Solicitud, {
        tipoCausaId: dto.tipoCausaId,
        rucCausa: dto.rucCausa,
        ritCausa: dto.ritCausa,
        rolCausa: dto.rolCausa,
        tribunalId: dto.tribunalId,
        condenadoId: dto.condenadoId,
        crsId: dto.crsId,
        tipoLeyId: dto.tipoLeyId,
        tipoPenaId: dto.tipoPenaId,
        medidaControlId: dto.medidaControlId,
        tipoHorarioId: dto.tipoHorarioId,
        horaDesde: dto.horaDesde,
        horaHasta: dto.horaHasta,
        tipoDiaInicioId: dto.tipoDiaInicioId,
        tipoDiaTerminoId: dto.tipoDiaTerminoId,
        conBeacon: dto.conBeacon ?? true,
        observaciones: dto.observaciones,
        origenCreacion: 'FORMULARIO_WEB',
        motivoOrigen: 'ORIGINAL',
        createdBy: userId,
      });
      const saved = await manager.save(solicitud);

      if (dto.zonas?.length) {
        const zonas = dto.zonas.map((z) =>
          manager.create(SolicitudZona, {
            solicitudId: saved.id,
            ...z,
            createdBy: userId,
          }),
        );
        await manager.save(zonas);
      }

      if (dto.delitoIds?.length) {
        const delitos = dto.delitoIds.map((delitoId) =>
          manager.create(SolicitudDelito, { solicitudId: saved.id, delitoId }),
        );
        await manager.save(delitos);
      }

      if (dto.victimas?.length) {
        const vinculos = dto.victimas.map((v) =>
          manager.create(SolicitudVictima, {
            solicitudId: saved.id,
            victimaId: v.victimaId,
            radioProhibicionMetros: v.radioProhibicionMetros,
          }),
        );
        await manager.save(vinculos);
      }

      const estadoHist = manager.create(SolicitudEstadoHist, {
        solicitudId: saved.id,
        estadoNuevo: EstadoSolicitud.RECEPCIONADA,
        estadoAnterior: null,
        usuarioId: userId,
        fechaCambio: new Date(),
      });
      await manager.save(estadoHist);

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: 'CREAR_SOLICITUD',
        entidad: 'SOLICITUD',
        entidadId: saved.id,
        solicitudId: saved.id,
        fechaAccion: new Date(),
      });
      await manager.save(accion);

      await queryRunner.commitTransaction();
      this.logger.log(`Solicitud ${saved.id} creada por usuario ${userId}`);

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: number,
    dto: UpdateSolicitudDto,
    userId: number,
  ): Promise<Solicitud> {
    const solicitud = await this.findOne(id);
    if (
      ![EstadoSolicitud.RECEPCIONADA].includes(
        solicitud.estadoActual as EstadoSolicitud,
      )
    ) {
      throw new UnprocessableEntityException(
        'Solo se puede editar una solicitud en estado RECEPCIONADA',
      );
    }
    Object.assign(solicitud, dto, { updatedBy: userId });
    return this.solicitudRepo.save(solicitud);
  }

  async cambiarEstado(
    id: number,
    dto: TransicionEstadoDto,
    userId: number,
  ): Promise<Solicitud> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const solicitud = await manager.findOne(Solicitud, {
        where: { id, deletedAt: IsNull() },
      });

      if (!solicitud)
        throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);

      const estadoActual = solicitud.estadoActual;
      const permitidos = TRANSICIONES_VALIDAS[estadoActual];
      if (!permitidos || !permitidos.includes(dto.estadoNuevo)) {
        throw new UnprocessableEntityException(
          `No se puede cambiar de ${estadoActual} a ${dto.estadoNuevo}`,
        );
      }

      solicitud.estadoActual = dto.estadoNuevo;
      solicitud.estadoAt = new Date();
      solicitud.asignadaA = userId;
      solicitud.asignadaAt = new Date();
      solicitud.updatedBy = userId;
      await manager.save(solicitud);

      const estadoHist = manager.create(SolicitudEstadoHist, {
        solicitudId: id,
        estadoNuevo: dto.estadoNuevo,
        estadoAnterior: estadoActual,
        usuarioId: userId,
        motivoCambio: dto.motivo,
        fechaCambio: new Date(),
      });
      await manager.save(estadoHist);

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: `TRANSICIONAR_${dto.estadoNuevo}`,
        entidad: 'SOLICITUD',
        entidadId: id,
        solicitudId: id,
        fechaAccion: new Date(),
      });
      await manager.save(accion);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Solicitud ${id}: ${estadoActual} → ${dto.estadoNuevo} por usuario ${userId}`,
      );

      this.eventEmitter.emit('solicitud.cambio-estado', {
        solicitudId: id,
        estadoAnterior: estadoActual,
        estadoNuevo: dto.estadoNuevo,
        usuarioId: userId,
      });

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async softDelete(id: number, userId: number): Promise<void> {
    const solicitud = await this.findOne(id);
    solicitud.deletedAt = new Date();
    solicitud.deletedBy = userId;
    await this.solicitudRepo.save(solicitud);
  }

  async addZona(solicitudId: number, dto: any, userId: number) {
    await this.findOne(solicitudId);
    const zona = this.solicitudZonaRepo.create({
      solicitudId,
      ...dto,
      createdBy: userId,
    });
    return this.solicitudZonaRepo.save(zona);
  }

  async updateZona(solicitudId: number, zonaId: number, dto: any) {
    const zona = await this.solicitudZonaRepo.findOne({
      where: { id: zonaId, solicitudId, deletedAt: IsNull() },
    });
    if (!zona)
      throw new NotFoundException(`Zona con ID ${zonaId} no encontrada`);
    Object.assign(zona, dto);
    return this.solicitudZonaRepo.save(zona);
  }

  async deleteZona(solicitudId: number, zonaId: number) {
    const zona = await this.solicitudZonaRepo.findOne({
      where: { id: zonaId, solicitudId, deletedAt: IsNull() },
    });
    if (!zona)
      throw new NotFoundException(`Zona con ID ${zonaId} no encontrada`);
    zona.deletedAt = new Date();
    await this.solicitudZonaRepo.save(zona);
  }

  async validarZona(solicitudId: number, zonaId: number, userId: number) {
    const zona = await this.solicitudZonaRepo.findOne({
      where: { id: zonaId, solicitudId, deletedAt: IsNull() },
    });
    if (!zona)
      throw new NotFoundException(`Zona con ID ${zonaId} no encontrada`);
    zona.validada = true;
    zona.validadaAt = new Date();
    zona.validadaBy = userId;
    return this.solicitudZonaRepo.save(zona);
  }

  async addSolicitante(solicitudId: number, dto: any) {
    const solicitante = this.solicitanteRepo.create({ solicitudId, ...dto });
    return this.solicitanteRepo.save(solicitante);
  }

  async updateSolicitante(
    solicitudId: number,
    solicitanteId: number,
    dto: any,
  ) {
    const sol = await this.solicitanteRepo.findOne({
      where: { id: solicitanteId, solicitudId },
    });
    if (!sol)
      throw new NotFoundException(
        `Solicitante con ID ${solicitanteId} no encontrado`,
      );
    Object.assign(sol, dto);
    return this.solicitanteRepo.save(sol);
  }

  async removeSolicitante(solicitudId: number, solicitanteId: number) {
    const sol = await this.solicitanteRepo.findOne({
      where: { id: solicitanteId, solicitudId },
    });
    if (!sol)
      throw new NotFoundException(
        `Solicitante con ID ${solicitanteId} no encontrado`,
      );
    await this.solicitanteRepo.remove(sol);
  }

  async addVictima(
    solicitudId: number,
    victimaId: number,
    radioProhibicionMetros?: number,
  ) {
    const existente = await this.solicitudVictimaRepo.findOne({
      where: { solicitudId, victimaId },
    });
    if (existente)
      throw new ConflictException(
        'La víctima ya está asociada a esta solicitud',
      );
    const sv = this.solicitudVictimaRepo.create({
      solicitudId,
      victimaId,
      radioProhibicionMetros,
    });
    return this.solicitudVictimaRepo.save(sv);
  }

  async removeVictima(solicitudId: number, victimaId: number) {
    const sv = await this.solicitudVictimaRepo.findOne({
      where: { solicitudId, victimaId },
    });
    if (!sv)
      throw new NotFoundException(
        'La víctima no está asociada a esta solicitud',
      );
    await this.solicitudVictimaRepo.remove(sv);
  }

  async addDelito(solicitudId: number, delitoId: number) {
    const existente = await this.solicitudDelitoRepo.findOne({
      where: { solicitudId, delitoId },
    });
    if (existente)
      throw new ConflictException(
        'El delito ya está asociado a esta solicitud',
      );
    const sd = this.solicitudDelitoRepo.create({ solicitudId, delitoId });
    return this.solicitudDelitoRepo.save(sd);
  }

  async removeDelito(solicitudId: number, delitoId: number) {
    const sd = await this.solicitudDelitoRepo.findOne({
      where: { solicitudId, delitoId },
    });
    if (!sd)
      throw new NotFoundException(
        'El delito no está asociado a esta solicitud',
      );
    await this.solicitudDelitoRepo.remove(sd);
  }

  async emitirFactibilidad(
    solicitudId: number,
    dto: {
      tipoFactibilidad: string;
      motivoNoFactibleId?: number;
      emitidoPor: number;
    },
  ) {
    const existente = await this.factibilidadRepo.findOne({
      where: { solicitudId },
    });
    if (existente)
      throw new ConflictException(
        'Ya existe un informe de factibilidad para esta solicitud',
      );

    const lastFolio = await this.factibilidadRepo
      .createQueryBuilder('f')
      .select('MAX(f.folioInterno)', 'maxFolio')
      .getRawOne();
    const folio = (lastFolio?.maxFolio || 0) + 1;

    const factibilidad = this.factibilidadRepo.create({
      solicitudId,
      tipoFactibilidad: dto.tipoFactibilidad,
      motivoNoFactibleId: dto.motivoNoFactibleId,
      folioInterno: folio,
      emitidoPor: dto.emitidoPor,
    });
    return this.factibilidadRepo.save(factibilidad);
  }

  async upsertSentencia(solicitudId: number, dto: any) {
    const existente = await this.sentenciaRepo.findOne({
      where: { solicitudId },
    });
    if (existente) {
      Object.assign(existente, dto);
      return this.sentenciaRepo.save(existente);
    }
    const nueva = this.sentenciaRepo.create({ solicitudId, ...dto });
    return this.sentenciaRepo.save(nueva);
  }
}
