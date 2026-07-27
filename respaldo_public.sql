

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."generar_codigo_perfil"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    anio_actual TEXT;
    ultimo_codigo TEXT;
    sufijo_completo INT;
    bloque_medio INT;
    correlativo_final INT;
    NUEVO_INICIO_SUFIJO CONSTANT INT := 100100;
BEGIN
    anio_actual := TO_CHAR(CURRENT_DATE, 'YYYY');

    -- Bloqueamos la fila encontrada para evitar que otro trigger lea lo mismo
    SELECT codigo INTO ultimo_codigo
    FROM perfiles
    WHERE codigo LIKE anio_actual || '%'
    ORDER BY codigo DESC
    LIMIT 1
    FOR UPDATE; 

    IF ultimo_codigo IS NULL THEN
        NEW.codigo := anio_actual || NUEVO_INICIO_SUFIJO::TEXT;
    ELSE
        -- Extraer los 6 dígitos tras el año
        sufijo_completo := CAST(SUBSTRING(ultimo_codigo FROM 5) AS INT);
        
        bloque_medio := sufijo_completo / 1000;
        correlativo_final := sufijo_completo % 1000;

        IF correlativo_final >= 999 THEN
            bloque_medio := bloque_medio + 1;
            correlativo_final := 100; 
        ELSE
            correlativo_final := correlativo_final + 1;
        END IF;

        -- Formateo garantizado a 3 dígitos para cada parte del sufijo
        NEW.codigo := anio_actual || 
                      LPAD(bloque_medio::TEXT, 3, '0') || 
                      LPAD(correlativo_final::TEXT, 3, '0');
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generar_codigo_perfil"() OWNER TO "supabase_admin";


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


ALTER FUNCTION "public"."revisar_permisos"("target_table" "text", "target_action" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bandas" (
    "idBanda" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nombreBanda" "text" NOT NULL,
    "AliasBanda" "text",
    "idForaneaCategoria" "uuid",
    "idForaneaRegion" "uuid",
    "idForaneaFederacion" "uuid",
    "ciudadBanda" "text",
    "urlLogoBanda" "text",
    "fechaFundacionBanda" "date",
    "fechaInscripcionAFederacion" "date",
    "ubicacionSedeBanda" "text"
);


ALTER TABLE "public"."bandas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categorias" (
    "idCategoria" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nombreCategoria" "text" NOT NULL,
    "detallesCategoria" "text",
    "idForaneaFederacion" "uuid" NOT NULL
);


ALTER TABLE "public"."categorias" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."criteriosEvalucion" (
    "idCriterio" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nombreCriterio" "text" NOT NULL,
    "detallesCriterio" "text",
    "puntosCriterio" double precision DEFAULT '0'::double precision,
    "idForaneaRubrica" "uuid"
);


ALTER TABLE "public"."criteriosEvalucion" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cumplimientos" (
    "idCumplimiento" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "detalleCumplimiento" "text",
    "puntosCumplimiento" double precision,
    "idForaneaCriterio" "uuid"
);


ALTER TABLE "public"."cumplimientos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."federaciones" (
    "idFederacion" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nombreFederacion" "text" NOT NULL
);


ALTER TABLE "public"."federaciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."penalizaciones" (
    "idPenalizacion" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "idForaneaFederacion" "uuid" NOT NULL,
    "idForaneaCategoria" "uuid" NOT NULL,
    "nombrePenalizacion" "text" NOT NULL,
    "detallesPenalizacion" "text",
    "puntosPenalizacion" double precision NOT NULL
);


ALTER TABLE "public"."penalizaciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."perfiles" (
    "idPerfil" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nombre" "text",
    "alias" "text",
    "fechaNacimiento" "date",
    "sexo" "text",
    "idForaneaFederacion" "uuid",
    "identidad" "text",
    "numeroTelefono" "text",
    "direccion" "text",
    "idForaneaUser" "uuid",
    "segundoNombre" "text",
    "primerApellido" "text",
    "segundoApellido" "text",
    "idForaneaBanda" "uuid",
    "idForaneaRol" "uuid",
    "permisos" boolean DEFAULT false,
    "urlFotoPerfil" "text",
    "codigo" "text" NOT NULL,
    "estado" "text" DEFAULT 'activo'::"text"
);


ALTER TABLE "public"."perfiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permisos" (
    "idPermiso" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "idForaneaRol" "uuid",
    "tabla" "text",
    "accion" "text"
);


ALTER TABLE "public"."permisos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."regiones" (
    "idRegion" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nombreRegion" "text" NOT NULL,
    "idForaneaFederacion" "uuid" NOT NULL
);


ALTER TABLE "public"."regiones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."registroComentarios" (
    "idRegistroComentario" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "idForaneaEvento" "uuid" NOT NULL,
    "idForaneaBanda" "uuid" NOT NULL,
    "idForaneaCategoria" "uuid" NOT NULL,
    "idForaneaRegion" "uuid" NOT NULL,
    "idForaneaPerfil" "uuid" NOT NULL,
    "comentario" "text",
    "idForaneaRubrica" "uuid",
    "idForaneaFederacion" "uuid"
);


ALTER TABLE "public"."registroComentarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."registroCumplimientoEvaluaciones" (
    "idRegistroCumplimientoEvaluacion" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "idForaneaEvento" "uuid" NOT NULL,
    "idForaneaBanda" "uuid" NOT NULL,
    "idForaneaCriterio" "uuid" NOT NULL,
    "idForaneaCumplimiento" "uuid" NOT NULL,
    "idForaneaCategoria" "uuid" NOT NULL,
    "idForaneaRegion" "uuid" NOT NULL,
    "puntosObtenidos" double precision DEFAULT '0'::double precision NOT NULL,
    "idForaneaPerfil" "uuid",
    "idForaneaFederacion" "uuid",
    "idForaneaRubrica" "uuid"
);


ALTER TABLE "public"."registroCumplimientoEvaluaciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."registroEquipoEvaluador" (
    "idRegistroEvaluador" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "idForaneaEvento" "uuid" NOT NULL,
    "idForaneaPerfil" "uuid" NOT NULL
);


