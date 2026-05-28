import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PersonaService } from '../services/persona.service';
import { CreateVictimaDto } from '../dto/create-victima.dto';
import { UpdateVictimaDto } from '../dto/update-victima.dto';
import { CreateContactoDto } from '../dto/create-contacto.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Víctimas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('victimas')
export class VictimaController {
  constructor(private readonly personaService: PersonaService) {}

  @Get()
  async findAll(@Query() filters: PaginationDto) {
    return this.personaService.findVictimas(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personaService.findVictimaById(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateVictimaDto, @CurrentUser() user: JwtPayload) {
    return this.personaService.createVictima(dto, user.sub);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVictimaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.personaService.updateVictima(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    await this.personaService.softDeleteVictima(id, user.sub);
  }

  @Get(':id/contactos')
  async findContactos(@Param('id', ParseIntPipe) id: number) {
    return this.personaService.findContactosByVictima(id);
  }

  @Post(':id/contactos')
  @HttpCode(201)
  async addContacto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateContactoDto,
  ) {
    return this.personaService.addContactoVictima(id, dto);
  }

  @Delete(':id/contactos/:contactoId')
  @HttpCode(204)
  async removeContacto(
    @Param('id', ParseIntPipe) id: number,
    @Param('contactoId', ParseIntPipe) contactoId: number,
  ) {
    await this.personaService.removeContactoVictima(id, contactoId);
  }
}
