import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargaLaboralController } from './controllers/carga-laboral.controller';
import { CargaLaboralService } from './services/carga-laboral.service';
import { AccionUsuario } from './entities/accion-usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccionUsuario])],
  controllers: [CargaLaboralController],
  providers: [CargaLaboralService],
  exports: [TypeOrmModule, CargaLaboralService],
})
export class CargaLaboralModule {}
