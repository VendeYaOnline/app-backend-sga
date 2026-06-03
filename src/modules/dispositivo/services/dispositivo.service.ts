import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProcesoDispositivo } from '../entities/proceso-dispositivo.entity';
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
    @InjectRepository(Agendamiento)
    private readonly agendamientoRepo: Repository<Agendamiento>,
    @InjectRepository(Proceso)
    private readonly procesoRepo: Repository<Proceso>,
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
    userId: number,
  ): Promise<ProcesoDispositivo[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const proceso = await manager.findOne(Proceso, {
        where: { eventoId },
      });
      if (!proceso) {
        throw new NotFoundException(
          `Proceso con evento ID ${eventoId} no encontrado`,
        );
      }

      const dispositivos = dto.dispositivos.map((dispDto) =>
        manager.create(ProcesoDispositivo, {
          eventoId,
          ...dispDto,
          fechaRegistro: new Date(),
        }),
      );
      const saved = await manager.save(dispositivos);

      if (dto.proceso && Object.keys(dto.proceso).length > 0) {
        Object.assign(proceso, dto.proceso);
        await manager.save(proceso);
        this.logger.log(`Proceso ${eventoId} actualizado durante instalación`);
      }

      if (dto.agendamiento && Object.keys(dto.agendamiento).length > 0) {
        const agendamientoId = proceso.agendamientoId;

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

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: 'REGISTRAR_INSTALACION',
        entidad: 'PROCESO',
        entidadId: eventoId,
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
        `Instalación registrada: ${saved.length} dispositivo(s) en proceso ${eventoId} por usuario ${userId}`,
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

  async replaceProcesoDispositivos(
    eventoId: number,
    dtos: CreateProcesoDispositivoDto[],
    userId: number,
  ): Promise<ProcesoDispositivo[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const proceso = await manager.findOne(Proceso, {
        where: { eventoId },
      });
      if (!proceso) {
        throw new NotFoundException(
          `Proceso con evento ID ${eventoId} no encontrado`,
        );
      }

      const existentesCount = await manager.count(ProcesoDispositivo, {
        where: { eventoId },
      });

      await manager.delete(ProcesoDispositivo, { eventoId });

      if (!dtos || dtos.length === 0) {
        this.logger.log(
          `Todos los dispositivos del proceso ${eventoId} fueron eliminados por usuario ${userId}`,
        );
      }

      const dispositivos = dtos.map((dto) =>
        manager.create(ProcesoDispositivo, {
          eventoId,
          ...dto,
          fechaRegistro: new Date(),
        }),
      );
      const saved = await manager.save(dispositivos);

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: 'EDITAR_DISPOSITIVOS',
        entidad: 'PROCESO',
        entidadId: eventoId,
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
        `Dispositivos del proceso ${eventoId} reemplazados: ${existentesCount} eliminados, ${saved.length} creados por usuario ${userId}`,
      );
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error al reemplazar dispositivos del proceso ${eventoId}`,
        error.stack,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
