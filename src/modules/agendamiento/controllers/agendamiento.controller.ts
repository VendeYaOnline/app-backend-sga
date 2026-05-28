import {
  Controller, Get, Post, Put, Body, Param, Query,
  ParseIntPipe, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AgendamientoService } from '../services/agendamiento.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreateAgendamientoDto } from '../dto/create-agendamiento.dto';
import { UpdateAgendamientoDto } from '../dto/update-agendamiento.dto';
import { UpdateEstadoAgendamientoDto } from '../dto/update-estado-agendamiento.dto';

@ApiTags('Agendamientos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agendamientos')
export class AgendamientoController {
  constructor(private readonly agendamientoService: AgendamientoService) {}

  @Get()
  async findAll(@Query() filters: PaginationDto) {
    return this.agendamientoService.findAll(filters);
  }

  @Get('calendario')
  async findCalendario(@Query() filters: any) {
    return this.agendamientoService.findCalendario(filters);
  }

  @Get('tecnicos/disponibles')
  async findTecnicosDisponibles(@Query('fecha') fecha: string) {
    return this.agendamientoService.findTecnicosDisponibles(fecha);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.agendamientoService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateAgendamientoDto, @CurrentUser() user: JwtPayload) {
    return this.agendamientoService.create(dto, user.sub);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAgendamientoDto) {
    return this.agendamientoService.update(id, dto);
  }

  @Put(':id/estado')
  async updateEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEstadoAgendamientoDto) {
    return this.agendamientoService.updateEstado(id, dto.estadoAgenda);
  }
}
