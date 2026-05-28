import {
  Controller, Get, Post, Body, Param, Query,
  ParseIntPipe, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { PjudService } from '../services/pjud.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { RecepcionIftDto } from '../dto/recepcion-ift.dto';
import { RecepcionDecretoDto } from '../dto/recepcion-decreto.dto';
import { PjudEnvioDto } from '../dto/pjud-envio.dto';

@ApiTags('PJUD')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PjudController {
  constructor(private readonly pjudService: PjudService) {}

  @Post('recepcion-ift')
  @HttpCode(201)
  @ApiOperation({ summary: 'Recepcionar IFT desde PJUD', description: 'Recibe una solicitud IFT desde el Poder Judicial y la registra' })
  @ApiResponse({ status: 201, description: 'IFT recibida y registrada' })
  @ApiBody({ type: RecepcionIftDto })
  async recepcionIft(@Body() dto: any) {
    return this.pjudService.recepcionIft(dto);
  }

  @Post('recepcion-decreto')
  @HttpCode(201)
  @ApiOperation({ summary: 'Recepcionar decreto desde PJUD', description: 'Recibe un decreto judicial desde el Poder Judicial y lo registra' })
  @ApiResponse({ status: 201, description: 'Decreto recibido y registrado' })
  @ApiBody({ type: RecepcionDecretoDto })
  async recepcionDecreto(@Body() dto: any) {
    return this.pjudService.recepcionDecreto(dto);
  }

  @Get('consulta-ift/:crrId')
  @ApiOperation({ summary: 'Consultar IFT por CRR ID', description: 'Consulta el historial de llamadas IFT por su CRR ID' })
  @ApiResponse({ status: 200, description: 'Historial de llamadas IFT' })
  @ApiResponse({ status: 404, description: 'No se encontraron registros' })
  @ApiParam({ name: 'crrId', type: Number, description: 'ID CRR de la solicitud' })
  async consultaIft(@Param('crrId', ParseIntPipe) crrId: number) {
    return this.pjudService.consultaIft(crrId);
  }

  @Post('enviar-factibilidad/:solicitudId')
  @HttpCode(201)
  @ApiOperation({ summary: 'Enviar factibilidad al PJUD', description: 'Envía el informe de factibilidad de una solicitud al Poder Judicial' })
  @ApiResponse({ status: 201, description: 'Factibilidad enviada exitosamente' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiParam({ name: 'solicitudId', type: Number, description: 'ID de la solicitud' })
  @ApiBody({ type: PjudEnvioDto })
  async enviarFactibilidad(@Param('solicitudId', ParseIntPipe) solicitudId: number, @Body() dto: any) {
    return this.pjudService.enviarFactibilidad(solicitudId, dto);
  }

  @Post('enviar-incumplimiento/:solicitudId')
  @HttpCode(201)
  @ApiOperation({ summary: 'Enviar incumplimiento al PJUD', description: 'Envía el informe de incumplimiento de una solicitud al Poder Judicial' })
  @ApiResponse({ status: 201, description: 'Incumplimiento enviado exitosamente' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiParam({ name: 'solicitudId', type: Number, description: 'ID de la solicitud' })
  @ApiBody({ type: PjudEnvioDto })
  async enviarIncumplimiento(@Param('solicitudId', ParseIntPipe) solicitudId: number, @Body() dto: any) {
    return this.pjudService.enviarIncumplimiento(solicitudId, dto);
  }

  @Post('enviar-alarma-cenco')
  @HttpCode(201)
  @ApiOperation({ summary: 'Enviar alarma CENCO al PJUD', description: 'Envía una alarma CENCO al Poder Judicial' })
  @ApiResponse({ status: 201, description: 'Alarma CENCO enviada exitosamente' })
  @ApiBody({ type: PjudEnvioDto })
  async enviarAlarmaCenco(@Body() dto: any) {
    return this.pjudService.enviarAlarmaCenco(dto);
  }

  @Get('llamadas')
  @ApiOperation({ summary: 'Listar llamadas PJUD', description: 'Retorna lista paginada de llamadas a/desde PJUD' })
  @ApiResponse({ status: 200, description: 'Lista de llamadas PJUD' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAllLlamadas(@Query() filters: PaginationDto) {
    return this.pjudService.findAllLlamadas(filters);
  }

  @Post('llamadas/reprocesar/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reprocesar llamada PJUD', description: 'Reintenta el procesamiento de una llamada PJUD que falló' })
  @ApiResponse({ status: 200, description: 'Llamada marcada para reprocesar' })
  @ApiResponse({ status: 404, description: 'Llamada no encontrada' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la llamada PJUD' })
  async reprocesar(@Param('id', ParseIntPipe) id: number) {
    return this.pjudService.reprocesar(id);
  }
}
