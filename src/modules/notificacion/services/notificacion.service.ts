import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PaginationMeta } from '../../../common/interfaces/pagination-meta.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Notificacion } from '../entities/notificacion.entity';
import { NotificacionUsuario } from '../entities/notificacion-usuario.entity';
import { NotificacionPlantilla } from '../entities/notificacion-plantilla.entity';

@Injectable()
export class NotificacionService {
  private readonly logger = new Logger(NotificacionService.name);

  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepo: Repository<Notificacion>,
    @InjectRepository(NotificacionUsuario)
    private readonly notificacionUsuarioRepo: Repository<NotificacionUsuario>,
    @InjectRepository(NotificacionPlantilla)
    private readonly plantillaRepo: Repository<NotificacionPlantilla>,
  ) {}

  async findNotificaciones(
    filters: PaginationDto & { usuarioId?: number; solicitudId?: number },
  ) {
    const { page = 1, limit = 20, usuarioId, solicitudId } = filters;

    const qb = this.notificacionUsuarioRepo
      .createQueryBuilder('nu')
      .leftJoinAndSelect('nu.notificacion', 'n')
      .leftJoinAndSelect('nu.usuario', 'u')
      .leftJoinAndSelect('n.plantilla', 'p');

    if (usuarioId) qb.andWhere('nu.usuarioId = :uid', { uid: usuarioId });
    if (solicitudId) qb.andWhere('n.solicitudId = :sid', { sid: solicitudId });

    qb.orderBy('n.createdAt', 'DESC');

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

  async findNoLeidas(usuarioId: number) {
    return this.notificacionUsuarioRepo.find({
      where: { usuarioId, leidaAt: IsNull() },
      relations: { notificacion: { plantilla: true } },
      order: { notificacion: { createdAt: 'DESC' } },
    });
  }

  async marcarLeida(
    id: number,
    usuarioId: number,
  ): Promise<NotificacionUsuario> {
    const nu = await this.notificacionUsuarioRepo.findOne({
      where: { id, usuarioId },
    });
    if (!nu)
      throw new NotFoundException(
        `Notificación de usuario con ID ${id} no encontrada`,
      );
    nu.leidaAt = new Date();
    return this.notificacionUsuarioRepo.save(nu);
  }

  async marcarTodasLeidas(usuarioId: number): Promise<void> {
    await this.notificacionUsuarioRepo.update(
      { usuarioId, leidaAt: IsNull() },
      { leidaAt: new Date() },
    );
  }

  async findAllPlantillas() {
    return this.plantillaRepo.find({
      relations: { rol: true },
      order: { codigo: 'ASC' },
    });
  }

  async findPlantilla(id: number) {
    const plantilla = await this.plantillaRepo.findOne({
      where: { id },
      relations: { rol: true },
    });
    if (!plantilla)
      throw new NotFoundException(`Plantilla con ID ${id} no encontrada`);
    return plantilla;
  }

  async createPlantilla(dto: any): Promise<NotificacionPlantilla> {
    const plantilla = this.plantillaRepo.create(dto);
    return this.plantillaRepo.save(
      plantilla,
    ) as unknown as Promise<NotificacionPlantilla>;
  }

  async updatePlantilla(id: number, dto: any): Promise<NotificacionPlantilla> {
    const plantilla = await this.findPlantilla(id);
    Object.assign(plantilla, dto);
    return this.plantillaRepo.save(plantilla);
  }
}
