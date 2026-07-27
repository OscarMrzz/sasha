-- Responsable de mesa: permitir UPDATE en confirmacion_asistencia (banda en cancha).
-- Idempotente: no duplica filas si ya existe el permiso.

INSERT INTO public.permisos ("idPermiso", created_at, "idForaneaRol", tabla, accion)
SELECT gen_random_uuid(), now(), r."idRol", 'confirmacion_asistencia', 'UPDATE'
FROM public.roles r
WHERE r."nombreRol" = 'responsable de mesa'
  AND NOT EXISTS (
    SELECT 1
    FROM public.permisos p
    WHERE p."idForaneaRol" = r."idRol"
      AND p.tabla = 'confirmacion_asistencia'
      AND p.accion = 'UPDATE'
  );
