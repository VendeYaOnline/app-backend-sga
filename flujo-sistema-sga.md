# Flujo del Sistema SGA — Guía para Frontend

Este documento describe el flujo completo del sistema SGA de inicio a fin, con ejemplos
concretos de requests/responses para que el equipo de frontend sepa qué endpoints usar,
en qué orden, y qué esperar del backend.

---

## Tabla de Contenidos

1. [Autenticación](#1-autenticacion)
2. [Catálogos — Datos de referencia](#2-catlogos--datos-de-referencia)
3. [Registro de Personas (Condenado y Víctima)](#3-registro-de-personas)
4. [Creación de una Solicitud IFT](#4-creacion-de-una-solicitud-ift)
5. [Ciclo de Vida de la Solicitud (Máquina de Estados)](#5-ciclo-de-vida-de-la-solicitud)
6. [Eventos — Resoluciones Judiciales](#6-eventos--resoluciones-judiciales)
7. [Validaciones de Eventos](#7-validaciones-de-eventos)
8. [Agendamiento de Procesos en Terreno](#8-agendamiento-de-procesos-en-terreno)
9. [Ejecución de Procesos](#9-ejecucion-de-procesos)
10. [Cambio de Domicilio](#10-cambio-de-domicilio)
11. [Dispositivos y Accesorios](#11-dispositivos-y-accesorios)
12. [Archivos (Subida/Descarga)](#12-archivos-subidadescarga)
13. [Notificaciones](#13-notificaciones)
14. [Carga Laboral (Reportes)](#14-carga-laboral-reportes)
15. [Prefacturación](#15-prefacturacion)
16. [Interconexión PJUD](#16-interconexion-pjud)
17. [Resumen de Estados y Transiciones](#17-resumen-de-estados-y-transiciones)

---

## 1. Autenticación

### 1.1 Login

```
POST /auth/login
```

**Request:**
```json
{
  "email": "coordinador@sga.cl",
  "password": "MiPassword123"
}
```

**Response (200):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "coord001",
      "email": "coordinador@sga.cl",
      "nombres": "Juan",
      "apellidoPaterno": "Perez",
      "roles": ["COORDINADOR"],
      "permisos": ["SOLICITUD_CREAR", "SOLICITUD_LEER", "SOLICITUD_APROBAR", "EVENTO_CREAR", "PROCESO_CERRAR"]
    }
  },
  "message": "Operación exitosa"
}
```

> **Importante:** Guardar el `accessToken`. Se envía en cada request como header
> `Authorization: Bearer <token>`. El token expira según la configuración de `JWT_EXPIRES_IN`
> (por defecto 8 horas). No existe refresh token.

### 1.2 Obtener perfil del usuario autenticado

```
GET /auth/me
Authorization: Bearer <token>
```

La respuesta incluye los `permisos` del usuario. Usarlos para mostrar/ocultar funcionalidades
en el frontend. No es necesario consultar permisos por separado.

### 1.3 Primer uso — Setup inicial

```
POST /auth/setup
```

Cuando la BD está vacía (sin usuarios), se puede crear el primer administrador usando un
`setupSecret` configurado en el backend (`SETUP_SECRET` en `.env`). Este endpoint no requiere JWT.

**Request:**
```json
{
  "setupSecret": "setup-secreto-inicial",
  "username": "admin",
  "email": "admin@sga.cl",
  "password": "AdminPass123",
  "nombres": "Admin",
  "apellidoPaterno": "Sistema",
  "rut": "11111111-1"
}
```

---

## 2. Catálogos — Datos de referencia

Casi todos los endpoints de catálogo son públicos (no requieren JWT). Devuelven arrays simples
para poblar `<select>` y dropdowns.

### 2.1 Regiones, Comunas, Tribunales, CRS

```
GET /catalogos/regiones
GET /catalogos/comunas?region_id=7
GET /catalogos/tribunales
GET /catalogos/crs
```

**Ejemplo de respuesta (`/catalogos/regiones`):**
```json
{
  "data": [
    { "id": 1, "codigo": "RM", "nombre": "Región Metropolitana de Santiago", "activo": true },
    { "id": 7, "codigo": "VII", "nombre": "Región del Maule", "activo": true }
  ],
  "message": "Operación exitosa"
}
```

### 2.2 Catálogos de negocio

Recuperar al iniciar la app para llenar los formularios de solicitud y evento:

```
GET /catalogos/tipos-ley          → LEY_18216, LEY_21378
GET /catalogos/penas-sustitutivas → RP, LV, LVI, PMC, RPD
GET /catalogos/medidas-control    → Mapea con codMedidaControl del PJUD
GET /catalogos/delitos            → Catálogo completo de delitos
GET /catalogos/tipos-zona         → EXCLUSION, INCLUSION
GET /catalogos/tipos-evento       → Tipos de evento + flags requiere_agendamiento, requiere_documento
GET /catalogos/tipos-dia          → LUNES, MARTES, ..., DIURNO, NOCTURNO
GET /catalogos/sexos              → MASCULINO, FEMENINO, INDETERMINADO
GET /catalogos/identidades-genero
GET /catalogos/tipos-identificacion → RUN, PASAPORTE
GET /catalogos/parentescos
GET /catalogos/motivos-no-factible
GET /catalogos/motivos-no-realizado
GET /catalogos/tipos-problema-st
GET /catalogos/tipos-accesorio    → BEACON, CORREA, CARGADOR, CABLE, DISPOSITIVO_VICTIMA
GET /catalogos/roles-dispositivo  → INSTALADO, RETIRADO, REEMPLAZADO_SALIENTE, REEMPLAZADO_ENTRANTE
GET /catalogos/tipos-lugar         → CASA, APARTAMENTO, LOCAL_COMERCIAL, EMPRESA, SITIO_ERIAZO, OTRO
GET /catalogos/tipos-causa         → RUC_RIT, ROL
GET /catalogos/estados-solicitud   → Estados con orden y flag es_estado_final
GET /catalogos/tipos-factibilidad  → FACTIBLE, NO_FACTIBLE, NO_RECOMENDABLE + flag requiere_motivo
```

### 2.3 Configuración de validaciones por tipo de evento

```
GET /catalogos/tipos-evento/:id/validaciones
```

Retorna qué roles deben validar un tipo de evento y en qué orden:
```json
{
  "data": [
    { "id": 1, "tipoEventoId": 5, "rolId": 3, "orden": 1, "obligatorio": true, "activo": true },
    { "id": 2, "tipoEventoId": 5, "rolId": 1, "orden": 2, "obligatorio": true, "activo": true }
  ]
}
```

---

## 3. Registro de Personas (Condenado y Víctima)

### 3.1 Crear un condenado

Un condenado es una persona sujeta a monitoreo telemático. Puede ser chileno (RUN) o
extranjero (pasaporte). **No puede tener ambos.**

> **Nuevo (v16):** También se puede crear el condenado junto con la solicitud en una
> sola transacción atómica. Ver [Sección 4.2](#42-crear-solicitud-endpoint-principal).

```
POST /condenados
```

**Request (chileno):**
```json
{
  "esExtranjero": false,
  "tipoIdentificacionId": 1,
  "rutCondenado": "12345678-9",
  "nombres": "Carlos Andrés",
  "apellidoPaterno": "González",
  "apellidoMaterno": "Muñoz",
  "nombreSocial": null,
  "sexoId": 1,
  "identidadGeneroId": 1,
  "fechaNacimiento": "1990-05-15",
  "emailCondenado": "carlos@email.com",
  "crsId": 3,
  "contactoEmergenciaNombre": "María",
  "contactoEmergenciaApellido": "Muñoz",
  "contactoEmergenciaParentescoId": 1,
  "contactoEmergenciaTelefono": "+56912345678"
}
```

**Request (extranjero):**
```json
{
  "esExtranjero": true,
  "tipoIdentificacionId": 2,
  "pasaporte": "A1234567",
  "nombres": "John",
  "apellidoPaterno": "Doe",
  "sexoId": 1,
  "fechaNacimiento": "1985-03-20",
  "crsId": 3
}
```

### 3.2 Buscar condenado existente

```
GET /condenados?search=gonzalez&page=1&limit=20
GET /condenados?rutCondenado=12345678-9
GET /condenados?crsId=3
```

> **Regla de negocio:** Antes de crear un condenado nuevo, SIEMPRE buscar por RUT
> para evitar duplicados.

### 3.3 Crear una víctima

```
POST /victimas
```

```json
{
  "esExtranjero": false,
  "tipoIdentificacionId": 1,
  "rutVictima": "23456789-0",
  "nombres": "Ana María",
  "apellidoPaterno": "López",
  "sexoId": 2,
  "emailVictima": "ana@email.com",
  "datoReservado": false,
  "consentimiento": true
}
```

- `datoReservado = true`: sus datos se enmascaran en reportes para usuarios sin el permiso
  específico.
- `consentimiento`: `null` = no definido, `true` = acepta monitoreo, `false` = no acepta.

---

## 4. Creación de una Solicitud IFT

Este es el **flujo más importante**. Una solicitud IFT puede crearse con todas sus tablas
hijas en una sola llamada (transacción atómica).

### 4.1 Paso a paso

1. El usuario llena el formulario con datos del condenado (**existente o nuevo en la misma transacción**)
2. Selecciona tribunal, ley, pena, medida de control, horario
3. Agrega delitos (del catálogo), víctimas (con radio de prohibición) y zonas geográficas
4. Envía la solicitud

> **Nuevo (v16):** Si el condenado no existe aún, se pueden enviar sus datos en el campo
> `condenado` y se creará dentro de la misma transacción. Si algo falla (zonas, delitos, etc.),
> se hace rollback de todo incluido el condenado. Esto evita condenados huérfanos.

### 4.2 Crear solicitud con condenado existente

```
POST /solicitudes
```

**Request con condenado existente:**
```json
{
  "tipoCausaId": 1,
  "rucCausa": "2300123456-7",
  "ritCausa": "1234-2023",
  "tribunalId": 5,
  "condenadoId": 42,
  "crsId": 3,
  "tipoLeyId": 1,
  "tipoPenaId": 2,
  "medidaControlId": 1,
  "tipoHorarioId": null,
  "horaDesde": "22:00:00",
  "horaHasta": "06:00:00",
  "tipoDiaInicioId": 1,
  "tipoDiaTerminoId": 2,
  "conBeacon": true,
  "observaciones": "El condenado vive en zona rural, verificar cobertura",
  "zonas": [
    {
      "tipoZonaId": 2,
      "regionId": 7,
      "comunaId": 101,
      "nombreCalle": "Av. Principal",
      "numeroDireccion": "1234",
      "tipoLugarId": 1,
      "radioMetros": 500,
      "latitud": -35.4262,
      "longitud": -71.6733,
      "esReservada": false
    },
    {
      "tipoZonaId": 1,
      "regionId": 7,
      "comunaId": 101,
      "nombreCalle": "Calle Los Olivos",
      "numeroDireccion": "5678",
      "tipoLugarId": 2,
      "radioMetros": 200,
      "esReservada": true
    }
  ],
  "delitoIds": [1, 4, 7],
  "victimas": [
    { "victimaId": 15, "radioProhibicionMetros": 500 },
    { "victimaId": 16, "radioProhibicionMetros": 300 }
  ]
}
```

### 4.3 Crear solicitud con condenado nuevo (v16)

Cuando el condenado no existe en el sistema, se envían sus datos en el campo `condenado`.
**Todo corre en una sola transacción**: si la solicitud falla, el condenado no se persiste.

```json
{
  "tipoCausaId": 1,
  "rucCausa": "2300123456-7",
  "ritCausa": "1234-2023",
  "tribunalId": 5,
  "condenado": {
    "esExtranjero": false,
    "tipoIdentificacionId": 1,
    "rutCondenado": "12345678-9",
    "nombres": "Carlos Andrés",
    "apellidoPaterno": "González",
    "apellidoMaterno": "Muñoz",
    "sexoId": 1,
    "identidadGeneroId": 1,
    "fechaNacimiento": "1990-05-15",
    "emailCondenado": "carlos@email.com",
    "crsId": 3,
    "contactoEmergenciaNombre": "María",
    "contactoEmergenciaApellido": "Muñoz",
    "contactoEmergenciaParentescoId": 1,
    "contactoEmergenciaTelefono": "+56912345678"
  },
  "crsId": 3,
  "tipoLeyId": 1,
  "tipoPenaId": 2,
  "medidaControlId": 1,
  "horaDesde": "22:00:00",
  "horaHasta": "06:00:00",
  "conBeacon": true,
  "zonas": [
    {
      "tipoZonaId": 2,
      "regionId": 7,
      "comunaId": 101,
      "nombreCalle": "Av. Principal",
      "numeroDireccion": "1234",
      "tipoLugarId": 1,
      "radioMetros": 500,
      "esReservada": false
    }
  ],
  "delitoIds": [1, 4, 7],
  "victimas": [
    { "victimaId": 15, "radioProhibicionMetros": 500 }
  ]
}
```

> **Importante:** Solo uno de `condenadoId` o `condenado` debe enviarse. Si envías ambos
> se ignora `condenadoId` (prevalece la creación del nuevo). Si no envías ninguno,
> recibirás un error `400`.

**Tipos de zona:**
- `tipoZonaId = 1` → `EXCLUSION` (el condenado NO puede entrar)
- `tipoZonaId = 2` → `INCLUSION` (el condenado DEBE permanecer dentro)

**Tipo de lugar (`tipoLugarId` en zonas):**
- Catálogo `CAT_TIPO_LUGAR`. Ej: `1=CASA`, `2=APARTAMENTO`, `3=LOCAL_COMERCIAL`, `4=EMPRESA`, `5=SITIO_ERIAZO`, `6=OTRO`

**Tipo de causa (`tipoCausaId`):**
- El catálogo `CAT_TIPO_CAUSA` define los tipos. Típicamente:
  - `1` = `RUC_RIT`: requiere `rucCausa` + `ritCausa`. `rolCausa` debe ir vacío.
  - `2` = `ROL`: requiere `rolCausa`. `rucCausa` y `ritCausa` deben ir vacíos.

**Response (201):**
```json
{
  "data": {
    "id": 128,
    "solicitudPadreId": null,
    "motivoOrigen": "ORIGINAL",
    "origenCreacion": "FORMULARIO_WEB",
    "tipoCausaId": 1,
    "rucCausa": "2300123456-7",
    "ritCausa": "1234-2023",
    "estadoActualId": 1,
    "estadoActual": { "id": 1, "codigo": "RECEPCIONADA", "descripcionEstado": "Solicitud recepcionada" },
    "estadoAt": "2024-08-15T14:30:00Z",
    "condenado": { "id": 42, "rutCondenado": "12345678-9", "nombres": "Carlos Andrés", "apellidoPaterno": "González" },
    "tribunal": { "id": 5, "nombreTribunal": "Juzgado de Garantía de Talca" },
    "crs": { "id": 3, "nombreCrs": "CRS Talca" },
    "createdAt": "2024-08-15T14:30:00Z"
  },
  "message": "Solicitud creada exitosamente"
}
```

> **Nota:** Esta creación es atómica. Si cualquier parte falla (ej: RUC duplicado,
> condenado ya existe, zona inválida), se hace rollback completo de todo incluyendo
> el condenado si fue creado en esta transacción.

### 4.4 Agregar solicitantes a la solicitud

Después de creada, se pueden agregar solicitantes (juez, fiscal, defensor):

```
POST /solicitudes/128/solicitantes
```

```json
{
  "rolSolicitante": "FISCAL",
  "nombres": "Pedro",
  "apellidoPaterno": "Silva",
  "rutSolicitante": "11222333-4",
  "emailSolicitante": "psilva@minpublico.cl",
  "telefono": "+56987654321",
  "esPrincipal": true
}
```

- `esPrincipal = true`: solo puede haber UN solicitante principal por solicitud.

---

## 5. Ciclo de Vida de la Solicitud (Máquina de Estados)

La solicitud sigue una máquina de estados **configurable desde la base de datos** (v16).
Las transiciones válidas se definen en `CAT_ESTADO_SOLICITUD_TRANSICION` y están
asociadas a un **rol** específico. El frontend debe consultar las transiciones disponibles
antes de mostrar los botones de acción.

### 5.1 Consultar transiciones permitidas (v16)

Dado el estado actual de la solicitud y el rol del usuario autenticado, este endpoint
retorna solo las transiciones que el usuario puede ejecutar:

```
GET /solicitudes/:id/transiciones-permitidas
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "estadoDestinoId": 2,
      "estadoDestinoCodigo": "APROBADA",
      "estadoDestinoDescripcion": "Solicitud aprobada",
      "rolCodigo": "COORDINADOR",
      "rolNombre": "Coordinador"
    },
    {
      "id": 2,
      "estadoDestinoId": 3,
      "estadoDestinoCodigo": "DEVUELTA",
      "estadoDestinoDescripcion": "Solicitud devuelta",
      "rolCodigo": "COORDINADOR",
      "rolNombre": "Coordinador"
    }
  ],
  "message": "Operación exitosa"
}
```

> **Importante:** Si el usuario tiene múltiples roles, se retornan las transiciones de
> todos sus roles combinados. Si no hay transiciones disponibles, se retorna array vacío.
> El frontend debe ocultar los botones de transición en ese caso.

### 5.2 Catálogo de estados

Los estados disponibles están en `CAT_ESTADO_SOLICITUD`. Cada uno tiene un `orden`
(secuencia natural) y un flag `esEstadoFinal` que indica que la solicitud no puede
avanzar más:

```
GET /catalogos/estados-solicitud
```

```json
{
  "data": [
    { "id": 1, "codigo": "RECEPCIONADA", "descripcionEstado": "Solicitud recepcionada", "orden": 1, "esEstadoFinal": false, "activo": true },
    { "id": 2, "codigo": "APROBADA", "descripcionEstado": "Solicitud aprobada", "orden": 2, "esEstadoFinal": false, "activo": true },
    { "id": 3, "codigo": "DEVUELTA", "descripcionEstado": "Solicitud devuelta", "orden": 3, "esEstadoFinal": true, "activo": true },
    { "id": 4, "codigo": "INFORME_EMITIDO", "descripcionEstado": "Informe emitido", "orden": 4, "esEstadoFinal": false, "activo": true },
    { "id": 5, "codigo": "INSTALADA", "descripcionEstado": "Dispositivo instalado", "orden": 5, "esEstadoFinal": false, "activo": true },
    { "id": 6, "codigo": "EN_CONTROL", "descripcionEstado": "En control", "orden": 6, "esEstadoFinal": false, "activo": true },
    { "id": 7, "codigo": "CERRADA", "descripcionEstado": "Solicitud cerrada", "orden": 7, "esEstadoFinal": true, "activo": true },
    { "id": 8, "codigo": "ANULADA", "descripcionEstado": "Solicitud anulada", "orden": 8, "esEstadoFinal": true, "activo": true }
  ],
  "message": "Operación exitosa"
}
```

### 5.3 Flujo típico de estados

```
RECEPCIONADA  →  APROBADA  →  INFORME_EMITIDO  →  INSTALADA  →  EN_CONTROL  →  CERRADA
     │               │               │
     └─ DEVUELTA     └─ NO_FACTIBLE  └─ NO_RECOMENDABLE

[CUALQUIERA]  →  ANULADA
```

> Las transiciones reales permitidas en cada paso dependen de lo configurado en
> `CAT_ESTADO_SOLICITUD_TRANSICION`. El diagrama arriba es el flujo feliz típico.

### 5.4 Ejecutar una transición (v16)

```
POST /solicitudes/:id/transicion
```

**Aprobar solicitud (ejemplo):**
```json
{
  "estadoNuevoId": 2,
  "motivo": "Solicitud revisada y aceptada para estudio de factibilidad"
}
```

**Devolver solicitud:**
```json
{
  "estadoNuevoId": 3,
  "motivo": "Faltan datos del condenado: no se especifica domicilio"
}
```

> **Importante (v16):** A diferencia de versiones anteriores, ahora se envía `estadoNuevoId`
> (INT) en vez del código del estado (STRING). El backend valida que:
> 1. Exista una transición configurada desde el estado actual al estado destino.
> 2. El rol del usuario autenticado esté autorizado para esa transición.
> 3. Si no se cumple alguna, se retorna `422 Unprocessable Entity`.
>
> **Flujo recomendado para el frontend:**
> 1. Consultar `GET /solicitudes/:id/transiciones-permitidas`
> 2. Mostrar solo los botones de las transiciones retornadas
> 3. Al hacer clic, enviar `POST /solicitudes/:id/transicion` con el `estadoDestinoId`
>    correspondiente

### 5.5 Emitir informe de factibilidad (v16)

Cuando la solicitud está en estado `APROBADA`, el especialista emite el informe.
Ahora se usa `tipoFactibilidadId` (FK a `CAT_TIPO_FACTIBILIDAD`):

```
POST /solicitudes/128/factibilidad
```

**Caso FACTIBLE:**
```json
{
  "tipoFactibilidadId": 1
}
```

**Caso NO_FACTIBLE (requiere motivo porque `CAT_TIPO_FACTIBILIDAD.requiere_motivo = true`):**
```json
{
  "tipoFactibilidadId": 2,
  "motivoNoFactibleId": 3
}
```

**Catálogo de tipos de factibilidad:**
```
GET /catalogos/tipos-factibilidad
```

```json
{
  "data": [
    { "id": 1, "codigo": "FACTIBLE", "descripcionFactibilidad": "Factible", "requiereMotivo": false, "activo": true },
    { "id": 2, "codigo": "NO_FACTIBLE", "descripcionFactibilidad": "No factible", "requiereMotivo": true, "activo": true },
    { "id": 3, "codigo": "NO_RECOMENDABLE", "descripcionFactibilidad": "No recomendable", "requiereMotivo": true, "activo": true }
  ],
  "message": "Operación exitosa"
}
```

> **Regla de frontend:** Si `requiereMotivo = true`, el campo `motivoNoFactibleId` es
> obligatorio. El backend valida esta regla y retorna `400` si no se cumple.

### 5.6 Ver historial de estados

```
GET /solicitudes/128/historial
```

```json
{
  "data": [
    {
      "id": 1,
      "estadoNuevoId": 1,
      "estadoNuevo": { "id": 1, "codigo": "RECEPCIONADA" },
      "estadoAnteriorId": null,
      "estadoAnterior": null,
      "fechaCambio": "2024-08-15T14:30:00Z",
      "usuarioId": 1,
      "motivoCambio": null
    },
    {
      "id": 2,
      "estadoNuevoId": 2,
      "estadoNuevo": { "id": 2, "codigo": "APROBADA" },
      "estadoAnteriorId": 1,
      "estadoAnterior": { "id": 1, "codigo": "RECEPCIONADA" },
      "fechaCambio": "2024-08-15T16:00:00Z",
      "usuarioId": 1,
      "motivoCambio": "Solicitud revisada y aceptada"
    }
  ],
  "message": "Operación exitosa"
}
```

> **Nota (v16):** El historial ahora incluye las relaciones `estadoNuevo` y `estadoAnterior`
> con los datos completos del catálogo (`id`, `codigo`). Usar `codigo` para mostrar
> etiquetas legibles en la UI.

---

## 6. Eventos — Resoluciones Judiciales

Un **evento** es cualquier acontecimiento asociado a una solicitud: una resolución judicial
(decreto, prórroga, cese) o un proceso en terreno (instalación, desinstalación, soporte).

El sistema usa el patrón **Class Table Inheritance**: la tabla `EVENTO` contiene los datos
comunes, y tablas hijas (`RESOLUCION`, `PROCESO`, `RESOLUCION_CAMBIO_DOMICILIO`) contienen
los datos específicos de cada tipo.

### 6.1 Tipos de evento

| Código CAT_TIPO_EVENTO | Categoría | Tabla hija | Requiere agendamiento | Requiere documento |
|------------------------|-----------|-----------|----------------------|-------------------|
| `DECRETO_MONITOREO_INICIAL` | Resolución | `RESOLUCION` | Sí | Sí |
| `PRORROGA_EXTENSION` | Resolución | `RESOLUCION` | No | Sí |
| `CESE_CONTROL` | Resolución | `RESOLUCION` | Sí | Sí |
| `INFORME_CONTROL` | Resolución | `RESOLUCION` | No | Sí |
| `INCOMPETENCIA` | Resolución | `RESOLUCION` | No | Sí |
| `CAMBIO_DOMICILIO` | Resolución | `RESOLUCION_CAMBIO_DOMICILIO` | No | Sí |
| `INSTALACION` | Proceso | `PROCESO` | Sí | No |
| `DESINSTALACION` | Proceso | `PROCESO` | Sí | No |
| `SOPORTE` | Proceso | `PROCESO` + `SOPORTE_DETALLE` | Sí | No |

### 6.2 Crear un evento

```
POST /eventos
```

**Ejemplo — Decreto de monitoreo inicial (resolución):**
```json
{
  "tipoEventoId": 1,
  "solicitudId": 128,
  "asignadoA": 2,
  "fechaEvento": "2024-08-20",
  "origenCreacion": "FORMULARIO_WEB",
  "observaciones": "Decreto recibido del tribunal"
}
```

**Response (201):**
```json
{
  "data": {
    "id": 55,
    "tipoEvento": { "id": 1, "codigo": "DECRETO_MONITOREO_INICIAL", "requiereAgendamiento": true },
    "solicitudId": 128,
    "estadoEvento": "PENDIENTE",
    "fechaEvento": "2024-08-20T00:00:00Z",
    "asignadoA": 2,
    "origenCreacion": "FORMULARIO_WEB"
  },
  "message": "Operación exitosa"
}
```

> Al crear un evento, el sistema **genera automáticamente** las filas de validación
> (`EVENTO_VALIDACION`) según la configuración de `CAT_TIPO_EVENTO_VALIDACION`.

### 6.3 Completar datos de la resolución

Después de crear el evento, se llenan los datos específicos:

```
PUT /resoluciones/55
```

```json
{
  "tribunalId": 5,
  "tipoCausaRes": "RUC_RIT",
  "rucRes": "2300123456-7",
  "ritRes": "1234-2023",
  "crrIdPjud": "PJUD-2024-00123",
  "tipoLeyId": 1,
  "crsId": 3,
  "numPena": 1,
  "plazoMonitoreoDias": 180,
  "fechaInicioMonitoreo": "2024-09-01",
  "diasAbono": 30,
  "fechaDictoSentencia": "2024-08-18",
  "victimaConsentimiento": true
}
```

### 6.4 Crear evento de tipo proceso (instalación)

```
POST /eventos
```

```json
{
  "tipoEventoId": 6,
  "solicitudId": 128,
  "asignadoA": 3,
  "fechaEvento": "2024-09-05",
  "origenCreacion": "FORMULARIO_WEB",
  "observaciones": "Instalación de beacon al condenado"
}
```

Luego completar los datos del proceso:

```
PUT /procesos/56
```

```json
{
  "tecnicoId": 5,
  "crsId": 3,
  "regionId": 7,
  "comunaId": 101,
  "direccionProceso": "Av. Principal 1234, Talca",
  "fechaProgramada": "2024-09-05T10:00:00Z",
  "paraQuien": "CONDENADO",
  "procesoOrigenId": null,
  "numeroIntento": 1
}
```

- `paraQuien`: `"CONDENADO"` o `"VICTIMA"`.
- `procesoOrigenId`: para reintentos, apunta al primer proceso de instalación. En el primer
  intento va `null` (el backend lo actualiza automáticamente).
- `numeroIntento`: 1 para el primer intento. El backend lo asigna si no se envía.

---

## 7. Validaciones de Eventos

Al crear un evento, el sistema genera automáticamente filas en `EVENTO_VALIDACION`
según la configuración de `CAT_TIPO_EVENTO_VALIDACION`. Cada validación está asignada
a un **rol** y tiene un **orden**.

### 7.1 Ver validaciones pendientes

```
GET /eventos/55/validaciones
```

```json
{
  "data": [
    {
      "id": 201,
      "eventoId": 55,
      "tipoEventoValidacionId": 1,
      "rol": { "id": 3, "codigo": "GENDARMERIA" },
      "estado": "PENDIENTE",
      "orden": 1,
      "obligatorio": true,
      "fechaValidacion": null,
      "observaciones": null
    },
    {
      "id": 202,
      "eventoId": 55,
      "tipoEventoValidacionId": 2,
      "rol": { "id": 1, "codigo": "COORDINADOR" },
      "estado": "PENDIENTE",
      "orden": 2,
      "obligatorio": true,
      "fechaValidacion": null,
      "observaciones": null
    }
  ]
}
```

### 7.2 Ejecutar validación

```
POST /eventos/55/validaciones/201
```

**Aprobar:**
```json
{
  "estado": "APROBADO",
  "observaciones": "Documentación conforme"
}
```

**Rechazar:**
```json
{
  "estado": "RECHAZADO",
  "observaciones": "Falta el oficio del tribunal"
}
```

> **Reglas de validación:**
> - Las validaciones deben ejecutarse en orden (orden 1 antes que orden 2).
> - Si una validación `obligatorio = true` se rechaza, el evento pasa automáticamente a
>   estado `RECHAZADO`.
> - Una validación ya ejecutada no puede modificarse.

---

## 8. Agendamiento de Procesos en Terreno

Los procesos en terreno (instalación, desinstalación, soporte) deben agendarse con fecha,
técnico y lugar.

### 8.1 Crear agendamiento

```
POST /agendamientos
```

```json
{
  "eventoId": 56,
  "fechaAgendada": "2024-09-05T10:00:00Z",
  "asignadoA": 5,
  "crsId": 3,
  "direccionAgenda": "Av. Principal 1234, Talca",
  "paraCondenado": true,
  "paraVictimaId": null,
  "notas": "Confirmar disponibilidad del condenado el día anterior"
}
```

### 8.2 Ver calendario

```
GET /agendamientos/calendario?fechaDesde=2024-09-01&fechaHasta=2024-09-30
```

### 8.3 Consultar técnicos disponibles

```
GET /agendamientos/tecnicos/disponibles?fecha=2024-09-05&horaDesde=08:00&horaHasta=14:00
```

### 8.4 Cambiar estado del agendamiento

```
PUT /agendamientos/10/estado
```

```json
{
  "estadoAgenda": "COMPLETADO"
}
```

**Estados válidos:** `PROGRAMADO`, `CONFIRMADO`, `EN_CURSO`, `COMPLETADO`, `CANCELADO`

> **Regla importante:** Si un proceso no se realiza y se necesita reagendar, se crea un
> **NUEVO** agendamiento (no se modifica el existente). El agendamiento anterior se marca
> como `NO_EJECUTADO` para mantener trazabilidad.

---

## 9. Ejecución de Procesos

### 9.1 Cerrar un proceso (instalación/desinstalación/soporte)

Cuando el técnico termina el proceso, lo cierra:

```
POST /procesos/56/cerrar
```

**Proceso realizado exitosamente:**
```json
{
  "realizado": true
}
```

**Proceso NO realizado:**
```json
{
  "realizado": false,
  "motivoNoRealizadoId": 2,
  "detalleNoRealizado": "El condenado no se presentó en el domicilio"
}
```

> Cuando `realizado = false`, es **obligatorio** enviar `motivoNoRealizadoId`.

### 9.2 Detalle de soporte técnico

Para procesos de tipo `SOPORTE`, se agrega el detalle:

```
POST /procesos/57/soporte-detalle
```

```json
{
  "requiereCambioDispositivo": true,
  "medioContacto": "PRESENCIAL",
  "observacionesSoporte": "Se detectó falla intermitente del beacon, se reemplazó por nuevo equipo"
}
```

### 9.3 Motivos de soporte técnico (v12)

Un soporte puede tener **N motivos**. Se agregan individualmente:

```
POST /procesos/57/soporte-motivos
```

```json
{
  "tipoProblemaId": 1,
  "esMotivoPrincipal": true,
  "observacion": "Beacon no carga batería"
}
```

```json
{
  "tipoProblemaId": 3,
  "esMotivoPrincipal": false,
  "observacion": "Correa cortada, necesidad de reemplazo"
}
```

- `esMotivoPrincipal = true`: solo **uno** por soporte. Marca el motivo del agendamiento original.
- Para listar los motivos: `GET /procesos/57/soporte-motivos`
- Para editar: `PUT /procesos/57/soporte-motivos/10`
- Para eliminar: `DELETE /procesos/57/soporte-motivos/10`

---

## 10. Cambio de Domicilio

El cambio de domicilio es un flujo especial que genera una **nueva solicitud copia**.

### 10.1 Crear evento de cambio de domicilio

```
POST /eventos
```
```json
{
  "tipoEventoId": 5,
  "solicitudId": 128,
  "origenCreacion": "FORMULARIO_WEB"
}
```

### 10.2 Completar datos del cambio

```
PUT /cambios-domicilio/58
```
```json
{
  "subtipoCambio": "SIFT",
  "visto": false
}
```

- `subtipoCambio`: `"SIFT"` (requiere nuevo estudio de factibilidad) o `"IFT_PLUS"`.

### 10.3 Emitir factibilidad del cambio

```
POST /cambios-domicilio/58/emitir-factibilidad
```
```json
{
  "factibilidadCd": "FACTIBLE",
  "folioInterno": 2024000180
}
```

### 10.4 Generar nueva solicitud copia

```
POST /cambios-domicilio/58/generar-solicitud
```

Esto crea una nueva `SOLICITUD` con `motivoOrigen = 'CAMBIO_DOMICILIO'` y
`solicitudPadreId = 128`, copiando los datos relevantes de la original. La nueva solicitud
tendrá sus propias zonas geográficas (las del nuevo domicilio).

---

## 11. Dispositivos y Accesorios

### 11.1 Dispositivos (beacons/tobilleras)

Todo dispositivo con número de serie debe registrarse:

```
POST /dispositivos
```
```json
{
  "tipoAccesorioId": 1,
  "numeroSerie": "BCN-2024-00456"
}
```

**Buscar dispositivo por serie:**
```
GET /dispositivos?search=BCN-2024
```

**Ver historial de un dispositivo:**
```
GET /dispositivos/10/historial
```

Muestra todos los `PROCESO_DISPOSITIVO` donde participó (cuándo se instaló, retiró, reemplazó).

### 11.2 Registrar dispositivo en un proceso

Cuando en una instalación se coloca un beacon:

```
POST /procesos/56/dispositivos
```
```json
{
  "dispositivoId": 10,
  "rolDispositivoId": 1,
  "observaciones": "Instalado en tobillo derecho"
}
```

**Roles de dispositivo (`CAT_ROL_DISPOSITIVO`):**
| ID | Código | Significado |
|----|--------|-------------|
| 1 | `INSTALADO` | Dispositivo nuevo instalado en este proceso |
| 2 | `RETIRADO` | Dispositivo retirado en este proceso |
| 3 | `REEMPLAZADO_SALIENTE` | Dispositivo dañado que se sacó |
| 4 | `REEMPLAZADO_ENTRANTE` | Dispositivo nuevo que entró como reemplazo |

**Cambio de dispositivo en soporte** → crear DOS filas: una `REEMPLAZADO_SALIENTE` y otra
`REEMPLAZADO_ENTRANTE`.

### 11.3 Accesorios (correas, cargadores, cables)

```
POST /procesos/56/accesorios
```
```json
{
  "tipoAccesorioId": 2,
  "numeroSerie": null,
  "observaciones": "Correa estándar"
}
```

- Si el tipo de accesorio tiene `tiene_serie = true` (según el catálogo), es obligatorio
  enviar `numeroSerie`.

### 11.4 Consultar dispositivo activo de una solicitud

```
GET /solicitudes/128/dispositivo-activo
```

---

## 12. Archivos (Subida/Descarga)

Los archivos se suben vía multipart/form-data. Se asocian a una entidad (solicitud, evento, proceso)
con un propósito específico.

### 12.1 Subir archivo

```
POST /archivos/upload
Content-Type: multipart/form-data
```

**Campos del form:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `file` | File | El archivo a subir |
| `entidad` | string | Tabla destino: `SOLICITUD`, `EVENTO`, `PROCESO` |
| `entidadId` | number | ID del registro en esa tabla |
| `proposito` | string | Rol del archivo: `RESOLUCION_JUDICIAL`, `INFORME_FACTIBILIDAD`, `COMPROBANTE_INSTALACION`, etc. |

**Response (201):**
```json
{
  "data": {
    "id": 25,
    "uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "nombreOriginal": "decreto_monitoreo.pdf",
    "mimeType": "application/pdf",
    "tamanoBytes": 245760,
    "hashSha256": "3f8c...",
    "rutaRelativa": "2024/09/solicitud/decreto_monitoreo.pdf"
  }
}
```

### 12.2 Descargar archivo

```
GET /archivos/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

> La descarga usa el UUID, no el ID secuencial. Esto evita enumeración de archivos.

### 12.3 Listar archivos de una entidad

```
GET /archivos/entidad/SOLICITUD/128
```

### 12.4 Desvincular archivo (soft delete)

```
DELETE /archivos/referencias/25
```

> El archivo físico **nunca se elimina**. Solo se marca la referencia como `deleted_at`.

---

## 13. Notificaciones

### 13.1 Campana de notificaciones

```
GET /notificaciones?page=1&limit=20
GET /notificaciones/no-leidas
```

La respuesta de `no-leidas` es un número entero (contador para la campana):
```json
{
  "data": 5,
  "message": "Operación exitosa"
}
```

### 13.2 Marcar como leída

```
PUT /notificaciones/42/leida
```

### 13.3 Marcar todas como leídas

```
PUT /notificaciones/leer-todas
```

### 13.4 Plantillas (admin)

```
GET /notificaciones/plantillas
POST /notificaciones/plantillas
PUT /notificaciones/plantillas/:id
```

**Crear plantilla:**
```json
{
  "codigo": "SOLICITUD_APROBADA",
  "titulo": "Solicitud aprobada",
  "mensajePlantilla": "La solicitud {{rucCausa}} ha sido aprobada por {{nombreUsuario}}",
  "eventoDisparador": "solicitud.aprobada",
  "entidadOrigen": "SOLICITUD",
  "rolId": 1,
  "enviaApp": true,
  "enviaCorreo": true,
  "activo": true
}
```

**Variables disponibles:** `{{solicitudId}}`, `{{rucCausa}}`, `{{ritCausa}}`,
`{{condenadoNombre}}`, `{{estadoNuevo}}`, `{{estadoAnterior}}`, `{{nombreUsuario}}`,
`{{fechaCambio}}`, `{{motivoCambio}}`.

---

## 14. Carga Laboral (Reportes)

### 14.1 Resumen por usuario

```
GET /carga-laboral/resumen?fechaDesde=2024-08-01&fechaHasta=2024-08-31&usuarioId=5
```

```json
{
  "data": [
    { "tipoAccion": "EJECUTAR_INSTALACION", "cantidad": 12 },
    { "tipoAccion": "EJECUTAR_SOPORTE", "cantidad": 5 },
    { "tipoAccion": "EJECUTAR_DESINSTALACION", "cantidad": 2 }
  ]
}
```

### 14.2 Detalle de acciones

```
GET /carga-laboral/detalle?fechaDesde=2024-08-01&fechaHasta=2024-08-31&tipoAccion=EJECUTAR_INSTALACION&page=1&limit=20
```

### 14.3 Exportar

```
GET /carga-laboral/exportar?fechaDesde=2024-08-01&fechaHasta=2024-08-31&usuarioId=5
```

---

## 15. Prefacturación

### 15.1 Crear período mensual

```
POST /prefacturacion/periodos
```
```json
{
  "anio": 2024,
  "mes": 8
}
```

### 15.2 Calcular días monitoreados

```
POST /prefacturacion/periodos/5/calcular
```

Esto ejecuta un job que recorre todas las solicitudes activas durante el período y cuenta
días monitoreados por condenado y víctima.

### 15.3 Ver detalles del período

```
GET /prefacturacion/periodos/5/detalles
```

### 15.4 Cerrar período

```
PUT /prefacturacion/periodos/5/cerrar
```

Una vez cerrado, el período no puede modificarse.

---

## 16. Interconexión PJUD

El módulo PJUD maneja 6 métodos del contrato con el Poder Judicial:

| Endpoint | Dirección | Descripción |
|----------|-----------|-------------|
| `POST /recepcion-ift` | ENTRANTE | PJUD envía una solicitud IFT |
| `POST /recepcion-decreto` | ENTRANTE | PJUD envía un decreto de monitoreo |
| `GET /consulta-ift/:crrId` | ENTRANTE | PJUD consulta estado de una solicitud |
| `POST /enviar-factibilidad/:solicitudId` | SALIENTE | SGA envía resultado de factibilidad |
| `POST /enviar-incumplimiento/:solicitudId` | SALIENTE | SGA envía alerta de incumplimiento |
| `POST /enviar-alarma-cenco` | SALIENTE | SGA envía alarma al CENCO |

### 16.1 Auditoría de llamadas

```
GET /llamadas?page=1&limit=20
```

### 16.2 Reprocesar llamada fallida

```
POST /llamadas/reprocesar/99
```

---

## 17. Resumen de Estados y Transiciones

### 17.1 Estados de Solicitud

Los estados de solicitud ahora se gestionan desde `CAT_ESTADO_SOLICITUD` (v16).
El flujo típico es:

```
RECEPCIONADA ──→ APROBADA ──→ INFORME_EMITIDO ──→ INSTALADA ──→ EN_CONTROL ──→ CERRADA
     │                │                │
     └──→ DEVUELTA   └──→ NO_FACTIBLE └──→ NO_RECOMENDABLE
      
[CUALQUIERA] ──→ ANULADA
```

> **Las transiciones reales son configurables por BD** en `CAT_ESTADO_SOLICITUD_TRANSICION`.
> Cada transición tiene un `rol_id` que determina quién puede ejecutarla.
> Para agregar, modificar o eliminar transiciones solo se requiere un INSERT/UPDATE/DELETE
> en esa tabla, sin tocar código.

### 17.2 Transiciones permitidas — Flujo de frontend (v16)

```
1. GET /solicitudes/:id/transiciones-permitidas  →  obtiene array de { estadoDestinoId, estadoDestinoCodigo, rolCodigo }
2. El frontend muestra botones solo para las transiciones retornadas
3. POST /solicitudes/:id/transicion  { "estadoNuevoId": <id>, "motivo": "..." }
```

### 17.3 Estados de Evento

```
PENDIENTE ──→ EN_VALIDACION ──→ APROBADO ──→ EJECUTADO
     │              │
     └──→ RECHAZADO ←┘
     
[CUALQUIERA] ──→ ANULADO
```

### 17.4 Estados de Agendamiento

```
PROGRAMADO ──→ CONFIRMADO ──→ EN_CURSO ──→ COMPLETADO
     │                                          │
     ├──→ REPROGRAMADO                          │
     │                                          │
     ├──→ NO_EJECUTADO ←────────────────────────┘
     │
     └──→ CANCELADO
```

---

## Formato Estándar de Respuesta

Todas las respuestas del backend siguen este formato:

**Éxito (singular/creación):**
```json
{
  "data": { ... },
  "message": "Operación exitosa"
}
```

**Éxito (lista paginada):**
```json
{
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  },
  "message": "Operación exitosa"
}
```

**Error:**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "El RUC de la causa ya existe en otra solicitud activa"
}
```

| HTTP Status | Cuándo ocurre |
|-------------|---------------|
| `200` | GET exitoso, PUT exitoso |
| `201` | POST de creación exitoso |
| `204` | DELETE exitoso (sin body) |
| `400` | Datos inválidos, validación fallida |
| `401` | Token JWT ausente o expirado |
| `403` | Usuario no tiene el permiso requerido |
| `404` | Recurso no encontrado |
| `409` | Conflicto de negocio (duplicado, estado inválido) |
| `422` | Regla de negocio violada (transición de estado no permitida) |
| `500` | Error interno del servidor |

---

## Flujo Completo de Ejemplo (v16)

A continuación, un flujo completo de principio a fin para una solicitud IFT típica,
usando los endpoints y formatos actualizados:

### Día 1 — Recepción de solicitud

1. **Login** `POST /auth/login` → obtener JWT
2. **Cargar catálogos** `GET /catalogos/*` → llenar dropdowns (incluye `estados-solicitud`, `tipos-factibilidad`)
3. **Buscar condenado** `GET /condenados?rutCondenado=12345678-9` → existe, ID 42
4. **Crear solicitud** `POST /solicitudes` con `{ "condenadoId": 42, "tipoCausaId": 1, ... }` → ID 128, estado `RECEPCIONADA`
   - Alternativa: `POST /solicitudes` con `{ "condenado": { ... }, ... }` si el condenado no existe
5. **Agregar solicitantes** `POST /solicitudes/128/solicitantes` → juez, fiscal

### Día 2 — Aprobación

6. **Consultar transiciones** `GET /solicitudes/128/transiciones-permitidas` → `[{ "estadoDestinoId": 2, "estadoDestinoCodigo": "APROBADA" }, { "estadoDestinoId": 3, "estadoDestinoCodigo": "DEVUELTA" }]`
7. **Transicionar** `POST /solicitudes/128/transicion` `{ "estadoNuevoId": 2 }`

### Día 3 — Estudio de factibilidad

8. **Emitir factibilidad** `POST /solicitudes/128/factibilidad` `{ "tipoFactibilidadId": 1 }`
9. **Subir informe PDF** `POST /archivos/upload` con `proposito=INFORME_FACTIBILIDAD`

### Día 5 — Decreto judicial

10. **Crear evento** `POST /eventos` tipo `DECRETO_MONITOREO_INICIAL` → ID 55
11. **Completar resolución** `PUT /resoluciones/55`
12. **Subir documento** `POST /archivos/upload` con `proposito=RESOLUCION_JUDICIAL`

### Día 6 — Validaciones

13. **Ver validaciones** `GET /eventos/55/validaciones` → 2 pendientes
14. **Gendarmería valida** `POST /eventos/55/validaciones/201` `{ "estado": "APROBADO" }`
15. **Coordinador valida** `POST /eventos/55/validaciones/202` `{ "estado": "APROBADO" }` → evento `APROBADO`

### Día 7 — Instalación

16. **Crear evento** `POST /eventos` tipo `INSTALACION` → ID 56
17. **Completar proceso** `PUT /procesos/56`
18. **Agendar** `POST /agendamientos` → fecha 2024-09-10, técnico 5

### Día 10 — Ejecución en terreno

19. **Técnico inicia** `PUT /agendamientos/15/estado` `{ "estadoAgenda": "EN_CURSO" }`
20. **Registrar dispositivo** `POST /procesos/56/dispositivos` `{ "dispositivoId": 10, "rolDispositivoId": 1 }`
21. **Agregar accesorios** `POST /procesos/56/accesorios` (correa, cargador)
22. **Cerrar proceso** `POST /procesos/56/cerrar` `{ "realizado": true }`
23. **Completar agendamiento** `PUT /agendamientos/15/estado` `{ "estadoAgenda": "COMPLETADO" }`

### Día 10 — Actualizar solicitud

24. **Consultar transiciones** `GET /solicitudes/128/transiciones-permitidas` → `[{ "estadoDestinoId": 5, "estadoDestinoCodigo": "INSTALADA" }]`
25. **Transicionar** `POST /solicitudes/128/transicion` `{ "estadoNuevoId": 5 }`
26. **Consultar transiciones** `GET /solicitudes/128/transiciones-permitidas` → `[{ "estadoDestinoId": 6, "estadoDestinoCodigo": "EN_CONTROL" }]`
27. **Transicionar** `POST /solicitudes/128/transicion` `{ "estadoNuevoId": 6 }`

El condenado ahora está en control. La solicitud permanece en `EN_CONTROL` hasta que
llegue un decreto de `CESE_CONTROL`, momento en que se crea un nuevo evento y proceso
de desinstalación.

---

## Consideraciones para el Frontend

### Token JWT

- Guardar el token en `localStorage` o `sessionStorage`.
- Enviarlo en cada request como header `Authorization: Bearer <token>`.
- Si el backend responde `401`, redirigir al login.
- Los permisos vienen en el JWT (`/auth/me`). Usarlos para mostrar/ocultar botones.

### Paginación

- Todos los endpoints `GET` de listado soportan `?page=1&limit=20`.
- `limit` máximo: 100.
- La respuesta incluye `meta.totalPages` para construir el paginador.

### Validaciones del lado del cliente

- **Tipo de causa:** consultar `GET /catalogos/tipos-causa`. Si `codigo = RUC_RIT`, mostrar campos `rucCausa` y `ritCausa`; si `codigo = ROL`, mostrar `rolCausa`.
- **Condenado:** acepta `condenadoId` (existente) o `condenado` (nuevo). Si se usa `condenado`, validar que `esExtranjero = true` muestre `pasaporte` y oculte `rutCondenado`, y viceversa.
- **Zonas:** incluir `tipoLugarId` del catálogo `GET /catalogos/tipos-lugar`.
- **Transiciones:** usar `GET /solicitudes/:id/transiciones-permitidas` para saber qué botones mostrar. Enviar `estadoNuevoId` (INT, no STRING).
- **Factibilidad:** consultar `GET /catalogos/tipos-factibilidad`. Si `requiereMotivo = true`, exigir `motivoNoFactibleId`. Enviar `tipoFactibilidadId` (INT, no STRING).
- **Proceso no realizado:** si `realizado = false`, exigir `motivoNoRealizadoId`.

### Manejo de errores

- Leer `message` del body de error para mostrar al usuario.
- Si existe `errors[]`, son errores de validación por campo.
- Errores `409 Conflict` indican duplicados o conflictos de regla de negocio.
- Errores `422 Unprocessable Entity` indican que la acción no es permitida en el estado actual.

### Subida de archivos

- Usar `FormData` con el campo `file` + campos adicionales `entidad`, `entidadId`, `proposito`.
- La URL de descarga usa el `uuid` del archivo, no el `id`.
- Verificar tamaño de archivo antes de subir (el backend tiene límites configurados).
