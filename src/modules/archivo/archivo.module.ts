import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArchivoController } from './controllers/archivo.controller';
import { ArchivoService } from './services/archivo.service';
import { Archivo } from './entities/archivo.entity';
import { ArchivoReferencia } from './entities/archivo-referencia.entity';
import { CatPropositoArchivo } from '../catalogo/entities/cat-proposito-archivo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Archivo, ArchivoReferencia, CatPropositoArchivo]),
  ],
  controllers: [ArchivoController],
  providers: [ArchivoService],
  exports: [TypeOrmModule, ArchivoService],
})
export class ArchivoModule {}
