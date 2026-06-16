import {
  Controller,
  Get,
  Post,
  HttpCode,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ArchivoService } from '../services/archivo.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermisosGuard } from '../../../common/guards/permisos.guard';
import { RequirePermiso } from '../../../common/decorators/require-permiso.decorator';
import { PERMISOS } from '../../../common/constants/permisos.constant';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Archivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermisosGuard)
@Controller('archivos')
export class ArchivoController {
  constructor(private readonly archivoService: ArchivoService) {}

  @Post('upload')
  @HttpCode(201)
  @RequirePermiso(PERMISOS.ARCHIVO_SUBIR)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir archivo',
    description: 'Sube un archivo y lo asocia a una entidad del sistema',
  })
  @ApiResponse({ status: 201, description: 'Archivo subido exitosamente' })
  @ApiResponse({ status: 400, description: 'Archivo inválido o faltan datos' })
  @ApiBody({
    description: 'Archivo a subir con metadatos',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        entidad: { type: 'string' },
        entidadId: { type: 'number' },
        propositoId: { type: 'number' },
      },
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('entidad') entidad: string,
    @Body('entidadId') entidadId: string,
    @Body('propositoId') propositoId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.archivoService.upload(
      file,
      entidad,
      parseInt(entidadId, 10),
      parseInt(propositoId, 10),
      user.sub,
    );
  }

  @Get(':uuid')
  @RequirePermiso(PERMISOS.SOLICITUD_LEER)
  @ApiOperation({
    summary: 'Descargar archivo por UUID',
    description: 'Descarga un archivo desde el sistema usando su UUID',
  })
  @ApiResponse({ status: 200, description: 'Archivo descargado' })
  @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
  @ApiParam({ name: 'uuid', type: String, description: 'UUID del archivo' })
  async download(@Param('uuid') uuid: string, @Res() res: Response) {
    await this.archivoService.download(uuid, res);
  }

  @Get('entidad/:entidad/:entidadId')
  @RequirePermiso(PERMISOS.SOLICITUD_LEER)
  @ApiOperation({
    summary: 'Obtener archivo por entidad',
    description:
      'Retorna la referencia de archivo más reciente asociada a una entidad',
  })
  @ApiResponse({ status: 200, description: 'Referencia de archivo encontrada' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró archivo para la entidad',
  })
  @ApiParam({
    name: 'entidad',
    type: String,
    description: 'Tipo de entidad (ej: SOLICITUD, EVENTO)',
  })
  @ApiParam({
    name: 'entidadId',
    type: Number,
    description: 'ID de la entidad',
  })
  async findOneByEntidad(
    @Param('entidad') entidad: string,
    @Param('entidadId', ParseIntPipe) entidadId: number,
  ) {
    return this.archivoService.findOneByEntidad(entidad, entidadId);
  }

  @Delete('referencias/:id')
  @HttpCode(204)
  @RequirePermiso(PERMISOS.ARCHIVO_ELIMINAR)
  @ApiOperation({
    summary: 'Eliminar referencia de archivo (soft delete)',
    description: 'Elimina lógicamente una referencia de archivo',
  })
  @ApiResponse({
    status: 200,
    description: 'Referencia eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Referencia no encontrada' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la referencia' })
  async softDeleteReferencia(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.archivoService.softDeleteReferencia(id, user.sub);
  }
}
