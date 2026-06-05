import {
  Controller,
  Get,
  Post,
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
import { RequirePermiso } from '../../../common/decorators/require-permiso.decorator';
import { PERMISOS } from '../../../common/constants/permisos.constant';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Archivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('archivos')
export class ArchivoController {
  constructor(private readonly archivoService: ArchivoService) {}

  @Post('upload')
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
        entidadId: { type: 'string' },
        proposito: { type: 'string' },
      },
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('entidad') entidad: string,
    @Body('entidadId') entidadId: string,
    @Body('proposito') proposito: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.archivoService.upload(
      file,
      entidad,
      parseInt(entidadId, 10),
      proposito,
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
    summary: 'Listar archivos por entidad',
    description: 'Retorna los archivos asociados a una entidad específica',
  })
  @ApiResponse({ status: 200, description: 'Lista de referencias de archivos' })
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
  async findByEntidad(
    @Param('entidad') entidad: string,
    @Param('entidadId', ParseIntPipe) entidadId: number,
  ) {
    return this.archivoService.findByEntidad(entidad, entidadId);
  }

  @Delete('referencias/:id')
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
