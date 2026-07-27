



select 
"registroEventos"."idEvento",
"registroEventos"."LugarEvento",
"registroEventos".tipo_evento,
"registroEventos"."fechaEvento",

regiones."idRegion",
regiones."nombreRegion",
bandas."idBanda",
bandas."nombreBanda",
categorias."idCategoria",
categorias."nombreCategoria",

bandas."idForaneaCategoria",

sum("registroCumplimientoEvaluaciones"."puntosObtenidos" ) as total


from "registroCumplimientoEvaluaciones"
join "registroEventos"
on "registroEventos"."idEvento"="registroCumplimientoEvaluaciones"."idForaneaEvento"
join bandas
on bandas."idBanda" ="registroCumplimientoEvaluaciones"."idForaneaBanda"
join regiones
on regiones."idRegion" = "registroEventos"."idForaneaRegion"
join categorias
on categorias."idCategoria" = bandas."idForaneaCategoria"

group by 
"registroEventos"."idEvento",
"registroEventos"."LugarEvento",
regiones."idRegion",
regiones."nombreRegion",
"registroEventos".tipo_evento,
"registroEventos"."fechaEvento",
bandas."idBanda",bandas."nombreBanda",
categorias."idCategoria",
categorias."nombreCategoria"

HAVING ("registroEventos".tipo_evento ='regional' and "registroEventos"."idForaneaRegion" = bandas."idForaneaRegion" )or "registroEventos".tipo_evento ='nacional'
