DROP VIEW IF EXISTS vista_condensado;

create view vista_condensado as


select 

regiones."idRegion",
regiones."nombreRegion",

categorias."idCategoria",
categorias."nombreCategoria",

"registroEventos"."idEvento",
"registroEventos"."LugarEvento",

bandas."idBanda",
bandas."nombreBanda",

rubricas."idRubrica",
rubricas."nombreRubrica",

sum("registroCumplimientoEvaluaciones"."puntosObtenidos") as total




 from "registroCumplimientoEvaluaciones"

join rubricas
on rubricas."idRubrica" = "registroCumplimientoEvaluaciones"."idForaneaRubrica"
join bandas
on bandas."idBanda" ="registroCumplimientoEvaluaciones"."idForaneaBanda"
join regiones
on regiones."idRegion"= "registroCumplimientoEvaluaciones"."idForaneaRegion"
join categorias
on categorias."idCategoria" = "registroCumplimientoEvaluaciones"."idForaneaCategoria"
join "registroEventos"
on "registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento"

group by

regiones."idRegion",
regiones."nombreRegion",

categorias."idCategoria",
categorias."nombreCategoria",

"registroEventos"."idEvento",
"registroEventos"."LugarEvento",

bandas."idBanda",
bandas."nombreBanda",

rubricas."idRubrica",
rubricas."nombreRubrica";

GRANT SELECT ON public.vista_condensado TO anon, authenticated, service_role;