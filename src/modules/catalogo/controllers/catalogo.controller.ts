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
  ApiQuery,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CatalogoService } from '../services/catalogo.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Catálogos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalogos')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('regiones')
  @ApiOperation({
    summary: 'Listar regiones de Chile',
    description:
      'Retorna el catálogo de regiones de Chile ordenadas alfabéticamente',
  })
  @ApiResponse({ status: 200, description: 'Lista de regiones' })
  findRegiones() {
    return this.catalogoService.findRegiones();
  }

  @Get('comunas')
  @ApiQuery({ name: 'region_id', required: false, type: Number })
  @ApiOperation({
    summary: 'Listar comunas (filtrable por región)',
    description:
      'Retorna el catálogo de comunas de Chile, opcionalmente filtradas por región',
  })
  @ApiResponse({ status: 200, description: 'Lista de comunas' })
  findComunas(@Query('region_id') regionId?: number) {
    return this.catalogoService.findComunas(
      regionId ? Number(regionId) : undefined,
    );
  }

  @Get('tribunales')
  @ApiOperation({
    summary: 'Listar tribunales de justicia',
    description: 'Retorna el catálogo de tribunales de justicia del sistema',
  })
  @ApiResponse({ status: 200, description: 'Lista de tribunales' })
  findTribunales() {
    return this.catalogoService.findTribunales();
  }

  @Get('crs')
  @ApiOperation({
    summary: 'Listar Centros de Reinserción Social',
    description: 'Retorna el catálogo de CRS del sistema',
  })
  @ApiResponse({ status: 200, description: 'Lista de CRS' })
  findCrs() {
    return this.catalogoService.findCrs();
  }

  @Get('tipos-ley')
  @ApiOperation({
    summary: 'Listar tipos de ley (18.216, 21.378)',
    description: 'Retorna el catálogo de tipos de ley aplicables',
  })
  @ApiResponse({ status: 200, description: 'Lista de tipos de ley' })
  findTiposLey() {
    return this.catalogoService.findTiposLey();
  }

  @Get('penas-sustitutivas')
  @ApiOperation({
    summary: 'Listar penas sustitutivas',
    description:
      'Retorna el catálogo de penas sustitutivas a la privación de libertad',
  })
  @ApiResponse({ status: 200, description: 'Lista de penas sustitutivas' })
  findPenasSustitutivas() {
    return this.catalogoService.findPenasSustitutivas();
  }

  @Get('medidas-control')
  @ApiOperation({
    summary: 'Listar medidas de control',
    description: 'Retorna el catálogo de medidas de control aplicables',
  })
  @ApiResponse({ status: 200, description: 'Lista de medidas de control' })
  findMedidasControl() {
    return this.catalogoService.findMedidasControl();
  }

  @Get('delitos')
  @ApiOperation({
    summary: 'Listar delitos del catálogo',
    description: 'Retorna el catálogo completo de delitos tipificados',
  })
  @ApiResponse({ status: 200, description: 'Lista de delitos' })
  findDelitos() {
    return this.catalogoService.findDelitos();
  }

  @Get('motivos-no-factible')
  @ApiOperation({
    summary: 'Listar motivos de no factibilidad',
    description:
      'Retorna el catálogo de motivos por los que una solicitud puede ser declarada no factible',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de motivos de no factibilidad',
  })
  findMotivosNoFactible() {
    return this.catalogoService.findMotivosNoFactible();
  }

  @Get('tipos-zona')
  @ApiOperation({
    summary: 'Listar tipos de zona (Exclusión/Inclusión)',
    description: 'Retorna el catálogo de tipos de zona geográfica',
  })
  @ApiResponse({ status: 200, description: 'Lista de tipos de zona' })
  findTiposZona() {
    return this.catalogoService.findTiposZona();
  }

  @Get('tipos-evento')
  @ApiOperation({
    summary: 'Listar tipos de evento',
    description:
      'Retorna el catálogo de tipos de evento para procesos de fiscalización',
  })
  @ApiResponse({ status: 200, description: 'Lista de tipos de evento' })
  findTiposEvento() {
    return this.catalogoService.findTiposEvento();
  }

  @Get('tipos-evento/:id/validaciones')
  @ApiOperation({
    summary: 'Ver configuración de validaciones por tipo de evento',
    description:
      'Retorna las reglas de validación automática configuradas para un tipo de evento',
  })
  @ApiParam({ name: 'id', description: 'ID del tipo de evento', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Configuración de validaciones del tipo de evento',
  })
  findValidacionesByTipoEvento(@Param('id', ParseIntPipe) id: number) {
    return this.catalogoService.findValidacionesByTipoEvento(id);
  }

  @Get('motivos-no-realizado')
  @ApiOperation({
    summary: 'Listar motivos de proceso no realizado',
    description:
      'Retorna el catálogo de motivos por los que un proceso no pudo ser ejecutado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de motivos de no realización',
  })
  findMotivosNoRealizado() {
    return this.catalogoService.findMotivosNoRealizado();
  }

  @Get('tipos-problema-st')
  @ApiOperation({
    summary: 'Listar tipos de problema de soporte técnico',
    description:
      'Retorna el catálogo de tipos de problemas para soporte técnico',
  })
  @ApiResponse({ status: 200, description: 'Lista de tipos de problema ST' })
  findTiposProblemaSt() {
    return this.catalogoService.findTiposProblemaSt();
  }

  @Get('tipos-dia')
  @ApiOperation({
    summary: 'Listar tipos de día para horarios',
    description: 'Retorna el catálogo de tipos de día (hábil, inhábil, etc.)',
  })
  @ApiResponse({ status: 200, description: 'Lista de tipos de día' })
  findTiposDia() {
    return this.catalogoService.findTiposDia();
  }

  @Get('identidades-genero')
  @ApiOperation({
    summary: 'Listar identidades de género',
    description: 'Retorna el catálogo de identidades de género registrables',
  })
  @ApiResponse({ status: 200, description: 'Lista de identidades de género' })
  findIdentidadesGenero() {
    return this.catalogoService.findIdentidadesGenero();
  }

  @Get('roles-dispositivo')
  @ApiOperation({
    summary: 'Listar roles de dispositivo en procesos',
    description:
      'Retorna el catálogo de roles que puede tener un dispositivo en un proceso',
  })
  @ApiResponse({ status: 200, description: 'Lista de roles de dispositivo' })
  findRolesDispositivo() {
    return this.catalogoService.findRolesDispositivo();
  }

  @Get('tipos-identificacion')
  @ApiOperation({
    summary: 'Listar tipos de documento de identificación',
    description:
      'Retorna el catálogo de tipos de documento (RUN, pasaporte, etc.)',
  })
  @ApiResponse({ status: 200, description: 'Lista de tipos de identificación' })
  findTiposIdentificacion() {
    return this.catalogoService.findTiposIdentificacion();
  }

  @Get('parentescos')
  @ApiOperation({
    summary: 'Listar tipos de parentesco',
    description: 'Retorna el catálogo de tipos de parentesco para solicitantes',
  })
  @ApiResponse({ status: 200, description: 'Lista de parentescos' })
  findParentescos() {
    return this.catalogoService.findParentescos();
  }

  @Get('sexos')
  @ApiOperation({
    summary: 'Listar sexos registrables',
    description: 'Retorna el catálogo de sexos registrables',
  })
  @ApiResponse({ status: 200, description: 'Lista de sexos' })
  findSexos() {
    return this.catalogoService.findSexos();
  }

  @Get('tipos-causa')
  @ApiOperation({
    summary: 'Listar tipos de causa judicial',
    description: 'Retorna el catálogo de tipos de causa (RUC_RIT, ROL)',
  })
  @ApiResponse({ status: 200, description: 'Lista de tipos de causa' })
  findTiposCausa() {
    return this.catalogoService.findTiposCausa();
  }

  @Get('tipos-lugar')
  @ApiOperation({
    summary: 'Listar tipos de lugar para zonas IFT',
    description:
      'Retorna el catálogo de tipos de lugar donde se ubica una zona (CASA, APARTAMENTO, LOCAL_COMERCIAL, etc.)',
  })
  @ApiResponse({ status: 200, description: 'Lista de tipos de lugar' })
  findTiposLugar() {
    return this.catalogoService.findTiposLugar();
  }

  @Get('tipos-horario')
  @ApiOperation({
    summary: 'Listar tipos de horario de cumplimiento',
    description:
      'Retorna el catálogo de tipos de horario para monitoreo (DIURNO, NOCTURNO, FIN_SEMANA, TODOS)',
  })
  @ApiResponse({ status: 200, description: 'Lista de tipos de horario' })
  findTiposHorario() {
    return this.catalogoService.findTiposHorario();
  }

  @Get('propositos-archivo')
  @ApiOperation({
    summary: 'Listar propósitos de archivo',
    description:
      'Retorna el catálogo de propósitos válidos para vincular archivos a entidades (RESOLUCION_JUDICIAL, INFORME_FACTIBILIDAD, etc.)',
  })
  @ApiResponse({ status: 200, description: 'Lista de propósitos de archivo' })
  findPropositosArchivo() {
    return this.catalogoService.findPropositosArchivo();
  }
}
