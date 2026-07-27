-- Diagnóstico: por qué vista_resultados_temporada puede estar vacía
-- Ejecutar en el SQL Editor de Supabase

-- 1) Eventos sin tipo_evento (no entran en ninguna vista de resultados)
SELECT count(*) AS eventos_sin_tipo
FROM public."registroEventos"
WHERE tipo_evento IS NULL;

-- 2) Evaluaciones del año actual vs eventos excluidos por tipo
SELECT
  e."idEvento",
  e."LugarEvento",
  e."fechaEvento",
  e.tipo_evento,
  e."idForaneaRegion",
  count(r."idRegistroCumplimientoEvaluacion") AS evaluaciones
FROM public."registroEventos" e
LEFT JOIN public."registroCumplimientoEvaluaciones" r
  ON r."idForaneaEvento" = e."idEvento"
WHERE extract(year FROM e."fechaEvento") = extract(year FROM current_date)
GROUP BY e."idEvento", e."LugarEvento", e."fechaEvento", e.tipo_evento, e."idForaneaRegion"
ORDER BY e."fechaEvento";

-- 3) Subconsulta de la vista (debe devolver filas por evento/banda)
SELECT
  bandas."idBanda",
  bandas."nombreBanda",
  sum(r."puntosObtenidos") AS total
FROM public."registroCumplimientoEvaluaciones" r
JOIN public."registroEventos" e ON e."idEvento" = r."idForaneaEvento"
JOIN public.bandas ON bandas."idBanda" = r."idForaneaBanda"
WHERE (
    (e.tipo_evento = 'regional' AND e."idForaneaRegion" = bandas."idForaneaRegion")
    OR e.tipo_evento = 'nacional'
  )
  AND extract(year FROM e."fechaEvento") = extract(year FROM current_date)
GROUP BY bandas."idBanda", bandas."nombreBanda"
LIMIT 20;

-- 4) Vista final
SELECT * FROM public.vista_resultados_temporada LIMIT 20;
