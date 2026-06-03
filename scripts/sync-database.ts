import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('.env file not found, usando variables de entorno del sistema');
    return;
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

import { Usuario } from '../src/modules/auth/entities/usuario.entity';
import { UsuarioRol } from '../src/modules/auth/entities/usuario-rol.entity';
import { CatRol } from '../src/modules/auth/entities/cat-rol.entity';
import { CatPermiso } from '../src/modules/auth/entities/cat-permiso.entity';
import { RolPermiso } from '../src/modules/auth/entities/rol-permiso.entity';

import { CatRegion } from '../src/modules/catalogo/entities/cat-region.entity';
import { CatComuna } from '../src/modules/catalogo/entities/cat-comuna.entity';
import { CatTribunal } from '../src/modules/catalogo/entities/cat-tribunal.entity';
import { CatCrs } from '../src/modules/catalogo/entities/cat-crs.entity';
import { CatTipoLey } from '../src/modules/catalogo/entities/cat-tipo-ley.entity';
import { CatPenaSustitutiva } from '../src/modules/catalogo/entities/cat-pena-sustitutiva.entity';
import { CatMedidaControl } from '../src/modules/catalogo/entities/cat-medida-control.entity';
import { CatDelito } from '../src/modules/catalogo/entities/cat-delito.entity';
import { CatMotivoNoFactible } from '../src/modules/catalogo/entities/cat-motivo-no-factible.entity';
import { CatTipoZona } from '../src/modules/catalogo/entities/cat-tipo-zona.entity';
import { CatTipoEvento } from '../src/modules/catalogo/entities/cat-tipo-evento.entity';
import { CatTipoEventoValidacion } from '../src/modules/catalogo/entities/cat-tipo-evento-validacion.entity';
import { CatMotivoNoRealizado } from '../src/modules/catalogo/entities/cat-motivo-no-realizado.entity';
import { CatTipoProblemaSt } from '../src/modules/catalogo/entities/cat-tipo-problema-st.entity';
import { CatTipoAccesorio } from '../src/modules/catalogo/entities/cat-tipo-accesorio.entity';
import { CatTipoDia } from '../src/modules/catalogo/entities/cat-tipo-dia.entity';
import { CatIdentidadGenero } from '../src/modules/catalogo/entities/cat-identidad-genero.entity';
import { CatRolDispositivo } from '../src/modules/catalogo/entities/cat-rol-dispositivo.entity';
import { CatIdentificacion } from '../src/modules/catalogo/entities/cat-identificacion.entity';
import { CatParentesco } from '../src/modules/catalogo/entities/cat-parentesco.entity';
import { CatSexo } from '../src/modules/catalogo/entities/cat-sexo.entity';
import { CatTipoCausa } from '../src/modules/catalogo/entities/cat-tipo-causa.entity';
import { CatTipoLugar } from '../src/modules/catalogo/entities/cat-tipo-lugar.entity';
import { CatTipoHorario } from '../src/modules/catalogo/entities/cat-tipo-horario.entity';
import { CatEstadoSolicitud } from '../src/modules/catalogo/entities/cat-estado-solicitud.entity';
import { CatEstadoSolicitudTransicion } from '../src/modules/catalogo/entities/cat-estado-solicitud-transicion.entity';
import { CatTipoFactibilidad } from '../src/modules/catalogo/entities/cat-tipo-factibilidad.entity';

import { Solicitud } from '../src/modules/solicitud/entities/solicitud.entity';
import { SolicitudDelito } from '../src/modules/solicitud/entities/solicitud-delito.entity';
import { SolicitudFactibilidad } from '../src/modules/solicitud/entities/solicitud-factibilidad.entity';
import { SolicitudEstadoHist } from '../src/modules/solicitud/entities/solicitud-estado-hist.entity';
import { SolicitudZona } from '../src/modules/solicitud/entities/solicitud-zona.entity';
import { SolicitudVictima } from '../src/modules/solicitud/entities/solicitud-victima.entity';
import { SolicitudSolicitante } from '../src/modules/solicitud/entities/solicitud-solicitante.entity';

import { Condenado } from '../src/modules/persona/entities/condenado.entity';
import { Victima } from '../src/modules/persona/entities/victima.entity';
import { CondenadoContacto } from '../src/modules/persona/entities/condenado-contacto.entity';
import { VictimaContacto } from '../src/modules/persona/entities/victima-contacto.entity';