ALTER TABLE "public"."registroEquipoEvaluador" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."registroEventos" (
    "idEvento" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "LugarEvento" "text" NOT NULL,
    "fechaEvento" "date" NOT NULL,
    "idForaneaRegion" "uuid" NOT NULL,
    "idForaneaFederacion" "uuid" NOT NULL
);


ALTER TABLE "public"."registroEventos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."registroPenalizaciones" (
    "idRegistroPenalizacion" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "idForaneaFederacion" "uuid" NOT NULL,
    "idForaneaEvento" "uuid" NOT NULL,
    "idForaneaCategoria" "uuid" NOT NULL,
    "idForaneaBanda" "uuid" NOT NULL,
    "idForaneaUser" "uuid" NOT NULL,
    "idForaneaPenalizacion" "uuid" NOT NULL,
    "puntosPenalizacion" double precision DEFAULT '0'::double precision NOT NULL
);


ALTER TABLE "public"."registroPenalizaciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."respuestaSolicitudRevicion" (
    "idRespuesta" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "idForaneaFederacion" "uuid",
    "idForaneaSolicitudRevicion" "uuid",
    "idForaneaRevisor" "uuid",
    "aprobacion" "text",
    "detallesRespuesta" "text"
);


ALTER TABLE "public"."respuestaSolicitudRevicion" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "idRol" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nombreRol" "text",
    "idForaneaFederacion" "uuid",
    "estadoRol" boolean
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rolesEquipoEvaluador" (
    "idRol" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "idForaneaFederacion" "uuid" NOT NULL,
    "nombreRol" "text",
    "DetallesRol" "text"
);


ALTER TABLE "public"."rolesEquipoEvaluador" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rubricas" (
    "idRubrica" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nombreRubrica" "text" NOT NULL,
    "datalleRubrica" "text",
    "puntosRubrica" double precision DEFAULT '0'::double precision,
    "idForaneaCategoria" "uuid",
    "idForaneaFederacion" "uuid",
    "versionRubrica" "text"
);


ALTER TABLE "public"."rubricas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."solicitudRevicion" (
    "idSolicitud" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "idForaneaRegistroCumplimiento" "uuid",
    "idForaneaFederacion" "uuid",
    "idForaneaSolicitanteRevicion" "uuid",
    "detallesSolicitud" "text",
    "estado" "text" DEFAULT 'pendiente'::"text"
);


ALTER TABLE "public"."solicitudRevicion" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vista_asistencia_bandas" WITH ("security_invoker"='on') AS
 SELECT "registroCumplimientoEvaluaciones"."idForaneaEvento",
    "registroEventos"."LugarEvento",
    "bandas"."idBanda",
    "bandas"."created_at",
    "bandas"."nombreBanda",
    "bandas"."AliasBanda",
    "bandas"."idForaneaCategoria",
    "bandas"."idForaneaRegion",
    "bandas"."idForaneaFederacion",
    "bandas"."ciudadBanda",
    "bandas"."urlLogoBanda",
    "bandas"."fechaFundacionBanda",
    "bandas"."fechaInscripcionAFederacion",
    "bandas"."ubicacionSedeBanda"
   FROM (("public"."registroCumplimientoEvaluaciones"
     JOIN "public"."registroEventos" ON (("registroCumplimientoEvaluaciones"."idForaneaEvento" = "registroEventos"."idEvento")))
     JOIN "public"."bandas" ON (("registroCumplimientoEvaluaciones"."idForaneaBanda" = "bandas"."idBanda")));


ALTER VIEW "public"."vista_asistencia_bandas" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vista_daniada1" AS
SELECT
    NULL::"uuid" AS "idRegistroCumplimientoEvaluacion",
    NULL::"uuid" AS "idForaneaRegion",
    NULL::"uuid" AS "idForaneaCategoria",
    NULL::"uuid" AS "idForaneaPerfil",
    NULL::"uuid" AS "idForaneaFederacion",
    NULL::"uuid" AS "idForaneaEvento",
    NULL::"uuid" AS "idForaneaBanda",
    NULL::"uuid" AS "idForaneaRubrica",
    NULL::"uuid" AS "idForaneaCumplimiento",
    NULL::"text" AS "nombreRegion",
    NULL::"text" AS "nombreCategoria",
    NULL::"text" AS "nombre",
    NULL::"date" AS "fechaEvento",
    NULL::numeric AS "anioEvento",
    NULL::"text" AS "LugarEvento",
    NULL::"text" AS "nombreBanda",
    NULL::"text" AS "nombreRubrica",
    NULL::"text" AS "nombreCriterio",
    NULL::"text" AS "detalleCumplimiento",
    NULL::double precision AS "puntosObtenidos",
    NULL::"uuid" AS "idForaneaCriterio";


ALTER VIEW "public"."vista_daniada1" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vista_daniada2" WITH ("security_invoker"='on') AS
 SELECT "vista_daniada1"."idRegistroCumplimientoEvaluacion",
    "vista_daniada1"."idForaneaRegion",
    "vista_daniada1"."idForaneaCategoria",
    "vista_daniada1"."idForaneaPerfil",
    "vista_daniada1"."idForaneaFederacion",
    "vista_daniada1"."idForaneaEvento",
    "vista_daniada1"."idForaneaBanda",
    "vista_daniada1"."idForaneaRubrica",
    "vista_daniada1"."idForaneaCumplimiento",
    "vista_daniada1"."nombreRegion",
    "vista_daniada1"."nombreCategoria",
    "vista_daniada1"."nombre",
    "vista_daniada1"."fechaEvento",
    "vista_daniada1"."anioEvento",
    "vista_daniada1"."LugarEvento",
    "vista_daniada1"."nombreBanda",
    "vista_daniada1"."nombreRubrica",
    "vista_daniada1"."nombreCriterio",
    "vista_daniada1"."detalleCumplimiento",
    "vista_daniada1"."puntosObtenidos",
    "cumplimientos"."idForaneaCriterio"
   FROM ("public"."vista_daniada1"
     JOIN "public"."cumplimientos" ON (("cumplimientos"."idCumplimiento" = "vista_daniada1"."idForaneaCumplimiento")));


