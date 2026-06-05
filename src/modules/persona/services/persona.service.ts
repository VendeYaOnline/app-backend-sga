import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Condenado } from '../entities/condenado.entity';
import { CondenadoContacto } from '../entities/condenado-contacto.entity';
import { Victima } from '../entities/victima.entity';
import { VictimaContacto } from '../entities/victima-contacto.entity';
import { CreateCondenadoDto } from '../dto/create-condenado.dto';
import { UpdateCondenadoDto } from '../dto/update-condenado.dto';
import { FindCondenadoDto } from '../dto/find-condenado.dto';
import { CreateContactoDto } from '../dto/create-contacto.dto';
import { CreateVictimaDto } from '../dto/create-victima.dto';
import { UpdateVictimaDto } from '../dto/update-victima.dto';

@Injectable()
export class PersonaService {
  constructor(
    @InjectRepository(Condenado)
    private readonly condenadoRepo: Repository<Condenado>,
    @InjectRepository(CondenadoContacto)
    private readonly condenadoContactoRepo: Repository<CondenadoContacto>,
    @InjectRepository(Victima)
    private readonly victimaRepo: Repository<Victima>,
    @InjectRepository(VictimaContacto)
    private readonly victimaContactoRepo: Repository<VictimaContacto>,
  ) {}

  private readonly logger = new Logger(PersonaService.name);

  async findCondenados(filters: FindCondenadoDto & { search?: string }) {
    const {
      page = 1,
      limit = 20,
      search,
      runCondenado,
      pasaporte,
      crsId,
    } = filters;

    const qb = this.condenadoRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.tipoIdentificacion', 'ti')
      .leftJoinAndSelect('c.sexo', 's')
      .leftJoinAndSelect('c.identidadGenero', 'ig')
      .leftJoinAndSelect('c.crs', 'crs')
      .leftJoinAndSelect('c.contactoEmergenciaParentesco', 'cep')
      .where('c.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        '(c.runCondenado LIKE :s OR c.pasaporte LIKE :s OR c.nombres LIKE :s OR c.apellidoPaterno LIKE :s)',
        { s: `%${search}%` },
      );
    }
    if (runCondenado) {
      qb.andWhere('c.runCondenado LIKE :rut', { rut: `%${runCondenado}%` });
    }
    if (pasaporte) {
      qb.andWhere('c.pasaporte LIKE :pass', { pass: `%${pasaporte}%` });
    }
    if (crsId) {
      qb.andWhere('c.crsId = :crs', { crs: crsId });
    }

    qb.orderBy('c.apellidoPaterno', 'ASC').addOrderBy('c.nombres', 'ASC');

