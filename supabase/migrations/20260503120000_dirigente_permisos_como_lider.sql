-- El seed histórico asignaba la matriz "dirigente" al UUID del rol developer.
-- Con RLS vía revisar_permisos(), el rol real 'dirigente' no tenía filas en permisos
-- y el embed roles(*) en perfiles devolvía null → login rechazaba al usuario.
-- Copiamos los permisos de "lider de banda" al rol "dirigente" por federación (idempotente).

INSERT INTO public.permisos ("idPermiso", "created_at", "idForaneaRol", "tabla", "accion")
SELECT gen_random_uuid(), now(), d."idRol", p."tabla", p."accion"
FROM public.roles AS d
INNER JOIN public.roles AS lb
  ON lb."nombreRol" = 'lider de banda'
  AND lb."idForaneaFederacion" = d."idForaneaFederacion"
INNER JOIN public.permisos AS p ON p."idForaneaRol" = lb."idRol"
WHERE d."nombreRol" = 'dirigente'
  AND NOT EXISTS (
    SELECT 1
    FROM public.permisos AS x
    WHERE x."idForaneaRol" = d."idRol"
      AND x."tabla" = p."tabla"
      AND x."accion" = p."accion"
  );