ALTER VIEW "public"."vista_daniada2" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vista_resultados_generales" WITH ("security_invoker"='on') AS
 SELECT "rce"."idRegistroCumplimientoEvaluacion",
    "rce"."idForaneaRegion",
    "rce"."idForaneaCategoria",
    "rce"."idForaneaPerfil",
    "rce"."idForaneaFederacion",
    "rce"."idForaneaEvento",
    "rce"."idForaneaBanda",
    "rce"."idForaneaRubrica",
    "rce"."idForaneaCumplimiento",
    "reg"."nombreRegion",
    "cat"."nombreCategoria",
    "ban"."nombreBanda",
    "re"."fechaEvento",
    EXTRACT(year FROM "re"."fechaEvento") AS "anioEvento",
    "re"."LugarEvento",
    "c"."detalleCumplimiento",
    "rce"."puntosObtenidos",
    "c"."idForaneaCriterio",
    "ce"."nombreCriterio",
    "rub"."nombreRubrica",
    "p"."nombre"
   FROM (((((((("public"."registroCumplimientoEvaluaciones" "rce"
     JOIN "public"."regiones" "reg" ON (("reg"."idRegion" = "rce"."idForaneaRegion")))
     JOIN "public"."categorias" "cat" ON (("cat"."idCategoria" = "rce"."idForaneaCategoria")))
     JOIN "public"."bandas" "ban" ON (("ban"."idBanda" = "rce"."idForaneaBanda")))
     JOIN "public"."registroEventos" "re" ON (("re"."idEvento" = "rce"."idForaneaEvento")))
     JOIN "public"."cumplimientos" "c" ON (("c"."idCumplimiento" = "rce"."idForaneaCumplimiento")))
     JOIN "public"."criteriosEvalucion" "ce" ON (("ce"."idCriterio" = "c"."idForaneaCriterio")))
     JOIN "public"."rubricas" "rub" ON (("rub"."idRubrica" = "rce"."idForaneaRubrica")))
     JOIN "public"."perfiles" "p" ON (("p"."idPerfil" = "rce"."idForaneaPerfil")));


ALTER VIEW "public"."vista_resultados_generales" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vista_resultados_eventos" WITH ("security_invoker"='on') AS
 SELECT "idForaneaFederacion",
    "idForaneaEvento",
    "idForaneaRegion",
    "idForaneaBanda",
    "fechaEvento",
    "anioEvento",
    "nombreRegion",
    "idForaneaCategoria",
    "nombreCategoria",
    "LugarEvento",
    "nombreBanda",
    "total",
    "promedio",
    "eventosParticipados",
    "rank"() OVER (PARTITION BY "idForaneaFederacion", "idForaneaRegion", "idForaneaCategoria" ORDER BY "total" DESC) AS "rankin"
   FROM ( SELECT "vista_resultados_generales"."idForaneaFederacion",
            "vista_resultados_generales"."idForaneaEvento",
            "vista_resultados_generales"."idForaneaRegion",
            "vista_resultados_generales"."idForaneaBanda",
            "max"("vista_resultados_generales"."fechaEvento") AS "fechaEvento",
            "max"("vista_resultados_generales"."anioEvento") AS "anioEvento",
            "vista_resultados_generales"."nombreRegion",
            "vista_resultados_generales"."idForaneaCategoria",
            "vista_resultados_generales"."nombreCategoria",
            "vista_resultados_generales"."LugarEvento",
            "vista_resultados_generales"."nombreBanda",
            "sum"("vista_resultados_generales"."puntosObtenidos") AS "total",
            ("sum"("vista_resultados_generales"."puntosObtenidos") / ("count"(DISTINCT "vista_resultados_generales"."idForaneaEvento"))::double precision) AS "promedio",
            "count"(DISTINCT "vista_resultados_generales"."idForaneaEvento") AS "eventosParticipados"
           FROM "public"."vista_resultados_generales"
          GROUP BY "vista_resultados_generales"."idForaneaFederacion", "vista_resultados_generales"."idForaneaEvento", "vista_resultados_generales"."idForaneaRegion", "vista_resultados_generales"."nombreRegion", "vista_resultados_generales"."idForaneaCategoria", "vista_resultados_generales"."nombreCategoria", "vista_resultados_generales"."LugarEvento", "vista_resultados_generales"."idForaneaBanda", "vista_resultados_generales"."nombreBanda"
          ORDER BY ("sum"("vista_resultados_generales"."puntosObtenidos")) DESC) "unnamed_subquery";


ALTER VIEW "public"."vista_resultados_eventos" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vista_resultados_temporada" WITH ("security_invoker"='on') AS
 SELECT "idForaneaFederacion",
    "idForaneaCategoria",
    "nombreCategoria",
    "anioTemporada",
    "idForaneaBanda",
    "nombreBanda",
    "totalTemporada",
    "promedioTemporada",
    "asistenciaEventos",
    "rank"() OVER (PARTITION BY "idForaneaFederacion", "idForaneaCategoria", "anioTemporada" ORDER BY "totalTemporada" DESC) AS "rankinTemporada"
   FROM ( SELECT "vista_resultados_eventos"."idForaneaFederacion",
            "vista_resultados_eventos"."idForaneaCategoria",
            "vista_resultados_eventos"."nombreCategoria",
            "vista_resultados_eventos"."anioEvento" AS "anioTemporada",
            "vista_resultados_eventos"."idForaneaBanda",
            "vista_resultados_eventos"."nombreBanda",
            "sum"("vista_resultados_eventos"."total") AS "totalTemporada",
            ("sum"("vista_resultados_eventos"."total") / ("count"(DISTINCT "vista_resultados_eventos"."idForaneaEvento"))::double precision) AS "promedioTemporada",
            "count"(DISTINCT "vista_resultados_eventos"."idForaneaEvento") AS "asistenciaEventos"
           FROM "public"."vista_resultados_eventos"
          GROUP BY "vista_resultados_eventos"."anioEvento", "vista_resultados_eventos"."idForaneaFederacion", "vista_resultados_eventos"."idForaneaCategoria", "vista_resultados_eventos"."nombreCategoria", "vista_resultados_eventos"."idForaneaBanda", "vista_resultados_eventos"."nombreBanda") "unnamed_subquery";


