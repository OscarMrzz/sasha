-- =============================================================================
-- 05_trigger_evaluaciones.sql
-- registroCumplimientoEvaluaciones: metadata curada (evaluador, banda, rúbrica, puntos)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.tg_auditoria_evaluaciones()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_accion text;
  v_id uuid;
  v_meta jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_accion := 'insert';
    v_id := NEW."idRegistroCumplimientoEvaluacion";
    v_meta := jsonb_build_object(
      'id_foranea_perfil', NEW."idForaneaPerfil",
      'id_foranea_banda', NEW."idForaneaBanda",
      'id_foranea_rubrica', NEW."idForaneaRubrica",
      'id_foranea_criterio', NEW."idForaneaCriterio",
      'id_foranea_cumplimiento', NEW."idForaneaCumplimiento",
      'puntos_obtenidos', NEW."puntosObtenidos",
      'id_foranea_evento', NEW."idForaneaEvento",
      'id_foranea_categoria', NEW."idForaneaCategoria"
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idRegistroCumplimientoEvaluacion";
    v_meta := jsonb_build_object(
      'id_foranea_perfil', NEW."idForaneaPerfil",
      'id_foranea_banda', NEW."idForaneaBanda",
      'id_foranea_rubrica', NEW."idForaneaRubrica",
      'id_foranea_criterio', NEW."idForaneaCriterio",
      'id_foranea_cumplimiento', NEW."idForaneaCumplimiento",
      'id_foranea_evento', NEW."idForaneaEvento",
      'antes', jsonb_build_object(
        'puntos_obtenidos', OLD."puntosObtenidos",
        'id_foranea_cumplimiento', OLD."idForaneaCumplimiento"
      ),
      'despues', jsonb_build_object(
        'puntos_obtenidos', NEW."puntosObtenidos",
        'id_foranea_cumplimiento', NEW."idForaneaCumplimiento"
      )
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idRegistroCumplimientoEvaluacion";
    v_meta := jsonb_build_object(
      'id_foranea_perfil', OLD."idForaneaPerfil",
      'id_foranea_banda', OLD."idForaneaBanda",
      'id_foranea_rubrica', OLD."idForaneaRubrica",
      'id_foranea_criterio', OLD."idForaneaCriterio",
      'id_foranea_cumplimiento', OLD."idForaneaCumplimiento",
      'puntos_obtenidos', OLD."puntosObtenidos",
      'id_foranea_evento', OLD."idForaneaEvento"
    );
  END IF;

  PERFORM public.fn_escribir_auditoria(
    v_accion,
    'registroCumplimientoEvaluaciones',
    v_id,
    v_meta
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_auditoria_evaluaciones ON public."registroCumplimientoEvaluaciones";
CREATE TRIGGER tg_auditoria_evaluaciones
  AFTER INSERT OR UPDATE OR DELETE ON public."registroCumplimientoEvaluaciones"
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_evaluaciones();
