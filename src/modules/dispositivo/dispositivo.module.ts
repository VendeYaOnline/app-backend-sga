import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositivoController } from './controllers/dispositivo.controller';
import { DispositivoService } from './services/dispositivo.service';
import { ProcesoDispositivo } from './entities/proceso-dispositivo.entity';
import { Agendamiento } from '../agendamiento/entities/agendamiento.entity';
import { Proceso } from '../evento/entities/proceso.entity';
import { AccionUsuario } from '../carga-laboral/entities/accion-usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProcesoDispositivo,
      Agendamiento,
      Proceso,
      AccionUsuario,
    ]),
  ],
  controllers: [DispositivoController],
  providers: [DispositivoService],
  exports: [TypeOrmModule, DispositivoService],
})
export class DispositivoModule {}
