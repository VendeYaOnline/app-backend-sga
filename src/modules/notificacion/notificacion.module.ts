import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionController } from './controllers/notificacion.controller';
import { NotificacionService } from './services/notificacion.service';
import { Notificacion } from './entities/notificacion.entity';
import { NotificacionUsuario } from './entities/notificacion-usuario.entity';
import { NotificacionPlantilla } from './entities/notificacion-plantilla.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notificacion,
      NotificacionUsuario,
      NotificacionPlantilla,
    ]),
  ],
  controllers: [NotificacionController],
  providers: [NotificacionService],
  exports: [TypeOrmModule, NotificacionService],
})
export class NotificacionModule {}
