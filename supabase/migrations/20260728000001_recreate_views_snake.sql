-- Recreate views after snake_case rename
BEGIN;

CREATE OR REPLACE VIEW public.vista_aplicacion_sanciones AS
 SELECT "registro_sanciones"."id_registro_sanciones",
    "registro_sanciones"."fecha" AS "fecha_aplico_sancion",
    "sanciones"."id_sancion",
    "sanciones"."detalles_sancion",
    "sanciones"."fecha_creacion_sancion",
    "sanciones"."version",
    "sanciones"."puntos_sancion",
    "bandas".id_banda,
    "bandas".nombre_banda,
    "categorias".id_categoria,
    "categorias".nombre_categoria,
    "regiones".id_region,
    "regiones".nombre_region,
    "registro_sanciones"."justificacion",
    "perfiles".id_perfil AS "id_sancionador",
    "perfiles"."nombre" AS "nombre_sancionador",
    "perfiles".primer_apellido AS "apellido_sancionador"
   FROM ((((("public"."registro_sanciones"
     JOIN "public"."sanciones" ON (("sanciones"."id_sancion" = "registro_sanciones"."id_foranea_sancion")))
     JOIN "public"."bandas" ON (("bandas".id_banda = "registro_sanciones"."id_foranea_banda")))
     JOIN "public"."perfiles" ON (("perfiles".id_perfil = "registro_sanciones"."id_foranea_perfil")))
     JOIN "public"."categorias" ON (("categorias".id_categoria = "bandas".id_foranea_categoria)))
     JOIN "public"."regiones" ON (("regiones".id_region = "bandas".id_foranea_region)));

CREATE OR REPLACE VIEW public.vista_asistencia_bandas WITH ("security_invoker"='on') AS
 SELECT registro_cumplimiento_evaluaciones.id_foranea_evento,
    registro_eventos.lugar_evento,
    "bandas".id_banda,
    "bandas"."created_at",
    "bandas".nombre_banda,
    "bandas".alias_banda,
    "bandas".id_foranea_categoria,
    "bandas".id_foranea_region,
    "bandas".id_foranea_federacion,
    "bandas".ciudad_banda,
    "bandas".url_logo_banda,
    "bandas".fecha_fundacion_banda,
    "bandas".fecha_inscripcion_a_federacion,
    "bandas".ubicacion_sede_banda
   FROM (("public".registro_cumplimiento_evaluaciones
     JOIN "public".registro_eventos ON ((registro_cumplimiento_evaluaciones.id_foranea_evento = registro_eventos.id_evento)))
     JOIN "public"."bandas" ON ((registro_cumplimiento_evaluaciones.id_foranea_banda = "bandas".id_banda)));

CREATE OR REPLACE VIEW public.vista_asistencia_eventos AS
 SELECT registro_eventos.id_evento,
    registro_eventos.lugar_evento,
    "bandas".id_banda,
    "bandas".nombre_banda
   FROM (("public".registro_cumplimiento_evaluaciones
     JOIN "public".registro_eventos ON ((registro_eventos.id_evento = registro_cumplimiento_evaluaciones.id_foranea_evento)))
     JOIN "public"."bandas" ON (("bandas".id_banda = registro_cumplimiento_evaluaciones.id_foranea_banda)))
  GROUP BY registro_eventos.id_evento, registro_eventos.lugar_evento, "bandas".id_banda, "bandas".nombre_banda;

CREATE OR REPLACE VIEW public.vista_asistencia_eventos_global AS
 SELECT nombre_banda,
    "count"(*) AS "cantidad"
   FROM ( SELECT registro_eventos.id_evento,
            "bandas".id_banda,
            "bandas".nombre_banda
           FROM ((("public".registro_cumplimiento_evaluaciones
             JOIN "public"."bandas" ON (("bandas".id_banda = registro_cumplimiento_evaluaciones.id_foranea_banda)))
             JOIN "public".registro_eventos ON ((registro_eventos.id_evento = registro_cumplimiento_evaluaciones.id_foranea_evento)))
             JOIN "public"."regiones" ON (("regiones".id_region = registro_eventos.id_foranea_region)))
          WHERE ((((registro_eventos."tipo_evento" = 'regional'::"text") AND (registro_eventos.id_foranea_region = "bandas".id_foranea_region)) OR (registro_eventos."tipo_evento" = 'nacional'::"text")) AND (EXTRACT(year FROM registro_eventos.fecha_evento) = EXTRACT(year FROM CURRENT_DATE)))
          GROUP BY registro_eventos.id_evento, "bandas".id_banda, "bandas".nombre_banda) "unnamed_subquery"
  GROUP BY nombre_banda;