ALTER VIEW "public"."vista_resultados_temporada" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vista_solicitud_revicion" WITH ("security_invoker"='on') AS
 SELECT "solicitudRevicion"."idSolicitud",
    "solicitudRevicion"."created_at",
    "solicitudRevicion"."idForaneaFederacion",
    "solicitudRevicion"."idForaneaSolicitanteRevicion",
    "solicitudRevicion"."idForaneaRegistroCumplimiento",
    "solicitudRevicion"."detallesSolicitud",
    "solicitudRevicion"."estado",
    "registroCumplimientoEvaluaciones"."idForaneaRegion",
    "registroCumplimientoEvaluaciones"."idForaneaCategoria",
    "registroCumplimientoEvaluaciones"."idForaneaBanda",
    "registroCumplimientoEvaluaciones"."idForaneaEvento",
    "registroCumplimientoEvaluaciones"."idForaneaRubrica",
    "registroCumplimientoEvaluaciones"."idForaneaCriterio",
    "registroCumplimientoEvaluaciones"."idForaneaCumplimiento",
    "registroCumplimientoEvaluaciones"."idForaneaPerfil" AS "idforaneaevaluador",
    "perfiles"."nombre" AS "nombresolicitante",
    "per"."nombre" AS "nombreevaluador",
    "regiones"."nombreRegion",
    "categorias"."nombreCategoria",
    "bandas"."nombreBanda",
    "registroEventos"."LugarEvento",
    "rubricas"."nombreRubrica",
    "rubricas"."datalleRubrica",
    "criteriosEvalucion"."nombreCriterio",
    "criteriosEvalucion"."detallesCriterio",
    "cumplimientos"."detalleCumplimiento",
    "cumplimientos"."puntosCumplimiento"
   FROM (((((((((("public"."solicitudRevicion"
     JOIN "public"."registroCumplimientoEvaluaciones" ON (("solicitudRevicion"."idForaneaRegistroCumplimiento" = "registroCumplimientoEvaluaciones"."idRegistroCumplimientoEvaluacion")))
     JOIN "public"."perfiles" ON (("solicitudRevicion"."idForaneaSolicitanteRevicion" = "perfiles"."idPerfil")))
     JOIN "public"."regiones" ON (("registroCumplimientoEvaluaciones"."idForaneaRegion" = "regiones"."idRegion")))
     JOIN "public"."categorias" ON (("registroCumplimientoEvaluaciones"."idForaneaCategoria" = "categorias"."idCategoria")))
     JOIN "public"."bandas" ON (("registroCumplimientoEvaluaciones"."idForaneaBanda" = "bandas"."idBanda")))
     JOIN "public"."registroEventos" ON (("registroCumplimientoEvaluaciones"."idForaneaEvento" = "registroEventos"."idEvento")))
     JOIN "public"."rubricas" ON (("registroCumplimientoEvaluaciones"."idForaneaRubrica" = "rubricas"."idRubrica")))
     JOIN "public"."criteriosEvalucion" ON (("registroCumplimientoEvaluaciones"."idForaneaCriterio" = "criteriosEvalucion"."idCriterio")))
     JOIN "public"."cumplimientos" ON (("registroCumplimientoEvaluaciones"."idForaneaCumplimiento" = "cumplimientos"."idCumplimiento")))
     JOIN "public"."perfiles" "per" ON (("registroCumplimientoEvaluaciones"."idForaneaPerfil" = "per"."idPerfil")));


ALTER VIEW "public"."vista_solicitud_revicion" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vistacumplimientoscondatosampleosidforaneafederacion" WITH ("security_invoker"='on') AS
 SELECT "cumplimientos"."idCumplimiento",
    "cumplimientos"."created_at",
    "cumplimientos"."detalleCumplimiento",
    "cumplimientos"."puntosCumplimiento",
    "cumplimientos"."idForaneaCriterio",
    "criteriosEvalucion"."idCriterio",
    "criteriosEvalucion"."nombreCriterio",
    "criteriosEvalucion"."detallesCriterio",
    "criteriosEvalucion"."puntosCriterio",
    "criteriosEvalucion"."idForaneaRubrica",
    "rubricas"."idForaneaFederacion"
   FROM (("public"."cumplimientos"
     JOIN "public"."criteriosEvalucion" ON (("criteriosEvalucion"."idCriterio" = "cumplimientos"."idForaneaCriterio")))
     JOIN "public"."rubricas" ON (("rubricas"."idRubrica" = "criteriosEvalucion"."idForaneaRubrica")));


ALTER VIEW "public"."vistacumplimientoscondatosampleosidforaneafederacion" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vistacumplimientosconidforaneafederacion" WITH ("security_invoker"='on') AS
 SELECT "cumplimientos"."idCumplimiento",
    "cumplimientos"."created_at",
    "cumplimientos"."detalleCumplimiento",
    "cumplimientos"."puntosCumplimiento",
    "cumplimientos"."idForaneaCriterio",
    "rubricas"."idForaneaFederacion"
   FROM (("public"."cumplimientos"
     JOIN "public"."criteriosEvalucion" ON (("criteriosEvalucion"."idCriterio" = "cumplimientos"."idForaneaCriterio")))
     JOIN "public"."rubricas" ON (("rubricas"."idRubrica" = "criteriosEvalucion"."idForaneaRubrica")));


ALTER VIEW "public"."vistacumplimientosconidforaneafederacion" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bandas"
    ADD CONSTRAINT "Bandas_pkey" PRIMARY KEY ("idBanda");



ALTER TABLE ONLY "public"."categorias"
    ADD CONSTRAINT "Categorias_pkey" PRIMARY KEY ("idCategoria");



ALTER TABLE ONLY "public"."registroEventos"
    ADD CONSTRAINT "Eventos_pkey" PRIMARY KEY ("idEvento");



ALTER TABLE ONLY "public"."criteriosEvalucion"
    ADD CONSTRAINT "criteriosEvalucion_pkey" PRIMARY KEY ("idCriterio");



