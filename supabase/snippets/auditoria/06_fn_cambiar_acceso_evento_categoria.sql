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