CREATE OR REPLACE VIEW public.vista_bandas_confirmadas AS
 SELECT "b".id_banda,
    "b"."created_at",
    "b".nombre_banda,
    "b".alias_banda,
    "b".id_foranea_categoria,
    "b".id_foranea_region,
    "b".id_foranea_federacion,
    "b".ciudad_banda,
    "b".url_logo_banda,
    "b".fecha_fundacion_banda,
    "b".fecha_inscripcion_a_federacion,
    "b".ubicacion_sede_banda,
    "c"."id_foranea_banda"
   FROM ("public"."confirmacion_asistencia" "c"
     JOIN "public"."bandas" "b" ON (("b".id_banda = "c"."id_foranea_banda")));

CREATE OR REPLACE VIEW public.vista_bandas_evento AS
 SELECT "confirmacion_asistencia"."id_confirmacion_asistencia",
    "confirmacion_asistencia"."estado_asistencia",
    "confirmacion_asistencia"."estado_cancha",
    registro_eventos.id_evento,
    registro_eventos.lugar_evento,
    registro_eventos."estado_evento",
    "bandas".id_banda,
    "bandas".nombre_banda,
    "bandas".alias_banda,
    "categorias".id_categoria,
    "categorias".nombre_categoria,
    registro_equipo_evaluador.id_foranea_perfil,
    registro_equipo_evaluador."id_foranea_rubrica"
   FROM (((("public"."confirmacion_asistencia"
     JOIN "public".registro_eventos ON ((registro_eventos.id_evento = "confirmacion_asistencia"."id_foranea_evento")))
     JOIN "public"."bandas" ON (("bandas".id_banda = "confirmacion_asistencia"."id_foranea_banda")))
     JOIN "public"."categorias" ON (("categorias".id_categoria = "bandas".id_foranea_categoria)))
     JOIN "public".registro_equipo_evaluador ON ((registro_equipo_evaluador.id_foranea_evento = registro_eventos.id_evento)));

CREATE OR REPLACE VIEW public.vista_condensado AS
 SELECT "regiones".id_region,
    "regiones".nombre_region,
    "categorias".id_categoria,
    "categorias".nombre_categoria,
    registro_eventos.id_evento,
    registro_eventos.lugar_evento,
    "bandas".id_banda,
    "bandas".nombre_banda,
    "rubricas".id_rubrica,
    "rubricas".nombre_rubrica,
    "sum"(registro_cumplimiento_evaluaciones.puntos_obtenidos) AS "total"
   FROM ((((("public".registro_cumplimiento_evaluaciones
     JOIN "public"."rubricas" ON (("rubricas".id_rubrica = registro_cumplimiento_evaluaciones.id_foranea_rubrica)))
     JOIN "public"."bandas" ON (("bandas".id_banda = registro_cumplimiento_evaluaciones.id_foranea_banda)))
     JOIN "public"."regiones" ON (("regiones".id_region = registro_cumplimiento_evaluaciones.id_foranea_region)))
     JOIN "public"."categorias" ON (("categorias".id_categoria = registro_cumplimiento_evaluaciones.id_foranea_categoria)))
     JOIN "public".registro_eventos ON ((registro_eventos.id_evento = registro_cumplimiento_evaluaciones.id_foranea_evento)))
  GROUP BY "regiones".id_region, "regiones".nombre_region, "categorias".id_categoria, "categorias".nombre_categoria, registro_eventos.id_evento, registro_eventos.lugar_evento, "bandas".id_banda, "bandas".nombre_banda, "rubricas".id_rubrica, "rubricas".nombre_rubrica;

CREATE OR REPLACE VIEW public.vista_copas_evento AS
 SELECT "copas"."id_copas",
    "copas"."id_foranea_evento",
    registro_eventos.lugar_evento,
    registro_eventos."tipo_evento",
    registro_eventos.id_foranea_region,
    "bandas".nombre_banda,
    "bandas".id_foranea_categoria,
    "copas"."lugar",
    "copas"."tipo"
   FROM (("public"."copas"
     JOIN "public".registro_eventos ON ((registro_eventos.id_evento = "copas"."id_foranea_evento")))
     JOIN "public"."bandas" ON (("bandas".id_banda = "copas"."id_foranea_banda")))
  WHERE ((((registro_eventos."tipo_evento" = 'regional'::"text") AND (registro_eventos.id_foranea_region = "bandas".id_foranea_region)) OR (registro_eventos."tipo_evento" = 'nacional'::"text")) AND (EXTRACT(year FROM registro_eventos.fecha_evento) = EXTRACT(year FROM CURRENT_DATE)));

