import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PjudController } from './controllers/pjud.controller';
import { PjudService } from './services/pjud.service';
import { PjudScheduler } from './schedulers/pjud.scheduler';
import { PjudLlamada } from './entities/pjud-llamada.entity';
import { PjudAuthGuard } from '../../common/guards/pjud-auth.guard';
import { SolicitudModule } from '../solicitud/solicitud.module';
import { EventoModule } from '../evento/evento.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PjudLlamada]),
    ConfigModule,
    SolicitudModule,
    EventoModule,
  ],
  controllers: [PjudController],
  providers: [PjudService, PjudScheduler, PjudAuthGuard],
  exports: [TypeOrmModule, PjudService],
})
export class PjudModule {}
