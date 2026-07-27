-- =============================================================================
-- 04_trigger_cancha.sql
-- Auditoría semántica de estado_cancha en confirmacion_asistencia
-- =============================================================================

CREATE OR REPLACE FUNCTION public.tg_auditoria_cancha()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old text;
  v_new text;
  v_accion text;
  v_meta jsonb;
  v_prev_finalizaciones integer;
  v_numero integer;
BEGIN
  IF TG_OP <> 'UPDATE' THEN
    RETURN NEW;
  END IF;

  IF OLD.estado_cancha IS NOT DISTINCT FROM NEW.estado_cancha THEN
    RETURN NEW;
  END IF;

  v_old := COALESCE(OLD.estado_cancha, 'pendiente');
  v_new := COALESCE(NEW.estado_cancha, 'pendiente');

  IF v_old IN ('pendiente') AND v_new = 'ya_en_cancha' THEN
    v_accion := 'cancha_entrar';
    v_meta := jsonb_build_object(
      'id_foranea_banda', NEW.id_foranea_banda,
      'id_foranea_evento', NEW.id_foranea_evento,
      'estado_anterior', v_old,
      'estado_nuevo', v_new,
      'primera_vez', true,
      'hora', now()
    );

  ELSIF v_old = 'finalizado' AND v_new = 'ya_en_cancha' THEN
    v_accion := 'cancha_reponer';
    v_meta := jsonb_build_object(
      'id_foranea_banda', NEW.id_foranea_banda,
      'id_foranea_evento', NEW.id_foranea_evento,
      'estado_anterior', v_old,
      'estado_nuevo', v_new,
      'ya_habia_finalizado', true,
      'hora', now()
    );

  ELSIF v_old = 'ya_en_cancha' AND v_new = 'finalizado' THEN
    SELECT COUNT(*)::integer
    INTO v_prev_finalizaciones
    FROM public.auditoria a
    WHERE a.accion = 'cancha_finalizar'
      AND a.tabla = 'confirmacion_asistencia'
      AND a.metadata->>'id_foranea_banda' = NEW.id_foranea_banda::text
      AND a.metadata->>'id_foranea_evento' = NEW.id_foranea_evento::text;

    v_numero := COALESCE(v_prev_finalizaciones, 0) + 1;
    v_accion := 'cancha_finalizar';
    v_meta := jsonb_build_object(
      'id_foranea_banda', NEW.id_foranea_banda,
      'id_foranea_evento', NEW.id_foranea_evento,
      'estado_anterior', v_old,
      'estado_nuevo', v_new,
      'numero_finalizacion', v_numero,
      'ya_habia_participado', (v_numero > 1),
      'hora', now()
    );

  ELSE
    -- Transición no contemplada (ej. reset a pendiente): auditar genérico
    v_accion := 'cancha_cambio';
    v_meta := jsonb_build_object(
      'id_foranea_banda', NEW.id_foranea_banda,
      'id_foranea_evento', NEW.id_foranea_evento,
      'estado_anterior', v_old,
      'estado_nuevo', v_new,
      'hora', now()
    );
  END IF;

  PERFORM public.fn_escribir_auditoria(
    v_accion,
    'confirmacion_asistencia',
    NEW.id_confirmacion_asistencia,
    v_meta
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_auditoria_cancha ON public.confirmacion_asistencia;
CREATE TRIGGER tg_auditoria_cancha
  AFTER UPDATE ON public.confirmacion_asistencia
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_cancha();
