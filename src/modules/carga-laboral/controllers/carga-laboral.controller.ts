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
import { FindCargaLaboralFechasDto } from '../dto/find-carga-laboral-fechas.dto';
import { FindUsuariosRolDto } from '../dto/find-usuarios-rol.dto';

@ApiTags('Carga Laboral')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermisosGuard)
@Controller('carga-laboral')
export class CargaLaboralController {
  constructor(private readonly cargaLaboralService: CargaLaboralService) {}

  @Get('usuarios')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Usuarios por rol',
    description: 'Retorna los usuarios activos que pertenecen al rol indicado, con sus datos de perfil y roles asignados.',
  })
  @ApiQuery({ name: 'rol', required: true, enum: ['DMT', 'EMPRESA', 'COORDINADOR', 'TECNICO'], description: 'Código del rol' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios con el rol solicitado' })
  @ApiResponse({ status: 400, description: 'Rol inválido' })
  async findUsuariosPorRol(@Query() filters: FindUsuariosRolDto) {
    return this.cargaLaboralService.findUsuariosPorRol(filters);
  }

  @Get('dmt/:usuarioId')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Carga laboral — rol DMT',
    description:
      'Retorna las métricas de carga laboral de un usuario con rol DMT: ' +
      'solicitudes asignadas, recepcionadas (RECEPCIONADA → REVISION_DMT), ' +
      'derivadas a empresa (REVISION_DMT → REVISION_EMPRESA) y ' +
      'devueltas al solicitante (REVISION_DMT → DEVUELTA_SOLICITANTE).',
  })
  @ApiParam({ name: 'usuarioId', type: Number, description: 'ID del usuario DMT' })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, description: 'Filtro de fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, description: 'Filtro de fecha fin (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Métricas de carga laboral del usuario DMT' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findDmt(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Query() filters: FindCargaLaboralFechasDto,
  ) {
    return this.cargaLaboralService.findDmt(usuarioId, filters);
  }

  @Get('empresa/:usuarioId')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Carga laboral — rol Empresa',
    description:
      'Retorna las métricas de carga laboral de un usuario con rol Empresa: ' +
      'solicitudes gestionadas (REVISION_EMPRESA → INFORME_GENERADO) y ' +
      'conteo de respuestas de factibilidad emitidas (FACTIBLE, NO_FACTIBLE, NO_RECOMENDABLE).',
  })
  @ApiParam({ name: 'usuarioId', type: Number, description: 'ID del usuario Empresa' })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, description: 'Filtro de fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, description: 'Filtro de fecha fin (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Métricas de carga laboral del usuario Empresa' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findEmpresa(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Query() filters: FindCargaLaboralFechasDto,
  ) {
    return this.cargaLaboralService.findEmpresa(usuarioId, filters);
  }

  @Get('coordinador/:usuarioId')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Carga laboral — rol Coordinador',
    description:
      'Retorna las métricas de carga laboral de un usuario con rol Coordinador: ' +
      'agendamientos creados por tipo (INSTALACION, SOPORTE, DESINSTALACION), ' +
      'reprogramados (numero_intento > 1), abiertos/cerrados y por estado (EN_PROCESO, COMPLETADO, NO_REALIZADO).',
  })
  @ApiParam({ name: 'usuarioId', type: Number, description: 'ID del usuario Coordinador' })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, description: 'Filtro de fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, description: 'Filtro de fecha fin (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Métricas de carga laboral del usuario Coordinador' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findCoordinador(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Query() filters: FindCargaLaboralFechasDto,
  ) {
    return this.cargaLaboralService.findCoordinador(usuarioId, filters);
  }

  @Get('tecnico/:usuarioId')
  @RequirePermiso(PERMISOS.CARGA_LABORAL_VER)
  @ApiOperation({
    summary: 'Carga laboral — rol Técnico',
    description:
      'Retorna las métricas de carga laboral de un usuario con rol Técnico: ' +
      'agendamientos tomados (tecnico_id) por tipo (INSTALACION, SOPORTE, DESINSTALACION), ' +
      'y de esos cuántos fueron ejecutados (tienen PROCESO), realizados y no realizados.',
  })
  @ApiParam({ name: 'usuarioId', type: Number, description: 'ID del usuario Técnico' })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, description: 'Filtro de fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, description: 'Filtro de fecha fin (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Métricas de carga laboral del usuario Técnico' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findTecnico(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Query() filters: FindCargaLaboralFechasDto,
  ) {
    return this.cargaLaboralService.findTecnico(usuarioId, filters);
  }
}
