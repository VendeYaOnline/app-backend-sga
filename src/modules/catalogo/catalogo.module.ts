import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoController } from './controllers/catalogo.controller';
import { CatalogoService } from './services/catalogo.service';
import { CatRegion } from './entities/cat-region.entity';
import { CatComuna } from './entities/cat-comuna.entity';
import { CatTribunal } from './entities/cat-tribunal.entity';
import { CatCrs } from './entities/cat-crs.entity';
import { CatTipoLey } from './entities/cat-tipo-ley.entity';
import { CatPenaSustitutiva } from './entities/cat-pena-sustitutiva.entity';
import { CatMedidaControl } from './entities/cat-medida-control.entity';
import { CatDelito } from './entities/cat-delito.entity';
import { CatMotivoNoFactible } from './entities/cat-motivo-no-factible.entity';
import { CatTipoZona } from './entities/cat-tipo-zona.entity';
import { CatTipoEvento } from './entities/cat-tipo-evento.entity';
import { CatTipoEventoValidacion } from './entities/cat-tipo-evento-validacion.entity';
import { CatMotivoNoRealizado } from './entities/cat-motivo-no-realizado.entity';
import { CatTipoProblemaSt } from './entities/cat-tipo-problema-st.entity';
import { CatTipoAccesorio } from './entities/cat-tipo-accesorio.entity';
import { CatTipoDia } from './entities/cat-tipo-dia.entity';
import { CatIdentidadGenero } from './entities/cat-identidad-genero.entity';
import { CatRolDispositivo } from './entities/cat-rol-dispositivo.entity';
import { CatIdentificacion } from './entities/cat-identificacion.entity';
import { CatParentesco } from './entities/cat-parentesco.entity';
import { CatSexo } from './entities/cat-sexo.entity';
import { CatTipoCausa } from './entities/cat-tipo-causa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CatRegion,
      CatComuna,
      CatTribunal,
      CatCrs,
      CatTipoLey,
      CatPenaSustitutiva,
      CatMedidaControl,
      CatDelito,
      CatMotivoNoFactible,
      CatTipoZona,
      CatTipoEvento,
      CatTipoEventoValidacion,
      CatMotivoNoRealizado,
      CatTipoProblemaSt,
      CatTipoAccesorio,
      CatTipoDia,
      CatIdentidadGenero,
      CatRolDispositivo,
      CatIdentificacion,
      CatParentesco,
      CatSexo,
      CatTipoCausa,
    ]),
  ],
  controllers: [CatalogoController],
  providers: [CatalogoService],
  exports: [TypeOrmModule],
})
export class CatalogoModule {}
