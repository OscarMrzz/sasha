-- Drop dependent views first (temporada → eventos → generales)
drop view if exists "public"."vista_resultados_temporada";

drop view if exists "public"."vista_resultados_eventos";

drop view if exists "public"."vista_resultados_generales";


  create table "public"."copas" (
    "id_copas" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "id_foranea_evento" uuid,
    "id_foranea_banda" uuid,
    "lugar" numeric,
    "tipo" text
      );


alter table "public"."copas" enable row level security;

alter table "public"."registroEventos" add column "dimensiones_cancha" text;

alter table "public"."registroEventos" add column "tipo_evento" text;

alter table "public"."registroEventos" add column "tipo_lugar" text;

CREATE UNIQUE INDEX copas_pkey ON public.copas USING btree (id_copas);

alter table "public"."copas" add constraint "copas_pkey" PRIMARY KEY using index "copas_pkey";

alter table "public"."copas" add constraint "copas_id_foranea_banda_fkey" FOREIGN KEY (id_foranea_banda) REFERENCES public.bandas("idBanda") not valid;

alter table "public"."copas" validate constraint "copas_id_foranea_banda_fkey";

alter table "public"."copas" add constraint "copas_id_foranea_evento_fkey" FOREIGN KEY (id_foranea_evento) REFERENCES public."registroEventos"("idEvento") not valid;

alter table "public"."copas" validate constraint "copas_id_foranea_evento_fkey";

create or replace view "public"."vista_asistencia_eventos" as  SELECT "registroEventos"."idEvento",
    "registroEventos"."LugarEvento",
    bandas."idBanda",
    bandas."nombreBanda"
   FROM ((public."registroCumplimientoEvaluaciones"
     JOIN public."registroEventos" ON (("registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento")))
     JOIN public.bandas ON ((bandas."idBanda" = "registroCumplimientoEvaluaciones"."idForaneaBanda")))
  GROUP BY "registroEventos"."idEvento", "registroEventos"."LugarEvento", bandas."idBanda", bandas."nombreBanda";


create or replace view "public"."vista_asistencia_eventos_global" as  SELECT "nombreBanda",
    count(*) AS cantidad
   FROM ( SELECT "registroEventos"."idEvento",
            bandas."idBanda",
            bandas."nombreBanda"
           FROM (((public."registroCumplimientoEvaluaciones"
             JOIN public.bandas ON ((bandas."idBanda" = "registroCumplimientoEvaluaciones"."idForaneaBanda")))
             JOIN public."registroEventos" ON (("registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento")))
             JOIN public.regiones ON ((regiones."idRegion" = "registroEventos"."idForaneaRegion")))
          WHERE (((("registroEventos".tipo_evento = 'regional'::text) AND ("registroEventos"."idForaneaRegion" = bandas."idForaneaRegion")) OR ("registroEventos".tipo_evento = 'nacional'::text)) AND (EXTRACT(year FROM "registroEventos"."fechaEvento") = EXTRACT(year FROM CURRENT_DATE)))
          GROUP BY "registroEventos"."idEvento", bandas."idBanda", bandas."nombreBanda") unnamed_subquery
  GROUP BY "nombreBanda";


create or replace view "public"."vista_copas_evento" as  SELECT copas.id_copas,
    copas.id_foranea_evento,
    "registroEventos"."LugarEvento",
    "registroEventos".tipo_evento,
    "registroEventos"."idForaneaRegion",
    bandas."nombreBanda",
    bandas."idForaneaCategoria",
    copas.lugar,
    copas.tipo
   FROM ((public.copas
     JOIN public."registroEventos" ON (("registroEventos"."idEvento" = copas.id_foranea_evento)))
     JOIN public.bandas ON ((bandas."idBanda" = copas.id_foranea_banda)))
  WHERE (((("registroEventos".tipo_evento = 'regional'::text) AND ("registroEventos"."idForaneaRegion" = bandas."idForaneaRegion")) OR ("registroEventos".tipo_evento = 'nacional'::text)) AND (EXTRACT(year FROM "registroEventos"."fechaEvento") = EXTRACT(year FROM CURRENT_DATE)));


