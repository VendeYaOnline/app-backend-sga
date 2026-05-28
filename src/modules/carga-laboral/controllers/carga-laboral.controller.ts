import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CargaLaboralService } from '../services/carga-laboral.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@ApiTags('Carga Laboral')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('carga-laboral')
export class CargaLaboralController {
  constructor(private readonly cargaLaboralService: CargaLaboralService) {}

  @Get('resumen')
  async findResumen(@Query() filters: any) {
    return this.cargaLaboralService.findResumen(filters);
  }

  @Get('detalle')
  async findDetalle(@Query() filters: any) {
    return this.cargaLaboralService.findDetalle(filters);
  }

  @Get('exportar')
  async exportar(@Query() filters: any) {
    return this.cargaLaboralService.exportar(filters);
  }
}
