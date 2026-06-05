import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
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
  ApiBody,
} from '@nestjs/swagger';
import { DispositivoService } from '../services/dispositivo.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePermiso } from '../../../common/decorators/require-permiso.decorator';
import { PERMISOS } from '../../../common/constants/permisos.constant';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { CreateProcesoDispositivosDto } from '../dto/create-proceso-dispositivo.dto';
import { RegistrarInstalacionDto } from '../dto/registrar-instalacion.dto';

@ApiTags('Dispositivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DispositivoController {
  constructor(private readonly dispositivoService: DispositivoService) {}

  @Get('procesos/:agendamientoId/dispositivos')
  @RequirePermiso(PERMISOS.DISPOSITIVO_GESTIONAR)
  @ApiOperation({
    summary: 'Historial de dispositivos en proceso',
    description: 'Retorna el historial de dispositivos asociados a un proceso',
  })
  @ApiResponse({ status: 200, description: 'Historial de dispositivos' })
  @ApiResponse({ status: 404, description: 'Proceso no encontrado' })
  @ApiParam({
    name: 'agendamientoId',
    type: Number,
    description: 'ID del agendamiento/proceso',
  })
  async findDispositivosByEvento(
    @Param('agendamientoId', ParseIntPipe) agendamientoId: number,
  ) {
    return this.dispositivoService.findDispositivosByEvento(agendamientoId);
  }

  @Post('procesos/:agendamientoId/dispositivos')
  @HttpCode(201)
  @RequirePermiso(PERMISOS.DISPOSITIVO_GESTIONAR)
  @ApiBody({ type: CreateProcesoDispositivosDto })
  @ApiOperation({
    summary: 'Registrar dispositivos en proceso',
    description:
      'Asocia uno o más dispositivos a un proceso en terreno con su rol específico',
  })
  @ApiResponse({
    status: 201,
    description: 'Dispositivos registrados en el proceso',
  })
  @ApiResponse({
    status: 404,
    description: 'Proceso no encontrado',
  })
  @ApiParam({
    name: 'agendamientoId',
    type: Number,
    description: 'ID del agendamiento/proceso',
  })
  async createProcesoDispositivos(
    @Param('agendamientoId', ParseIntPipe) agendamientoId: number,
    @Body() dto: CreateProcesoDispositivosDto,
  ) {
    return this.dispositivoService.createProcesoDispositivos(
      agendamientoId,
      dto.dispositivos,
    );
  }

  @Post('procesos/:agendamientoId/instalacion')
  @HttpCode(201)
  @RequirePermiso(PERMISOS.DISPOSITIVO_GESTIONAR)
  @ApiBody({ type: RegistrarInstalacionDto })
  @ApiOperation({
    summary: 'Registrar instalación completa',
    description:
      'Registra los dispositivos de una instalación y opcionalmente actualiza el proceso y el agendamiento asociado. Todo en una sola transacción.',
  })
  @ApiResponse({
    status: 201,
    description: 'Instalación registrada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Proceso o agendamiento no encontrado',
  })
  @ApiParam({
    name: 'agendamientoId',
    type: Number,
    description: 'ID del agendamiento/proceso de instalación',
  })
  async registrarInstalacion(
    @Param('agendamientoId', ParseIntPipe) agendamientoId: number,
    @Body() dto: RegistrarInstalacionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dispositivoService.registrarInstalacion(
      agendamientoId,
      dto,
      user.sub,
    );
  }

  @Put('procesos/:agendamientoId/dispositivos')
  @RequirePermiso(PERMISOS.DISPOSITIVO_GESTIONAR)
  @ApiBody({ type: CreateProcesoDispositivosDto })
  @ApiOperation({
    summary: 'Reemplazar todos los dispositivos de un proceso',
    description:
      'Reemplaza la lista completa de dispositivos asociados a un proceso. Elimina los existentes y crea los nuevos en una sola transaccion. Util para agregar, quitar o modificar dispositivos de forma atomica.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dispositivos reemplazados exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Proceso no encontrado',
  })
  @ApiParam({
    name: 'agendamientoId',
    type: Number,
    description: 'ID del agendamiento/proceso',
  })
  async replaceProcesoDispositivos(
    @Param('agendamientoId', ParseIntPipe) agendamientoId: number,
    @Body() dto: CreateProcesoDispositivosDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dispositivoService.replaceProcesoDispositivos(
      agendamientoId,
      dto.dispositivos,
      user.sub,
    );
  }
}