CREATE OR REPLACE VIEW public.vista_copas_global AS
 SELECT "lugar",
    id_banda,
    nombre_banda,
    id_foranea_rion_banda,
    id_foranea_categoria,
    "count"("lugar") AS "cantidad"
   FROM ( SELECT "copas"."id_copas",
            "copas"."id_foranea_evento",
            registro_eventos.lugar_evento,
            registro_eventos."tipo_evento",
            registro_eventos.id_foranea_region,
            "bandas".id_banda,
            "bandas".nombre_banda,
            "bandas".id_foranea_categoria,
            "bandas".id_foranea_region AS id_foranea_rion_banda,
            "copas"."lugar",
            "copas"."tipo"
           FROM (("public"."copas"
             JOIN "public".registro_eventos ON ((registro_eventos.id_evento = "copas"."id_foranea_evento")))
             JOIN "public"."bandas" ON (("bandas".id_banda = "copas"."id_foranea_banda")))
          WHERE ((((registro_eventos."tipo_evento" = 'regional'::"text") AND (registro_eventos.id_foranea_region = "bandas".id_foranea_region)) OR (registro_eventos."tipo_evento" = 'nacional'::"text")) AND (EXTRACT(year FROM registro_eventos.fecha_evento) = EXTRACT(year FROM CURRENT_DATE)))) "unnamed_subquery"
  GROUP BY "lugar", id_banda, nombre_banda, id_foranea_rion_banda, id_foranea_categoria;

CREATE OR REPLACE VIEW public.vista_copas_temporada AS
 WITH "copas_base" AS (
         SELECT "c"."lugar",
            "c"."id_foranea_banda" AS id_banda,
            "b".nombre_banda,
            "b".id_foranea_categoria,
            "b".id_foranea_region,
            "cat".nombre_categoria,
            "reg".nombre_region
           FROM (((("public"."copas" "c"
             JOIN "public".registro_eventos "re" ON (("re".id_evento = "c"."id_foranea_evento")))
             JOIN "public"."bandas" "b" ON (("b".id_banda = "c"."id_foranea_banda")))
             JOIN "public"."categorias" "cat" ON (("cat".id_categoria = "b".id_foranea_categoria)))
             JOIN "public"."regiones" "reg" ON (("reg".id_region = "b".id_foranea_region)))
          WHERE (((("re"."tipo_evento" = 'regional'::"text") AND ("re".id_foranea_region = "b".id_foranea_region)) OR ("re"."tipo_evento" = 'nacional'::"text")) AND (EXTRACT(year FROM "re".fecha_evento) = EXTRACT(year FROM CURRENT_DATE)))
        ), "max_lugar" AS (
         SELECT COALESCE("max"("copas_base"."lugar"), (1)::numeric) AS "max_lugar"
           FROM "copas_base"
        ), "copas_puntos" AS (
         SELECT "cb".id_banda,
            "cb".nombre_banda,
            "cb".id_foranea_categoria,
            "cb".nombre_categoria,
            "cb".id_foranea_region,
            "cb".nombre_region,
            "ml"."max_lugar",
            "count"(
                CASE
                    WHEN ("cb"."lugar" = (1)::numeric) THEN 1
                    ELSE NULL::integer
                END) AS "copas_1",
            "count"(
                CASE
                    WHEN ("cb"."lugar" = (2)::numeric) THEN 1
                    ELSE NULL::integer
                END) AS "copas_2",
            "count"(
                CASE
                    WHEN ("cb"."lugar" = (3)::numeric) THEN 1
                    ELSE NULL::integer
                END) AS "copas_3",
            "count"(
                CASE
                    WHEN ("cb"."lugar" = (4)::numeric) THEN 1
                    ELSE NULL::integer
                END) AS "copas_4",
            "count"(
                CASE
                    WHEN ("cb"."lugar" = (5)::numeric) THEN 1
                    ELSE NULL::integer
                END) AS "copas_5",
            "sum"((("ml"."max_lugar" + (1)::numeric) - "cb"."lugar")) AS "total_puntos"
           FROM ("copas_base" "cb"
             CROSS JOIN "max_lugar" "ml")
          GROUP BY "cb".id_banda, "cb".nombre_banda, "cb".id_foranea_categoria, "cb".nombre_categoria, "cb".id_foranea_region, "cb".nombre_region, "ml"."max_lugar"
        )
 SELECT id_banda,
    nombre_banda,
    id_foranea_categoria,
    nombre_categoria,
    id_foranea_region,
    nombre_region,
    "max_lugar",
    "copas_1",
    "copas_2",
    "copas_3",
    "copas_4",
    "copas_5",
    "total_puntos",
    "dense_rank"() OVER (PARTITION BY id_foranea_categoria ORDER BY "total_puntos" DESC) AS "rankin_categoria",
    "dense_rank"() OVER (PARTITION BY id_foranea_categoria, id_foranea_region ORDER BY "total_puntos" DESC) AS "rankin_regional"
   FROM "copas_puntos" "cp";

