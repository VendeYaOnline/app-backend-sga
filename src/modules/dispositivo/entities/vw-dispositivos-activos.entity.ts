import { ViewEntity, ViewColumn, DataSource } from 'typeorm';

@ViewEntity('sga.VW_DISPOSITIVOS_ACTIVOS', {
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select('e.solicitud_id', 'solicitudId')
      .addSelect('a.para_quien', 'paraQuien')
      .addSelect('a.condenado_id', 'condenadoId')
      .addSelect('a.victima_id', 'victimaId')
      .addSelect('pd.numero_serie', 'numeroSerie')
      .addSelect('pd.tipo_accesorio_id', 'tipoAccesorioId')
      .addSelect('pd.evento_id', 'procesoOrigenId')
      .addSelect('p.fecha_ejecucion', 'fechaUltimoMovimiento')
      .from('sga.PROCESO_DISPOSITIVO', 'pd')
      .innerJoin('sga.PROCESO', 'p', 'p.evento_id = pd.evento_id')
      .innerJoin('sga.AGENDAMIENTO', 'a', 'a.id = p.agendamiento_id')
      .innerJoin('sga.EVENTO', 'e', 'e.id = pd.evento_id')
      .where("pd.rol IN ('INSTALADO', 'REEMPLAZADO_ENTRANTE')")
      .andWhere('e.estado_evento = :estado', { estado: 'COMPLETADO' })
      .andWhere(
        `NOT EXISTS (
          SELECT 1
          FROM sga.PROCESO_DISPOSITIVO pd2
          JOIN sga.PROCESO p2 ON p2.evento_id = pd2.evento_id
          JOIN sga.AGENDAMIENTO a2 ON a2.id = p2.agendamiento_id
          JOIN sga.EVENTO e2 ON e2.id = pd2.evento_id
          WHERE e2.solicitud_id = e.solicitud_id
            AND a2.para_quien = a.para_quien
            AND pd2.numero_serie = pd.numero_serie
            AND pd2.rol IN ('RETIRADO', 'REEMPLAZADO_SALIENTE')
            AND p2.fecha_ejecucion > p.fecha_ejecucion
        )`,
      ),
})
export class VwDispositivosActivos {
  @ViewColumn({ name: 'solicitud_id' })
  solicitudId: number;

  @ViewColumn({ name: 'para_quien' })
  paraQuien: string;

  @ViewColumn({ name: 'condenado_id' })
  condenadoId: number;

  @ViewColumn({ name: 'victima_id' })
  victimaId: number;

  @ViewColumn({ name: 'numero_serie' })
  numeroSerie: string;

  @ViewColumn({ name: 'tipo_accesorio_id' })
  tipoAccesorioId: number;

  @ViewColumn({ name: 'proceso_origen_id' })
  procesoOrigenId: number;

  @ViewColumn({ name: 'fecha_ultimo_movimiento' })
  fechaUltimoMovimiento: Date;
}
