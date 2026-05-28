import {
  Injectable, NotFoundException, Logger, InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { PaginationMeta } from '../../../common/interfaces/pagination-meta.interface';
import { Archivo } from '../entities/archivo.entity';
import { ArchivoReferencia } from '../entities/archivo-referencia.entity';

@Injectable()
export class ArchivoService {
  private readonly logger = new Logger(ArchivoService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Archivo)
    private readonly archivoRepo: Repository<Archivo>,
    @InjectRepository(ArchivoReferencia)
    private readonly archivoRefRepo: Repository<ArchivoReferencia>,
  ) {}

  async upload(
    file: Express.Multer.File,
    entidad: string,
    entidadId: number,
    proposito: string,
    userId: number,
  ): Promise<Archivo> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;
      const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

      let archivo = await this.archivoRepo.findOne({ where: { hashSha256: hash } });

      if (!archivo) {
        const fecha = new Date();
        const dirRelativo = `${fecha.getFullYear()}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${entidad.toLowerCase()}`;
        const dirAbsoluto = path.join(process.env.STORAGE_ROOT || 'C:/sga-storage', dirRelativo);
        await fs.mkdir(dirAbsoluto, { recursive: true });

        const filename = `${Date.now()}-${file.originalname}`;
        await fs.writeFile(path.join(dirAbsoluto, filename), file.buffer);

        archivo = manager.create(Archivo, {
          uuid: crypto.randomUUID(),
          rutaRelativa: `${dirRelativo}/${filename}`,
          nombreOriginal: file.originalname,
          mimeType: file.mimetype,
          tamanoBytes: file.size,
          hashSha256: hash,
          createdBy: userId,
        });
        await manager.save(archivo);
      }

      const referencia = manager.create(ArchivoReferencia, {
        archivoId: archivo.id,
        entidad,
        entidadId,
        proposito,
        createdBy: userId,
      });
      await manager.save(referencia);

      await queryRunner.commitTransaction();
      this.logger.log(`Archivo ${archivo.uuid} subido por usuario ${userId}`);
      return archivo;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error al subir archivo', error.stack);
      throw new InternalServerErrorException('Error al subir archivo');
    } finally {
      await queryRunner.release();
    }
  }

  async download(uuid: string, res: Response): Promise<void> {
    const archivo = await this.archivoRepo.findOne({
      where: { uuid },
    });
    if (!archivo) throw new NotFoundException('Archivo no encontrado');

    const storageRoot = process.env.STORAGE_ROOT || 'C:/sga-storage';
    const rutaAbsoluta = path.join(storageRoot, archivo.rutaRelativa);

    try {
      await fs.access(rutaAbsoluta);
    } catch {
      throw new NotFoundException('Archivo físico no encontrado');
    }

    res.set({
      'Content-Type': archivo.mimeType,
      'Content-Disposition': `inline; filename="${archivo.nombreOriginal}"`,
      'Content-Length': archivo.tamanoBytes,
    });

    const stream = createReadStream(rutaAbsoluta);
    stream.pipe(res);
  }

  async findByEntidad(entidad: string, entidadId: number) {
    const refs = await this.archivoRefRepo.find({
      where: { entidad, entidadId, deletedAt: IsNull() },
      relations: { archivo: true },
      order: { createdAt: 'DESC' },
    });
    return refs;
  }

  async softDeleteReferencia(id: number, userId: number): Promise<void> {
    const ref = await this.archivoRefRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!ref) throw new NotFoundException(`Referencia de archivo con ID ${id} no encontrada`);
    ref.deletedAt = new Date();
    ref.deletedBy = userId;
    await this.archivoRefRepo.save(ref);
  }
}