CREATE OR REPLACE VIEW public.vista_detalle_checkout AS
 SELECT "checkout"."id_checkout",
    "checkout"."created_at_checkout",
    "checkout"."id_foranea_banda",
    "checkout"."hora_llegada_banda",
    "checkout"."confirmacion_horallegada",
    "checkout"."time_confirmacion_hora_llegada",
    "checkout"."cantidad_integrantes",
    "checkout"."cantidad_palillonas",
    "checkout"."aportacion",
    "checkout"."hora_ingreso",
    "checkout"."confirmacion_hora_ingreso",
    "checkout"."time_confirmacion_hora_ingreso",
    "checkout"."observaciones",
    "checkout"."time_envio_confirmacion_llegada",
    "checkout"."time_envio_confirmacion_ingreso",
    "checkout"."id_foranea_diciplina",
    "checkout"."id_foranea_confirmador",
    "checkout"."id_foranea_evento",
    "bandas".nombre_banda,
    "categorias".id_categoria AS "id_foranea_categoria",
    "categorias".nombre_categoria,
    "regiones".id_region AS "id_foranea_region",
    "regiones".nombre_region,
    "disiplina"."nombre" AS "nombre_encargado_diciplina",
    "disiplina".primer_apellido AS "apellido_encargado_diciplina",
    "confirmador"."nombre" AS "nombre_confirmador",
    "confirmador".primer_apellido AS "apellido_confirmador",
    registro_eventos.lugar_evento
   FROM (((((("public"."checkout"
     JOIN "public"."bandas" ON (("bandas".id_banda = "checkout"."id_foranea_banda")))
     JOIN "public"."categorias" ON (("categorias".id_categoria = "bandas".id_foranea_categoria)))
     JOIN "public"."regiones" ON (("regiones".id_region = "bandas".id_foranea_region)))
     LEFT JOIN "public"."perfiles" "disiplina" ON (("disiplina".id_perfil = "checkout"."id_foranea_diciplina")))
     LEFT JOIN "public"."perfiles" "confirmador" ON (("confirmador".id_perfil = "checkout"."id_foranea_confirmador")))
     JOIN "public".registro_eventos ON ((registro_eventos.id_evento = "checkout"."id_foranea_evento")));

CREATE OR REPLACE VIEW public.vista_rendimiento_por_rubrica_evento_actual AS
 SELECT registro_eventos.id_evento,
    registro_eventos.lugar_evento,
    "regiones".id_region,
    "regiones".nombre_region,
    "bandas".id_banda,
    "bandas".id_foranea_categoria,
    "bandas".nombre_banda,
    "rubricas".id_rubrica,
    "rubricas".nombre_rubrica,
    "sum"(registro_cumplimiento_evaluaciones.puntos_obtenidos) AS "total",
    "sum"((registro_cumplimiento_evaluaciones.puntos_obtenidos / "rubricas".puntos_rubrica)) AS "rendimiento"
   FROM (((("public".registro_cumplimiento_evaluaciones
     JOIN "public"."bandas" ON (("bandas".id_banda = registro_cumplimiento_evaluaciones.id_foranea_banda)))
     JOIN "public"."rubricas" ON (("rubricas".id_rubrica = registro_cumplimiento_evaluaciones.id_foranea_rubrica)))
     JOIN "public".registro_eventos ON ((registro_eventos.id_evento = registro_cumplimiento_evaluaciones.id_foranea_evento)))
     JOIN "public"."regiones" ON (("regiones".id_region = registro_eventos.id_foranea_region)))
  GROUP BY registro_eventos.id_evento, registro_eventos.lugar_evento, "regiones".id_region, "regiones".nombre_region, "rubricas".id_rubrica, "rubricas".nombre_rubrica, "bandas".id_banda, "bandas".nombre_banda, "bandas".id_foranea_categoria;

CREATE OR REPLACE VIEW public.vista_rendimiento_por_rubrica_global_actual AS
 SELECT id_rubrica,
    nombre_rubrica,
    id_region,
    nombre_region,
    id_banda,
    id_foranea_categoria,
    nombre_banda,
    "sum"("total") AS "total",
    "avg"("rendimiento") AS "rendimiento"
   FROM ( SELECT registro_eventos.id_evento,
            registro_eventos.lugar_evento,
            "regiones".id_region,
            "regiones".nombre_region,
            "bandas".id_banda,
            "bandas".id_foranea_categoria,
            "bandas".nombre_banda,
            "rubricas".id_rubrica,
            "rubricas".nombre_rubrica,
            "sum"(registro_cumplimiento_evaluaciones.puntos_obtenidos) AS "total",
            "sum"((registro_cumplimiento_evaluaciones.puntos_obtenidos / "rubricas".puntos_rubrica)) AS "rendimiento"
           FROM (((("public".registro_cumplimiento_evaluaciones
             JOIN "public"."bandas" ON (("bandas".id_banda = registro_cumplimiento_evaluaciones.id_foranea_banda)))
             JOIN "public"."rubricas" ON (("rubricas".id_rubrica = registro_cumplimiento_evaluaciones.id_foranea_rubrica)))
             JOIN "public".registro_eventos ON ((registro_eventos.id_evento = registro_cumplimiento_evaluaciones.id_foranea_evento)))
             JOIN "public"."regiones" ON (("regiones".id_region = registro_eventos.id_foranea_region)))
          WHERE ((((registro_eventos."tipo_evento" = 'regional'::"text") AND (registro_eventos.id_foranea_region = "bandas".id_foranea_region)) OR (registro_eventos."tipo_evento" = 'nacional'::"text")) AND (EXTRACT(year FROM registro_eventos.fecha_evento) = EXTRACT(year FROM CURRENT_DATE)))
          GROUP BY registro_eventos.id_evento, registro_eventos.lugar_evento, "regiones".id_region, "regiones".nombre_region, "rubricas".id_rubrica, "rubricas".nombre_rubrica, "bandas".id_banda, "bandas".nombre_banda, "bandas".id_foranea_categoria) "unnamed_subquery"
  GROUP BY id_rubrica, nombre_rubrica, id_region, nombre_region, id_banda, id_foranea_categoria, nombre_banda;

