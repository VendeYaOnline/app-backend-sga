import {
  Controller, Get, Post, Put, Body, Param, Query,
  ParseIntPipe, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrefacturacionService } from '../services/prefacturacion.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiTags('Prefacturacion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prefacturacion')
export class PrefacturacionController {
  constructor(private readonly prefacturacionService: PrefacturacionService) {}

  @Get('periodos')
  async findPeriodos(@Query() filters: PaginationDto) {
    return this.prefacturacionService.findPeriodos(filters);
  }

  @Get('periodos/:id')
  async findPeriodo(@Param('id', ParseIntPipe) id: number) {
    return this.prefacturacionService.findPeriodo(id);
  }

  @Post('periodos')
  @HttpCode(201)
  async crearPeriodo(@Body() dto: any) {
    return this.prefacturacionService.crearPeriodo(dto);
  }

  @Put('periodos/:id/cerrar')
  async cerrarPeriodo(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.prefacturacionService.cerrarPeriodo(id, user.sub);
  }

  @Get('periodos/:periodoId/detalles')
  async findDetalles(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.prefacturacionService.findDetalles(periodoId);
  }

  @Get('periodos/:periodoId/resumen')
  async findResumen(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.prefacturacionService.findResumen(periodoId);
  }

  @Post('detalles')
  @HttpCode(201)
  async crearDetalle(@Body() dto: any) {
    return this.prefacturacionService.crearDetalle(dto);
  }
}