ALTER TABLE ONLY "public"."cumplimientos"
    ADD CONSTRAINT "cumplimientos_pkey" PRIMARY KEY ("idCumplimiento");



ALTER TABLE ONLY "public"."federaciones"
    ADD CONSTRAINT "federacion_pkey" PRIMARY KEY ("idFederacion");



ALTER TABLE ONLY "public"."penalizaciones"
    ADD CONSTRAINT "penalizaciones_pkey" PRIMARY KEY ("idPenalizacion");



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_pkey" PRIMARY KEY ("idPerfil");



ALTER TABLE ONLY "public"."permisos"
    ADD CONSTRAINT "permisos_pkey" PRIMARY KEY ("idPermiso");



ALTER TABLE ONLY "public"."regiones"
    ADD CONSTRAINT "regiones_pkey" PRIMARY KEY ("idRegion");



ALTER TABLE ONLY "public"."registroCumplimientoEvaluaciones"
    ADD CONSTRAINT "registroCumplimientoEvaluaciones_pkey" PRIMARY KEY ("idRegistroCumplimientoEvaluacion");



ALTER TABLE ONLY "public"."registroEquipoEvaluador"
    ADD CONSTRAINT "registroEquipoEvaluador_pkey" PRIMARY KEY ("idRegistroEvaluador");



ALTER TABLE ONLY "public"."registroPenalizaciones"
    ADD CONSTRAINT "registroPenalizaciones_pkey" PRIMARY KEY ("idRegistroPenalizacion");



ALTER TABLE ONLY "public"."respuestaSolicitudRevicion"
    ADD CONSTRAINT "respuestaSolicitudRevicion_pkey" PRIMARY KEY ("idRespuesta");



ALTER TABLE ONLY "public"."registroComentarios"
    ADD CONSTRAINT "rgistroComentarios_pkey" PRIMARY KEY ("idRegistroComentario");



ALTER TABLE ONLY "public"."rolesEquipoEvaluador"
    ADD CONSTRAINT "rolesEquipoEvaluador_pkey" PRIMARY KEY ("idRol");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("idRol");



ALTER TABLE ONLY "public"."rubricas"
    ADD CONSTRAINT "rubricas_pkey" PRIMARY KEY ("idRubrica");



ALTER TABLE ONLY "public"."solicitudRevicion"
    ADD CONSTRAINT "solicitudRevicion_pkey" PRIMARY KEY ("idSolicitud");



CREATE OR REPLACE VIEW "public"."vista_daniada1" WITH ("security_invoker"='on') AS
 SELECT "idRegistroCumplimientoEvaluacion",
    "idForaneaRegion",
    "idForaneaCategoria",
    "idForaneaPerfil",
    "idForaneaFederacion",
    "idForaneaEvento",
    "idForaneaBanda",
    "idForaneaRubrica",
    "idForaneaCumplimiento",
    "nombreRegion",
    "nombreCategoria",
    "nombre",
    "fechaEvento",
    "anioEvento",
    "LugarEvento",
    "nombreBanda",
    "nombreRubrica",
    "nombreCriterio",
    "detalleCumplimiento",
    "puntosObtenidos",
    "idForaneaCriterio"
   FROM "public"."vista_daniada2";



CREATE OR REPLACE TRIGGER "tg_generar_codigo_perfil" BEFORE INSERT ON "public"."perfiles" FOR EACH ROW EXECUTE FUNCTION "public"."generar_codigo_perfil"();



ALTER TABLE ONLY "public"."bandas"
    ADD CONSTRAINT "Bandas_idForaneaCategoria_fkey" FOREIGN KEY ("idForaneaCategoria") REFERENCES "public"."categorias"("idCategoria");



ALTER TABLE ONLY "public"."categorias"
    ADD CONSTRAINT "Categorias_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."registroEventos"
    ADD CONSTRAINT "Eventos_idForaneaRegion_fkey" FOREIGN KEY ("idForaneaRegion") REFERENCES "public"."regiones"("idRegion");



ALTER TABLE ONLY "public"."regiones"
    ADD CONSTRAINT "Regiones_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."registroEquipoEvaluador"
    ADD CONSTRAINT "RegistroEquipoEvaluador_idForaneaEvento_fkey" FOREIGN KEY ("idForaneaEvento") REFERENCES "public"."registroEventos"("idEvento");



ALTER TABLE ONLY "public"."bandas"
    ADD CONSTRAINT "bandas_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."bandas"
    ADD CONSTRAINT "bandas_idForaneaRegion_fkey" FOREIGN KEY ("idForaneaRegion") REFERENCES "public"."regiones"("idRegion");



ALTER TABLE ONLY "public"."criteriosEvalucion"
    ADD CONSTRAINT "criteriosEvalucion_idForaneaRubrica_fkey" FOREIGN KEY ("idForaneaRubrica") REFERENCES "public"."rubricas"("idRubrica");



ALTER TABLE ONLY "public"."cumplimientos"
    ADD CONSTRAINT "cumplimientos_idForaneaCriterioEvalucion_fkey" FOREIGN KEY ("idForaneaCriterio") REFERENCES "public"."criteriosEvalucion"("idCriterio");



ALTER TABLE ONLY "public"."permisos"
    ADD CONSTRAINT "fk_permisos_roles" FOREIGN KEY ("idForaneaRol") REFERENCES "public"."roles"("idRol") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."penalizaciones"
    ADD CONSTRAINT "penalizaciones_idForaneaCategoria_fkey" FOREIGN KEY ("idForaneaCategoria") REFERENCES "public"."categorias"("idCategoria");



ALTER TABLE ONLY "public"."penalizaciones"
    ADD CONSTRAINT "penalizaciones_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_idForaneaBanda_fkey" FOREIGN KEY ("idForaneaBanda") REFERENCES "public"."bandas"("idBanda");



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_idForaneaRol_fkey" FOREIGN KEY ("idForaneaRol") REFERENCES "public"."roles"("idRol");



