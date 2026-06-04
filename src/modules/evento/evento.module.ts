import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoController } from './controllers/evento.controller';
import { EventoService } from './services/evento.service';
import { Evento } from './entities/evento.entity';
import { EventoValidacion } from './entities/evento-validacion.entity';
import { Resolucion } from './entities/resolucion.entity';
import { ResolucionCambioDomicilio } from './entities/resolucion-cambio-domicilio.entity';
import { Proceso } from './entities/proceso.entity';
import { ProcesoSoporteDetalle } from './entities/proceso-soporte-detalle.entity';
import { ProcesoSoporteMotivo } from './entities/proceso-soporte-motivo.entity';
import { AccionUsuario } from '../carga-laboral/entities/accion-usuario.entity';
import { CatTipoEvento } from '../catalogo/entities/cat-tipo-evento.entity';
import { CatTipoEventoValidacion } from '../catalogo/entities/cat-tipo-evento-validacion.entity';
import { CatTipoCausa } from '../catalogo/entities/cat-tipo-causa.entity';
import { ProcesoDispositivo } from '../dispositivo/entities/proceso-dispositivo.entity';
import { Agendamiento } from '../agendamiento/entities/agendamiento.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Evento,
      EventoValidacion,
      Resolucion,
      ResolucionCambioDomicilio,
      Proceso,
      ProcesoSoporteDetalle,
      ProcesoSoporteMotivo,
      ProcesoDispositivo,
      AccionUsuario,
      CatTipoEvento,
      CatTipoEventoValidacion,
      CatTipoCausa,
      Agendamiento,
    ]),
  ],
  controllers: [EventoController],
  providers: [EventoService],
  exports: [TypeOrmModule, EventoService],
})
export class EventoModule {}
