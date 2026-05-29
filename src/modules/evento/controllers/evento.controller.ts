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
  ApiBody,
} from '@nestjs/swagger';
import { EventoService } from '../services/evento.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateEventoDto } from '../dto/create-evento.dto';
import { EjecutarValidacionDto } from '../dto/validacion.dto';
import { CreateSoporteMotivoDto } from '../dto/create-soporte-motivo.dto';

@ApiTags('Eventos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Get('eventos')
  @ApiOperation({
    summary: 'Listar eventos con filtros',
    description: 'Retorna lista paginada de eventos con filtros opcionales',
  })
  @ApiResponse({ status: 200, description: 'Lista de eventos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'solicitudId', required: false, type: Number })
  @ApiQuery({ name: 'tipoEventoId', required: false, type: Number })
  @ApiQuery({ name: 'estadoEvento', required: false, type: String })
  @ApiQuery({ name: 'asignadoA', required: false, type: Number })
  async findAll(@Query() filters: PaginationDto) {
    return this.eventoService.findAll(filters);
  }

  @Get('eventos/:id')
  @ApiOperation({
    summary: 'Ver detalle de un evento',
    description: 'Retorna el detalle completo de un evento por su ID',
  })
  @ApiResponse({ status: 200, description: 'Detalle del evento' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del evento' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventoService.findOne(id);
  }

  @Post('eventos')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear un nuevo evento (genera validaciones automáticas)',
    description:
      'Crea un evento y genera sus validaciones automáticas según el tipo de evento',
  })
  @ApiResponse({ status: 201, description: 'Evento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({ type: CreateEventoDto })
  async create(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.eventoService.create(dto, user.sub);
  }

  @Put('eventos/:id')
  @ApiOperation({
    summary: 'Editar datos generales del evento',
    description: 'Actualiza los datos generales de un evento existente',
  })
  @ApiResponse({ status: 200, description: 'Evento actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del evento' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.update(id, dto, user.sub);
  }

  @Get('eventos/:id/validaciones')
  @ApiOperation({
    summary: 'Ver validaciones del evento',
    description: 'Retorna las validaciones asociadas a un evento',
  })
  @ApiResponse({ status: 200, description: 'Lista de validaciones' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del evento' })
  async findValidaciones(@Param('id', ParseIntPipe) id: number) {
    return this.eventoService.findValidaciones(id);
  }

  @Post('eventos/:id/validaciones/:validacionId')
  @ApiOperation({
    summary: 'Ejecutar validación (aprobar/rechazar)',
    description: 'Ejecuta una validación específica de un evento',
  })
  @ApiResponse({
    status: 200,
    description: 'Validación ejecutada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Evento o validación no encontrada',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del evento' })
  @ApiParam({
    name: 'validacionId',
    type: Number,
    description: 'ID de la validación',
  })
  @ApiBody({ type: EjecutarValidacionDto })
  async ejecutarValidacion(
    @Param('id', ParseIntPipe) id: number,
    @Param('validacionId', ParseIntPipe) validacionId: number,
    @Body() dto: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.ejecutarValidacion(
      id,
      validacionId,
      dto,
      user.sub,
    );
  }

  @Get('procesos')
  @ApiOperation({
    summary: 'Listar procesos en terreno',
    description:
      'Retorna lista paginada de procesos en terreno con filtros opcionales',
  })
  @ApiResponse({ status: 200, description: 'Lista de procesos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findProcesos(@Query() filters: PaginationDto) {
    return this.eventoService.findAll(filters);
  }

  @Put('procesos/:eventoId')
  @ApiOperation({
    summary: 'Editar datos del proceso',
    description: 'Actualiza los datos de un proceso en terreno',
  })
  @ApiResponse({ status: 200, description: 'Proceso actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proceso no encontrado' })
  @ApiParam({
    name: 'eventoId',
    type: Number,
    description: 'ID del evento/proceso',
  })
  async updateProceso(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: any,
  ) {
    return this.eventoService.updateProceso(eventoId, dto);
  }

  @Post('procesos/:eventoId/cerrar')
  @ApiOperation({
    summary: 'Cerrar proceso (realizado/no realizado)',
    description: 'Cierra un proceso en terreno indicando su resultado',
  })
  @ApiResponse({ status: 200, description: 'Proceso cerrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proceso no encontrado' })
  @ApiParam({
    name: 'eventoId',
    type: Number,
    description: 'ID del evento/proceso',
  })
  async cerrarProceso(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.cerrarProceso(eventoId, dto, user.sub);
  }

  @Post('procesos/:eventoId/soporte-detalle')
  @ApiOperation({
    summary: 'Agregar detalle de soporte técnico',
    description: 'Agrega un detalle de soporte técnico a un proceso',
  })
  @ApiResponse({
    status: 201,
    description: 'Detalle de soporte agregado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Proceso no encontrado' })
  @ApiParam({
    name: 'eventoId',
    type: Number,
    description: 'ID del evento/proceso',
  })
  async addSoporteDetalle(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: any,
  ) {
    return this.eventoService.addSoporteDetalle(eventoId, dto);
  }

  @Get('procesos/:eventoId/soporte-motivos')
  @ApiOperation({
    summary: 'Listar motivos de un soporte',
    description: 'Retorna los motivos asociados a un proceso de soporte',
  })
  @ApiResponse({ status: 200, description: 'Lista de motivos' })
  @ApiParam({
    name: 'eventoId',
    type: Number,
    description: 'ID del evento/proceso de soporte',
  })
  async findSoporteMotivos(@Param('eventoId', ParseIntPipe) eventoId: number) {
    return this.eventoService.findSoporteMotivos(eventoId);
  }

  @Post('procesos/:eventoId/soporte-motivos')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Agregar motivo a un soporte',
    description: 'Agrega un motivo de problema a un proceso de soporte',
  })
  @ApiResponse({ status: 201, description: 'Motivo agregado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proceso no encontrado' })
  @ApiParam({
    name: 'eventoId',
    type: Number,
    description: 'ID del evento/proceso de soporte',
  })
  @ApiBody({ type: CreateSoporteMotivoDto })
  async addSoporteMotivo(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: CreateSoporteMotivoDto,
  ) {
    return this.eventoService.addSoporteMotivo(eventoId, dto);
  }

  @Put('procesos/:eventoId/soporte-motivos/:motivoId')
  @ApiOperation({
    summary: 'Editar motivo de soporte',
    description: 'Actualiza un motivo de problema de un proceso de soporte',
  })
  @ApiResponse({ status: 200, description: 'Motivo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Motivo no encontrado' })
  @ApiParam({
    name: 'eventoId',
    type: Number,
    description: 'ID del evento/proceso de soporte',
  })
  @ApiParam({ name: 'motivoId', type: Number, description: 'ID del motivo' })
  async updateSoporteMotivo(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Param('motivoId', ParseIntPipe) motivoId: number,
    @Body() dto: CreateSoporteMotivoDto,
  ) {
    return this.eventoService.updateSoporteMotivo(motivoId, eventoId, dto);
  }

  @Delete('procesos/:eventoId/soporte-motivos/:motivoId')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar motivo de soporte',
    description: 'Elimina un motivo de problema de un proceso de soporte',
  })
  @ApiResponse({ status: 204, description: 'Motivo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Motivo no encontrado' })
  @ApiParam({
    name: 'eventoId',
    type: Number,
    description: 'ID del evento/proceso de soporte',
  })
  @ApiParam({ name: 'motivoId', type: Number, description: 'ID del motivo' })
  async deleteSoporteMotivo(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Param('motivoId', ParseIntPipe) motivoId: number,
  ) {
    await this.eventoService.deleteSoporteMotivo(motivoId, eventoId);
  }

  @Put('resoluciones/:eventoId')
  @ApiOperation({
    summary: 'Editar datos de resolución judicial',
    description:
      'Actualiza los datos de una resolución judicial asociada a un evento',
  })
  @ApiResponse({
    status: 200,
    description: 'Resolución actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Resolución no encontrada' })
  @ApiParam({ name: 'eventoId', type: Number, description: 'ID del evento' })
  async updateResolucion(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: any,
  ) {
    return this.eventoService.updateResolucion(eventoId, dto);
  }

  @Put('cambios-domicilio/:eventoId')
  @ApiOperation({
    summary: 'Editar datos de cambio de domicilio',
    description:
      'Actualiza los datos de un cambio de domicilio asociado a una resolución',
  })
  @ApiResponse({
    status: 200,
    description: 'Cambio de domicilio actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Cambio de domicilio no encontrado',
  })
  @ApiParam({ name: 'eventoId', type: Number, description: 'ID del evento' })
  async updateCambioDomicilio(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: any,
  ) {
    return this.eventoService.updateCambioDomicilio(eventoId, dto);
  }
}
