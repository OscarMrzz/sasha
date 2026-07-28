CREATE OR REPLACE VIEW "public"."vista_resultados_preliminares"
WITH (security_invoker = on) AS
SELECT
  "idForaneaFederacion",
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
  DENSE_RANK() OVER (
    PARTITION BY "idForaneaFederacion", "idEvento", "idForaneaCategoria"
    ORDER BY total DESC
  ) AS rankin
FROM (
  SELECT
    rce."idForaneaFederacion",
    re."idEvento",
    re."LugarEvento",
    re."fechaEvento",
    EXTRACT(YEAR FROM re."fechaEvento")::int AS "anioEvento",
    reg."idRegion"          AS "idForaneaRegion",
    reg."nombreRegion",
    b."idBanda"             AS "idForaneaBanda",
    b."nombreBanda",
    rce."idForaneaCategoria",
    cat."nombreCategoria",
    SUM(rce."puntosObtenidos") AS total
  FROM      "public"."registroCumplimientoEvaluaciones" rce
  JOIN      "public"."registroEventos" re  ON re."idEvento"     = rce."idForaneaEvento"
  JOIN      "public"."bandas"          b   ON b."idBanda"       = rce."idForaneaBanda"
  JOIN      "public"."categorias"      cat ON cat."idCategoria" = rce."idForaneaCategoria"
  JOIN      "public"."regiones"        reg ON reg."idRegion"    = re."idForaneaRegion"
  GROUP BY
    rce."idForaneaFederacion",
    re."idEvento",
    re."LugarEvento",
    re."fechaEvento",
    reg."idRegion",
    reg."nombreRegion",
    b."idBanda",
    b."nombreBanda",
    rce."idForaneaCategoria",
    cat."nombreCategoria"
) sub;

GRANT SELECT ON "public"."vista_resultados_preliminares" TO anon, authenticated, service_role;