ALTER TABLE ONLY "public"."perfiles"
    ADD CONSTRAINT "perfiles_idForaneaUser_fkey" FOREIGN KEY ("idForaneaUser") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."registroCumplimientoEvaluaciones"
    ADD CONSTRAINT "registroCumplimientoEvaluaciones_idForaneaBanda_fkey" FOREIGN KEY ("idForaneaBanda") REFERENCES "public"."bandas"("idBanda");



ALTER TABLE ONLY "public"."registroCumplimientoEvaluaciones"
    ADD CONSTRAINT "registroCumplimientoEvaluaciones_idForaneaCategoria_fkey" FOREIGN KEY ("idForaneaCategoria") REFERENCES "public"."categorias"("idCategoria");



ALTER TABLE ONLY "public"."registroCumplimientoEvaluaciones"
    ADD CONSTRAINT "registroCumplimientoEvaluaciones_idForaneaCriterio_fkey" FOREIGN KEY ("idForaneaCriterio") REFERENCES "public"."criteriosEvalucion"("idCriterio");



ALTER TABLE ONLY "public"."registroCumplimientoEvaluaciones"
    ADD CONSTRAINT "registroCumplimientoEvaluaciones_idForaneaCumplimiento_fkey" FOREIGN KEY ("idForaneaCumplimiento") REFERENCES "public"."cumplimientos"("idCumplimiento");



ALTER TABLE ONLY "public"."registroCumplimientoEvaluaciones"
    ADD CONSTRAINT "registroCumplimientoEvaluaciones_idForaneaEvento_fkey" FOREIGN KEY ("idForaneaEvento") REFERENCES "public"."registroEventos"("idEvento");



ALTER TABLE ONLY "public"."registroCumplimientoEvaluaciones"
    ADD CONSTRAINT "registroCumplimientoEvaluaciones_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."registroCumplimientoEvaluaciones"
    ADD CONSTRAINT "registroCumplimientoEvaluaciones_idForaneaPerfil_fkey" FOREIGN KEY ("idForaneaPerfil") REFERENCES "public"."perfiles"("idPerfil");



ALTER TABLE ONLY "public"."registroCumplimientoEvaluaciones"
    ADD CONSTRAINT "registroCumplimientoEvaluaciones_idForaneaRegion_fkey" FOREIGN KEY ("idForaneaRegion") REFERENCES "public"."regiones"("idRegion");



ALTER TABLE ONLY "public"."registroCumplimientoEvaluaciones"
    ADD CONSTRAINT "registroCumplimientoEvaluaciones_idForaneaRubrica_fkey" FOREIGN KEY ("idForaneaRubrica") REFERENCES "public"."rubricas"("idRubrica");



ALTER TABLE ONLY "public"."registroEquipoEvaluador"
    ADD CONSTRAINT "registroEquipoEvaluador_idForaneaPerfil_fkey" FOREIGN KEY ("idForaneaPerfil") REFERENCES "public"."perfiles"("idPerfil");



ALTER TABLE ONLY "public"."registroEventos"
    ADD CONSTRAINT "registroEventos_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."registroPenalizaciones"
    ADD CONSTRAINT "registroPenalizaciones_idForaneaBanda_fkey" FOREIGN KEY ("idForaneaBanda") REFERENCES "public"."bandas"("idBanda");



ALTER TABLE ONLY "public"."registroPenalizaciones"
    ADD CONSTRAINT "registroPenalizaciones_idForaneaCategoria_fkey" FOREIGN KEY ("idForaneaCategoria") REFERENCES "public"."categorias"("idCategoria");



ALTER TABLE ONLY "public"."registroPenalizaciones"
    ADD CONSTRAINT "registroPenalizaciones_idForaneaEvento_fkey" FOREIGN KEY ("idForaneaEvento") REFERENCES "public"."registroEventos"("idEvento");



ALTER TABLE ONLY "public"."registroPenalizaciones"
    ADD CONSTRAINT "registroPenalizaciones_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."registroPenalizaciones"
    ADD CONSTRAINT "registroPenalizaciones_idForaneaPenalizacion_fkey" FOREIGN KEY ("idForaneaPenalizacion") REFERENCES "public"."penalizaciones"("idPenalizacion");



ALTER TABLE ONLY "public"."registroPenalizaciones"
    ADD CONSTRAINT "registroPenalizaciones_idForaneaUser_fkey" FOREIGN KEY ("idForaneaUser") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."respuestaSolicitudRevicion"
    ADD CONSTRAINT "respuestaSolicitudRevicion_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."respuestaSolicitudRevicion"
    ADD CONSTRAINT "respuestaSolicitudRevicion_idForaneaRevisor_fkey" FOREIGN KEY ("idForaneaRevisor") REFERENCES "public"."perfiles"("idPerfil");



ALTER TABLE ONLY "public"."respuestaSolicitudRevicion"
    ADD CONSTRAINT "respuestaSolicitudRevicion_idForaneaSolicitudRevicion_fkey" FOREIGN KEY ("idForaneaSolicitudRevicion") REFERENCES "public"."solicitudRevicion"("idSolicitud");



ALTER TABLE ONLY "public"."registroComentarios"
    ADD CONSTRAINT "rgistroComentarios_idForaneaBanda_fkey" FOREIGN KEY ("idForaneaBanda") REFERENCES "public"."bandas"("idBanda");



ALTER TABLE ONLY "public"."registroComentarios"
    ADD CONSTRAINT "rgistroComentarios_idForaneaCategoria_fkey" FOREIGN KEY ("idForaneaCategoria") REFERENCES "public"."categorias"("idCategoria");



ALTER TABLE ONLY "public"."registroComentarios"
    ADD CONSTRAINT "rgistroComentarios_idForaneaEvento_fkey" FOREIGN KEY ("idForaneaEvento") REFERENCES "public"."registroEventos"("idEvento");



ALTER TABLE ONLY "public"."registroComentarios"
    ADD CONSTRAINT "rgistroComentarios_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."registroComentarios"
    ADD CONSTRAINT "rgistroComentarios_idForaneaPerfil_fkey" FOREIGN KEY ("idForaneaPerfil") REFERENCES "public"."perfiles"("idPerfil");



