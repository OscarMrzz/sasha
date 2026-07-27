-- Migración de Permisos y Políticas RLS
-- Solo contiene los cambios específicos de permisos y políticas

-- Crear tabla de permisos (NUEVA)
CREATE TABLE IF NOT EXISTS "public"."permisos" (
    "idPermiso" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "idForaneaRol" "uuid",
    "tabla" "text",
    "accion" "text",
    CONSTRAINT "permisos_pkey" PRIMARY KEY ("idPermiso"),
    -- Aquí definimos la llave foránea
    CONSTRAINT "fk_permisos_roles" FOREIGN KEY ("idForaneaRol") 
        REFERENCES "public"."roles"("idRol") 
        ON DELETE CASCADE
);

-- Crear función de revisión de permisos (NUEVA)
CREATE OR REPLACE FUNCTION "public"."revisar_permisos"("target_table" "text", "target_action" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
tiene_permisos boolean;
id_rol_user_auth uuid;

begin

select "idForaneaRol" into id_rol_user_auth from perfiles where perfiles."idForaneaUser" = auth.uid();

if id_rol_user_auth is null then
  return false;
end if;

  select exists(
    select 1 from permisos
    where "idForaneaRol" =id_rol_user_auth
    and
    tabla = target_table
    and
    accion = target_action

  ) into tiene_permisos;
  return tiene_permisos;

end;
$$;

-- Habilitar RLS en todas las tablas
ALTER TABLE "public"."bandas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."categorias" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."criteriosEvalucion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cumplimientos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."federaciones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."perfiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."permisos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."regiones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."registroComentarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."registroCumplimientoEvaluaciones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."registroEquipoEvaluador" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."registroEventos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."registroPenalizaciones" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."respuestaSolicitudRevicion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."rolesEquipoEvaluador" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."rubricas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."solicitudRevicion" ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cada tabla
-- Políticas de lectura (SELECT)
DROP POLICY IF EXISTS "leer" ON "public"."bandas";
CREATE POLICY "leer" ON "public"."bandas" FOR SELECT USING ("public"."revisar_permisos"('bandas'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."categorias";
CREATE POLICY "leer" ON "public"."categorias" FOR SELECT USING ("public"."revisar_permisos"('categorias'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."criteriosEvalucion";
CREATE POLICY "leer" ON "public"."criteriosEvalucion" FOR SELECT USING ("public"."revisar_permisos"('criteriosEvalucion'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."cumplimientos";
CREATE POLICY "leer" ON "public"."cumplimientos" FOR SELECT USING ("public"."revisar_permisos"('cumplimientos'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."federaciones";
CREATE POLICY "leer" ON "public"."federaciones" FOR SELECT USING ("public"."revisar_permisos"('federaciones'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."penalizaciones";
CREATE POLICY "leer" ON "public"."penalizaciones" FOR SELECT USING (true);
DROP POLICY IF EXISTS "leer" ON "public"."perfiles";
CREATE POLICY "leer" ON "public"."perfiles" FOR SELECT USING ("public"."revisar_permisos"('perfiles'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."permisos";
CREATE POLICY "leer" ON "public"."permisos" FOR SELECT USING ("public"."revisar_permisos"('permisos'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."regiones";
CREATE POLICY "leer" ON "public"."regiones" FOR SELECT USING ("public"."revisar_permisos"('regiones'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."registroComentarios";
CREATE POLICY "leer" ON "public"."registroComentarios" FOR SELECT USING ("public"."revisar_permisos"('registroComentarios'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."registroCumplimientoEvaluaciones";
CREATE POLICY "leer" ON "public"."registroCumplimientoEvaluaciones" FOR SELECT USING ("public"."revisar_permisos"('registroCumplimientoEvaluaciones'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."registroEquipoEvaluador";
CREATE POLICY "leer" ON "public"."registroEquipoEvaluador" FOR SELECT USING ("public"."revisar_permisos"('registroEquipoEvaluador'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."registroEventos";
CREATE POLICY "leer" ON "public"."registroEventos" FOR SELECT USING ("public"."revisar_permisos"('registroEventos'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."registroPenalizaciones";
CREATE POLICY "leer" ON "public"."registroPenalizaciones" FOR SELECT USING (true);
DROP POLICY IF EXISTS "leer" ON "public"."respuestaSolicitudRevicion";
CREATE POLICY "leer" ON "public"."respuestaSolicitudRevicion" FOR SELECT USING ("public"."revisar_permisos"('respuestaSolicitudRevicion'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."roles";
CREATE POLICY "leer" ON "public"."roles" FOR SELECT USING ("public"."revisar_permisos"('roles'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."rolesEquipoEvaluador";
CREATE POLICY "leer" ON "public"."rolesEquipoEvaluador" FOR SELECT USING (true);
DROP POLICY IF EXISTS "leer" ON "public"."rubricas";
CREATE POLICY "leer" ON "public"."rubricas" FOR SELECT USING ("public"."revisar_permisos"('rubricas'::"text", 'SELECT'::"text"));
DROP POLICY IF EXISTS "leer" ON "public"."solicitudRevicion";
CREATE POLICY "leer" ON "public"."solicitudRevicion" FOR SELECT USING ("public"."revisar_permisos"('solicitudRevicion'::"text", 'SELECT'::"text"));

-- Políticas de inserción (INSERT)
DROP POLICY IF EXISTS "crear" ON "public"."bandas";
CREATE POLICY "crear" ON "public"."bandas" FOR INSERT WITH CHECK ("public"."revisar_permisos"('bandas'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."categorias";
CREATE POLICY "crear" ON "public"."categorias" FOR INSERT WITH CHECK ("public"."revisar_permisos"('categorias'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."criteriosEvalucion";
CREATE POLICY "crear" ON "public"."criteriosEvalucion" FOR INSERT WITH CHECK ("public"."revisar_permisos"('criteriosEvalucion'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."cumplimientos";
CREATE POLICY "crear" ON "public"."cumplimientos" FOR INSERT WITH CHECK ("public"."revisar_permisos"('cumplimientos'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."federaciones";
CREATE POLICY "crear" ON "public"."federaciones" FOR INSERT WITH CHECK ("public"."revisar_permisos"('federaciones'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."perfiles";
CREATE POLICY "crear" ON "public"."perfiles" FOR INSERT WITH CHECK ("public"."revisar_permisos"('perfiles'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."permisos";
CREATE POLICY "crear" ON "public"."permisos" FOR INSERT WITH CHECK ("public"."revisar_permisos"('permisos'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."regiones";
CREATE POLICY "crear" ON "public"."regiones" FOR INSERT WITH CHECK ("public"."revisar_permisos"('regiones'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."registroComentarios";
CREATE POLICY "crear" ON "public"."registroComentarios" FOR INSERT WITH CHECK ("public"."revisar_permisos"('registroComentarios'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."registroCumplimientoEvaluaciones";
CREATE POLICY "crear" ON "public"."registroCumplimientoEvaluaciones" FOR INSERT WITH CHECK ("public"."revisar_permisos"('registroCumplimientoEvaluaciones'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."registroEquipoEvaluador";
CREATE POLICY "crear" ON "public"."registroEquipoEvaluador" FOR INSERT WITH CHECK ("public"."revisar_permisos"('registroEquipoEvaluador'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."registroEventos";
CREATE POLICY "crear" ON "public"."registroEventos" FOR INSERT WITH CHECK ("public"."revisar_permisos"('registroEventos'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."respuestaSolicitudRevicion";
CREATE POLICY "crear" ON "public"."respuestaSolicitudRevicion" FOR INSERT WITH CHECK ("public"."revisar_permisos"('respuestaSolicitudRevicion'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."roles";
CREATE POLICY "crear" ON "public"."roles" FOR INSERT WITH CHECK ("public"."revisar_permisos"('roles'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."rubricas";
CREATE POLICY "crear" ON "public"."rubricas" FOR INSERT WITH CHECK ("public"."revisar_permisos"('rubricas'::"text", 'INSERT'::"text"));
DROP POLICY IF EXISTS "crear" ON "public"."solicitudRevicion";
CREATE POLICY "crear" ON "public"."solicitudRevicion" FOR INSERT WITH CHECK ("public"."revisar_permisos"('solicitudRevicion'::"text", 'INSERT'::"text"));

-- Políticas de actualización (UPDATE)
DROP POLICY IF EXISTS "editar" ON "public"."bandas";
CREATE POLICY "editar" ON "public"."bandas" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('bandas'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."categorias";
CREATE POLICY "editar" ON "public"."categorias" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('categorias'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."criteriosEvalucion";
CREATE POLICY "editar" ON "public"."criteriosEvalucion" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('criteriosEvalucion'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."cumplimientos";
CREATE POLICY "editar" ON "public"."cumplimientos" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('cumplimientos'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."federaciones";
CREATE POLICY "editar" ON "public"."federaciones" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('federaciones'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."perfiles";
CREATE POLICY "editar" ON "public"."perfiles" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('perfiles'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."permisos";
CREATE POLICY "editar" ON "public"."permisos" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('permisos'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."regiones";
CREATE POLICY "editar" ON "public"."regiones" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('regiones'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."registroComentarios";
CREATE POLICY "editar" ON "public"."registroComentarios" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('registroComentarios'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."registroCumplimientoEvaluaciones";
CREATE POLICY "editar" ON "public"."registroCumplimientoEvaluaciones" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('registroCumplimientoEvaluaciones'::"text", 'CREATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."registroEquipoEvaluador";
CREATE POLICY "editar" ON "public"."registroEquipoEvaluador" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('registroEquipoEvaluador'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."registroEventos";
CREATE POLICY "editar" ON "public"."registroEventos" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('registroEventos'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."respuestaSolicitudRevicion";
CREATE POLICY "editar" ON "public"."respuestaSolicitudRevicion" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('respuestaSolicitudRevicion'::"text", 'CREATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."roles";
CREATE POLICY "editar" ON "public"."roles" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('roles'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."rubricas";
CREATE POLICY "editar" ON "public"."rubricas" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('rubricas'::"text", 'UPDATE'::"text"));
DROP POLICY IF EXISTS "editar" ON "public"."solicitudRevicion";
CREATE POLICY "editar" ON "public"."solicitudRevicion" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('solicitudRevicion'::"text", 'UPDATE'::"text"));

-- Políticas de eliminación (DELETE)
DROP POLICY IF EXISTS "eliminar" ON "public"."bandas";
CREATE POLICY "eliminar" ON "public"."bandas" FOR DELETE USING ("public"."revisar_permisos"('bandas'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."categorias";
CREATE POLICY "eliminar" ON "public"."categorias" FOR DELETE USING ("public"."revisar_permisos"('categorias'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."criteriosEvalucion";
CREATE POLICY "eliminar" ON "public"."criteriosEvalucion" FOR DELETE USING ("public"."revisar_permisos"('criteriosEvalucion'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."cumplimientos";
CREATE POLICY "eliminar" ON "public"."cumplimientos" FOR DELETE USING ("public"."revisar_permisos"('cumplimientos'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."federaciones";
CREATE POLICY "eliminar" ON "public"."federaciones" FOR DELETE USING ("public"."revisar_permisos"('federaciones'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."perfiles";
CREATE POLICY "eliminar" ON "public"."perfiles" FOR DELETE USING ("public"."revisar_permisos"('perfiles'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."permisos";
CREATE POLICY "eliminar" ON "public"."permisos" FOR DELETE USING ("public"."revisar_permisos"('permisos'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."regiones";
CREATE POLICY "eliminar" ON "public"."regiones" FOR DELETE USING ("public"."revisar_permisos"('regiones'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."registroComentarios";
CREATE POLICY "eliminar" ON "public"."registroComentarios" FOR DELETE USING ("public"."revisar_permisos"('registroComentarios'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."registroCumplimientoEvaluaciones";
CREATE POLICY "eliminar" ON "public"."registroCumplimientoEvaluaciones" FOR SELECT USING ("public"."revisar_permisos"('registroCumplimientoEvaluaciones'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."registroEquipoEvaluador";
CREATE POLICY "eliminar" ON "public"."registroEquipoEvaluador" FOR DELETE USING ("public"."revisar_permisos"('registroEquipoEvaluador'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."registroEventos";
CREATE POLICY "eliminar" ON "public"."registroEventos" FOR DELETE USING ("public"."revisar_permisos"('registroEventos'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."respuestaSolicitudRevicion";
CREATE POLICY "eliminar" ON "public"."respuestaSolicitudRevicion" FOR DELETE USING ("public"."revisar_permisos"('respuestaSolicitudRevicion'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."roles";
CREATE POLICY "eliminar" ON "public"."roles" FOR DELETE USING ("public"."revisar_permisos"('roles'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."rubricas";
CREATE POLICY "eliminar" ON "public"."rubricas" FOR DELETE USING ("public"."revisar_permisos"('rubricas'::"text", 'DELETE'::"text"));
DROP POLICY IF EXISTS "eliminar" ON "public"."solicitudRevicion";
CREATE POLICY "eliminar" ON "public"."solicitudRevicion" FOR DELETE USING ("public"."revisar_permisos"('solicitudRevicion'::"text", 'DELETE'::"text"));

-- Permisos GRANT para todas las tablas
GRANT ALL ON TABLE "public"."bandas" TO "anon";
GRANT ALL ON TABLE "public"."bandas" TO "authenticated";
GRANT ALL ON TABLE "public"."bandas" TO "service_role";
GRANT ALL ON TABLE "public"."categorias" TO "anon";
GRANT ALL ON TABLE "public"."categorias" TO "authenticated";
GRANT ALL ON TABLE "public"."categorias" TO "service_role";
GRANT ALL ON TABLE "public"."criteriosEvalucion" TO "anon";
GRANT ALL ON TABLE "public"."criteriosEvalucion" TO "authenticated";
GRANT ALL ON TABLE "public"."criteriosEvalucion" TO "service_role";
GRANT ALL ON TABLE "public"."cumplimientos" TO "anon";
GRANT ALL ON TABLE "public"."cumplimientos" TO "authenticated";
GRANT ALL ON TABLE "public"."cumplimientos" TO "service_role";
GRANT ALL ON TABLE "public"."federaciones" TO "anon";
GRANT ALL ON TABLE "public"."federaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."federaciones" TO "service_role";
GRANT ALL ON TABLE "public"."perfiles" TO "anon";
GRANT ALL ON TABLE "public"."perfiles" TO "authenticated";
GRANT ALL ON TABLE "public"."perfiles" TO "service_role";
GRANT ALL ON TABLE "public"."permisos" TO "postgres";
GRANT ALL ON TABLE "public"."permisos" TO "anon";
GRANT ALL ON TABLE "public"."permisos" TO "authenticated";
GRANT ALL ON TABLE "public"."permisos" TO "service_role";
GRANT ALL ON TABLE "public"."regiones" TO "anon";
GRANT ALL ON TABLE "public"."regiones" TO "authenticated";
GRANT ALL ON TABLE "public"."regiones" TO "service_role";
GRANT ALL ON TABLE "public"."registroComentarios" TO "anon";
GRANT ALL ON TABLE "public"."registroComentarios" TO "authenticated";
GRANT ALL ON TABLE "public"."registroComentarios" TO "service_role";
GRANT ALL ON TABLE "public"."registroCumplimientoEvaluaciones" TO "anon";
GRANT ALL ON TABLE "public"."registroCumplimientoEvaluaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."registroCumplimientoEvaluaciones" TO "service_role";
GRANT ALL ON TABLE "public"."registroEquipoEvaluador" TO "anon";
GRANT ALL ON TABLE "public"."registroEquipoEvaluador" TO "authenticated";
GRANT ALL ON TABLE "public"."registroEquipoEvaluador" TO "service_role";
GRANT ALL ON TABLE "public"."registroEventos" TO "anon";
GRANT ALL ON TABLE "public"."registroEventos" TO "authenticated";
GRANT ALL ON TABLE "public"."registroEventos" TO "service_role";
GRANT ALL ON TABLE "public"."registroPenalizaciones" TO "anon";
GRANT ALL ON TABLE "public"."registroPenalizaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."registroPenalizaciones" TO "service_role";
GRANT ALL ON TABLE "public"."respuestaSolicitudRevicion" TO "anon";
GRANT ALL ON TABLE "public"."respuestaSolicitudRevicion" TO "authenticated";
GRANT ALL ON TABLE "public"."respuestaSolicitudRevicion" TO "service_role";
GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";
GRANT ALL ON TABLE "public"."rolesEquipoEvaluador" TO "anon";
GRANT ALL ON TABLE "public"."rolesEquipoEvaluador" TO "authenticated";
GRANT ALL ON TABLE "public"."rolesEquipoEvaluador" TO "service_role";
GRANT ALL ON TABLE "public"."rubricas" TO "anon";
GRANT ALL ON TABLE "public"."rubricas" TO "authenticated";
GRANT ALL ON TABLE "public"."rubricas" TO "service_role";
GRANT ALL ON TABLE "public"."solicitudRevicion" TO "anon";
GRANT ALL ON TABLE "public"."solicitudRevicion" TO "authenticated";
GRANT ALL ON TABLE "public"."solicitudRevicion" TO "service_role";

-- Permisos para vistas
GRANT ALL ON TABLE "public"."vista_asistencia_bandas" TO "anon";
GRANT ALL ON TABLE "public"."vista_asistencia_bandas" TO "authenticated";
GRANT ALL ON TABLE "public"."vista_asistencia_bandas" TO "service_role";
GRANT ALL ON TABLE "public"."vista_daniada1" TO "anon";
GRANT ALL ON TABLE "public"."vista_daniada1" TO "authenticated";
GRANT ALL ON TABLE "public"."vista_daniada1" TO "service_role";
GRANT ALL ON TABLE "public"."vista_daniada2" TO "anon";
GRANT ALL ON TABLE "public"."vista_daniada2" TO "authenticated";
GRANT ALL ON TABLE "public"."vista_daniada2" TO "service_role";
GRANT ALL ON TABLE "public"."vista_resultados_generales" TO "anon";
GRANT ALL ON TABLE "public"."vista_resultados_generales" TO "authenticated";
GRANT ALL ON TABLE "public"."vista_resultados_generales" TO "service_role";
GRANT ALL ON TABLE "public"."vista_resultados_eventos" TO "anon";
GRANT ALL ON TABLE "public"."vista_resultados_eventos" TO "authenticated";
GRANT ALL ON TABLE "public"."vista_resultados_eventos" TO "service_role";
GRANT ALL ON TABLE "public"."vista_resultados_temporada" TO "anon";
GRANT ALL ON TABLE "public"."vista_resultados_temporada" TO "authenticated";
GRANT ALL ON TABLE "public"."vista_resultados_temporada" TO "service_role";
GRANT ALL ON TABLE "public"."vista_solicitud_revicion" TO "anon";
GRANT ALL ON TABLE "public"."vista_solicitud_revicion" TO "authenticated";
GRANT ALL ON TABLE "public"."vista_solicitud_revicion" TO "service_role";
GRANT ALL ON TABLE "public"."vistacumplimientoscondatosampleosidforaneafederacion" TO "anon";
GRANT ALL ON TABLE "public"."vistacumplimientoscondatosampleosidforaneafederacion" TO "authenticated";
GRANT ALL ON TABLE "public"."vistacumplimientoscondatosampleosidforaneafederacion" TO "service_role";
GRANT ALL ON TABLE "public"."vistacumplimientosconidforaneafederacion" TO "anon";
GRANT ALL ON TABLE "public"."vistacumplimientosconidforaneafederacion" TO "authenticated";
GRANT ALL ON TABLE "public"."vistacumplimientosconidforaneafederacion" TO "service_role";

-- Privilegios por defecto
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
