-- Elimina vistas circulares rotas (vista_daniada1 <-> vista_daniada2).
-- Requiere CASCADE: sin él, PostgreSQL devuelve error de dependencias mutuas.
-- No usadas por el código TypeScript/React del repo; equivalente útil es vista_resultados_generales.

DROP VIEW IF EXISTS public.vista_daniada1 CASCADE;
DROP VIEW IF EXISTS public.vista_daniada2 CASCADE;
