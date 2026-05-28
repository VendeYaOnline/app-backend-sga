import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationMeta } from '../../../common/interfaces/pagination-meta.interface';
import { AccionUsuario } from '../entities/accion-usuario.entity';

@Injectable()
export class CargaLaboralService {
  private readonly logger = new Logger(CargaLaboralService.name);

  constructor(
    @InjectRepository(AccionUsuario)
    private readonly accionUsuarioRepo: Repository<AccionUsuario>,
  ) {}

  async findResumen(filters: { fechaDesde?: string; fechaHasta?: string; usuarioId?: number }) {
    const qb = this.accionUsuarioRepo.createQueryBuilder('au')
      .leftJoinAndSelect('au.usuario', 'u')
      .leftJoinAndSelect('au.solicitud', 's');

    if (filters.fechaDesde) qb.andWhere('au.fechaAccion >= :desde', { desde: filters.fechaDesde });
    if (filters.fechaHasta) qb.andWhere('au.fechaAccion <= :hasta', { hasta: `${filters.fechaHasta} 23:59:59` });
    if (filters.usuarioId) qb.andWhere('au.usuarioId = :uid', { uid: filters.usuarioId });

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
    const { page = 1, limit = 20, fechaDesde, fechaHasta, usuarioId, tipoAccion } = filters;

    const qb = this.accionUsuarioRepo.createQueryBuilder('au')
      .leftJoinAndSelect('au.usuario', 'u')
      .leftJoinAndSelect('au.solicitud', 's');

    if (fechaDesde) qb.andWhere('au.fechaAccion >= :desde', { desde: fechaDesde });
    if (fechaHasta) qb.andWhere('au.fechaAccion <= :hasta', { hasta: `${fechaHasta} 23:59:59` });
    if (usuarioId) qb.andWhere('au.usuarioId = :uid', { uid: usuarioId });
    if (tipoAccion) qb.andWhere('au.tipoAccion = :tipo', { tipo: tipoAccion });

    qb.orderBy('au.fechaAccion', 'DESC');

    const skip = (page - 1) * limit;
    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } as PaginationMeta };
  }

  async exportar(filters: { fechaDesde?: string; fechaHasta?: string; usuarioId?: number }) {
    return this.findDetalle({ ...filters, page: 1, limit: 10000 });
  }
}
