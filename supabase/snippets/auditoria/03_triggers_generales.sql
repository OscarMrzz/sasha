-- =============================================================================
-- 03_triggers_generales.sql
-- Un trigger (y su función) por tabla. Excluye: premio_escuadra, auditoria,
-- registroCumplimientoEvaluaciones (ver 05).
-- confirmacion_asistencia: ignora cambios solo de estado_cancha (ver 04).
-- perfiles: omite updates solo de permisos si flag de sesión de la RPC.
-- =============================================================================

-- ---------- bandas ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_bandas()
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
    v_id := NEW."idBanda";
    v_meta := jsonb_build_object(
      'nombreBanda', NEW."nombreBanda",
      'AliasBanda', NEW."AliasBanda",
      'idForaneaCategoria', NEW."idForaneaCategoria",
      'idForaneaRegion', NEW."idForaneaRegion",
      'idForaneaFederacion', NEW."idForaneaFederacion"
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idBanda";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object(
        'nombreBanda', OLD."nombreBanda",
        'AliasBanda', OLD."AliasBanda",
        'idForaneaCategoria', OLD."idForaneaCategoria",
        'idForaneaRegion', OLD."idForaneaRegion",
        'idForaneaFederacion', OLD."idForaneaFederacion",
        'ciudadBanda', OLD."ciudadBanda"
      ),
      'despues', jsonb_build_object(
        'nombreBanda', NEW."nombreBanda",
        'AliasBanda', NEW."AliasBanda",
        'idForaneaCategoria', NEW."idForaneaCategoria",
        'idForaneaRegion', NEW."idForaneaRegion",
        'idForaneaFederacion', NEW."idForaneaFederacion",
        'ciudadBanda', NEW."ciudadBanda"
      )
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idBanda";
    v_meta := jsonb_build_object(
      'nombreBanda', OLD."nombreBanda",
      'AliasBanda', OLD."AliasBanda",
      'idForaneaCategoria', OLD."idForaneaCategoria"
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'bandas', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_bandas ON public.bandas;
CREATE TRIGGER tg_auditoria_bandas
  AFTER INSERT OR UPDATE OR DELETE ON public.bandas
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_bandas();

-- ---------- categorias ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_categorias()
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
    v_id := NEW."idCategoria";
    v_meta := jsonb_build_object(
      'nombreCategoria', NEW."nombreCategoria",
      'detallesCategoria', NEW."detallesCategoria",
      'idForaneaFederacion', NEW."idForaneaFederacion"
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idCategoria";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('nombreCategoria', OLD."nombreCategoria", 'detallesCategoria', OLD."detallesCategoria"),
      'despues', jsonb_build_object('nombreCategoria', NEW."nombreCategoria", 'detallesCategoria', NEW."detallesCategoria")
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idCategoria";
    v_meta := jsonb_build_object('nombreCategoria', OLD."nombreCategoria");
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'categorias', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_categorias ON public.categorias;
CREATE TRIGGER tg_auditoria_categorias
  AFTER INSERT OR UPDATE OR DELETE ON public.categorias
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_categorias();

-- ---------- criteriosEvalucion ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_criterios_evalucion()
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
    v_id := NEW."idCriterio";
    v_meta := jsonb_build_object(
      'nombreCriterio', NEW."nombreCriterio",
      'puntosCriterio', NEW."puntosCriterio",
      'idForaneaRubrica', NEW."idForaneaRubrica"
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idCriterio";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('nombreCriterio', OLD."nombreCriterio", 'puntosCriterio', OLD."puntosCriterio", 'idForaneaRubrica', OLD."idForaneaRubrica"),
      'despues', jsonb_build_object('nombreCriterio', NEW."nombreCriterio", 'puntosCriterio', NEW."puntosCriterio", 'idForaneaRubrica', NEW."idForaneaRubrica")
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idCriterio";
    v_meta := jsonb_build_object('nombreCriterio', OLD."nombreCriterio", 'idForaneaRubrica', OLD."idForaneaRubrica");
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'criteriosEvalucion', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_criterios_evalucion ON public."criteriosEvalucion";
CREATE TRIGGER tg_auditoria_criterios_evalucion
  AFTER INSERT OR UPDATE OR DELETE ON public."criteriosEvalucion"
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_criterios_evalucion();

-- ---------- cumplimientos ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_cumplimientos()
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
    v_id := NEW."idCumplimiento";
    v_meta := jsonb_build_object(
      'detalleCumplimiento', NEW."detalleCumplimiento",
      'puntosCumplimiento', NEW."puntosCumplimiento",
      'idForaneaCriterio', NEW."idForaneaCriterio"
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idCumplimiento";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('detalleCumplimiento', OLD."detalleCumplimiento", 'puntosCumplimiento', OLD."puntosCumplimiento"),
      'despues', jsonb_build_object('detalleCumplimiento', NEW."detalleCumplimiento", 'puntosCumplimiento', NEW."puntosCumplimiento")
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idCumplimiento";
    v_meta := jsonb_build_object('detalleCumplimiento', OLD."detalleCumplimiento", 'idForaneaCriterio', OLD."idForaneaCriterio");
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'cumplimientos', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_cumplimientos ON public.cumplimientos;
CREATE TRIGGER tg_auditoria_cumplimientos
  AFTER INSERT OR UPDATE OR DELETE ON public.cumplimientos
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_cumplimientos();

-- ---------- federaciones ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_federaciones()
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
    v_id := NEW."idFederacion";
    v_meta := jsonb_build_object('nombreFederacion', NEW."nombreFederacion");
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idFederacion";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('nombreFederacion', OLD."nombreFederacion"),
      'despues', jsonb_build_object('nombreFederacion', NEW."nombreFederacion")
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idFederacion";
    v_meta := jsonb_build_object('nombreFederacion', OLD."nombreFederacion");
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'federaciones', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_federaciones ON public.federaciones;
CREATE TRIGGER tg_auditoria_federaciones
  AFTER INSERT OR UPDATE OR DELETE ON public.federaciones
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_federaciones();

-- ---------- penalizaciones ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_penalizaciones()
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
    v_id := NEW."idPenalizacion";
    v_meta := jsonb_build_object(
      'nombrePenalizacion', NEW."nombrePenalizacion",
      'puntosPenalizacion', NEW."puntosPenalizacion",
      'idForaneaCategoria', NEW."idForaneaCategoria",
      'idForaneaFederacion', NEW."idForaneaFederacion"
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idPenalizacion";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('nombrePenalizacion', OLD."nombrePenalizacion", 'puntosPenalizacion', OLD."puntosPenalizacion"),
      'despues', jsonb_build_object('nombrePenalizacion', NEW."nombrePenalizacion", 'puntosPenalizacion', NEW."puntosPenalizacion")
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idPenalizacion";
    v_meta := jsonb_build_object('nombrePenalizacion', OLD."nombrePenalizacion");
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'penalizaciones', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_penalizaciones ON public.penalizaciones;
CREATE TRIGGER tg_auditoria_penalizaciones
  AFTER INSERT OR UPDATE OR DELETE ON public.penalizaciones
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_penalizaciones();

-- ---------- perfiles ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_perfiles()
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
  IF TG_OP = 'UPDATE'
     AND current_setting('auditoria.omitir_perfil_permisos', true) = '1'
     AND (to_jsonb(NEW) - 'permisos') IS NOT DISTINCT FROM (to_jsonb(OLD) - 'permisos')
  THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_accion := 'insert';
    v_id := NEW."idPerfil";
    v_meta := jsonb_build_object(
      'nombre', NEW.nombre,
      'primerApellido', NEW."primerApellido",
      'codigo', NEW.codigo,
      'idForaneaRol', NEW."idForaneaRol",
      'idForaneaBanda', NEW."idForaneaBanda",
      'idForaneaUser', NEW."idForaneaUser",
      'permisos', NEW.permisos
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idPerfil";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object(
        'nombre', OLD.nombre,
        'primerApellido', OLD."primerApellido",
        'idForaneaRol', OLD."idForaneaRol",
        'idForaneaBanda', OLD."idForaneaBanda",
        'permisos', OLD.permisos
      ),
      'despues', jsonb_build_object(
        'nombre', NEW.nombre,
        'primerApellido', NEW."primerApellido",
        'idForaneaRol', NEW."idForaneaRol",
        'idForaneaBanda', NEW."idForaneaBanda",
        'permisos', NEW.permisos
      )
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idPerfil";
    v_meta := jsonb_build_object(
      'nombre', OLD.nombre,
      'primerApellido', OLD."primerApellido",
      'codigo', OLD.codigo,
      'idForaneaUser', OLD."idForaneaUser"
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'perfiles', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_perfiles ON public.perfiles;
CREATE TRIGGER tg_auditoria_perfiles
  AFTER INSERT OR UPDATE OR DELETE ON public.perfiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_perfiles();

-- ---------- permisos (matriz ACL) ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_permisos()
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
    v_id := NEW."idPermiso";
    v_meta := jsonb_build_object(
      'idForaneaRol', NEW."idForaneaRol",
      'tabla', NEW.tabla,
      'accion', NEW.accion
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idPermiso";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('idForaneaRol', OLD."idForaneaRol", 'tabla', OLD.tabla, 'accion', OLD.accion),
      'despues', jsonb_build_object('idForaneaRol', NEW."idForaneaRol", 'tabla', NEW.tabla, 'accion', NEW.accion)
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idPermiso";
    v_meta := jsonb_build_object('idForaneaRol', OLD."idForaneaRol", 'tabla', OLD.tabla, 'accion', OLD.accion);
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'permisos', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_permisos ON public.permisos;
CREATE TRIGGER tg_auditoria_permisos
  AFTER INSERT OR UPDATE OR DELETE ON public.permisos
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_permisos();

-- ---------- regiones ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_regiones()
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
    v_id := NEW."idRegion";
    v_meta := jsonb_build_object('nombreRegion', NEW."nombreRegion", 'idForaneaFederacion', NEW."idForaneaFederacion");
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idRegion";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('nombreRegion', OLD."nombreRegion"),
      'despues', jsonb_build_object('nombreRegion', NEW."nombreRegion")
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idRegion";
    v_meta := jsonb_build_object('nombreRegion', OLD."nombreRegion");
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'regiones', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_regiones ON public.regiones;
CREATE TRIGGER tg_auditoria_regiones
  AFTER INSERT OR UPDATE OR DELETE ON public.regiones
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_regiones();

-- ---------- registroComentarios ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_registro_comentarios()
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
    v_id := NEW."idRegistroComentario";
    v_meta := jsonb_build_object(
      'idForaneaEvento', NEW."idForaneaEvento",
      'idForaneaBanda', NEW."idForaneaBanda",
      'idForaneaPerfil', NEW."idForaneaPerfil",
      'idForaneaRubrica', NEW."idForaneaRubrica",
      'comentario', left(COALESCE(NEW.comentario, ''), 500)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idRegistroComentario";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('comentario', left(COALESCE(OLD.comentario, ''), 500), 'idForaneaRubrica', OLD."idForaneaRubrica"),
      'despues', jsonb_build_object('comentario', left(COALESCE(NEW.comentario, ''), 500), 'idForaneaRubrica', NEW."idForaneaRubrica"),
      'idForaneaEvento', NEW."idForaneaEvento",
      'idForaneaBanda', NEW."idForaneaBanda",
      'idForaneaPerfil', NEW."idForaneaPerfil"
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idRegistroComentario";
    v_meta := jsonb_build_object(
      'idForaneaEvento', OLD."idForaneaEvento",
      'idForaneaBanda', OLD."idForaneaBanda",
      'idForaneaPerfil', OLD."idForaneaPerfil",
      'idForaneaRubrica', OLD."idForaneaRubrica"
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'registroComentarios', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_registro_comentarios ON public."registroComentarios";
CREATE TRIGGER tg_auditoria_registro_comentarios
  AFTER INSERT OR UPDATE OR DELETE ON public."registroComentarios"
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_registro_comentarios();

-- ---------- registroEquipoEvaluador ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_registro_equipo_evaluador()
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
    v_id := NEW."idRegistroEvaluador";
    v_meta := jsonb_build_object(
      'idForaneaEvento', NEW."idForaneaEvento",
      'idForaneaPerfil', NEW."idForaneaPerfil",
      'id_foranea_rubrica', NEW.id_foranea_rubrica
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idRegistroEvaluador";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('idForaneaEvento', OLD."idForaneaEvento", 'idForaneaPerfil', OLD."idForaneaPerfil", 'id_foranea_rubrica', OLD.id_foranea_rubrica),
      'despues', jsonb_build_object('idForaneaEvento', NEW."idForaneaEvento", 'idForaneaPerfil', NEW."idForaneaPerfil", 'id_foranea_rubrica', NEW.id_foranea_rubrica)
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idRegistroEvaluador";
    v_meta := jsonb_build_object(
      'idForaneaEvento', OLD."idForaneaEvento",
      'idForaneaPerfil', OLD."idForaneaPerfil",
      'id_foranea_rubrica', OLD.id_foranea_rubrica
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'registroEquipoEvaluador', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_registro_equipo_evaluador ON public."registroEquipoEvaluador";
CREATE TRIGGER tg_auditoria_registro_equipo_evaluador
  AFTER INSERT OR UPDATE OR DELETE ON public."registroEquipoEvaluador"
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_registro_equipo_evaluador();

-- ---------- registroEventos ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_registro_eventos()
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
    v_id := NEW."idEvento";
    v_meta := jsonb_build_object(
      'LugarEvento', NEW."LugarEvento",
      'fechaEvento', NEW."fechaEvento",
      'idForaneaRegion', NEW."idForaneaRegion",
      'idForaneaFederacion', NEW."idForaneaFederacion",
      'estado_evento', NEW.estado_evento,
      'tipo_evento', NEW.tipo_evento
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idEvento";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object(
        'LugarEvento', OLD."LugarEvento",
        'fechaEvento', OLD."fechaEvento",
        'estado_evento', OLD.estado_evento,
        'tipo_evento', OLD.tipo_evento,
        'idForaneaRegion', OLD."idForaneaRegion"
      ),
      'despues', jsonb_build_object(
        'LugarEvento', NEW."LugarEvento",
        'fechaEvento', NEW."fechaEvento",
        'estado_evento', NEW.estado_evento,
        'tipo_evento', NEW.tipo_evento,
        'idForaneaRegion', NEW."idForaneaRegion"
      )
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idEvento";
    v_meta := jsonb_build_object(
      'LugarEvento', OLD."LugarEvento",
      'fechaEvento', OLD."fechaEvento",
      'tipo_evento', OLD.tipo_evento
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'registroEventos', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_registro_eventos ON public."registroEventos";
CREATE TRIGGER tg_auditoria_registro_eventos
  AFTER INSERT OR UPDATE OR DELETE ON public."registroEventos"
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_registro_eventos();

-- ---------- registroPenalizaciones ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_registro_penalizaciones()
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
    v_id := NEW."idRegistroPenalizacion";
    v_meta := jsonb_build_object(
      'idForaneaEvento', NEW."idForaneaEvento",
      'idForaneaBanda', NEW."idForaneaBanda",
      'idForaneaPenalizacion', NEW."idForaneaPenalizacion",
      'idForaneaUser', NEW."idForaneaUser",
      'puntosPenalizacion', NEW."puntosPenalizacion"
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idRegistroPenalizacion";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('puntosPenalizacion', OLD."puntosPenalizacion", 'idForaneaPenalizacion', OLD."idForaneaPenalizacion"),
      'despues', jsonb_build_object('puntosPenalizacion', NEW."puntosPenalizacion", 'idForaneaPenalizacion', NEW."idForaneaPenalizacion"),
      'idForaneaEvento', NEW."idForaneaEvento",
      'idForaneaBanda', NEW."idForaneaBanda"
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idRegistroPenalizacion";
    v_meta := jsonb_build_object(
      'idForaneaEvento', OLD."idForaneaEvento",
      'idForaneaBanda', OLD."idForaneaBanda",
      'idForaneaPenalizacion', OLD."idForaneaPenalizacion"
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'registroPenalizaciones', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_registro_penalizaciones ON public."registroPenalizaciones";
CREATE TRIGGER tg_auditoria_registro_penalizaciones
  AFTER INSERT OR UPDATE OR DELETE ON public."registroPenalizaciones"
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_registro_penalizaciones();

-- ---------- respuestaSolicitudRevicion ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_respuesta_solicitud_revicion()
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
    v_id := NEW."idRespuesta";
    v_meta := jsonb_build_object(
      'idForaneaSolicitudRevicion', NEW."idForaneaSolicitudRevicion",
      'idForaneaRevisor', NEW."idForaneaRevisor",
      'aprobacion', NEW.aprobacion,
      'detallesRespuesta', left(COALESCE(NEW."detallesRespuesta", ''), 500)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idRespuesta";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('aprobacion', OLD.aprobacion),
      'despues', jsonb_build_object('aprobacion', NEW.aprobacion),
      'idForaneaSolicitudRevicion', NEW."idForaneaSolicitudRevicion"
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idRespuesta";
    v_meta := jsonb_build_object('idForaneaSolicitudRevicion', OLD."idForaneaSolicitudRevicion", 'aprobacion', OLD.aprobacion);
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'respuestaSolicitudRevicion', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_respuesta_solicitud_revicion ON public."respuestaSolicitudRevicion";
CREATE TRIGGER tg_auditoria_respuesta_solicitud_revicion
  AFTER INSERT OR UPDATE OR DELETE ON public."respuestaSolicitudRevicion"
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_respuesta_solicitud_revicion();

-- ---------- roles ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_roles()
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
    v_id := NEW."idRol";
    v_meta := jsonb_build_object('nombreRol', NEW."nombreRol", 'estadoRol', NEW."estadoRol", 'idForaneaFederacion', NEW."idForaneaFederacion");
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idRol";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('nombreRol', OLD."nombreRol", 'estadoRol', OLD."estadoRol"),
      'despues', jsonb_build_object('nombreRol', NEW."nombreRol", 'estadoRol', NEW."estadoRol")
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idRol";
    v_meta := jsonb_build_object('nombreRol', OLD."nombreRol");
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'roles', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_roles ON public.roles;
CREATE TRIGGER tg_auditoria_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_roles();

-- ---------- rolesEquipoEvaluador ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_roles_equipo_evaluador()
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
    v_id := NEW."idRol";
    v_meta := jsonb_build_object('nombreRol', NEW."nombreRol", 'idForaneaFederacion', NEW."idForaneaFederacion");
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idRol";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('nombreRol', OLD."nombreRol"),
      'despues', jsonb_build_object('nombreRol', NEW."nombreRol")
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idRol";
    v_meta := jsonb_build_object('nombreRol', OLD."nombreRol");
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'rolesEquipoEvaluador', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_roles_equipo_evaluador ON public."rolesEquipoEvaluador";
CREATE TRIGGER tg_auditoria_roles_equipo_evaluador
  AFTER INSERT OR UPDATE OR DELETE ON public."rolesEquipoEvaluador"
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_roles_equipo_evaluador();

-- ---------- rubricas ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_rubricas()
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
    v_id := NEW."idRubrica";
    v_meta := jsonb_build_object(
      'nombreRubrica', NEW."nombreRubrica",
      'puntosRubrica', NEW."puntosRubrica",
      'idForaneaCategoria', NEW."idForaneaCategoria",
      'versionRubrica', NEW."versionRubrica"
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idRubrica";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('nombreRubrica', OLD."nombreRubrica", 'puntosRubrica', OLD."puntosRubrica", 'versionRubrica', OLD."versionRubrica"),
      'despues', jsonb_build_object('nombreRubrica', NEW."nombreRubrica", 'puntosRubrica', NEW."puntosRubrica", 'versionRubrica', NEW."versionRubrica")
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idRubrica";
    v_meta := jsonb_build_object('nombreRubrica', OLD."nombreRubrica");
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'rubricas', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_rubricas ON public.rubricas;
CREATE TRIGGER tg_auditoria_rubricas
  AFTER INSERT OR UPDATE OR DELETE ON public.rubricas
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_rubricas();

-- ---------- solicitudRevicion ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_solicitud_revicion()
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
    v_id := NEW."idSolicitud";
    v_meta := jsonb_build_object(
      'idForaneaRegistroCumplimiento', NEW."idForaneaRegistroCumplimiento",
      'idForaneaSolicitanteRevicion', NEW."idForaneaSolicitanteRevicion",
      'estado', NEW.estado,
      'detallesSolicitud', left(COALESCE(NEW."detallesSolicitud", ''), 500)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW."idSolicitud";
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('estado', OLD.estado),
      'despues', jsonb_build_object('estado', NEW.estado),
      'idForaneaRegistroCumplimiento', NEW."idForaneaRegistroCumplimiento"
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD."idSolicitud";
    v_meta := jsonb_build_object('estado', OLD.estado, 'idForaneaRegistroCumplimiento', OLD."idForaneaRegistroCumplimiento");
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'solicitudRevicion', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_solicitud_revicion ON public."solicitudRevicion";
CREATE TRIGGER tg_auditoria_solicitud_revicion
  AFTER INSERT OR UPDATE OR DELETE ON public."solicitudRevicion"
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_solicitud_revicion();

-- ---------- confirmacion_asistencia (sin cambios solo de estado_cancha) ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_confirmacion_asistencia()
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
  IF TG_OP = 'UPDATE'
     AND (to_jsonb(NEW) - 'estado_cancha') IS NOT DISTINCT FROM (to_jsonb(OLD) - 'estado_cancha')
  THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    v_accion := 'insert';
    v_id := NEW.id_confirmacion_asistencia;
    v_meta := jsonb_build_object(
      'id_foranea_banda', NEW.id_foranea_banda,
      'id_foranea_evento', NEW.id_foranea_evento,
      'estado_asistencia', NEW.estado_asistencia,
      'estado_cancha', NEW.estado_cancha
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW.id_confirmacion_asistencia;
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object(
        'estado_asistencia', OLD.estado_asistencia,
        'estado_cancha', OLD.estado_cancha,
        'id_foranea_banda', OLD.id_foranea_banda,
        'id_foranea_evento', OLD.id_foranea_evento
      ),
      'despues', jsonb_build_object(
        'estado_asistencia', NEW.estado_asistencia,
        'estado_cancha', NEW.estado_cancha,
        'id_foranea_banda', NEW.id_foranea_banda,
        'id_foranea_evento', NEW.id_foranea_evento
      )
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD.id_confirmacion_asistencia;
    v_meta := jsonb_build_object(
      'id_foranea_banda', OLD.id_foranea_banda,
      'id_foranea_evento', OLD.id_foranea_evento,
      'estado_asistencia', OLD.estado_asistencia,
      'estado_cancha', OLD.estado_cancha
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'confirmacion_asistencia', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_confirmacion_asistencia ON public.confirmacion_asistencia;
CREATE TRIGGER tg_auditoria_confirmacion_asistencia
  AFTER INSERT OR UPDATE OR DELETE ON public.confirmacion_asistencia
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_confirmacion_asistencia();

-- ---------- escuadras ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_escuadras()
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
    v_id := NEW.id_escuadra;
    v_meta := jsonb_build_object('nombre_escuadra', NEW.nombre_escuadra);
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW.id_escuadra;
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('nombre_escuadra', OLD.nombre_escuadra),
      'despues', jsonb_build_object('nombre_escuadra', NEW.nombre_escuadra)
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD.id_escuadra;
    v_meta := jsonb_build_object('nombre_escuadra', OLD.nombre_escuadra);
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'escuadras', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_escuadras ON public.escuadras;
CREATE TRIGGER tg_auditoria_escuadras
  AFTER INSERT OR UPDATE OR DELETE ON public.escuadras
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_escuadras();

-- ---------- premios_escuadra ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_premios_escuadra()
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
    v_id := NEW.id_premio_escuadra;
    v_meta := jsonb_build_object(
      'id_foranea_banda', NEW.id_foranea_banda,
      'id_foranea_escuadra', NEW.id_foranea_escuadra,
      'id_foranea_evento', NEW.id_foranea_evento
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW.id_premio_escuadra;
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('id_foranea_banda', OLD.id_foranea_banda, 'id_foranea_escuadra', OLD.id_foranea_escuadra, 'id_foranea_evento', OLD.id_foranea_evento),
      'despues', jsonb_build_object('id_foranea_banda', NEW.id_foranea_banda, 'id_foranea_escuadra', NEW.id_foranea_escuadra, 'id_foranea_evento', NEW.id_foranea_evento)
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD.id_premio_escuadra;
    v_meta := jsonb_build_object(
      'id_foranea_banda', OLD.id_foranea_banda,
      'id_foranea_escuadra', OLD.id_foranea_escuadra,
      'id_foranea_evento', OLD.id_foranea_evento
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'premios_escuadra', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_premios_escuadra ON public.premios_escuadra;
CREATE TRIGGER tg_auditoria_premios_escuadra
  AFTER INSERT OR UPDATE OR DELETE ON public.premios_escuadra
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_premios_escuadra();

-- ---------- copas ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_copas()
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
    v_id := NEW.id_copas;
    v_meta := jsonb_build_object(
      'id_foranea_evento', NEW.id_foranea_evento,
      'id_foranea_banda', NEW.id_foranea_banda,
      'lugar', NEW.lugar,
      'tipo', NEW.tipo
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW.id_copas;
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('lugar', OLD.lugar, 'tipo', OLD.tipo, 'id_foranea_banda', OLD.id_foranea_banda),
      'despues', jsonb_build_object('lugar', NEW.lugar, 'tipo', NEW.tipo, 'id_foranea_banda', NEW.id_foranea_banda),
      'id_foranea_evento', NEW.id_foranea_evento
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD.id_copas;
    v_meta := jsonb_build_object(
      'id_foranea_evento', OLD.id_foranea_evento,
      'id_foranea_banda', OLD.id_foranea_banda,
      'lugar', OLD.lugar,
      'tipo', OLD.tipo
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'copas', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_copas ON public.copas;
CREATE TRIGGER tg_auditoria_copas
  AFTER INSERT OR UPDATE OR DELETE ON public.copas
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_copas();

-- ---------- registro_sanciones ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_registro_sanciones()
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
    v_id := NEW.id_registro_sanciones;
    v_meta := jsonb_build_object(
      'id_foranea_sancion', NEW.id_foranea_sancion,
      'id_foranea_banda', NEW.id_foranea_banda,
      'id_foranea_perfil', NEW.id_foranea_perfil,
      'fecha', NEW.fecha,
      'justificacion', left(COALESCE(NEW.justificacion, ''), 500)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW.id_registro_sanciones;
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('justificacion', left(COALESCE(OLD.justificacion, ''), 500), 'fecha', OLD.fecha),
      'despues', jsonb_build_object('justificacion', left(COALESCE(NEW.justificacion, ''), 500), 'fecha', NEW.fecha),
      'id_foranea_banda', NEW.id_foranea_banda,
      'id_foranea_sancion', NEW.id_foranea_sancion
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD.id_registro_sanciones;
    v_meta := jsonb_build_object(
      'id_foranea_sancion', OLD.id_foranea_sancion,
      'id_foranea_banda', OLD.id_foranea_banda
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'registro_sanciones', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_registro_sanciones ON public.registro_sanciones;
CREATE TRIGGER tg_auditoria_registro_sanciones
  AFTER INSERT OR UPDATE OR DELETE ON public.registro_sanciones
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_registro_sanciones();

-- ---------- sanciones ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_sanciones()
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
    v_id := NEW.id_sancion;
    v_meta := jsonb_build_object(
      'detalles_sancion', NEW.detalles_sancion,
      'puntos_sancion', NEW.puntos_sancion,
      'version', NEW.version
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW.id_sancion;
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('detalles_sancion', OLD.detalles_sancion, 'puntos_sancion', OLD.puntos_sancion, 'version', OLD.version),
      'despues', jsonb_build_object('detalles_sancion', NEW.detalles_sancion, 'puntos_sancion', NEW.puntos_sancion, 'version', NEW.version)
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD.id_sancion;
    v_meta := jsonb_build_object('detalles_sancion', OLD.detalles_sancion, 'puntos_sancion', OLD.puntos_sancion);
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'sanciones', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_sanciones ON public.sanciones;
CREATE TRIGGER tg_auditoria_sanciones
  AFTER INSERT OR UPDATE OR DELETE ON public.sanciones
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_sanciones();

-- ---------- solicitar_sancion ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_solicitar_sancion()
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
    v_id := NEW.id_solicitud_sancion;
    v_meta := jsonb_build_object(
      'id_fonranea_sancion', NEW.id_fonranea_sancion,
      'id_foranea_banda', NEW.id_foranea_banda,
      'id_foranea_solicitante', NEW.id_foranea_solicitante,
      'estado', NEW.estado,
      'justificacion', left(COALESCE(NEW.justificacion, ''), 500)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW.id_solicitud_sancion;
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('estado', OLD.estado, 'justificacion', left(COALESCE(OLD.justificacion, ''), 500)),
      'despues', jsonb_build_object('estado', NEW.estado, 'justificacion', left(COALESCE(NEW.justificacion, ''), 500)),
      'id_foranea_banda', NEW.id_foranea_banda
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD.id_solicitud_sancion;
    v_meta := jsonb_build_object(
      'id_fonranea_sancion', OLD.id_fonranea_sancion,
      'id_foranea_banda', OLD.id_foranea_banda,
      'estado', OLD.estado
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'solicitar_sancion', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_solicitar_sancion ON public.solicitar_sancion;
CREATE TRIGGER tg_auditoria_solicitar_sancion
  AFTER INSERT OR UPDATE OR DELETE ON public.solicitar_sancion
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_solicitar_sancion();

-- ---------- solicitud_copas ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_solicitud_copas()
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
    v_id := NEW.id_solicitud_copa;
    v_meta := jsonb_build_object(
      'id_foranea_evento', NEW.id_foranea_evento,
      'id_foranea_banda', NEW.id_foranea_banda,
      'id_foranea_solicitante', NEW.id_foranea_solicitante,
      'tipo_solicitud_copa', NEW.tipo_solicitud_copa,
      'lugar_solicitud_copas', NEW.lugar_solicitud_copas,
      'estado', NEW.estado
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW.id_solicitud_copa;
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object('estado', OLD.estado, 'lugar_solicitud_copas', OLD.lugar_solicitud_copas, 'tipo_solicitud_copa', OLD.tipo_solicitud_copa),
      'despues', jsonb_build_object('estado', NEW.estado, 'lugar_solicitud_copas', NEW.lugar_solicitud_copas, 'tipo_solicitud_copa', NEW.tipo_solicitud_copa),
      'id_foranea_evento', NEW.id_foranea_evento,
      'id_foranea_banda', NEW.id_foranea_banda
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD.id_solicitud_copa;
    v_meta := jsonb_build_object(
      'id_foranea_evento', OLD.id_foranea_evento,
      'id_foranea_banda', OLD.id_foranea_banda,
      'estado', OLD.estado
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'solicitud_copas', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_solicitud_copas ON public.solicitud_copas;
CREATE TRIGGER tg_auditoria_solicitud_copas
  AFTER INSERT OR UPDATE OR DELETE ON public.solicitud_copas
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_solicitud_copas();

-- ---------- checkout ----------
CREATE OR REPLACE FUNCTION public.tg_auditoria_checkout()
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
    v_id := NEW.id_checkout;
    v_meta := jsonb_build_object(
      'id_foranea_banda', NEW.id_foranea_banda,
      'id_foranea_evento', NEW.id_foranea_evento,
      'confirmacion_horallegada', NEW.confirmacion_horallegada,
      'confirmacion_hora_ingreso', NEW.confirmacion_hora_ingreso,
      'cantidad_integrantes', NEW.cantidad_integrantes,
      'id_foranea_confirmador', NEW.id_foranea_confirmador
    );
  ELSIF TG_OP = 'UPDATE' THEN
    v_accion := 'update';
    v_id := NEW.id_checkout;
    v_meta := jsonb_build_object(
      'antes', jsonb_build_object(
        'confirmacion_horallegada', OLD.confirmacion_horallegada,
        'confirmacion_hora_ingreso', OLD.confirmacion_hora_ingreso,
        'hora_llegada_banda', OLD.hora_llegada_banda,
        'hora_ingreso', OLD.hora_ingreso,
        'cantidad_integrantes', OLD.cantidad_integrantes
      ),
      'despues', jsonb_build_object(
        'confirmacion_horallegada', NEW.confirmacion_horallegada,
        'confirmacion_hora_ingreso', NEW.confirmacion_hora_ingreso,
        'hora_llegada_banda', NEW.hora_llegada_banda,
        'hora_ingreso', NEW.hora_ingreso,
        'cantidad_integrantes', NEW.cantidad_integrantes
      ),
      'id_foranea_banda', NEW.id_foranea_banda,
      'id_foranea_evento', NEW.id_foranea_evento
    );
  ELSE
    v_accion := 'delete';
    v_id := OLD.id_checkout;
    v_meta := jsonb_build_object(
      'id_foranea_banda', OLD.id_foranea_banda,
      'id_foranea_evento', OLD.id_foranea_evento
    );
  END IF;
  PERFORM public.fn_escribir_auditoria(v_accion, 'checkout', v_id, v_meta);
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tg_auditoria_checkout ON public.checkout;
CREATE TRIGGER tg_auditoria_checkout
  AFTER INSERT OR UPDATE OR DELETE ON public.checkout
  FOR EACH ROW EXECUTE FUNCTION public.tg_auditoria_checkout();
