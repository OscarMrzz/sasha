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


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'perfiles'
      AND policyname = 'leer_propio_perfil'
  ) THEN
    CREATE POLICY "leer_propio_perfil"
      ON "public"."perfiles"
      AS permissive
      FOR SELECT
      TO authenticated
    USING (("idForaneaUser" = auth.uid()));
  END IF;
END;
$$;



DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'agregar 1gmiffv_0'
  ) THEN
    CREATE POLICY "agregar 1gmiffv_0"
      ON "storage"."objects"
      AS permissive
      FOR INSERT
      TO authenticated
    WITH CHECK ((bucket_id = 'img-fotos-perfiles-sasha'::text));
  END IF;
END;
$$;



DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'editar 1gmiffv_0'
  ) THEN
    CREATE POLICY "editar 1gmiffv_0"
      ON "storage"."objects"
      AS permissive
      FOR UPDATE
      TO authenticated
    USING ((bucket_id = 'img-fotos-perfiles-sasha'::text));
  END IF;
END;
$$;



DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'eliminar 1gmiffv_0'
  ) THEN
    CREATE POLICY "eliminar 1gmiffv_0"
      ON "storage"."objects"
      AS permissive
      FOR DELETE
      TO authenticated
    USING ((bucket_id = 'img-fotos-perfiles-sasha'::text));
  END IF;
END;
$$;



DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'eliminar 1gmiffv_1'
  ) THEN
    CREATE POLICY "eliminar 1gmiffv_1"
      ON "storage"."objects"
      AS permissive
      FOR SELECT
      TO authenticated
    USING ((bucket_id = 'img-fotos-perfiles-sasha'::text));
  END IF;
END;
$$;



DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'leer 1gmiffv_0'
  ) THEN
    CREATE POLICY "leer 1gmiffv_0"
      ON "storage"."objects"
      AS permissive
      FOR SELECT
      TO public
    USING ((bucket_id = 'img-fotos-perfiles-sasha'::text));
  END IF;
END;
$$;



