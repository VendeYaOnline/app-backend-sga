import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../entities/usuario.entity';
import { UsuarioService } from './usuario.service';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
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
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.usuarioService.findByUsername(dto.username);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!usuario.activo || usuario.bloqueado) {
      throw new UnauthorizedException(
        usuario.bloqueado ? 'Usuario bloqueado. Contacte al administrador.' : 'Usuario inactivo',
      );
    }

    if (!usuario.passHash) {
      throw new UnauthorizedException('El usuario no tiene contraseña configurada');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, usuario.passHash);
    if (!isPasswordValid) {
      usuario.intentosFallidos += 1;
      if (usuario.intentosFallidos >= this.MAX_INTENTOS) {
        usuario.bloqueado = true;
        usuario.bloqueadoAt = new Date();
        this.logger.warn(`Usuario ${usuario.username} bloqueado por intentos fallidos`);
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
    const permisos = await this.usuarioService.findPermisosByUsuario(usuario.id);

    const payload: JwtPayload = {
      sub: usuario.id,
      username: usuario.username,
      email: usuario.email,
      roles: roles.map((r) => r.codigo),
      permisos,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`Usuario ${usuario.username} (ID: ${usuario.id}) inició sesión exitosamente`);

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
      rut: usuario.rut,
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
      return { message: 'Si el email existe, se enviarán instrucciones de recuperación' };
    }

    this.logger.log(`Solicitud de recuperación de contraseña para ${usuario.email}`);

    return { message: 'Si el email existe, se enviarán instrucciones de recuperación' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    this.logger.log(`Intento de reset de contraseña con token: ${dto.token.substring(0, 10)}...`);

    throw new BadRequestException('Token inválido o expirado');
  }

  async setPassword(usuarioId: number, newPassword: string) {
    const usuario = await this.usuarioService.findOne(usuarioId);
    const salt = await bcrypt.genSalt(10);
    usuario.passHash = await bcrypt.hash(newPassword, salt);
    usuario.debeCambiarPass = false;
    await this.usuarioRepo.save(usuario);
  }
}
