import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendamientoController } from './controllers/agendamiento.controller';
import { AgendamientoService } from './services/agendamiento.service';
import { Agendamiento } from './entities/agendamiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agendamiento])],
  controllers: [AgendamientoController],
  providers: [AgendamientoService],
  exports: [TypeOrmModule, AgendamientoService],
})
export class AgendamientoModule {}
