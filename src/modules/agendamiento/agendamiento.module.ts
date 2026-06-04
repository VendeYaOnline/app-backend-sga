import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendamientoController } from './controllers/agendamiento.controller';
import { AgendamientoService } from './services/agendamiento.service';
import { Agendamiento } from './entities/agendamiento.entity';
import { Proceso } from '../evento/entities/proceso.entity';
import { ProcesoSoporteMotivo } from '../evento/entities/proceso-soporte-motivo.entity';
import { ProcesoSoporteDetalle } from '../evento/entities/proceso-soporte-detalle.entity';
import { CatTipoProblemaSt } from '../catalogo/entities/cat-tipo-problema-st.entity';
import { ProcesoDispositivo } from '../dispositivo/entities/proceso-dispositivo.entity';
import { AccionUsuario } from '../carga-laboral/entities/accion-usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Agendamiento,
      Proceso,
      ProcesoSoporteMotivo,
      ProcesoSoporteDetalle,
      CatTipoProblemaSt,
      ProcesoDispositivo,
      AccionUsuario,
    ]),
  ],
  controllers: [AgendamientoController],
  providers: [AgendamientoService],
  exports: [TypeOrmModule, AgendamientoService],
})
export class AgendamientoModule {}
