import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PrefactPeriodo } from '../entities/prefact-periodo.entity';
import { PrefactDetalle } from '../entities/prefact-detalle.entity';

@Injectable()
export class PrefacturacionService {
  private readonly logger = new Logger(PrefacturacionService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(PrefactPeriodo)
    private readonly periodoRepo: Repository<PrefactPeriodo>,
    @InjectRepository(PrefactDetalle)
    private readonly detalleRepo: Repository<PrefactDetalle>,
  ) {}

  async findPeriodos(filters: PaginationDto) {
    const { page = 1, limit = 20 } = filters;

    const qb = this.periodoRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.cerradoPor', 'u')
      .orderBy('p.anio', 'DESC')
      .addOrderBy('p.mes', 'DESC');

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

  async findPeriodo(id: number) {
    const periodo = await this.periodoRepo.findOne({
      where: { id },
      relations: { cerradoPor: true },
    });
    if (!periodo)
      throw new NotFoundException(`Periodo con ID ${id} no encontrado`);
    return periodo;
  }

  async crearPeriodo(dto: {
    anio: number;
    mes: number;
  }): Promise<PrefactPeriodo> {
    const existente = await this.periodoRepo.findOne({
      where: { anio: dto.anio, mes: dto.mes },
    });
    if (existente)
      throw new ConflictException(
        `El periodo ${dto.mes}/${dto.anio} ya existe`,
      );
    const periodo = this.periodoRepo.create(dto);
    return this.periodoRepo.save(periodo);
  }

  async cerrarPeriodo(id: number, userId: number): Promise<PrefactPeriodo> {
    const periodo = await this.findPeriodo(id);
    if (periodo.cerrado)
      throw new BadRequestException('El periodo ya está cerrado');
    periodo.cerrado = true;
    periodo.cerradoAt = new Date();
    periodo.cerradoBy = userId;
    return this.periodoRepo.save(periodo);
  }

  async findDetalles(periodoId: number) {
    return this.detalleRepo.find({
      where: { periodoId },
      relations: { solicitud: true, condenado: true, victima: true },
    });
  }

  async crearDetalle(dto: Record<string, unknown>): Promise<PrefactDetalle> {
    const detalle = this.detalleRepo.create(dto);
    return this.detalleRepo.save(detalle);
  }

  async findResumen(periodoId: number) {
    const detalles = await this.findDetalles(periodoId);
    const totalSolicitudes = detalles.length;
    const totalDias = detalles.reduce((sum, d) => sum + d.diasMonitoreados, 0);
    return { periodoId, totalSolicitudes, totalDias, detalles };
  }
}
