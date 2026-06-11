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
import { SolicitudService } from '../services/solicitud.service';
import { CreateSolicitudDto } from '../dto/create-solicitud.dto';
import { UpdateSolicitudDto } from '../dto/update-solicitud.dto';
import { FindSolicitudDto } from '../dto/find-solicitud.dto';
import { TransicionEstadoDto } from '../dto/transicion-estado.dto';
import { CreateFactibilidadDto } from '../dto/create-factibilidad.dto';
import { AddVictimaDto } from '../dto/add-victima.dto';
import { CreateSolicitudDelitoSimpleDto } from '../dto/create-solicitud-delito-simple.dto';
import { CreateZonaDto } from '../dto/create-solicitud.dto';
import { UpdateZonaDto } from '../dto/update-zona.dto';
import { CreateSolicitanteDto } from '../dto/create-solicitante.dto';
import { UpdateSolicitanteDto } from '../dto/update-solicitante.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermisosGuard } from '../../../common/guards/permisos.guard';
import { RequirePermiso } from '../../../common/decorators/require-permiso.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { PERMISOS } from '../../../common/constants/permisos.constant';

@ApiTags('Solicitudes IFT')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermisosGuard)
@Controller('solicitudes')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Get()
  @RequirePermiso(PERMISOS.SOLICITUD_LEER)
  @ApiOperation({
    summary: 'Listar solicitudes IFT con filtros',
    description:
      'Retorna lista paginada de solicitudes con filtros por ID, estado, RUC, RIT, condenado, nombres del condenado, CRS, usuario asignado y fechas',
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
    name: 'id',
    required: false,
    type: Number,
    description: 'Filtrar por ID de la solicitud',
  })
  @ApiQuery({
    name: 'estadoId',
    required: false,
    type: Number,
    description: 'Filtrar por ID del estado actual de la solicitud',
  })
  @ApiQuery({
    name: 'rucCausa',
    required: false,
    type: String,
    description: 'Filtrar por RUC de la causa (búsqueda parcial)',
  })
  @ApiQuery({
    name: 'ritCausa',
    required: false,
    type: String,
    description: 'Filtrar por RIT de la causa (búsqueda parcial)',
  })
  @ApiQuery({
    name: 'condenadoId',
    required: false,
    type: Number,
    description: 'Filtrar por ID del condenado',
  })
  @ApiQuery({
    name: 'crsId',
    required: false,
    type: Number,
    description: 'Filtrar por ID del CRS',
  })
  @ApiQuery({
    name: 'asignadaA',
    required: false,
    type: Number,
    description: 'Filtrar por ID del usuario asignado',
  })
  @ApiQuery({
    name: 'origenCreacion',
    required: false,
    type: String,
    description: 'Filtrar por origen de creación de la solicitud',
  })
  @ApiQuery({
    name: 'nombresCondenado',
    required: false,
    type: String,
    description: 'Filtrar por nombres del condenado (búsqueda parcial)',
  })
  @ApiQuery({
    name: 'runCondenado',
    required: false,
    type: String,
    description: 'Filtrar por RUN del condenado (búsqueda parcial)',
  })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Filtrar desde fecha de creación (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Filtrar hasta fecha de creación (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description:
      'Columna por la cual ordenar (createdAt, updatedAt, estadoAt, rucCausa, ritCausa)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Dirección del ordenamiento (ASC o DESC, default: DESC)',
  })
  @ApiResponse({ status: 200, description: 'Lista paginada de solicitudes' })
  async findAll(@Query() filters: FindSolicitudDto) {
    return this.solicitudService.findAll(filters);
  }

  @Get(':id')
  @RequirePermiso(PERMISOS.SOLICITUD_LEER)
  @ApiOperation({
    summary: 'Obtener detalle completo de una solicitud',
    description:
      'Retorna la solicitud con todas sus relaciones: condenado, tribunal, zonas, delitos, víctimas y factibilidad',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({ status: 200, description: 'Detalle de la solicitud' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findOne(id);
  }

  @Get(':id/resumen')
  @RequirePermiso(PERMISOS.SOLICITUD_LEER)
  @ApiOperation({
    summary: 'Resumen completo de una solicitud',
    description:
      'Retorna la solicitud con todas sus instalaciones, soportes y desinstalaciones agrupados por tipo, incluyendo agendamientos, procesos y dispositivos asociados',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la solicitud' })
  @ApiResponse({
    status: 200,
    description: 'Resumen con instalaciones, soportes y desinstalaciones',
  })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async findResumen(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findResumen(id);
  }

  @Post()
  @HttpCode(201)
  @RequirePermiso(PERMISOS.SOLICITUD_CREAR)
  @ApiOperation({
    summary: 'Crear una nueva solicitud IFT (con zonas, delitos y víctimas)',
    description:
      'Crea una solicitud de intervención de fiscalización telemática con sus zonas, delitos asociados y víctimas vinculadas en una transacción',
  })
  @ApiResponse({ status: 201, description: 'Solicitud creada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o faltan campos requeridos',
  })
  @ApiBody({ type: CreateSolicitudDto })
  async create(
    @Body() dto: CreateSolicitudDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.create(dto, user.sub, undefined, user.roles);
  }

  @Put(':id')
  @RequirePermiso(PERMISOS.SOLICITUD_EDITAR)
  @ApiOperation({
    summary: 'Editar datos generales de la solicitud',
    description:
      'Modifica los datos básicos de una solicitud existente (tribunal, condenado, CRS, causas, etc.)',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Solicitud actualizada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiBody({ type: UpdateSolicitudDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSolicitudDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  @RequirePermiso(PERMISOS.SOLICITUD_ELIMINAR)
  @ApiOperation({
    summary: 'Anular solicitud (soft delete)',
    description:
      'Marca la solicitud como eliminada (anulada) sin borrar sus registros asociados',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({ status: 204, description: 'Solicitud anulada exitosamente' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.solicitudService.softDelete(id, user.sub);
  }

  @Post(':id/transicion')
  @RequirePermiso(PERMISOS.SOLICITUD_TRANSICIONAR)
  @ApiOperation({
    summary: 'Ejecutar transición de estado (state machine)',
    description:
      'Cambia el estado de la solicitud según la máquina de estados definida, validando reglas de transición',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Transición ejecutada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiResponse({
    status: 422,
    description: 'Transición no permitida por regla de negocio',
  })
  @ApiBody({ type: TransicionEstadoDto })
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransicionEstadoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.cambiarEstado(id, dto, user.sub, user.roles);
  }

  @Get(':id/historial')
  @RequirePermiso(PERMISOS.SOLICITUD_LEER)
  @ApiOperation({
    summary: 'Ver historial de cambios de estado',
    description:
      'Retorna el historial completo de transiciones de estado de la solicitud con fechas y usuarios responsables',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Historial de estados de la solicitud',
  })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async findHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findHistorial(id);
  }

  @Get(':id/transiciones-permitidas')
  @RequirePermiso(PERMISOS.SOLICITUD_LEER)
  @ApiOperation({
    summary: 'Consultar transiciones permitidas según estado y rol',
    description:
      'Retorna las transiciones de estado disponibles para el usuario autenticado según su rol y el estado actual de la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Lista de transiciones permitidas',
  })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async findTransicionesPermitidas(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.findTransicionesPermitidas(id, user.roles);
  }

  @Get(':id/zonas')
  @RequirePermiso(PERMISOS.SOLICITUD_LEER)
  @ApiOperation({
    summary: 'Listar zonas de la solicitud',
    description:
      'Retorna las zonas de inclusión y exclusión asociadas a la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de zonas de la solicitud' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async findZonas(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findZonas(id);
  }

  @Post(':id/zonas')
  @HttpCode(201)
  @RequirePermiso(PERMISOS.SOLICITUD_EDITAR)
  @ApiBody({ type: CreateZonaDto })
  @ApiOperation({
    summary: 'Agregar una zona (inclusión/exclusión)',
    description:
      'Agrega una zona geográfica de inclusión o exclusión a la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({ status: 201, description: 'Zona agregada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async addZona(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateZonaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.addZona(id, dto, user.sub);
  }

  @Put(':id/zonas/:zonaId')
  @RequirePermiso(PERMISOS.SOLICITUD_EDITAR)
  @ApiBody({ type: UpdateZonaDto })
  @ApiOperation({
    summary: 'Editar zona',
    description: 'Modifica los datos de una zona de la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiParam({ name: 'zonaId', description: 'ID de la zona', type: Number })
  @ApiResponse({ status: 200, description: 'Zona actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Solicitud o zona no encontrada' })
  async updateZona(
    @Param('id', ParseIntPipe) id: number,
    @Param('zonaId', ParseIntPipe) zonaId: number,
    @Body() dto: UpdateZonaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.updateZona(id, zonaId, dto, user.sub);
  }

  @Delete(':id/zonas/:zonaId')
  @HttpCode(204)
  @RequirePermiso(PERMISOS.SOLICITUD_EDITAR)
  @ApiOperation({
    summary: 'Eliminar zona',
    description: 'Elimina una zona geográfica de la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiParam({ name: 'zonaId', description: 'ID de la zona', type: Number })
  @ApiResponse({ status: 204, description: 'Zona eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Solicitud o zona no encontrada' })
  async deleteZona(
    @Param('id', ParseIntPipe) id: number,
    @Param('zonaId', ParseIntPipe) zonaId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.solicitudService.deleteZona(id, zonaId, user.sub);
  }

  @Put(':id/zonas/:zonaId/validar')
  @RequirePermiso(PERMISOS.SOLICITUD_EDITAR)
  @ApiOperation({
    summary: 'Marcar zona como validada',
    description:
      'Registra la validación de una zona geográfica por parte de un usuario',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiParam({ name: 'zonaId', description: 'ID de la zona', type: Number })
  @ApiResponse({ status: 200, description: 'Zona validada exitosamente' })
  @ApiResponse({ status: 404, description: 'Solicitud o zona no encontrada' })
  async validarZona(
    @Param('id', ParseIntPipe) id: number,
    @Param('zonaId', ParseIntPipe) zonaId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.validarZona(id, zonaId, user.sub);
  }

  @Get(':id/solicitantes')
  @RequirePermiso(PERMISOS.SOLICITUD_LEER)
  @ApiOperation({
    summary: 'Listar solicitantes',
    description: 'Retorna los solicitantes asociados a la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({ status: 200, description: 'Lista de solicitantes' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async findSolicitantes(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findSolicitantes(id);
  }

  @Post(':id/solicitantes')
  @HttpCode(201)
  @RequirePermiso(PERMISOS.SOLICITUD_EDITAR)
  @ApiBody({ type: CreateSolicitanteDto })
  @ApiOperation({
    summary: 'Agregar solicitante',
    description: 'Agrega un solicitante a la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({
    status: 201,
    description: 'Solicitante agregado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async addSolicitante(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSolicitanteDto,
  ) {
    return this.solicitudService.addSolicitante(id, dto);
  }

  @Put(':id/solicitantes/:solicitanteId')
  @RequirePermiso(PERMISOS.SOLICITUD_EDITAR)
  @ApiBody({ type: UpdateSolicitanteDto })
  @ApiOperation({
    summary: 'Editar solicitante',
    description: 'Modifica los datos de un solicitante de la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiParam({
    name: 'solicitanteId',
    description: 'ID del solicitante',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Solicitante actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({
    status: 404,
    description: 'Solicitud o solicitante no encontrado',
  })
  async updateSolicitante(
    @Param('id', ParseIntPipe) id: number,
    @Param('solicitanteId', ParseIntPipe) solicitanteId: number,
    @Body() dto: UpdateSolicitanteDto,
  ) {
    return this.solicitudService.updateSolicitante(id, solicitanteId, dto);
  }

  @Delete(':id/solicitantes/:solicitanteId')
  @HttpCode(204)
  @RequirePermiso(PERMISOS.SOLICITUD_EDITAR)
  @ApiOperation({
    summary: 'Remover solicitante',
    description: 'Quita un solicitante de la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiParam({
    name: 'solicitanteId',
    description: 'ID del solicitante',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Solicitante removido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud o solicitante no encontrado',
  })
  async removeSolicitante(
    @Param('id', ParseIntPipe) id: number,
    @Param('solicitanteId', ParseIntPipe) solicitanteId: number,
  ) {
    await this.solicitudService.removeSolicitante(id, solicitanteId);
  }

  @Post(':id/victimas')
  @HttpCode(201)
  @RequirePermiso(PERMISOS.SOLICITUD_EDITAR)
  @ApiBody({ type: AddVictimaDto })
  @ApiOperation({
    summary: 'Vincular víctima con radio de prohibición',
    description:
      'Asocia una víctima a la solicitud con un radio de prohibición en metros',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({ status: 201, description: 'Víctima vinculada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async addVictima(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddVictimaDto,
  ) {
    return this.solicitudService.addVictima(
      id,
      dto.victimaId,
      dto.radioProhibicionMetros,
    );
  }

  @Delete(':id/victimas/:victimaId')
  @HttpCode(204)
  @RequirePermiso(PERMISOS.SOLICITUD_EDITAR)
  @ApiOperation({
    summary: 'Desvincular víctima',
    description: 'Quita la vinculación de una víctima de la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiParam({
    name: 'victimaId',
    description: 'ID de la víctima',
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: 'Víctima desvinculada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Solicitud o víctima no encontrada',
  })
  async removeVictima(
    @Param('id', ParseIntPipe) id: number,
    @Param('victimaId', ParseIntPipe) victimaId: number,
  ) {
    await this.solicitudService.removeVictima(id, victimaId);
  }

  @Post(':id/delitos')
  @HttpCode(201)
  @RequirePermiso(PERMISOS.SOLICITUD_EDITAR)
  @ApiBody({ type: CreateSolicitudDelitoSimpleDto })
  @ApiOperation({
    summary: 'Asociar delito a la solicitud',
    description: 'Vincula un delito del catálogo a la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({ status: 201, description: 'Delito asociado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async addDelito(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateSolicitudDelitoSimpleDto,
  ) {
    return this.solicitudService.addDelito(id, dto.delitoId);
  }

  @Delete(':id/delitos/:delitoId')
  @HttpCode(204)
  @RequirePermiso(PERMISOS.SOLICITUD_EDITAR)
  @ApiOperation({
    summary: 'Desasociar delito',
    description: 'Quita la asociación de un delito de la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiParam({ name: 'delitoId', description: 'ID del delito', type: Number })
  @ApiResponse({ status: 204, description: 'Delito desasociado exitosamente' })
  @ApiResponse({ status: 404, description: 'Solicitud o delito no encontrado' })
  async removeDelito(
    @Param('id', ParseIntPipe) id: number,
    @Param('delitoId', ParseIntPipe) delitoId: number,
  ) {
    await this.solicitudService.removeDelito(id, delitoId);
  }

  @Post(':id/factibilidad')
  @HttpCode(201)
  @RequirePermiso(PERMISOS.SOLICITUD_EMITIR_FACTIBILIDAD)
  @ApiBody({ type: CreateFactibilidadDto })
  @ApiOperation({
    summary: 'Emitir informe de factibilidad técnica',
    description:
      'Registra el resultado del estudio de factibilidad técnica (factible o no factible) para la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({
    status: 201,
    description: 'Informe de factibilidad emitido exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async emitirFactibilidad(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateFactibilidadDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.emitirFactibilidad(id, {
      ...dto,
      emitidoPor: user.sub,
    });
  }

  @Get(':id/factibilidad')
  @RequirePermiso(PERMISOS.SOLICITUD_LEER)
  @ApiOperation({
    summary: 'Ver informe de factibilidad',
    description: 'Retorna el informe de factibilidad técnica de la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({ status: 200, description: 'Informe de factibilidad' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async findFactibilidad(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findFactibilidad(id);
  }
}
