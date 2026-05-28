import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PersonaService } from '../services/persona.service';
import { CreateCondenadoDto } from '../dto/create-condenado.dto';
import { UpdateCondenadoDto } from '../dto/update-condenado.dto';
import { FindCondenadoDto } from '../dto/find-condenado.dto';
import { CreateContactoDto } from '../dto/create-contacto.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Condenados')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('condenados')
export class CondenadoController {
  constructor(private readonly personaService: PersonaService) {}

  @Get()
  async findAll(@Query() filters: FindCondenadoDto) {
    return this.personaService.findCondenados(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.personaService.findCondenadoById(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateCondenadoDto, @CurrentUser() user: JwtPayload) {
    return this.personaService.createCondenado(dto, user.sub);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCondenadoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.personaService.updateCondenado(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    await this.personaService.softDeleteCondenado(id, user.sub);
  }

  @Get(':id/contactos')
  async findContactos(@Param('id', ParseIntPipe) id: number) {
    return this.personaService.findContactosByCondenado(id);
  }

  @Post(':id/contactos')
  @HttpCode(201)
  async addContacto(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateContactoDto,
  ) {
    return this.personaService.addContactoCondenado(id, dto);
  }

  @Delete(':id/contactos/:contactoId')
  @HttpCode(204)
  async removeContacto(
    @Param('id', ParseIntPipe) id: number,
    @Param('contactoId', ParseIntPipe) contactoId: number,
  ) {
    await this.personaService.removeContactoCondenado(id, contactoId);
  }
}
