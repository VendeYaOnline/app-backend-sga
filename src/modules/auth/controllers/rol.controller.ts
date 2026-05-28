import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatRol } from '../entities/cat-rol.entity';
import { CatPermiso } from '../entities/cat-permiso.entity';
import { RolPermiso } from '../entities/rol-permiso.entity';
import { CreateRolDto } from '../dto/create-rol.dto';
import { UpdateRolDto } from '../dto/update-rol.dto';
import { AssignPermisosDto } from '../dto/assign-permisos.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Roles y Permisos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolController {
  constructor(
    @InjectRepository(CatRol)
    private readonly rolRepo: Repository<CatRol>,
    @InjectRepository(CatPermiso)
    private readonly permisoRepo: Repository<CatPermiso>,
    @InjectRepository(RolPermiso)
    private readonly rolPermisoRepo: Repository<RolPermiso>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los roles', description: 'Retorna la lista completa de roles del sistema ordenados alfabéticamente' })
  @ApiResponse({ status: 200, description: 'Lista de roles' })
  async findAllRoles() {
    return this.rolRepo.find({ order: { nombreRol: 'ASC' } });
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear un nuevo rol', description: 'Crea un rol con su código, nombre y descripción' })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o código duplicado' })
  async createRol(@Body() dto: CreateRolDto) {
    const rol = this.rolRepo.create(dto);
    return this.rolRepo.save(rol);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un rol', description: 'Modifica el nombre o descripción de un rol existente' })
  @ApiParam({ name: 'id', description: 'ID del rol', type: Number })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async updateRol(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRolDto) {
    const rol = await this.rolRepo.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    Object.assign(rol, dto);
    return this.rolRepo.save(rol);
  }

  @Get(':id/permisos')
  @ApiOperation({ summary: 'Ver permisos asignados a un rol', description: 'Retorna la lista de permisos que tiene asignados el rol' })
  @ApiParam({ name: 'id', description: 'ID del rol', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de permisos del rol' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async findPermisosByRol(@Param('id', ParseIntPipe) id: number) {
    return this.rolPermisoRepo.find({
      where: { rolId: id },
      relations: { permiso: true },
    });
  }

  @Post(':id/permisos')
  @ApiOperation({ summary: 'Asignar permisos a un rol (reemplaza existentes)', description: 'Reemplaza todos los permisos actuales del rol por la nueva lista enviada' })
  @ApiParam({ name: 'id', description: 'ID del rol', type: Number })
  @ApiResponse({ status: 201, description: 'Permisos asignados exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async assignPermisos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignPermisosDto,
  ) {
    await this.rolPermisoRepo.delete({ rolId: id });
    const rolPermisos = dto.permisoIds.map((permisoId) =>
      this.rolPermisoRepo.create({ rolId: id, permisoId }),
    );
    return this.rolPermisoRepo.save(rolPermisos);
  }

  @Get('/all/permisos')
  @ApiOperation({ summary: 'Listar todos los permisos disponibles', description: 'Retorna el catálogo completo de permisos del sistema' })
  @ApiResponse({ status: 200, description: 'Lista de permisos disponibles' })
  async findAllPermisos() {
    return this.permisoRepo.find({ order: { codigo: 'ASC' } });
  }
}
