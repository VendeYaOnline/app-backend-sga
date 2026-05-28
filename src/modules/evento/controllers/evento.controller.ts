import {
  Controller, Get, Post, Put, Body, Param, Query,
  ParseIntPipe, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EventoService } from '../services/evento.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiTags('Eventos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Get('eventos')
  async findAll(@Query() filters: PaginationDto) {
    return this.eventoService.findAll(filters);
  }

  @Get('eventos/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventoService.findOne(id);
  }

  @Post('eventos')
  @HttpCode(201)
  async create(@Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.eventoService.create(dto, user.sub);
  }

  @Put('eventos/:id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: any, @CurrentUser() user: JwtPayload) {
    return this.eventoService.update(id, dto, user.sub);
  }

  @Get('eventos/:id/validaciones')
  async findValidaciones(@Param('id', ParseIntPipe) id: number) {
    return this.eventoService.findValidaciones(id);
  }

  @Post('eventos/:id/validaciones/:validacionId')
  async ejecutarValidacion(
    @Param('id', ParseIntPipe) id: number,
    @Param('validacionId', ParseIntPipe) validacionId: number,
    @Body() dto: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.ejecutarValidacion(id, validacionId, dto, user.sub);
  }

  @Get('procesos')
  async findProcesos(@Query() filters: PaginationDto) {
    return this.eventoService.findAll(filters);
  }

  @Put('procesos/:eventoId')
  async updateProceso(@Param('eventoId', ParseIntPipe) eventoId: number, @Body() dto: any) {
    return this.eventoService.updateProceso(eventoId, dto);
  }

  @Post('procesos/:eventoId/cerrar')
  async cerrarProceso(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Body() dto: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.eventoService.cerrarProceso(eventoId, dto, user.sub);
  }

  @Post('procesos/:eventoId/soporte-detalle')
  async addSoporteDetalle(@Param('eventoId', ParseIntPipe) eventoId: number, @Body() dto: any) {
    return this.eventoService.addSoporteDetalle(eventoId, dto);
  }

  @Put('resoluciones/:eventoId')
  async updateResolucion(@Param('eventoId', ParseIntPipe) eventoId: number, @Body() dto: any) {
    return this.eventoService.updateResolucion(eventoId, dto);
  }

  @Put('cambios-domicilio/:eventoId')
  async updateCambioDomicilio(@Param('eventoId', ParseIntPipe) eventoId: number, @Body() dto: any) {
    return this.eventoService.updateCambioDomicilio(eventoId, dto);
  }
}
