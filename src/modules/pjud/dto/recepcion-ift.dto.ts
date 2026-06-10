import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateCondenadoDto } from '../../persona/dto/create-condenado.dto';
import { CreateSolicitudVictimaDto } from '../../solicitud/dto/create-solicitud-victima.dto';

export class RecepcionIftZonaDto {
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
  @IsNumber()
  latitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitud?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  esReservada?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  tipoLugarId?: number;
}

export class RecepcionIftDto {
  @ApiProperty({
    description: 'ID correlativo maestro PJUD (crrIdSolicitud del contrato)',
  })
  @IsInt()
  solicitudPjudId: number;

  @ApiPropertyOptional({ description: 'ID causa PJUD (crrCausa)' })
  @IsOptional()
  @IsInt()
  causaPjudId?: number;

  @ApiPropertyOptional({ description: 'ID trámite PJUD (crrTramite)' })
  @IsOptional()
  @IsInt()
  tramitePjudId?: number;

  @ApiPropertyOptional({
    description: 'ID nomenclatura PJUD (crrNomenclatura)',
  })
  @IsOptional()
  @IsInt()
  nomenclaturaPjudId?: number;

  @ApiPropertyOptional({ description: 'ID usuario solicitante PJUD (juez)' })
  @IsOptional()
  @IsInt()
  usuarioSolicitantePjudId?: number;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  condenadoId?: number;

  @ApiPropertyOptional({ type: CreateCondenadoDto })
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

  @ApiPropertyOptional({ type: [RecepcionIftZonaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecepcionIftZonaDto)
  zonas?: RecepcionIftZonaDto[];

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  delitoIds?: number[];

  @ApiPropertyOptional({ type: [CreateSolicitudVictimaDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSolicitudVictimaDto)
  victimas?: CreateSolicitudVictimaDto[];
}
