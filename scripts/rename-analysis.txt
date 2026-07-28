=== TABLES ===
bandas -> bandas
categorias -> categorias
checkout -> checkout
confirmacion_asistencia -> confirmacion_asistencia
copas -> copas
criteriosEvalucion -> criterios_evaluacion
cumplimientos -> cumplimientos
escuadras -> escuadras
federaciones -> federaciones
penalizaciones -> penalizaciones
perfiles -> perfiles
permisos -> permisos
premio_escuadra -> premio_escuadra
premios_escuadra -> premios_escuadra
regiones -> regiones
registroComentarios -> registro_comentarios
registroCumplimientoEvaluaciones -> registro_cumplimiento_evaluaciones
registroEquipoEvaluador -> registro_equipo_evaluador
registroEventos -> registro_eventos
registroPenalizaciones -> registro_penalizaciones
registro_sanciones -> registro_sanciones
respuestaSolicitudRevicion -> respuesta_solicitud_revision
roles -> roles
rolesEquipoEvaluador -> roles_equipo_evaluador
rubricas -> rubricas
sanciones -> sanciones
solicitar_sancion -> solicitar_sancion
solicitudRevicion -> solicitud_revision
solicitud_copas -> solicitud_copas

=== COLUMNS NEEDING RENAME ===

# bandas
  idBanda -> id_banda
  nombreBanda -> nombre_banda
  AliasBanda -> alias_banda
  idForaneaCategoria -> id_foranea_categoria
  idForaneaRegion -> id_foranea_region
  idForaneaFederacion -> id_foranea_federacion
  ciudadBanda -> ciudad_banda
  urlLogoBanda -> url_logo_banda
  fechaFundacionBanda -> fecha_fundacion_banda
  fechaInscripcionAFederacion -> fecha_inscripcion_a_federacion
  ubicacionSedeBanda -> ubicacion_sede_banda

# categorias
  idCategoria -> id_categoria
  nombreCategoria -> nombre_categoria
  detallesCategoria -> detalles_categoria
  idForaneaFederacion -> id_foranea_federacion

# criteriosEvalucion
  idCriterio -> id_criterio
  nombreCriterio -> nombre_criterio
  detallesCriterio -> detalles_criterio
  puntosCriterio -> puntos_criterio
  idForaneaRubrica -> id_foranea_rubrica

# cumplimientos
  idCumplimiento -> id_cumplimiento
  detalleCumplimiento -> detalle_cumplimiento
  puntosCumplimiento -> puntos_cumplimiento
  idForaneaCriterio -> id_foranea_criterio

# federaciones
  idFederacion -> id_federacion
  nombreFederacion -> nombre_federacion

# penalizaciones
  idPenalizacion -> id_penalizacion
  idForaneaFederacion -> id_foranea_federacion
  idForaneaCategoria -> id_foranea_categoria
  nombrePenalizacion -> nombre_penalizacion
  detallesPenalizacion -> detalles_penalizacion
  puntosPenalizacion -> puntos_penalizacion

# perfiles
  idPerfil -> id_perfil
  fechaNacimiento -> fecha_nacimiento
  idForaneaFederacion -> id_foranea_federacion
  numeroTelefono -> numero_telefono
  idForaneaUser -> id_foranea_user
  segundoNombre -> segundo_nombre
  primerApellido -> primer_apellido
  segundoApellido -> segundo_apellido
  idForaneaBanda -> id_foranea_banda
  idForaneaRol -> id_foranea_rol
  urlFotoPerfil -> url_foto_perfil

# permisos
  idPermiso -> id_permiso
  idForaneaRol -> id_foranea_rol

# regiones
  idRegion -> id_region
  nombreRegion -> nombre_region
  idForaneaFederacion -> id_foranea_federacion

