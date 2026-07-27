select 
 "registroCumplimientoEvaluaciones"."idRegistroCumplimientoEvaluacion",
"registroEventos"."idEvento",
"registroEventos"."LugarEvento",
"registroEventos"."fechaEvento",
"registroEventos".tipo_evento,
"registroEventos".tipo_lugar,

bandas."idBanda",
bandas."nombreBanda",
bandas."idForaneaCategoria",
bandas."idForaneaRegion",

categorias."nombreCategoria",
regiones."nombreRegion",

rubricas."idRubrica",
rubricas."nombreRubrica",
rubricas."datalleRubrica",
rubricas."puntosRubrica",

"criteriosEvalucion"."idCriterio",
"criteriosEvalucion"."nombreCriterio",
"criteriosEvalucion"."detallesCriterio",
"criteriosEvalucion"."puntosCriterio",

cumplimientos."idCumplimiento",
cumplimientos."detalleCumplimiento",
cumplimientos."puntosCumplimiento",

perfiles."idPerfil",
perfiles.nombre,
perfiles."primerApellido",

"registroCumplimientoEvaluaciones"."puntosObtenidos"



from "registroCumplimientoEvaluaciones"


join "registroEventos"
on "registroEventos"."idEvento" ="registroCumplimientoEvaluaciones"."idForaneaEvento"
join rubricas
on rubricas."idRubrica" ="registroCumplimientoEvaluaciones"."idForaneaRubrica"
join "criteriosEvalucion"
on "criteriosEvalucion"."idCriterio" ="registroCumplimientoEvaluaciones"."idForaneaCriterio"
join cumplimientos
on cumplimientos."idCumplimiento" = "registroCumplimientoEvaluaciones"."idForaneaCumplimiento"
join categorias
on categorias."idCategoria" = "registroCumplimientoEvaluaciones"."idForaneaCategoria"
join bandas
on bandas."idBanda" = "registroCumplimientoEvaluaciones"."idForaneaBanda"
join regiones
on regiones."idRegion" = bandas."idForaneaRegion"
join perfiles
on perfiles."idPerfil" ="registroCumplimientoEvaluaciones"."idForaneaPerfil"