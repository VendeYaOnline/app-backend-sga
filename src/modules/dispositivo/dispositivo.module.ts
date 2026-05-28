import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositivoController } from './controllers/dispositivo.controller';
import { DispositivoService } from './services/dispositivo.service';
import { Dispositivo } from './entities/dispositivo.entity';
import { ProcesoAccesorio } from './entities/proceso-accesorio.entity';
import { ProcesoDispositivo } from './entities/proceso-dispositivo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dispositivo, ProcesoAccesorio, ProcesoDispositivo])],
  controllers: [DispositivoController],
  providers: [DispositivoService],
  exports: [TypeOrmModule, DispositivoService],
})
export class DispositivoModule {}
