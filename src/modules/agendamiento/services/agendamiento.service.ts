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

@Injectable()
export class AgendamientoService {
  private readonly logger = new Logger(AgendamientoService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Agendamiento)
    private readonly agendamientoRepo: Repository<Agendamiento>,
  ) {}

  async findAll(
    filters: PaginationDto & {
      eventoId?: number;
      asignadoA?: number;
      estadoAgenda?: string;
    },
  ) {
    const { page = 1, limit = 20, eventoId, asignadoA, estadoAgenda } = filters;

    const qb = this.agendamientoRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.evento', 'e')
      .leftJoinAndSelect('a.asignado', 'u')
      .leftJoinAndSelect('a.crs', 'c')
      .leftJoinAndSelect('a.region', 'r')
      .leftJoinAndSelect('a.comuna', 'co')
      .leftJoinAndSelect('a.tipoLugar', 'tl')
      .leftJoinAndSelect('a.condenado', 'cond')
      .leftJoinAndSelect('a.victima', 'vic')
      .where('a.deletedAt IS NULL');

    if (eventoId) qb.andWhere('a.eventoId = :eid', { eid: eventoId });
    if (asignadoA) qb.andWhere('a.asignadoA = :uid', { uid: asignadoA });
    if (estadoAgenda)
      qb.andWhere('a.estadoAgenda = :est', { est: estadoAgenda });

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
        asignado: true,
        crs: true,
        region: true,
        comuna: true,
        tipoLugar: true,
        condenado: true,
        victima: true,
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

  async findCalendario(filters: {
    fechaDesde?: string;
    fechaHasta?: string;
    asignadoA?: number;
    crsId?: number;
  }) {
    const qb = this.agendamientoRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.evento', 'e')
      .leftJoinAndSelect('a.asignado', 'u')
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
}
