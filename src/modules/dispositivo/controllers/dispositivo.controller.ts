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
import { CreateProcesoDispositivoDto } from '../dto/create-proceso-dispositivo.dto';

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
    summary: 'Registrar dispositivo en proceso',
    description:
      'Asocia un dispositivo a un proceso en terreno con un rol específico',
  })
  @ApiResponse({
    status: 201,
    description: 'Dispositivo registrado en el proceso',
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
  async createProcesoDispositivo(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: CreateProcesoDispositivoDto,
  ) {
    return this.dispositivoService.createProcesoDispositivo(eventoId, dto);
  }
}
