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
import { PermisosGuard } from '../../../common/guards/permisos.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { FindEventoDto } from '../dto/find-evento.dto';
import { FindProcesoDto } from '../dto/find-proceso.dto';
import { CreateEventoDto } from '../dto/create-evento.dto';
import {
  CreateProcesoDto,
  CreateProcesoSoporteDetalleDto,
} from '../dto/create-proceso.dto';
import { UpdateResolucionDto } from '../dto/update-resolucion.dto';
import { UpdateProcesoDto } from '../dto/update-proceso.dto';
import { UpdateCambioDomicilioDto } from '../dto/update-cambio-domicilio.dto';
import { CreateCambioDomicilioDto } from '../dto/create-cambio-domicilio.dto';
import { GestionarCambioDomicilioDto } from '../dto/gestionar-cambio-domicilio.dto';
import { EjecutarValidacionDto } from '../dto/validacion.dto';
import { CreateSoporteMotivoDto } from '../dto/create-soporte-motivo.dto';
import { CreateEventoCompletoDto } from '../dto/create-evento-completo.dto';
import { FinalizarEventoDto } from '../dto/finalizar-evento.dto';
import { CerrarProcesoDto } from '../dto/cerrar-proceso.dto';
import { ReagendarEventoDto } from '../dto/reagendar-evento.dto';
import { RequirePermiso } from '../../../common/decorators/require-permiso.decorator';
import { PERMISOS } from '../../../common/constants/permisos.constant';

