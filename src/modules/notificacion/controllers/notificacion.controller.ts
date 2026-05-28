import {
  Controller, Get, Post, Put, Body, Param, Query,
  ParseIntPipe, HttpCode, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificacionService } from '../services/notificacion.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@ApiTags('Notificaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Get()
  async findAll(@Query() filters: PaginationDto, @CurrentUser() user: JwtPayload) {
    return this.notificacionService.findNotificaciones({ ...filters, usuarioId: user.sub });
  }

  @Get('no-leidas')
  async findNoLeidas(@CurrentUser() user: JwtPayload) {
    return this.notificacionService.findNoLeidas(user.sub);
  }

  @Put(':id/leida')
  async marcarLeida(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.notificacionService.marcarLeida(id, user.sub);
  }

  @Put('leer-todas')
  @HttpCode(200)
  async marcarTodasLeidas(@CurrentUser() user: JwtPayload) {
    await this.notificacionService.marcarTodasLeidas(user.sub);
    return { message: 'Todas las notificaciones marcadas como leídas' };
  }

  @Get('plantillas')
  async findAllPlantillas() {
    return this.notificacionService.findAllPlantillas();
  }

  @Get('plantillas/:id')
  async findPlantilla(@Param('id', ParseIntPipe) id: number) {
    return this.notificacionService.findPlantilla(id);
  }

  @Post('plantillas')
  @HttpCode(201)
  async createPlantilla(@Body() dto: any) {
    return this.notificacionService.createPlantilla(dto);
  }

  @Put('plantillas/:id')
  async updatePlantilla(@Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    return this.notificacionService.updatePlantilla(id, dto);
  }
}
