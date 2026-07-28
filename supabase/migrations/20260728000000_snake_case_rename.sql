-- Migracion: camelCase -> snake_case (tablas y columnas)
-- Vistas se dropean; recreacion en 20260728000001.

BEGIN;

-- 1) Drop views
DROP VIEW IF EXISTS public."vista_aplicacion_sanciones" CASCADE;
DROP VIEW IF EXISTS public."vista_asistencia_bandas" CASCADE;
DROP VIEW IF EXISTS public."vista_asistencia_eventos" CASCADE;
DROP VIEW IF EXISTS public."vista_asistencia_eventos_global" CASCADE;
DROP VIEW IF EXISTS public."vista_bandas_confirmadas" CASCADE;
DROP VIEW IF EXISTS public."vista_bandas_evento" CASCADE;
DROP VIEW IF EXISTS public."vista_condensado" CASCADE;
DROP VIEW IF EXISTS public."vista_copas_evento" CASCADE;
DROP VIEW IF EXISTS public."vista_copas_global" CASCADE;
DROP VIEW IF EXISTS public."vista_copas_temporada" CASCADE;
DROP VIEW IF EXISTS public."vista_detalle_checkout" CASCADE;
DROP VIEW IF EXISTS public."vista_rendimiento_por_rubrica_evento_actual" CASCADE;
DROP VIEW IF EXISTS public."vista_rendimiento_por_rubrica_global_actual" CASCADE;
DROP VIEW IF EXISTS public."vista_resultados_eventos" CASCADE;
DROP VIEW IF EXISTS public."vista_resultados_generales" CASCADE;
DROP VIEW IF EXISTS public."vista_resultados_preliminares" CASCADE;
DROP VIEW IF EXISTS public."vista_resultados_temporada" CASCADE;
DROP VIEW IF EXISTS public."vista_solicitud_copas" CASCADE;
DROP VIEW IF EXISTS public."vista_solicitud_revicion" CASCADE;
DROP VIEW IF EXISTS public."vista_solicitud_sancion" CASCADE;
DROP VIEW IF EXISTS public."vista_usuarios_por_banda_en_evento" CASCADE;
DROP VIEW IF EXISTS public."vistacumplimientoscondatosampleosidforaneafederacion" CASCADE;
DROP VIEW IF EXISTS public."vistacumplimientosconidforaneafederacion" CASCADE;

-- 2) Rename columns (antes de renombrar tablas)
-- bandas
ALTER TABLE public."bandas" RENAME COLUMN "idBanda" TO id_banda;
ALTER TABLE public."bandas" RENAME COLUMN "nombreBanda" TO nombre_banda;
ALTER TABLE public."bandas" RENAME COLUMN "AliasBanda" TO alias_banda;
ALTER TABLE public."bandas" RENAME COLUMN "idForaneaCategoria" TO id_foranea_categoria;
ALTER TABLE public."bandas" RENAME COLUMN "idForaneaRegion" TO id_foranea_region;
ALTER TABLE public."bandas" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;
ALTER TABLE public."bandas" RENAME COLUMN "ciudadBanda" TO ciudad_banda;
ALTER TABLE public."bandas" RENAME COLUMN "urlLogoBanda" TO url_logo_banda;
ALTER TABLE public."bandas" RENAME COLUMN "fechaFundacionBanda" TO fecha_fundacion_banda;
ALTER TABLE public."bandas" RENAME COLUMN "fechaInscripcionAFederacion" TO fecha_inscripcion_a_federacion;
ALTER TABLE public."bandas" RENAME COLUMN "ubicacionSedeBanda" TO ubicacion_sede_banda;

-- categorias
ALTER TABLE public."categorias" RENAME COLUMN "idCategoria" TO id_categoria;
ALTER TABLE public."categorias" RENAME COLUMN "nombreCategoria" TO nombre_categoria;
ALTER TABLE public."categorias" RENAME COLUMN "detallesCategoria" TO detalles_categoria;
ALTER TABLE public."categorias" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;