CREATE OR REPLACE VIEW public.vista_resultados_eventos AS
 SELECT registro_cumplimiento_evaluaciones.id_registro_cumplimiento_evaluacion,
    registro_eventos.id_evento,
    registro_eventos.lugar_evento,
    registro_eventos.fecha_evento,
    registro_eventos."tipo_evento",
    registro_eventos."tipo_lugar",
    "bandas".id_banda,
    "bandas".nombre_banda,
    "bandas".id_foranea_categoria,
    "bandas".id_foranea_region,
    "categorias".nombre_categoria,
    "regiones".nombre_region,
    "rubricas".id_rubrica,
    "rubricas".nombre_rubrica,
    "rubricas".datalle_rubrica,
    "rubricas".puntos_rubrica,
    criterios_evaluacion.id_criterio,
    criterios_evaluacion.nombre_criterio,
    criterios_evaluacion.detalles_criterio,
    criterios_evaluacion.puntos_criterio,
    "cumplimientos".id_cumplimiento,
    "cumplimientos".detalle_cumplimiento,
    "cumplimientos".puntos_cumplimiento,
    "perfiles".id_perfil,
    "perfiles"."nombre",
    "perfiles".primer_apellido,
    registro_cumplimiento_evaluaciones.puntos_obtenidos
   FROM (((((((("public".registro_cumplimiento_evaluaciones
     JOIN "public".registro_eventos ON ((registro_eventos.id_evento = registro_cumplimiento_evaluaciones.id_foranea_evento)))
     JOIN "public"."rubricas" ON (("rubricas".id_rubrica = registro_cumplimiento_evaluaciones.id_foranea_rubrica)))
     JOIN "public".criterios_evaluacion ON ((criterios_evaluacion.id_criterio = registro_cumplimiento_evaluaciones.id_foranea_criterio)))
     JOIN "public"."cumplimientos" ON (("cumplimientos".id_cumplimiento = registro_cumplimiento_evaluaciones.id_foranea_cumplimiento)))
     JOIN "public"."categorias" ON (("categorias".id_categoria = registro_cumplimiento_evaluaciones.id_foranea_categoria)))
     JOIN "public"."bandas" ON (("bandas".id_banda = registro_cumplimiento_evaluaciones.id_foranea_banda)))
     JOIN "public"."regiones" ON (("regiones".id_region = "bandas".id_foranea_region)))
     JOIN "public"."perfiles" ON (("perfiles".id_perfil = registro_cumplimiento_evaluaciones.id_foranea_perfil)));

CREATE OR REPLACE VIEW public.vista_resultados_generales AS
 SELECT registro_eventos.id_evento,
    registro_eventos.lugar_evento,
    registro_eventos."tipo_evento",
    registro_eventos.fecha_evento,
    "regiones".id_region,
    "regiones".nombre_region,
    "bandas".id_banda,
    "bandas".nombre_banda,
    "categorias".id_categoria,
    "categorias".nombre_categoria,
    "sum"(registro_cumplimiento_evaluaciones.puntos_obtenidos) AS "total"
   FROM (((("public".registro_cumplimiento_evaluaciones
     JOIN "public".registro_eventos ON ((registro_eventos.id_evento = registro_cumplimiento_evaluaciones.id_foranea_evento)))
     JOIN "public"."bandas" ON (("bandas".id_banda = registro_cumplimiento_evaluaciones.id_foranea_banda)))
     JOIN "public"."regiones" ON (("regiones".id_region = registro_eventos.id_foranea_region)))
     JOIN "public"."categorias" ON (("categorias".id_categoria = "bandas".id_foranea_categoria)))
  GROUP BY registro_eventos.id_evento, registro_eventos.lugar_evento, "regiones".id_region, "regiones".nombre_region, registro_eventos."tipo_evento", registro_eventos.fecha_evento, "bandas".id_banda, "bandas".nombre_banda, "categorias".id_categoria, "categorias".nombre_categoria
 HAVING (((registro_eventos."tipo_evento" = 'regional'::"text") AND (registro_eventos.id_foranea_region = "bandas".id_foranea_region)) OR (registro_eventos."tipo_evento" = 'nacional'::"text"));

