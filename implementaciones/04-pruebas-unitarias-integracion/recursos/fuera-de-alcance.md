# Fuera de alcance

## Stubs vacíos (sin tests)

- `src/services/globalServices.ts`
- `src/services/penalizacionesServices.ts`
- `src/services/registroPenalizacionesServices.ts`
- `src/services/registroResultadosServices.ts`

## Wrappers de cliente (mockeados, no dominio)

- `src/services/servidor/supabaseServidor.ts`
- `src/services/servidor/supabaseAdmin.ts`

## Componentes UI / CRUD

No se añaden pruebas con Testing Library para:

- `*Crud.tsx`, formularios, wizards, shells (`sidebar`, `NavBard`, etc.)
- Primitivos `src/components/ui/`

Quedan cubiertos (o a cubrir) por **Playwright E2E** en `tests/` según `tests/GUIA-E2E-MODULOS.md`.

Excepción incluida: lógica pura `estadoSolicitudPill.ts`.

## Integración con Supabase local / DB real

No forma parte de esta implementación. La “integración” de servicios es **Vitest + mock fluent**, no Docker/Supabase local.