# registroComentarios
  idRegistroComentario -> id_registro_comentario
  idForaneaEvento -> id_foranea_evento
  idForaneaBanda -> id_foranea_banda
  idForaneaCategoria -> id_foranea_categoria
  idForaneaRegion -> id_foranea_region
  idForaneaPerfil -> id_foranea_perfil
  idForaneaRubrica -> id_foranea_rubrica
  idForaneaFederacion -> id_foranea_federacion

# registroCumplimientoEvaluaciones
  idRegistroCumplimientoEvaluacion -> id_registro_cumplimiento_evaluacion
  idForaneaEvento -> id_foranea_evento
  idForaneaBanda -> id_foranea_banda
  idForaneaCriterio -> id_foranea_criterio
  idForaneaCumplimiento -> id_foranea_cumplimiento
  idForaneaCategoria -> id_foranea_categoria
  idForaneaRegion -> id_foranea_region
  puntosObtenidos -> puntos_obtenidos
  idForaneaPerfil -> id_foranea_perfil
  idForaneaFederacion -> id_foranea_federacion
  idForaneaRubrica -> id_foranea_rubrica

# registroEquipoEvaluador
  idRegistroEvaluador -> id_registro_evaluador
  idForaneaEvento -> id_foranea_evento
  idForaneaPerfil -> id_foranea_perfil

# registroEventos
  idEvento -> id_evento
  LugarEvento -> lugar_evento
  fechaEvento -> fecha_evento
  idForaneaRegion -> id_foranea_region
  idForaneaFederacion -> id_foranea_federacion

# registroPenalizaciones
  idRegistroPenalizacion -> id_registro_penalizacion
  idForaneaFederacion -> id_foranea_federacion
  idForaneaEvento -> id_foranea_evento
  idForaneaCategoria -> id_foranea_categoria
  idForaneaBanda -> id_foranea_banda
  idForaneaUser -> id_foranea_user
  idForaneaPenalizacion -> id_foranea_penalizacion
  puntosPenalizacion -> puntos_penalizacion

# respuestaSolicitudRevicion
  idRespuesta -> id_respuesta
  idForaneaFederacion -> id_foranea_federacion
  idForaneaSolicitudRevicion -> id_foranea_solicitud_revicion
  idForaneaRevisor -> id_foranea_revisor
  detallesRespuesta -> detalles_respuesta

# roles
  idRol -> id_rol
  nombreRol -> nombre_rol
  idForaneaFederacion -> id_foranea_federacion
  estadoRol -> estado_rol

# rolesEquipoEvaluador
  idRol -> id_rol
  idForaneaFederacion -> id_foranea_federacion
  nombreRol -> nombre_rol
  DetallesRol -> detalles_rol

# rubricas
  idRubrica -> id_rubrica
  nombreRubrica -> nombre_rubrica
  datalleRubrica -> datalle_rubrica
  puntosRubrica -> puntos_rubrica
  idForaneaCategoria -> id_foranea_categoria
  idForaneaFederacion -> id_foranea_federacion
  versionRubrica -> version_rubrica

# solicitudRevicion
  idSolicitud -> id_solicitud
  idForaneaRegistroCumplimiento -> id_foranea_registro_cumplimiento
  idForaneaFederacion -> id_foranea_federacion
  idForaneaSolicitanteRevicion -> id_foranea_solicitante_revicion
  detallesSolicitud -> detalles_solicitud

=== VIEWS ===
vista_aplicacion_sanciones
vista_asistencia_bandas
vista_asistencia_eventos
vista_asistencia_eventos_global
vista_bandas_confirmadas
vista_bandas_evento
vista_condensado
vista_copas_evento
vista_copas_global
vista_copas_temporada
vista_detalle_checkout
vista_rendimiento_por_rubrica_evento_actual
vista_rendimiento_por_rubrica_global_actual
vista_resultados_eventos
vista_resultados_generales
vista_resultados_preliminares
vista_resultados_temporada
vista_solicitud_copas
vista_solicitud_revicion
vista_solicitud_sancion
vista_usuarios_por_banda_en_evento
vistacumplimientoscondatosampleosidforaneafederacion
vistacumplimientosconidforaneafederacion
