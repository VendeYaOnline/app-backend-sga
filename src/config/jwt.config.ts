import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'clave-secreta-default',
  expiresIn: process.env.JWT_EXPIRES_IN || '8h',
}));