CREATE OR REPLACE VIEW public.vista_resultados_preliminares AS
 SELECT id_foranea_federacion,
    id_evento,
    lugar_evento,
    fecha_evento,
    anio_evento,
    id_foranea_region,
    nombre_region,
    id_foranea_banda,
    nombre_banda,
    id_foranea_categoria,
    nombre_categoria,
    "total",
    "dense_rank"() OVER (PARTITION BY id_foranea_federacion, id_evento, id_foranea_categoria ORDER BY "total" DESC) AS "rankin"
   FROM ( SELECT "rce".id_foranea_federacion,
            "re".id_evento,
            "re".lugar_evento,
            "re".fecha_evento,
            (EXTRACT(year FROM "re".fecha_evento))::integer AS anio_evento,
            "reg".id_region AS id_foranea_region,
            "reg".nombre_region,
            "b".id_banda AS id_foranea_banda,
            "b".nombre_banda,
            "rce".id_foranea_categoria,
            "cat".nombre_categoria,
            "sum"("rce".puntos_obtenidos) AS "total"
           FROM (((("public".registro_cumplimiento_evaluaciones "rce"
             JOIN "public".registro_eventos "re" ON (("re".id_evento = "rce".id_foranea_evento)))
             JOIN "public"."bandas" "b" ON (("b".id_banda = "rce".id_foranea_banda)))
             JOIN "public"."categorias" "cat" ON (("cat".id_categoria = "rce".id_foranea_categoria)))
             JOIN "public"."regiones" "reg" ON (("reg".id_region = "re".id_foranea_region)))
          GROUP BY "rce".id_foranea_federacion, "re".id_evento, "re".lugar_evento, "re".fecha_evento, "reg".id_region, "reg".nombre_region, "b".id_banda, "b".nombre_banda, "rce".id_foranea_categoria, "cat".nombre_categoria) "sub";

CREATE OR REPLACE VIEW public.vista_resultados_temporada AS
 WITH "eventos_banda" AS (
         SELECT "bandas".id_banda,
            "bandas".nombre_banda,
            "categorias".id_categoria,
            "categorias".nombre_categoria,
            "sum"(registro_cumplimiento_evaluaciones.puntos_obtenidos) AS "total_evento"
           FROM (((("public".registro_cumplimiento_evaluaciones
             JOIN "public".registro_eventos ON ((registro_eventos.id_evento = registro_cumplimiento_evaluaciones.id_foranea_evento)))
             JOIN "public"."bandas" ON (("bandas".id_banda = registro_cumplimiento_evaluaciones.id_foranea_banda)))
             JOIN "public"."regiones" ON (("regiones".id_region = registro_eventos.id_foranea_region)))
             JOIN "public"."categorias" ON (("categorias".id_categoria = "bandas".id_foranea_categoria)))
          WHERE ((((registro_eventos."tipo_evento" = 'regional'::"text") AND (registro_eventos.id_foranea_region = "bandas".id_foranea_region)) OR (registro_eventos."tipo_evento" = 'nacional'::"text")) AND (EXTRACT(year FROM registro_eventos.fecha_evento) = EXTRACT(year FROM CURRENT_DATE)))
          GROUP BY registro_eventos.id_evento, registro_eventos.lugar_evento, "regiones".id_region, "regiones".nombre_region, registro_eventos."tipo_evento", registro_eventos.fecha_evento, "bandas".id_banda, "bandas".nombre_banda, "categorias".id_categoria, "categorias".nombre_categoria
        ), "puntos_banda" AS (
         SELECT "eventos_banda".id_banda,
            "eventos_banda".nombre_banda,
            "eventos_banda".id_categoria,
            "eventos_banda".nombre_categoria,
            "sum"("eventos_banda"."total_evento") AS "total_antes_sanciones",
            "avg"("eventos_banda"."total_evento") AS "promedio"
           FROM "eventos_banda"
          GROUP BY "eventos_banda".id_banda, "eventos_banda".nombre_banda, "eventos_banda".id_categoria, "eventos_banda".nombre_categoria
        ), "sanciones_banda" AS (
         SELECT "rs"."id_foranea_banda" AS id_banda,
            COALESCE("sum"("s_1"."puntos_sancion"), (0)::numeric) AS "sanciones"
           FROM ("public"."registro_sanciones" "rs"
             JOIN "public"."sanciones" "s_1" ON (("s_1"."id_sancion" = "rs"."id_foranea_sancion")))
          WHERE (EXTRACT(year FROM COALESCE("rs"."fecha", ("rs"."created_at")::"date")) = EXTRACT(year FROM CURRENT_DATE))
          GROUP BY "rs"."id_foranea_banda"
        )
 SELECT "p".id_banda,
    "p".nombre_banda,
    "p".id_categoria,
    "p".nombre_categoria,
    "dense_rank"() OVER (PARTITION BY "p".id_categoria ORDER BY ("p"."total_antes_sanciones" - (COALESCE("s"."sanciones", (0)::numeric))::double precision) DESC) AS "rankin",
    "p"."promedio",
    "p"."total_antes_sanciones",
    COALESCE("s"."sanciones", (0)::numeric) AS "sanciones",
    ("p"."total_antes_sanciones" - (COALESCE("s"."sanciones", (0)::numeric))::double precision) AS "total_despues_sanciones"
   FROM ("puntos_banda" "p"
     LEFT JOIN "sanciones_banda" "s" ON (("s".id_banda = "p".id_banda)));

