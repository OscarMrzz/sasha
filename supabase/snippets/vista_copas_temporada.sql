-- Ejecutar en Supabase SQL Editor para crear la vista de ranking de copas por temporada
CREATE OR REPLACE VIEW public.vista_copas_temporada AS
WITH copas_base AS (
    SELECT
        c.lugar,
        c.id_foranea_banda AS "idBanda",
        b."nombreBanda",
        b."idForaneaCategoria",
        b."idForaneaRegion",
        cat."nombreCategoria",
        reg."nombreRegion"
    FROM public.copas c
    JOIN public."registroEventos" re ON re."idEvento" = c.id_foranea_evento
    JOIN public.bandas b ON b."idBanda" = c.id_foranea_banda
    JOIN public.categorias cat ON cat."idCategoria" = b."idForaneaCategoria"
    JOIN public.regiones reg ON reg."idRegion" = b."idForaneaRegion"
    WHERE (
        (re.tipo_evento = 'regional' AND re."idForaneaRegion" = b."idForaneaRegion")
        OR re.tipo_evento = 'nacional'
    )
    AND EXTRACT(year FROM re."fechaEvento") = EXTRACT(year FROM CURRENT_DATE)
),
max_lugar AS (
    SELECT COALESCE(MAX(lugar), 1) AS max_lugar FROM copas_base
),
copas_puntos AS (
    SELECT
        cb."idBanda",
        cb."nombreBanda",
        cb."idForaneaCategoria",
        cb."nombreCategoria",
        cb."idForaneaRegion",
        cb."nombreRegion",
        ml.max_lugar,
        COUNT(CASE WHEN cb.lugar = 1 THEN 1 END) AS copas_1,
        COUNT(CASE WHEN cb.lugar = 2 THEN 1 END) AS copas_2,
        COUNT(CASE WHEN cb.lugar = 3 THEN 1 END) AS copas_3,
        COUNT(CASE WHEN cb.lugar = 4 THEN 1 END) AS copas_4,
        COUNT(CASE WHEN cb.lugar = 5 THEN 1 END) AS copas_5,
        SUM(ml.max_lugar + 1 - cb.lugar) AS total_puntos
    FROM copas_base cb
    CROSS JOIN max_lugar ml
    GROUP BY
        cb."idBanda", cb."nombreBanda",
        cb."idForaneaCategoria", cb."nombreCategoria",
        cb."idForaneaRegion", cb."nombreRegion",
        ml.max_lugar
)
SELECT
    cp."idBanda",
    cp."nombreBanda",
    cp."idForaneaCategoria",
    cp."nombreCategoria",
    cp."idForaneaRegion",
    cp."nombreRegion",
    cp.max_lugar,
    cp.copas_1, cp.copas_2, cp.copas_3, cp.copas_4, cp.copas_5,
    cp.total_puntos,
    DENSE_RANK() OVER (
        PARTITION BY cp."idForaneaCategoria"
        ORDER BY cp.total_puntos DESC
    ) AS rankin_categoria,
    DENSE_RANK() OVER (
        PARTITION BY cp."idForaneaCategoria", cp."idForaneaRegion"
        ORDER BY cp.total_puntos DESC
    ) AS rankin_regional
FROM copas_puntos cp;
