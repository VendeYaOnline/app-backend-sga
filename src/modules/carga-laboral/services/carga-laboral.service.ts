import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccionUsuario } from '../entities/accion-usuario.entity';
import { UsuarioRol } from '../../auth/entities/usuario-rol.entity';
import { Solicitud } from '../../solicitud/entities/solicitud.entity';
import { SolicitudEstadoHist } from '../../solicitud/entities/solicitud-estado-hist.entity';

@Injectable()
export class CargaLaboralService {
  private readonly logger = new Logger(CargaLaboralService.name);

  constructor(
    @InjectRepository(AccionUsuario)
    private readonly accionUsuarioRepo: Repository<AccionUsuario>,
    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepo: Repository<UsuarioRol>,
    @InjectRepository(Solicitud)
    private readonly solicitudRepo: Repository<Solicitud>,
    @InjectRepository(SolicitudEstadoHist)
    private readonly solicitudEstadoHistRepo: Repository<SolicitudEstadoHist>,
  ) {}

  async findResumen(filters: {
    fechaDesde?: string;
    fechaHasta?: string;
    usuarioId?: number;
  }) {
    const qb = this.accionUsuarioRepo
      .createQueryBuilder('au')
      .leftJoinAndSelect('au.usuario', 'u')
      .leftJoinAndSelect('au.solicitud', 's');

    if (filters.fechaDesde)
      qb.andWhere('au.fechaAccion >= :desde', { desde: filters.fechaDesde });
    if (filters.fechaHasta)
      qb.andWhere('au.fechaAccion <= :hasta', {
        hasta: `${filters.fechaHasta} 23:59:59`,
      });
    if (filters.usuarioId)
      qb.andWhere('au.usuarioId = :uid', { uid: filters.usuarioId });

    const acciones = await qb.orderBy('au.fechaAccion', 'DESC').getMany();

    const resumen: Record<string, number> = {};
    for (const a of acciones) {
      resumen[a.tipoAccion] = (resumen[a.tipoAccion] || 0) + 1;
    }

    return { resumen, total: acciones.length };
  }

