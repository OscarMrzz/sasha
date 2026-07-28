DROP VIEW IF EXISTS vista_solicitud_sancion;

create view vista_solicitud_sancion as


select 
solicitar_sancion.id_solicitud_sancion,
solicitar_sancion.created_at_solicitud_sancion,
solicitar_sancion.justificacion,
solicitar_sancion.estado,

sanciones.id_sancion,
sanciones.detalles_sancion,
sanciones.puntos_sancion,
sanciones.version,
sanciones.fecha_creacion_sancion,

bandas."idBanda",
bandas."nombreBanda",

categorias."idCategoria",
categorias."nombreCategoria",


regiones."idRegion",
regiones."nombreRegion"





 from solicitar_sancion

join sanciones
on sanciones.id_sancion = solicitar_sancion.id_fonranea_sancion
join bandas
on bandas."idBanda"= solicitar_sancion.id_foranea_banda
join categorias
on categorias."idCategoria" = bandas."idForaneaCategoria"
join regiones
on regiones."idRegion" = bandas."idForaneaRegion"

WHERE EXTRACT(YEAR FROM solicitar_sancion.created_at_solicitud_sancion) = EXTRACT(YEAR FROM CURRENT_DATE);