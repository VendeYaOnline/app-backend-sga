import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatRegion } from '../entities/cat-region.entity';
import { CatComuna } from '../entities/cat-comuna.entity';
import { CatTribunal } from '../entities/cat-tribunal.entity';
import { CatCrs } from '../entities/cat-crs.entity';
import { CatTipoLey } from '../entities/cat-tipo-ley.entity';
import { CatPenaSustitutiva } from '../entities/cat-pena-sustitutiva.entity';
import { CatMedidaControl } from '../entities/cat-medida-control.entity';
import { CatDelito } from '../entities/cat-delito.entity';
import { CatMotivoNoFactible } from '../entities/cat-motivo-no-factible.entity';
import { CatTipoZona } from '../entities/cat-tipo-zona.entity';
import { CatTipoEvento } from '../entities/cat-tipo-evento.entity';
import { CatTipoEventoValidacion } from '../entities/cat-tipo-evento-validacion.entity';
import { CatMotivoNoRealizado } from '../entities/cat-motivo-no-realizado.entity';
import { CatTipoProblemaSt } from '../entities/cat-tipo-problema-st.entity';
import { CatTipoDia } from '../entities/cat-tipo-dia.entity';
import { CatIdentidadGenero } from '../entities/cat-identidad-genero.entity';
import { CatRolDispositivo } from '../entities/cat-rol-dispositivo.entity';
import { CatIdentificacion } from '../entities/cat-identificacion.entity';
import { CatParentesco } from '../entities/cat-parentesco.entity';
import { CatSexo } from '../entities/cat-sexo.entity';
import { CatTipoCausa } from '../entities/cat-tipo-causa.entity';
import { CatTipoLugar } from '../entities/cat-tipo-lugar.entity';
import { CatTipoHorario } from '../entities/cat-tipo-horario.entity';
import { CatPropositoArchivo } from '../entities/cat-proposito-archivo.entity';

@Injectable()
export class CatalogoService {
  constructor(
    @InjectRepository(CatRegion)
    private readonly regionRepo: Repository<CatRegion>,
    @InjectRepository(CatComuna)
    private readonly comunaRepo: Repository<CatComuna>,
    @InjectRepository(CatTribunal)
    private readonly tribunalRepo: Repository<CatTribunal>,
    @InjectRepository(CatCrs)
    private readonly crsRepo: Repository<CatCrs>,
    @InjectRepository(CatTipoLey)
    private readonly tipoLeyRepo: Repository<CatTipoLey>,
    @InjectRepository(CatPenaSustitutiva)
    private readonly penaSustRepo: Repository<CatPenaSustitutiva>,
    @InjectRepository(CatMedidaControl)
    private readonly medidaControlRepo: Repository<CatMedidaControl>,
    @InjectRepository(CatDelito)
    private readonly delitoRepo: Repository<CatDelito>,
    @InjectRepository(CatMotivoNoFactible)
    private readonly motivoNoFactibleRepo: Repository<CatMotivoNoFactible>,
    @InjectRepository(CatTipoZona)
    private readonly tipoZonaRepo: Repository<CatTipoZona>,
    @InjectRepository(CatTipoEvento)
    private readonly tipoEventoRepo: Repository<CatTipoEvento>,
    @InjectRepository(CatTipoEventoValidacion)
    private readonly tipoEventoValidacionRepo: Repository<CatTipoEventoValidacion>,
    @InjectRepository(CatMotivoNoRealizado)
    private readonly motivoNoRealizadoRepo: Repository<CatMotivoNoRealizado>,
    @InjectRepository(CatTipoProblemaSt)
    private readonly tipoProblemaStRepo: Repository<CatTipoProblemaSt>,
    @InjectRepository(CatTipoDia)
    private readonly tipoDiaRepo: Repository<CatTipoDia>,
    @InjectRepository(CatIdentidadGenero)
    private readonly identidadGeneroRepo: Repository<CatIdentidadGenero>,
    @InjectRepository(CatRolDispositivo)
    private readonly rolDispositivoRepo: Repository<CatRolDispositivo>,
    @InjectRepository(CatIdentificacion)
    private readonly identificacionRepo: Repository<CatIdentificacion>,
    @InjectRepository(CatParentesco)
    private readonly parentescoRepo: Repository<CatParentesco>,
    @InjectRepository(CatSexo)
    private readonly sexoRepo: Repository<CatSexo>,
    @InjectRepository(CatTipoCausa)
    private readonly tipoCausaRepo: Repository<CatTipoCausa>,
    @InjectRepository(CatTipoLugar)
    private readonly tipoLugarRepo: Repository<CatTipoLugar>,
    @InjectRepository(CatTipoHorario)
    private readonly tipoHorarioRepo: Repository<CatTipoHorario>,
    @InjectRepository(CatPropositoArchivo)
    private readonly propositoArchivoRepo: Repository<CatPropositoArchivo>,
  ) {}

