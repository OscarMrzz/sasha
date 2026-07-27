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
