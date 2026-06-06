import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PjudFactibilidadEnvioDto {
  @ApiProperty({
    description: 'ID correlativo de la solicitud en el sistema PJUD (solicitudPjudId)',
    example: 12345,
  })
  crrIdSolicitud: number;

  @ApiProperty({
    description: 'Fecha y hora de la respuesta de factibilidad (YYYY-MM-DD HH:mm:ss)',
    example: '2026-01-15 14:30:00',
  })
  fechaRespuesta: string;

  @ApiProperty({
    description: 'Código del tipo de factibilidad (catálogo TIPO_FACTIBILIDAD)',
    example: 'FACTIBLE',
  })
  tipoFactibilidad: string;

  @ApiPropertyOptional({
    description:
      'Código del motivo cuando la factibilidad NO es factible (catálogo MOTIVO_NO_FACTIBLE). Solo se incluye si aplica.',
    example: 'ZONA_SIN_COBERTURA',
  })
  tipoMotivo?: string;

  @ApiProperty({
    description: 'Documento PDF de factibilidad codificado en Base64',
  })
  docFactibilidad: string;
}
