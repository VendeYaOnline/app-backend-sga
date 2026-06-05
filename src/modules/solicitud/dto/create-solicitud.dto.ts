import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateCondenadoDto } from '../../persona/dto/create-condenado.dto';
import { CreateSolicitudVictimaDto } from './create-solicitud-victima.dto';

export class CreateZonaDto {
  @ApiProperty()
  @IsInt()
  tipoZonaId: number;

  @ApiProperty()
  @IsInt()
  regionId: number;

  @ApiProperty()
  @IsInt()
  comunaId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreCalle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  numeroDireccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroRuta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  poblacion?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  radioMetros: number;

  @ApiPropertyOptional()
  @IsOptional()
  latitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  longitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esReservada?: boolean;

  @ApiPropertyOptional({
    description: 'ID del tipo de lugar (CASA, APARTAMENTO, etc.)',
  })
  @IsOptional()
  @IsInt()
  tipoLugarId?: number;
}

export class CreateSolicitudDto {
  @ApiProperty({ description: 'ID del tipo de causa (RUC_RIT o ROL)' })
  @IsInt()
  tipoCausaId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rucCausa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ritCausa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  rolCausa?: string;

  @ApiProperty()
  @IsInt()
  tribunalId: number;

  @ApiProperty({
    description:
      'ID del condenado existente. Requerido si no se envían datos de condenado nuevo.',
    required: false,
  })
  @IsOptional()
  @IsInt()
  condenadoId?: number;

  @ApiPropertyOptional({
    description:
      'Datos para crear un nuevo condenado. Si se envía, se crea junto con la solicitud en la misma transacción.',
    type: CreateCondenadoDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCondenadoDto)
  condenado?: CreateCondenadoDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  crsId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoLeyId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoPenaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  medidaControlId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoHorarioId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horaDesde?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horaHasta?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoDiaInicioId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoDiaTerminoId?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  conBeacon?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ type: [CreateZonaDto] })
  @IsOptional()
  @IsArray()
  @Type(() => CreateZonaDto)
  zonas?: CreateZonaDto[];

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  delitoIds?: number[];

  @ApiPropertyOptional({ description: 'ID correlativo maestro PJUD. Solo INTERCONEXION_PJUD.' })
  @IsOptional()
  @IsInt()
  solicitudPjudId?: number;

  @ApiPropertyOptional({ description: 'ID causa PJUD (crrCausa). Auditoría.' })
  @IsOptional()
  @IsInt()
  causaPjudId?: number;

  @ApiPropertyOptional({ description: 'ID trámite PJUD (crrTramite). Auditoría.' })
  @IsOptional()
  @IsInt()
  tramitePjudId?: number;

  @ApiPropertyOptional({ description: 'ID nomenclatura PJUD (crrNomenclatura). Auditoría.' })
  @IsOptional()
  @IsInt()
  nomenclaturaPjudId?: number;

  @ApiPropertyOptional({ description: 'ID usuario solicitante PJUD (juez). NO es FK a USUARIO.' })
  @IsOptional()
  @IsInt()
  usuarioSolicitantePjudId?: number;

  @ApiPropertyOptional({ type: [CreateSolicitudVictimaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSolicitudVictimaDto)
  victimas?: CreateSolicitudVictimaDto[];
}
