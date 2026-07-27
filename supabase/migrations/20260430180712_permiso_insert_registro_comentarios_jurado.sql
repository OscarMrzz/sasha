-- Jurado (y developer) necesitan INSERT en registroComentarios al guardar la rúbrica.
-- El seed histórico solo otorgaba SELECT; la política RLS "crear" exige fila en permisos.

INSERT INTO public.permisos ("idPermiso", "created_at", "idForaneaRol", "tabla", "accion")
SELECT gen_random_uuid(), now(), r."idRol", 'registroComentarios', 'INSERT'
FROM public.roles r
WHERE r."nombreRol" IN ('jurado', 'developer')
AND NOT EXISTS (
  SELECT 1 FROM public.permisos p
  WHERE p."idForaneaRol" = r."idRol"
    AND p.tabla = 'registroComentarios'
    AND p.accion = 'INSERT'
);
