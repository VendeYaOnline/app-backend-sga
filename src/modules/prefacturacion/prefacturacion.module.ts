import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrefacturacionController } from './controllers/prefacturacion.controller';
import { PrefacturacionService } from './services/prefacturacion.service';
import { PrefactPeriodo } from './entities/prefact-periodo.entity';
import { PrefactDetalle } from './entities/prefact-detalle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrefactPeriodo, PrefactDetalle])],
  controllers: [PrefacturacionController],
  providers: [PrefacturacionService],
  exports: [TypeOrmModule, PrefacturacionService],
})
export class PrefacturacionModule {}
