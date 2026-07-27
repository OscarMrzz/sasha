-- Admin temporal debe poder INSERT en perfiles al crear usuarios desde el panel.
-- El seed histórico solo otorgaba SELECT/UPDATE; la política RLS "crear" exige fila en permisos.

INSERT INTO public.permisos ("idPermiso", "created_at", "idForaneaRol", "tabla", "accion")
SELECT gen_random_uuid(), now(), r."idRol", 'perfiles', 'INSERT'
FROM public.roles r
WHERE r."nombreRol" = 'admin temporal'
AND NOT EXISTS (
  SELECT 1 FROM public.permisos p
  WHERE p."idForaneaRol" = r."idRol"
    AND p.tabla = 'perfiles'
    AND p.accion = 'INSERT'
);
