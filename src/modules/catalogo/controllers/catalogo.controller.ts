import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { CatalogoService } from '../services/catalogo.service';

@ApiTags('Catálogos')
@Controller('catalogos')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('regiones')
  findRegiones() {
    return this.catalogoService.findRegiones();
  }

  @Get('comunas')
  @ApiQuery({ name: 'region_id', required: false, type: Number })
  findComunas(@Query('region_id') regionId?: number) {
    return this.catalogoService.findComunas(regionId ? Number(regionId) : undefined);
  }

  @Get('tribunales')
  findTribunales() {
    return this.catalogoService.findTribunales();
  }

  @Get('crs')
  findCrs() {
    return this.catalogoService.findCrs();
  }

  @Get('tipos-ley')
  findTiposLey() {
    return this.catalogoService.findTiposLey();
  }

  @Get('penas-sustitutivas')
  findPenasSustitutivas() {
    return this.catalogoService.findPenasSustitutivas();
  }

  @Get('medidas-control')
  findMedidasControl() {
    return this.catalogoService.findMedidasControl();
  }

  @Get('delitos')
  findDelitos() {
    return this.catalogoService.findDelitos();
  }

  @Get('motivos-no-factible')
  findMotivosNoFactible() {
    return this.catalogoService.findMotivosNoFactible();
  }

  @Get('tipos-zona')
  findTiposZona() {
    return this.catalogoService.findTiposZona();
  }

  @Get('tipos-evento')
  findTiposEvento() {
    return this.catalogoService.findTiposEvento();
  }

  @Get('tipos-evento/:id/validaciones')
  findValidacionesByTipoEvento(@Param('id', ParseIntPipe) id: number) {
    return this.catalogoService.findValidacionesByTipoEvento(id);
  }

  @Get('motivos-no-realizado')
  findMotivosNoRealizado() {
    return this.catalogoService.findMotivosNoRealizado();
  }

  @Get('tipos-problema-st')
  findTiposProblemaSt() {
    return this.catalogoService.findTiposProblemaSt();
  }

  @Get('tipos-accesorio')
  findTiposAccesorio() {
    return this.catalogoService.findTiposAccesorio();
  }

  @Get('tipos-dia')
  findTiposDia() {
    return this.catalogoService.findTiposDia();
  }

  @Get('identidades-genero')
  findIdentidadesGenero() {
    return this.catalogoService.findIdentidadesGenero();
  }

  @Get('roles-dispositivo')
  findRolesDispositivo() {
    return this.catalogoService.findRolesDispositivo();
  }

  @Get('tipos-identificacion')
  findTiposIdentificacion() {
    return this.catalogoService.findTiposIdentificacion();
  }

  @Get('parentescos')
  findParentescos() {
    return this.catalogoService.findParentescos();
  }

  @Get('sexos')
  findSexos() {
    return this.catalogoService.findSexos();
  }
}
