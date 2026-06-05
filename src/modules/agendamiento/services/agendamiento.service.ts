import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Agendamiento } from '../entities/agendamiento.entity';
import { Proceso } from '../../evento/entities/proceso.entity';
import { ProcesoDispositivo } from '../../dispositivo/entities/proceso-dispositivo.entity';
import { AccionUsuario } from '../../carga-laboral/entities/accion-usuario.entity';
import { UpdateProcesoAgendamientoDto } from '../dto/update-proceso-agendamiento.dto';
import { ReagendarAgendamientoDto } from '../dto/reagendar-agendamiento.dto';

@Injectable()
export class AgendamientoService {
  private readonly logger = new Logger(AgendamientoService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Agendamiento)
    private readonly agendamientoRepo: Repository<Agendamiento>,
    @InjectRepository(Proceso)
    private readonly procesoRepo: Repository<Proceso>,
    @InjectRepository(ProcesoDispositivo)
    private readonly procesoDispositivoRepo: Repository<ProcesoDispositivo>,
  ) {}

  async findAll(
    filters: PaginationDto & {
      tipoEventoId?: number;
      eventoId?: number;
      asignadoA?: number;
      tecnicoId?: number;
      paraQuien?: string;
      estadoAgenda?: string;
      estaAbierto?: boolean;
    },
  ) {
    const {
      page = 1,
      limit = 20,
      tipoEventoId,
      eventoId,
      asignadoA,
      tecnicoId,
      paraQuien,
      estadoAgenda,
      estaAbierto,
    } = filters;

    const qb = this.agendamientoRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.evento', 'e')
      .leftJoinAndSelect('a.asignado', 'u')
      .leftJoinAndSelect('u.usuarioRoles', 'ur')
      .leftJoinAndSelect('ur.rol', 'rol')
      .leftJoinAndSelect('a.tecnico', 'tec')
      .leftJoinAndSelect('a.crs', 'c')
      .leftJoinAndSelect('a.region', 'r')
      .leftJoinAndSelect('a.comuna', 'co')
      .leftJoinAndSelect('a.tipoLugar', 'tl')
      .leftJoinAndSelect('a.condenado', 'cond')
      .leftJoinAndSelect('a.victima', 'vic')
      .leftJoinAndSelect('a.proceso', 'p')
      .leftJoinAndSelect('p.procesoDispositivos', 'pd')
      .leftJoinAndSelect('pd.rolDispositivo', 'rd')
      .leftJoinAndSelect('p.soporteDetalle', 'psd')
      .leftJoinAndSelect('a.soporteMotivos', 'psm')
      .leftJoinAndSelect('psm.tipoProblema', 'tp')
      .where('a.deletedAt IS NULL')
      .andWhere('a.esVigente = :vigente', { vigente: true });

    if (tipoEventoId)
      qb.andWhere('e.tipoEventoId = :tid', { tid: tipoEventoId });
    if (eventoId) qb.andWhere('a.eventoId = :eid', { eid: eventoId });
    if (asignadoA) qb.andWhere('a.asignadoA = :uid', { uid: asignadoA });
    if (tecnicoId) qb.andWhere('a.tecnicoId = :tid', { tid: tecnicoId });
    if (paraQuien) qb.andWhere('a.paraQuien = :pq', { pq: paraQuien });
    if (estadoAgenda)
      qb.andWhere('a.estadoAgenda = :est', { est: estadoAgenda });
    if (estaAbierto !== undefined)
      qb.andWhere('a.estaAbierto = :open', { open: estaAbierto });

    qb.orderBy('a.fechaAgendada', 'ASC');

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
    const agendamiento = await this.agendamientoRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: {
        evento: true,
        asignado: { usuarioRoles: { rol: true } },
        tecnico: true,
        crs: true,
        region: true,
        comuna: true,
        tipoLugar: true,
        condenado: true,
        victima: true,
        proceso: {
          procesoDispositivos: { rolDispositivo: true },
          soporteDetalle: true,
        },
        soporteMotivos: { tipoProblema: true },
      },
    });
    if (!agendamiento)
      throw new NotFoundException(`Agendamiento con ID ${id} no encontrado`);
    return agendamiento;
  }

  async create(dto: any, userId: number): Promise<Agendamiento> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.validarSujetoAgenda(dto);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const estadoAgenda = (dto.estadoAgenda as string) || 'EN_PROCESO';
    const agendamiento = this.agendamientoRepo.create({
      ...dto,
      createdBy: userId,
      estadoAgenda,
      estaAbierto: true,
    } as Partial<Agendamiento>);
    const saved = await this.agendamientoRepo.save(agendamiento);
    this.logger.log(`Agendamiento ${saved.id} creado por usuario ${userId}`);
    return this.findOne(saved.id);
  }

  async update(
    id: number,

    dto: any,
    userId: number,
  ): Promise<Agendamiento> {
    const agendamiento = await this.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const merged = { ...agendamiento, ...dto };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.validarSujetoAgenda(merged);
    Object.assign(agendamiento, dto, { updatedBy: userId });
    return this.agendamientoRepo.save(agendamiento);
  }

  private validarSujetoAgenda(dto: {
    paraQuien?: string;
    condenadoId?: number | null;
    victimaId?: number | null;
  }): void {
    const paraQuien = dto.paraQuien ?? 'CONDENADO';
    const condenadoId = dto.condenadoId ?? null;
    const victimaId = dto.victimaId ?? null;

    if (paraQuien === 'CONDENADO') {
      if (!condenadoId) {
        throw new BadRequestException(
          'Debe especificar condenadoId cuando paraQuien es CONDENADO',
        );
      }
      if (victimaId) {
        throw new BadRequestException(
          'No se puede especificar victimaId cuando paraQuien es CONDENADO',
        );
      }
    }

    if (paraQuien === 'VICTIMA') {
      if (!victimaId) {
        throw new BadRequestException(
          'Debe especificar victimaId cuando paraQuien es VICTIMA',
        );
      }
      if (condenadoId) {
        throw new BadRequestException(
          'No se puede especificar condenadoId cuando paraQuien es VICTIMA',
        );
      }
    }
  }

  async updateEstado(
    id: number,
    dto: {
      estadoAgenda: string;
      regionId?: number;
      comunaId?: number;
      tipoLugarId?: number;
    },
    userId: number,
  ): Promise<Agendamiento> {
    const agendamiento = await this.findOne(id);
    agendamiento.estadoAgenda = dto.estadoAgenda;
    agendamiento.updatedBy = userId;
    if (dto.regionId !== undefined) agendamiento.regionId = dto.regionId;
    if (dto.comunaId !== undefined) agendamiento.comunaId = dto.comunaId;
    if (dto.tipoLugarId !== undefined)
      agendamiento.tipoLugarId = dto.tipoLugarId;
    return this.agendamientoRepo.save(agendamiento);
  }

  async updateProceso(
    id: number,
    dto: UpdateProcesoAgendamientoDto,
    userId: number,
  ): Promise<Agendamiento> {
    await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      let proceso = await manager.findOne(Proceso, {
        where: { agendamientoId: id },
      });

      if (!proceso) {
        proceso = manager.create(Proceso, {
          agendamientoId: id,
          eventoId: (
            await manager.findOne(Agendamiento, {
              where: { id },
              select: { eventoId: true },
            })
          )?.eventoId,
        });
      }

      if (dto.horaLlegada !== undefined) proceso.horaLlegada = dto.horaLlegada;
      if (dto.horaSalida !== undefined) proceso.horaSalida = dto.horaSalida;

      await manager.save(proceso);

      if (dto.dispositivos !== undefined && dto.dispositivos.length > 0) {
        await manager.delete(ProcesoDispositivo, { agendamientoId: id });

        const nuevos = dto.dispositivos.map((d) =>
          manager.create(ProcesoDispositivo, {
            agendamientoId: id,
            ...d,
            fechaRegistro: new Date(),
          }),
        );
        await manager.save(nuevos);
      }

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: 'EDITAR_PROCESO',
        entidad: 'AGENDAMIENTO',
        entidadId: id,
        fechaAccion: new Date(),
        detalles: JSON.stringify({
          horaLlegada: dto.horaLlegada,
          horaSalida: dto.horaSalida,
          dispositivosActualizados: dto.dispositivos !== undefined,
          cantidadDispositivos: dto.dispositivos?.length ?? null,
        }),
      });
      await manager.save(accion);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Proceso del agendamiento ${id} actualizado por usuario ${userId}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error al actualizar proceso del agendamiento ${id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }

    return this.findOne(id);
  }

  async reagendar(
    id: number,
    dto: ReagendarAgendamientoDto,
    userId: number,
  ): Promise<Agendamiento> {
    const actual = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      actual.esVigente = false;
      actual.updatedBy = userId;
      await manager.save(actual);

      const nuevo = manager.create(Agendamiento, {
        eventoId: actual.eventoId,
        crsId: actual.crsId,
        paraQuien: actual.paraQuien,
        condenadoId: actual.condenadoId,
        victimaId: actual.victimaId,
        fechaAgendada: dto.fechaAgendada,
        horaInicioRango: dto.horaInicioRango,
        horaFinRango: dto.horaFinRango,
        asignadoA: dto.asignadoA,
        tecnicoId: dto.tecnicoId ?? actual.tecnicoId,
        regionId: dto.regionId,
        comunaId: dto.comunaId,
        tipoLugarId: dto.tipoLugarId,
        direccionAgenda: dto.direccionAgenda,
        urlAcceso: dto.urlAcceso,
        tipoSoporte: dto.tipoSoporte,
        notas: dto.notas,
        esVigente: true,
        estadoAgenda: 'EN_PROCESO',
        numeroIntento: actual.numeroIntento + 1,
        createdBy: userId,
      });
      const saved = await manager.save(nuevo);

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: 'REAGENDAR',
        entidad: 'AGENDAMIENTO',
        entidadId: saved.id,
        fechaAccion: new Date(),
        detalles: JSON.stringify({
          agendamientoOriginal: id,
          nuevoNumeroIntento: saved.numeroIntento,
          fechaAnterior: actual.fechaAgendada,
          fechaNueva: dto.fechaAgendada,
        }),
      });
      await manager.save(accion);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Agendamiento ${id} reagendado -> nuevo ${saved.id} por usuario ${userId}`,
      );

      return this.findOne(saved.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error al reagendar agendamiento ${id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findCalendario(filters: {
    fechaDesde?: string;
    fechaHasta?: string;
    asignadoA?: number;
    tecnicoId?: number;
    crsId?: number;
  }) {
    const qb = this.agendamientoRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.evento', 'e')
      .leftJoinAndSelect('a.asignado', 'u')
      .leftJoinAndSelect('u.usuarioRoles', 'ur')
      .leftJoinAndSelect('ur.rol', 'rol')
      .leftJoinAndSelect('a.tecnico', 'tec')
      .leftJoinAndSelect('a.crs', 'c')
      .leftJoinAndSelect('a.region', 'r')
      .leftJoinAndSelect('a.comuna', 'co')
      .leftJoinAndSelect('a.tipoLugar', 'tl')
      .leftJoinAndSelect('a.condenado', 'cond')
      .leftJoinAndSelect('a.victima', 'vic')
      .where('a.deletedAt IS NULL')
      .andWhere('a.estadoAgenda NOT IN (:...estados)', {
        estados: ['CANCELADO'],
      });

    if (filters.fechaDesde)
      qb.andWhere('a.fechaAgendada >= :desde', { desde: filters.fechaDesde });
    if (filters.fechaHasta)
      qb.andWhere('a.fechaAgendada <= :hasta', {
        hasta: `${filters.fechaHasta} 23:59:59`,
      });
    if (filters.asignadoA)
      qb.andWhere('a.asignadoA = :uid', { uid: filters.asignadoA });
    if (filters.tecnicoId)
      qb.andWhere('a.tecnicoId = :tid', { tid: filters.tecnicoId });
    if (filters.crsId) qb.andWhere('a.crsId = :crs', { crs: filters.crsId });

    qb.orderBy('a.fechaAgendada', 'ASC');

    return qb.getMany();
  }

  async findTecnicosDisponibles(fecha: string) {
    const qb = this.agendamientoRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.asignado', 'u')
      .where('a.deletedAt IS NULL')
      .andWhere('a.fechaAgendada = :fecha', { fecha })
      .andWhere('a.estadoAgenda IN (:...estados)', {
        estados: ['EN_PROCESO', 'COMPLETADO'],
      });

    const ocupados = await qb.getMany();
    const idsOcupados = ocupados
      .filter((a) => a.asignadoA)
      .map((a) => a.asignadoA);
    return { ocupados, idsOcupados };
  }

  async cerrar(id: number): Promise<Agendamiento> {
    const agendamiento = await this.findOne(id);

    agendamiento.estaAbierto = false;
    await this.agendamientoRepo.save(agendamiento);
    this.logger.log(
      `Agendamiento ${id}: estaAbierto = false (cerrado manualmente)`,
    );

    return agendamiento;
  }
}
