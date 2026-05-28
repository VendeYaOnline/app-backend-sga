import {
  Controller, Get, Post, Delete, Param,
  ParseIntPipe, UseGuards, Res, Req, UseInterceptors, UploadedFile, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ArchivoService } from '../services/archivo.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@ApiTags('Archivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('archivos')
export class ArchivoController {
  constructor(private readonly archivoService: ArchivoService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('entidad') entidad: string,
    @Body('entidadId') entidadId: string,
    @Body('proposito') proposito: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.archivoService.upload(file, entidad, parseInt(entidadId, 10), proposito, user.sub);
  }

  @Get(':uuid')
  async download(@Param('uuid') uuid: string, @Res() res: Response) {
    await this.archivoService.download(uuid, res);
  }

  @Get('entidad/:entidad/:entidadId')
  async findByEntidad(
    @Param('entidad') entidad: string,
    @Param('entidadId', ParseIntPipe) entidadId: number,
  ) {
    return this.archivoService.findByEntidad(entidad, entidadId);
  }

  @Delete('referencias/:id')
  async softDeleteReferencia(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.archivoService.softDeleteReferencia(id, user.sub);
    return { message: 'Referencia eliminada exitosamente' };
  }
}
