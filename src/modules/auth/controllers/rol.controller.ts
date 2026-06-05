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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreateRolDto } from '../dto/create-rol.dto';
import { UpdateRolDto } from '../dto/update-rol.dto';
import { AssignPermisosDto } from '../dto/assign-permisos.dto';
import { RolService } from '../services/rol.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePermiso } from '../../../common/decorators/require-permiso.decorator';
import { PERMISOS } from '../../../common/constants/permisos.constant';

@ApiTags('Roles y Permisos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Get()
  @RequirePermiso(PERMISOS.ROL_GESTIONAR)
  @ApiOperation({
    summary: 'Listar todos los roles',
    description:
      'Retorna la lista completa de roles del sistema ordenados alfabeticamente',
  })
  @ApiResponse({ status: 200, description: 'Lista de roles' })
  async findAllRoles() {
    return this.rolService.findAllRoles();
  }

  @Post()
  @HttpCode(201)
  @RequirePermiso(PERMISOS.ROL_GESTIONAR)
  @ApiBody({ type: CreateRolDto })
  @ApiOperation({
    summary: 'Crear un nuevo rol',
    description: 'Crea un rol con su codigo, nombre y descripcion',
  })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos invalidos o codigo duplicado',
  })
  async createRol(@Body() dto: CreateRolDto) {
    return this.rolService.createRol(dto);
  }

  @Put(':id')
  @RequirePermiso(PERMISOS.ROL_GESTIONAR)
  @ApiBody({ type: UpdateRolDto })
  @ApiOperation({
    summary: 'Actualizar un rol',
    description: 'Modifica el nombre o descripcion de un rol existente',
  })
  @ApiParam({ name: 'id', description: 'ID del rol', type: Number })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async updateRol(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRolDto,
  ) {
    return this.rolService.updateRol(id, dto);
  }

  @Get(':id/permisos')
  @RequirePermiso(PERMISOS.ROL_GESTIONAR)
  @ApiOperation({
    summary: 'Ver permisos asignados a un rol',
    description: 'Retorna la lista de permisos que tiene asignados el rol',
  })
  @ApiParam({ name: 'id', description: 'ID del rol', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de permisos del rol' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async findPermisosByRol(@Param('id', ParseIntPipe) id: number) {
    return this.rolService.findPermisosByRol(id);
  }

  @Post(':id/permisos')
  @HttpCode(201)
  @RequirePermiso(PERMISOS.ROL_GESTIONAR)
  @ApiBody({ type: AssignPermisosDto })
  @ApiOperation({
    summary: 'Asignar permisos a un rol (reemplaza existentes)',
    description:
      'Reemplaza todos los permisos actuales del rol por la nueva lista enviada',
  })
  @ApiParam({ name: 'id', description: 'ID del rol', type: Number })
  @ApiResponse({ status: 201, description: 'Permisos asignados exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  async assignPermisos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignPermisosDto,
  ) {
    return this.rolService.assignPermisos(id, dto);
  }

  @Get('/all/permisos')
  @RequirePermiso(PERMISOS.ROL_GESTIONAR)
  @ApiOperation({
    summary: 'Listar todos los permisos disponibles',
    description: 'Retorna el catalogo completo de permisos del sistema',
  })
  @ApiResponse({ status: 200, description: 'Lista de permisos disponibles' })
  async findAllPermisos() {
    return this.rolService.findAllPermisos();
  }
}
