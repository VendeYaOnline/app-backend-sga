import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudController } from './controllers/solicitud.controller';
import { SolicitudService } from './services/solicitud.service';
import { Solicitud } from './entities/solicitud.entity';
import { SolicitudSolicitante } from './entities/solicitud-solicitante.entity';
import { SolicitudVictima } from './entities/solicitud-victima.entity';
import { SolicitudDelito } from './entities/solicitud-delito.entity';
import { SolicitudZona } from './entities/solicitud-zona.entity';
import { SolicitudFactibilidad } from './entities/solicitud-factibilidad.entity';
import { SolicitudSentencia } from './entities/solicitud-sentencia.entity';
import { SolicitudEstadoHist } from './entities/solicitud-estado-hist.entity';
import { AccionUsuario } from '../carga-laboral/entities/accion-usuario.entity';
import { CatEstadoSolicitud } from '../catalogo/entities/cat-estado-solicitud.entity';
import { CatEstadoSolicitudTransicion } from '../catalogo/entities/cat-estado-solicitud-transicion.entity';
import { CatTipoFactibilidad } from '../catalogo/entities/cat-tipo-factibilidad.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Solicitud,
      SolicitudSolicitante,
      SolicitudVictima,
      SolicitudDelito,
      SolicitudZona,
      SolicitudFactibilidad,
      SolicitudSentencia,
      SolicitudEstadoHist,
      AccionUsuario,
      CatEstadoSolicitud,
      CatEstadoSolicitudTransicion,
      CatTipoFactibilidad,
    ]),
  ],
  controllers: [SolicitudController],
  providers: [SolicitudService],
  exports: [TypeOrmModule, SolicitudService],
})
export class SolicitudModule {}
