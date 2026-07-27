
DROP VIEW IF EXISTS vista_bandas_evento;

create view vista_bandas_evento as


select 
confirmacion_asistencia.id_confirmacion_asistencia,
confirmacion_asistencia.estado_asistencia, 
confirmacion_asistencia.estado_cancha,

"registroEventos"."idEvento",
"registroEventos"."LugarEvento",
"registroEventos".estado_evento,

bandas."idBanda",
bandas."nombreBanda",
bandas."AliasBanda",


categorias."idCategoria",
categorias."nombreCategoria",

"registroEquipoEvaluador"."idForaneaPerfil",
"registroEquipoEvaluador".id_foranea_rubrica



from confirmacion_asistencia

join "registroEventos"
on "registroEventos"."idEvento" = confirmacion_asistencia.id_foranea_evento
join bandas
on bandas."idBanda" =confirmacion_asistencia.id_foranea_banda
join categorias
on categorias."idCategoria" = bandas."idForaneaCategoria"

join "registroEquipoEvaluador"
on "registroEquipoEvaluador"."idForaneaEvento" = "registroEventos"."idEvento"






