import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargaLaboralController } from './controllers/carga-laboral.controller';
import { CargaLaboralService } from './services/carga-laboral.service';
import { AccionUsuario } from './entities/accion-usuario.entity';
import { UsuarioRol } from '../auth/entities/usuario-rol.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { SolicitudEstadoHist } from '../solicitud/entities/solicitud-estado-hist.entity';
import { SolicitudFactibilidad } from '../solicitud/entities/solicitud-factibilidad.entity';
import { Agendamiento } from '../agendamiento/entities/agendamiento.entity';
import { Proceso } from '../evento/entities/proceso.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccionUsuario,
      UsuarioRol,
      Usuario,
      Solicitud,
      SolicitudEstadoHist,
      SolicitudFactibilidad,
      Agendamiento,
      Proceso,
    ]),
  ],
  controllers: [CargaLaboralController],
  providers: [CargaLaboralService],
  exports: [TypeOrmModule, CargaLaboralService],
})
export class CargaLaboralModule {}
