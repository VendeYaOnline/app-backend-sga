import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsuarioService } from '../services/usuario.service';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { FindUsuarioDto } from '../dto/find-usuario.dto';
import { AssignRolDto } from '../dto/assign-rol.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  async findAll(@Query() filters: FindUsuarioDto) {
    return this.usuarioService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateUsuarioDto, @CurrentUser() user: JwtPayload) {
    return this.usuarioService.create(dto, user.sub);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usuarioService.update(id, dto, user.sub);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    await this.usuarioService.softDelete(id, user.sub);
  }

  @Post(':id/roles')
  @HttpCode(201)
  async assignRol(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRolDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usuarioService.assignRol(id, dto.rolId, user.sub);
  }

  @Delete(':id/roles/:rolId')
  @HttpCode(204)
  async removeRol(
    @Param('id', ParseIntPipe) id: number,
    @Param('rolId', ParseIntPipe) rolId: number,
  ) {
    await this.usuarioService.removeRol(id, rolId);
  }
}
