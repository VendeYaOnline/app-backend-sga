import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CargaLaboralService } from '../services/carga-laboral.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePermiso } from '../../../common/decorators/require-permiso.decorator';
import { PERMISOS } from '../../../common/constants/permisos.constant';
import { FindCargaLaboralDto } from '../dto/find-carga-laboral.dto';

@ApiTags('Carga Laboral')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('carga-laboral')
export class CargaLaboralController {
  constructor(private readonly cargaLaboralService: CargaLaboralService) {}

  @Get('resumen')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Resumen de carga laboral',
    description:
      'Retorna un resumen agrupado de acciones de carga laboral por tipo',
  })
  @ApiResponse({ status: 200, description: 'Resumen de carga laboral' })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Fecha de término (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'usuarioId',
    required: false,
    type: Number,
    description: 'Filtrar por usuario',
  })
  async findResumen(@Query() filters: FindCargaLaboralDto) {
    return this.cargaLaboralService.findResumen(filters);
  }

  @Get('detalle')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Detalle de carga laboral',
    description:
      'Retorna el detalle paginado de acciones de carga laboral con filtros',
  })
  @ApiResponse({ status: 200, description: 'Detalle de carga laboral' })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Fecha de término (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'usuarioId',
    required: false,
    type: Number,
    description: 'Filtrar por usuario',
  })
  @ApiQuery({
    name: 'tipoAccion',
    required: false,
    type: String,
    description: 'Filtrar por tipo de acción',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findDetalle(@Query() filters: FindCargaLaboralDto) {
    return this.cargaLaboralService.findDetalle(filters);
  }

  @Get('exportar')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Exportar carga laboral',
    description:
      'Exporta en formato plano los datos de carga laboral según filtros',
  })
  @ApiResponse({ status: 200, description: 'Datos exportados' })
  @ApiQuery({
    name: 'fechaDesde',
    required: false,
    type: String,
    description: 'Fecha de inicio (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'fechaHasta',
    required: false,
    type: String,
    description: 'Fecha de término (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'usuarioId',
    required: false,
    type: Number,
    description: 'Filtrar por usuario',
  })
  async exportar(@Query() filters: FindCargaLaboralDto) {
    return this.cargaLaboralService.exportar(filters);
  }
}
