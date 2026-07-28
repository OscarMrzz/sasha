
select 

"registroEventos"."idEvento",
"registroEventos"."LugarEvento",
bandas."idBanda",
bandas."nombreBanda"


 from "registroCumplimientoEvaluaciones"

join "registroEventos"
on "registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento"
join bandas 
on bandas."idBanda" ="registroCumplimientoEvaluaciones"."idForaneaBanda"


group by
"registroEventos"."idEvento",
"registroEventos"."LugarEvento",
bandas."idBanda",
bandas."nombreBanda"