create or replace view "public"."vista_copas_global" as  SELECT lugar,
    "idBanda",
    "nombreBanda",
    "idForaneaRionBanda",
    "idForaneaCategoria",
    count(lugar) AS cantidad
   FROM ( SELECT copas.id_copas,
            copas.id_foranea_evento,
            "registroEventos"."LugarEvento",
            "registroEventos".tipo_evento,
            "registroEventos"."idForaneaRegion",
            bandas."idBanda",
            bandas."nombreBanda",
            bandas."idForaneaCategoria",
            bandas."idForaneaRegion" AS "idForaneaRionBanda",
            copas.lugar,
            copas.tipo
           FROM ((public.copas
             JOIN public."registroEventos" ON (("registroEventos"."idEvento" = copas.id_foranea_evento)))
             JOIN public.bandas ON ((bandas."idBanda" = copas.id_foranea_banda)))
          WHERE (((("registroEventos".tipo_evento = 'regional'::text) AND ("registroEventos"."idForaneaRegion" = bandas."idForaneaRegion")) OR ("registroEventos".tipo_evento = 'nacional'::text)) AND (EXTRACT(year FROM "registroEventos"."fechaEvento") = EXTRACT(year FROM CURRENT_DATE)))) unnamed_subquery
  GROUP BY lugar, "idBanda", "nombreBanda", "idForaneaRionBanda", "idForaneaCategoria";


create or replace view "public"."vista_rendimiento_por_rubrica_evento_actual" as  SELECT "registroEventos"."idEvento",
    "registroEventos"."LugarEvento",
    regiones."idRegion",
    regiones."nombreRegion",
    bandas."idBanda",
    bandas."idForaneaCategoria",
    bandas."nombreBanda",
    rubricas."idRubrica",
    rubricas."nombreRubrica",
    sum("registroCumplimientoEvaluaciones"."puntosObtenidos") AS total,
    sum(("registroCumplimientoEvaluaciones"."puntosObtenidos" / rubricas."puntosRubrica")) AS rendimiento
   FROM ((((public."registroCumplimientoEvaluaciones"
     JOIN public.bandas ON ((bandas."idBanda" = "registroCumplimientoEvaluaciones"."idForaneaBanda")))
     JOIN public.rubricas ON ((rubricas."idRubrica" = "registroCumplimientoEvaluaciones"."idForaneaRubrica")))
     JOIN public."registroEventos" ON (("registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento")))
     JOIN public.regiones ON ((regiones."idRegion" = "registroEventos"."idForaneaRegion")))
  GROUP BY "registroEventos"."idEvento", "registroEventos"."LugarEvento", regiones."idRegion", regiones."nombreRegion", rubricas."idRubrica", rubricas."nombreRubrica", bandas."idBanda", bandas."nombreBanda", bandas."idForaneaCategoria";


create or replace view "public"."vista_rendimiento_por_rubrica_global_actual" as  SELECT "idRubrica",
    "nombreRubrica",
    "idRegion",
    "nombreRegion",
    "idBanda",
    "idForaneaCategoria",
    "nombreBanda",
    sum(total) AS total,
    avg(rendimiento) AS rendimiento
   FROM ( SELECT "registroEventos"."idEvento",
            "registroEventos"."LugarEvento",
            regiones."idRegion",
            regiones."nombreRegion",
            bandas."idBanda",
            bandas."idForaneaCategoria",
            bandas."nombreBanda",
            rubricas."idRubrica",
            rubricas."nombreRubrica",
            sum("registroCumplimientoEvaluaciones"."puntosObtenidos") AS total,
            sum(("registroCumplimientoEvaluaciones"."puntosObtenidos" / rubricas."puntosRubrica")) AS rendimiento
           FROM ((((public."registroCumplimientoEvaluaciones"
             JOIN public.bandas ON ((bandas."idBanda" = "registroCumplimientoEvaluaciones"."idForaneaBanda")))
             JOIN public.rubricas ON ((rubricas."idRubrica" = "registroCumplimientoEvaluaciones"."idForaneaRubrica")))
             JOIN public."registroEventos" ON (("registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento")))
             JOIN public.regiones ON ((regiones."idRegion" = "registroEventos"."idForaneaRegion")))
          WHERE (((("registroEventos".tipo_evento = 'regional'::text) AND ("registroEventos"."idForaneaRegion" = bandas."idForaneaRegion")) OR ("registroEventos".tipo_evento = 'nacional'::text)) AND (EXTRACT(year FROM "registroEventos"."fechaEvento") = EXTRACT(year FROM CURRENT_DATE)))
          GROUP BY "registroEventos"."idEvento", "registroEventos"."LugarEvento", regiones."idRegion", regiones."nombreRegion", rubricas."idRubrica", rubricas."nombreRubrica", bandas."idBanda", bandas."nombreBanda", bandas."idForaneaCategoria") unnamed_subquery
  GROUP BY "idRubrica", "nombreRubrica", "idRegion", "nombreRegion", "idBanda", "idForaneaCategoria", "nombreBanda";


