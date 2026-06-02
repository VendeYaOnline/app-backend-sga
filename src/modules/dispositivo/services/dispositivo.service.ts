import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcesoDispositivo } from '../entities/proceso-dispositivo.entity';

@Injectable()
export class DispositivoService {
  private readonly logger = new Logger(DispositivoService.name);

  constructor(
    @InjectRepository(ProcesoDispositivo)
    private readonly procesoDispositivoRepo: Repository<ProcesoDispositivo>,
  ) {}

  async findDispositivosByEvento(eventoId: number) {
    return this.procesoDispositivoRepo.find({
      where: { eventoId },
      relations: { tipoAccesorio: true, rolDispositivo: true },
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
