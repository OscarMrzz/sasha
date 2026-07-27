
DROP VIEW IF EXISTS vista_detalle_checkout;

create view vista_detalle_checkout as


select 
checkout.* ,

bandas."nombreBanda",
categorias."idCategoria"  as id_foranea_categoria,
categorias."nombreCategoria",
regiones."idRegion" as id_foranea_region,
regiones."nombreRegion",

disiplina.nombre as nombre_encargado_diciplina,
disiplina."primerApellido" as apellido_encargado_diciplina,

confirmador.nombre as nombre_confirmador,
confirmador."primerApellido" as apellido_confirmador,

"registroEventos"."LugarEvento"





from checkout

join bandas
on bandas."idBanda"= checkout.id_foranea_banda
join categorias
on categorias."idCategoria" = bandas."idForaneaCategoria"
join regiones
on regiones."idRegion" = bandas."idForaneaRegion"

left join perfiles disiplina
on disiplina."idPerfil" = checkout.id_foranea_diciplina
left join perfiles confirmador
on confirmador."idPerfil" = checkout.id_foranea_confirmador
join "registroEventos"
on "registroEventos"."idEvento" = checkout.id_foranea_evento


