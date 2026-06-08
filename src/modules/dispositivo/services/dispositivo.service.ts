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

      const agendamiento = await manager.findOne(Agendamiento, {
        where: { id: agendamientoId },
        relations: { evento: true },
      });
      if (!agendamiento) {
        throw new NotFoundException(
          `Agendamiento con ID ${agendamientoId} no encontrado`,
        );
      }

      const contexto = {
        solicitudId: agendamiento.evento.solicitudId,
        paraQuien: agendamiento.paraQuien,
        condenadoId: agendamiento.condenadoId,
        victimaId: agendamiento.victimaId,
      };

      const dispositivos = dtos.map((dto) =>
        manager.create(ProcesoDispositivo, {
          agendamientoId,
          ...contexto,
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

      const agendamiento = await manager.findOne(Agendamiento, {
        where: { id: agendamientoId },
        relations: { evento: true },
      });
      if (!agendamiento) {
        throw new NotFoundException(
          `Agendamiento con ID ${agendamientoId} no encontrado`,
        );
      }

      const contexto = {
        solicitudId: agendamiento.evento.solicitudId,
        paraQuien: agendamiento.paraQuien,
        condenadoId: agendamiento.condenadoId,
        victimaId: agendamiento.victimaId,
      };

      const dispositivos = dto.dispositivos.map((dispDto) =>
        manager.create(ProcesoDispositivo, {
          agendamientoId,
          ...contexto,
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
        Object.assign(agendamiento, dto.agendamiento);
        await manager.save(agendamiento);
        this.logger.log(
          `Agendamiento ${agendamientoId} actualizado durante instalación`,
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
          actualizoProceso: !!(dto.proceso && Object.keys(dto.proceso).length > 0),
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

      const agendamiento = await manager.findOne(Agendamiento, {
        where: { id: agendamientoId },
        relations: { evento: true },
      });
      if (!agendamiento) {
        throw new NotFoundException(
          `Agendamiento con ID ${agendamientoId} no encontrado`,
        );
      }

      const contexto = {
        solicitudId: agendamiento.evento.solicitudId,
        paraQuien: agendamiento.paraQuien,
        condenadoId: agendamiento.condenadoId,
        victimaId: agendamiento.victimaId,
      };

      const existentesCount = await manager.count(ProcesoDispositivo, {
        where: { agendamientoId },
      });

      await manager.delete(ProcesoDispositivo, { agendamientoId });

      const dispositivos = dtos.map((dto) =>
        manager.create(ProcesoDispositivo, {
          agendamientoId,
          ...contexto,
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

  async findDispositivosVigentes(
    solicitudId: number,
    paraQuien: string,
  ): Promise<ProcesoDispositivo[]> {
    // Retorna el registro cuya fecha_registro es la máxima por serial
    // excluyendo el rol REVISADO, y solo si ese último rol es INSTALADO
    // o REEMPLAZADO_ENTRANTE (dispositivo actualmente en poder del sujeto).
    // Se usa TOP 1 ... ORDER BY id DESC en vez de MAX(fecha_registro) porque:
    // - id es IDENTITY, siempre creciente, sin problemas de precisión de datetime.
    // - Dos registros guardados en la misma transacción pueden tener el mismo
    //   fecha_registro (misma llamada a new Date()), lo que rompía el MAX.
    return this.procesoDispositivoRepo
      .createQueryBuilder('pd')
      .innerJoinAndSelect('pd.rolDispositivo', 'rd')
      .where('pd.solicitud_id = :sol', { sol: solicitudId })
      .andWhere('pd.para_quien = :pq', { pq: paraQuien })
      .andWhere("rd.codigo IN ('INSTALADO', 'REEMPLAZADO_ENTRANTE')")
      .andWhere(`pd.id = (
        SELECT TOP 1 pd2.id
        FROM sga.PROCESO_DISPOSITIVO pd2
        INNER JOIN sga.CAT_ROL_DISPOSITIVO rd2 ON rd2.id = pd2.rol_dispositivo_id
        WHERE pd2.solicitud_id = pd.solicitud_id
          AND pd2.para_quien = pd.para_quien
          AND pd2.numero_serie = pd.numero_serie
          AND rd2.codigo != 'REVISADO'
        ORDER BY pd2.id DESC
      )`)
      .getMany();
  }

  async contarSoportesPorSerial(
    numeroSerie: string,
    solicitudId: number,
  ): Promise<number> {
    const result = await this.procesoDispositivoRepo
      .createQueryBuilder('pd')
      .innerJoin('pd.rolDispositivo', 'rd')
      .select('COUNT(DISTINCT pd.agendamiento_id)', 'total')
      .where('pd.numero_serie = :serie', { serie: numeroSerie })
      .andWhere('pd.solicitud_id = :sol', { sol: solicitudId })
      .andWhere("rd.codigo IN ('REVISADO', 'REEMPLAZADO_SALIENTE')")
      .andWhere(`EXISTS (
        SELECT 1 FROM sga.PROCESO p
        INNER JOIN sga.EVENTO e ON e.id = p.evento_id
        INNER JOIN sga.CAT_TIPO_EVENTO te ON te.id = e.tipo_evento_id
        WHERE p.agendamiento_id = pd.agendamiento_id AND te.codigo = 'SOPORTE'
      )`)
      .getRawOne<{ total: string }>();
    return parseInt(result?.total ?? '0', 10);
  }
}
