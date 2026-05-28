import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationMeta } from '../../../common/interfaces/pagination-meta.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PjudLlamada } from '../entities/pjud-llamada.entity';

@Injectable()
export class PjudService {
  private readonly logger = new Logger(PjudService.name);

  constructor(
    @InjectRepository(PjudLlamada)
    private readonly pjudLlamadaRepo: Repository<PjudLlamada>,
  ) {}

  async findAllLlamadas(filters: PaginationDto & { endpoint?: string; procesadoOk?: string; solicitudId?: number }) {
    const { page = 1, limit = 20, endpoint, procesadoOk, solicitudId } = filters;

    const qb = this.pjudLlamadaRepo.createQueryBuilder('pl')
      .leftJoinAndSelect('pl.solicitud', 's');

    if (endpoint) qb.andWhere('pl.endpoint = :ep', { ep: endpoint });
    if (procesadoOk !== undefined) qb.andWhere('pl.procesadoOk = :pok', { pok: procesadoOk === 'true' });
    if (solicitudId) qb.andWhere('pl.solicitudId = :sid', { sid: solicitudId });

    qb.orderBy('pl.fechaLlamada', 'DESC');

    const skip = (page - 1) * limit;
    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } as PaginationMeta };
  }

  async findOne(id: number) {
    const llamada = await this.pjudLlamadaRepo.findOne({
      where: { id },
      relations: { solicitud: true },
    });
    if (!llamada) throw new NotFoundException(`Llamada PJUD con ID ${id} no encontrada`);
    return llamada;
  }

  async recepcionIft(dto: any): Promise<PjudLlamada> {
    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'RECEPCION_IFT',
      direccion: 'IN',
      crrIdSolicitud: dto.crrIdSolicitud,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
    });
    return this.pjudLlamadaRepo.save(llamada);
  }

  async recepcionDecreto(dto: any): Promise<PjudLlamada> {
    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'RECEPCION_DECRETO',
      direccion: 'IN',
      solicitudId: dto.solicitudId,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
    });
    return this.pjudLlamadaRepo.save(llamada);
  }

  async consultaIft(crrId: number): Promise<PjudLlamada[]> {
    return this.pjudLlamadaRepo.find({
      where: { crrIdSolicitud: crrId },
      order: { fechaLlamada: 'DESC' },
    });
  }

  async enviarFactibilidad(solicitudId: number, dto: any): Promise<PjudLlamada> {
    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'ENVIAR_FACTIBILIDAD',
      direccion: 'OUT',
      solicitudId,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
    });
    return this.pjudLlamadaRepo.save(llamada);
  }

  async enviarIncumplimiento(solicitudId: number, dto: any): Promise<PjudLlamada> {
    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'ENVIAR_INCUMPLIMIENTO',
      direccion: 'OUT',
      solicitudId,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
    });
    return this.pjudLlamadaRepo.save(llamada);
  }

  async enviarAlarmaCenco(dto: any): Promise<PjudLlamada> {
    const llamada = this.pjudLlamadaRepo.create({
      endpoint: 'ENVIAR_ALARMA_CENCO',
      direccion: 'OUT',
      solicitudId: dto.solicitudId,
      requestBody: JSON.stringify(dto),
      fechaLlamada: new Date(),
    });
    return this.pjudLlamadaRepo.save(llamada);
  }

  async reprocesar(id: number): Promise<PjudLlamada> {
    const llamada = await this.findOne(id);
    llamada.procesadoOk = false;
    llamada.procesadoAt = null;
    return this.pjudLlamadaRepo.save(llamada);
  }
}
