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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PersonaService } from '../services/persona.service';
import { CreateVictimaDto } from '../dto/create-victima.dto';
import { UpdateVictimaDto } from '../dto/update-victima.dto';
import { CreateContactoDto } from '../dto/create-contacto.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Víctimas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('victimas')
export class VictimaController {
  constructor(private readonly personaService: PersonaService) {}

  @Get()
  @ApiOperation({
    summary: 'Buscar víctimas con filtros',
    description:
      'Retorna lista paginada de víctimas con filtros por búsqueda y RUT',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Registros por página (default: 20, max: 100)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Buscar por nombres, apellidos o RUT',
  })
  @ApiQuery({
    name: 'rutVictima',
    required: false,
    type: String,
    description: 'Filtrar por RUT de la víctima',
  })
  @ApiResponse({ status: 200, description: 'Lista paginada de víctimas' })
  async findAll(@Query() filters: PaginationDto) {
    return this.personaService.findVictimas(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de una víctima',
    description:
      'Retorna los datos completos de una víctima incluyendo sus contactos',
  })
  @ApiParam({ name: 'id', description: 'ID de la víctima', type: Number })
  @ApiResponse({ status: 200, description: 'Detalle de la víctima' })
  @ApiResponse({ status: 404, description: 'Víctima no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personaService.findVictimaById(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Registrar una nueva víctima',
    description:
      'Crea un registro de víctima con sus datos personales y de identificación',
  })
  @ApiResponse({ status: 201, description: 'Víctima creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o RUT duplicado' })
  async create(@Body() dto: CreateVictimaDto, @CurrentUser() user: JwtPayload) {
    return this.personaService.createVictima(dto, user.sub);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar datos de la víctima',
    description: 'Modifica los datos personales de una víctima existente',
  })
  @ApiParam({ name: 'id', description: 'ID de la víctima', type: Number })
  @ApiResponse({ status: 200, description: 'Víctima actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Víctima no encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVictimaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.personaService.updateVictima(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Desactivar víctima (soft delete)',
    description:
      'Marca a la víctima como eliminada sin borrar sus registros asociados',
  })
  @ApiParam({ name: 'id', description: 'ID de la víctima', type: Number })
  @ApiResponse({ status: 204, description: 'Víctima desactivada exitosamente' })
  @ApiResponse({ status: 404, description: 'Víctima no encontrada' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.personaService.softDeleteVictima(id, user.sub);
  }

  @Get(':id/contactos')
  @ApiOperation({
    summary: 'Listar contactos de la víctima',
    description:
      'Retorna los números de teléfono y contactos asociados a la víctima',
  })
  @ApiParam({ name: 'id', description: 'ID de la víctima', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de contactos de la víctima' })
  @ApiResponse({ status: 404, description: 'Víctima no encontrada' })
  async findContactos(@Param('id', ParseIntPipe) id: number) {
    return this.personaService.findContactosByVictima(id);
  }

  @Post(':id/contactos')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Agregar teléfono/contacto a la víctima',
    description:
      'Registra un nuevo número de teléfono o contacto para la víctima',
  })
  @ApiParam({ name: 'id', description: 'ID de la víctima', type: Number })
  @ApiResponse({ status: 201, description: 'Contacto agregado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Víctima no encontrada' })
  async addContacto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateContactoDto,
  ) {
    return this.personaService.addContactoVictima(id, dto);
  }

  @Delete(':id/contactos/:contactoId')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar contacto de la víctima',
    description: 'Quita un número de teléfono o contacto de la víctima',
  })
  @ApiParam({ name: 'id', description: 'ID de la víctima', type: Number })
  @ApiParam({
    name: 'contactoId',
    description: 'ID del contacto',
    type: Number,
  })
  @ApiResponse({ status: 204, description: 'Contacto eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Víctima o contacto no encontrado' })
  async removeContacto(
    @Param('id', ParseIntPipe) id: number,
    @Param('contactoId', ParseIntPipe) contactoId: number,
  ) {
    await this.personaService.removeContactoVictima(id, contactoId);
  }
}