  async findDetalle(filters: {
    page?: number;
    limit?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    usuarioId?: number;
    tipoAccion?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      fechaDesde,
      fechaHasta,
      usuarioId,
      tipoAccion,
    } = filters;

    const qb = this.accionUsuarioRepo
      .createQueryBuilder('au')
      .leftJoinAndSelect('au.usuario', 'u')
      .leftJoinAndSelect('au.solicitud', 's');

    if (fechaDesde)
      qb.andWhere('au.fechaAccion >= :desde', { desde: fechaDesde });
    if (fechaHasta)
      qb.andWhere('au.fechaAccion <= :hasta', {
        hasta: `${fechaHasta} 23:59:59`,
      });
    if (usuarioId) qb.andWhere('au.usuarioId = :uid', { uid: usuarioId });
    if (tipoAccion) qb.andWhere('au.tipoAccion = :tipo', { tipo: tipoAccion });

    qb.orderBy('au.fechaAccion', 'DESC');

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

  async exportar(filters: {
    fechaDesde?: string;
    fechaHasta?: string;
    usuarioId?: number;
  }) {
    return this.findDetalle({ ...filters, page: 1, limit: 10000 });
  }

  async findPorRol(filters: {
    fechaDesde?: string;
    fechaHasta?: string;
    rolId?: number;
  }) {
    const { fechaDesde, fechaHasta, rolId } = filters;

    // 1. Usuarios con sus roles (solo activos y no eliminados)
    const urQb = this.usuarioRolRepo
      .createQueryBuilder('ur')
      .innerJoinAndSelect('ur.rol', 'r')
      .innerJoinAndSelect('ur.usuario', 'u')
      .where('u.deletedAt IS NULL')
      .andWhere('u.activo = :activo', { activo: true });

    if (rolId) urQb.andWhere('r.id = :rolId', { rolId });

    const usuarioRoles = await urQb.orderBy('r.nombreRol').addOrderBy('u.apellidoPaterno').getMany();

    if (!usuarioRoles.length) return { data: [] };

    const userIds = [...new Set(usuarioRoles.map((ur) => ur.usuarioId))];

    // 2. Conteo de acciones por usuario y tipo en el período
    const accionesQb = this.accionUsuarioRepo
      .createQueryBuilder('au')
      .select('au.usuarioId', 'usuarioId')
      .addSelect('au.tipoAccion', 'tipoAccion')
      .addSelect('COUNT(au.id)', 'count')
      .where('au.usuarioId IN (:...userIds)', { userIds })
      .groupBy('au.usuarioId')
      .addGroupBy('au.tipoAccion');

    if (fechaDesde)
      accionesQb.andWhere('au.fechaAccion >= :desde', { desde: fechaDesde });
    if (fechaHasta)
      accionesQb.andWhere('au.fechaAccion <= :hasta', {
        hasta: `${fechaHasta} 23:59:59`,
      });

    const acciones = await accionesQb.getRawMany();

    // 3. Solicitudes asignadas actualmente por usuario
    const solicitudesQb = this.solicitudRepo
      .createQueryBuilder('s')
      .select('s.asignadaA', 'usuarioId')
      .addSelect('COUNT(s.id)', 'count')
      .where('s.asignadaA IN (:...userIds)', { userIds })
      .andWhere('s.deletedAt IS NULL')
      .groupBy('s.asignadaA');

    const solicitudes = await solicitudesQb.getRawMany();

    // 4. Cambios de estado realizados por usuario en el período
    const histQb = this.solicitudEstadoHistRepo
      .createQueryBuilder('seh')
      .select('seh.usuarioId', 'usuarioId')
      .addSelect('COUNT(seh.id)', 'count')
      .where('seh.usuarioId IN (:...userIds)', { userIds })
      .groupBy('seh.usuarioId');

    if (fechaDesde)
      histQb.andWhere('seh.fechaCambio >= :desde', { desde: fechaDesde });
    if (fechaHasta)
      histQb.andWhere('seh.fechaCambio <= :hasta', {
        hasta: `${fechaHasta} 23:59:59`,
      });

    const histCambios = await histQb.getRawMany();

    // Construir mapas para lookup O(1)
    const accionesMap: Record<number, Record<string, number>> = {};
    for (const a of acciones) {
      const uid = Number(a.usuarioId);
      if (!accionesMap[uid]) accionesMap[uid] = {};
      accionesMap[uid][a.tipoAccion] = Number(a.count);
    }

    const solicitudesMap: Record<number, number> = {};
    for (const s of solicitudes) {
      solicitudesMap[Number(s.usuarioId)] = Number(s.count);
    }

    const histMap: Record<number, number> = {};
    for (const h of histCambios) {
      histMap[Number(h.usuarioId)] = Number(h.count);
    }

    // Agrupar por rol
    const roleMap: Record<number, any> = {};
    for (const ur of usuarioRoles) {
      const rId = ur.rol.id;
      if (!roleMap[rId]) {
        roleMap[rId] = {
          rolId: ur.rol.id,
          rolCodigo: ur.rol.codigo,
          rolNombre: ur.rol.nombreRol,
          usuarios: [],
        };
      }

      const accionesPorTipo = accionesMap[ur.usuarioId] ?? {};
      const totalAcciones = Object.values(accionesPorTipo).reduce(
        (sum, n) => sum + n,
        0,
      );

      roleMap[rId].usuarios.push({
        usuarioId: ur.usuarioId,
        nombreCompleto: [
          ur.usuario.nombres,
          ur.usuario.apellidoPaterno,
          ur.usuario.apellidoMaterno,
        ]
          .filter(Boolean)
          .join(' '),
        solicitudesAsignadas: solicitudesMap[ur.usuarioId] ?? 0,
        totalAcciones,
        accionesPorTipo,
        cambiosEstadoRealizados: histMap[ur.usuarioId] ?? 0,
      });
    }

    const data = Object.values(roleMap).map((rol) => ({
      ...rol,
      totalUsuarios: rol.usuarios.length,
      totalSolicitudesAsignadas: rol.usuarios.reduce(
        (sum: number, u: any) => sum + u.solicitudesAsignadas,
        0,
      ),
      totalAcciones: rol.usuarios.reduce(
        (sum: number, u: any) => sum + u.totalAcciones,
        0,
      ),
    }));

    this.logger.log(
      `findPorRol: ${data.length} rol(es) retornados${rolId ? ` (rolId=${rolId})` : ''}`,
    );
    return data;
  }

  async findUsuario(
    usuarioId: number,
    filters: { fechaDesde?: string; fechaHasta?: string },
  ) {
    const { fechaDesde, fechaHasta } = filters;

    // Usuario + roles
    const usuarioRoles = await this.usuarioRolRepo
      .createQueryBuilder('ur')
      .innerJoinAndSelect('ur.rol', 'r')
      .innerJoinAndSelect('ur.usuario', 'u')
      .where('ur.usuarioId = :usuarioId', { usuarioId })
      .andWhere('u.deletedAt IS NULL')
      .getMany();

    if (!usuarioRoles.length) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    const usuario = usuarioRoles[0].usuario;

    // Acciones por tipo en el período
    const accionesQb = this.accionUsuarioRepo
      .createQueryBuilder('au')
      .select('au.tipoAccion', 'tipoAccion')
      .addSelect('COUNT(au.id)', 'count')
      .where('au.usuarioId = :usuarioId', { usuarioId })
      .groupBy('au.tipoAccion');

    if (fechaDesde)
      accionesQb.andWhere('au.fechaAccion >= :desde', { desde: fechaDesde });
    if (fechaHasta)
      accionesQb.andWhere('au.fechaAccion <= :hasta', {
        hasta: `${fechaHasta} 23:59:59`,
      });

    const acciones = await accionesQb.getRawMany();

    // Últimas 10 acciones
    const ultimasAccionesQb = this.accionUsuarioRepo
      .createQueryBuilder('au')
      .where('au.usuarioId = :usuarioId', { usuarioId })
      .orderBy('au.fechaAccion', 'DESC')
      .take(10);

    if (fechaDesde)
      ultimasAccionesQb.andWhere('au.fechaAccion >= :desde', {
        desde: fechaDesde,
      });
    if (fechaHasta)
      ultimasAccionesQb.andWhere('au.fechaAccion <= :hasta', {
        hasta: `${fechaHasta} 23:59:59`,
      });

    const ultimasAcciones = await ultimasAccionesQb.getMany();

    // Solicitudes asignadas actualmente
    const solicitudesAsignadas = await this.solicitudRepo
      .createQueryBuilder('s')
      .where('s.asignadaA = :usuarioId', { usuarioId })
      .andWhere('s.deletedAt IS NULL')
      .getCount();

    // Cambios de estado realizados en el período
    const histQb = this.solicitudEstadoHistRepo
      .createQueryBuilder('seh')
      .where('seh.usuarioId = :usuarioId', { usuarioId });

    if (fechaDesde)
      histQb.andWhere('seh.fechaCambio >= :desde', { desde: fechaDesde });
    if (fechaHasta)
      histQb.andWhere('seh.fechaCambio <= :hasta', {
        hasta: `${fechaHasta} 23:59:59`,
      });

    const cambiosEstadoRealizados = await histQb.getCount();

    const accionesPorTipo: Record<string, number> = {};
    let totalAcciones = 0;
    for (const a of acciones) {
      accionesPorTipo[a.tipoAccion] = Number(a.count);
      totalAcciones += Number(a.count);
    }

    this.logger.log(`findUsuario: carga laboral del usuario ${usuarioId} retornada`);
    return {
      usuarioId: usuario.id,
      nombreCompleto: [
        usuario.nombres,
        usuario.apellidoPaterno,
        usuario.apellidoMaterno,
      ]
        .filter(Boolean)
        .join(' '),
      roles: usuarioRoles.map((ur) => ({
        id: ur.rol.id,
        codigo: ur.rol.codigo,
        nombre: ur.rol.nombreRol,
      })),
      solicitudesAsignadas,
      totalAcciones,
      accionesPorTipo,
      cambiosEstadoRealizados,
      ultimasAcciones,
    };
  }
}
