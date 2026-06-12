import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Solicitud } from '../entities/solicitud.entity';
import { SolicitudSolicitante } from '../entities/solicitud-solicitante.entity';
import { SolicitudVictima } from '../entities/solicitud-victima.entity';
import { SolicitudDelito } from '../entities/solicitud-delito.entity';
import { SolicitudZona } from '../entities/solicitud-zona.entity';
import { SolicitudFactibilidad } from '../entities/solicitud-factibilidad.entity';
import { SolicitudEstadoHist } from '../entities/solicitud-estado-hist.entity';
import { AccionUsuario } from '../../carga-laboral/entities/accion-usuario.entity';
import { CatEstadoSolicitud } from '../../catalogo/entities/cat-estado-solicitud.entity';
import { CatEstadoSolicitudTransicion } from '../../catalogo/entities/cat-estado-solicitud-transicion.entity';
import { CatTipoFactibilidad } from '../../catalogo/entities/cat-tipo-factibilidad.entity';
import { CatRol } from '../../auth/entities/cat-rol.entity';
import { Condenado } from '../../persona/entities/condenado.entity';
import { Victima } from '../../persona/entities/victima.entity';
import { Usuario } from '../../auth/entities/usuario.entity';
import { CreateSolicitudDto } from '../dto/create-solicitud.dto';
import { UpdateSolicitudDto } from '../dto/update-solicitud.dto';
import { FindSolicitudDto } from '../dto/find-solicitud.dto';
import { TransicionEstadoDto } from '../dto/transicion-estado.dto';
import { CreateZonaDto } from '../dto/create-solicitud.dto';
import { UpdateZonaDto } from '../dto/update-zona.dto';
import { CreateSolicitanteDto } from '../dto/create-solicitante.dto';
import { UpdateSolicitanteDto } from '../dto/update-solicitante.dto';
import { PjudLlamada } from '../../pjud/entities/pjud-llamada.entity';
import { Evento } from '../../evento/entities/evento.entity';
import { Agendamiento } from '../../agendamiento/entities/agendamiento.entity';
import { Proceso } from '../../evento/entities/proceso.entity';
import { ProcesoDispositivo } from '../../dispositivo/entities/proceso-dispositivo.entity';
import { ProcesoSoporteDetalle } from '../../evento/entities/proceso-soporte-detalle.entity';
import { ProcesoSoporteMotivo } from '../../evento/entities/proceso-soporte-motivo.entity';

const ESTADO_INICIAL_CODIGO = 'RECEPCIONADA';
const ESTADO_EDITABLE_CODIGO = 'DEVUELTA_SOLICITANTE';

// Respuesta de PJUD al registrar una IFT saliente (puede cambiar con docs finales).
interface PjudRegistroIftResponse {
  crrIdSolicitud: number;
  fechaRespuesta: string;
  recepcion: number;
  folio: number;
  mensaje: string;
}

// Resultado interno del paso de registro en PJUD.
interface PjudRegistroResultado {
  solicitudPjudId: number;
  folioExterno: string;
  requestBody: string;
  responseBody: string;
}

