import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISO = 'required_permiso';
export const RequirePermiso = (codigo: string) =>
  SetMetadata(REQUIRED_PERMISO, codigo);