-- criteriosEvalucion
ALTER TABLE public."criteriosEvalucion" RENAME COLUMN "idCriterio" TO id_criterio;
ALTER TABLE public."criteriosEvalucion" RENAME COLUMN "nombreCriterio" TO nombre_criterio;
ALTER TABLE public."criteriosEvalucion" RENAME COLUMN "detallesCriterio" TO detalles_criterio;
ALTER TABLE public."criteriosEvalucion" RENAME COLUMN "puntosCriterio" TO puntos_criterio;
ALTER TABLE public."criteriosEvalucion" RENAME COLUMN "idForaneaRubrica" TO id_foranea_rubrica;

-- cumplimientos
ALTER TABLE public."cumplimientos" RENAME COLUMN "idCumplimiento" TO id_cumplimiento;
ALTER TABLE public."cumplimientos" RENAME COLUMN "detalleCumplimiento" TO detalle_cumplimiento;
ALTER TABLE public."cumplimientos" RENAME COLUMN "puntosCumplimiento" TO puntos_cumplimiento;
ALTER TABLE public."cumplimientos" RENAME COLUMN "idForaneaCriterio" TO id_foranea_criterio;

-- federaciones
ALTER TABLE public."federaciones" RENAME COLUMN "idFederacion" TO id_federacion;
ALTER TABLE public."federaciones" RENAME COLUMN "nombreFederacion" TO nombre_federacion;

-- penalizaciones
ALTER TABLE public."penalizaciones" RENAME COLUMN "idPenalizacion" TO id_penalizacion;
ALTER TABLE public."penalizaciones" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;
ALTER TABLE public."penalizaciones" RENAME COLUMN "idForaneaCategoria" TO id_foranea_categoria;
ALTER TABLE public."penalizaciones" RENAME COLUMN "nombrePenalizacion" TO nombre_penalizacion;
ALTER TABLE public."penalizaciones" RENAME COLUMN "detallesPenalizacion" TO detalles_penalizacion;
ALTER TABLE public."penalizaciones" RENAME COLUMN "puntosPenalizacion" TO puntos_penalizacion;

-- perfiles
ALTER TABLE public."perfiles" RENAME COLUMN "idPerfil" TO id_perfil;
ALTER TABLE public."perfiles" RENAME COLUMN "fechaNacimiento" TO fecha_nacimiento;
ALTER TABLE public."perfiles" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;
ALTER TABLE public."perfiles" RENAME COLUMN "numeroTelefono" TO numero_telefono;
ALTER TABLE public."perfiles" RENAME COLUMN "idForaneaUser" TO id_foranea_user;
ALTER TABLE public."perfiles" RENAME COLUMN "segundoNombre" TO segundo_nombre;
ALTER TABLE public."perfiles" RENAME COLUMN "primerApellido" TO primer_apellido;
ALTER TABLE public."perfiles" RENAME COLUMN "segundoApellido" TO segundo_apellido;
ALTER TABLE public."perfiles" RENAME COLUMN "idForaneaBanda" TO id_foranea_banda;
ALTER TABLE public."perfiles" RENAME COLUMN "idForaneaRol" TO id_foranea_rol;
ALTER TABLE public."perfiles" RENAME COLUMN "urlFotoPerfil" TO url_foto_perfil;

-- permisos
ALTER TABLE public."permisos" RENAME COLUMN "idPermiso" TO id_permiso;
ALTER TABLE public."permisos" RENAME COLUMN "idForaneaRol" TO id_foranea_rol;

-- regiones
ALTER TABLE public."regiones" RENAME COLUMN "idRegion" TO id_region;
ALTER TABLE public."regiones" RENAME COLUMN "nombreRegion" TO nombre_region;
ALTER TABLE public."regiones" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;

