# Supabase local — backend-sasha

Este repo usa el proyecto Docker **`backend-sasha`** (ver `config.toml`).

Es independiente de otro stack local (`project_id = "app"`, puertos `6432x`), así que ambos pueden correr a la vez.

## Puertos

| Servicio | Sasha (`backend-sasha`) | Otro proyecto (`app`) |
|---|---|---|
| API | 65321 | 64321 |
| DB | 65322 | 64322 |
| Studio | 65323 | 64323 |
| Inbucket | 65324 | 64324 |
| Analytics | 65327 | 64327 |
| Shadow | 65320 | 64320 |
| Pooler | 65329 | 64329 |

## Arrancar

Desde la raíz de este repo (`C:\trabajos\sasha`):

```bash
npx supabase start
npx supabase status -o env
```

Copia `API_URL`, `ANON_KEY` y `SERVICE_ROLE_KEY` a tu `.env` (usa `.env.example` como guía).

Studio: http://127.0.0.1:65323  
API: http://127.0.0.1:65321

## Parar

```bash
npx supabase stop
```

No uses `supabase stop` desde el otro proyecto si quieres dejar Sasha arriba: cada uno se controla desde su propio directorio.
