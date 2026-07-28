# Datos de prueba Sasha

Fuente: `supabase/snippets/datos/datos_prueba.sql`

## Federación

- Nombre: `SASHA-DEV`
- Usuarios de prueba: `*@sasha.com` / password `12345678`

## Región

Una sola: **general**

## Categorías

| Código | Nombre |
|---|---|
| BASICA | Categoría Básica |
| INTERMEDIA | Categoría intermedia |
| AVANZADA | Avanzada |

## Bandas

| Categoría | Bandas |
|---|---|
| Básica | Francisco Morazan, Luis Landa, Dionisio de Herrera, San Francisco |
| Intermedia | Centro educativo perfecto, Las aguilas, San José |
| Avanzada | Fraternidad, San Antonio |

Banda evaluada (demo scores/premios): **Dionisio de Herrera**.

## Eventos

| LugarEvento | Fecha | Región |
|---|---|---|
| Dionisio de Herrera SPS | 2026-08-08 | general |
| evento test 2 | 2026-08-09 | general |
| evento test 3 | 2026-08-16 | general |
| evento test 4 | 2026-08-23 | general |

Equipo evaluador: jurados globales + fiscal / responsables / secretaria en los 4 eventos.

## Carga en local (Supabase Studio)

1. `datos_prueba.sql`
2. `politicas.sql` (obligatorio: permisos + `revisar_permisos`)
3. Cerrar sesión en la app y entrar con `admin@sasha.com` / `12345678`

**Nota:** Los eventos existen en la BD pero la app los oculta si `revisar_permisos` usa comparación exacta (`registroEventos` ≠ `registro_eventos`). Eso se corrige ejecutando `politicas.sql` actualizado o la migración `20260728000003_fix_revisar_permisos_snake_case.sql`.

En el **dashboard** solo se listan eventos de **hoy** o en curso/finalizados; los de agosto 2026 se ven en **Panel → Eventos**.
