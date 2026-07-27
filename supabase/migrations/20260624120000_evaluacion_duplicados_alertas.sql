-- Evaluaciones duplicadas: funciones, permisos, policies RLS e indices UNIQUE.
-- Funciones canonicas tambien en: supabase/snippets/funciones/funciones.sql

-- =============================================================================
-- evaluacion_cumplimiento_no_duplicada
-- RLS: retorna true si NO existe cumplimiento para banda+criterio+evento.
-- Usada en policy INSERT de registroCumplimientoEvaluaciones.
-- =============================================================================
DROP FUNCTION IF EXISTS public.evaluacion_cumplimiento_no_duplicada(uuid, uuid, uuid);

CREATE OR REPLACE FUNCTION public.evaluacion_cumplimiento_no_duplicada(
  p_id_banda uuid,
  p_id_criterio uuid,
  p_id_evento uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
SET row_security TO off
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public."registroCumplimientoEvaluaciones" rce
    WHERE rce."idForaneaBanda" = p_id_banda
      AND rce."idForaneaCriterio" = p_id_criterio
      AND rce."idForaneaEvento" = p_id_evento
  );
$$;

GRANT EXECUTE ON FUNCTION public.evaluacion_cumplimiento_no_duplicada(uuid, uuid, uuid) TO authenticated;

-- =============================================================================
-- evaluacion_comentario_no_duplicado
-- RLS: retorna true si NO existe comentario para banda+evento+rúbrica.
-- Usada en policy INSERT de registroComentarios.
-- =============================================================================
DROP FUNCTION IF EXISTS public.evaluacion_comentario_no_duplicado(uuid, uuid, uuid);

CREATE OR REPLACE FUNCTION public.evaluacion_comentario_no_duplicado(
  p_id_banda uuid,
  p_id_evento uuid,
  p_id_rubrica uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
SET row_security TO off
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public."registroComentarios" rc
    WHERE rc."idForaneaBanda" = p_id_banda
      AND rc."idForaneaEvento" = p_id_evento
      AND rc."idForaneaRubrica" = p_id_rubrica
  );
$$;

GRANT EXECUTE ON FUNCTION public.evaluacion_comentario_no_duplicado(uuid, uuid, uuid) TO authenticated;

-- =============================================================================
-- listar_cumplimientos_evaluacion_duplicados
-- Lista filas de cumplimiento que serían eliminadas (numero_fila > 1).
-- Requiere permiso alertas_evaluacion / SELECT.
-- =============================================================================
DROP FUNCTION IF EXISTS public.listar_cumplimientos_evaluacion_duplicados();

