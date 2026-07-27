drop policy "editar" on "public"."registroCumplimientoEvaluaciones";

drop policy "eliminar" on "public"."registroCumplimientoEvaluaciones";

drop policy "editar" on "public"."respuestaSolicitudRevicion";

create or replace view "public"."vista_copas_temporada" as  WITH copas_base AS (
         SELECT c.lugar,
            c.id_foranea_banda AS "idBanda",
            b."nombreBanda",
            b."idForaneaCategoria",
            b."idForaneaRegion",
            cat."nombreCategoria",
            reg."nombreRegion"
           FROM ((((public.copas c
             JOIN public."registroEventos" re ON ((re."idEvento" = c.id_foranea_evento)))
             JOIN public.bandas b ON ((b."idBanda" = c.id_foranea_banda)))
             JOIN public.categorias cat ON ((cat."idCategoria" = b."idForaneaCategoria")))
             JOIN public.regiones reg ON ((reg."idRegion" = b."idForaneaRegion")))
          WHERE ((((re.tipo_evento = 'regional'::text) AND (re."idForaneaRegion" = b."idForaneaRegion")) OR (re.tipo_evento = 'nacional'::text)) AND (EXTRACT(year FROM re."fechaEvento") = EXTRACT(year FROM CURRENT_DATE)))
        ), max_lugar AS (
         SELECT COALESCE(max(copas_base.lugar), (1)::numeric) AS max_lugar
           FROM copas_base
        ), copas_puntos AS (
         SELECT cb."idBanda",
            cb."nombreBanda",
            cb."idForaneaCategoria",
            cb."nombreCategoria",
            cb."idForaneaRegion",
            cb."nombreRegion",
            ml.max_lugar,
            count(
                CASE
                    WHEN (cb.lugar = (1)::numeric) THEN 1
                    ELSE NULL::integer
                END) AS copas_1,
            count(
                CASE
                    WHEN (cb.lugar = (2)::numeric) THEN 1
                    ELSE NULL::integer
                END) AS copas_2,
            count(
                CASE
                    WHEN (cb.lugar = (3)::numeric) THEN 1
                    ELSE NULL::integer
                END) AS copas_3,
            count(
                CASE
                    WHEN (cb.lugar = (4)::numeric) THEN 1
                    ELSE NULL::integer
                END) AS copas_4,
            count(
                CASE
                    WHEN (cb.lugar = (5)::numeric) THEN 1
                    ELSE NULL::integer
                END) AS copas_5,
            sum(((ml.max_lugar + (1)::numeric) - cb.lugar)) AS total_puntos
           FROM (copas_base cb
             CROSS JOIN max_lugar ml)
          GROUP BY cb."idBanda", cb."nombreBanda", cb."idForaneaCategoria", cb."nombreCategoria", cb."idForaneaRegion", cb."nombreRegion", ml.max_lugar
        )
 SELECT "idBanda",
    "nombreBanda",
    "idForaneaCategoria",
    "nombreCategoria",
    "idForaneaRegion",
    "nombreRegion",
    max_lugar,
    copas_1,
    copas_2,
    copas_3,
    copas_4,
    copas_5,
    total_puntos,
    dense_rank() OVER (PARTITION BY "idForaneaCategoria" ORDER BY total_puntos DESC) AS rankin_categoria,
    dense_rank() OVER (PARTITION BY "idForaneaCategoria", "idForaneaRegion" ORDER BY total_puntos DESC) AS rankin_regional
   FROM copas_puntos cp;


create or replace view "public"."vista_resultados_preliminares" as  SELECT "idForaneaFederacion",
    "idEvento",
    "LugarEvento",
    "fechaEvento",
    "anioEvento",
    "idForaneaRegion",
    "nombreRegion",
    "idForaneaBanda",
    "nombreBanda",
    "idForaneaCategoria",
    "nombreCategoria",
    total,
    dense_rank() OVER (PARTITION BY "idForaneaFederacion", "idEvento", "idForaneaCategoria" ORDER BY total DESC) AS rankin
   FROM ( SELECT rce."idForaneaFederacion",
            re."idEvento",
            re."LugarEvento",
            re."fechaEvento",
            (EXTRACT(year FROM re."fechaEvento"))::integer AS "anioEvento",
            reg."idRegion" AS "idForaneaRegion",
            reg."nombreRegion",
            b."idBanda" AS "idForaneaBanda",
            b."nombreBanda",
            rce."idForaneaCategoria",
            cat."nombreCategoria",
            sum(rce."puntosObtenidos") AS total
           FROM ((((public."registroCumplimientoEvaluaciones" rce
             JOIN public."registroEventos" re ON ((re."idEvento" = rce."idForaneaEvento")))
             JOIN public.bandas b ON ((b."idBanda" = rce."idForaneaBanda")))
             JOIN public.categorias cat ON ((cat."idCategoria" = rce."idForaneaCategoria")))
             JOIN public.regiones reg ON ((reg."idRegion" = re."idForaneaRegion")))
          GROUP BY rce."idForaneaFederacion", re."idEvento", re."LugarEvento", re."fechaEvento", reg."idRegion", reg."nombreRegion", b."idBanda", b."nombreBanda", rce."idForaneaCategoria", cat."nombreCategoria") sub;



  create policy "crear"
  on "public"."copas"
  as permissive
  for insert
  to public
with check (public.revisar_permisos('copas'::text, 'INSERT'::text));



  create policy "editar"
  on "public"."copas"
  as permissive
  for update
  to public
using (public.revisar_permisos('copas'::text, 'UPDATE'::text))
with check (public.revisar_permisos('copas'::text, 'UPDATE'::text));



  create policy "eliminar"
  on "public"."copas"
  as permissive
  for delete
  to public
using (public.revisar_permisos('copas'::text, 'DELETE'::text));



  create policy "leer"
  on "public"."copas"
  as permissive
  for select
  to public
using (public.revisar_permisos('copas'::text, 'SELECT'::text));



  create policy "editar"
  on "public"."registroCumplimientoEvaluaciones"
  as permissive
  for update
  to public
using (true)
with check (public.revisar_permisos('registroCumplimientoEvaluaciones'::text, 'UPDATE'::text));



  create policy "eliminar"
  on "public"."registroCumplimientoEvaluaciones"
  as permissive
  for delete
  to public
using (public.revisar_permisos('registroCumplimientoEvaluaciones'::text, 'DELETE'::text));



  create policy "editar"
  on "public"."respuestaSolicitudRevicion"
  as permissive
  for update
  to public
using (true)
with check (public.revisar_permisos('respuestaSolicitudRevicion'::text, 'UPDATE'::text));



