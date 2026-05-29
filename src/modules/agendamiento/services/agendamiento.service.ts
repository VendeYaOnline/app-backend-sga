import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import { PaginationMeta } from '../../../common/interfaces/pagination-meta.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Agendamiento } from '../entities/agendamiento.entity';
import { Evento } from '../../evento/entities/evento.entity';

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
      .leftJoinAndSelect('a.paraVictima', 'v')
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
      relations: { evento: true, asignado: true, crs: true, paraVictima: true },
    });
    if (!agendamiento)
      throw new NotFoundException(`Agendamiento con ID ${id} no encontrado`);
    return agendamiento;
  }

  async create(dto: any, userId: number): Promise<Agendamiento> {
    const agendamiento = this.agendamientoRepo.create({
      ...dto,
      createdBy: userId,
      estadoAgenda: dto.estadoAgenda || 'PROGRAMADO',
    });
    const saved = (await this.agendamientoRepo.save(
      agendamiento,
    )) as unknown as Agendamiento;
    this.logger.log(`Agendamiento ${saved.id} creado por usuario ${userId}`);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: any): Promise<Agendamiento> {
    const agendamiento = await this.findOne(id);
    Object.assign(agendamiento, dto);
    return this.agendamientoRepo.save(agendamiento);
  }

  async updateEstado(id: number, estadoAgenda: string): Promise<Agendamiento> {
    const agendamiento = await this.findOne(id);
    agendamiento.estadoAgenda = estadoAgenda;
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
        estados: ['PROGRAMADO', 'CONFIRMADO'],
      });

    const ocupados = await qb.getMany();
    const idsOcupados = ocupados
      .filter((a) => a.asignadoA)
      .map((a) => a.asignadoA);
    return { ocupados, idsOcupados };
  }
}
