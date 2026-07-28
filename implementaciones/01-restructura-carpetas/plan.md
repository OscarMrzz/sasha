# Plan — 01-restructura-carpetas

## Alcance

1. Crear historial `implementaciones/` con guía y esta entrada.
2. Partir `src/interfaces` a `src/models/<dominio>/`.
3. Desarmar `src/lib` en `services/`, `helpers/`, `config/`, `actions/`; dejar `lib/` solo infra.
4. Unificar `src/component` → `src/components`.
5. Renombrar `feacture` → `features` y `Store` → `store`.
6. Ordenar `supabase/snippets` y limpiar huérfanos.
7. Actualizar todos los imports y verificar build.

## Fuera de alcance

- Cambiar lógica de negocio o nombres de interfaces.
- Reorganizar páginas bajo `src/app`.
- Alterar `supabase/migrations`.

## Orden de ejecución

1. Docs de historial
2. Models
3. Capas lib
4. Components
5. Renombres feature/store
6. Snippets + huérfanos
7. Verificación build
