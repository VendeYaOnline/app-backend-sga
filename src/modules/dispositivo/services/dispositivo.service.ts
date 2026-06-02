import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProcesoDispositivo } from '../entities/proceso-dispositivo.entity';
import { CreateProcesoDispositivoDto } from '../dto/create-proceso-dispositivo.dto';

@Injectable()
export class DispositivoService {
  private readonly logger = new Logger(DispositivoService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ProcesoDispositivo)
    private readonly procesoDispositivoRepo: Repository<ProcesoDispositivo>,
  ) {}

  async findDispositivosByEvento(eventoId: number) {
    return this.procesoDispositivoRepo.find({
      where: { eventoId },
      relations: { tipoAccesorio: true, rolDispositivo: true },
    });
  }

  async createProcesoDispositivos(
    eventoId: number,
    dtos: CreateProcesoDispositivoDto[],
  ): Promise<ProcesoDispositivo[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const dispositivos = dtos.map((dto) =>
        manager.create(ProcesoDispositivo, {
          eventoId,
          ...dto,
          fechaRegistro: new Date(),
        }),
      );
      const saved = await manager.save(dispositivos);

      await queryRunner.commitTransaction();
      this.logger.log(
        `${saved.length} dispositivo(s) registrado(s) en proceso ${eventoId}`,
      );
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error al registrar dispositivos en proceso ${eventoId}`,
        error.stack,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
