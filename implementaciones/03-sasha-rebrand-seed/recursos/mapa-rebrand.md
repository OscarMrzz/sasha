# Mapa rebrand → Sasha

## Sustituciones

| Antes (marca / dominio legacy) | Después |
|---|---|
| Nombre federación DEV legacy | `SASHA-DEV` |
| Dominio de emails de prueba | `@sasha.com` |
| Título / branding UI | `Sasha` / `SASHA` |
| Bucket perfiles | `img-fotos-perfiles-sasha` |
| Keys de persistence / cookies | `sasha_*`, `sasha-sidebar-collapsed` |

## Áreas tocadas

- **UI:** header, nav, home, layout title, PDF footer, placeholders de banda
- **Persistence:** `evaluarPersistence`, `fiscalPersistence`, `copasWizardPersistence`, `sesion`, sidebar collapse
- **Services:** bucket default en `perfilesServices`
- **Supabase:** `seed.sql`, `politicas.sql`, `datos_prueba.sql`, snippets/tests, migrations de storage bucket
- **Meta:** `package.json`, docs (`tests/Data.md`, `dev/…`, `supabase/README.md`, `.env.example`)

## Archivos renombrados

- Snippets de test de temporada 2026 / reunión → `test_SASHA2026.sql`, `test_SASHA2026_presentacion.sql`, `test_SASHA_REUNION.sql`
