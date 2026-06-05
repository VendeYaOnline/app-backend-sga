import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { CatRol } from '../entities/cat-rol.entity';
import { CatPermiso } from '../entities/cat-permiso.entity';
import { RolPermiso } from '../entities/rol-permiso.entity';
import { UsuarioRol } from '../entities/usuario-rol.entity';
import { UsuarioService } from './usuario.service';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SetupDto } from '../dto/setup.dto';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_INTENTOS = 5;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usuarioService: UsuarioService,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(CatRol)
    private readonly rolRepo: Repository<CatRol>,
    @InjectRepository(CatPermiso)
    private readonly permisoRepo: Repository<CatPermiso>,
    @InjectRepository(RolPermiso)
    private readonly rolPermisoRepo: Repository<RolPermiso>,
    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepo: Repository<UsuarioRol>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuarioRepo.findOne({
      where: { email: dto.email, deletedAt: IsNull() },
      select: {
        id: true,
        username: true,
        email: true,
        run: true,
        nombres: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        activo: true,
        bloqueado: true,
        bloqueadoAt: true,
        intentosFallidos: true,
        debeCambiarPass: true,
        ultimoLogin: true,
        passHash: true,
      },
    });
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo || usuario.bloqueado) {
      throw new UnauthorizedException(
        usuario.bloqueado
          ? 'Usuario bloqueado. Contacte al administrador.'
          : 'Usuario inactivo',
      );
    }

    if (!usuario.passHash) {
      throw new UnauthorizedException(
        'El usuario no tiene contraseña configurada',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      usuario.passHash,
    );
    if (!isPasswordValid) {
      usuario.intentosFallidos += 1;
      if (usuario.intentosFallidos >= this.MAX_INTENTOS) {
        usuario.bloqueado = true;
        usuario.bloqueadoAt = new Date();
        this.logger.warn(
          `Usuario ${usuario.username} bloqueado por intentos fallidos`,
        );
      }
      await this.usuarioRepo.save(usuario);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    usuario.intentosFallidos = 0;
    usuario.bloqueado = false;
    usuario.bloqueadoAt = null;
    usuario.ultimoLogin = new Date();
    await this.usuarioRepo.save(usuario);

    const roles = await this.usuarioService.findRolesByUsuario(usuario.id);
    const permisos = await this.usuarioService.findPermisosByUsuario(
      usuario.id,
    );

    const payload: JwtPayload = {
      sub: usuario.id,
      username: usuario.username,
      email: usuario.email,
      roles: roles.map((r) => r.codigo),
      permisos,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(
      `Usuario ${usuario.username} (ID: ${usuario.id}) inició sesión exitosamente`,
    );

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        nombres: usuario.nombres,
        apellidoPaterno: usuario.apellidoPaterno,
        roles: roles.map((r) => r.codigo),
        permisos,
        debeCambiarPass: usuario.debeCambiarPass,
      },
    };
  }

  async getProfile(userId: number) {
    const usuario = await this.usuarioService.findOne(userId);
    const roles = await this.usuarioService.findRolesByUsuario(userId);
    const permisos = await this.usuarioService.findPermisosByUsuario(userId);

    return {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      run: usuario.run,
      nombres: usuario.nombres,
      apellidoPaterno: usuario.apellidoPaterno,
      apellidoMaterno: usuario.apellidoMaterno,
      telefonoMovil: usuario.telefonoMovil,
      region: usuario.region,
      crs: usuario.crs,
      tribunal: usuario.tribunal,
      roles: roles.map((r) => r.codigo),
      permisos,
      debeCambiarPass: usuario.debeCambiarPass,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const usuario = await this.usuarioService.findByEmail(dto.email);
    if (!usuario) {
      return {
        message:
          'Si el email existe, se enviarán instrucciones de recuperación',
      };
    }

    this.logger.log(
      `Solicitud de recuperación de contraseña para ${usuario.email}`,
    );

    return {
      message: 'Si el email existe, se enviarán instrucciones de recuperación',
    };
  }

  resetPassword(dto: ResetPasswordDto) {
    this.logger.log(
      `Intento de reset de contraseña con token: ${dto.token.substring(0, 10)}...`,
    );

    throw new BadRequestException('Token inválido o expirado');
  }

  async setPassword(usuarioId: number, newPassword: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id: usuarioId, deletedAt: IsNull() },
      select: { id: true, passHash: true, debeCambiarPass: true },
    });
    if (!usuario) {
      throw new BadRequestException('Usuario no encontrado');
    }
    const salt = await bcrypt.genSalt(10);
    usuario.passHash = await bcrypt.hash(newPassword, salt);
    usuario.debeCambiarPass = false;
    await this.usuarioRepo.save(usuario);
  }

  async setup(dto: SetupDto) {
    const setupSecret = process.env.SETUP_SECRET;
    if (!setupSecret) {
      throw new BadRequestException(
        'SETUP_SECRET no está configurado en el servidor',
      );
    }

    if (dto.setupSecret !== setupSecret) {
      this.logger.warn('Intento de setup con token secreto inválido');
      throw new UnauthorizedException('Token de inicialización inválido');
    }

    const adminExistente = await this.rolRepo.findOne({
      where: { codigo: 'ADMINISTRADOR' },
    });
    if (adminExistente) {
      const usuariosConRol = await this.usuarioRolRepo.count({
        where: { rolId: adminExistente.id },
      });
      if (usuariosConRol > 0) {
        throw new ConflictException(
          'Ya existe un administrador en el sistema. El endpoint de setup solo puede usarse una vez.',
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      let rolAdmin = await manager.findOne(CatRol, {
        where: { codigo: 'ADMINISTRADOR' },
      });
      if (!rolAdmin) {
        rolAdmin = manager.create(CatRol, {
          codigo: 'ADMINISTRADOR',
          nombreRol: 'Administrador del Sistema',
          descripcionRol: 'Acceso total al sistema SGA. Todos los permisos.',
        });
        await manager.save(rolAdmin);
      }

      const permisosPorDefecto = [
        { codigo: 'SOLICITUD_LEER', nombrePermiso: 'Ver solicitudes IFT' },
        { codigo: 'SOLICITUD_CREAR', nombrePermiso: 'Crear solicitudes IFT' },
        { codigo: 'SOLICITUD_EDITAR', nombrePermiso: 'Editar solicitudes IFT' },
        {
          codigo: 'SOLICITUD_ELIMINAR',
          nombrePermiso: 'Eliminar solicitudes IFT',
        },
        {
          codigo: 'SOLICITUD_TRANSICIONAR',
          nombrePermiso: 'Cambiar estado de solicitudes',
        },
        {
          codigo: 'SOLICITUD_EMITIR_FACTIBILIDAD',
          nombrePermiso: 'Emitir informes de factibilidad',
        },
        { codigo: 'EVENTO_LEER', nombrePermiso: 'Ver eventos' },
        { codigo: 'EVENTO_CREAR', nombrePermiso: 'Crear eventos' },
        { codigo: 'EVENTO_EDITAR', nombrePermiso: 'Editar eventos' },
        {
          codigo: 'EVENTO_VALIDAR',
          nombrePermiso: 'Ejecutar validaciones de eventos',
        },
        { codigo: 'PROCESO_LEER', nombrePermiso: 'Ver procesos' },
        {
          codigo: 'PROCESO_CERRAR',
          nombrePermiso: 'Cerrar procesos en terreno',
        },
        {
          codigo: 'AGENDAMIENTO_GESTIONAR',
          nombrePermiso: 'Gestionar agendamientos',
        },
        {
          codigo: 'DISPOSITIVO_GESTIONAR',
          nombrePermiso: 'Gestionar dispositivos',
        },
        { codigo: 'USUARIO_LEER', nombrePermiso: 'Ver usuarios' },
        { codigo: 'USUARIO_CREAR', nombrePermiso: 'Crear usuarios' },
        { codigo: 'USUARIO_EDITAR', nombrePermiso: 'Editar usuarios' },
        { codigo: 'USUARIO_ELIMINAR', nombrePermiso: 'Eliminar usuarios' },
        {
          codigo: 'ROL_GESTIONAR',
          nombrePermiso: 'Gestionar roles y permisos',
        },
        { codigo: 'CONDENADO_CREAR', nombrePermiso: 'Registrar condenados' },
        { codigo: 'CONDENADO_EDITAR', nombrePermiso: 'Editar condenados' },
        { codigo: 'VICTIMA_CREAR', nombrePermiso: 'Registrar víctimas' },
        { codigo: 'VICTIMA_EDITAR', nombrePermiso: 'Editar víctimas' },
        { codigo: 'ARCHIVO_SUBIR', nombrePermiso: 'Subir archivos' },
        { codigo: 'ARCHIVO_ELIMINAR', nombrePermiso: 'Eliminar archivos' },
        {
          codigo: 'PREFACTURACION_GESTIONAR',
          nombrePermiso: 'Gestionar prefacturación',
        },
        {
          codigo: 'CARGA_LABORAL_VER',
          nombrePermiso: 'Ver reportes de carga laboral',
        },
        {
          codigo: 'PJUD_GESTIONAR',
          nombrePermiso: 'Gestionar interconexión PJUD',
        },
      ];

      const permisoIds: number[] = [];
      for (const p of permisosPorDefecto) {
        let permiso = await manager.findOne(CatPermiso, {
          where: { codigo: p.codigo },
        });
        if (!permiso) {
          permiso = manager.create(CatPermiso, p);
          await manager.save(permiso);
        }
        permisoIds.push(permiso.id);
      }

      const existentes = await manager.find(RolPermiso, {
        where: { rolId: rolAdmin.id },
      });
      const existentesIds = new Set(existentes.map((rp) => rp.permisoId));
      const nuevos = permisoIds.filter((pid) => !existentesIds.has(pid));
      if (nuevos.length > 0) {
        const rolPermisos = nuevos.map((permisoId) =>
          manager.create(RolPermiso, { rolId: rolAdmin.id, permisoId }),
        );
        await manager.save(rolPermisos);
      }

      const existenteUser = await manager.findOne(Usuario, {
        where: { username: dto.username },
      });
      if (existenteUser) {
        throw new ConflictException(`El username "${dto.username}" ya existe`);
      }

      const existenteEmail = await manager.findOne(Usuario, {
        where: { email: dto.email },
      });
      if (existenteEmail) {
        throw new ConflictException(
          `El email "${dto.email}" ya está registrado`,
        );
      }

      const existenteRun = await manager.findOne(Usuario, {
        where: { run: dto.run },
      });
      if (existenteRun) {
        throw new ConflictException(`El RUN "${dto.run}" ya está registrado`);
      }

      const salt = await bcrypt.genSalt(10);
      const passHash = await bcrypt.hash(dto.password, salt);

      const adminUser = manager.create(Usuario, {
        username: dto.username,
        email: dto.email,
        run: dto.run,
        nombres: dto.nombres,
        apellidoPaterno: dto.apellidoPaterno,
        passHash,
        activo: true,
        debeCambiarPass: false,
      });
      const savedUser = await manager.save(adminUser);

      const usuarioRol = manager.create(UsuarioRol, {
        usuarioId: savedUser.id,
        rolId: rolAdmin.id,
      });
      await manager.save(usuarioRol);

      await queryRunner.commitTransaction();

      this.logger.log(
        `Admin inicial "${dto.username}" creado exitosamente vía setup`,
      );

      return {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        rol: 'ADMINISTRADOR',
        message:
          'Administrador inicial creado exitosamente. Use el endpoint POST /auth/login para obtener un JWT.',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
