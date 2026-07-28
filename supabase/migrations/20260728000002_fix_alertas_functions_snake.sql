-- Fix alertas/evaluacion functions and related objects after snake_case rename

-- Drop policies that depend on evaluacion_* functions before recreating them
DROP POLICY IF EXISTS "crear" ON public.registro_cumplimiento_evaluaciones;
DROP POLICY IF EXISTS "crear" ON public.registro_comentarios;

-- =============================================================================
-- revisar_permisos (cuerpo aún referenciaba columnas camelCase)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.revisar_permisos(target_table text, target_action text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET row_security TO 'off'
AS $function$
DECLARE
  tiene_permisos boolean;
  id_rol_user_auth uuid;
BEGIN
  SELECT pf.id_foranea_rol INTO id_rol_user_auth
  FROM public.perfiles pf
  WHERE pf.id_foranea_user = auth.uid()
  ORDER BY
    CASE WHEN pf.id_foranea_banda IS NOT NULL THEN 0 ELSE 1 END,
    pf.created_at DESC NULLS LAST
  LIMIT 1;

  IF id_rol_user_auth IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.permisos
    WHERE permisos.id_foranea_rol = id_rol_user_auth
      AND permisos.tabla = target_table
      AND permisos.accion = target_action
  ) INTO tiene_permisos;

  RETURN tiene_permisos;
END;
$function$;

-- Evaluaciones duplicadas: funciones, permisos, policies RLS e indices UNIQUE.
-- Funciones canonicas tambien en: supabase/snippets/funciones/funciones.sql

-- =============================================================================
-- evaluacion_cumplimiento_no_duplicada
-- RLS: retorna true si NO existe cumplimiento para banda+criterio+evento.
-- Usada en policy INSERT de registro_cumplimiento_evaluaciones.
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
    FROM public.registro_cumplimiento_evaluaciones rce
    WHERE rce.id_foranea_banda = p_id_banda
      AND rce.id_foranea_criterio = p_id_criterio
      AND rce.id_foranea_evento = p_id_evento
  );
$$;

GRANT EXECUTE ON FUNCTION public.evaluacion_cumplimiento_no_duplicada(uuid, uuid, uuid) TO authenticated;

