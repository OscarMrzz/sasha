# Mapa de movimientos

## Interfaces → models

| Origen | Destino |
|---|---|
| `src/interfaces/interfaces.ts` | `src/models/<dominio>/*.ts` + `src/models/index.ts` |
| `src/interfaces/interfaceAuditoria.ts` | `src/models/auditoria/*` |

## Lib → capas

| Origen | Destino |
|---|---|
| `src/lib/services/**` | `src/services/**` |
| `src/lib/actions/**` | `src/actions/**` |
| `src/lib/fechas/**`, `busqueda/**`, `errores/**`, `helpers/**`, `condensado/**`, `copas/**`, `eventos/**`, `solicitudCopa/**`, `solicitudesRevicion/**`, `usuarios/**`, `utils/**` (dominio), `mi-banda/**` | `src/helpers/**` |
| `src/lib/navegacion/**`, `rutas.ts`, `atajos/**` | `src/config/**` (atajos completos en config) |
| `src/lib/supabase*.ts`, `utils.ts`, `*Persistence.ts` | permanece en `src/lib/` |
| `src/lib/scripts/**`, `database/**` | huérfanos → eliminar o archivar en recursos |

## Components

| Origen | Destino |
|---|---|
| `src/component/**` | `src/components/**` |

## Renombres

| Origen | Destino |
|---|---|
| `src/feacture/**` | `src/features/**` |
| `src/Store/**` | `src/store/**` |

## Imports

| Antes | Después |
|---|---|
| `@/models` | `@/models` |
| `@/models/auditoria` | `@/models/auditoria` |
| `@/services/...` | `@/services/...` |
| `@/actions/...` | `@/actions/...` |
| `@/helpers/fechas/...` (y helpers) | `@/helpers/...` |
| `@/config/navegacion/...`, `@/config/rutas` | `@/config/...` |
| `@/config/atajos/...` | `@/config/atajos/...` |
| `@/components/...` | `@/components/...` |
| `@/features/...` | `@/features/...` |
| `@/store/...` | `@/store/...` |
