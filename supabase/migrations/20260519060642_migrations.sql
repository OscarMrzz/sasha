drop view if exists "public"."vista_resultados_temporada";

create or replace view "public"."vista_resultados_temporada" as  WITH eventos_banda AS (
         SELECT bandas."idBanda",
            bandas."nombreBanda",
            categorias."idCategoria",
            categorias."nombreCategoria",
            sum("registroCumplimientoEvaluaciones"."puntosObtenidos") AS total_evento
           FROM ((((public."registroCumplimientoEvaluaciones"
             JOIN public."registroEventos" ON (("registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento")))
             JOIN public.bandas ON ((bandas."idBanda" = "registroCumplimientoEvaluaciones"."idForaneaBanda")))
             JOIN public.regiones ON ((regiones."idRegion" = "registroEventos"."idForaneaRegion")))
             JOIN public.categorias ON ((categorias."idCategoria" = bandas."idForaneaCategoria")))
          WHERE (((("registroEventos".tipo_evento = 'regional'::text) AND ("registroEventos"."idForaneaRegion" = bandas."idForaneaRegion")) OR ("registroEventos".tipo_evento = 'nacional'::text)) AND (EXTRACT(year FROM "registroEventos"."fechaEvento") = EXTRACT(year FROM CURRENT_DATE)))
          GROUP BY "registroEventos"."idEvento", "registroEventos"."LugarEvento", regiones."idRegion", regiones."nombreRegion", "registroEventos".tipo_evento, "registroEventos"."fechaEvento", bandas."idBanda", bandas."nombreBanda", categorias."idCategoria", categorias."nombreCategoria"
        ), puntos_banda AS (
         SELECT eventos_banda."idBanda",
            eventos_banda."nombreBanda",
            eventos_banda."idCategoria",
            eventos_banda."nombreCategoria",
            sum(eventos_banda.total_evento) AS total_antes_sanciones,
            avg(eventos_banda.total_evento) AS promedio
           FROM eventos_banda
          GROUP BY eventos_banda."idBanda", eventos_banda."nombreBanda", eventos_banda."idCategoria", eventos_banda."nombreCategoria"
        ), sanciones_banda AS (
         SELECT rs.id_foranea_banda AS "idBanda",
            COALESCE(sum(s_1.puntos_sancion), (0)::numeric) AS sanciones
           FROM (public.registro_sanciones rs
             JOIN public.sanciones s_1 ON ((s_1.id_sancion = rs.id_foranea_sancion)))
          WHERE (EXTRACT(year FROM COALESCE(rs.fecha, (rs.created_at)::date)) = EXTRACT(year FROM CURRENT_DATE))
          GROUP BY rs.id_foranea_banda
        )
 SELECT p."idBanda",
    p."nombreBanda",
    p."idCategoria",
    p."nombreCategoria",
    dense_rank() OVER (PARTITION BY p."idCategoria" ORDER BY (p.total_antes_sanciones - (COALESCE(s.sanciones, (0)::numeric))::double precision) DESC) AS rankin,
    p.promedio,
    p.total_antes_sanciones,
    COALESCE(s.sanciones, (0)::numeric) AS sanciones,
    (p.total_antes_sanciones - (COALESCE(s.sanciones, (0)::numeric))::double precision) AS total_despues_sanciones
   FROM (puntos_banda p
     LEFT JOIN sanciones_banda s ON ((s."idBanda" = p."idBanda")));



  create policy "actualizar"
  on "public"."registro_sanciones"
  as permissive
  for update
  to public
using (public.revisar_permisos('registro_sanciones'::text, 'UPDATE'::text));



  create policy "crear"
  on "public"."registro_sanciones"
  as permissive
  for insert
  to public
with check (public.revisar_permisos('registro_sanciones'::text, 'INSERT'::text));



  create policy "eliminar"
  on "public"."registro_sanciones"
  as permissive
  for delete
  to public
using (public.revisar_permisos('registro_sanciones'::text, 'DELETE'::text));



  create policy "leer"
  on "public"."registro_sanciones"
  as permissive
  for select
  to public
using (public.revisar_permisos('registro_sanciones'::text, 'SELECT'::text));



  create policy "actualizar"
  on "public"."sanciones"
  as permissive
  for update
  to public
using (public.revisar_permisos('sanciones'::text, 'UPDATE'::text));



  create policy "crear"
  on "public"."sanciones"
  as permissive
  for insert
  to public
with check (public.revisar_permisos('sanciones'::text, 'INSERT'::text));



  create policy "eliminar"
  on "public"."sanciones"
  as permissive
  for delete
  to public
using (public.revisar_permisos('sanciones'::text, 'DELETE'::text));



  create policy "leer"
  on "public"."sanciones"
  as permissive
  for select
  to public
using (public.revisar_permisos('sanciones'::text, 'SELECT'::text));



