import {
  Controller,
  Get,
  Post,
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
} from '@nestjs/swagger';
import { DispositivoService } from '../services/dispositivo.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CreateProcesoDispositivosDto } from '../dto/create-proceso-dispositivo.dto';
import { RegistrarInstalacionDto } from '../dto/registrar-instalacion.dto';

@ApiTags('Dispositivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DispositivoController {
  constructor(private readonly dispositivoService: DispositivoService) {}

  @Get('procesos/:eventoId/dispositivos')
  @ApiOperation({
    summary: 'Historial de dispositivos en proceso',
    description: 'Retorna el historial de dispositivos asociados a un proceso',
  })
  @ApiResponse({ status: 200, description: 'Historial de dispositivos' })
  @ApiResponse({ status: 404, description: 'Proceso no encontrado' })
  @ApiParam({
    name: 'eventoId',
    type: Number,
    description: 'ID del evento/proceso',
  })
  async findDispositivosByEvento(
    @Param('eventoId', ParseIntPipe) eventoId: number,
  ) {
    return this.dispositivoService.findDispositivosByEvento(eventoId);
  }

  @Post('procesos/:eventoId/dispositivos')
  @HttpCode(201)
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
    name: 'eventoId',
    type: Number,
    description: 'ID del evento/proceso',
  })
  async createProcesoDispositivos(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: CreateProcesoDispositivosDto,
  ) {
    return this.dispositivoService.createProcesoDispositivos(
      eventoId,
      dto.dispositivos,
    );
  }

  @Post('procesos/:eventoId/instalacion')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Registrar instalación completa',
    description:
      'Registra los dispositivos de una instalación y opcionalmente actualiza el agendamiento asociado. Todo en una sola transacción.',
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
    name: 'eventoId',
    type: Number,
    description: 'ID del evento/proceso de instalación',
  })
  async registrarInstalacion(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: RegistrarInstalacionDto,
  ) {
    return this.dispositivoService.registrarInstalacion(eventoId, dto);
  }
}
