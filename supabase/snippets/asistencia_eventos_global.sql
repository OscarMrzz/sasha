

select "nombreBanda", count(*) as cantidad  from (



select "registroEventos"."idEvento", bandas."idBanda", bandas."nombreBanda" from "registroCumplimientoEvaluaciones"

join bandas
on bandas."idBanda"= "registroCumplimientoEvaluaciones"."idForaneaBanda"

JOIN "registroEventos"
ON "registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento"
join regiones
on regiones."idRegion" = "registroEventos"."idForaneaRegion"

   WHERE (
            ("registroEventos".tipo_evento = 'regional' AND "registroEventos"."idForaneaRegion" = bandas."idForaneaRegion")
            OR "registroEventos".tipo_evento = 'nacional'
          )
      AND EXTRACT(YEAR FROM "registroEventos"."fechaEvento") = EXTRACT(YEAR FROM CURRENT_DATE)

group by  "registroEventos"."idEvento", bandas."idBanda", bandas."nombreBanda"


)

group by "nombreBanda"