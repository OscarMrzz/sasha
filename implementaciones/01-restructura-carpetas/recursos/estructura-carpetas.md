# Estructura de carpetas (before → after)

## Antes

```text
src/
  app/
  component/          # dominio UI
  components/         # solo shadcn/ui
  interfaces/         # monolito interfaces.ts
  lib/                # services + helpers + config + actions mezclados
  feacture/
  Store/
  hooks/
  ...
```

## Después

```text
src/
  app/                 # sin cambios de rutas
  components/          # dominio + ui + shadcn-studio
  models/              # interfaces por dominio
  services/            # llamados al backend
  helpers/             # utilidades de dominio
  config/              # navegación, rutas, atajos
  actions/             # server actions
  lib/                 # infra (supabase, utils shadcn, persistence)
  features/            # ex feacture
  store/               # ex Store
  hooks/
  providers/
  types/
  animacionesJson/
```

## Capas

| Capa | Responsabilidad |
|---|---|
| `models/` | Tipos e interfaces de dominio |
| `services/` | Llamadas a Supabase / backend |
| `helpers/` | Funciones puras / helpers de dominio |
| `config/` | Configuración (nav, rutas, atajos) |
| `actions/` | Server actions de Next.js |
| `lib/` | Infra compartida mínima |
| `components/` | UI |
