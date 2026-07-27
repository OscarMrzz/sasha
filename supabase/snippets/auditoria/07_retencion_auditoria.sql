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
