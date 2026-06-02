import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginationMeta } from '../../../common/interfaces/pagination-meta.interface';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { Usuario } from '../entities/usuario.entity';
import { UsuarioRol } from '../entities/usuario-rol.entity';
import { CatRol } from '../entities/cat-rol.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepo: Repository<UsuarioRol>,
    @InjectRepository(CatRol)
    private readonly rolRepo: Repository<CatRol>,
  ) {}

  async findAll(
    filters: PaginationDto & {
      search?: string;
      activo?: boolean;
      rolId?: number;
    },
  ) {
    const { page = 1, limit = 20, search, activo, rolId } = filters;

    const qb = this.usuarioRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.region', 'r')
      .leftJoinAndSelect('u.crs', 'crs')
      .leftJoinAndSelect('u.tribunal', 't')
      .select([
        'u.id',
        'u.username',
        'u.email',
        'u.run',
        'u.nombres',
        'u.apellidoPaterno',
        'u.apellidoMaterno',
        'u.telefonoMovil',
        'u.telefonoFijo',
        'u.activo',
        'u.debeCambiarPass',
        'u.ultimoLogin',
        'u.createdAt',
        'u.updatedAt',
        'u.regionId',
        'u.crsId',
        'u.tribunalId',
        'r.id',
        'r.nombre',
        'crs.id',
        'crs.nombreCrs',
        't.id',
        't.nombreTribunal',
      ])
      .where('u.deletedAt IS NULL');

    if (activo !== undefined) {
      qb.andWhere('u.activo = :activo', { activo });
    }

    if (search) {
      qb.andWhere(
        '(u.username LIKE :s OR u.email LIKE :s OR u.nombres LIKE :s OR u.apellidoPaterno LIKE :s OR u.run LIKE :s)',
        { s: `%${search}%` },
      );
    }

    if (rolId) {
      qb.innerJoin('sga.USUARIO_ROL', 'ur', 'ur.usuario_id = u.id').andWhere(
        'ur.rol_id = :rolId',
        { rolId },
      );
    }

    qb.orderBy('u.apellidoPaterno', 'ASC').addOrderBy(
      'u.apellidoMaterno',
      'ASC',
    );

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

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { region: true, crs: true, tribunal: true },
    });
    if (!usuario) {
      throw new BadRequestException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async findOnePublic(id: number): Promise<Partial<Usuario>> {
    const usuario = await this.usuarioRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { region: true, crs: true, tribunal: true },
      select: {
        id: true,
        username: true,
        email: true,
        run: true,
        nombres: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        telefonoMovil: true,
        telefonoFijo: true,
        activo: true,
        debeCambiarPass: true,
        ultimoLogin: true,
        createdAt: true,
        updatedAt: true,
        region: { id: true, nombre: true },
        crs: { id: true, nombreCrs: true },
        tribunal: { id: true, nombreTribunal: true },
      },
    });
    if (!usuario) {
      throw new BadRequestException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async findByUsername(username: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { username, deletedAt: IsNull() },
      relations: { region: true, crs: true, tribunal: true },
    });
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  async findByRun(run: string): Promise<Usuario | null> {
    return this.usuarioRepo.findOne({
      where: { run, deletedAt: IsNull() },
    });
  }

  async findRolesByUsuario(usuarioId: number): Promise<CatRol[]> {
    const usuarioRoles = await this.usuarioRolRepo.find({
      where: { usuarioId },
      relations: { rol: true },
    });
    return usuarioRoles.map((ur) => ur.rol);
  }

  async findPermisosByUsuario(usuarioId: number): Promise<string[]> {
    const result = await this.usuarioRolRepo.manager.query(
      `SELECT DISTINCT p.codigo
       FROM sga.USUARIO_ROL ur
       INNER JOIN sga.ROL_PERMISO rp ON ur.rol_id = rp.rol_id
       INNER JOIN sga.CAT_PERMISO p ON rp.permiso_id = p.id
       WHERE ur.usuario_id = @0`,
      [usuarioId],
    );
    return result.map((r: any) => r.codigo);
  }

  async create(dto: CreateUsuarioDto, userId: number): Promise<Usuario> {
    const existingUsername = await this.findByUsername(dto.username);
    if (existingUsername) {
      throw new BadRequestException(`El username "${dto.username}" ya existe`);
    }

    const existingEmail = await this.findByEmail(dto.email);
    if (existingEmail) {
      throw new BadRequestException(`El email "${dto.email}" ya existe`);
    }

    const existingRun = await this.findByRun(dto.run);
    if (existingRun) {
      throw new ConflictException(`El RUN "${dto.run}" ya está registrado`);
    }

    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(dto.password, salt);

    const usuario = this.usuarioRepo.create({
      ...dto,
      passHash,
      createdBy: userId,
    });
    return this.usuarioRepo.save(usuario);
  }

  async update(
    id: number,
    dto: UpdateUsuarioDto,
    userId: number,
  ): Promise<Usuario> {
    const usuario = await this.findOne(id);

    if (dto.username && dto.username !== usuario.username) {
      const existing = await this.findByUsername(dto.username);
      if (existing)
        throw new BadRequestException(
          `El username "${dto.username}" ya existe`,
        );
    }

    if (dto.email && dto.email !== usuario.email) {
      const existing = await this.findByEmail(dto.email);
      if (existing)
        throw new BadRequestException(`El email "${dto.email}" ya existe`);
    }

    if (dto.run && dto.run !== usuario.run) {
      const existing = await this.findByRun(dto.run);
      if (existing)
        throw new ConflictException(`El RUN "${dto.run}" ya está registrado`);
    }

    Object.assign(usuario, dto, { updatedBy: userId });
    return this.usuarioRepo.save(usuario);
  }

  async softDelete(id: number, userId: number): Promise<void> {
    const usuario = await this.findOne(id);
    usuario.deletedAt = new Date();
    usuario.deletedBy = userId;
    await this.usuarioRepo.save(usuario);
  }

  async assignRol(
    usuarioId: number,
    rolId: number,
    userId: number,
  ): Promise<void> {
    const existing = await this.usuarioRolRepo.findOne({
      where: { usuarioId, rolId },
    });
    if (existing) {
      throw new BadRequestException('El usuario ya tiene este rol asignado');
    }
    const rol = await this.rolRepo.findOne({ where: { id: rolId } });
    if (!rol)
      throw new BadRequestException(`Rol con ID ${rolId} no encontrado`);

    const usuarioRol = this.usuarioRolRepo.create({
      usuarioId,
      rolId,
      asignadoBy: userId,
    });
    await this.usuarioRolRepo.save(usuarioRol);
  }

  async removeRol(usuarioId: number, rolId: number): Promise<void> {
    const usuarioRol = await this.usuarioRolRepo.findOne({
      where: { usuarioId, rolId },
    });
    if (!usuarioRol) {
      throw new BadRequestException('El usuario no tiene este rol asignado');
    }
    await this.usuarioRolRepo.remove(usuarioRol);
  }
}
