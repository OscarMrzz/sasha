-- =============================================================================
-- 01_tabla_auditoria.sql
-- Tabla de auditoría + índices + RLS (SELECT) + permisos matriz
-- Roles lectura: admin, admin temporal, developer, secretaria
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.auditoria (
  id_auditoria uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha timestamptz NOT NULL DEFAULT now(),
  id_foranea_user uuid REFERENCES auth.users (id),
  accion text NOT NULL,
  tabla text NOT NULL,
  id_registro uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_auditoria_fecha
  ON public.auditoria (fecha);

CREATE INDEX IF NOT EXISTS idx_auditoria_tabla_fecha
  ON public.auditoria (tabla, fecha);

CREATE INDEX IF NOT EXISTS idx_auditoria_user_fecha
  ON public.auditoria (id_foranea_user, fecha);

CREATE INDEX IF NOT EXISTS idx_auditoria_metadata_gin
  ON public.auditoria USING gin (metadata);

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

-- Matriz permisos: solo SELECT para los 4 roles (todas las federaciones)
INSERT INTO public.permisos ("idPermiso", "created_at", "idForaneaRol", "tabla", "accion")
SELECT gen_random_uuid(), now(), r."idRol", 'auditoria', 'SELECT'
FROM public.roles r
WHERE r."nombreRol" IN ('admin', 'admin temporal', 'developer', 'secretaria')
  AND NOT EXISTS (
    SELECT 1
    FROM public.permisos p
    WHERE p."idForaneaRol" = r."idRol"
      AND p.tabla = 'auditoria'
      AND p.accion = 'SELECT'
  );

DROP POLICY IF EXISTS "leer_auditoria" ON public.auditoria;
CREATE POLICY "leer_auditoria" ON public.auditoria
  FOR SELECT
  USING (public.revisar_permisos('auditoria'::text, 'SELECT'::text));

-- Sin políticas INSERT/UPDATE/DELETE: el cliente no escribe aquí.
-- Los inserts van por fn_escribir_auditoria (SECURITY DEFINER).

GRANT SELECT ON TABLE public.auditoria TO authenticated;
GRANT SELECT ON TABLE public.auditoria TO service_role;

GRANT ALL ON TABLE public.auditoria TO postgres;
GRANT ALL ON TABLE public.auditoria TO service_role;
