import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargaLaboralController } from './controllers/carga-laboral.controller';
import { CargaLaboralService } from './services/carga-laboral.service';
import { AccionUsuario } from './entities/accion-usuario.entity';
import { UsuarioRol } from '../auth/entities/usuario-rol.entity';
import { Solicitud } from '../solicitud/entities/solicitud.entity';
import { SolicitudEstadoHist } from '../solicitud/entities/solicitud-estado-hist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccionUsuario,
      UsuarioRol,
      Solicitud,
      SolicitudEstadoHist,
    ]),
  ],
  controllers: [CargaLaboralController],
  providers: [CargaLaboralService],
  exports: [TypeOrmModule, CargaLaboralService],
})
export class CargaLaboralModule {}
