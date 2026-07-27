
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

sum("registroCumplimientoEvaluaciones"."puntosObtenidos"),
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