import { Evento } from '../src/modules/evento/entities/evento.entity';
import { EventoValidacion } from '../src/modules/evento/entities/evento-validacion.entity';
import { Resolucion } from '../src/modules/evento/entities/resolucion.entity';
import { ResolucionCambioDomicilio } from '../src/modules/evento/entities/resolucion-cambio-domicilio.entity';
import { Proceso } from '../src/modules/evento/entities/proceso.entity';
import { ProcesoSoporteMotivo } from '../src/modules/evento/entities/proceso-soporte-motivo.entity';
import { ProcesoSoporteDetalle } from '../src/modules/evento/entities/proceso-soporte-detalle.entity';

import { ProcesoDispositivo } from '../src/modules/dispositivo/entities/proceso-dispositivo.entity';
import { VwDispositivosActivos } from '../src/modules/dispositivo/entities/vw-dispositivos-activos.entity';

import { Notificacion } from '../src/modules/notificacion/entities/notificacion.entity';
import { NotificacionUsuario } from '../src/modules/notificacion/entities/notificacion-usuario.entity';
import { NotificacionPlantilla } from '../src/modules/notificacion/entities/notificacion-plantilla.entity';

import { PrefactPeriodo } from '../src/modules/prefacturacion/entities/prefact-periodo.entity';
import { PrefactDetalle } from '../src/modules/prefacturacion/entities/prefact-detalle.entity';

import { PjudLlamada } from '../src/modules/pjud/entities/pjud-llamada.entity';

import { Archivo } from '../src/modules/archivo/entities/archivo.entity';
import { ArchivoReferencia } from '../src/modules/archivo/entities/archivo-referencia.entity';

import { Agendamiento } from '../src/modules/agendamiento/entities/agendamiento.entity';

import { AccionUsuario } from '../src/modules/carga-laboral/entities/accion-usuario.entity';

const entities = [
  Usuario,
  UsuarioRol,
  CatRol,
  CatPermiso,
  RolPermiso,

  CatRegion,
  CatComuna,
  CatTribunal,
  CatCrs,
  CatTipoLey,
  CatPenaSustitutiva,
  CatMedidaControl,
  CatDelito,
  CatMotivoNoFactible,
  CatTipoZona,
  CatTipoEvento,
  CatTipoEventoValidacion,
  CatMotivoNoRealizado,
  CatTipoProblemaSt,
  CatTipoAccesorio,
  CatTipoDia,
  CatIdentidadGenero,
  CatRolDispositivo,
  CatIdentificacion,
  CatParentesco,
  CatSexo,
  CatTipoCausa,
  CatTipoLugar,
  CatEstadoSolicitud,
  CatEstadoSolicitudTransicion,
  CatTipoFactibilidad,
  CatTipoHorario,

  Solicitud,
  SolicitudDelito,
  SolicitudFactibilidad,
  SolicitudEstadoHist,
  SolicitudZona,
  SolicitudVictima,
  SolicitudSolicitante,

  Condenado,
  Victima,
  CondenadoContacto,
  VictimaContacto,

  Evento,
  EventoValidacion,
  Resolucion,
  ResolucionCambioDomicilio,
  Proceso,
  ProcesoSoporteMotivo,
  ProcesoSoporteDetalle,

  ProcesoDispositivo,
  VwDispositivosActivos,

  Notificacion,
  NotificacionUsuario,
  NotificacionPlantilla,

  PrefactPeriodo,
  PrefactDetalle,

  PjudLlamada,

  Archivo,
  ArchivoReferencia,

  Agendamiento,

  AccionUsuario,
];

async function syncDatabase(): Promise<void> {
  console.log('Conectando a la base de datos...');
  console.log(
    `Host: ${process.env.DB_HOST}, Database: ${process.env.DB_NAME}, User: ${process.env.DB_USER}`,
  );

  const dataSource = new DataSource({
    type: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    username: process.env.DB_USER || 'sa',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'TDH_Automatic',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
    entities,
    synchronize: false,
    logging: ['error', 'warn', 'info'],
  });

  await dataSource.initialize();
  console.log('Conexión establecida.');

  console.log('\nEliminando tablas existentes y creando nuevas desde las entidades...');
  await dataSource.synchronize(true);
  console.log('Tablas recreadas exitosamente.');

  await dataSource.destroy();
  console.log('\nProceso completado - todas las tablas han sido recreadas.');
}

syncDatabase().catch((error) => {
  console.error('Error durante la sincronización:', error);
  process.exit(1);
});