CREATE OR REPLACE VIEW public.vista_solicitud_copas AS
 SELECT "solicitud_copas"."id_solicitud_copa",
    "solicitud_copas"."created_at_solicitud_copa",
    "solicitud_copas"."justificacion_solicitud_copa",
    "solicitud_copas"."lugar_solicitud_copas",
    "solicitud_copas"."tipo_solicitud_copa",
    "solicitud_copas"."estado",
    registro_eventos.id_evento,
    registro_eventos.lugar_evento,
    registro_eventos."estado_evento",
    registro_eventos.fecha_evento,
    "bandas".id_banda,
    "bandas".nombre_banda,
    "categorias".id_categoria,
    "categorias".nombre_categoria,
    "regiones".id_region,
    "regiones".nombre_region,
    "solicitud_copas"."id_foranea_solicitante",
    "perfiles"."nombre" AS "nombre_solicitante",
    "perfiles".primer_apellido AS "apelli_solicitante"
   FROM ((((("public"."solicitud_copas"
     JOIN "public".registro_eventos ON ((registro_eventos.id_evento = "solicitud_copas"."id_foranea_evento")))
     JOIN "public"."bandas" ON (("bandas".id_banda = "solicitud_copas"."id_foranea_banda")))
     JOIN "public"."perfiles" ON (("perfiles".id_perfil = "solicitud_copas"."id_foranea_solicitante")))
     JOIN "public"."regiones" ON (("regiones".id_region = "bandas".id_foranea_region)))
     JOIN "public"."categorias" ON (("categorias".id_categoria = "bandas".id_foranea_categoria)));

CREATE OR REPLACE VIEW public.vista_solicitud_revision WITH ("security_invoker"='on') AS
 SELECT solicitud_revision.id_solicitud,
    solicitud_revision."created_at",
    solicitud_revision.id_foranea_federacion,
    solicitud_revision.id_foranea_solicitante_revision,
    solicitud_revision.id_foranea_registro_cumplimiento,
    solicitud_revision.detalles_solicitud,
    solicitud_revision."estado",
    registro_cumplimiento_evaluaciones.id_foranea_region,
    registro_cumplimiento_evaluaciones.id_foranea_categoria,
    registro_cumplimiento_evaluaciones.id_foranea_banda,
    registro_cumplimiento_evaluaciones.id_foranea_evento,
    registro_cumplimiento_evaluaciones.id_foranea_rubrica,
    registro_cumplimiento_evaluaciones.id_foranea_criterio,
    registro_cumplimiento_evaluaciones.id_foranea_cumplimiento,
    registro_cumplimiento_evaluaciones.id_foranea_perfil AS "idforaneaevaluador",
    "perfiles"."nombre" AS "nombresolicitante",
    "per"."nombre" AS "nombreevaluador",
    "regiones".nombre_region,
    "categorias".nombre_categoria,
    "bandas".nombre_banda,
    registro_eventos.lugar_evento,
    "rubricas".nombre_rubrica,
    "rubricas".datalle_rubrica,
    criterios_evaluacion.nombre_criterio,
    criterios_evaluacion.detalles_criterio,
    "cumplimientos".detalle_cumplimiento,
    "cumplimientos".puntos_cumplimiento
   FROM (((((((((("public".solicitud_revision
     JOIN "public".registro_cumplimiento_evaluaciones ON ((solicitud_revision.id_foranea_registro_cumplimiento = registro_cumplimiento_evaluaciones.id_registro_cumplimiento_evaluacion)))
     JOIN "public"."perfiles" ON ((solicitud_revision.id_foranea_solicitante_revision = "perfiles".id_perfil)))
     JOIN "public"."regiones" ON ((registro_cumplimiento_evaluaciones.id_foranea_region = "regiones".id_region)))
     JOIN "public"."categorias" ON ((registro_cumplimiento_evaluaciones.id_foranea_categoria = "categorias".id_categoria)))
     JOIN "public"."bandas" ON ((registro_cumplimiento_evaluaciones.id_foranea_banda = "bandas".id_banda)))
     JOIN "public".registro_eventos ON ((registro_cumplimiento_evaluaciones.id_foranea_evento = registro_eventos.id_evento)))
     JOIN "public"."rubricas" ON ((registro_cumplimiento_evaluaciones.id_foranea_rubrica = "rubricas".id_rubrica)))
     JOIN "public".criterios_evaluacion ON ((registro_cumplimiento_evaluaciones.id_foranea_criterio = criterios_evaluacion.id_criterio)))
     JOIN "public"."cumplimientos" ON ((registro_cumplimiento_evaluaciones.id_foranea_cumplimiento = "cumplimientos".id_cumplimiento)))
     JOIN "public"."perfiles" "per" ON ((registro_cumplimiento_evaluaciones.id_foranea_perfil = "per".id_perfil)));

