-- Repara BD que ya aplicó 20260501031419 con RETURN tienen_permisos (typo).
-- Idempotente: mismo cuerpo que la migración corregida.
set check_function_bodies = off;

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
  SELECT "idForaneaRol" INTO id_rol_user_auth
  FROM perfiles
  WHERE perfiles."idForaneaUser" = auth.uid()
  LIMIT 1;

  IF id_rol_user_auth IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM permisos
    WHERE permisos."idForaneaRol" = id_rol_user_auth
      AND permisos.tabla = target_table
      AND permisos.accion = target_action
  ) INTO tiene_permisos;

  RETURN tiene_permisos;
END;
$function$
;
