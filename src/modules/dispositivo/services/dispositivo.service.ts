import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PaginationMeta } from '../../../common/interfaces/pagination-meta.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Dispositivo } from '../entities/dispositivo.entity';
import { ProcesoAccesorio } from '../entities/proceso-accesorio.entity';
import { ProcesoDispositivo } from '../entities/proceso-dispositivo.entity';

@Injectable()
export class DispositivoService {
  private readonly logger = new Logger(DispositivoService.name);

  constructor(
    @InjectRepository(Dispositivo)
    private readonly dispositivoRepo: Repository<Dispositivo>,
    @InjectRepository(ProcesoAccesorio)
    private readonly procesoAccesorioRepo: Repository<ProcesoAccesorio>,
    @InjectRepository(ProcesoDispositivo)
    private readonly procesoDispositivoRepo: Repository<ProcesoDispositivo>,
  ) {}

  async findAllDispositivos(
    filters: PaginationDto & { tipoAccesorioId?: number; numeroSerie?: string },
  ) {
    const { page = 1, limit = 20, tipoAccesorioId, numeroSerie } = filters;

    const qb = this.dispositivoRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.tipoAccesorio', 'ta');

    if (tipoAccesorioId)
      qb.andWhere('d.tipoAccesorioId = :tid', { tid: tipoAccesorioId });
    if (numeroSerie)
      qb.andWhere('d.numeroSerie LIKE :serie', { serie: `%${numeroSerie}%` });

    qb.orderBy('d.createdAt', 'DESC');

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

  async findDispositivo(id: number) {
    const dispositivo = await this.dispositivoRepo.findOne({
      where: { id },
      relations: { tipoAccesorio: true },
    });
    if (!dispositivo)
      throw new NotFoundException(`Dispositivo con ID ${id} no encontrado`);
    return dispositivo;
  }

  async createDispositivo(dto: any): Promise<Dispositivo> {
    const dispositivo = this.dispositivoRepo.create(dto);
    return this.dispositivoRepo.save(
      dispositivo,
    ) as unknown as Promise<Dispositivo>;
  }

  async findAccesoriosByEvento(eventoId: number) {
    return this.procesoAccesorioRepo.find({
      where: { eventoId },
      relations: { tipoAccesorio: true },
    });
  }

  async createAccesorio(eventoId: number, dto: any): Promise<ProcesoAccesorio> {
    const accesorio = this.procesoAccesorioRepo.create({ eventoId, ...dto });
    return this.procesoAccesorioRepo.save(
      accesorio,
    ) as unknown as Promise<ProcesoAccesorio>;
  }

  async findDispositivosByEvento(eventoId: number) {
    return this.procesoDispositivoRepo.find({
      where: { eventoId },
      relations: { dispositivo: true, rolDispositivo: true },
    });
  }

  async createProcesoDispositivo(
    eventoId: number,
    dto: any,
  ): Promise<ProcesoDispositivo> {
    const pd = this.procesoDispositivoRepo.create({
      eventoId,
      ...dto,
      fechaRegistro: new Date(),
    });
    return this.procesoDispositivoRepo.save(
      pd,
    ) as unknown as Promise<ProcesoDispositivo>;
  }
}
