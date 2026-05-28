import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsuarioService } from '../services/usuario.service';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { FindUsuarioDto } from '../dto/find-usuario.dto';
import { AssignRolDto } from '../dto/assign-rol.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios con paginación y filtros', description: 'Retorna lista paginada de usuarios del sistema con filtros por búsqueda, rol y estado' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Registros por página (default: 20, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre, apellido, email o RUT' })
  @ApiQuery({ name: 'activo', required: false, type: Boolean, description: 'Filtrar por estado activo/inactivo' })
  @ApiQuery({ name: 'rolId', required: false, type: Number, description: 'Filtrar por ID de rol asignado' })
  @ApiResponse({ status: 200, description: 'Lista paginada de usuarios' })
  async findAll(@Query() filters: FindUsuarioDto) {
    return this.usuarioService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un usuario', description: 'Retorna los datos completos de un usuario incluyendo sus roles' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({ status: 200, description: 'Detalle del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOnePublic(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear un nuevo usuario', description: 'Registra un usuario en el sistema con sus datos y credenciales' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o email/RUT duplicado' })
  async create(@Body() dto: CreateUsuarioDto, @CurrentUser() user: JwtPayload) {
    return this.usuarioService.create(dto, user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos de un usuario', description: 'Modifica los datos de un usuario existente' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usuarioService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Desactivar usuario (soft delete)', description: 'Marca al usuario como eliminado sin borrar sus registros' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({ status: 204, description: 'Usuario desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    await this.usuarioService.softDelete(id, user.sub);
  }

  @Post(':id/roles')
  @HttpCode(201)
  @ApiOperation({ summary: 'Asignar un rol al usuario', description: 'Agrega un rol a la lista de roles del usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiResponse({ status: 201, description: 'Rol asignado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  async assignRol(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRolDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usuarioService.assignRol(id, dto.rolId, user.sub);
  }

  @Delete(':id/roles/:rolId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover un rol del usuario', description: 'Quita un rol específico de la lista de roles del usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: Number })
  @ApiParam({ name: 'rolId', description: 'ID del rol a remover', type: Number })
  @ApiResponse({ status: 204, description: 'Rol removido exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario o rol no encontrado' })
  async removeRol(
    @Param('id', ParseIntPipe) id: number,
    @Param('rolId', ParseIntPipe) rolId: number,
  ) {
    await this.usuarioService.removeRol(id, rolId);
  }
}
