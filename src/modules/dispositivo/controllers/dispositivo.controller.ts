import {
  Controller, Get, Post, Body, Param, Query,
  ParseIntPipe, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DispositivoService } from '../services/dispositivo.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateDispositivoDto } from '../dto/create-dispositivo.dto';
import { CreateProcesoAccesorioDto } from '../dto/create-proceso-accesorio.dto';
import { CreateProcesoDispositivoDto } from '../dto/create-proceso-dispositivo.dto';

@ApiTags('Dispositivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DispositivoController {
  constructor(private readonly dispositivoService: DispositivoService) {}

  @Get('dispositivos')
  @ApiOperation({ summary: 'Listar dispositivos con filtros', description: 'Retorna lista paginada de dispositivos con búsqueda opcional' })
  @ApiResponse({ status: 200, description: 'Lista de dispositivos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAllDispositivos(@Query() filters: PaginationDto) {
    return this.dispositivoService.findAllDispositivos(filters);
  }

  @Get('dispositivos/:id')
  @ApiOperation({ summary: 'Ver detalle de un dispositivo', description: 'Retorna el detalle completo de un dispositivo por su ID' })
  @ApiResponse({ status: 200, description: 'Detalle del dispositivo' })
  @ApiResponse({ status: 404, description: 'Dispositivo no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del dispositivo' })
  async findDispositivo(@Param('id', ParseIntPipe) id: number) {
    return this.dispositivoService.findDispositivo(id);
  }

  @Post('dispositivos')
  @HttpCode(201)
  @ApiOperation({ summary: 'Registrar un nuevo dispositivo', description: 'Registra un nuevo dispositivo en el inventario' })
  @ApiResponse({ status: 201, description: 'Dispositivo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async createDispositivo(@Body() dto: CreateDispositivoDto) {
    return this.dispositivoService.createDispositivo(dto);
  }

  @Get('procesos/:eventoId/accesorios')
  @ApiOperation({ summary: 'Listar accesorios de un proceso', description: 'Retorna los accesorios asociados a un proceso en terreno' })
  @ApiResponse({ status: 200, description: 'Lista de accesorios del proceso' })
  @ApiResponse({ status: 404, description: 'Proceso no encontrado' })
  @ApiParam({ name: 'eventoId', type: Number, description: 'ID del evento/proceso' })
  async findAccesorios(@Param('eventoId', ParseIntPipe) eventoId: number) {
    return this.dispositivoService.findAccesoriosByEvento(eventoId);
  }

  @Post('procesos/:eventoId/accesorios')
  @HttpCode(201)
  @ApiOperation({ summary: 'Agregar accesorio a un proceso', description: 'Asocia un nuevo accesorio a un proceso en terreno' })
  @ApiResponse({ status: 201, description: 'Accesorio agregado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proceso no encontrado' })
  @ApiParam({ name: 'eventoId', type: Number, description: 'ID del evento/proceso' })
  async createAccesorio(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: CreateProcesoAccesorioDto,
  ) {
    return this.dispositivoService.createAccesorio(eventoId, dto);
  }

  @Get('procesos/:eventoId/dispositivos')
  @ApiOperation({ summary: 'Historial de dispositivos en proceso', description: 'Retorna el historial de dispositivos asociados a un proceso' })
  @ApiResponse({ status: 200, description: 'Historial de dispositivos' })
  @ApiResponse({ status: 404, description: 'Proceso no encontrado' })
  @ApiParam({ name: 'eventoId', type: Number, description: 'ID del evento/proceso' })
  async findDispositivosByEvento(@Param('eventoId', ParseIntPipe) eventoId: number) {
    return this.dispositivoService.findDispositivosByEvento(eventoId);
  }

  @Post('procesos/:eventoId/dispositivos')
  @HttpCode(201)
  @ApiOperation({ summary: 'Registrar dispositivo en proceso', description: 'Asocia un dispositivo a un proceso en terreno con un rol específico' })
  @ApiResponse({ status: 201, description: 'Dispositivo registrado en el proceso' })
  @ApiResponse({ status: 404, description: 'Proceso o dispositivo no encontrado' })
  @ApiParam({ name: 'eventoId', type: Number, description: 'ID del evento/proceso' })
  async createProcesoDispositivo(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: CreateProcesoDispositivoDto,
  ) {
    return this.dispositivoService.createProcesoDispositivo(eventoId, dto);
  }
}
