import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { NotificacionService } from '../services/notificacion.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CreatePlantillaDto, UpdatePlantillaDto } from '../dto/plantilla.dto';

@ApiTags('Notificaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notificaciones')
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar notificaciones del usuario',
    description:
      'Retorna las notificaciones del usuario autenticado con filtros opcionales',
  })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query() filters: PaginationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.notificacionService.findNotificaciones({
      ...filters,
      usuarioId: user.sub,
    });
  }

  @Get('no-leidas')
  @ApiOperation({
    summary: 'Contar notificaciones no leídas',
    description:
      'Retorna la cantidad de notificaciones no leídas del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Cantidad de notificaciones no leídas',
  })
  async findNoLeidas(@CurrentUser() user: JwtPayload) {
    return this.notificacionService.findNoLeidas(user.sub);
  }

  @Put(':id/leida')
  @ApiOperation({
    summary: 'Marcar notificación como leída',
    description: 'Marca una notificación específica como leída',
  })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID de la notificación de usuario',
  })
  async marcarLeida(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.notificacionService.marcarLeida(id, user.sub);
  }

  @Put('leer-todas')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Marcar todas las notificaciones como leídas',
    description:
      'Marca todas las notificaciones pendientes del usuario como leídas',
  })
  @ApiResponse({
    status: 200,
    description: 'Todas las notificaciones marcadas como leídas',
  })
  async marcarTodasLeidas(@CurrentUser() user: JwtPayload) {
    await this.notificacionService.marcarTodasLeidas(user.sub);
    return { message: 'Todas las notificaciones marcadas como leídas' };
  }

  @Get('plantillas')
  @ApiOperation({
    summary: 'Listar plantillas de notificación',
    description: 'Retorna todas las plantillas de notificación disponibles',
  })
  @ApiResponse({ status: 200, description: 'Lista de plantillas' })
  async findAllPlantillas() {
    return this.notificacionService.findAllPlantillas();
  }

  @Get('plantillas/:id')
  @ApiOperation({
    summary: 'Ver detalle de una plantilla',
    description:
      'Retorna el detalle de una plantilla de notificación por su ID',
  })
  @ApiResponse({ status: 200, description: 'Detalle de la plantilla' })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la plantilla' })
  async findPlantilla(@Param('id', ParseIntPipe) id: number) {
    return this.notificacionService.findPlantilla(id);
  }

  @Post('plantillas')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear una nueva plantilla',
    description: 'Crea una nueva plantilla de notificación',
  })
  @ApiResponse({ status: 201, description: 'Plantilla creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiBody({ type: CreatePlantillaDto })
  async createPlantilla(@Body() dto: any) {
    return this.notificacionService.createPlantilla(dto);
  }

  @Put('plantillas/:id')
  @ApiOperation({
    summary: 'Actualizar una plantilla',
    description:
      'Actualiza los datos de una plantilla de notificación existente',
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la plantilla' })
  @ApiBody({ type: UpdatePlantillaDto })
  async updatePlantilla(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: any,
  ) {
    return this.notificacionService.updatePlantilla(id, dto);
  }
}
