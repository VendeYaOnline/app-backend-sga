import {
  Controller, Get, Post, Body, Param, Query,
  ParseIntPipe, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DispositivoService } from '../services/dispositivo.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateDispositivoDto } from '../dto/create-dispositivo.dto';
import { CreateProcesoAccesorioDto } from '../dto/create-proceso-accesorio.dto';
import { CreateProcesoDispositivoDto } from '../dto/create-proceso-dispositivo.dto';

@ApiTags('Dispositivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DispositivoController {
  constructor(private readonly dispositivoService: DispositivoService) {}

  @Get('dispositivos')
  async findAllDispositivos(@Query() filters: PaginationDto) {
    return this.dispositivoService.findAllDispositivos(filters);
  }

  @Get('dispositivos/:id')
  async findDispositivo(@Param('id', ParseIntPipe) id: number) {
    return this.dispositivoService.findDispositivo(id);
  }

  @Post('dispositivos')
  @HttpCode(201)
  async createDispositivo(@Body() dto: CreateDispositivoDto) {
    return this.dispositivoService.createDispositivo(dto);
  }

  @Get('procesos/:eventoId/accesorios')
  async findAccesorios(@Param('eventoId', ParseIntPipe) eventoId: number) {
    return this.dispositivoService.findAccesoriosByEvento(eventoId);
  }

  @Post('procesos/:eventoId/accesorios')
  @HttpCode(201)
  async createAccesorio(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: CreateProcesoAccesorioDto,
  ) {
    return this.dispositivoService.createAccesorio(eventoId, dto);
  }

  @Get('procesos/:eventoId/dispositivos')
  async findDispositivosByEvento(@Param('eventoId', ParseIntPipe) eventoId: number) {
    return this.dispositivoService.findDispositivosByEvento(eventoId);
  }

  @Post('procesos/:eventoId/dispositivos')
  @HttpCode(201)
  async createProcesoDispositivo(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: CreateProcesoDispositivoDto,
  ) {
    return this.dispositivoService.createProcesoDispositivo(eventoId, dto);
  }
}