create or replace view "public"."vista_resultados_eventos" as  SELECT "registroCumplimientoEvaluaciones"."idRegistroCumplimientoEvaluacion",
    "registroEventos"."idEvento",
    "registroEventos"."LugarEvento",
    "registroEventos"."fechaEvento",
    "registroEventos".tipo_evento,
    "registroEventos".tipo_lugar,
    bandas."idBanda",
    bandas."nombreBanda",
    bandas."idForaneaCategoria",
    bandas."idForaneaRegion",
    categorias."nombreCategoria",
    regiones."nombreRegion",
    rubricas."idRubrica",
    rubricas."nombreRubrica",
    rubricas."datalleRubrica",
    rubricas."puntosRubrica",
    "criteriosEvalucion"."idCriterio",
    "criteriosEvalucion"."nombreCriterio",
    "criteriosEvalucion"."detallesCriterio",
    "criteriosEvalucion"."puntosCriterio",
    cumplimientos."idCumplimiento",
    cumplimientos."detalleCumplimiento",
    cumplimientos."puntosCumplimiento",
    perfiles."idPerfil",
    perfiles.nombre,
    perfiles."primerApellido",
    "registroCumplimientoEvaluaciones"."puntosObtenidos"
   FROM ((((((((public."registroCumplimientoEvaluaciones"
     JOIN public."registroEventos" ON (("registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento")))
     JOIN public.rubricas ON ((rubricas."idRubrica" = "registroCumplimientoEvaluaciones"."idForaneaRubrica")))
     JOIN public."criteriosEvalucion" ON (("criteriosEvalucion"."idCriterio" = "registroCumplimientoEvaluaciones"."idForaneaCriterio")))
     JOIN public.cumplimientos ON ((cumplimientos."idCumplimiento" = "registroCumplimientoEvaluaciones"."idForaneaCumplimiento")))
     JOIN public.categorias ON ((categorias."idCategoria" = "registroCumplimientoEvaluaciones"."idForaneaCategoria")))
     JOIN public.bandas ON ((bandas."idBanda" = "registroCumplimientoEvaluaciones"."idForaneaBanda")))
     JOIN public.regiones ON ((regiones."idRegion" = bandas."idForaneaRegion")))
     JOIN public.perfiles ON ((perfiles."idPerfil" = "registroCumplimientoEvaluaciones"."idForaneaPerfil")));


create or replace view "public"."vista_resultados_generales" as  SELECT "registroEventos"."idEvento",
    "registroEventos"."LugarEvento",
    "registroEventos".tipo_evento,
    "registroEventos"."fechaEvento",
    regiones."idRegion",
    regiones."nombreRegion",
    bandas."idBanda",
    bandas."nombreBanda",
    categorias."idCategoria",
    categorias."nombreCategoria",
    sum("registroCumplimientoEvaluaciones"."puntosObtenidos") AS total
   FROM ((((public."registroCumplimientoEvaluaciones"
     JOIN public."registroEventos" ON (("registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento")))
     JOIN public.bandas ON ((bandas."idBanda" = "registroCumplimientoEvaluaciones"."idForaneaBanda")))
     JOIN public.regiones ON ((regiones."idRegion" = "registroEventos"."idForaneaRegion")))
     JOIN public.categorias ON ((categorias."idCategoria" = bandas."idForaneaCategoria")))
  GROUP BY "registroEventos"."idEvento", "registroEventos"."LugarEvento", regiones."idRegion", regiones."nombreRegion", "registroEventos".tipo_evento, "registroEventos"."fechaEvento", bandas."idBanda", bandas."nombreBanda", categorias."idCategoria", categorias."nombreCategoria"
 HAVING ((("registroEventos".tipo_evento = 'regional'::text) AND ("registroEventos"."idForaneaRegion" = bandas."idForaneaRegion")) OR ("registroEventos".tipo_evento = 'nacional'::text));


