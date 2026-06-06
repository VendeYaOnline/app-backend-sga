import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { PjudService } from '../services/pjud.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermisosGuard } from '../../../common/guards/permisos.guard';
import { PjudAuthGuard } from '../../../common/guards/pjud-auth.guard';
import { RequirePermiso } from '../../../common/decorators/require-permiso.decorator';
import { PERMISOS } from '../../../common/constants/permisos.constant';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { RecepcionIftDto } from '../dto/recepcion-ift.dto';
import { RecepcionDecretoDto } from '../dto/recepcion-decreto.dto';
import { PjudEnvioDto } from '../dto/pjud-envio.dto';
import { PjudFactibilidadEnvioDto } from '../dto/pjud-factibilidad-envio.dto';

@ApiTags('PJUD')
@Controller()
export class PjudController {
  constructor(private readonly pjudService: PjudService) {}

  @Post('recepcion-ift')
  @HttpCode(202)
  @UseGuards(PjudAuthGuard)
  @ApiOperation({
    summary: 'Recepcionar IFT desde PJUD',
    description:
      'Encola la IFT para procesamiento asíncrono y responde 202 inmediatamente. ' +
      'La Solicitud en SGA se crea en el siguiente ciclo del scheduler (cada 5 min). ' +
      'Si el solicitudPjudId ya fue recibido antes, retorna el registro existente sin duplicar.',
  })
  @ApiResponse({ status: 202, description: 'IFT recibida y encolada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'API Key inválida' })
  @ApiBody({ type: RecepcionIftDto })
  async recepcionIft(@Body() dto: RecepcionIftDto) {
    return this.pjudService.recepcionIft(dto);
  }

  @Post('recepcion-decreto')
  @HttpCode(202)
  @UseGuards(PjudAuthGuard)
  @ApiOperation({
    summary: 'Recepcionar decreto desde PJUD',
    description:
      'Encola el decreto para procesamiento asíncrono y responde 202 inmediatamente. ' +
      'El Evento con Resolución en SGA se crea en el siguiente ciclo del scheduler. ' +
      'Si el crrIdPjud ya fue recibido antes, retorna el registro existente sin duplicar.',
  })
  @ApiResponse({ status: 202, description: 'Decreto recibido y encolado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'API Key inválida' })
  @ApiBody({ type: RecepcionDecretoDto })
  async recepcionDecreto(@Body() dto: RecepcionDecretoDto) {
    return this.pjudService.recepcionDecreto(dto);
  }

  @Get('consulta-ift/:solicitudPjudId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequirePermiso(PERMISOS.PJUD_GESTIONAR)
  @ApiOperation({
    summary: 'Consultar IFT por ID correlativo PJUD',
    description: 'Consulta el historial de llamadas IFT por su ID correlativo PJUD',
  })
  @ApiResponse({ status: 200, description: 'Historial de llamadas IFT' })
  @ApiResponse({ status: 404, description: 'No se encontraron registros' })
  @ApiParam({
    name: 'solicitudPjudId',
    type: Number,
    description: 'ID correlativo maestro PJUD (solicitud_pjud_id)',
  })
  async consultaIft(@Param('solicitudPjudId', ParseIntPipe) solicitudPjudId: number) {
    return this.pjudService.consultaIft(solicitudPjudId);
  }

  @Post('enviar-factibilidad/:solicitudId')
  @HttpCode(201)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequirePermiso(PERMISOS.PJUD_GESTIONAR)
  @ApiOperation({
    summary: 'Enviar factibilidad técnica a PJUD',
    description:
      'Busca automáticamente el informe de factibilidad y su PDF asociado, ' +
      'construye el payload con el código del tipo de factibilidad (y motivo si aplica), ' +
      'y realiza la llamada HTTP sincrónica a PJUD. ' +
      'El payload se arma en el backend a partir de los datos de la solicitud; ' +
      'no requiere body en la petición. ' +
      'El resultado de la llamada se registra en PJUD_LLAMADA.',
  })
  @ApiBody({
    type: PjudFactibilidadEnvioDto,
    description:
      'Payload enviado a PJUD (construido automáticamente en el backend). ' +
      'No es necesario enviarlo en la petición; se documenta aquí para referencia.',
  })
  @ApiResponse({ status: 201, description: 'Factibilidad enviada exitosamente a PJUD' })
  @ApiResponse({
    status: 400,
    description: 'Sin factibilidad emitida, sin PDF subido, o sin ID PJUD en la solicitud',
  })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiResponse({ status: 502, description: 'PJUD rechazó o no respondió a la solicitud' })
  @ApiParam({ name: 'solicitudId', type: Number, description: 'ID de la solicitud SGA' })
  async enviarFactibilidad(
    @Param('solicitudId', ParseIntPipe) solicitudId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pjudService.enviarFactibilidad(solicitudId, user.sub);
  }

  @Post('enviar-incumplimiento/:solicitudId')
  @HttpCode(201)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequirePermiso(PERMISOS.PJUD_GESTIONAR)
  @ApiOperation({
    summary: 'Enviar incumplimiento al PJUD',
    description:
      'Envía el informe de incumplimiento de una solicitud al Poder Judicial',
  })
  @ApiResponse({
    status: 201,
    description: 'Incumplimiento enviado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiParam({
    name: 'solicitudId',
    type: Number,
    description: 'ID de la solicitud',
  })
  @ApiBody({ type: PjudEnvioDto })
  async enviarIncumplimiento(
    @Param('solicitudId', ParseIntPipe) solicitudId: number,
    @Body() dto: PjudEnvioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pjudService.enviarIncumplimiento(solicitudId, dto, user.sub);
  }

  @Post('enviar-alarma-cenco')
  @HttpCode(201)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequirePermiso(PERMISOS.PJUD_GESTIONAR)
  @ApiOperation({
    summary: 'Enviar alarma CENCO al PJUD',
    description: 'Envía una alarma CENCO al Poder Judicial',
  })
  @ApiResponse({
    status: 201,
    description: 'Alarma CENCO enviada exitosamente',
  })
  @ApiBody({ type: PjudEnvioDto })
  async enviarAlarmaCenco(
    @Body() dto: PjudEnvioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pjudService.enviarAlarmaCenco(dto, user.sub);
  }

  @Get('llamadas')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequirePermiso(PERMISOS.PJUD_GESTIONAR)
  @ApiOperation({
    summary: 'Listar llamadas PJUD',
    description: 'Retorna lista paginada de llamadas a/desde PJUD',
  })
  @ApiResponse({ status: 200, description: 'Lista de llamadas PJUD' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'endpoint', required: false, type: String })
  @ApiQuery({ name: 'procesadoOk', required: false, type: String })
  @ApiQuery({ name: 'solicitudId', required: false, type: Number })
  async findAllLlamadas(@Query() filters: PaginationDto) {
    return this.pjudService.findAllLlamadas(filters);
  }

  @Post('llamadas/reprocesar/:id')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequirePermiso(PERMISOS.PJUD_GESTIONAR)
  @ApiOperation({
    summary: 'Reprocesar llamada PJUD',
    description: 'Reintenta el procesamiento de una llamada PJUD que falló',
  })
  @ApiResponse({ status: 200, description: 'Llamada marcada para reprocesar' })
  @ApiResponse({
    status: 400,
    description: 'Llamada ya procesada',
  })
  @ApiResponse({ status: 404, description: 'Llamada no encontrada' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la llamada PJUD' })
  async reprocesar(@Param('id', ParseIntPipe) id: number) {
    return this.pjudService.reprocesar(id);
  }

  @Get('llamadas/pendientes')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequirePermiso(PERMISOS.PJUD_GESTIONAR)
  @ApiOperation({
    summary: 'Listar llamadas PJUD pendientes de procesar',
    description:
      'Retorna todas las llamadas inbound no procesadas exitosamente',
  })
  @ApiResponse({ status: 200, description: 'Lista de llamadas pendientes' })
  async findPendientes() {
    return this.pjudService.findPendientes();
  }

  @Post('test-ift')
  @HttpCode(201)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @RequirePermiso(PERMISOS.PJUD_GESTIONAR)
  @ApiOperation({
    summary: 'Simular recepción IFT desde PJUD (testing)',
    description:
      'Endpoint de prueba que simula una llamada IFT desde PJUD. Útil para testing sin que PJUD esté involucrado.',
  })
  @ApiResponse({
    status: 201,
    description: 'IFT de prueba procesada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({ type: RecepcionIftDto })
  async testIft(@Body() dto: RecepcionIftDto) {
    return this.pjudService.recepcionIft(dto);
  }
}
