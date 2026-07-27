alter table "public"."registroEventos" add column "estado_evento" text default 'pendiente'::text;

create or replace view "public"."vista_bandas_confirmadas" as  SELECT b."idBanda",
    b.created_at,
    b."nombreBanda",
    b."AliasBanda",
    b."idForaneaCategoria",
    b."idForaneaRegion",
    b."idForaneaFederacion",
    b."ciudadBanda",
    b."urlLogoBanda",
    b."fechaFundacionBanda",
    b."fechaInscripcionAFederacion",
    b."ubicacionSedeBanda",
    c.id_foranea_banda
   FROM (public.confirmacion_asistencia c
     JOIN public.bandas b ON ((b."idBanda" = c.id_foranea_banda)));



