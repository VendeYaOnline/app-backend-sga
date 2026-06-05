import { Controller, Post, Get, Body, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SetupDto } from '../dto/setup.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermisosGuard } from '../../../common/guards/permisos.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Iniciar sesión en el sistema',
    description:
      'Autentica al usuario con email y contraseña, retorna JWT con roles y permisos',
  })
  @ApiResponse({ status: 200, description: 'Login exitoso, retorna JWT' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Solicitar recuperación de contraseña',
    description: 'Envía instrucciones de recuperación al email registrado',
  })
  @ApiResponse({ status: 200, description: 'Instrucciones enviadas al email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Ejecutar cambio de contraseña con token',
    description: 'Restablece la contraseña usando el token enviado por email',
  })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('setup')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Inicializar el sistema (primer administrador)',
    description:
      'Crea el primer usuario administrador del sistema. Requiere un token secreto (SETUP_SECRET). Solo funciona si no existe un administrador previo. No requiere JWT.',
  })
  @ApiResponse({
    status: 201,
    description: 'Administrador creado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'Token de inicialización inválido' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un administrador en el sistema',
  })
  async setup(@Body() dto: SetupDto) {
    return this.authService.setup(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermisosGuard)
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Retorna los datos del usuario actual a partir del token JWT',
  })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.authService.getProfile(user.sub);
  }
}
