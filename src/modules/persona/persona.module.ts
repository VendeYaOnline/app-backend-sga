import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Condenado } from './entities/condenado.entity';
import { CondenadoContacto } from './entities/condenado-contacto.entity';
import { Victima } from './entities/victima.entity';
import { VictimaContacto } from './entities/victima-contacto.entity';
import { CondenadoController } from './controllers/condenado.controller';
import { VictimaController } from './controllers/victima.controller';
import { PersonaService } from './services/persona.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Condenado,
      CondenadoContacto,
      Victima,
      VictimaContacto,
    ]),
  ],
  controllers: [CondenadoController, VictimaController],
  providers: [PersonaService],
  exports: [TypeOrmModule, PersonaService],
})
export class PersonaModule {}