-- registroComentarios
ALTER TABLE public."registroComentarios" RENAME COLUMN "idRegistroComentario" TO id_registro_comentario;
ALTER TABLE public."registroComentarios" RENAME COLUMN "idForaneaEvento" TO id_foranea_evento;
ALTER TABLE public."registroComentarios" RENAME COLUMN "idForaneaBanda" TO id_foranea_banda;
ALTER TABLE public."registroComentarios" RENAME COLUMN "idForaneaCategoria" TO id_foranea_categoria;
ALTER TABLE public."registroComentarios" RENAME COLUMN "idForaneaRegion" TO id_foranea_region;
ALTER TABLE public."registroComentarios" RENAME COLUMN "idForaneaPerfil" TO id_foranea_perfil;
ALTER TABLE public."registroComentarios" RENAME COLUMN "idForaneaRubrica" TO id_foranea_rubrica;
ALTER TABLE public."registroComentarios" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;

-- registroCumplimientoEvaluaciones
ALTER TABLE public."registroCumplimientoEvaluaciones" RENAME COLUMN "idRegistroCumplimientoEvaluacion" TO id_registro_cumplimiento_evaluacion;
ALTER TABLE public."registroCumplimientoEvaluaciones" RENAME COLUMN "idForaneaEvento" TO id_foranea_evento;
ALTER TABLE public."registroCumplimientoEvaluaciones" RENAME COLUMN "idForaneaBanda" TO id_foranea_banda;
ALTER TABLE public."registroCumplimientoEvaluaciones" RENAME COLUMN "idForaneaCriterio" TO id_foranea_criterio;
ALTER TABLE public."registroCumplimientoEvaluaciones" RENAME COLUMN "idForaneaCumplimiento" TO id_foranea_cumplimiento;
ALTER TABLE public."registroCumplimientoEvaluaciones" RENAME COLUMN "idForaneaCategoria" TO id_foranea_categoria;
ALTER TABLE public."registroCumplimientoEvaluaciones" RENAME COLUMN "idForaneaRegion" TO id_foranea_region;
ALTER TABLE public."registroCumplimientoEvaluaciones" RENAME COLUMN "puntosObtenidos" TO puntos_obtenidos;
ALTER TABLE public."registroCumplimientoEvaluaciones" RENAME COLUMN "idForaneaPerfil" TO id_foranea_perfil;
ALTER TABLE public."registroCumplimientoEvaluaciones" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;
ALTER TABLE public."registroCumplimientoEvaluaciones" RENAME COLUMN "idForaneaRubrica" TO id_foranea_rubrica;

-- registroEquipoEvaluador
ALTER TABLE public."registroEquipoEvaluador" RENAME COLUMN "idRegistroEvaluador" TO id_registro_evaluador;
ALTER TABLE public."registroEquipoEvaluador" RENAME COLUMN "idForaneaEvento" TO id_foranea_evento;
ALTER TABLE public."registroEquipoEvaluador" RENAME COLUMN "idForaneaPerfil" TO id_foranea_perfil;

-- registroEventos
ALTER TABLE public."registroEventos" RENAME COLUMN "idEvento" TO id_evento;
ALTER TABLE public."registroEventos" RENAME COLUMN "LugarEvento" TO lugar_evento;
ALTER TABLE public."registroEventos" RENAME COLUMN "fechaEvento" TO fecha_evento;
ALTER TABLE public."registroEventos" RENAME COLUMN "idForaneaRegion" TO id_foranea_region;
ALTER TABLE public."registroEventos" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;

-- registroPenalizaciones
ALTER TABLE public."registroPenalizaciones" RENAME COLUMN "idRegistroPenalizacion" TO id_registro_penalizacion;
ALTER TABLE public."registroPenalizaciones" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;
ALTER TABLE public."registroPenalizaciones" RENAME COLUMN "idForaneaEvento" TO id_foranea_evento;
ALTER TABLE public."registroPenalizaciones" RENAME COLUMN "idForaneaCategoria" TO id_foranea_categoria;
ALTER TABLE public."registroPenalizaciones" RENAME COLUMN "idForaneaBanda" TO id_foranea_banda;
ALTER TABLE public."registroPenalizaciones" RENAME COLUMN "idForaneaUser" TO id_foranea_user;
ALTER TABLE public."registroPenalizaciones" RENAME COLUMN "idForaneaPenalizacion" TO id_foranea_penalizacion;
ALTER TABLE public."registroPenalizaciones" RENAME COLUMN "puntosPenalizacion" TO puntos_penalizacion;

