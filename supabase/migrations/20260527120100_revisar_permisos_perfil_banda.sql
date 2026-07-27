-- Si un usuario tiene varios perfiles, preferir el vinculado a banda (dirigente / líder).

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
  SELECT pf."idForaneaRol" INTO id_rol_user_auth
  FROM public.perfiles pf
  WHERE pf."idForaneaUser" = auth.uid()
  ORDER BY
    CASE WHEN pf."idForaneaBanda" IS NOT NULL THEN 0 ELSE 1 END,
    pf."created_at" DESC NULLS LAST
  LIMIT 1;

  IF id_rol_user_auth IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.permisos
    WHERE permisos."idForaneaRol" = id_rol_user_auth
      AND permisos.tabla = target_table
      AND permisos.accion = target_action
  ) INTO tiene_permisos;

  RETURN tiene_permisos;
END;
$function$;
