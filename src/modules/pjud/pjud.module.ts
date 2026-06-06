import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PjudController } from './controllers/pjud.controller';
import { PjudService } from './services/pjud.service';
import { PjudScheduler } from './schedulers/pjud.scheduler';
import { PjudLlamada } from './entities/pjud-llamada.entity';
import { PjudAuthGuard } from '../../common/guards/pjud-auth.guard';
import { SolicitudModule } from '../solicitud/solicitud.module';
import { EventoModule } from '../evento/evento.module';
import { ArchivoModule } from '../archivo/archivo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PjudLlamada]),
    ConfigModule,
    HttpModule,
    ArchivoModule,
    SolicitudModule,
    EventoModule,
  ],
  controllers: [PjudController],
  providers: [PjudService, PjudScheduler, PjudAuthGuard],
  exports: [TypeOrmModule, PjudService],
})
export class PjudModule {}