ALTER TABLE ONLY "public"."registroComentarios"
    ADD CONSTRAINT "rgistroComentarios_idForaneaRegion_fkey" FOREIGN KEY ("idForaneaRegion") REFERENCES "public"."regiones"("idRegion");



ALTER TABLE ONLY "public"."registroComentarios"
    ADD CONSTRAINT "rgistroComentarios_idForaneaRubrica_fkey" FOREIGN KEY ("idForaneaRubrica") REFERENCES "public"."rubricas"("idRubrica");



ALTER TABLE ONLY "public"."rolesEquipoEvaluador"
    ADD CONSTRAINT "rolesEquipoEvaluador_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."rubricas"
    ADD CONSTRAINT "rubricas_idForaneaCategoria_fkey" FOREIGN KEY ("idForaneaCategoria") REFERENCES "public"."categorias"("idCategoria");



ALTER TABLE ONLY "public"."rubricas"
    ADD CONSTRAINT "rubricas_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."solicitudRevicion"
    ADD CONSTRAINT "solicitudRevicion_idForaneaFederacion_fkey" FOREIGN KEY ("idForaneaFederacion") REFERENCES "public"."federaciones"("idFederacion");



ALTER TABLE ONLY "public"."solicitudRevicion"
    ADD CONSTRAINT "solicitudRevicion_idForaneaRegistroCumplimiento_fkey" FOREIGN KEY ("idForaneaRegistroCumplimiento") REFERENCES "public"."registroCumplimientoEvaluaciones"("idRegistroCumplimientoEvaluacion");



ALTER TABLE ONLY "public"."solicitudRevicion"
    ADD CONSTRAINT "solicitudRevicion_idForaneaSolicitanteRevicion_fkey" FOREIGN KEY ("idForaneaSolicitanteRevicion") REFERENCES "public"."perfiles"("idPerfil");



CREATE POLICY "Agregar" ON "public"."registroEquipoEvaluador" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."perfiles" "per"
  WHERE (("per"."idForaneaUser" = "auth"."uid"()) AND ("per"."idForaneaRol" = ANY (ARRAY['49ec14ca-4d56-4922-8b51-0d98d16f5b0b'::"uuid", '9ea4730e-4ad2-482b-b28a-6eed64d33554'::"uuid", 'c5a2ec89-f1b2-4809-b3e2-26c121c7de1a'::"uuid"]))))));



CREATE POLICY "agregar" ON "public"."cumplimientos" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."perfiles" "per"
  WHERE (("per"."idForaneaUser" = "auth"."uid"()) AND ("per"."idForaneaRol" = ANY (ARRAY['49ec14ca-4d56-4922-8b51-0d98d16f5b0b'::"uuid", '9ea4730e-4ad2-482b-b28a-6eed64d33554'::"uuid", 'c5a2ec89-f1b2-4809-b3e2-26c121c7de1a'::"uuid"]))))));



CREATE POLICY "agregar" ON "public"."federaciones" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."perfiles" "per"
  WHERE (("per"."idForaneaUser" = "auth"."uid"()) AND ("per"."idForaneaRol" = '9ea4730e-4ad2-482b-b28a-6eed64d33554'::"uuid")))));



CREATE POLICY "agregar" ON "public"."registroEventos" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."perfiles" "per"
  WHERE (("per"."idForaneaUser" = "auth"."uid"()) AND ("per"."idForaneaRol" = ANY (ARRAY['49ec14ca-4d56-4922-8b51-0d98d16f5b0b'::"uuid", '9ea4730e-4ad2-482b-b28a-6eed64d33554'::"uuid", 'c5a2ec89-f1b2-4809-b3e2-26c121c7de1a'::"uuid"]))))));



CREATE POLICY "agregar" ON "public"."roles" FOR INSERT WITH CHECK (false);



CREATE POLICY "agregar" ON "public"."rubricas" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."perfiles" "per"
  WHERE (("per"."idForaneaUser" = "auth"."uid"()) AND ("per"."idForaneaRol" = ANY (ARRAY['49ec14ca-4d56-4922-8b51-0d98d16f5b0b'::"uuid", '9ea4730e-4ad2-482b-b28a-6eed64d33554'::"uuid", 'c5a2ec89-f1b2-4809-b3e2-26c121c7de1a'::"uuid"]))))));



