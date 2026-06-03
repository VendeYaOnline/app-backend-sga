import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './controllers/auth.controller';
import { UsuarioController } from './controllers/usuario.controller';
import { RolController } from './controllers/rol.controller';
import { AuthService } from './services/auth.service';
import { UsuarioService } from './services/usuario.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Usuario } from './entities/usuario.entity';
import { UsuarioRol } from './entities/usuario-rol.entity';
import { CatRol } from './entities/cat-rol.entity';
import { CatPermiso } from './entities/cat-permiso.entity';
import { RolPermiso } from './entities/rol-permiso.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      UsuarioRol,
      CatRol,
      CatPermiso,
      RolPermiso,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret') || 'default-secret',
        signOptions: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          expiresIn: (config.get<string>('jwt.expiresIn') || '8h') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, UsuarioController, RolController],
  providers: [AuthService, UsuarioService, JwtStrategy],
  exports: [AuthService, UsuarioService, JwtModule],
})
export class AuthModule {}
