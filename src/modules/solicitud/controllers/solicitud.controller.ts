import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SolicitudService } from '../services/solicitud.service';
import { CreateSolicitudDto } from '../dto/create-solicitud.dto';
import { UpdateSolicitudDto } from '../dto/update-solicitud.dto';
import { FindSolicitudDto } from '../dto/find-solicitud.dto';
import { TransicionEstadoDto } from '../dto/transicion-estado.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Solicitudes IFT')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('solicitudes')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Get()
  async findAll(@Query() filters: FindSolicitudDto) {
    return this.solicitudService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateSolicitudDto, @CurrentUser() user: JwtPayload) {
    return this.solicitudService.create(dto, user.sub);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSolicitudDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    await this.solicitudService.softDelete(id, user.sub);
  }

  @Post(':id/transicion')
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: TransicionEstadoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.cambiarEstado(id, dto, user.sub);
  }

  @Get(':id/historial')
  async findHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findHistorial(id);
  }

  @Get(':id/zonas')
  async findZonas(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findZonas(id);
  }

  @Post(':id/zonas')
  @HttpCode(201)
  async addZona(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.addZona(id, dto, user.sub);
  }

  @Put(':id/zonas/:zonaId')
  async updateZona(
    @Param('id', ParseIntPipe) id: number,
    @Param('zonaId', ParseIntPipe) zonaId: number,
    @Body() dto: any,
  ) {
    return this.solicitudService.updateZona(id, zonaId, dto);
  }

  @Delete(':id/zonas/:zonaId')
  @HttpCode(204)
  async deleteZona(
    @Param('id', ParseIntPipe) id: number,
    @Param('zonaId', ParseIntPipe) zonaId: number,
  ) {
    await this.solicitudService.deleteZona(id, zonaId);
  }

  @Put(':id/zonas/:zonaId/validar')
  async validarZona(
    @Param('id', ParseIntPipe) id: number,
    @Param('zonaId', ParseIntPipe) zonaId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.validarZona(id, zonaId, user.sub);
  }

  @Get(':id/solicitantes')
  async findSolicitantes(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findSolicitantes(id);
  }

  @Post(':id/solicitantes')
  @HttpCode(201)
  async addSolicitante(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.solicitudService.addSolicitante(id, dto);
  }

  @Put(':id/solicitantes/:solicitanteId')
  async updateSolicitante(
    @Param('id', ParseIntPipe) id: number,
    @Param('solicitanteId', ParseIntPipe) solicitanteId: number,
    @Body() dto: any,
  ) {
    return this.solicitudService.updateSolicitante(id, solicitanteId, dto);
  }

  @Delete(':id/solicitantes/:solicitanteId')
  @HttpCode(204)
  async removeSolicitante(
    @Param('id', ParseIntPipe) id: number,
    @Param('solicitanteId', ParseIntPipe) solicitanteId: number,
  ) {
    await this.solicitudService.removeSolicitante(id, solicitanteId);
  }

  @Post(':id/victimas')
  @HttpCode(201)
  async addVictima(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { victimaId: number; radioProhibicionMetros?: number },
  ) {
    return this.solicitudService.addVictima(id, dto.victimaId, dto.radioProhibicionMetros);
  }

  @Delete(':id/victimas/:victimaId')
  @HttpCode(204)
  async removeVictima(
    @Param('id', ParseIntPipe) id: number,
    @Param('victimaId', ParseIntPipe) victimaId: number,
  ) {
    await this.solicitudService.removeVictima(id, victimaId);
  }

  @Post(':id/delitos')
  @HttpCode(201)
  async addDelito(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { delitoId: number },
  ) {
    return this.solicitudService.addDelito(id, dto.delitoId);
  }

  @Delete(':id/delitos/:delitoId')
  @HttpCode(204)
  async removeDelito(
    @Param('id', ParseIntPipe) id: number,
    @Param('delitoId', ParseIntPipe) delitoId: number,
  ) {
    await this.solicitudService.removeDelito(id, delitoId);
  }

  @Post(':id/factibilidad')
  @HttpCode(201)
  async emitirFactibilidad(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { tipoFactibilidad: string; motivoNoFactibleId?: number },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.emitirFactibilidad(id, { ...dto, emitidoPor: user.sub });
  }

  @Get(':id/factibilidad')
  async findFactibilidad(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findFactibilidad(id);
  }

  @Get(':id/sentencia')
  async findSentencia(@Param('id', ParseIntPipe) id: number) {
    return this.solicitudService.findSentencia(id);
  }

  @Put(':id/sentencia')
  async upsertSentencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.solicitudService.upsertSentencia(id, dto);
  }
}
