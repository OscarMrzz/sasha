# Nomenclaturas

## Carpetas de implementación

- Formato: `NN-slug-kebab` (ej. `01-restructura-carpetas`).

## Models

- Carpeta por dominio: `src/models/bandas/`, `src/models/eventos/`, etc.
- Archivo por interface/type con la **definición real** (`export interface` / `export type`), conservando el nombre exportado:
  - `bandaInterface` → `bandaInterface.ts` (cuerpo completo)
  - `bandaDatosAmpleosInterface` → `bandaDatosAmpleosInterface.ts` (cuerpo + imports de dependencias)
- **Prohibido**: monolito `allInterfaces.ts` y stubs `export type { X } from "../allInterfaces"`.
- **Prohibido**: `index.ts` por dominio.
- Único barrel: `src/models/index.ts` (reexporta desde los archivos reales para `from "@/models"`).

## Capas

| Tipo | Ubicación | Ejemplo |
|---|---|---|
| Service | `src/services/` | `bandasServices.ts` |
| Helper | `src/helpers/` | `fechas/formatearFechaEvento.ts` |
| Config | `src/config/` | `navegacion/navigationConfig.ts` |
| Action | `src/actions/` | `rankingGlobal.ts` |
| Infra | `src/lib/` | `supabase.ts`, `utils.ts` |

## Components

- Un solo árbol: `src/components/`.
- Design system: `components/ui/`, `components/shadcn-studio/`.
- Dominio: subcarpetas existentes (`bandas/`, `eventos/`, `CardRow/`, …).

## Imports

- Alias `@/*` → `./src/*`.
- Preferir: `@/models/...`, `@/services/...`, `@/helpers/...`, `@/config/...`, `@/components/...`.
