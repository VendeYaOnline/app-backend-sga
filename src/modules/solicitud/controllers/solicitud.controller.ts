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
import { SolicitudService } from '../services/solicitud.service';
import { CreateSolicitudDto } from '../dto/create-solicitud.dto';
import { UpdateSolicitudDto } from '../dto/update-solicitud.dto';
import { FindSolicitudDto } from '../dto/find-solicitud.dto';
import { TransicionEstadoDto } from '../dto/transicion-estado.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Solicitudes IFT')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('solicitudes')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar solicitudes IFT con filtros',
    description:
      'Retorna lista paginada de solicitudes con filtros por estado, RUC, RIT, condenado, CRS, usuario asignado y fechas',
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
    name: 'rutCondenado',
    required: false,
    type: String,
    description: 'Filtrar por RUT del condenado (búsqueda parcial)',
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
  @ApiResponse({ status: 200, description: 'Lista paginada de solicitudes' })
  async findAll(@Query() filters: FindSolicitudDto) {
    return this.solicitudService.findAll(filters);
  }

  @Get(':id')
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

  @Post()
  @HttpCode(201)
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
  async create(
    @Body() dto: CreateSolicitudDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.create(dto, user.sub);
  }

  @Put(':id')
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
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSolicitudDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
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
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransicionEstadoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.cambiarEstado(id, dto, user.sub, user.roles);
  }

  @Get(':id/historial')
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
  async getTransicionesPermitidas(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.getTransicionesPermitidas(id, user.roles);
  }

  @Get(':id/zonas')
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
    @Body() dto: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.addZona(id, dto, user.sub);
  }

  @Put(':id/zonas/:zonaId')
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
    @Body() dto: any,
  ) {
    return this.solicitudService.updateZona(id, zonaId, dto);
  }

  @Delete(':id/zonas/:zonaId')
  @HttpCode(204)
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
  ) {
    await this.solicitudService.deleteZona(id, zonaId);
  }

  @Put(':id/zonas/:zonaId/validar')
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
    @Body() dto: any,
  ) {
    return this.solicitudService.addSolicitante(id, dto);
  }

  @Put(':id/solicitantes/:solicitanteId')
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
    @Body() dto: any,
  ) {
    return this.solicitudService.updateSolicitante(id, solicitanteId, dto);
  }

  @Delete(':id/solicitantes/:solicitanteId')
  @HttpCode(204)
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
    @Body() dto: { victimaId: number; radioProhibicionMetros?: number },
  ) {
    return this.solicitudService.addVictima(
      id,
      dto.victimaId,
      dto.radioProhibicionMetros,
    );
  }

  @Delete(':id/victimas/:victimaId')
  @HttpCode(204)
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
    @Body() dto: { delitoId: number },
  ) {
    return this.solicitudService.addDelito(id, dto.delitoId);
  }

  @Delete(':id/delitos/:delitoId')
  @HttpCode(204)
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
    @Body() dto: { tipoFactibilidadId: number; motivoNoFactibleId?: number },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.emitirFactibilidad(id, {
      ...dto,
      emitidoPor: user.sub,
    });
  }

  @Get(':id/factibilidad')
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

  @Get(':id/sentencia')
  @ApiOperation({
    summary: 'Ver datos de sentencia asociada',
    description: 'Retorna la sentencia judicial vinculada a la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({ status: 200, description: 'Datos de la sentencia' })
  @ApiResponse({
    status: 404,
    description: 'Solicitud o sentencia no encontrada',
  })
  async findSentencia(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findSentencia(id);
  }

  @Put(':id/sentencia')
  @ApiOperation({
    summary: 'Crear/actualizar sentencia de la solicitud',
    description:
      'Crea o actualiza los datos de la sentencia judicial asociada a la solicitud',
  })
  @ApiParam({ name: 'id', description: 'ID de la solicitud', type: Number })
  @ApiResponse({ status: 200, description: 'Sentencia guardada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async upsertSentencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.solicitudService.upsertSentencia(id, dto);
  }
}
