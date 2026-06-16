import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { SolicitudEstadoHist } from '../../solicitud/entities/solicitud-estado-hist.entity';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';
import { Agendamiento } from '../../agendamiento/entities/agendamiento.entity';
import { Proceso } from '../../evento/entities/proceso.entity';
import { SolicitudFactibilidad } from '../../solicitud/entities/solicitud-factibilidad.entity';
import { UsuarioRol } from '../../auth/entities/usuario-rol.entity';
import { Usuario } from '../../auth/entities/usuario.entity';
import { FindCargaLaboralFechasDto } from '../dto/find-carga-laboral-fechas.dto';
import { FindUsuariosRolDto } from '../dto/find-usuarios-rol.dto';

@Injectable()
export class CargaLaboralService {
  private readonly logger = new Logger(CargaLaboralService.name);

  constructor(
    @InjectRepository(SolicitudEstadoHist)
    private readonly sehRepo: Repository<SolicitudEstadoHist>,
    @InjectRepository(Solicitud)
    private readonly solicitudRepo: Repository<Solicitud>,
    @InjectRepository(Agendamiento)
    private readonly agendamientoRepo: Repository<Agendamiento>,
    @InjectRepository(Proceso)
    private readonly procesoRepo: Repository<Proceso>,
    @InjectRepository(SolicitudFactibilidad)
    private readonly solicitudFactibilidadRepo: Repository<SolicitudFactibilidad>,
    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepo: Repository<UsuarioRol>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async findDmt(usuarioId: number, filters: FindCargaLaboralFechasDto) {
    const { fechaDesde, fechaHasta } = filters;

    const usuario = await this.usuarioRepo.findOne({
      where: { id: usuarioId, deletedAt: IsNull() },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Solicitudes actualmente asignadas (sin filtro de fecha — es estado presente)
    const solicitudesAsignadas = await this.solicitudRepo
      .createQueryBuilder('s')
      .where('s.asignadaA = :uid', { uid: usuarioId })
      .andWhere('s.deletedAt IS NULL')
      .getCount();

    // Base SEH con filtros de fecha opcionales
    const sehBase = this.sehRepo
      .createQueryBuilder('seh')
      .innerJoin('seh.estadoAnterior', 'ant')
      .innerJoin('seh.estadoNuevo', 'nue')
      .where('seh.usuarioId = :uid', { uid: usuarioId });

    if (fechaDesde)
      sehBase.andWhere('seh.fechaCambio >= :desde', { desde: fechaDesde });
    if (fechaHasta)
      sehBase.andWhere('seh.fechaCambio <= :hasta', {
        hasta: `${fechaHasta} 23:59:59`,
      });

    const recepcionadas = await sehBase
      .clone()
      .andWhere('ant.codigo = :ant', { ant: 'RECEPCIONADA' })
      .andWhere('nue.codigo = :nue', { nue: 'REVISION_DMT' })
      .getCount();

    const derivadasEmpresa = await sehBase
      .clone()
      .andWhere('ant.codigo = :ant', { ant: 'REVISION_DMT' })
      .andWhere('nue.codigo = :nue', { nue: 'REVISION_EMPRESA' })
      .getCount();

    const devueltas = await sehBase
      .clone()
      .andWhere('ant.codigo = :ant', { ant: 'REVISION_DMT' })
      .andWhere('nue.codigo = :nue', { nue: 'DEVUELTA_SOLICITANTE' })
      .getCount();

    this.logger.log(
      `findDmt: carga laboral del usuario DMT ${usuarioId} retornada`,
    );
    return { solicitudesAsignadas, recepcionadas, derivadasEmpresa, devueltas };
  }

  async findEmpresa(usuarioId: number, filters: FindCargaLaboralFechasDto) {
    const { fechaDesde, fechaHasta } = filters;

    const usuario = await this.usuarioRepo.findOne({
      where: { id: usuarioId, deletedAt: IsNull() },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Registros SEH: REVISION_EMPRESA → INFORME_GENERADO por este usuario
    const sehQb = this.sehRepo
      .createQueryBuilder('seh')
      .innerJoin('seh.estadoAnterior', 'ant')
      .innerJoin('seh.estadoNuevo', 'nue')
      .where('seh.usuarioId = :uid', { uid: usuarioId })
      .andWhere('ant.codigo = :ant', { ant: 'REVISION_EMPRESA' })
      .andWhere('nue.codigo = :nue', { nue: 'INFORME_GENERADO' });

    if (fechaDesde)
      sehQb.andWhere('seh.fechaCambio >= :desde', { desde: fechaDesde });
    if (fechaHasta)
      sehQb.andWhere('seh.fechaCambio <= :hasta', {
        hasta: `${fechaHasta} 23:59:59`,
      });

    const sehRecords = await sehQb.getMany();
    const solicitudIds = [...new Set(sehRecords.map((r) => r.solicitudId))];
    const total = solicitudIds.length;

    if (!total) {
      this.logger.log(
        `findEmpresa: usuario ${usuarioId} sin solicitudes gestionadas en el período`,
      );
      return {
        total: 0,
        FACTIBLE: 0,
        NO_FACTIBLE: 0,
        NO_RECOMENDABLE: 0,
        sinFactibilidad: 0,
      };
    }

    const factibilidades = await this.solicitudFactibilidadRepo
      .createQueryBuilder('sf')
      .innerJoinAndSelect('sf.tipoFactibilidad', 'tf')
      .where('sf.solicitudId IN (:...ids)', { ids: solicitudIds })
      .getMany();

    const conFactibilidadIds = new Set(
      factibilidades.map((f) => f.solicitudId),
    );
    const sinFactibilidad = solicitudIds.filter(
      (id) => !conFactibilidadIds.has(id),
    ).length;

    let factible = 0;
    let noFactible = 0;
    let noRecomendable = 0;
    for (const f of factibilidades) {
      const codigo = f.tipoFactibilidad.codigo;
      if (codigo === 'FACTIBLE') factible++;
      else if (codigo === 'NO_FACTIBLE') noFactible++;
      else if (codigo === 'NO_RECOMENDABLE') noRecomendable++;
    }

    this.logger.log(
      `findEmpresa: carga laboral del usuario Empresa ${usuarioId} retornada`,
    );
    return {
      total,
      FACTIBLE: factible,
      NO_FACTIBLE: noFactible,
      NO_RECOMENDABLE: noRecomendable,
      sinFactibilidad,
    };
  }

  async findCoordinador(usuarioId: number, filters: FindCargaLaboralFechasDto) {
    const { fechaDesde, fechaHasta } = filters;

    const usuario = await this.usuarioRepo.findOne({
      where: { id: usuarioId, deletedAt: IsNull() },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const tiposEvento = ['INSTALACION', 'SOPORTE', 'DESINSTALACION'];

    const base = this.agendamientoRepo
      .createQueryBuilder('a')
      .innerJoin('a.evento', 'e')
      .innerJoin('e.tipoEvento', 'te')
      .where('a.createdBy = :uid', { uid: usuarioId })
      .andWhere('te.codigo IN (:...tipos)', { tipos: tiposEvento })
      .andWhere('a.deletedAt IS NULL');

    if (fechaDesde)
      base.andWhere('a.createdAt >= :desde', { desde: fechaDesde });
    if (fechaHasta)
      base.andWhere('a.createdAt <= :hasta', {
        hasta: `${fechaHasta} 23:59:59`,
      });

    const total = await base.clone().getCount();
    const reprogramados = await base
      .clone()
      .andWhere('a.numeroIntento > 1')
      .getCount();
    const abiertos = await base
      .clone()
      .andWhere('a.estaAbierto = 1')
      .getCount();
    const cerrados = await base
      .clone()
      .andWhere('a.estaAbierto = 0')
      .getCount();

    const porTipoRaw: { tipo: string; cantidad: string }[] = await base
      .clone()
      .select('te.codigo', 'tipo')
      .addSelect('COUNT(a.id)', 'cantidad')
      .groupBy('te.codigo')
      .getRawMany();

    const porTipo: Record<string, number> = {
      INSTALACION: 0,
      SOPORTE: 0,
      DESINSTALACION: 0,
    };
    for (const row of porTipoRaw) {
      porTipo[row.tipo] = Number(row.cantidad);
    }

    const porEstadoRaw: { estado: string; cantidad: string }[] = await base
      .clone()
      .select('a.estadoAgenda', 'estado')
      .addSelect('COUNT(a.id)', 'cantidad')
      .andWhere('a.estadoAgenda IN (:...estados)', {
        estados: ['EN_PROCESO', 'COMPLETADO', 'NO_REALIZADO'],
      })
      .groupBy('a.estadoAgenda')
      .getRawMany();

    const porEstadoAgenda: Record<string, number> = {
      EN_PROCESO: 0,
      COMPLETADO: 0,
      NO_REALIZADO: 0,
    };
    for (const row of porEstadoRaw) {
      porEstadoAgenda[row.estado] = Number(row.cantidad);
    }

    this.logger.log(
      `findCoordinador: carga laboral del Coordinador ${usuarioId} retornada`,
    );
    return {
      total,
      porTipo,
      reprogramados,
      abiertos,
      cerrados,
      porEstadoAgenda,
    };
  }

  async findTecnico(usuarioId: number, filters: FindCargaLaboralFechasDto) {
    const { fechaDesde, fechaHasta } = filters;

    const usuario = await this.usuarioRepo.findOne({
      where: { id: usuarioId, deletedAt: IsNull() },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const tiposEvento = ['INSTALACION', 'SOPORTE', 'DESINSTALACION'];

    const base = this.agendamientoRepo
      .createQueryBuilder('a')
      .innerJoin('a.evento', 'e')
      .innerJoin('e.tipoEvento', 'te')
      .where('a.tecnicoId = :uid', { uid: usuarioId })
      .andWhere('te.codigo IN (:...tipos)', { tipos: tiposEvento })
      .andWhere('a.deletedAt IS NULL');

    if (fechaDesde)
      base.andWhere('a.createdAt >= :desde', { desde: fechaDesde });
    if (fechaHasta)
      base.andWhere('a.createdAt <= :hasta', {
        hasta: `${fechaHasta} 23:59:59`,
      });

    const total = await base.clone().getCount();

    const porTipoRaw: { tipo: string; cantidad: string }[] = await base
      .clone()
      .select('te.codigo', 'tipo')
      .addSelect('COUNT(a.id)', 'cantidad')
      .groupBy('te.codigo')
      .getRawMany();

    const porTipo: Record<string, number> = {
      INSTALACION: 0,
      SOPORTE: 0,
      DESINSTALACION: 0,
    };
    for (const row of porTipoRaw) {
      porTipo[row.tipo] = Number(row.cantidad);
    }

    // Agendamientos que tienen proceso registrado
    const ejecutados = await base
      .clone()
      .innerJoin('a.proceso', 'p')
      .getCount();

    const realizados = await base
      .clone()
      .innerJoin('a.proceso', 'p')
      .andWhere('p.realizado = 1')
      .getCount();

    const noRealizados = await base
      .clone()
      .innerJoin('a.proceso', 'p')
      .andWhere('p.realizado = 0')
      .getCount();

    this.logger.log(
      `findTecnico: carga laboral del Técnico ${usuarioId} retornada`,
    );
    return { total, porTipo, ejecutados, realizados, noRealizados };
  }

  async findUsuariosPorRol(filters: FindUsuariosRolDto) {
    const { rol } = filters;

    const usuariosConRol = await this.usuarioRolRepo
      .createQueryBuilder('ur')
      .innerJoinAndSelect('ur.usuario', 'u')
      .innerJoin('ur.rol', 'r')
      .leftJoinAndSelect('u.region', 'reg')
      .leftJoinAndSelect('u.crs', 'crs')
      .leftJoinAndSelect('u.tribunal', 'tri')
      .where('r.codigo = :rol', { rol })
      .andWhere('u.activo = 1')
      .andWhere('u.deletedAt IS NULL')
      .orderBy('u.apellidoPaterno')
      .addOrderBy('u.nombres')
      .getMany();

    if (!usuariosConRol.length) {
      this.logger.log(
        `findUsuariosPorRol: ningún usuario activo con rol ${rol}`,
      );
      return [];
    }

    const userIds = [...new Set(usuariosConRol.map((ur) => ur.usuarioId))];

    // Todos los roles de esos usuarios para mostrarlos completos
    const todosRoles = await this.usuarioRolRepo
      .createQueryBuilder('ur')
      .innerJoinAndSelect('ur.rol', 'r')
      .where('ur.usuarioId IN (:...userIds)', { userIds })
      .getMany();

    const rolesPorUsuario: Record<number, string[]> = {};
    for (const ur of todosRoles) {
      if (!rolesPorUsuario[ur.usuarioId]) rolesPorUsuario[ur.usuarioId] = [];
      rolesPorUsuario[ur.usuarioId].push(ur.rol.codigo);
    }

    this.logger.log(
      `findUsuariosPorRol: ${usuariosConRol.length} usuario(s) con rol ${rol} retornados`,
    );

    return usuariosConRol.map((ur) => {
      const u = ur.usuario;
      return {
        id: u.id,
        nombres: u.nombres,
        apellidoPaterno: u.apellidoPaterno,
        apellidoMaterno: u.apellidoMaterno,
        email: u.email,
        run: u.run,
        telefonoMovil: u.telefonoMovil,
        region: u.region ? { id: u.region.id, nombre: u.region.nombre } : null,
        crs: u.crs ? { id: u.crs.id, nombreCrs: u.crs.nombreCrs } : null,
        tribunal: u.tribunal
          ? { id: u.tribunal.id, nombreTribunal: u.tribunal.nombreTribunal }
          : null,
        roles: rolesPorUsuario[u.id] ?? [],
      };
    });
  }
}