@Injectable()
export class SolicitudService {
  private readonly logger = new Logger(SolicitudService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Solicitud)
    private readonly solicitudRepo: Repository<Solicitud>,
    @InjectRepository(SolicitudSolicitante)
    private readonly solicitanteRepo: Repository<SolicitudSolicitante>,
    @InjectRepository(SolicitudVictima)
    private readonly solicitudVictimaRepo: Repository<SolicitudVictima>,
    @InjectRepository(SolicitudDelito)
    private readonly solicitudDelitoRepo: Repository<SolicitudDelito>,
    @InjectRepository(SolicitudZona)
    private readonly solicitudZonaRepo: Repository<SolicitudZona>,
    @InjectRepository(SolicitudFactibilidad)
    private readonly factibilidadRepo: Repository<SolicitudFactibilidad>,
    @InjectRepository(SolicitudEstadoHist)
    private readonly estadoHistRepo: Repository<SolicitudEstadoHist>,
    @InjectRepository(CatEstadoSolicitud)
    private readonly estadoSolicitudRepo: Repository<CatEstadoSolicitud>,
    @InjectRepository(CatEstadoSolicitudTransicion)
    private readonly transicionRepo: Repository<CatEstadoSolicitudTransicion>,
    @InjectRepository(CatTipoFactibilidad)
    private readonly tipoFactibilidadRepo: Repository<CatTipoFactibilidad>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(filters: FindSolicitudDto) {
    const { page = 1, limit = 20, ...where } = filters;

    const qb = this.solicitudRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.condenado', 'c')
      .leftJoinAndSelect('s.tribunal', 't')
      .leftJoinAndSelect('s.crs', 'crs')
      .leftJoinAndSelect('s.asignado', 'a')
      .leftJoinAndSelect('s.solicitudVictimas', 'sv')
      .leftJoinAndSelect('sv.victima', 'v')
      .leftJoinAndSelect('s.solicitudDelitos', 'sd')
      .leftJoinAndSelect('sd.delito', 'del')
      .where('s.deletedAt IS NULL');

    if (where.id)
      qb.andWhere('s.id = :id', { id: where.id });
    if (where.estadoId)
      qb.andWhere('s.estadoActualId = :estadoId', {
        estadoId: where.estadoId,
      });
    if (where.rucCausa)
      qb.andWhere('s.rucCausa LIKE :ruc', { ruc: `%${where.rucCausa}%` });
    if (where.ritCausa)
      qb.andWhere('s.ritCausa LIKE :rit', { rit: `%${where.ritCausa}%` });
    if (where.condenadoId)
      qb.andWhere('s.condenadoId = :cid', { cid: where.condenadoId });
    if (where.crsId) qb.andWhere('s.crsId = :crs', { crs: where.crsId });
    if (where.asignadaA)
      qb.andWhere('s.asignadaA = :uid', { uid: where.asignadaA });
    if (where.origenCreacion)
      qb.andWhere('s.origenCreacion = :origen', {
        origen: where.origenCreacion,
      });
    if (where.runCondenado)
      qb.andWhere('c.runCondenado LIKE :rut', {
        rut: `%${where.runCondenado}%`,
      });
    if (where.nombresCondenado)
      qb.andWhere('c.nombres LIKE :nombres', {
        nombres: `%${where.nombresCondenado}%`,
      });
    if (where.fechaDesde)
      qb.andWhere('s.createdAt >= :desde', { desde: where.fechaDesde });
    if (where.fechaHasta)
      qb.andWhere('s.createdAt <= :hasta', {
        hasta: `${where.fechaHasta} 23:59:59`,
      });

    const allowedSortColumns = [
      'createdAt',
      'updatedAt',
      'estadoAt',
      'rucCausa',
      'ritCausa',
    ];
    const sortColumn = allowedSortColumns.includes(filters.sortBy || '')
      ? filters.sortBy
      : 'estadoAt';
    const sortDir = filters.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    qb.orderBy(`s.${sortColumn}`, sortDir);

    const skip = (page - 1) * limit;
    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    if (data.length === 0) {
      return { data, meta: { total, page, limit, totalPages: 0 } };
    }

    const solicitudIds = data.map((s) => s.id);

    const allHist = await this.estadoHistRepo
      .createQueryBuilder('seh')
      .innerJoinAndSelect('seh.estadoNuevo', 'estadoNuevo')
      .leftJoinAndSelect('seh.estadoAnterior', 'estadoAnterior')
      .leftJoinAndSelect('seh.usuario', 'u')
      .where('seh.solicitudId IN (:...ids)', { ids: solicitudIds })
      .orderBy('seh.solicitudId', 'ASC')
      .addOrderBy('seh.fechaCambio', 'ASC')
      .getMany();

    const histMap = new Map<number, SolicitudEstadoHist[]>();
    for (const h of allHist) {
      const arr = histMap.get(h.solicitudId) ?? [];
      arr.push(h);
      histMap.set(h.solicitudId, arr);
    }

    const enrichedData = data.map((s) => ({
      ...s,
      historialEstados: histMap.get(s.id) ?? [],
    }));

    return {
      data: enrichedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Solicitud> {
    const solicitud = await this.solicitudRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: {
        condenado: true,
        tribunal: true,
        crs: true,
        tipoCausa: true,
        tipoLey: true,
        tipoPena: true,
        tipoHorario: true,
        medidaControl: true,
        tipoDiaInicio: true,
        tipoDiaTermino: true,
        asignado: true,
        solicitudVictimas: { victima: true },
        solicitudDelitos: { delito: true },
      },
    });
    if (!solicitud)
      throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);
    return solicitud;
  }

  async findHistorial(solicitudId: number) {
    return this.estadoHistRepo.find({
      where: { solicitudId },
      relations: { usuario: true },
      order: { fechaCambio: 'DESC' },
    });
  }

  async findZonas(solicitudId: number) {
    return this.solicitudZonaRepo.find({
      where: { solicitudId, deletedAt: IsNull() },
      relations: { tipoZona: true, region: true, comuna: true },
    });
  }

  async findSolicitantes(solicitudId: number) {
    return this.solicitanteRepo.find({ where: { solicitudId } });
  }

  async findVictimas(solicitudId: number) {
    return this.solicitudVictimaRepo.find({
      where: { solicitudId },
      relations: { victima: true },
    });
  }

  async findDelitos(solicitudId: number) {
    return this.solicitudDelitoRepo.find({
      where: { solicitudId },
      relations: { delito: true },
    });
  }

  async findFactibilidad(solicitudId: number) {
    return this.factibilidadRepo.findOne({
      where: { solicitudId },
      relations: {
        tipoFactibilidad: true,
        motivoNoFactible: true,
        emitidoPorUsuario: true,
      },
    });
  }

  async findResumen(id: number) {
    const solicitud = await this.findOne(id);

    const eventoRepo       = this.dataSource.getRepository(Evento);
    const agendamientoRepo = this.dataSource.getRepository(Agendamiento);
    const procesoRepo      = this.dataSource.getRepository(Proceso);
    const pdRepo           = this.dataSource.getRepository(ProcesoDispositivo);
    const sdRepo           = this.dataSource.getRepository(ProcesoSoporteDetalle);
    const smRepo           = this.dataSource.getRepository(ProcesoSoporteMotivo);

    const eventos = await eventoRepo.find({
      where: { solicitudId: id, deletedAt: IsNull() },
      relations: { tipoEvento: true, asignado: true },
      order: { fechaEvento: 'ASC' },
    });

    if (!eventos.length) {
      return { solicitud, instalaciones: [], soportes: [], desinstalaciones: [] };
    }

    const eventoIds = eventos.map((e) => e.id);

    const agendamientos = await agendamientoRepo.find({
      where: { eventoId: In(eventoIds), deletedAt: IsNull() },
      relations: { condenado: true, victima: true, tecnico: true, region: true, comuna: true },
      order: { fechaAgendada: 'ASC' },
    });

    if (!agendamientos.length) {
      return {
        solicitud,
        instalaciones: eventos
          .filter((e) => e.tipoEvento?.codigo === 'INSTALACION')
          .map((e) => ({ evento: e, agendamientos: [] })),
        soportes: eventos
          .filter((e) => e.tipoEvento?.codigo === 'SOPORTE')
          .map((e) => ({ evento: e, agendamientos: [] })),
        desinstalaciones: eventos
          .filter((e) => e.tipoEvento?.codigo === 'DESINSTALACION')
          .map((e) => ({ evento: e, agendamientos: [] })),
      };
    }

    const agendamientoIds = agendamientos.map((a) => a.id);

    const [procesos, dispositivos, soporteDetalles, soporteMotivos] = await Promise.all([
      procesoRepo.find({
        where: { agendamientoId: In(agendamientoIds) },
        relations: {
          region: true,
          comuna: true,
          tipoLugar: true,
          motivoNoRealizado: true,
          cerradoPor: true,
        },
      }),
      pdRepo.find({
        where: { agendamientoId: In(agendamientoIds) },
        relations: { rolDispositivo: true },
      }),
      sdRepo.find({ where: { agendamientoId: In(agendamientoIds) } }),
      smRepo.find({
        where: { agendamientoId: In(agendamientoIds) },
        relations: { tipoProblema: true },
      }),
    ]);

    const procesoMap      = new Map(procesos.map((p) => [p.agendamientoId, p]));
    const soporteDetalleMap = new Map(soporteDetalles.map((sd) => [sd.agendamientoId, sd]));
    const dispositivosMap  = new Map<number, ProcesoDispositivo[]>();
    const soporteMotivosMap = new Map<number, ProcesoSoporteMotivo[]>();

    for (const d of dispositivos) {
      const arr = dispositivosMap.get(d.agendamientoId) ?? [];
      arr.push(d);
      dispositivosMap.set(d.agendamientoId, arr);
    }
    for (const m of soporteMotivos) {
      const arr = soporteMotivosMap.get(m.agendamientoId) ?? [];
      arr.push(m);
      soporteMotivosMap.set(m.agendamientoId, arr);
    }

    const agendamientosByEventoId = new Map<number, Record<string, unknown>[]>();
    for (const ag of agendamientos) {
      const detail: Record<string, unknown> = {
        agendamiento: ag,
        proceso: procesoMap.get(ag.id) ?? null,
        dispositivos: dispositivosMap.get(ag.id) ?? [],
        soporteDetalle: soporteDetalleMap.get(ag.id) ?? null,
        soporteMotivos: soporteMotivosMap.get(ag.id) ?? [],
      };
      const arr = agendamientosByEventoId.get(ag.eventoId) ?? [];
      arr.push(detail);
      agendamientosByEventoId.set(ag.eventoId, arr);
    }

    const instalaciones: object[] = [];
    const soportes: object[] = [];
    const desinstalaciones: object[] = [];

    for (const evento of eventos) {
      const item = { evento, agendamientos: agendamientosByEventoId.get(evento.id) ?? [] };
      const codigo = evento.tipoEvento?.codigo;
      if (codigo === 'INSTALACION') instalaciones.push(item);
      else if (codigo === 'SOPORTE') soportes.push(item);
      else if (codigo === 'DESINSTALACION') desinstalaciones.push(item);
    }

    return { solicitud, instalaciones, soportes, desinstalaciones };
  }

  async create(
    dto: CreateSolicitudDto,
    userId: number,
    origenCreacion?: string,
    userRoles: string[] = [],
  ): Promise<Solicitud> {
    if (!dto.condenadoId && !dto.condenado) {
      throw new BadRequestException(
        'Debe proporcionar condenadoId o datos de condenado nuevo',
      );
    }

    const origen = origenCreacion ?? 'FORMULARIO_WEB';

    if (origen === 'INTERCONEXION_PJUD' && !dto.solicitudPjudId) {
      throw new BadRequestException(
        'solicitudPjudId es requerido para solicitudes de origen INTERCONEXION_PJUD',
      );
    }

    // Para FORMULARIO_WEB: registrar en PJUD de forma sincrónica antes de la transacción.
    // Si falla → excepción aquí → la solicitud NO se crea en SGA.
    // TODO: reemplazar simularRegistroEnPjud() por HTTP real cuando llegue la documentación PJUD.
    let pjudRegistro: PjudRegistroResultado | null = null;
    if (origen === 'FORMULARIO_WEB') {
      pjudRegistro = this.simularRegistroEnPjud(dto);
      this.logger.log(
        `IFT web registrada en PJUD (simulado): solicitudPjudId=${pjudRegistro.solicitudPjudId}`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const manager = queryRunner.manager;

        if (dto.solicitudPjudId) {
          const existente = await manager.findOne(Solicitud, {
            where: { solicitudPjudId: dto.solicitudPjudId, deletedAt: IsNull() },
          });
          if (existente) {
            throw new ConflictException(
              `Ya existe una solicitud con solicitud_pjud_id ${dto.solicitudPjudId} (ID interno: ${existente.id})`,
            );
          }
        }

        let condenadoId = dto.condenadoId;

      if (dto.condenado) {
        if (dto.condenado.runCondenado) {
          const existente = await manager.findOne(Condenado, {
            where: {
              runCondenado: dto.condenado.runCondenado,
              deletedAt: IsNull(),
            },
          });
          if (existente) {
            condenadoId = existente.id;
          }
        }

        if (!condenadoId) {
          const nuevoCondenado = manager.create(Condenado, {
            ...dto.condenado,
            createdBy: userId,
          });
          const savedCondenado = await manager.save(nuevoCondenado);
          condenadoId = savedCondenado.id;
          this.logger.log(
            `Condenado ${savedCondenado.id} creado junto con solicitud`,
          );
        }
      }

      if (!condenadoId) {
        throw new BadRequestException('No se pudo determinar el condenado');
      }

      const estadoInicial = await manager.findOne(CatEstadoSolicitud, {
        where: { codigo: ESTADO_INICIAL_CODIGO, activo: true },
      });
      if (!estadoInicial) {
        throw new InternalServerErrorException(
          `Estado inicial ${ESTADO_INICIAL_CODIGO} no encontrado en catálogo`,
        );
      }

      const solicitud = manager.create(Solicitud, {
        tipoCausaId: dto.tipoCausaId,
        rucCausa: dto.rucCausa,
        ritCausa: dto.ritCausa,
        rolCausa: dto.rolCausa,
        tribunalId: dto.tribunalId,
        condenadoId: condenadoId,
        crsId: dto.crsId,
        tipoLeyId: dto.tipoLeyId,
        tipoPenaId: dto.tipoPenaId,
        medidaControlId: dto.medidaControlId,
        tipoHorarioId: dto.tipoHorarioId,
        horaDesde: dto.horaDesde,
        horaHasta: dto.horaHasta,
        tipoDiaInicioId: dto.tipoDiaInicioId,
        tipoDiaTerminoId: dto.tipoDiaTerminoId,
        conBeacon: dto.conBeacon ?? true,
        estadoActualId: estadoInicial.id,
        estadoAt: new Date(),
        observaciones: dto.observaciones,
        origenCreacion: origen,
        motivoOrigen: 'ORIGINAL',
        // FORMULARIO_WEB: solo solicitudPjudId viene del response PJUD; resto queda NULL.
        // INTERCONEXION_PJUD: todos los IDs vienen en el DTO enviado por PJUD.
        solicitudPjudId:          pjudRegistro?.solicitudPjudId ?? dto.solicitudPjudId ?? null,
        causaPjudId:              dto.causaPjudId              ?? null,
        tramitePjudId:            dto.tramitePjudId            ?? null,
        nomenclaturaPjudId:       dto.nomenclaturaPjudId       ?? null,
        usuarioSolicitantePjudId: dto.usuarioSolicitantePjudId ?? null,
        createdBy: userId,
      });
      const saved = await manager.save(solicitud);

      const usuario = await manager.findOne(Usuario, {
        where: { id: userId, deletedAt: IsNull() },
      });
      if (!usuario)
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);

      const solicitante = manager.create(SolicitudSolicitante, {
        solicitudId: saved.id,
        rolSolicitante: userRoles[0] ?? 'USUARIO',
        nombres: usuario.nombres,
        apellidoPaterno: usuario.apellidoPaterno,
        apellidoMaterno: usuario.apellidoMaterno,
        runSolicitante: usuario.run,
        emailSolicitante: usuario.email,
        telefono: usuario.telefonoMovil,
        esPrincipal: true,
      });
      await manager.save(solicitante);

      if (pjudRegistro) {
        const llamada = manager.create(PjudLlamada, {
          endpoint:        'REGISTRO_IFT_WEB',
          direccion:       'SALIENTE',
          solicitudPjudId: pjudRegistro.solicitudPjudId,
          solicitudId:     saved.id,
          folioExterno:    pjudRegistro.folioExterno,
          requestBody:     pjudRegistro.requestBody,
          responseBody:    pjudRegistro.responseBody,
          httpStatus:      200,
          fechaLlamada:    new Date(),
          procesadoOk:     true,
          procesadoAt:     new Date(),
          createdBy:       userId,
        });
        await manager.save(llamada);
      }

      if (dto.zonas?.length) {
        const zonas = dto.zonas.map((z) =>
          manager.create(SolicitudZona, {
            solicitudId: saved.id,
            ...z,
            createdBy: userId,
          }),
        );
        await manager.save(zonas);
      }

      if (dto.delitoIds?.length) {
        const delitos = dto.delitoIds.map((delitoId) =>
          manager.create(SolicitudDelito, { solicitudId: saved.id, delitoId }),
        );
        await manager.save(delitos);
      }

      if (dto.victimas?.length) {
        for (const v of dto.victimas) {
          let victimaId = v.victimaId;

          if (!victimaId) {
            if (!v.nombres || !v.apellidoPaterno) {
              throw new BadRequestException(
                'Cada víctima debe tener victimaId o al menos nombres y apellidoPaterno para crearla',
              );
            }
            const nuevaVictima = manager.create(Victima, {
              esExtranjero: v.esExtranjero ?? false,
              tipoIdentificacionId: v.tipoIdentificacionId,
              runVictima: v.runVictima,
              pasaporteVictima: v.pasaporteVictima,
              nombres: v.nombres,
              apellidoPaterno: v.apellidoPaterno,
              apellidoMaterno: v.apellidoMaterno,
              sexoId: v.sexoId,
              emailVictima: v.emailVictima,
              datoReservado: v.datoReservado ?? false,
              consentimiento: v.consentimiento,
              createdBy: userId,
            });
            const savedVictima = await manager.save(nuevaVictima);
            victimaId = savedVictima.id;
            this.logger.log(
              `Víctima ${savedVictima.id} creada junto con solicitud`,
            );
          }

          const vinculo = manager.create(SolicitudVictima, {
            solicitudId: saved.id,
            victimaId,
            radioProhibicionMetros: v.radioProhibicionMetros,
          });
          await manager.save(vinculo);
        }
      }

      const estadoHist = manager.create(SolicitudEstadoHist, {
        solicitudId: saved.id,
        estadoNuevoId: estadoInicial.id,
        estadoAnteriorId: null,
        usuarioId: userId,
        fechaCambio: new Date(),
      });
      await manager.save(estadoHist);

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: 'CREAR_SOLICITUD',
        entidad: 'SOLICITUD',
        entidadId: saved.id,
        solicitudId: saved.id,
        fechaAccion: new Date(),
      });
      await manager.save(accion);

      await queryRunner.commitTransaction();
      this.logger.log(`Solicitud ${saved.id} creada por usuario ${userId}`);

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: number,
    dto: UpdateSolicitudDto,
    userId: number,
  ): Promise<Solicitud> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const solicitud = await manager.findOne(Solicitud, {
        where: { id, deletedAt: IsNull() },
      });
      if (!solicitud)
        throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);

      const estadoEditable = await this.estadoSolicitudRepo.findOne({
        where: { codigo: ESTADO_EDITABLE_CODIGO, activo: true },
      });
      if (!estadoEditable || solicitud.estadoActualId !== estadoEditable.id) {
        throw new UnprocessableEntityException(
          `Solo se puede editar una solicitud en estado ${ESTADO_EDITABLE_CODIGO}`,
        );
      }

      if (dto.condenado !== undefined) {
        const condenado = await manager.findOne(Condenado, {
          where: { id: solicitud.condenadoId, deletedAt: IsNull() },
        });
        if (!condenado)
          throw new NotFoundException(
            `Condenado con ID ${solicitud.condenadoId} no encontrado`,
          );
        Object.assign(condenado, dto.condenado, { updatedBy: userId });
        await manager.save(condenado);
      }

      const { delitoIds, zonas, victimas, condenado: _c, ...scalarFields } = dto;
      Object.assign(solicitud, scalarFields, { updatedBy: userId });
      await manager.save(solicitud);

      if (delitoIds !== undefined) {
        await manager.delete(SolicitudDelito, { solicitudId: id });
        if (delitoIds.length > 0) {
          const nuevosDelitos = delitoIds.map((delitoId) =>
            manager.create(SolicitudDelito, { solicitudId: id, delitoId }),
          );
          await manager.save(nuevosDelitos);
        }
      }

      if (zonas !== undefined) {
        const zonasExistentes = await manager.find(SolicitudZona, {
          where: { solicitudId: id, deletedAt: IsNull() },
        });
        for (const zona of zonasExistentes) {
          zona.deletedAt = new Date();
          zona.deletedBy = userId;
        }
        if (zonasExistentes.length > 0) await manager.save(zonasExistentes);
        if (zonas.length > 0) {
          const nuevasZonas = zonas.map((z) =>
            manager.create(SolicitudZona, {
              solicitudId: id,
              ...z,
              createdBy: userId,
            }),
          );
          await manager.save(nuevasZonas);
        }
      }

      if (victimas !== undefined) {
        await manager.delete(SolicitudVictima, { solicitudId: id });
        for (const v of victimas) {
          let victimaId = v.victimaId;
          if (!victimaId) {
            if (!v.nombres || !v.apellidoPaterno) {
              throw new BadRequestException(
                'Cada víctima debe tener victimaId o al menos nombres y apellidoPaterno para crearla',
              );
            }
            const nuevaVictima = manager.create(Victima, {
              esExtranjero: v.esExtranjero ?? false,
              tipoIdentificacionId: v.tipoIdentificacionId,
              runVictima: v.runVictima,
              pasaporteVictima: v.pasaporteVictima,
              nombres: v.nombres,
              apellidoPaterno: v.apellidoPaterno,
              apellidoMaterno: v.apellidoMaterno,
              sexoId: v.sexoId,
              emailVictima: v.emailVictima,
              datoReservado: v.datoReservado ?? false,
              consentimiento: v.consentimiento,
              createdBy: userId,
            });
            const savedVictima = await manager.save(nuevaVictima);
            victimaId = savedVictima.id;
          }
          const vinculo = manager.create(SolicitudVictima, {
            solicitudId: id,
            victimaId,
            radioProhibicionMetros: v.radioProhibicionMetros,
          });
          await manager.save(vinculo);
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Solicitud ${id} actualizada por usuario ${userId}`);

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cambiarEstado(
    id: number,
    dto: TransicionEstadoDto,
    userId: number,
    roleCodes: string[],
  ): Promise<Solicitud> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const solicitud = await manager.findOne(Solicitud, {
        where: { id, deletedAt: IsNull() },
      });

      if (!solicitud)
        throw new NotFoundException(`Solicitud con ID ${id} no encontrada`);

      const estadoOrigenId = solicitud.estadoActualId;

      const roles = await manager.find(CatRol, {
        where: { codigo: In(roleCodes) },
      });
      const roleIds = roles.map((r) => r.id);

      if (roleIds.length === 0) {
        throw new UnprocessableEntityException(
          'El usuario no tiene roles asignados',
        );
      }

      const transicion = await manager.findOne(CatEstadoSolicitudTransicion, {
        where: {
          estadoOrigenId,
          estadoDestinoId: dto.estadoNuevoId,
          rolId: In(roleIds),
          activo: true,
        },
        relations: { estadoDestino: true, rol: true },
      });

      if (!transicion) {
        const destino = await manager.findOne(CatEstadoSolicitud, {
          where: { id: dto.estadoNuevoId },
        });
        const origen = await manager.findOne(CatEstadoSolicitud, {
          where: { id: estadoOrigenId },
        });
        throw new UnprocessableEntityException(
          `No existe transición de ${origen?.codigo ?? estadoOrigenId} a ${destino?.codigo ?? dto.estadoNuevoId} para sus roles (${roleCodes.join(', ')})`,
        );
      }

      solicitud.estadoActualId = dto.estadoNuevoId;
      solicitud.estadoAt = new Date();
      solicitud.asignadaA = userId;
      solicitud.asignadaAt = new Date();
      solicitud.updatedBy = userId;
      await manager.save(solicitud);

      const estadoHist = manager.create(SolicitudEstadoHist, {
        solicitudId: id,
        estadoNuevoId: dto.estadoNuevoId,
        estadoAnteriorId: estadoOrigenId,
        usuarioId: userId,
        motivoCambio: dto.motivo,
        fechaCambio: new Date(),
      });
      await manager.save(estadoHist);

      const accion = manager.create(AccionUsuario, {
        usuarioId: userId,
        tipoAccion: `TRANSICIONAR_${transicion.estadoDestino.codigo}`,
        entidad: 'SOLICITUD',
        entidadId: id,
        solicitudId: id,
        fechaAccion: new Date(),
      });
      await manager.save(accion);

      await queryRunner.commitTransaction();
      this.logger.log(
        `Solicitud ${id}: estado ${estadoOrigenId} → ${dto.estadoNuevoId} por usuario ${userId}`,
      );

      this.eventEmitter.emit('solicitud.cambio-estado', {
        solicitudId: id,
        estadoAnteriorId: estadoOrigenId,
        estadoNuevoId: dto.estadoNuevoId,
        usuarioId: userId,
      });

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async softDelete(id: number, userId: number): Promise<void> {
    const solicitud = await this.findOne(id);
    solicitud.deletedAt = new Date();
    solicitud.deletedBy = userId;
    await this.solicitudRepo.save(solicitud);
  }

  async addZona(solicitudId: number, dto: CreateZonaDto, userId: number) {
    await this.findOne(solicitudId);
    const zona = this.solicitudZonaRepo.create({
      solicitudId,
      ...dto,
      createdBy: userId,
    });
    return this.solicitudZonaRepo.save(zona);
  }

  async updateZona(
    solicitudId: number,
    zonaId: number,
    dto: UpdateZonaDto,
    userId: number,
  ) {
    const zona = await this.solicitudZonaRepo.findOne({
      where: { id: zonaId, solicitudId, deletedAt: IsNull() },
    });
    if (!zona)
      throw new NotFoundException(`Zona con ID ${zonaId} no encontrada`);
    Object.assign(zona, dto, { updatedBy: userId });
    return this.solicitudZonaRepo.save(zona);
  }

  async deleteZona(solicitudId: number, zonaId: number, userId: number) {
    const zona = await this.solicitudZonaRepo.findOne({
      where: { id: zonaId, solicitudId, deletedAt: IsNull() },
    });
    if (!zona)
      throw new NotFoundException(`Zona con ID ${zonaId} no encontrada`);
    zona.deletedAt = new Date();
    zona.deletedBy = userId;
    await this.solicitudZonaRepo.save(zona);
  }

  async validarZona(solicitudId: number, zonaId: number, userId: number) {
    const zona = await this.solicitudZonaRepo.findOne({
      where: { id: zonaId, solicitudId, deletedAt: IsNull() },
    });
    if (!zona)
      throw new NotFoundException(`Zona con ID ${zonaId} no encontrada`);
    zona.validada = true;
    zona.validadaAt = new Date();
    zona.validadaBy = userId;
    return this.solicitudZonaRepo.save(zona);
  }

  async addSolicitante(solicitudId: number, dto: CreateSolicitanteDto) {
    const solicitante = this.solicitanteRepo.create({ solicitudId, ...dto });
    return this.solicitanteRepo.save(solicitante);
  }

  async updateSolicitante(
    solicitudId: number,
    solicitanteId: number,
    dto: UpdateSolicitanteDto,
  ) {
    const sol = await this.solicitanteRepo.findOne({
      where: { id: solicitanteId, solicitudId },
    });
    if (!sol)
      throw new NotFoundException(
        `Solicitante con ID ${solicitanteId} no encontrado`,
      );
    Object.assign(sol, dto);
    return this.solicitanteRepo.save(sol);
  }

  async removeSolicitante(solicitudId: number, solicitanteId: number) {
    const sol = await this.solicitanteRepo.findOne({
      where: { id: solicitanteId, solicitudId },
    });
    if (!sol)
      throw new NotFoundException(
        `Solicitante con ID ${solicitanteId} no encontrado`,
      );
    await this.solicitanteRepo.remove(sol);
  }

  async addVictima(
    solicitudId: number,
    victimaId: number,
    radioProhibicionMetros?: number,
  ) {
    const existente = await this.solicitudVictimaRepo.findOne({
      where: { solicitudId, victimaId },
    });
    if (existente)
      throw new ConflictException(
        'La víctima ya está asociada a esta solicitud',
      );
    const sv = this.solicitudVictimaRepo.create({
      solicitudId,
      victimaId,
      radioProhibicionMetros,
    });
    return this.solicitudVictimaRepo.save(sv);
  }

  async removeVictima(solicitudId: number, victimaId: number) {
    const sv = await this.solicitudVictimaRepo.findOne({
      where: { solicitudId, victimaId },
    });
    if (!sv)
      throw new NotFoundException(
        'La víctima no está asociada a esta solicitud',
      );
    await this.solicitudVictimaRepo.remove(sv);
  }

  async addDelito(solicitudId: number, delitoId: number) {
    const existente = await this.solicitudDelitoRepo.findOne({
      where: { solicitudId, delitoId },
    });
    if (existente)
      throw new ConflictException(
        'El delito ya está asociado a esta solicitud',
      );
    const sd = this.solicitudDelitoRepo.create({ solicitudId, delitoId });
    return this.solicitudDelitoRepo.save(sd);
  }

  async removeDelito(solicitudId: number, delitoId: number) {
    const sd = await this.solicitudDelitoRepo.findOne({
      where: { solicitudId, delitoId },
    });
    if (!sd)
      throw new NotFoundException(
        'El delito no está asociado a esta solicitud',
      );
    await this.solicitudDelitoRepo.remove(sd);
  }

  async findTransicionesPermitidas(solicitudId: number, roleCodes: string[]) {
    const solicitud = await this.findOne(solicitudId);

    const roles = await this.dataSource.getRepository(CatRol).find({
      where: { codigo: In(roleCodes) },
    });
    const roleIds = roles.map((r) => r.id);

    if (roleIds.length === 0) return [];

    const transiciones = await this.transicionRepo.find({
      where: {
        estadoOrigenId: solicitud.estadoActualId,
        rolId: In(roleIds),
        activo: true,
      },
      relations: { estadoOrigen: true, estadoDestino: true, rol: true },
    });

    return transiciones.map((t) => ({
      id: t.id,
      estadoOrigenId: t.estadoOrigenId,
      estadoOrigenCodigo: t.estadoOrigen.codigo,
      estadoOrigenDescripcion: t.estadoOrigen.descripcionEstado,
      estadoDestinoId: t.estadoDestinoId,
      estadoDestinoCodigo: t.estadoDestino.codigo,
      estadoDestinoDescripcion: t.estadoDestino.descripcionEstado,
      rolCodigo: t.rol.codigo,
      rolNombre: t.rol.nombreRol,
    }));
  }

  async emitirFactibilidad(
    solicitudId: number,
    dto: {
      tipoFactibilidadId: number;
      motivoNoFactibleId?: number;
      emitidoPor: number;
    },
  ) {
    await this.findOne(solicitudId);

    const tipoFactibilidad = await this.tipoFactibilidadRepo.findOne({
      where: { id: dto.tipoFactibilidadId, activo: true },
    });
    if (!tipoFactibilidad) {
      throw new BadRequestException(
        `Tipo de factibilidad con ID ${dto.tipoFactibilidadId} no encontrado`,
      );
    }

    if (tipoFactibilidad.requiereMotivo && !dto.motivoNoFactibleId) {
      throw new BadRequestException(
        `El tipo de factibilidad "${tipoFactibilidad.codigo}" requiere un motivo de no factibilidad`,
      );
    }

    if (!tipoFactibilidad.requiereMotivo && dto.motivoNoFactibleId) {
      throw new BadRequestException(
        `El tipo de factibilidad "${tipoFactibilidad.codigo}" no admite motivo de no factibilidad`,
      );
    }

    const existente = await this.factibilidadRepo.findOne({
      where: { solicitudId },
    });
    if (existente)
      throw new ConflictException(
        'Ya existe un informe de factibilidad para esta solicitud',
      );

    const lastFolio = await this.factibilidadRepo
      .createQueryBuilder('f')
      .select('MAX(f.folioInterno)', 'maxFolio')
      .getRawOne<{ maxFolio: number }>();
    const folio = (lastFolio?.maxFolio || 0) + 1;

    const factibilidad = this.factibilidadRepo.create({
      solicitudId,
      tipoFactibilidadId: dto.tipoFactibilidadId,
      motivoNoFactibleId: dto.motivoNoFactibleId ?? null,
      folioInterno: folio,
      fechaEmision: new Date(),
      emitidoPor: dto.emitidoPor,
    });
    return this.factibilidadRepo.save(factibilidad);
  }

  // Simula la llamada saliente a PJUD para registrar una IFT de origen FORMULARIO_WEB.
  // Retorna la misma estructura que devolvería el endpoint PJUD real.
  // TODO: reemplazar el cuerpo por el HTTP real cuando llegue la documentación PJUD.
  private simularRegistroEnPjud(dto: CreateSolicitudDto): PjudRegistroResultado {
    const rand = () => Math.floor(100_000 + Math.random() * 900_000_000);

    const requestBody = JSON.stringify({
      tipoCausaId:      dto.tipoCausaId,
      rucCausa:         dto.rucCausa,
      ritCausa:         dto.ritCausa,
      rolCausa:         dto.rolCausa,
      tribunalId:       dto.tribunalId,
      condenadoId:      dto.condenadoId,
      crsId:            dto.crsId,
      tipoLeyId:        dto.tipoLeyId,
      tipoPenaId:       dto.tipoPenaId,
      medidaControlId:  dto.medidaControlId,
      tipoHorarioId:    dto.tipoHorarioId,
      horaDesde:        dto.horaDesde,
      horaHasta:        dto.horaHasta,
      tipoDiaInicioId:  dto.tipoDiaInicioId,
      tipoDiaTerminoId: dto.tipoDiaTerminoId,
      conBeacon:        dto.conBeacon ?? true,
      observaciones:    dto.observaciones,
    });

    const crrIdSolicitud = rand();
    const folio = rand();

    const pjudResponse: PjudRegistroIftResponse = {
      crrIdSolicitud,
      fechaRespuesta: new Date().toISOString(),
      recepcion: 1,
      folio,
      mensaje: 'IFT Recibido Correctamente',
    };

    return {
      solicitudPjudId: crrIdSolicitud,
      folioExterno:    String(folio),
      requestBody,
      responseBody:    JSON.stringify(pjudResponse),
    };
  }
}