@ApiTags('Eventos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermisosGuard)
@Controller()
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Get('eventos')
  @RequirePermiso(PERMISOS.EVENTO_LEER)
  @ApiOperation({
    summary: 'Listar eventos con filtros',
    description: 'Retorna lista paginada de eventos con filtros opcionales',
  })
  @ApiResponse({ status: 200, description: 'Lista de eventos' })
  async findAll(@Query() filters: FindEventoDto) {
    return this.eventoService.findAll(filters);
  }

  @Get('eventos/:id')
  @RequirePermiso(PERMISOS.EVENTO_LEER)
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
  @RequirePermiso(PERMISOS.EVENTO_CREAR)
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear un nuevo evento (genera validaciones automáticas)',
    description:
      'Crea un evento y genera sus validaciones automáticas según el tipo de evento',
  })
  @ApiResponse({ status: 201, description: 'Evento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({ type: CreateEventoDto })
  async create(@Body() dto: CreateEventoDto, @CurrentUser() user: JwtPayload) {
    return this.eventoService.create(dto, user.sub);
  }

  @Post('eventos/completo')
  @RequirePermiso(PERMISOS.EVENTO_CREAR)
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear uno o varios eventos con resolucion o agendamiento en lote',
    description:
      'Crea eventos, sus validaciones automaticas y, opcionalmente, los datos de resolucion o agendamiento asociados. Todo en una sola transaccion.',
  })
  @ApiResponse({ status: 201, description: 'Eventos creados exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({ type: [CreateEventoCompletoDto] })
  async createCompleto(
    @Body() dtos: CreateEventoCompletoDto[],
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.createCompleto(dtos, user.sub);
  }

  @Post('eventos/reagendar')
  @RequirePermiso(PERMISOS.EVENTO_CREAR)
  @HttpCode(201)
  @ApiOperation({
    summary: 'Reagendar el agendamiento de un evento',
    description:
      'Marca el agendamiento vigente anterior como NO_REALIZADO y crea un nuevo agendamiento para el mismo evento. No modifica el proceso en terreno.',
  })
  @ApiResponse({ status: 201, description: 'Agendamiento creado exitosamente' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @ApiBody({ type: ReagendarEventoDto })
  async reagendar(
    @Body() dto: ReagendarEventoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.reagendar(dto, user.sub);
  }

  @Put('eventos/:id')
  @RequirePermiso(PERMISOS.EVENTO_EDITAR)
  @ApiOperation({
    summary: 'Editar datos generales del evento',
    description: 'Actualiza los datos generales de un evento existente',
  })
  @ApiResponse({ status: 200, description: 'Evento actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del evento' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateEventoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.update(id, dto, user.sub);
  }

  @Post('eventos/:id/finalizar')
  @RequirePermiso(PERMISOS.EVENTO_VALIDAR)
  @ApiOperation({
    summary: 'Finalizar evento, proceso y agendamiento',
    description:
      'Cambia el estado del evento, el estado del agendamiento y marca el proceso como realizado/no realizado. Todo en una sola transacción atómica.',
  })
  @ApiResponse({
    status: 200,
    description: 'Evento finalizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Evento, proceso o agendamiento no encontrado',
  })
  @ApiResponse({
    status: 422,
    description: 'El proceso no tiene agendamiento asociado',
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del evento' })
  @ApiBody({ type: FinalizarEventoDto })
  async finalizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: FinalizarEventoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.finalizarEventoCompleto(id, dto, user.sub);
  }

  @Get('eventos/:id/validaciones')
  @RequirePermiso(PERMISOS.EVENTO_LEER)
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
  @RequirePermiso(PERMISOS.EVENTO_VALIDAR)
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
    @Body() dto: EjecutarValidacionDto,
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
  @RequirePermiso(PERMISOS.PROCESO_LEER)
  @ApiOperation({
    summary: 'Listar procesos en terreno',
    description:
      'Retorna lista paginada de procesos en terreno con filtros opcionales y sus agendamientos asociados',
  })
  @ApiResponse({ status: 200, description: 'Lista de procesos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'crsId', required: false, type: Number })
  @ApiQuery({ name: 'tecnicoId', required: false, type: Number })
  @ApiQuery({ name: 'tipoEventoId', required: false, type: Number })
  async findProcesos(@Query() filters: FindProcesoDto) {
    return this.eventoService.findAllProcesos(filters);
  }

  @Post('procesos')
  @RequirePermiso(PERMISOS.PROCESO_CERRAR)
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear un proceso en terreno desde un agendamiento',
    description:
      'Crea un nuevo proceso en terreno asociado al agendamiento indicado. El eventoId se resuelve automáticamente desde el agendamiento.',
  })
  @ApiResponse({ status: 201, description: 'Proceso creado exitosamente' })
  @ApiResponse({ status: 404, description: 'Agendamiento no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un proceso para el evento del agendamiento',
  })
  @ApiBody({ type: CreateProcesoDto })
  async createProceso(
    @Body() dto: CreateProcesoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.createProceso(dto, user.sub);
  }

  @Put('procesos/:agendamientoId')
  @RequirePermiso(PERMISOS.PROCESO_CERRAR)
  @ApiOperation({
    summary: 'Editar datos del proceso en terreno',
    description:
      'Actualiza los datos de un proceso en terreno (instalación, desinstalación, soporte). Todos los campos son opcionales — solo se actualizan los enviados.',
  })
  @ApiResponse({ status: 200, description: 'Proceso actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proceso no encontrado' })
  @ApiParam({
    name: 'agendamientoId',
    type: Number,
    description: 'ID del agendamiento/proceso',
  })
  @ApiBody({ type: UpdateProcesoDto })
  async updateProceso(
    @Param('agendamientoId', ParseIntPipe) agendamientoId: number,
    @Body() dto: UpdateProcesoDto,
  ) {
    return this.eventoService.updateProceso(agendamientoId, dto);
  }

  @Post('procesos/:agendamientoId/cerrar-completo')
  @RequirePermiso(PERMISOS.PROCESO_CERRAR)
  @ApiOperation({
    summary: 'Cerrar proceso completo (instalación/desinstalación)',
    description:
      'Cierra un proceso en terreno registrando resultado, dispositivos, hora de llegada y salida. ' +
      'Todo se ejecuta en una transacción atómica. Si se envían dispositivos, se reemplazan los existentes.',
  })
  @ApiResponse({ status: 200, description: 'Proceso cerrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proceso no encontrado' })
  @ApiParam({
    name: 'agendamientoId',
    type: Number,
    description: 'ID del agendamiento/proceso',
  })
  @ApiBody({ type: CerrarProcesoDto })
  async cerrarProcesoCompleto(
    @Param('agendamientoId', ParseIntPipe) agendamientoId: number,
    @Body() dto: CerrarProcesoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.cerrarProcesoCompleto(
      agendamientoId,
      dto,
      user.sub,
    );
  }

  @Post('procesos/:agendamientoId/soporte-detalle')
  @RequirePermiso(PERMISOS.PROCESO_CERRAR)
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
    name: 'agendamientoId',
    type: Number,
    description: 'ID del agendamiento/proceso',
  })
  async addSoporteDetalle(
    @Param('agendamientoId', ParseIntPipe) agendamientoId: number,
    @Body() dto: CreateProcesoSoporteDetalleDto,
  ) {
    return this.eventoService.addSoporteDetalle(agendamientoId, dto);
  }

  @Get('procesos/:agendamientoId/dispositivos-referencia')
  @RequirePermiso(PERMISOS.EVENTO_LEER)
  @ApiOperation({
    summary: 'Obtener dispositivos de referencia para soporte o desinstalación',
    description:
      'Retorna los dispositivos registrados en el proceso anterior más reciente para la misma persona y solicitud. ' +
      'Si existe al menos un SOPORTE completado, usa el último. Si no, usa la INSTALACIÓN. ' +
      'Válido para pre-cargar dispositivos al crear un proceso de soporte o desinstalación.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Dispositivos de referencia encontrados. El campo "fuente" indica si vienen de SOPORTE o INSTALACION.',
    schema: {
      type: 'object',
      properties: {
        fuente: {
          type: 'string',
          enum: ['SOPORTE', 'INSTALACION'],
          description: 'Origen de los dispositivos retornados',
        },
        agendamientoOrigenId: {
          type: 'number',
          description:
            'ID del agendamiento del proceso del que provienen los dispositivos',
        },
        fechaEjecucion: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          description: 'Fecha en que se ejecutó el proceso origen',
        },
        dispositivos: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              agendamientoId: { type: 'number' },
              numeroSerie: { type: 'string' },
              rolDispositivoId: { type: 'number' },
              talla: { type: 'string', nullable: true },
              observaciones: { type: 'string', nullable: true },
              entregado: { type: 'boolean', nullable: true },
              fechaRegistro: { type: 'string', format: 'date-time' },
              rolDispositivo: { type: 'object' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Agendamiento o proceso previo no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'El agendamiento no tiene persona asociada',
  })
  @ApiParam({
    name: 'agendamientoId',
    type: Number,
    description:
      'ID del agendamiento del evento de soporte o desinstalación actual',
  })
  async findDispositivosReferencia(
    @Param('agendamientoId', ParseIntPipe) agendamientoId: number,
  ) {
    return this.eventoService.findDispositivosReferencia(agendamientoId);
  }

  @Get('procesos/:agendamientoId/soporte-motivos')
  @RequirePermiso(PERMISOS.EVENTO_LEER)
  @ApiOperation({
    summary: 'Listar motivos de un soporte',
    description: 'Retorna los motivos asociados a un proceso de soporte',
  })
  @ApiResponse({ status: 200, description: 'Lista de motivos' })
  @ApiParam({
    name: 'agendamientoId',
    type: Number,
    description: 'ID del agendamiento/proceso de soporte',
  })
  async findSoporteMotivos(
    @Param('agendamientoId', ParseIntPipe) agendamientoId: number,
  ) {
    return this.eventoService.findSoporteMotivos(agendamientoId);
  }

  @Post('procesos/:agendamientoId/soporte-motivos')
  @RequirePermiso(PERMISOS.EVENTO_EDITAR)
  @HttpCode(201)
  @ApiOperation({
    summary: 'Agregar motivo a un soporte',
    description: 'Agrega un motivo de problema a un proceso de soporte',
  })
  @ApiResponse({ status: 201, description: 'Motivo agregado exitosamente' })
  @ApiResponse({ status: 404, description: 'Proceso no encontrado' })
  @ApiParam({
    name: 'agendamientoId',
    type: Number,
    description: 'ID del agendamiento/proceso de soporte',
  })
  @ApiBody({ type: CreateSoporteMotivoDto })
  async addSoporteMotivo(
    @Param('agendamientoId', ParseIntPipe) agendamientoId: number,
    @Body() dto: CreateSoporteMotivoDto,
  ) {
    return this.eventoService.addSoporteMotivo(agendamientoId, dto);
  }

  @Put('procesos/:agendamientoId/soporte-motivos/:motivoId')
  @RequirePermiso(PERMISOS.EVENTO_EDITAR)
  @ApiOperation({
    summary: 'Editar motivo de soporte',
    description: 'Actualiza un motivo de problema de un proceso de soporte',
  })
  @ApiResponse({ status: 200, description: 'Motivo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Motivo no encontrado' })
  @ApiParam({
    name: 'agendamientoId',
    type: Number,
    description: 'ID del agendamiento/proceso de soporte',
  })
  @ApiParam({ name: 'motivoId', type: Number, description: 'ID del motivo' })
  async updateSoporteMotivo(
    @Param('agendamientoId', ParseIntPipe) agendamientoId: number,
    @Param('motivoId', ParseIntPipe) motivoId: number,
    @Body() dto: CreateSoporteMotivoDto,
  ) {
    return this.eventoService.updateSoporteMotivo(
      motivoId,
      agendamientoId,
      dto,
    );
  }

  @Delete('procesos/:agendamientoId/soporte-motivos/:motivoId')
  @RequirePermiso(PERMISOS.EVENTO_EDITAR)
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar motivo de soporte',
    description: 'Elimina un motivo de problema de un proceso de soporte',
  })
  @ApiResponse({ status: 204, description: 'Motivo eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Motivo no encontrado' })
  @ApiParam({
    name: 'agendamientoId',
    type: Number,
    description: 'ID del agendamiento/proceso de soporte',
  })
  @ApiParam({ name: 'motivoId', type: Number, description: 'ID del motivo' })
  async deleteSoporteMotivo(
    @Param('agendamientoId', ParseIntPipe) agendamientoId: number,
    @Param('motivoId', ParseIntPipe) motivoId: number,
  ) {
    await this.eventoService.deleteSoporteMotivo(motivoId, agendamientoId);
  }

  @Put('resoluciones/:eventoId')
  @RequirePermiso(PERMISOS.EVENTO_EDITAR)
  @ApiOperation({
    summary: 'Editar datos de resolución judicial',
    description:
      'Actualiza los datos de una resolución judicial asociada a un evento. Todos los campos son opcionales — solo se actualizan los enviados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resolución actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Resolución no encontrada' })
  @ApiParam({ name: 'eventoId', type: Number, description: 'ID del evento' })
  @ApiBody({ type: UpdateResolucionDto })
  async updateResolucion(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: UpdateResolucionDto,
  ) {
    return this.eventoService.updateResolucion(eventoId, dto);
  }

  @Post('cambios-domicilio')
  @RequirePermiso(PERMISOS.EVENTO_CREAR)
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear evento de cambio de domicilio',
    description:
      'Crea un EVENTO de tipo CAMBIO_DOMICILIO en estado PENDIENTE junto con su registro en RESOLUCION_CAMBIO_DOMICILIO. El coordinador deberá gestionarlo posteriormente con el endpoint de gestión.',
  })
  @ApiBody({ type: CreateCambioDomicilioDto })
  @ApiResponse({ status: 201, description: 'Evento de cambio de domicilio creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o tipo de evento no configurado' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async createCambioDomicilio(
    @Body() dto: CreateCambioDomicilioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.createCambioDomicilio(dto, user.sub);
  }

  @Post('cambios-domicilio/:eventoId/gestionar')
  @RequirePermiso(PERMISOS.EVENTO_EDITAR)
  @ApiOperation({
    summary: 'Gestionar cambio de domicilio',
    description:
      'El coordinador aporta las nuevas zonas del domicilio. Se crea una copia de la solicitud original con las nuevas zonas, copiando delitos y víctimas. El evento pasa a estado COMPLETADO.',
  })
  @ApiParam({ name: 'eventoId', type: Number, description: 'ID del evento de tipo CAMBIO_DOMICILIO' })
  @ApiBody({ type: GestionarCambioDomicilioDto })
  @ApiResponse({ status: 200, description: 'Cambio de domicilio gestionado. Retorna el evento actualizado y la solicitud copia generada.' })
  @ApiResponse({ status: 400, description: 'El evento no es de tipo CAMBIO_DOMICILIO' })
  @ApiResponse({ status: 404, description: 'Evento o solicitud original no encontrada' })
  @ApiResponse({ status: 409, description: 'El evento no está en estado PENDIENTE o ya fue gestionado' })
  async gestionarCambioDomicilio(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: GestionarCambioDomicilioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.gestionarCambioDomicilio(eventoId, dto, user.sub);
  }

  @Put('cambios-domicilio/:eventoId')
  @RequirePermiso(PERMISOS.EVENTO_EDITAR)
  @ApiOperation({
    summary: 'Editar datos de cambio de domicilio',
    description:
      'Actualiza los datos de un cambio de domicilio asociado a un evento. Todos los campos son opcionales.',
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
  @ApiBody({ type: UpdateCambioDomicilioDto })
  async updateCambioDomicilio(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: UpdateCambioDomicilioDto,
  ) {
    return this.eventoService.updateCambioDomicilio(eventoId, dto);
  }

  @Get('eventos/trazabilidad-instalacion/:eventoId')
  @RequirePermiso(PERMISOS.EVENTO_LEER)
  @ApiOperation({
    summary: 'Trazabilidad de instalación para desinstalación',
    description:
      'Recibe el ID de un evento de DESINSTALACION y busca el evento de INSTALACION correspondiente ' +
      '(misma solicitud, misma persona según paraQuien). Retorna el evento, proceso, agendamiento y ' +
      'dispositivos de la instalación original.',
  })
  @ApiResponse({
    status: 200,
    description: 'Trazabilidad de instalación encontrada',
  })
  @ApiResponse({
    status: 400,
    description:
      'El evento no es de tipo DESINSTALACION o no tiene persona asociada',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el evento o su instalación correspondiente',
  })
  @ApiParam({
    name: 'eventoId',
    type: Number,
    description: 'ID del evento de DESINSTALACION',
  })
  async findTrazabilidadInstalacion(
    @Param('eventoId', ParseIntPipe) eventoId: number,
  ) {
    return this.eventoService.findTrazabilidadInstalacion(eventoId);
  }
}
