import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatRol } from '../entities/cat-rol.entity';
import { CatPermiso } from '../entities/cat-permiso.entity';
import { RolPermiso } from '../entities/rol-permiso.entity';
import { CreateRolDto } from '../dto/create-rol.dto';
import { UpdateRolDto } from '../dto/update-rol.dto';
import { AssignPermisosDto } from '../dto/assign-permisos.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Roles y Permisos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolController {
  constructor(
    @InjectRepository(CatRol)
    private readonly rolRepo: Repository<CatRol>,
    @InjectRepository(CatPermiso)
    private readonly permisoRepo: Repository<CatPermiso>,
    @InjectRepository(RolPermiso)
    private readonly rolPermisoRepo: Repository<RolPermiso>,
  ) {}

  @Get()
  async findAllRoles() {
    return this.rolRepo.find({ order: { nombreRol: 'ASC' } });
  }

  @Post()
  @HttpCode(201)
  async createRol(@Body() dto: CreateRolDto) {
    const rol = this.rolRepo.create(dto);
    return this.rolRepo.save(rol);
  }

  @Put(':id')
  async updateRol(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRolDto) {
    const rol = await this.rolRepo.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    Object.assign(rol, dto);
    return this.rolRepo.save(rol);
  }

  @Get(':id/permisos')
  async findPermisosByRol(@Param('id', ParseIntPipe) id: number) {
    return this.rolPermisoRepo.find({
      where: { rolId: id },
      relations: { permiso: true },
    });
  }

  @Post(':id/permisos')
  async assignPermisos(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignPermisosDto,
  ) {
    await this.rolPermisoRepo.delete({ rolId: id });
    const rolPermisos = dto.permisoIds.map((permisoId) =>
      this.rolPermisoRepo.create({ rolId: id, permisoId }),
    );
    return this.rolPermisoRepo.save(rolPermisos);
  }

  @Get('/all/permisos')
  async findAllPermisos() {
    return this.permisoRepo.find({ order: { codigo: 'ASC' } });
  }
}