-- =============================================================================
-- evaluacion_comentario_no_duplicado
-- RLS: retorna true si NO existe comentario para banda+evento+rúbrica.
-- Usada en policy INSERT de registro_comentarios.
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
    FROM public.registro_comentarios rc
    WHERE rc.id_foranea_banda = p_id_banda
      AND rc.id_foranea_evento = p_id_evento
      AND rc.id_foranea_rubrica = p_id_rubrica
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
  id_registro_cumplimiento_evaluacion uuid,
  id_foranea_banda uuid,
  id_foranea_evento uuid,
  id_foranea_criterio uuid,
  id_foranea_rubrica uuid,
  nombre_banda text,
  nombre_rubrica text,
  nombre_criterio text,
  puntos_obtenidos double precision,
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
      rce.id_registro_cumplimiento_evaluacion,
      rce.id_foranea_banda,
      rce.id_foranea_evento,
      rce.id_foranea_criterio,
      rce.id_foranea_rubrica,
      b.nombre_banda,
      rub.nombre_rubrica,
      ce.nombre_criterio,
      rce.puntos_obtenidos,
      rce.created_at,
      ROW_NUMBER() OVER (
        PARTITION BY rce.id_foranea_banda, rce.id_foranea_criterio, rce.id_foranea_evento
        ORDER BY rce.created_at ASC
      ) AS numero_fila
    FROM public.registro_cumplimiento_evaluaciones rce
    JOIN public.bandas b ON b.id_banda = rce.id_foranea_banda
    JOIN public.rubricas rub ON rub.id_rubrica = rce.id_foranea_rubrica
    JOIN public.criterios_evaluacion ce ON ce.id_criterio = rce.id_foranea_criterio
  )
  SELECT
    n.id_registro_cumplimiento_evaluacion,
    n.id_foranea_banda,
    n.id_foranea_evento,
    n.id_foranea_criterio,
    n.id_foranea_rubrica,
    n.nombre_banda,
    n.nombre_rubrica,
    n.nombre_criterio,
    n.puntos_obtenidos,
    n.created_at,
    n.numero_fila
  FROM numerados n
  WHERE n.numero_fila > 1
  ORDER BY n.nombre_banda, n.nombre_criterio, n.created_at;
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
  id_registro_comentario uuid,
  id_foranea_banda uuid,
  id_foranea_evento uuid,
  id_foranea_rubrica uuid,
  nombre_banda text,
  nombre_rubrica text,
  lugar_evento text,
  fecha_evento date,
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
      rc.id_registro_comentario,
      rc.id_foranea_banda,
      rc.id_foranea_evento,
      rc.id_foranea_rubrica,
      b.nombre_banda,
      rub.nombre_rubrica,
      ev.lugar_evento,
      ev.fecha_evento,
      rc.created_at,
      ROW_NUMBER() OVER (
        PARTITION BY rc.id_foranea_banda, rc.id_foranea_evento, rc.id_foranea_rubrica
        ORDER BY rc.created_at ASC
      ) AS numero_fila
    FROM public.registro_comentarios rc
    JOIN public.bandas b ON b.id_banda = rc.id_foranea_banda
    JOIN public.rubricas rub ON rub.id_rubrica = rc.id_foranea_rubrica
    JOIN public.registro_eventos ev ON ev.id_evento = rc.id_foranea_evento
  )
  SELECT
    n.id_registro_comentario,
    n.id_foranea_banda,
    n.id_foranea_evento,
    n.id_foranea_rubrica,
    n.nombre_banda,
    n.nombre_rubrica,
    n.lugar_evento,
    n.fecha_evento,
    n.created_at,
    n.numero_fila
  FROM numerados n
  WHERE n.numero_fila > 1
  ORDER BY n.nombre_banda, n.nombre_rubrica, n.created_at;
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
  id_foranea_banda uuid,
  id_foranea_evento uuid,
  id_foranea_criterio uuid,
  id_foranea_rubrica uuid,
  nombre_banda text,
  nombre_rubrica text,
  nombre_criterio text,
  lugar_evento text,
  fecha_evento date,
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
    ('cumplimiento:' || d.id_foranea_banda::text || ':' || d.id_foranea_evento::text || ':' || d.id_foranea_criterio::text) AS clave_alerta,
    d.id_foranea_banda,
    d.id_foranea_evento,
    d.id_foranea_criterio,
    d.id_foranea_rubrica,
    d.nombre_banda,
    d.nombre_rubrica,
    d.nombre_criterio,
    ev.lugar_evento,
    ev.fecha_evento,
    COUNT(*)::bigint AS cantidad_duplicados
  FROM public.listar_cumplimientos_evaluacion_duplicados() d
  JOIN public.registro_eventos ev ON ev.id_evento = d.id_foranea_evento
  GROUP BY
    d.id_foranea_banda,
    d.id_foranea_evento,
    d.id_foranea_criterio,
    d.id_foranea_rubrica,
    d.nombre_banda,
    d.nombre_rubrica,
    d.nombre_criterio,
    ev.lugar_evento,
    ev.fecha_evento

  UNION ALL

  SELECT
    'rubrica_duplicada'::text AS tipo,
    ('rubrica:' || d.id_foranea_banda::text || ':' || d.id_foranea_evento::text || ':' || d.id_foranea_rubrica::text) AS clave_alerta,
    d.id_foranea_banda,
    d.id_foranea_evento,
    NULL::uuid AS id_foranea_criterio,
    d.id_foranea_rubrica,
    d.nombre_banda,
    d.nombre_rubrica,
    NULL::text AS nombre_criterio,
    d.lugar_evento,
    d.fecha_evento,
    COUNT(*)::bigint AS cantidad_duplicados
  FROM public.listar_comentarios_rubrica_duplicados() d
  GROUP BY
    d.id_foranea_banda,
    d.id_foranea_evento,
    d.id_foranea_rubrica,
    d.nombre_banda,
    d.nombre_rubrica,
    d.lugar_evento,
    d.fecha_evento

  ORDER BY nombre_banda, tipo;
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
      rce.id_registro_cumplimiento_evaluacion,
      ROW_NUMBER() OVER (
        PARTITION BY rce.id_foranea_banda, rce.id_foranea_criterio, rce.id_foranea_evento
        ORDER BY rce.created_at ASC
      ) AS numero_fila
    FROM public.registro_cumplimiento_evaluaciones rce
  ),
  borrar AS (
    SELECT n.id_registro_cumplimiento_evaluacion
    FROM numerados n
    WHERE n.numero_fila > 1
  )
  DELETE FROM public.registro_cumplimiento_evaluaciones rce
  WHERE rce.id_registro_cumplimiento_evaluacion IN (SELECT b.id_registro_cumplimiento_evaluacion FROM borrar b);

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
      rc.id_registro_comentario,
      ROW_NUMBER() OVER (
        PARTITION BY rc.id_foranea_banda, rc.id_foranea_evento, rc.id_foranea_rubrica
        ORDER BY rc.created_at ASC
      ) AS numero_fila
    FROM public.registro_comentarios rc
  ),
  borrar AS (
    SELECT n.id_registro_comentario
    FROM numerados n
    WHERE n.numero_fila > 1
  )
  DELETE FROM public.registro_comentarios rc
  WHERE rc.id_registro_comentario IN (SELECT b.id_registro_comentario FROM borrar b);

  GET DIAGNOSTICS filas_borradas = ROW_COUNT;
  RETURN filas_borradas;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.resolver_comentarios_rubrica_duplicados() TO authenticated;