    const skip = (page - 1) * limit;
    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findCondenadoById(id: number): Promise<Condenado> {
    const condenado = await this.condenadoRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: {
        tipoIdentificacion: true,
        sexo: true,
        identidadGenero: true,
        crs: true,
        contactoEmergenciaParentesco: true,
      },
    });
    if (!condenado)
      throw new NotFoundException(`Condenado con ID ${id} no encontrado`);
    return condenado;
  }

  async findCondenadoByRun(rut: string): Promise<Condenado | null> {
    return this.condenadoRepo.findOne({
      where: { runCondenado: rut, deletedAt: IsNull() },
    });
  }

  async findContactosByCondenado(condenadoId: number) {
    return this.condenadoContactoRepo.find({
      where: { condenadoId },
      order: { esPrincipal: 'DESC' },
    });
  }

  async createCondenado(
    dto: CreateCondenadoDto,
    userId: number,
  ): Promise<Condenado> {
    if (dto.runCondenado) {
      const existente = await this.findCondenadoByRun(dto.runCondenado);
      if (existente) {
        throw new ConflictException(
          `Ya existe un condenado con RUN ${dto.runCondenado}`,
        );
      }
    }
    const condenado = this.condenadoRepo.create({ ...dto, createdBy: userId });
    const saved = await this.condenadoRepo.save(condenado);
    this.logger.log(`Condenado creado: ID ${saved.id}`);
    return saved;
  }

  async updateCondenado(
    id: number,
    dto: UpdateCondenadoDto,
    userId: number,
  ): Promise<Condenado> {
    const condenado = await this.findCondenadoById(id);
    Object.assign(condenado, dto, { updatedBy: userId });
    const updated = await this.condenadoRepo.save(condenado);
    this.logger.log(`Condenado actualizado: ID ${updated.id}`);
    return updated;
  }

  async softDeleteCondenado(id: number, userId: number): Promise<void> {
    const condenado = await this.findCondenadoById(id);
    condenado.deletedAt = new Date();
    condenado.deletedBy = userId;
    await this.condenadoRepo.save(condenado);
    this.logger.log(`Condenado eliminado (soft delete): ID ${id}`);
  }

  async addContactoCondenado(
    condenadoId: number,
    dto: CreateContactoDto,
  ): Promise<CondenadoContacto> {
    await this.findCondenadoById(condenadoId);
    const contacto = this.condenadoContactoRepo.create({ condenadoId, ...dto });
    return this.condenadoContactoRepo.save(contacto);
  }

  async removeContactoCondenado(
    condenadoId: number,
    contactoId: number,
  ): Promise<void> {
    const contacto = await this.condenadoContactoRepo.findOne({
      where: { id: contactoId, condenadoId },
    });
    if (!contacto)
      throw new NotFoundException(
        `Contacto con ID ${contactoId} no encontrado`,
      );
    await this.condenadoContactoRepo.remove(contacto);
  }

  async findVictimas(filters: {
    page?: number;
    limit?: number;
    search?: string;
    runVictima?: string;
    datoReservado?: boolean;
  }) {
    const { page = 1, limit = 20, search, runVictima } = filters;

    const qb = this.victimaRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.tipoIdentificacion', 'ti')
      .leftJoinAndSelect('v.sexo', 's')
      .where('v.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        '(v.runVictima LIKE :s OR v.nombres LIKE :s OR v.apellidoPaterno LIKE :s)',
        { s: `%${search}%` },
      );
    }
    if (runVictima) {
      qb.andWhere('v.runVictima LIKE :rut', { rut: `%${runVictima}%` });
    }

    qb.orderBy('v.apellidoPaterno', 'ASC');

    const skip = (page - 1) * limit;
    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data: data.map((v) => (v.datoReservado ? this.maskVictimaData(v) : v)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findVictimaById(id: number): Promise<Victima> {
    const victima = await this.victimaRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { tipoIdentificacion: true, sexo: true },
    });
    if (!victima)
      throw new NotFoundException(`Víctima con ID ${id} no encontrada`);
    return victima;
  }

  async findContactosByVictima(victimaId: number) {
    return this.victimaContactoRepo.find({
      where: { victimaId },
      order: { esPrincipal: 'DESC' },
    });
  }

  async createVictima(dto: CreateVictimaDto, userId: number): Promise<Victima> {
    const victima = this.victimaRepo.create({ ...dto, createdBy: userId });
    const saved = await this.victimaRepo.save(victima);
    this.logger.log(`Víctima creada: ID ${saved.id}`);
    return saved;
  }

  async updateVictima(
    id: number,
    dto: UpdateVictimaDto,
    userId: number,
  ): Promise<Victima> {
    const victima = await this.findVictimaById(id);
    Object.assign(victima, dto, { updatedBy: userId });
    const updated = await this.victimaRepo.save(victima);
    this.logger.log(`Víctima actualizada: ID ${updated.id}`);
    return updated;
  }

  async softDeleteVictima(id: number, userId: number): Promise<void> {
    const victima = await this.findVictimaById(id);
    victima.deletedAt = new Date();
    victima.deletedBy = userId;
    await this.victimaRepo.save(victima);
    this.logger.log(`Víctima eliminada (soft delete): ID ${id}`);
  }

  async addContactoVictima(
    victimaId: number,
    dto: CreateContactoDto,
  ): Promise<VictimaContacto> {
    await this.findVictimaById(victimaId);
    const contacto = this.victimaContactoRepo.create({ victimaId, ...dto });
    return this.victimaContactoRepo.save(contacto);
  }

  async removeContactoVictima(
    victimaId: number,
    contactoId: number,
  ): Promise<void> {
    const contacto = await this.victimaContactoRepo.findOne({
      where: { id: contactoId, victimaId },
    });
    if (!contacto)
      throw new NotFoundException(
        `Contacto con ID ${contactoId} no encontrado`,
      );
    await this.victimaContactoRepo.remove(contacto);
  }

  private maskVictimaData(victima: Victima): Victima {
    return {
      ...victima,
      runVictima: '***',
      pasaporteVictima: '***',
      nombres: '***',
      apellidoPaterno: '***',
      apellidoMaterno: '***',
      emailVictima: '***',
    };
  }
}
