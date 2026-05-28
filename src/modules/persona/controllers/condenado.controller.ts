import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PersonaService } from '../services/persona.service';
import { CreateCondenadoDto } from '../dto/create-condenado.dto';
import { UpdateCondenadoDto } from '../dto/update-condenado.dto';
import { FindCondenadoDto } from '../dto/find-condenado.dto';
import { CreateContactoDto } from '../dto/create-contacto.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Condenados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('condenados')
export class CondenadoController {
  constructor(private readonly personaService: PersonaService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar condenados con filtros', description: 'Retorna lista paginada de condenados con filtros por búsqueda, RUT, pasaporte y CRS' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Registros por página (default: 20, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombres, apellidos o RUT' })
  @ApiQuery({ name: 'rutCondenado', required: false, type: String, description: 'Filtrar por RUT del condenado' })
  @ApiQuery({ name: 'pasaporte', required: false, type: String, description: 'Filtrar por número de pasaporte' })
  @ApiQuery({ name: 'crsId', required: false, type: Number, description: 'Filtrar por CRS asignado' })
  @ApiResponse({ status: 200, description: 'Lista paginada de condenados' })
  async findAll(@Query() filters: FindCondenadoDto) {
    return this.personaService.findCondenados(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un condenado', description: 'Retorna los datos completos de un condenado incluyendo contactos' })
  @ApiParam({ name: 'id', description: 'ID del condenado', type: Number })
  @ApiResponse({ status: 200, description: 'Detalle del condenado' })
  @ApiResponse({ status: 404, description: 'Condenado no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personaService.findCondenadoById(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Registrar un nuevo condenado', description: 'Crea un registro de condenado con sus datos personales y de identificación' })
  @ApiResponse({ status: 201, description: 'Condenado creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o RUT duplicado' })
  async create(@Body() dto: CreateCondenadoDto, @CurrentUser() user: JwtPayload) {
    return this.personaService.createCondenado(dto, user.sub);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos del condenado', description: 'Modifica los datos personales de un condenado existente' })
  @ApiParam({ name: 'id', description: 'ID del condenado', type: Number })
  @ApiResponse({ status: 200, description: 'Condenado actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Condenado no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCondenadoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.personaService.updateCondenado(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Desactivar condenado (soft delete)', description: 'Marca al condenado como eliminado sin borrar sus registros asociados' })
  @ApiParam({ name: 'id', description: 'ID del condenado', type: Number })
  @ApiResponse({ status: 204, description: 'Condenado desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Condenado no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    await this.personaService.softDeleteCondenado(id, user.sub);
  }

  @Get(':id/contactos')
  @ApiOperation({ summary: 'Listar contactos del condenado', description: 'Retorna los números de teléfono y contactos asociados al condenado' })
  @ApiParam({ name: 'id', description: 'ID del condenado', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de contactos del condenado' })
  @ApiResponse({ status: 404, description: 'Condenado no encontrado' })
  async findContactos(@Param('id', ParseIntPipe) id: number) {
    return this.personaService.findContactosByCondenado(id);
  }

  @Post(':id/contactos')
  @HttpCode(201)
  @ApiOperation({ summary: 'Agregar teléfono/contacto al condenado', description: 'Registra un nuevo número de teléfono o contacto para el condenado' })
  @ApiParam({ name: 'id', description: 'ID del condenado', type: Number })
  @ApiResponse({ status: 201, description: 'Contacto agregado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Condenado no encontrado' })
  async addContacto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateContactoDto,
  ) {
    return this.personaService.addContactoCondenado(id, dto);
  }

  @Delete(':id/contactos/:contactoId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar contacto del condenado', description: 'Quita un número de teléfono o contacto del condenado' })
  @ApiParam({ name: 'id', description: 'ID del condenado', type: Number })
  @ApiParam({ name: 'contactoId', description: 'ID del contacto', type: Number })
  @ApiResponse({ status: 204, description: 'Contacto eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Condenado o contacto no encontrado' })
  async removeContacto(
    @Param('id', ParseIntPipe) id: number,
    @Param('contactoId', ParseIntPipe) contactoId: number,
  ) {
    await this.personaService.removeContactoCondenado(id, contactoId);
  }
}
