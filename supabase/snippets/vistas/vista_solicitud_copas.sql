DROP VIEW IF EXISTS vista_solicitud_copas;

create view vista_solicitud_copas as

select 

solicitud_copas.id_solicitud_copa,
solicitud_copas.created_at_solicitud_copa,
solicitud_copas.justificacion_solicitud_copa,
solicitud_copas.lugar_solicitud_copas,
solicitud_copas.tipo_solicitud_copa,
solicitud_copas.estado,

"registroEventos"."idEvento",
"registroEventos"."LugarEvento",
"registroEventos"."estado_evento",
"registroEventos"."fechaEvento",
"registroEventos".estado_evento,
"registroEventos"."fechaEvento",

bandas."idBanda",
bandas."nombreBanda",

categorias."idCategoria",
categorias."nombreCategoria",

regiones."idRegion",
regiones."nombreRegion",

solicitud_copas.id_foranea_solicitante,
perfiles.nombre as nombre_solicitante,
perfiles."primerApellido" as apelli_solicitante

 from solicitud_copas

join "registroEventos"
on "registroEventos"."idEvento" = solicitud_copas.id_foranea_evento
join bandas
on bandas."idBanda" = solicitud_copas.id_foranea_banda
join perfiles
on perfiles."idPerfil"= solicitud_copas.id_foranea_solicitante
join regiones
on regiones."idRegion" = bandas."idForaneaRegion"
join categorias
on categorias."idCategoria" = bandas."idForaneaCategoria"