-- respuestaSolicitudRevicion
ALTER TABLE public."respuestaSolicitudRevicion" RENAME COLUMN "idRespuesta" TO id_respuesta;
ALTER TABLE public."respuestaSolicitudRevicion" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;
ALTER TABLE public."respuestaSolicitudRevicion" RENAME COLUMN "idForaneaSolicitudRevicion" TO id_foranea_solicitud_revision;
ALTER TABLE public."respuestaSolicitudRevicion" RENAME COLUMN "idForaneaRevisor" TO id_foranea_revisor;
ALTER TABLE public."respuestaSolicitudRevicion" RENAME COLUMN "detallesRespuesta" TO detalles_respuesta;

-- roles
ALTER TABLE public."roles" RENAME COLUMN "idRol" TO id_rol;
ALTER TABLE public."roles" RENAME COLUMN "nombreRol" TO nombre_rol;
ALTER TABLE public."roles" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;
ALTER TABLE public."roles" RENAME COLUMN "estadoRol" TO estado_rol;

-- rolesEquipoEvaluador
ALTER TABLE public."rolesEquipoEvaluador" RENAME COLUMN "idRol" TO id_rol;
ALTER TABLE public."rolesEquipoEvaluador" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;
ALTER TABLE public."rolesEquipoEvaluador" RENAME COLUMN "nombreRol" TO nombre_rol;
ALTER TABLE public."rolesEquipoEvaluador" RENAME COLUMN "DetallesRol" TO detalles_rol;

-- rubricas
ALTER TABLE public."rubricas" RENAME COLUMN "idRubrica" TO id_rubrica;
ALTER TABLE public."rubricas" RENAME COLUMN "nombreRubrica" TO nombre_rubrica;
ALTER TABLE public."rubricas" RENAME COLUMN "datalleRubrica" TO datalle_rubrica;
ALTER TABLE public."rubricas" RENAME COLUMN "puntosRubrica" TO puntos_rubrica;
ALTER TABLE public."rubricas" RENAME COLUMN "idForaneaCategoria" TO id_foranea_categoria;
ALTER TABLE public."rubricas" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;
ALTER TABLE public."rubricas" RENAME COLUMN "versionRubrica" TO version_rubrica;

-- solicitudRevicion
ALTER TABLE public."solicitudRevicion" RENAME COLUMN "idSolicitud" TO id_solicitud;
ALTER TABLE public."solicitudRevicion" RENAME COLUMN "idForaneaRegistroCumplimiento" TO id_foranea_registro_cumplimiento;
ALTER TABLE public."solicitudRevicion" RENAME COLUMN "idForaneaFederacion" TO id_foranea_federacion;
ALTER TABLE public."solicitudRevicion" RENAME COLUMN "idForaneaSolicitanteRevicion" TO id_foranea_solicitante_revision;
ALTER TABLE public."solicitudRevicion" RENAME COLUMN "detallesSolicitud" TO detalles_solicitud;

-- 3) Rename tables camelCase â†’ snake_case
ALTER TABLE public."criteriosEvalucion" RENAME TO criterios_evaluacion;
ALTER TABLE public."registroComentarios" RENAME TO registro_comentarios;
ALTER TABLE public."registroCumplimientoEvaluaciones" RENAME TO registro_cumplimiento_evaluaciones;
ALTER TABLE public."registroEquipoEvaluador" RENAME TO registro_equipo_evaluador;
ALTER TABLE public."registroEventos" RENAME TO registro_eventos;
ALTER TABLE public."registroPenalizaciones" RENAME TO registro_penalizaciones;
ALTER TABLE public."respuestaSolicitudRevicion" RENAME TO respuesta_solicitud_revision;
ALTER TABLE public."rolesEquipoEvaluador" RENAME TO roles_equipo_evaluador;
ALTER TABLE public."solicitudRevicion" RENAME TO solicitud_revision;

COMMIT;
