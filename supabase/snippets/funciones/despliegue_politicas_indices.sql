
-- =============================================================================
-- BLOQUE 2: permisos, policies, limpieza e indices (ejecutar DESPUES de funciones)
-- =============================================================================

INSERT INTO public.permisos ("idPermiso", "created_at", "idForaneaRol", "tabla", "accion")
SELECT gen_random_uuid(), now(), r."idRol", t.tabla, t.accion
FROM public.roles r
CROSS JOIN (
  VALUES
    ('alertas_evaluacion', 'SELECT'),
    ('alertas_evaluacion', 'EXECUTE')
) AS t(tabla, accion)
WHERE r."nombreRol" IN ('admin', 'admin temporal', 'developer', 'responsable de mesa')
  AND NOT EXISTS (
    SELECT 1
    FROM public.permisos p
    WHERE p."idForaneaRol" = r."idRol"
      AND p.tabla = t.tabla
      AND p.accion = t.accion
  );

DROP POLICY IF EXISTS "crear" ON public."registroCumplimientoEvaluaciones";
CREATE POLICY "crear" ON public."registroCumplimientoEvaluaciones"
  FOR INSERT
  WITH CHECK (
    public.revisar_permisos('registroCumplimientoEvaluaciones'::text, 'INSERT'::text)
    AND public.evaluacion_cumplimiento_no_duplicada(
      "idForaneaBanda",
      "idForaneaCriterio",
      "idForaneaEvento"
    )
  );

DROP POLICY IF EXISTS "crear" ON public."registroComentarios";
CREATE POLICY "crear" ON public."registroComentarios"
  FOR INSERT
  WITH CHECK (
    public.revisar_permisos('registroComentarios'::text, 'INSERT'::text)
    AND public.evaluacion_comentario_no_duplicado(
      "idForaneaBanda",
      "idForaneaEvento",
      "idForaneaRubrica"
    )
  );

WITH numerados AS (
  SELECT
    rce."idRegistroCumplimientoEvaluacion",
    ROW_NUMBER() OVER (
      PARTITION BY rce."idForaneaBanda", rce."idForaneaCriterio", rce."idForaneaEvento"
      ORDER BY rce.created_at ASC
    ) AS numero_fila
  FROM public."registroCumplimientoEvaluaciones" rce
),
borrar AS (
  SELECT n."idRegistroCumplimientoEvaluacion"
  FROM numerados n
  WHERE n.numero_fila > 1
)
DELETE FROM public."registroCumplimientoEvaluaciones" rce
WHERE rce."idRegistroCumplimientoEvaluacion" IN (
  SELECT b."idRegistroCumplimientoEvaluacion" FROM borrar b
);

WITH numerados AS (
  SELECT
    rc."idRegistroComentario",
    ROW_NUMBER() OVER (
      PARTITION BY rc."idForaneaBanda", rc."idForaneaEvento", rc."idForaneaRubrica"
      ORDER BY rc.created_at ASC
    ) AS numero_fila
  FROM public."registroComentarios" rc
),
borrar AS (
  SELECT n."idRegistroComentario"
  FROM numerados n
  WHERE n.numero_fila > 1
)
DELETE FROM public."registroComentarios" rc
WHERE rc."idRegistroComentario" IN (
  SELECT b."idRegistroComentario" FROM borrar b
);

CREATE UNIQUE INDEX IF NOT EXISTS registro_cumplimiento_eval_banda_criterio_evento_unique
  ON public."registroCumplimientoEvaluaciones"
  ("idForaneaBanda", "idForaneaCriterio", "idForaneaEvento");

CREATE UNIQUE INDEX IF NOT EXISTS registro_comentario_eval_banda_evento_rubrica_unique
  ON public."registroComentarios"
  ("idForaneaBanda", "idForaneaEvento", "idForaneaRubrica");
