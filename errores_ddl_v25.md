# Errores detectados en sga_ddl_v25.sql

## 1. FK faltante en PROCEPSO → AGENDAMIENTO

**Línea 1627-1628:** La columna `agendamiento_id INT NULL` existe pero **no tiene FK constraint**. El resto de columnas referenciales de PROCEPSO sí tienen su FK.

```sql
-- FALTA esta constraint:
CONSTRAINT FK_PROCESO_AGENDAMIENTO FOREIGN KEY (agendamiento_id)
    REFERENCES sga.AGENDAMIENTO(id)
```

---

## 2. FK faltante en SOLICITUD_ESTADO_HIST → EVENTO

**Línea 1343-1344:** La columna `evento_id INT NULL` está documentada como "FK al evento que causó este cambio de estado" pero **no tiene FK constraint**. Las otras FKs (solicitud_id, estado_nuevo_id, estado_anterior_id, usuario_id) sí las tienen.

```sql
-- FALTA esta constraint:
CONSTRAINT FK_SEH_EVENTO FOREIGN KEY (evento_id)
    REFERENCES sga.EVENTO(id)
```

---

## 3. Columnas de auditoría faltantes en SOLICITUD_ZONA

**Líneas 1257-1260:** La tabla tiene `created_by` pero **no tiene `updated_by` ni `deleted_by`**, rompiendo la convención de auditoría del sistema. Todas las demás tablas con soft delete incluyen estos campos.

```sql
-- FALTAN estas columnas después de updated_at:
updated_by  INT NULL,
deleted_by  INT NULL,  -- después de deleted_at
```

---

## 4. Columnas de auditoría faltantes en AGENDAMIENTO

**Líneas 1785-1788:** Misma situación: tiene `created_by` pero **no tiene `updated_by` ni `deleted_by`**.

```sql
-- FALTAN estas columnas después de created_by y después de deleted_at:
updated_by  INT NULL,
deleted_by  INT NULL,
```

---

## 5. Conteo incorrecto en resumen final

**Líneas 2272-2286:** El resumen dice "Catálogos: 18" pero en la Sección 1 hay **27 tablas** de catálogo. El conteo total real es de ~63 tablas, no 43.

Lista real de catálogos en Sección 1:
CAT_REGION, CAT_COMUNA, CAT_TRIBUNAL, CAT_CRS, CAT_TIPO_LEY, CAT_PENA_SUSTITUTIVA, CAT_MEDIDA_CONTROL, CAT_DELITO, CAT_MOTIVO_NO_FACTIBLE, CAT_TIPO_ZONA, CAT_TIPO_LUGAR, CAT_ESTADO_SOLICITUD, CAT_ESTADO_SOLICITUD_TRANSICION, CAT_TIPO_FACTIBILIDAD, CAT_TIPO_CAUSA, CAT_TIPO_EVENTO, CAT_TIPO_EVENTO_VALIDACION, CAT_MOTIVO_NO_REALIZADO, CAT_TIPO_PROBLEMA_ST, CAT_TIPO_ACCESORIO, CAT_TIPO_DIA, CAT_TIPO_HORARIO, CAT_IDENTIDAD_GENERO, CAT_SEXO, CAT_ROL_DISPOSITIVO, CAT_IDENTIFICACION, CAT_PARENTESCO = **27 catálogos**

---

## 6. Inconsistencia: algunos catálogos sin created_at/updated_at

Los siguientes catálogos no tienen columnas de auditoría (`created_at`, `updated_at`), mientras que la mayoría de catálogos (CAT_REGION, CAT_COMUNA, etc.) sí las tienen. Si es intencional, documentar el criterio:

- CAT_ROL
- CAT_PERMISO
- CAT_ROL_DISPOSITIVO
- CAT_ESTADO_SOLICITUD
- CAT_ESTADO_SOLICITUD_TRANSICION
