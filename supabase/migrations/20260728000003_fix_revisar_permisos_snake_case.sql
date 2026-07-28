-- Align revisar_permisos with snake_case seed permissions.
-- Policies often pass camelCase table names and UPPERCASE actions (SELECT/INSERT),
-- while seed stores snake_case tables and lowercase actions (select/insert).

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
  tabla_norm text;
  accion_norm text;
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

  accion_norm := lower(target_action);
  tabla_norm := replace(lower(target_table), '_', '');

  -- Historical typo names still present in some policies
  IF tabla_norm = 'criteriosevalucion' THEN
    tabla_norm := 'criteriosevaluacion';
  ELSIF tabla_norm = 'solicitudrevicion' THEN
    tabla_norm := 'solicitudrevision';
  ELSIF tabla_norm = 'respuestasolicitudrevicion' THEN
    tabla_norm := 'respuestasolicitudrevision';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.permisos p
    WHERE p.id_foranea_rol = id_rol_user_auth
      AND lower(p.accion) = accion_norm
      AND replace(lower(
        CASE replace(lower(p.tabla), '_', '')
          WHEN 'criteriosevalucion' THEN 'criterios_evaluacion'
          WHEN 'solicitudrevicion' THEN 'solicitud_revision'
          WHEN 'respuestasolicitudrevicion' THEN 'respuesta_solicitud_revision'
          ELSE p.tabla
        END
      ), '_', '') = tabla_norm
  ) INTO tiene_permisos;

  RETURN tiene_permisos;
END;
$function$;
