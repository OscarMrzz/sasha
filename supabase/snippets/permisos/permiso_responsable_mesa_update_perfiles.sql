-- =============================================================================
-- Permiso: responsable de mesa → UPDATE en perfiles
-- Uso: dashboard Accesos (activar/desactivar permisos de usuarios por categoría)
-- Ejecutar en SQL Editor de Supabase (o psql) sobre la BD ya desplegada.
-- Idempotente: no duplica filas si ya existe el permiso.
-- =============================================================================

INSERT INTO public.permisos ("idPermiso", created_at, "idForaneaRol", tabla, accion)
SELECT gen_random_uuid(), now(), r."idRol", 'perfiles', 'UPDATE'
FROM public.roles r
WHERE r."nombreRol" = 'responsable de mesa'
  AND NOT EXISTS (
    SELECT 1
    FROM public.permisos p
    WHERE p."idForaneaRol" = r."idRol"
      AND p.tabla = 'perfiles'
      AND p.accion = 'UPDATE'
  );

-- Verificación (opcional)
SELECT r."nombreRol", p.tabla, p.accion
FROM public.permisos p
JOIN public.roles r ON r."idRol" = p."idForaneaRol"
WHERE r."nombreRol" = 'responsable de mesa'
  AND p.tabla = 'perfiles'
ORDER BY p.accion;
