import { IsOptional, IsInt, IsString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FindAgendamientoDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filtrar por tipo de evento ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tipoEventoId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por evento ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  eventoId?: number;

  @ApiPropertyOptional({ description: 'Filtrar por técnico asignado ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  asignadoA?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por destinatario (CONDENADO o VICTIMA)',
  })
  @IsOptional()
  @IsString()
  paraQuien?: string;

  @ApiPropertyOptional({
    description:
      'Filtrar por estado de agenda (EN_PROCESO, NO_REALIZADO, COMPLETADO, CANCELADO)',
  })
  @IsOptional()
  @IsString()
  estadoAgenda?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por agendamientos abiertos (true) o cerrados (false)',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value as boolean | undefined;
  })
  @IsBoolean()
  estaAbierto?: boolean;
}
