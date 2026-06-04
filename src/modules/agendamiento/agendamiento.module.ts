import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendamientoController } from './controllers/agendamiento.controller';
import { AgendamientoService } from './services/agendamiento.service';
import { Agendamiento } from './entities/agendamiento.entity';
import { Proceso } from '../evento/entities/proceso.entity';
import { ProcesoDispositivo } from '../dispositivo/entities/proceso-dispositivo.entity';
import { AccionUsuario } from '../carga-laboral/entities/accion-usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agendamiento,
      Proceso,
      ProcesoDispositivo,
      AccionUsuario,
    ]),
  ],
  controllers: [AgendamientoController],
  providers: [AgendamientoService],
  exports: [TypeOrmModule, AgendamientoService],
})
export class AgendamientoModule {}