create or replace view "public"."vista_resultados_temporada" as  SELECT "idBanda",
    "nombreBanda",
    "idCategoria",
    "nombreCategoria",
    dense_rank() OVER (PARTITION BY "idCategoria" ORDER BY (sum(total)) DESC) AS rankin,
    avg(total) AS promedio,
    sum(total) AS total
   FROM ( SELECT "registroEventos"."idEvento",
            "registroEventos"."LugarEvento",
            "registroEventos".tipo_evento,
            "registroEventos"."fechaEvento",
            regiones."idRegion",
            regiones."nombreRegion",
            bandas."idBanda",
            bandas."nombreBanda",
            categorias."idCategoria",
            categorias."nombreCategoria",
            sum("registroCumplimientoEvaluaciones"."puntosObtenidos") AS total
           FROM ((((public."registroCumplimientoEvaluaciones"
             JOIN public."registroEventos" ON (("registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento")))
             JOIN public.bandas ON ((bandas."idBanda" = "registroCumplimientoEvaluaciones"."idForaneaBanda")))
             JOIN public.regiones ON ((regiones."idRegion" = "registroEventos"."idForaneaRegion")))
             JOIN public.categorias ON ((categorias."idCategoria" = bandas."idForaneaCategoria")))
          WHERE (((("registroEventos".tipo_evento = 'regional'::text) AND ("registroEventos"."idForaneaRegion" = bandas."idForaneaRegion")) OR ("registroEventos".tipo_evento = 'nacional'::text)) AND (EXTRACT(year FROM "registroEventos"."fechaEvento") = EXTRACT(year FROM CURRENT_DATE)))
          GROUP BY "registroEventos"."idEvento", "registroEventos"."LugarEvento", regiones."idRegion", regiones."nombreRegion", "registroEventos".tipo_evento, "registroEventos"."fechaEvento", bandas."idBanda", bandas."nombreBanda", categorias."idCategoria", categorias."nombreCategoria") subconsulta
  GROUP BY "idBanda", "nombreBanda", "idCategoria", "nombreCategoria";


grant delete on table "public"."copas" to "anon";

grant insert on table "public"."copas" to "anon";

grant references on table "public"."copas" to "anon";

grant select on table "public"."copas" to "anon";

grant trigger on table "public"."copas" to "anon";

grant truncate on table "public"."copas" to "anon";

grant update on table "public"."copas" to "anon";

grant delete on table "public"."copas" to "authenticated";

grant insert on table "public"."copas" to "authenticated";

grant references on table "public"."copas" to "authenticated";

grant select on table "public"."copas" to "authenticated";

grant trigger on table "public"."copas" to "authenticated";

grant truncate on table "public"."copas" to "authenticated";

grant update on table "public"."copas" to "authenticated";

grant delete on table "public"."copas" to "postgres";

grant insert on table "public"."copas" to "postgres";

grant references on table "public"."copas" to "postgres";

grant select on table "public"."copas" to "postgres";

grant trigger on table "public"."copas" to "postgres";

grant truncate on table "public"."copas" to "postgres";

grant update on table "public"."copas" to "postgres";

grant delete on table "public"."copas" to "service_role";

grant insert on table "public"."copas" to "service_role";

grant references on table "public"."copas" to "service_role";

grant select on table "public"."copas" to "service_role";

grant trigger on table "public"."copas" to "service_role";

grant truncate on table "public"."copas" to "service_role";

grant update on table "public"."copas" to "service_role";


