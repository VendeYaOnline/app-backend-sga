# SGA Backend

Backend del Sistema de Gestión de Acuerdos (SGA) — NestJS + TypeORM + SQL Server.

## Stack

- **Framework:** NestJS
- **ORM:** TypeORM con driver `mssql`
- **BD:** SQL Server 2019+, schema `sga`
- **Auth:** JWT (access token)
- **Validación:** `class-validator` + `class-transformer`
- **Package manager:** pnpm

## Instalación

```bash
pnpm install
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar los valores:

```env
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASS=your_password
DB_NAME=TDH_Automatic

JWT_SECRET=clave-secreta
JWT_EXPIRES_IN=8h

STORAGE_ROOT=C:/sga-storage

PJUD_SYSTEM_USER_ID=1

PORT=3000
NODE_ENV=development
```

## Levantar el proyecto

```bash
# desarrollo con recarga automática
pnpm run start:dev

# producción
pnpm run start:prod
```

## Base de datos

El DDL completo está en `sga_ddl_v47.sql`. Ejecutarlo en SQL Server antes de levantar el backend por primera vez. No se generan migraciones desde entidades; los cambios de esquema se hacen directamente en ese archivo.

## Documentación API

Con el servidor corriendo, Swagger está disponible en `http://localhost:3000/api`.

---

## Pendientes PJUD

Las integraciones con PJUD están **simuladas** mientras llega la documentación oficial de sus endpoints. Hay dos puntos a reemplazar cuando esté disponible:

### 1. Registro de solicitud en PJUD al crear desde formulario web

**Archivo:** `src/modules/solicitud/services/solicitud.service.ts`
**Método:** `simularRegistroEnPjud(dto)`

Cuando se crea una solicitud desde el formulario web (`FORMULARIO_WEB`), el sistema debe primero registrarla en PJUD y obtener el `crrIdSolicitud` (que se guarda como `solicitudPjudId`). Actualmente esto está simulado con un ID aleatorio.

**Qué hay que hacer:**
- Reemplazar el cuerpo de `simularRegistroEnPjud()` por una llamada HTTP real al endpoint de PJUD.
- El response real de PJUD tiene esta estructura (puede cambiar):
  ```json
  {
    "crrIdSolicitud": 1,
    "fechaRespuesta": "2022-06-02T15:35:12.230525200",
    "recepcion": 1,
    "folio": 123456789876543210,
    "mensaje": "IFT Recibido Correctamente"
  }
  ```
- Solo `crrIdSolicitud` se persiste en `SOLICITUD.solicitud_pjud_id`. El `folio` va a `PJUD_LLAMADA.folio_externo`.
- Si PJUD responde con error, lanzar excepción para que la solicitud **no** se cree en SGA.

### 2. Envío de factibilidad a PJUD

**Archivo:** `src/modules/pjud/services/pjud.service.ts`
**Método:** `simularEnvioFactibilidad(payload)`

Al enviar la factibilidad técnica (`POST /pjud/enviar-factibilidad/:id`), actualmente se simula una respuesta exitosa de PJUD sin hacer ninguna llamada HTTP real.

**Qué hay que hacer:**
- Obtener el PDF del informe de factibilidad usando `archivoService` y convertirlo a base64.
- Agregar `docFactibilidad: pdfBase64` al payload (el campo está comentado con un TODO en `enviarFactibilidad()`).
- Reemplazar el cuerpo de `simularEnvioFactibilidad()` por un `POST` HTTP real a `PJUD_BASE_URL + PJUD_FACTIBILIDAD_PATH`.
- Agregar `PJUD_BASE_URL` y `PJUD_FACTIBILIDAD_PATH` al `.env` cuando se conozcan las URLs.
- Si PJUD responde con error, actualizar el registro `PJUD_LLAMADA` con `procesadoOk = false` y lanzar `BadGatewayException`.
