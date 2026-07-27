select 

"idRubrica",
"nombreRubrica",
"idRegion",
"nombreRegion",

"idBanda",
"idForaneaCategoria",
"nombreBanda",

sum(total) as total,
avg( rendimiento) rendimiento

 from (




select 
"registroEventos"."idEvento",
"registroEventos"."LugarEvento",
regiones."idRegion",
regiones."nombreRegion",

"bandas"."idBanda",
bandas."idForaneaCategoria",
bandas."nombreBanda",
rubricas."idRubrica",
rubricas."nombreRubrica",

sum("registroCumplimientoEvaluaciones"."puntosObtenidos") as total,
sum("registroCumplimientoEvaluaciones"."puntosObtenidos"/rubricas."puntosRubrica") as rendimiento


from "registroCumplimientoEvaluaciones"

join bandas
on bandas."idBanda"= "registroCumplimientoEvaluaciones"."idForaneaBanda"
join rubricas
on rubricas."idRubrica" = "registroCumplimientoEvaluaciones"."idForaneaRubrica"
JOIN "registroEventos"
ON "registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento"
join regiones
on regiones."idRegion" = "registroEventos"."idForaneaRegion"
   WHERE (
            ("registroEventos".tipo_evento = 'regional' AND "registroEventos"."idForaneaRegion" = bandas."idForaneaRegion")
            OR "registroEventos".tipo_evento = 'nacional'
          )
      AND EXTRACT(YEAR FROM "registroEventos"."fechaEvento") = EXTRACT(YEAR FROM CURRENT_DATE)
group by
"registroEventos"."idEvento",
"registroEventos"."LugarEvento",
regiones."idRegion",
regiones."nombreRegion",
rubricas."idRubrica",
rubricas."nombreRubrica",
"bandas"."idBanda",
bandas."nombreBanda",
bandas."idForaneaCategoria"
)

group by 
"idRubrica",
"nombreRubrica",
"idRegion",
"nombreRegion",

"idBanda",
"idForaneaCategoria",
"nombreBanda"