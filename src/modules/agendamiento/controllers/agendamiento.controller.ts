import {
  Controller,
  Get,
  Post,
  Put,
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
import { AgendamientoService } from '../services/agendamiento.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { FindAgendamientoDto } from '../dto/find-agendamiento.dto';
import { CreateAgendamientoDto } from '../dto/create-agendamiento.dto';
import { UpdateAgendamientoDto } from '../dto/update-agendamiento.dto';
import { UpdateEstadoAgendamientoDto } from '../dto/update-estado-agendamiento.dto';

@ApiTags('Agendamientos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agendamientos')
export class AgendamientoController {
  constructor(private readonly agendamientoService: AgendamientoService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar agendamientos con filtros',
    description:
      'Retorna lista paginada de agendamientos con filtros opcionales por tipo de evento, evento, asignado y estado',
  })
  @ApiResponse({ status: 200, description: 'Lista de agendamientos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'tipoEventoId',
    required: false,
    type: Number,
    description: 'Filtrar por tipo de evento ID',
  })
  @ApiQuery({
    name: 'eventoId',
    required: false,
    type: Number,
    description: 'Filtrar por evento ID',
  })
  @ApiQuery({
    name: 'asignadoA',
    required: false,
    type: Number,
    description: 'Filtrar por técnico asignado ID',
  })
  @ApiQuery({
    name: 'paraQuien',
    required: false,
    type: String,
    description: 'Filtrar por destinatario (CONDENADO o VICTIMA)',
  })
  @ApiQuery({
    name: 'estadoAgenda',
    required: false,
    type: String,
    description: 'Filtrar por estado de agenda',
  })
  async findAll(@Query() filters: FindAgendamientoDto) {
    return this.agendamientoService.findAll(filters);
  }

  @Get('calendario')
  @ApiOperation({
    summary: 'Vista calendario de agendamientos',
    description:
      'Retorna agendamientos en formato calendario para un rango de fechas',
  })
  @ApiResponse({
    status: 200,
    description: 'Agendamientos en formato calendario',
  })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String })
  async findCalendario(@Query() filters: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.agendamientoService.findCalendario(filters);
  }

  @Get('tecnicos/disponibles')
  @ApiOperation({
    summary: 'Consultar técnicos disponibles en rango',
    description: 'Retorna técnicos disponibles para una fecha y rango horario',
  })
  @ApiResponse({ status: 200, description: 'Lista de técnicos disponibles' })
  @ApiQuery({
    name: 'fecha',
    required: true,
    type: String,
    description: 'Fecha a consultar (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'horaDesde',
    required: false,
    type: String,
    description: 'Hora de inicio (HH:mm)',
  })
  @ApiQuery({
    name: 'horaHasta',
    required: false,
    type: String,
    description: 'Hora de término (HH:mm)',
  })
  async findTecnicosDisponibles(@Query('fecha') fecha: string) {
    return this.agendamientoService.findTecnicosDisponibles(fecha);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ver detalle de un agendamiento',
    description: 'Retorna el detalle completo de un agendamiento por su ID',
  })
  @ApiResponse({ status: 200, description: 'Detalle del agendamiento' })
  @ApiResponse({ status: 404, description: 'Agendamiento no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del agendamiento' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.agendamientoService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear un nuevo agendamiento',
    description: 'Crea un agendamiento asociado a un evento',
  })
  @ApiResponse({ status: 201, description: 'Agendamiento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(
    @Body() dto: CreateAgendamientoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agendamientoService.create(dto, user.sub);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar/reprogramar agendamiento',
    description: 'Actualiza los datos de un agendamiento existente',
  })
  @ApiResponse({
    status: 200,
    description: 'Agendamiento actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Agendamiento no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del agendamiento' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgendamientoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agendamientoService.update(id, dto, user.sub);
  }

  @Put(':id/estado')
  @ApiOperation({
    summary: 'Cambiar estado del agendamiento',
    description:
      'Actualiza el estado del agendamiento (EN_PROCESO, NO_REALIZADO, COMPLETADO, CANCELADO)',
  })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Agendamiento no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del agendamiento' })
  async updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoAgendamientoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.agendamientoService.updateEstado(id, dto, user.sub);
  }
}
