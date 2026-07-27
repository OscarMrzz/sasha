-- Una rúbrica solo puede estar asignada a un jurado por evento.
-- Limpia duplicados existentes (conserva el registro más antiguo por par evento+rúbrica).

WITH ranked AS (
  SELECT "idRegistroEvaluador",
         ROW_NUMBER() OVER (
           PARTITION BY "idForaneaEvento", id_foranea_rubrica
           ORDER BY created_at ASC, "idRegistroEvaluador" ASC
         ) AS rn
  FROM public."registroEquipoEvaluador"
  WHERE id_foranea_rubrica IS NOT NULL
)
UPDATE public."registroEquipoEvaluador" ree
SET id_foranea_rubrica = NULL
FROM ranked r
WHERE ree."idRegistroEvaluador" = r."idRegistroEvaluador"
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS registro_equipo_evaluador_evento_rubrica_unique
ON public."registroEquipoEvaluador" ("idForaneaEvento", id_foranea_rubrica)
WHERE id_foranea_rubrica IS NOT NULL;
