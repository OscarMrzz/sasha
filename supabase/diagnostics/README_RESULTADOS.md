# Resultados de la investigación: `supabase db diff` y stack overflow

Fecha documento: proceso según plan en `.cursor/plans` (Investigar fallo db diff).

## Fase 0 — Respaldo

- Presente [`respaldo_public.sql`](/respaldo_public.sql) en la raíz del repo (referencia conocida desde el trabajo previo).

## Fase 1 — Uso de `vista_daniada*` en la aplicación

- Búsqueda en `src/`: los nombres `vista_daniada1` / `vista_daniada2` **solo** aparecen en [`src/lib/database/schemaDB.sql`](../../src/lib/database/schemaDB.sql) (copia/esquema de referencia SQL), **no** en `.tsx` / `.ts` de UI ni servicios.
- Conclusión: la app compilada actual **no** referencia estos nombres; las vistas pueden ser legado/de prueba pero conviene confirmar vistas en Supabase Dashboard y cualquier script externo.

## Fase 2 — Colisión nombre vista vs función (`public`)

- Del dump/`respaldo_public.sql`:
  - Funciones `public`: `generar_codigo_perfil`, `revisar_permisos`.
  - Vistas `public`: `vista_asistencia_bandas`, `vista_daniada1`, `vista_daniada2`, `vista_resultados_*`, `vista_solicitud_revicion`, `vistacumplimientos*`.
  - **Ningún** nombre de vista coincide con el de una función **descartada** la causa típica “vista + función mismo nombre” (issue CLI #4623).

## Fase 3 — Prueba en esquema aislado `diag` (solo lectura después de aplicar SQL)

Archivo reproducible (no tocó `public`): [`fase3_circulo_diag.sql`](fase3_circulo_diag.sql)

- Dos vistas mutuamente dependientes `diag.cv_a` ↔ `diag.cv_b` reproducen **`Maximum call stack size exceeded`** con el motor por defecto del **CLI incluido en el proyecto (2.75.x)** al ejecutar:
  ```bash
  npx supabase db diff --local --schema diag
  ```
- Con **`--use-pg-schema`** en el mismo CLI, el comando **termina bien** sobre `diag`.
- Interpretación: el fallo está en el inspector por defecto (`@pgkit/schemainspect`) ante **grafos circulares de vistas**. Las `vista_daniada*` en `public` siguen el mismo patrón que `pg_dump` usa para vistas circulares (stub + segunda definición).

## Fase 4 — Comparativa de versión CLI

Pruebas en la misma máquina, mismo repo, mismo `docker` local:

| Comando | `--schema public` / `diag` motor por defecto | Resultado |
|--------|------------------------------------------------|-----------|
| `npx supabase db diff …` (**~2.75**, `package.json`) | `public` | **Fallo**: `Maximum call stack size exceeded` |
| `npx supabase db diff …` (**~2.75**) | `diag` circular | **Mismo fallo** |
| `npx supabase db diff …` **+ `--use-pg-schema`** (~2.75) | `diag` circular | **OK** |
| `npx supabase@latest db diff …` (**2.98** en esta corrida) | `public` | **OK** (sin error de pila); “No schema changes found” porque las migraciones actuales ya alineaban la sombra |
| `npx supabase@latest db diff …` (**2.98**) | `diag` circular | **OK**, “No schema changes found” (ver nota*) |

\* Si el CLI no crea archivo con `-f` cuando “no hay cambios”, es el comportamiento observado aquí.

**Conclusión Fase 4:** el problema principal con el flujo “normal” fue la **combinación** de (1) **vistas circularmente dependientes** y (2) el **motor/antiguo edge-runtime del CLI ~2.75**. **`npx supabase@latest`** (p. ej. 2.98+) evita la recursión en este proyecto.

Acción práctica recomendada: **subir `supabase` en `devDependencies`** (ya aplicado si coincide con tu `package.json`) o ejecutar habitualmente:

```bash
npx supabase@latest db diff --local --schema public -f nombre_migration
```

## Fase 5 — Proyecto Supabase temporal

**No ejecutada.** Fase 3 + Fase 4 ya aislaron la causa (`diag` reproducible + contraste CLI viejo vs `latest`). Un segundo proyecto sólo repetiría el mismo efecto.

## Fase 6 — Próximo paso (opcional esquema, no ejecutado aquí)

- **Ya:** usar CLI reciente (`supabase` en `package.json` actualizado, o `@latest`).
- **Opcional (limpieza de esquema):** eliminar o reescribir `vista_daniada1` / `vista_daniada2` como **grafo acíclico** (una sola vista/base con joins reales). Guion de ejemplo **sin aplicación automática**: [`PROPUESTA_opcional_eliminar_vistas_circulares.sql`](PROPUESTA_opcional_eliminar_vistas_circulares.sql).

## Reversible — quitar sólo diagnóstico

Después de leer estos resultados, eliminar el experimento sin tocar `public`:

[`REVERT_drop_schema_diag.sql`](REVERT_drop_schema_diag.sql)

```sql
DROP SCHEMA IF EXISTS diag CASCADE;
```

## Notas operativas

- Si aparece **`Bind for 0.0.0.0:54320 failed: port is already allocated`**, un contenedor de **shadow** quedó colgado. Listar `docker ps` y parar/quitar el contenedor que usa el puerto `54320` (en este entorno apareció algo tipo `*_goldberg`; es **solo** la base sombra temporal del diff).
