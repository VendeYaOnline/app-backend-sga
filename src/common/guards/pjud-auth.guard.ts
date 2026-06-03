import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class PjudAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];
    const expectedKey = this.configService.get<string>('PJUD_API_KEY');

    if (!expectedKey) {
      throw new UnauthorizedException(
        'PJUD_API_KEY no configurada en el servidor',
      );
    }

    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('API Key inválida');
    }

    return true;
  }
}