ALTER TABLE "public"."bandas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categorias" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "crear" ON "public"."bandas" FOR INSERT WITH CHECK ("public"."revisar_permisos"('bandas'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."categorias" FOR INSERT WITH CHECK ("public"."revisar_permisos"('categorias'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."criteriosEvalucion" FOR INSERT WITH CHECK ("public"."revisar_permisos"('criteriosEvalucion'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."cumplimientos" FOR INSERT WITH CHECK ("public"."revisar_permisos"('cumplimientos'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."federaciones" FOR INSERT WITH CHECK ("public"."revisar_permisos"('federaciones'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."perfiles" FOR INSERT WITH CHECK ("public"."revisar_permisos"('perfiles'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."permisos" FOR INSERT WITH CHECK ("public"."revisar_permisos"('permisos'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."regiones" FOR INSERT WITH CHECK ("public"."revisar_permisos"('regiones'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."registroComentarios" FOR INSERT WITH CHECK ("public"."revisar_permisos"('registroComentarios'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."registroCumplimientoEvaluaciones" FOR INSERT WITH CHECK ("public"."revisar_permisos"('registroCumplimientoEvaluaciones'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."registroEquipoEvaluador" FOR INSERT WITH CHECK ("public"."revisar_permisos"('registroEquipoEvaluador'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."registroEventos" FOR INSERT WITH CHECK ("public"."revisar_permisos"('registroEventos'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."respuestaSolicitudRevicion" FOR INSERT WITH CHECK ("public"."revisar_permisos"('respuestaSolicitudRevicion'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."roles" FOR INSERT WITH CHECK ("public"."revisar_permisos"('roles'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."rubricas" FOR INSERT WITH CHECK ("public"."revisar_permisos"('rubricas'::"text", 'INSERT'::"text"));



CREATE POLICY "crear" ON "public"."solicitudRevicion" FOR INSERT WITH CHECK ("public"."revisar_permisos"('solicitudRevicion'::"text", 'INSERT'::"text"));



ALTER TABLE "public"."criteriosEvalucion" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cumplimientos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "editar" ON "public"."bandas" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('bandas'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."categorias" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('categorias'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."criteriosEvalucion" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('criteriosEvalucion'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."cumplimientos" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('cumplimientos'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."federaciones" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('federaciones'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."perfiles" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('perfiles'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."permisos" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('permisos'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."regiones" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('regiones'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."registroComentarios" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('registroComentarios'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."registroCumplimientoEvaluaciones" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('registroCumplimientoEvaluaciones'::"text", 'CREATE'::"text"));



CREATE POLICY "editar" ON "public"."registroEquipoEvaluador" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('registroEquipoEvaluador'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."registroEventos" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('registroEventos'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."respuestaSolicitudRevicion" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('respuestaSolicitudRevicion'::"text", 'CREATE'::"text"));



CREATE POLICY "editar" ON "public"."roles" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('roles'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."rubricas" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('rubricas'::"text", 'UPDATE'::"text"));



CREATE POLICY "editar" ON "public"."solicitudRevicion" FOR UPDATE USING (true) WITH CHECK ("public"."revisar_permisos"('solicitudRevicion'::"text", 'UPDATE'::"text"));



CREATE POLICY "eliminar" ON "public"."bandas" FOR DELETE USING ("public"."revisar_permisos"('bandas'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."categorias" FOR DELETE USING ("public"."revisar_permisos"('categorias'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."criteriosEvalucion" FOR DELETE USING ("public"."revisar_permisos"('criteriosEvalucion'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."cumplimientos" FOR DELETE USING ("public"."revisar_permisos"('cumplimientos'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."federaciones" FOR DELETE USING ("public"."revisar_permisos"('federaciones'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."perfiles" FOR DELETE USING ("public"."revisar_permisos"('perfiles'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."permisos" FOR DELETE USING ("public"."revisar_permisos"('permisos'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."regiones" FOR DELETE USING ("public"."revisar_permisos"('regiones'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."registroComentarios" FOR DELETE USING ("public"."revisar_permisos"('registroComentarios'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."registroCumplimientoEvaluaciones" FOR SELECT USING ("public"."revisar_permisos"('registroCumplimientoEvaluaciones'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."registroEquipoEvaluador" FOR DELETE USING ("public"."revisar_permisos"('registroEquipoEvaluador'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."registroEventos" FOR DELETE USING ("public"."revisar_permisos"('registroEventos'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."respuestaSolicitudRevicion" FOR DELETE USING ("public"."revisar_permisos"('respuestaSolicitudRevicion'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."roles" FOR DELETE USING ("public"."revisar_permisos"('roles'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."rubricas" FOR DELETE USING ("public"."revisar_permisos"('rubricas'::"text", 'DELETE'::"text"));



CREATE POLICY "eliminar" ON "public"."solicitudRevicion" FOR DELETE USING ("public"."revisar_permisos"('solicitudRevicion'::"text", 'DELETE'::"text"));



ALTER TABLE "public"."federaciones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "leer" ON "public"."bandas" FOR SELECT USING ("public"."revisar_permisos"('bandas'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."categorias" FOR SELECT USING ("public"."revisar_permisos"('categorias'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."criteriosEvalucion" FOR SELECT USING ("public"."revisar_permisos"('criteriosEvalucion'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."cumplimientos" FOR SELECT USING ("public"."revisar_permisos"('cumplimientos'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."federaciones" FOR SELECT USING ("public"."revisar_permisos"('federaciones'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."penalizaciones" FOR SELECT USING (true);



CREATE POLICY "leer" ON "public"."perfiles" FOR SELECT USING ("public"."revisar_permisos"('perfiles'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."permisos" FOR SELECT USING ("public"."revisar_permisos"('permisos'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."regiones" FOR SELECT USING ("public"."revisar_permisos"('regiones'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."registroComentarios" FOR SELECT USING ("public"."revisar_permisos"('registroComentarios'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."registroCumplimientoEvaluaciones" FOR SELECT USING ("public"."revisar_permisos"('registroCumplimientoEvaluaciones'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."registroEquipoEvaluador" FOR SELECT USING ("public"."revisar_permisos"('registroEquipoEvaluador'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."registroEventos" FOR SELECT USING ("public"."revisar_permisos"('registroEventos'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."registroPenalizaciones" FOR SELECT USING (true);



CREATE POLICY "leer" ON "public"."respuestaSolicitudRevicion" FOR SELECT USING ("public"."revisar_permisos"('respuestaSolicitudRevicion'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."roles" FOR SELECT USING ("public"."revisar_permisos"('roles'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."rolesEquipoEvaluador" FOR SELECT USING (true);



CREATE POLICY "leer" ON "public"."rubricas" FOR SELECT USING ("public"."revisar_permisos"('rubricas'::"text", 'SELECT'::"text"));



CREATE POLICY "leer" ON "public"."solicitudRevicion" FOR SELECT USING ("public"."revisar_permisos"('solicitudRevicion'::"text", 'SELECT'::"text"));



ALTER TABLE "public"."penalizaciones" ENABLE ROW LEVEL SECURITY;


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


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."generar_codigo_perfil"() TO "postgres";
GRANT ALL ON FUNCTION "public"."generar_codigo_perfil"() TO "anon";
GRANT ALL ON FUNCTION "public"."generar_codigo_perfil"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generar_codigo_perfil"() TO "service_role";



GRANT ALL ON FUNCTION "public"."revisar_permisos"("target_table" "text", "target_action" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."revisar_permisos"("target_table" "text", "target_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."revisar_permisos"("target_table" "text", "target_action" "text") TO "service_role";



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



GRANT ALL ON TABLE "public"."penalizaciones" TO "anon";
GRANT ALL ON TABLE "public"."penalizaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."penalizaciones" TO "service_role";



GRANT ALL ON TABLE "public"."perfiles" TO "anon";
GRANT ALL ON TABLE "public"."perfiles" TO "authenticated";
GRANT ALL ON TABLE "public"."perfiles" TO "service_role";



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