CREATE OR REPLACE FUNCTION public.listar_cumplimientos_evaluacion_duplicados()
RETURNS TABLE (
  "idRegistroCumplimientoEvaluacion" uuid,
  "idForaneaBanda" uuid,
  "idForaneaEvento" uuid,
  "idForaneaCriterio" uuid,
  "idForaneaRubrica" uuid,
  "nombreBanda" text,
  "nombreRubrica" text,
  "nombreCriterio" text,
  "puntosObtenidos" double precision,
  created_at timestamptz,
  numero_fila bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
SET row_security TO off
AS $function$
BEGIN
  IF NOT public.revisar_permisos('alertas_evaluacion', 'SELECT') THEN
    RAISE EXCEPTION 'Sin permiso para listar alertas de evaluación duplicada';
  END IF;

  RETURN QUERY
  WITH numerados AS (
    SELECT
      rce."idRegistroCumplimientoEvaluacion",
      rce."idForaneaBanda",
      rce."idForaneaEvento",
      rce."idForaneaCriterio",
      rce."idForaneaRubrica",
      b."nombreBanda",
      rub."nombreRubrica",
      ce."nombreCriterio",
      rce."puntosObtenidos",
      rce.created_at,
      ROW_NUMBER() OVER (
        PARTITION BY rce."idForaneaBanda", rce."idForaneaCriterio", rce."idForaneaEvento"
        ORDER BY rce.created_at ASC
      ) AS numero_fila
    FROM public."registroCumplimientoEvaluaciones" rce
    JOIN public.bandas b ON b."idBanda" = rce."idForaneaBanda"
    JOIN public.rubricas rub ON rub."idRubrica" = rce."idForaneaRubrica"
    JOIN public."criteriosEvalucion" ce ON ce."idCriterio" = rce."idForaneaCriterio"
  )
  SELECT
    n."idRegistroCumplimientoEvaluacion",
    n."idForaneaBanda",
    n."idForaneaEvento",
    n."idForaneaCriterio",
    n."idForaneaRubrica",
    n."nombreBanda",
    n."nombreRubrica",
    n."nombreCriterio",
    n."puntosObtenidos",
    n.created_at,
    n.numero_fila
  FROM numerados n
  WHERE n.numero_fila > 1
  ORDER BY n."nombreBanda", n."nombreCriterio", n.created_at;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.listar_cumplimientos_evaluacion_duplicados() TO authenticated;

-- =============================================================================
-- listar_comentarios_rubrica_duplicados
-- Lista comentarios duplicados por banda+evento+rúbrica (numero_fila > 1).
-- Requiere permiso alertas_evaluacion / SELECT.
-- =============================================================================
DROP FUNCTION IF EXISTS public.listar_comentarios_rubrica_duplicados();

CREATE OR REPLACE FUNCTION public.listar_comentarios_rubrica_duplicados()
RETURNS TABLE (
  "idRegistroComentario" uuid,
  "idForaneaBanda" uuid,
  "idForaneaEvento" uuid,
  "idForaneaRubrica" uuid,
  "nombreBanda" text,
  "nombreRubrica" text,
  "LugarEvento" text,
  "fechaEvento" date,
  created_at timestamptz,
  numero_fila bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
SET row_security TO off
AS $function$
BEGIN
  IF NOT public.revisar_permisos('alertas_evaluacion', 'SELECT') THEN
    RAISE EXCEPTION 'Sin permiso para listar alertas de evaluación duplicada';
  END IF;

  RETURN QUERY
  WITH numerados AS (
    SELECT
      rc."idRegistroComentario",
      rc."idForaneaBanda",
      rc."idForaneaEvento",
      rc."idForaneaRubrica",
      b."nombreBanda",
      rub."nombreRubrica",
      ev."LugarEvento",
      ev."fechaEvento",
      rc.created_at,
      ROW_NUMBER() OVER (
        PARTITION BY rc."idForaneaBanda", rc."idForaneaEvento", rc."idForaneaRubrica"
        ORDER BY rc.created_at ASC
      ) AS numero_fila
    FROM public."registroComentarios" rc
    JOIN public.bandas b ON b."idBanda" = rc."idForaneaBanda"
    JOIN public.rubricas rub ON rub."idRubrica" = rc."idForaneaRubrica"
    JOIN public."registroEventos" ev ON ev."idEvento" = rc."idForaneaEvento"
  )
  SELECT
    n."idRegistroComentario",
    n."idForaneaBanda",
    n."idForaneaEvento",
    n."idForaneaRubrica",
    n."nombreBanda",
    n."nombreRubrica",
    n."LugarEvento",
    n."fechaEvento",
    n.created_at,
    n.numero_fila
  FROM numerados n
  WHERE n.numero_fila > 1
  ORDER BY n."nombreBanda", n."nombreRubrica", n.created_at;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.listar_comentarios_rubrica_duplicados() TO authenticated;

-- =============================================================================
-- obtener_alertas_evaluacion_duplicada
-- Agrupa duplicados para el panel Alertas (cards).
-- Requiere permiso alertas_evaluacion / SELECT.
-- =============================================================================
DROP FUNCTION IF EXISTS public.obtener_alertas_evaluacion_duplicada();

CREATE OR REPLACE FUNCTION public.obtener_alertas_evaluacion_duplicada()
RETURNS TABLE (
  tipo text,
  clave_alerta text,
  "idForaneaBanda" uuid,
  "idForaneaEvento" uuid,
  "idForaneaCriterio" uuid,
  "idForaneaRubrica" uuid,
  "nombreBanda" text,
  "nombreRubrica" text,
  "nombreCriterio" text,
  "LugarEvento" text,
  "fechaEvento" date,
  cantidad_duplicados bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
SET row_security TO off
AS $function$
BEGIN
  IF NOT public.revisar_permisos('alertas_evaluacion', 'SELECT') THEN
    RAISE EXCEPTION 'Sin permiso para consultar alertas de evaluación';
  END IF;

  RETURN QUERY
  SELECT
    'cumplimiento_duplicado'::text AS tipo,
    ('cumplimiento:' || d."idForaneaBanda"::text || ':' || d."idForaneaEvento"::text || ':' || d."idForaneaCriterio"::text) AS clave_alerta,
    d."idForaneaBanda",
    d."idForaneaEvento",
    d."idForaneaCriterio",
    d."idForaneaRubrica",
    d."nombreBanda",
    d."nombreRubrica",
    d."nombreCriterio",
    ev."LugarEvento",
    ev."fechaEvento",
    COUNT(*)::bigint AS cantidad_duplicados
  FROM public.listar_cumplimientos_evaluacion_duplicados() d
  JOIN public."registroEventos" ev ON ev."idEvento" = d."idForaneaEvento"
  GROUP BY
    d."idForaneaBanda",
    d."idForaneaEvento",
    d."idForaneaCriterio",
    d."idForaneaRubrica",
    d."nombreBanda",
    d."nombreRubrica",
    d."nombreCriterio",
    ev."LugarEvento",
    ev."fechaEvento"

  UNION ALL

  SELECT
    'rubrica_duplicada'::text AS tipo,
    ('rubrica:' || d."idForaneaBanda"::text || ':' || d."idForaneaEvento"::text || ':' || d."idForaneaRubrica"::text) AS clave_alerta,
    d."idForaneaBanda",
    d."idForaneaEvento",
    NULL::uuid AS "idForaneaCriterio",
    d."idForaneaRubrica",
    d."nombreBanda",
    d."nombreRubrica",
    NULL::text AS "nombreCriterio",
    d."LugarEvento",
    d."fechaEvento",
    COUNT(*)::bigint AS cantidad_duplicados
  FROM public.listar_comentarios_rubrica_duplicados() d
  GROUP BY
    d."idForaneaBanda",
    d."idForaneaEvento",
    d."idForaneaRubrica",
    d."nombreBanda",
    d."nombreRubrica",
    d."LugarEvento",
    d."fechaEvento"

  ORDER BY "nombreBanda", tipo;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.obtener_alertas_evaluacion_duplicada() TO authenticated;

-- =============================================================================
-- resolver_evaluaciones_cumplimiento_duplicadas
-- Elimina cumplimientos duplicados; conserva el registro más antiguo.
-- Requiere permiso alertas_evaluacion / EXECUTE.
-- =============================================================================
DROP FUNCTION IF EXISTS public.resolver_evaluaciones_cumplimiento_duplicadas();

CREATE OR REPLACE FUNCTION public.resolver_evaluaciones_cumplimiento_duplicadas()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
SET row_security TO off
AS $function$
DECLARE
  filas_borradas integer;
BEGIN
  IF NOT public.revisar_permisos('alertas_evaluacion', 'EXECUTE') THEN
    RAISE EXCEPTION 'Sin permiso para resolver alertas de evaluación';
  END IF;

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
  WHERE rce."idRegistroCumplimientoEvaluacion" IN (SELECT b."idRegistroCumplimientoEvaluacion" FROM borrar b);

  GET DIAGNOSTICS filas_borradas = ROW_COUNT;
  RETURN filas_borradas;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.resolver_evaluaciones_cumplimiento_duplicadas() TO authenticated;

-- =============================================================================
-- resolver_comentarios_rubrica_duplicados
-- Elimina comentarios duplicados por banda+evento+rúbrica; conserva el más antiguo.
-- Requiere permiso alertas_evaluacion / EXECUTE.
-- =============================================================================
DROP FUNCTION IF EXISTS public.resolver_comentarios_rubrica_duplicados();

CREATE OR REPLACE FUNCTION public.resolver_comentarios_rubrica_duplicados()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
SET row_security TO off
AS $function$
DECLARE
  filas_borradas integer;
BEGIN
  IF NOT public.revisar_permisos('alertas_evaluacion', 'EXECUTE') THEN
    RAISE EXCEPTION 'Sin permiso para resolver alertas de evaluación';
  END IF;

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
  WHERE rc."idRegistroComentario" IN (SELECT b."idRegistroComentario" FROM borrar b);

  GET DIAGNOSTICS filas_borradas = ROW_COUNT;
  RETURN filas_borradas;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.resolver_comentarios_rubrica_duplicados() TO authenticated;

-- Permisos alertas_evaluacion (admin, admin temporal, developer, responsable de mesa)
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
