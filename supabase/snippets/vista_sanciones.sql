select 
registro_sanciones.id_registro_sanciones,
registro_sanciones.fecha as fecha_aplico_sancion,

sanciones.id_sancion,
sanciones.detalles_sancion,
sanciones.fecha_creacion_sancion,
sanciones.version,
sanciones.puntos_sancion,

bandas."idBanda",
bandas."nombreBanda",

categorias."idCategoria",
categorias."nombreCategoria",

regiones."idRegion",
regiones."nombreRegion",

registro_sanciones.justificacion,

perfiles."idPerfil" as id_sancionador,
perfiles.nombre as nombre_sancionador,
perfiles."primerApellido" as apellido_sancionador




from registro_sanciones

join sanciones
on sanciones.id_sancion = registro_sanciones.id_foranea_sancion
join bandas
on bandas."idBanda"= registro_sanciones.id_foranea_banda
join perfiles
on perfiles."idPerfil" = registro_sanciones.id_foranea_perfil
join categorias
on categorias."idCategoria" = bandas."idForaneaCategoria"
join regiones
on regiones."idRegion" = bandas."idForaneaRegion"