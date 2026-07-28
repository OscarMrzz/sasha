# Plan — 03-sasha-rebrand-seed

## Cómo se crea esta carpeta

Seguir [`implementaciones/README.md`](../README.md). Detalle en [`recursos/`](./recursos/).

## Alcance

- Rebrand total a Sasha: UI, seeds, políticas, snippets, migrations de bucket, docs y `package.json` (sin nombres de marca legacy).
- Nuevos datos de prueba en `supabase/snippets/datos/datos_prueba.sql`:
  - Federación `SASHA-DEV`, emails `@sasha.com`
  - 3 categorías, 9 bandas, 4 eventos
  - Banda evaluada demo: Dionisio de Herrera
  - Equipo evaluador asignado a los 4 eventos (sin depender de `CURRENT_DATE`)

## Fuera de alcance

- Cambiar rutas de `src/app`
- Rediseño visual de la plataforma

## Fases

1. Registro en `implementaciones/`
2. Reescritura de `datos_prueba.sql`
3. Rebrand app + supabase + meta
4. Verificación sin nombres de marca legacy + marcar completada

## Recursos

- [`mapa-rebrand.md`](./recursos/mapa-rebrand.md)
- [`datos-seed.md`](./recursos/datos-seed.md)