CREATE OR REPLACE VIEW public.vista_solicitud_sancion AS
 SELECT "solicitar_sancion"."id_solicitud_sancion",
    "solicitar_sancion"."created_at_solicitud_sancion",
    "solicitar_sancion"."justificacion",
    "solicitar_sancion"."estado",
    "sanciones"."id_sancion",
    "sanciones"."detalles_sancion",
    "sanciones"."puntos_sancion",
    "sanciones"."version",
    "sanciones"."fecha_creacion_sancion",
    "bandas".id_banda,
    "bandas".nombre_banda,
    "categorias".id_categoria,
    "categorias".nombre_categoria,
    "regiones".id_region,
    "regiones".nombre_region
   FROM (((("public"."solicitar_sancion"
     JOIN "public"."sanciones" ON (("sanciones"."id_sancion" = "solicitar_sancion"."id_fonranea_sancion")))
     JOIN "public"."bandas" ON (("bandas".id_banda = "solicitar_sancion"."id_foranea_banda")))
     JOIN "public"."categorias" ON (("categorias".id_categoria = "bandas".id_foranea_categoria)))
     JOIN "public"."regiones" ON (("regiones".id_region = "bandas".id_foranea_region)))
  WHERE (EXTRACT(year FROM "solicitar_sancion"."created_at_solicitud_sancion") = EXTRACT(year FROM CURRENT_DATE));

CREATE OR REPLACE VIEW public.vista_usuarios_por_banda_en_evento AS
 SELECT "confirmacion_asistencia"."id_foranea_banda",
    "confirmacion_asistencia"."id_foranea_evento",
    "bandas".id_foranea_categoria AS "id_foranea_categoria",
    "perfiles".id_perfil AS "id_fonranea_perfil",
    "perfiles"."nombre",
    "perfiles".primer_apellido
   FROM (("public"."confirmacion_asistencia"
     JOIN "public"."bandas" ON (("bandas".id_banda = "confirmacion_asistencia"."id_foranea_banda")))
     JOIN "public"."perfiles" ON (("perfiles".id_foranea_banda = "bandas".id_banda)));

CREATE OR REPLACE VIEW public.vistacumplimientoscondatosampleosidforaneafederacion WITH ("security_invoker"='on') AS
 SELECT "cumplimientos".id_cumplimiento,
    "cumplimientos"."created_at",
    "cumplimientos".detalle_cumplimiento,
    "cumplimientos".puntos_cumplimiento,
    "cumplimientos".id_foranea_criterio,
    criterios_evaluacion.id_criterio,
    criterios_evaluacion.nombre_criterio,
    criterios_evaluacion.detalles_criterio,
    criterios_evaluacion.puntos_criterio,
    criterios_evaluacion.id_foranea_rubrica,
    "rubricas".id_foranea_federacion
   FROM (("public"."cumplimientos"
     JOIN "public".criterios_evaluacion ON ((criterios_evaluacion.id_criterio = "cumplimientos".id_foranea_criterio)))
     JOIN "public"."rubricas" ON (("rubricas".id_rubrica = criterios_evaluacion.id_foranea_rubrica)));

CREATE OR REPLACE VIEW public.vistacumplimientosconidforaneafederacion WITH ("security_invoker"='on') AS
 SELECT "cumplimientos".id_cumplimiento,
    "cumplimientos"."created_at",
    "cumplimientos".detalle_cumplimiento,
    "cumplimientos".puntos_cumplimiento,
    "cumplimientos".id_foranea_criterio,
    "rubricas".id_foranea_federacion
   FROM (("public"."cumplimientos"
     JOIN "public".criterios_evaluacion ON ((criterios_evaluacion.id_criterio = "cumplimientos".id_foranea_criterio)))
     JOIN "public"."rubricas" ON (("rubricas".id_rubrica = criterios_evaluacion.id_foranea_rubrica)));

COMMIT;
