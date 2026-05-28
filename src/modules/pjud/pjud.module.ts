import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PjudController } from './controllers/pjud.controller';
import { PjudService } from './services/pjud.service';
import { PjudLlamada } from './entities/pjud-llamada.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PjudLlamada])],
  controllers: [PjudController],
  providers: [PjudService],
  exports: [TypeOrmModule, PjudService],
})
export class PjudModule {}
