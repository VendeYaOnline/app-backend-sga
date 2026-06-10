import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CargaLaboralService } from '../services/carga-laboral.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermisosGuard } from '../../../common/guards/permisos.guard';
import { RequirePermiso } from '../../../common/decorators/require-permiso.decorator';
import { PERMISOS } from '../../../common/constants/permisos.constant';
import { FindCargaLaboralDto } from '../dto/find-carga-laboral.dto';
import { FindPorRolDto } from '../dto/find-por-rol.dto';

@ApiTags('Carga Laboral')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermisosGuard)
@Controller('carga-laboral')
export class CargaLaboralController {
  constructor(private readonly cargaLaboralService: CargaLaboralService) {}

  @Get('resumen')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Resumen de carga laboral',
    description: 'Retorna un resumen agrupado de acciones por tipo',
  })
  @ApiResponse({ status: 200, description: 'Resumen de carga laboral' })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, description: 'Fecha de término (YYYY-MM-DD)' })
  @ApiQuery({ name: 'usuarioId', required: false, type: Number, description: 'Filtrar por usuario' })
  async findResumen(@Query() filters: FindCargaLaboralDto) {
    return this.cargaLaboralService.findResumen(filters);
  }

  @Get('detalle')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Detalle de carga laboral',
    description: 'Retorna el detalle paginado de acciones con filtros',
  })
  @ApiResponse({ status: 200, description: 'Detalle de carga laboral' })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, description: 'Fecha de término (YYYY-MM-DD)' })
  @ApiQuery({ name: 'usuarioId', required: false, type: Number, description: 'Filtrar por usuario' })
  @ApiQuery({ name: 'tipoAccion', required: false, type: String, description: 'Filtrar por tipo de acción' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findDetalle(@Query() filters: FindCargaLaboralDto) {
    return this.cargaLaboralService.findDetalle(filters);
  }

  @Get('exportar')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Exportar carga laboral',
    description: 'Exporta en formato plano los datos de carga laboral según filtros',
  })
  @ApiResponse({ status: 200, description: 'Datos exportados' })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, description: 'Fecha de término (YYYY-MM-DD)' })
  @ApiQuery({ name: 'usuarioId', required: false, type: Number, description: 'Filtrar por usuario' })
  async exportar(@Query() filters: FindCargaLaboralDto) {
    return this.cargaLaboralService.exportar(filters);
  }

  @Get('por-rol')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Carga laboral agrupada por rol',
    description:
      'Retorna todos los roles con sus usuarios y métricas de carga laboral. ' +
      'Filtrando por rolId se obtiene el drill-down de un rol específico.',
  })
  @ApiResponse({ status: 200, description: 'Carga laboral por rol' })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, description: 'Fecha de término (YYYY-MM-DD)' })
  @ApiQuery({ name: 'rolId', required: false, type: Number, description: 'Filtrar por un rol específico' })
  async findPorRol(@Query() filters: FindPorRolDto) {
    return this.cargaLaboralService.findPorRol(filters);
  }

  @Get('usuario/:usuarioId')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Carga laboral de un usuario',
    description: 'Retorna el detalle de carga laboral de un usuario específico, incluyendo sus roles, acciones por tipo y últimas 10 acciones',
  })
  @ApiResponse({ status: 200, description: 'Carga laboral del usuario' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiParam({ name: 'usuarioId', type: Number, description: 'ID del usuario' })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, description: 'Fecha de término (YYYY-MM-DD)' })
  async findUsuario(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Query() filters: FindCargaLaboralDto,
  ) {
    return this.cargaLaboralService.findUsuario(usuarioId, filters);
  }
}
