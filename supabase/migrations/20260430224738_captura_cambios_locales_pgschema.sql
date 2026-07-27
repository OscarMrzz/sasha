-- HAS_UNTRACKABLE_DEPENDENCIES: Dependencies, i.e. other functions used in the function body, of non-sql functions cannot be tracked. As a result, we cannot guarantee that function dependencies are ordered properly relative to this statement. For adds, this means you need to ensure that all functions this function depends on are created/altered before this statement.
CREATE OR REPLACE FUNCTION public.generar_codigo_perfil()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
$function$
;

ALTER TABLE "public"."perfiles" ADD COLUMN "codigo" text COLLATE "pg_catalog"."default" NOT NULL;

ALTER TABLE "public"."perfiles" ADD COLUMN "estado" text COLLATE "pg_catalog"."default" DEFAULT 'activo'::text;

CREATE TRIGGER tg_generar_codigo_perfil BEFORE INSERT ON public.perfiles FOR EACH ROW EXECUTE FUNCTION generar_codigo_perfil();

