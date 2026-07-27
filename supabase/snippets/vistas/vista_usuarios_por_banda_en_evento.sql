


DROP VIEW IF EXISTS vista_usuarios_por_banda_en_evento;

create view vista_usuarios_por_banda_en_evento as

select 

confirmacion_asistencia.id_foranea_banda,
confirmacion_asistencia.id_foranea_evento,
bandas."idForaneaCategoria" as id_foranea_categoria,
perfiles."idPerfil" as id_fonranea_perfil,
perfiles.nombre,
perfiles."primerApellido"

 from confirmacion_asistencia

join bandas
on bandas."idBanda" = confirmacion_asistencia.id_foranea_banda
join perfiles
on perfiles."idForaneaBanda" = bandas."idBanda"