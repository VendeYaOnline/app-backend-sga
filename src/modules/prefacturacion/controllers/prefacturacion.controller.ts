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
  ApiBody,
} from '@nestjs/swagger';
import { PrefacturacionService } from '../services/prefacturacion.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreatePeriodoDto, CreateDetalleDto } from '../dto/prefacturacion.dto';

@ApiTags('Prefacturacion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prefacturacion')
export class PrefacturacionController {
  constructor(private readonly prefacturacionService: PrefacturacionService) {}

  @Get('periodos')
  @ApiOperation({
    summary: 'Listar periodos de prefacturación',
    description: 'Retorna lista paginada de periodos de prefacturación',
  })
  @ApiResponse({ status: 200, description: 'Lista de periodos' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findPeriodos(@Query() filters: PaginationDto) {
    return this.prefacturacionService.findPeriodos(filters);
  }

  @Get('periodos/:id')
  @ApiOperation({
    summary: 'Ver detalle de un periodo',
    description: 'Retorna el detalle de un periodo de prefacturación',
  })
  @ApiResponse({ status: 200, description: 'Detalle del periodo' })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del periodo' })
  async findPeriodo(@Param('id', ParseIntPipe) id: number) {
    return this.prefacturacionService.findPeriodo(id);
  }

  @Post('periodos')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear un nuevo periodo',
    description: 'Crea un nuevo periodo de prefacturación (año/mes)',
  })
  @ApiResponse({ status: 201, description: 'Periodo creado exitosamente' })
  @ApiResponse({ status: 409, description: 'El periodo ya existe' })
  @ApiBody({ type: CreatePeriodoDto })
  async crearPeriodo(@Body() dto: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.prefacturacionService.crearPeriodo(dto);
  }

  @Put('periodos/:id/cerrar')
  @ApiOperation({
    summary: 'Cerrar periodo de prefacturación',
    description:
      'Cierra un periodo de prefacturación, impidiendo nuevas modificaciones',
  })
  @ApiResponse({ status: 200, description: 'Periodo cerrado exitosamente' })
  @ApiResponse({ status: 400, description: 'El periodo ya está cerrado' })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del periodo' })
  async cerrarPeriodo(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.prefacturacionService.cerrarPeriodo(id, user.sub);
  }

  @Get('periodos/:periodoId/detalles')
  @ApiOperation({
    summary: 'Ver detalles de un periodo',
    description: 'Retorna los detalles de prefacturación de un periodo',
  })
  @ApiResponse({ status: 200, description: 'Lista de detalles del periodo' })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  @ApiParam({ name: 'periodoId', type: Number, description: 'ID del periodo' })
  async findDetalles(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.prefacturacionService.findDetalles(periodoId);
  }

  @Get('periodos/:periodoId/resumen')
  @ApiOperation({
    summary: 'Ver resumen de un periodo',
    description:
      'Retorna el resumen de prefacturación de un periodo (totales, días)',
  })
  @ApiResponse({ status: 200, description: 'Resumen del periodo' })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  @ApiParam({ name: 'periodoId', type: Number, description: 'ID del periodo' })
  async findResumen(@Param('periodoId', ParseIntPipe) periodoId: number) {
    return this.prefacturacionService.findResumen(periodoId);
  }

  @Post('detalles')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Agregar detalle de prefacturación',
    description: 'Agrega un nuevo detalle a un periodo de prefacturación',
  })
  @ApiResponse({ status: 201, description: 'Detalle creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({ type: CreateDetalleDto })
  async crearDetalle(@Body() dto: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.prefacturacionService.crearDetalle(dto);
  }
}