-- Permisos alertas_evaluacion (admin, admin temporal, developer, responsable de mesa)
INSERT INTO public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
SELECT gen_random_uuid(), now(), r.id_rol, t.tabla, t.accion
FROM public.roles r
CROSS JOIN (
  VALUES
    ('alertas_evaluacion', 'SELECT'),
    ('alertas_evaluacion', 'EXECUTE')
) AS t(tabla, accion)
WHERE r.nombre_rol IN ('admin', 'admin temporal', 'developer', 'responsable de mesa')
  AND NOT EXISTS (
    SELECT 1
    FROM public.permisos p
    WHERE p.id_foranea_rol = r.id_rol
      AND p.tabla = t.tabla
      AND p.accion = t.accion
  );

DROP POLICY IF EXISTS "crear" ON public.registro_cumplimiento_evaluaciones;
CREATE POLICY "crear" ON public.registro_cumplimiento_evaluaciones
  FOR INSERT
  WITH CHECK (
    public.revisar_permisos('registro_cumplimiento_evaluaciones'::text, 'insert'::text)
    AND public.evaluacion_cumplimiento_no_duplicada(
      id_foranea_banda,
      id_foranea_criterio,
      id_foranea_evento
    )
  );

DROP POLICY IF EXISTS "crear" ON public.registro_comentarios;
CREATE POLICY "crear" ON public.registro_comentarios
  FOR INSERT
  WITH CHECK (
    public.revisar_permisos('registro_comentarios'::text, 'insert'::text)
    AND public.evaluacion_comentario_no_duplicado(
      id_foranea_banda,
      id_foranea_evento,
      id_foranea_rubrica
    )
  );

WITH numerados AS (
  SELECT
    rce.id_registro_cumplimiento_evaluacion,
    ROW_NUMBER() OVER (
      PARTITION BY rce.id_foranea_banda, rce.id_foranea_criterio, rce.id_foranea_evento
      ORDER BY rce.created_at ASC
    ) AS numero_fila
  FROM public.registro_cumplimiento_evaluaciones rce
),
borrar AS (
  SELECT n.id_registro_cumplimiento_evaluacion
  FROM numerados n
  WHERE n.numero_fila > 1
)
DELETE FROM public.registro_cumplimiento_evaluaciones rce
WHERE rce.id_registro_cumplimiento_evaluacion IN (
  SELECT b.id_registro_cumplimiento_evaluacion FROM borrar b
);

WITH numerados AS (
  SELECT
    rc.id_registro_comentario,
    ROW_NUMBER() OVER (
      PARTITION BY rc.id_foranea_banda, rc.id_foranea_evento, rc.id_foranea_rubrica
      ORDER BY rc.created_at ASC
    ) AS numero_fila
  FROM public.registro_comentarios rc
),
borrar AS (
  SELECT n.id_registro_comentario
  FROM numerados n
  WHERE n.numero_fila > 1
)
DELETE FROM public.registro_comentarios rc
WHERE rc.id_registro_comentario IN (
  SELECT b.id_registro_comentario FROM borrar b
);

CREATE UNIQUE INDEX IF NOT EXISTS registro_cumplimiento_eval_banda_criterio_evento_unique
  ON public.registro_cumplimiento_evaluaciones
  (id_foranea_banda, id_foranea_criterio, id_foranea_evento);

CREATE UNIQUE INDEX IF NOT EXISTS registro_comentario_eval_banda_evento_rubrica_unique
  ON public.registro_comentarios
  (id_foranea_banda, id_foranea_evento, id_foranea_rubrica);
