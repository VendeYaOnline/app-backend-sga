import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProcesoDispositivo } from '../entities/proceso-dispositivo.entity';
import { Agendamiento } from '../../agendamiento/entities/agendamiento.entity';
import { CreateProcesoDispositivoDto } from '../dto/create-proceso-dispositivo.dto';
import { RegistrarInstalacionDto } from '../dto/registrar-instalacion.dto';

@Injectable()
export class DispositivoService {
  private readonly logger = new Logger(DispositivoService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(ProcesoDispositivo)
    private readonly procesoDispositivoRepo: Repository<ProcesoDispositivo>,
    @InjectRepository(Agendamiento)
    private readonly agendamientoRepo: Repository<Agendamiento>,
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

  async registrarInstalacion(
    eventoId: number,
    dto: RegistrarInstalacionDto,
  ): Promise<ProcesoDispositivo[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const dispositivos = dto.dispositivos.map((dispDto) =>
        manager.create(ProcesoDispositivo, {
          eventoId,
          ...dispDto,
          fechaRegistro: new Date(),
        }),
      );
      const saved = await manager.save(dispositivos);

      if (dto.agendamiento && Object.keys(dto.agendamiento).length > 0) {
        const agendamientoId = dto.agendamientoId;

        if (agendamientoId) {
          const agendamiento = await manager.findOne(Agendamiento, {
            where: { id: agendamientoId },
          });

          if (!agendamiento) {
            throw new NotFoundException(
              `Agendamiento con ID ${agendamientoId} no encontrado`,
            );
          }

          Object.assign(agendamiento, dto.agendamiento);
          await manager.save(agendamiento);
          this.logger.log(
            `Agendamiento ${agendamientoId} actualizado durante instalación del proceso ${eventoId}`,
          );
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `Instalación registrada: ${saved.length} dispositivo(s) en proceso ${eventoId}`,
      );
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error al registrar instalación en proceso ${eventoId}`,
        error.stack,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
