import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositivoController } from './controllers/dispositivo.controller';
import { DispositivoService } from './services/dispositivo.service';
import { ProcesoDispositivo } from './entities/proceso-dispositivo.entity';
import { Agendamiento } from '../agendamiento/entities/agendamiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProcesoDispositivo, Agendamiento]),
  ],
  controllers: [DispositivoController],
  providers: [DispositivoService],
  exports: [TypeOrmModule, DispositivoService],
})
export class DispositivoModule {}
