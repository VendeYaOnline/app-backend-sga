import {
  Controller, Get, Post, Body, Param, Query,
  ParseIntPipe, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PjudService } from '../services/pjud.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiTags('PJUD')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class PjudController {
  constructor(private readonly pjudService: PjudService) {}

  @Post('recepcion-ift')
  @HttpCode(201)
  async recepcionIft(@Body() dto: any) {
    return this.pjudService.recepcionIft(dto);
  }

  @Post('recepcion-decreto')
  @HttpCode(201)
  async recepcionDecreto(@Body() dto: any) {
    return this.pjudService.recepcionDecreto(dto);
  }

  @Get('consulta-ift/:crrId')
  async consultaIft(@Param('crrId', ParseIntPipe) crrId: number) {
    return this.pjudService.consultaIft(crrId);
  }

  @Post('enviar-factibilidad/:solicitudId')
  @HttpCode(201)
  async enviarFactibilidad(@Param('solicitudId', ParseIntPipe) solicitudId: number, @Body() dto: any) {
    return this.pjudService.enviarFactibilidad(solicitudId, dto);
  }

  @Post('enviar-incumplimiento/:solicitudId')
  @HttpCode(201)
  async enviarIncumplimiento(@Param('solicitudId', ParseIntPipe) solicitudId: number, @Body() dto: any) {
    return this.pjudService.enviarIncumplimiento(solicitudId, dto);
  }

  @Post('enviar-alarma-cenco')
  @HttpCode(201)
  async enviarAlarmaCenco(@Body() dto: any) {
    return this.pjudService.enviarAlarmaCenco(dto);
  }

  @Get('llamadas')
  async findAllLlamadas(@Query() filters: PaginationDto) {
    return this.pjudService.findAllLlamadas(filters);
  }

  @Post('llamadas/reprocesar/:id')
  @HttpCode(200)
  async reprocesar(@Param('id', ParseIntPipe) id: number) {
    return this.pjudService.reprocesar(id);
  }
}
