import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatRol } from '../entities/cat-rol.entity';
import { CatPermiso } from '../entities/cat-permiso.entity';
import { RolPermiso } from '../entities/rol-permiso.entity';
import { CreateRolDto } from '../dto/create-rol.dto';
import { UpdateRolDto } from '../dto/update-rol.dto';
import { AssignPermisosDto } from '../dto/assign-permisos.dto';

@Injectable()
export class RolService {
  private readonly logger = new Logger(RolService.name);

  constructor(
    @InjectRepository(CatRol)
    private readonly rolRepo: Repository<CatRol>,
    @InjectRepository(CatPermiso)
    private readonly permisoRepo: Repository<CatPermiso>,
    @InjectRepository(RolPermiso)
    private readonly rolPermisoRepo: Repository<RolPermiso>,
  ) {}

  async findAllRoles() {
    return this.rolRepo.find({ order: { nombreRol: 'ASC' } });
  }

  async createRol(dto: CreateRolDto) {
    const rol = this.rolRepo.create(dto);
    const saved = await this.rolRepo.save(rol);
    this.logger.log(`Rol creado: ${saved.codigo} (ID ${saved.id})`);
    return saved;
  }

  async updateRol(id: number, dto: UpdateRolDto) {
    const rol = await this.rolRepo.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    Object.assign(rol, dto);
    const updated = await this.rolRepo.save(rol);
    this.logger.log(`Rol actualizado: ${updated.codigo} (ID ${id})`);
    return updated;
  }

  async findPermisosByRol(id: number) {
    return this.rolPermisoRepo.find({
      where: { rolId: id },
      relations: { permiso: true },
    });
  }

  async assignPermisos(id: number, dto: AssignPermisosDto) {
    await this.rolPermisoRepo.delete({ rolId: id });
    const rolPermisos = dto.permisoIds.map((permisoId) =>
      this.rolPermisoRepo.create({ rolId: id, permisoId }),
    );
    const saved = await this.rolPermisoRepo.save(rolPermisos);
    this.logger.log(`${dto.permisoIds.length} permisos asignados al rol ${id}`);
    return saved;
  }

  async findAllPermisos() {
    return this.permisoRepo.find({ order: { codigo: 'ASC' } });
  }
}