  private readonly logger = new Logger(CatalogoService.name);

  async findRegiones() {
    return this.regionRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async findComunas(regionId?: number) {
    const where: { activo: boolean; regionId?: number } = { activo: true };
    if (regionId) where.regionId = regionId;
    return this.comunaRepo.find({ where, order: { nombre: 'ASC' } });
  }

  async findTribunales() {
    return this.tribunalRepo.find({
      where: { activo: true },
      order: { nombreTribunal: 'ASC' },
    });
  }

  async findCrs() {
    return this.crsRepo.find({
      where: { activo: true },
      order: { nombreCrs: 'ASC' },
    });
  }

  async findTiposLey() {
    return this.tipoLeyRepo.find({
      where: { activo: true },
      order: { nombreLey: 'ASC' },
    });
  }

  async findPenasSustitutivas() {
    return this.penaSustRepo.find({
      where: { activo: true },
      order: { nombrePena: 'ASC' },
    });
  }

  async findMedidasControl() {
    return this.medidaControlRepo.find({
      where: { activo: true },
      order: { descripcion: 'ASC' },
    });
  }

  async findDelitos() {
    return this.delitoRepo.find({
      where: { activo: true },
      order: { descripcionDelito: 'ASC' },
    });
  }

  async findMotivosNoFactible() {
    return this.motivoNoFactibleRepo.find({
      where: { activo: true },
      order: { descripcionMotivo: 'ASC' },
    });
  }

  async findTiposZona() {
    return this.tipoZonaRepo.find({
      where: { activo: true },
      order: { descripcionZona: 'ASC' },
    });
  }

  async findTiposEvento() {
    return this.tipoEventoRepo.find({
      where: { activo: true },
      order: { descripcionEvento: 'ASC' },
    });
  }

  async findValidacionesByTipoEvento(tipoEventoId: number) {
    return this.tipoEventoValidacionRepo.find({
      where: { tipoEventoId, activo: true },
      order: { orden: 'ASC' },
    });
  }

  async findMotivosNoRealizado() {
    return this.motivoNoRealizadoRepo.find({
      where: { activo: true },
      order: { descripcionMotivo: 'ASC' },
    });
  }

  async findTiposProblemaSt() {
    return this.tipoProblemaStRepo.find({
      where: { activo: true },
      order: { descripcionProblema: 'ASC' },
    });
  }

  async findTiposDia() {
    return this.tipoDiaRepo.find({
      where: { activo: true },
      order: { descripcionDia: 'ASC' },
    });
  }

  async findIdentidadesGenero() {
    return this.identidadGeneroRepo.find({
      where: { activo: true },
      order: { descripcionGenero: 'ASC' },
    });
  }

  async findRolesDispositivo() {
    return this.rolDispositivoRepo.find({ order: { descripcionRol: 'ASC' } });
  }

  async findTiposIdentificacion() {
    return this.identificacionRepo.find({
      where: { activo: true },
      order: { descripcionId: 'ASC' },
    });
  }

  async findParentescos() {
    return this.parentescoRepo.find({
      where: { activo: true },
      order: { descripcionParentesco: 'ASC' },
    });
  }

  async findSexos() {
    return this.sexoRepo.find({
      where: { activo: true },
      order: { descripcionSexo: 'ASC' },
    });
  }

  async findTiposCausa() {
    return this.tipoCausaRepo.find({
      where: { activo: true },
      order: { descripcionCausa: 'ASC' },
    });
  }

  async findTiposLugar() {
    return this.tipoLugarRepo.find({
      where: { activo: true },
      order: { descripcionLugar: 'ASC' },
    });
  }

  async findTiposHorario() {
    return this.tipoHorarioRepo.find({
      where: { activo: true },
      order: { descripcionHorario: 'ASC' },
    });
  }

  async findPropositosArchivo() {
    return this.propositoArchivoRepo.find({
      order: { descripcionProposito: 'ASC' },
    });
  }
}
