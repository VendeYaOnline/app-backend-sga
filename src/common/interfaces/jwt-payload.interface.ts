export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  roles: string[];
  permisos: string[];
  crsId: number | null;
}
