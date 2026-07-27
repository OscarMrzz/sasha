-- =============================================================================
-- 02_fn_escribir_auditoria.sql
-- Writer compartido: todos los triggers y la RPC llaman aquí
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_escribir_auditoria(
  p_accion text,
  p_tabla text,
  p_id_registro uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.auditoria (
    fecha,
    id_foranea_user,
    accion,
    tabla,
    id_registro,
    metadata
  )
  VALUES (
    now(),
    auth.uid(),
    p_accion,
    p_tabla,
    p_id_registro,
    COALESCE(p_metadata, '{}'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_escribir_auditoria(text, text, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_escribir_auditoria(text, text, uuid, jsonb) TO postgres;
GRANT EXECUTE ON FUNCTION public.fn_escribir_auditoria(text, text, uuid, jsonb) TO service_role;
-- authenticated no llama directo; solo vía triggers / otras funciones DEFINER


-- =============================================================================
-- 07_retencion_auditoria.sql
-- Limpieza: elimina filas con fecha > 1 año (no es un trigger)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_limpiar_auditoria_antigua()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_borradas integer;
BEGIN
  DELETE FROM public.auditoria
  WHERE fecha < (now() - interval '1 year');

  GET DIAGNOSTICS v_borradas = ROW_COUNT;
  RETURN v_borradas;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_limpiar_auditoria_antigua() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_limpiar_auditoria_antigua() TO postgres;
GRANT EXECUTE ON FUNCTION public.fn_limpiar_auditoria_antigua() TO service_role;

-- Programación diaria (requiere extensión pg_cron habilitada en el proyecto).
-- Si falla, ejecuta a mano: SELECT public.fn_limpiar_auditoria_antigua();
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    BEGIN
      PERFORM cron.unschedule('limpiar-auditoria-anual');
    EXCEPTION
      WHEN OTHERS THEN
        NULL; -- job aún no existía
    END;
  END IF;
END;
$$;

DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'limpiar-auditoria-anual',
      '0 3 * * *',
      'SELECT public.fn_limpiar_auditoria_antigua()'
    );
  ELSE
    RAISE NOTICE 'pg_cron no está habilitado. Programa fn_limpiar_auditoria_antigua() a diario (ej. 03:00) o ejecútala a mano.';
  END IF;
END;
$do$;


-- =============================================================================
-- 06_fn_cambiar_acceso_evento_categoria.sql
-- RPC: bloquear / desbloquear dirigentes-líderes por evento+categoría + 1 audit
-- p_activar = true  → desbloquear (permisos = true)
-- p_activar = false → bloquear   (permisos = false)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_cambiar_acceso_evento_categoria(
  p_id_evento uuid,
  p_id_categoria uuid,
  p_activar boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ids uuid[];
  v_cantidad integer;
  v_accion text;
BEGIN
  IF p_id_evento IS NULL OR p_id_categoria IS NULL OR p_activar IS NULL THEN
    RAISE EXCEPTION 'id_evento, id_categoria y activar son obligatorios';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.perfiles p
    JOIN public.roles r ON r."idRol" = p."idForaneaRol"
    WHERE p."idForaneaUser" = auth.uid()
      AND r."nombreRol" IN ('admin', 'admin temporal', 'responsable de mesa')
  ) THEN
    RAISE EXCEPTION 'No autorizado para cambiar accesos de categoría';
  END IF;

  SELECT COALESCE(array_agg(DISTINCT v.id_fonranea_perfil), ARRAY[]::uuid[])
  INTO v_ids
  FROM public.vista_usuarios_por_banda_en_evento v
  WHERE v.id_foranea_evento = p_id_evento
    AND v.id_foranea_categoria = p_id_categoria
    AND v.id_fonranea_perfil IS NOT NULL;

  v_cantidad := COALESCE(cardinality(v_ids), 0);

  -- Evita N filas de auditoría en perfiles por el toggle masivo de permisos
  PERFORM set_config('auditoria.omitir_perfil_permisos', '1', true);

  IF v_cantidad > 0 THEN
    UPDATE public.perfiles
    SET permisos = p_activar
    WHERE "idPerfil" = ANY (v_ids);
  END IF;

  v_accion := CASE WHEN p_activar THEN 'acceso_desbloquear' ELSE 'acceso_bloquear' END;

  PERFORM public.fn_escribir_auditoria(
    v_accion,
    'acceso_categoria',
    NULL,
    jsonb_build_object(
      'id_evento', p_id_evento,
      'id_categoria', p_id_categoria,
      'activar', p_activar,
      'cantidad_perfiles', v_cantidad,
      'ids_perfil', to_jsonb(v_ids),
      'hora', now()
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'accion', v_accion,
    'cantidad_perfiles', v_cantidad,
    'activar', p_activar
  );
END;
$$;

REVOKE ALL ON FUNCTION public.fn_cambiar_acceso_evento_categoria(uuid, uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fn_cambiar_acceso_evento_categoria(uuid, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_cambiar_acceso_evento_categoria(uuid, uuid, boolean) TO service_role;
