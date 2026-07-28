# Huérfanos y limpieza

## Eliminados / archivados

| Item | Motivo | Acción |
|---|---|---|
| `src/lib/scripts/scriptRespaldarSchemaDB.mjs` | 0 referencias en el código | Eliminado |
| `src/lib/database/schemaDB.sql` | Casi sin uso; no es fuente de verdad (hay migrations) | Archivado en `recursos/schemaDB.sql.bak` si se conservó, o eliminado |
| `scriptListarProyectosSupabase.mjs` | Referenciado solo en `tsconfig` include; ausente en disco | Entrada quitada de `tsconfig.json` |
| Entradas basura en `tsconfig.json` `include` | Paths sueltos a archivos concretos | Limpiado |

## Conservado en `src/lib/` (infra)

- `supabase.ts`, `supabaseProxy.ts`, `supabaseStorageImage.ts`
- `utils.ts` (shadcn)
- `*Persistence.ts`
