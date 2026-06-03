import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProcesoDispositivo } from '../entities/proceso-dispositivo.entity';
import { VwDispositivosActivos } from '../entities/vw-dispositivos-activos.entity';
import { Proceso } from '../../evento/entities/proceso.entity';
import { Agendamiento } from '../../agendamiento/entities/agendamiento.entity';
import { AccionUsuario } from '../../carga-laboral/entities/accion-usuario.entity';
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
    @InjectRepository(VwDispositivosActivos)
    private readonly vwDispositivosActivosRepo: Repository<VwDispositivosActivos>,
    @InjectRepository(Agendamiento)
    private readonly agendamientoRepo: Repository<Agendamiento>,
    @InjectRepository(Proceso)
    private readonly procesoRepo: Repository<Proceso>,
  ) {}

  async findDispositivosByEvento(agendamientoId: number) {
    return this.procesoDispositivoRepo.find({
      where: { agendamientoId },
      relations: { rolDispositivo: true },
    });
  }

  async createProcesoDispositivos(
    agendamientoId: number,
    dtos: CreateProcesoDispositivoDto[],
  ): Promise<ProcesoDispositivo[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const dispositivos = dtos.map((dto) =>
        manager.create(ProcesoDispositivo, {
          agendamientoId,
          ...dto,
          fechaRegistro: new Date(),
        }),
      );
      const saved = await manager.save(dispositivos);

      await queryRunner.commitTransaction();
      this.logger.log(
        `${saved.length} dispositivo(s) registrado(s) en proceso ${agendamientoId}`,
      );
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error al registrar dispositivos en proceso ${agendamientoId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async registrarInstalacion(
    agendamientoId: number,
    dto: RegistrarInstalacionDto,
    userId: number,
  ): Promise<ProcesoDispositivo[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const proceso = await manager.findOne(Proceso, {
        where: { agendamientoId },
      });
      if (!proceso) {
        throw new NotFoundException(
          `Proceso con agendamiento ID ${agendamientoId} no encontrado`,
        );
      }

      const dispositivos = dto.dispositivos.map((dispDto) =>
        manager.create(ProcesoDispositivo, {
          agendamientoId,
          ...dispDto,
          fechaRegistro: new Date(),
        }),
      );
      const saved = await manager.save(dispositivos);

      if (dto.proceso && Object.keys(dto.proceso).length > 0) {
        Object.assign(proceso, dto.proceso);
        await manager.save(proceso);
        this.logger.log(
          `Proceso ${agendamientoId} actualizado durante instalación`,
        );
      }

      if (dto.agendamiento && Object.keys(dto.agendamiento).length > 0) {
        const agendaId = proceso.agendamientoId;

        const agendamiento = await manager.findOne(Agendamiento, {
          where: { id: agendaId },
        });

        if (!agendamiento) {
          throw new NotFoundException(
            `Agendamiento con ID ${agendaId} no encontrado`,
          );
        }

        Object.assign(agendamiento, dto.agendamiento);
        await manager.save(agendamiento);
        this.logger.log(
          `Agendamiento ${agendaId} actualizado durante instalación del proceso ${agendamientoId}`,
        );
      }

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: 'REGISTRAR_INSTALACION',
        entidad: 'PROCESO',
        entidadId: agendamientoId,
        fechaAccion: new Date(),
        detalles: JSON.stringify({
          cantidadDispositivos: saved.length,
          actualizoProceso: !!(
            dto.proceso && Object.keys(dto.proceso).length > 0
          ),
          actualizoAgendamiento: !!(
            dto.agendamiento && Object.keys(dto.agendamiento).length > 0
          ),
        }),
      });
      await manager.save(accion);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Instalación registrada: ${saved.length} dispositivo(s) en proceso ${agendamientoId} por usuario ${userId}`,
      );
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error al registrar instalación en proceso ${agendamientoId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async replaceProcesoDispositivos(
    agendamientoId: number,
    dtos: CreateProcesoDispositivoDto[],
    userId: number,
  ): Promise<ProcesoDispositivo[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const proceso = await manager.findOne(Proceso, {
        where: { agendamientoId },
      });
      if (!proceso) {
        throw new NotFoundException(
          `Proceso con agendamiento ID ${agendamientoId} no encontrado`,
        );
      }

      const existentesCount = await manager.count(ProcesoDispositivo, {
        where: { agendamientoId },
      });

      await manager.delete(ProcesoDispositivo, { agendamientoId });

      if (!dtos || dtos.length === 0) {
        this.logger.log(
          `Todos los dispositivos del proceso ${agendamientoId} fueron eliminados por usuario ${userId}`,
        );
      }

      const dispositivos = dtos.map((dto) =>
        manager.create(ProcesoDispositivo, {
          agendamientoId,
          ...dto,
          fechaRegistro: new Date(),
        }),
      );
      const saved = await manager.save(dispositivos);

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: 'EDITAR_DISPOSITIVOS',
        entidad: 'PROCESO',
        entidadId: agendamientoId,
        fechaAccion: new Date(),
        detalles: JSON.stringify({
          cantidadAnterior: existentesCount,
          cantidadNueva: saved.length,
          eliminados: existentesCount,
          creados: saved.length,
        }),
      });
      await manager.save(accion);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Dispositivos del proceso ${agendamientoId} reemplazados: ${existentesCount} eliminados, ${saved.length} creados por usuario ${userId}`,
      );
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error al reemplazar dispositivos del proceso ${agendamientoId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findDispositivosActivos(solicitudId: number, paraQuien: string) {
    return this.vwDispositivosActivosRepo.find({
      where: { solicitudId, paraQuien },
    });
  }
}
