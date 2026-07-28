-- Políticas de permisos (public.permisos) + RLS checkout completo
-- Permisos (public.permisos) sincronizados con supabase/seed.sql (líneas 223-1272).
-- Ejecutar en el SQL Editor de Supabase (o psql) — UN SOLO ARCHIVO, de arriba a abajo.
-- Orden recomendado: 1) supabase/snippets/datos/datos_prueba.sql  2) este archivo.
-- Incluye al final: revisar_permisos (normaliza snake_case/camelCase), RLS (sanciones, copas,
-- checkout con confirmador por banda), storage y parches idempotentes de disciplina/dirigente.
-- Permisos public.permisos: mismas filas que supabase/seed.sql (bloque developer → solicitud_copas).
-- Resuelve roles en la federación SASHA-DEV (misma lógica que datos_prueba.sql).
-- Idempotente: no duplica permisos si ya existe la misma combinación rol + tabla + acción.

DO $$
DECLARE
    id_federacion UUID;
    idRolDeveloper UUID;
    idRolAdmin UUID;
    idRolAdminTemporal UUID;
    idRolJurado UUID;
    idRolFiscal UUID;
    idRolDirigente UUID;
    idRolLiderbanda UUID;
    idRolResponsableBandas UUID;
    idRolResponsableRubricas UUID;
    idRolResponsableUsuarios UUID;
    idRolResponsableEventos UUID;
    idRolResponsableMesa UUID;
    idRolSecretaria UUID;
    idRolComiteDisciplina UUID;
BEGIN
    SELECT f.id_federacion INTO id_federacion
    FROM public.federaciones f
    WHERE f.nombre_federacion = 'SASHA-DEV'
    LIMIT 1;

    IF id_federacion IS NULL THEN
        RAISE EXCEPTION 'No existe la federación SASHA-DEV. Ejecuta primero supabase/snippets/datos/datos_prueba.sql.';
    END IF;

    SELECT id_rol INTO idRolDeveloper FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'developer' LIMIT 1;
    SELECT id_rol INTO idRolAdmin FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'admin' LIMIT 1;
    SELECT id_rol INTO idRolAdminTemporal FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'admin temporal' LIMIT 1;
    SELECT id_rol INTO idRolJurado FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'jurado' LIMIT 1;
    SELECT id_rol INTO idRolFiscal FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'fiscal' LIMIT 1;
    SELECT id_rol INTO idRolDirigente FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'dirigente' LIMIT 1;
    SELECT id_rol INTO idRolLiderbanda FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'lider de banda' LIMIT 1;
    SELECT id_rol INTO idRolResponsableBandas FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'responsable de bandas' LIMIT 1;
    SELECT id_rol INTO idRolResponsableRubricas FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'responsable de rubricas' LIMIT 1;
    SELECT id_rol INTO idRolResponsableUsuarios FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'responsable de usuarios' LIMIT 1;
    SELECT id_rol INTO idRolResponsableEventos FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'responsable de eventos' LIMIT 1;
    SELECT id_rol INTO idRolResponsableMesa FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'responsable de mesa' LIMIT 1;
    SELECT id_rol INTO idRolSecretaria FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'secretaria' LIMIT 1;
    SELECT id_rol INTO idRolComiteDisciplina FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'comite de disciplina' LIMIT 1;

    IF idRolDeveloper IS NULL OR idRolAdmin IS NULL THEN
        RAISE EXCEPTION 'Se requieren roles developer y admin en SASHA-DEV antes de cargar permisos. Ejecuta datos_prueba.sql primero.';
    END IF;

    INSERT INTO public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
    SELECT gen_random_uuid(), now(), v.id_foranea_rol, v.tabla, v.accion
    FROM (
        VALUES

        /* ======================================================================== */
        /* developer */
        /* 01 Bandas */

        (gen_random_uuid(), now(), idRolDeveloper,'bandas','SELECT'),

        /* 02 Categorias */

        (gen_random_uuid(), now(), idRolDeveloper,'categorias','SELECT'),

        /* 03 Criterios de Evaluacion */

        (gen_random_uuid(), now(), idRolDeveloper,'criterios_evaluacion','SELECT'),

        /* 04 Cumplimientos */

        (gen_random_uuid(), now(), idRolDeveloper,'cumplimientos','SELECT'),

        /* 05 Federaciones */

        (gen_random_uuid(), now(), idRolDeveloper,'federaciones','INSERT'),
        (gen_random_uuid(), now(), idRolDeveloper,'federaciones','SELECT'),

        /* 07 Perfiles */
        (gen_random_uuid(), now(), idRolDeveloper,'perfiles','INSERT'),
        (gen_random_uuid(), now(), idRolDeveloper,'perfiles','UPDATE'),
        (gen_random_uuid(), now(), idRolDeveloper,'perfiles','DELETE'),
        (gen_random_uuid(), now(), idRolDeveloper,'perfiles','SELECT'),

        /*❌ 08 Permisos */

        /* 09 Regiones */


        (gen_random_uuid(), now(), idRolDeveloper,'regiones','SELECT'),

        /* 10 Comentarios */
        (gen_random_uuid(), now(), idRolDeveloper,'registro_comentarios','SELECT'),
        (gen_random_uuid(), now(), idRolDeveloper,'registro_comentarios','INSERT'),

        /* 11 Cumplimiento Evaluaciones */


        (gen_random_uuid(), now(), idRolDeveloper,'registro_cumplimiento_evaluaciones','SELECT'),

        /* 12 Equipo Evaluador */

        (gen_random_uuid(), now(), idRolDeveloper,'registro_equipo_evaluador','SELECT'),

        /* 13 Eventos */

        (gen_random_uuid(), now(), idRolDeveloper,'registro_eventos','SELECT'),

        /*❌ 14 Penalizaciones */

        /* 15 Solicitud de revision */

        (gen_random_uuid(), now(), idRolDeveloper,'respuesta_solicitud_revision','SELECT'),

        /* 16 Roles */
        (gen_random_uuid(), now(), idRolDeveloper,'roles','INSERT'),
        (gen_random_uuid(), now(), idRolDeveloper,'roles','UPDATE'),
        (gen_random_uuid(), now(), idRolDeveloper,'roles','DELETE'),
        (gen_random_uuid(), now(), idRolDeveloper,'roles','SELECT'),
        /* ❌ 17 Roles equipo evaluador */

        /* 18 Rubricas */

        (gen_random_uuid(), now(), idRolDeveloper,'rubricas','SELECT'),

        /* 19 Solicitud de revision */

        (gen_random_uuid(), now(), idRolDeveloper,'solicitud_revision','SELECT'),

        /* 20 Confirmacion asistencia */

        (gen_random_uuid(), now(), idRolDeveloper,'confirmacion_asistencia','SELECT'),

        /* 23 Copas */
        (gen_random_uuid(), now(), idRolDeveloper,'copas','SELECT'),

        /* 28 Alertas evaluación duplicada */
        (gen_random_uuid(), now(), idRolDeveloper,'alertas_evaluacion','SELECT'),
        (gen_random_uuid(), now(), idRolDeveloper,'alertas_evaluacion','EXECUTE'),

        /*🔷🔷🔷 ========================================================================🔷🔷🔷 */
        /* ADMIN */
        /* 01 Bandas */
        (gen_random_uuid(), now(),idRolAdmin,'bandas','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'bandas','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'bandas','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'bandas','SELECT'),

        /* 02 Categorias */
        (gen_random_uuid(), now(),idRolAdmin,'categorias','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'categorias','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'categorias','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'categorias','SELECT'),

        /* 03 Criterios de Evaluacion */
        (gen_random_uuid(), now(),idRolAdmin,'criterios_evaluacion','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'criterios_evaluacion','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'criterios_evaluacion','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'criterios_evaluacion','SELECT'),

        /* 04 Cumplimientos */
        (gen_random_uuid(), now(),idRolAdmin,'cumplimientos','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'cumplimientos','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'cumplimientos','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'cumplimientos','SELECT'),

        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolAdmin,'federaciones','SELECT'),

        /* 07 Perfiles */
        (gen_random_uuid(), now(),idRolAdmin,'perfiles','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'perfiles','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'perfiles','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'perfiles','SELECT'),

        /*❌ 08 Permisos */

        /* 09 Regiones */

        (gen_random_uuid(), now(),idRolAdmin,'regiones','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'regiones','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'regiones','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'regiones','SELECT'),

        /* 10 Comentarios */
        (gen_random_uuid(), now(),idRolAdmin,'registro_comentarios','SELECT'),

        /* 11 Cumplimiento Evaluaciones */

        (gen_random_uuid(), now(),idRolAdmin,'registro_cumplimiento_evaluaciones','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'registro_cumplimiento_evaluaciones','SELECT'),

        /* 12 Equipo Evaluador */
        (gen_random_uuid(), now(),idRolAdmin,'registro_equipo_evaluador','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'registro_equipo_evaluador','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'registro_equipo_evaluador','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'registro_equipo_evaluador','SELECT'),

        /* 13 Eventos */
        (gen_random_uuid(), now(),idRolAdmin,'registro_eventos','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'registro_eventos','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'registro_eventos','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'registro_eventos','SELECT'),

        /*❌ 14 Penalizaciones */

        /* 15 Solicitud de revision */
        (gen_random_uuid(), now(),idRolAdmin,'respuesta_solicitud_revision','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'respuesta_solicitud_revision','SELECT'),

        /* 16 Roles */
        (gen_random_uuid(), now(),idRolAdmin,'roles','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'roles','SELECT'),
        /* ❌ 17 Roles equipo evaluador */

        /* 18 Rubricas */
        (gen_random_uuid(), now(),idRolAdmin,'rubricas','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'rubricas','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'rubricas','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'rubricas','SELECT'),

        /* 19 Solicitud de revision */

        (gen_random_uuid(), now(),idRolAdmin,'solicitud_revision','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'solicitud_revision','SELECT'),

        /* 20 Confirmacion asistencia */

        (gen_random_uuid(), now(),idRolAdmin,'confirmacion_asistencia','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'confirmacion_asistencia','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'confirmacion_asistencia','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'confirmacion_asistencia','SELECT'),

        /* 21 Escuadras */
        (gen_random_uuid(), now(),idRolAdmin,'escuadras','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'escuadras','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'escuadras','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'escuadras','SELECT'),

        /* 22 Premios escuadra (tabla premios_escuadra) */
        (gen_random_uuid(), now(),idRolAdmin,'premios_escuadra','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'premios_escuadra','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'premios_escuadra','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'premios_escuadra','SELECT'),

        /* 23 Copas (lectura amplia; gestión admin / admin temporal / mesa) */
        (gen_random_uuid(), now(),idRolAdmin,'copas','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'copas','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'copas','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'copas','SELECT'),

        /* 28 Checkout — admin (consulta) */
        (gen_random_uuid(), now(),idRolAdmin,'checkout','SELECT'),

        /* 24 Sanciones (catálogo; CRUD completo) */
        (gen_random_uuid(), now(),idRolAdmin,'sanciones','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'sanciones','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'sanciones','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'sanciones','SELECT'),
        /* 25 Registro sanciones (lectura + aplicar sanción al aprobar solicitud) */
        (gen_random_uuid(), now(),idRolAdmin,'registro_sanciones','SELECT'),
        (gen_random_uuid(), now(),idRolAdmin,'registro_sanciones','INSERT'),



        /* 🔷🔷🔷========================================================================🔷🔷🔷 */
        /* admin temporal */
        /* 01 Bandas */
        (gen_random_uuid(), now(),idRolAdminTemporal,'bandas','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'bandas','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'bandas','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'bandas','SELECT'),

        /* 02 Categorias */
        (gen_random_uuid(), now(),idRolAdminTemporal,'categorias','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'categorias','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'categorias','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'categorias','SELECT'),

        /* 03 Criterios de Evaluacion */
        (gen_random_uuid(), now(),idRolAdminTemporal,'criterios_evaluacion','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'criterios_evaluacion','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'criterios_evaluacion','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'criterios_evaluacion','SELECT'),

        /* 04 Cumplimientos */
        (gen_random_uuid(), now(),idRolAdminTemporal,'cumplimientos','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'cumplimientos','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'cumplimientos','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'cumplimientos','SELECT'),

        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolAdminTemporal,'federaciones','SELECT'),

        /* 07 Perfiles */

        (gen_random_uuid(), now(),idRolAdminTemporal,'perfiles','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'perfiles','UPDATE'),

        (gen_random_uuid(), now(),idRolAdminTemporal,'perfiles','SELECT'),

        /*❌ 08 Permisos */

        /* 09 Regiones */

        (gen_random_uuid(), now(),idRolAdminTemporal,'regiones','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'regiones','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'regiones','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'regiones','SELECT'),

        /* 10 Comentarios */
        (gen_random_uuid(), now(),idRolAdminTemporal,'registro_comentarios','SELECT'),

        /* 11 Cumplimiento Evaluaciones */

        (gen_random_uuid(), now(),idRolAdminTemporal,'registro_cumplimiento_evaluaciones','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'registro_cumplimiento_evaluaciones','SELECT'),

        /* 12 Equipo Evaluador */
        (gen_random_uuid(), now(),idRolAdminTemporal,'registro_equipo_evaluador','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'registro_equipo_evaluador','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'registro_equipo_evaluador','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'registro_equipo_evaluador','SELECT'),

        /* 13 Eventos */
        (gen_random_uuid(), now(),idRolAdminTemporal,'registro_eventos','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'registro_eventos','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'registro_eventos','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'registro_eventos','SELECT'),

        /*❌ 14 Penalizaciones */

        /* 15 Solicitud de revision */
        (gen_random_uuid(), now(),idRolAdminTemporal,'respuesta_solicitud_revision','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'respuesta_solicitud_revision','SELECT'),

        /* 16 Roles */
        (gen_random_uuid(), now(),idRolAdminTemporal,'roles','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'roles','SELECT'),
        /* ❌ 17 Roles equipo evaluador */

        /* 18 Rubricas */
        (gen_random_uuid(), now(),idRolAdminTemporal,'rubricas','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'rubricas','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'rubricas','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'rubricas','SELECT'),

        /* 19 Solicitud de revision */

        (gen_random_uuid(), now(),idRolAdminTemporal,'solicitud_revision','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'solicitud_revision','SELECT'),

        /* 20 Confirmacion asistencia */

        (gen_random_uuid(), now(),idRolAdminTemporal,'confirmacion_asistencia','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'confirmacion_asistencia','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'confirmacion_asistencia','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'confirmacion_asistencia','SELECT'),

        /* 21 Escuadras */
        (gen_random_uuid(), now(),idRolAdminTemporal,'escuadras','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'escuadras','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'escuadras','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'escuadras','SELECT'),

        /* 22 Premios escuadra (tabla premios_escuadra) */
        (gen_random_uuid(), now(),idRolAdminTemporal,'premios_escuadra','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'premios_escuadra','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'premios_escuadra','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'premios_escuadra','SELECT'),

        /* 23 Copas */
        (gen_random_uuid(), now(),idRolAdminTemporal,'copas','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'copas','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'copas','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'copas','SELECT'),

        /* 28 Checkout — admin temporal (consulta) */
        (gen_random_uuid(), now(),idRolAdminTemporal,'checkout','SELECT'),

        /* 24 Sanciones (catálogo; CRUD completo) */
        (gen_random_uuid(), now(),idRolAdminTemporal,'sanciones','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'sanciones','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'sanciones','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'sanciones','SELECT'),
        /* 25 Registro sanciones (solo lectura) */
        (gen_random_uuid(), now(),idRolAdminTemporal,'registro_sanciones','SELECT'),




        /* 🔷🔷🔷========================================================================🔷🔷🔷 */
        /* jurado */
        /* 01 Bandas */

        (gen_random_uuid(), now(),idRolJurado,'bandas','SELECT'),

        /* 02 Categorias */

        (gen_random_uuid(), now(),idRolJurado,'categorias','SELECT'),

        /* 03 Criterios de Evaluacion */

        (gen_random_uuid(), now(),idRolJurado,'criterios_evaluacion','SELECT'),

        /* 04 Cumplimientos */

        (gen_random_uuid(), now(),idRolJurado,'cumplimientos','SELECT'),

        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolJurado,'federaciones','SELECT'),

        /* 07 Perfiles */

        (gen_random_uuid(), now(),idRolJurado,'perfiles','UPDATE'),

        (gen_random_uuid(), now(),idRolJurado,'perfiles','SELECT'),

        /*❌ 08 Permisos */

        /* 09 Regiones */


        (gen_random_uuid(), now(),idRolJurado,'regiones','SELECT'),

        /* 10 Comentarios */
        (gen_random_uuid(), now(),idRolJurado,'registro_comentarios','SELECT'),
        (gen_random_uuid(), now(),idRolJurado,'registro_comentarios','INSERT'),

        /* 11 Cumplimiento Evaluaciones */

        (gen_random_uuid(), now(),idRolJurado,'registro_cumplimiento_evaluaciones','INSERT'),
        (gen_random_uuid(), now(),idRolJurado,'registro_cumplimiento_evaluaciones','SELECT'),

        /* 12 Equipo Evaluador */

        (gen_random_uuid(), now(),idRolJurado,'registro_equipo_evaluador','SELECT'),

        /* 13 Eventos */

        (gen_random_uuid(), now(),idRolJurado,'registro_eventos','SELECT'),

        /*❌ 14 Penalizaciones */

        /* 15 Solicitud de revision */

        (gen_random_uuid(), now(),idRolJurado,'respuesta_solicitud_revision','SELECT'),

        /* 16 Roles */

        (gen_random_uuid(), now(),idRolJurado,'roles','SELECT'),
        /* ❌ 17 Roles equipo evaluador */

        /* 18 Rubricas */

        (gen_random_uuid(), now(),idRolJurado,'rubricas','SELECT'),

        /* 19 Solicitud de revision */

        (gen_random_uuid(), now(),idRolJurado,'solicitud_revision','SELECT'),

        /* 20 Confirmacion asistencia */

        (gen_random_uuid(), now(),idRolJurado,'confirmacion_asistencia','SELECT'),

        /* 23 Copas */
        (gen_random_uuid(), now(),idRolJurado,'copas','SELECT'),




        /* 🔷🔷🔷========================================================================🔷🔷🔷 */
        /* fiscal */
        /* 01 Bandas */

        (gen_random_uuid(), now(),idRolFiscal,'bandas','SELECT'),

        /* 02 Categorias */

        (gen_random_uuid(), now(),idRolFiscal,'categorias','SELECT'),

        /* 03 Criterios de Evaluacion */

        (gen_random_uuid(), now(),idRolFiscal,'criterios_evaluacion','SELECT'),

        /* 04 Cumplimientos */

        (gen_random_uuid(), now(),idRolFiscal,'cumplimientos','SELECT'),

        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolFiscal,'federaciones','SELECT'),

        /* 07 Perfiles */

        (gen_random_uuid(), now(),idRolFiscal,'perfiles','UPDATE'),

        (gen_random_uuid(), now(),idRolFiscal,'perfiles','SELECT'),

        /*❌ 08 Permisos */

        /* 09 Regiones */


        (gen_random_uuid(), now(),idRolFiscal,'regiones','SELECT'),

        /* 10 Comentarios */
        (gen_random_uuid(), now(),idRolFiscal,'registro_comentarios','SELECT'),

        /* 11 Cumplimiento Evaluaciones */


        (gen_random_uuid(), now(),idRolFiscal,'registro_cumplimiento_evaluaciones','SELECT'),

        /* 12 Equipo Evaluador */

        (gen_random_uuid(), now(),idRolFiscal,'registro_equipo_evaluador','SELECT'),

        /* 13 Eventos */

        (gen_random_uuid(), now(),idRolFiscal,'registro_eventos','SELECT'),

        /*❌ 14 Penalizaciones */

        /* 15 Solicitud de revision */

        (gen_random_uuid(), now(),idRolFiscal,'respuesta_solicitud_revision','SELECT'),

        /* 16 Roles */

        (gen_random_uuid(), now(),idRolFiscal,'roles','SELECT'),
        /* ❌ 17 Roles equipo evaluador */

        /* 18 Rubricas */

        (gen_random_uuid(), now(),idRolFiscal,'rubricas','SELECT'),

        /* 19 Solicitud de revision */

        (gen_random_uuid(), now(),idRolFiscal,'solicitud_revision','INSERT'),
        (gen_random_uuid(), now(),idRolFiscal,'solicitud_revision','SELECT'),

        /* 20 Confirmacion asistencia */

        (gen_random_uuid(), now(),idRolFiscal,'confirmacion_asistencia','SELECT'),

        /* 23 Copas */
        (gen_random_uuid(), now(),idRolFiscal,'copas','SELECT'),



        /* 🔷🔷🔷========================================================================🔷🔷🔷 */

        /* dirigente (misma matriz que líder de banda: lectura operativa + SELECT en roles para RLS/embed) */
        /* 01 Bandas */

        (gen_random_uuid(), now(),idRolDirigente,'bandas','SELECT'),

        /* 02 Categorias */

        (gen_random_uuid(), now(),idRolDirigente,'categorias','SELECT'),

        /* 03 Criterios de Evaluacion */

        (gen_random_uuid(), now(),idRolDirigente,'criterios_evaluacion','SELECT'),

        /* 04 Cumplimientos */

        (gen_random_uuid(), now(),idRolDirigente,'cumplimientos','SELECT'),

        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolDirigente,'federaciones','SELECT'),

        /* 07 Perfiles */

        (gen_random_uuid(), now(),idRolDirigente,'perfiles','UPDATE'),

        (gen_random_uuid(), now(),idRolDirigente,'perfiles','SELECT'),

        /*❌ 08 Permisos */

        /* 09 Regiones */


        (gen_random_uuid(), now(),idRolDirigente,'regiones','SELECT'),

        /* 10 Comentarios */
        (gen_random_uuid(), now(),idRolDirigente,'registro_comentarios','SELECT'),

        /* 11 Cumplimiento Evaluaciones */


        (gen_random_uuid(), now(),idRolDirigente,'registro_cumplimiento_evaluaciones','SELECT'),

        /* 12 Equipo Evaluador */

        (gen_random_uuid(), now(),idRolDirigente,'registro_equipo_evaluador','SELECT'),

        /* 13 Eventos */

        (gen_random_uuid(), now(),idRolDirigente,'registro_eventos','SELECT'),

        /*❌ 14 Penalizaciones */

        /* 15 Solicitud de revision */

        (gen_random_uuid(), now(),idRolDirigente,'respuesta_solicitud_revision','SELECT'),

        /* 16 Roles */

        (gen_random_uuid(), now(),idRolDirigente,'roles','SELECT'),
        /* ❌ 17 Roles equipo evaluador */

        /* 18 Rubricas */

        (gen_random_uuid(), now(),idRolDirigente,'rubricas','SELECT'),

        /* 19 Solicitud de revision */

        (gen_random_uuid(), now(),idRolDirigente,'solicitud_revision','SELECT'),

        /* 20 Confirmacion asistencia */

        (gen_random_uuid(), now(),idRolDirigente,'confirmacion_asistencia','INSERT'),
        (gen_random_uuid(), now(),idRolDirigente,'confirmacion_asistencia','UPDATE'),
        (gen_random_uuid(), now(),idRolDirigente,'confirmacion_asistencia','SELECT'),

        /* 23 Copas */
        (gen_random_uuid(), now(),idRolDirigente,'copas','SELECT'),

        /* 28 Checkout — dirigente (confirmar/denegar llegada e ingreso) */
        (gen_random_uuid(), now(),idRolDirigente,'checkout','UPDATE'),
        (gen_random_uuid(), now(),idRolDirigente,'checkout','SELECT'),


        /* 🔷🔷🔷========================================================================🔷🔷🔷 */

        /* secretaria: gestión operativa (usuarios, bandas, categorías, regiones, eventos) + confirmación de asistencia y checkout */
        /* 01 Bandas */
        (gen_random_uuid(), now(),idRolSecretaria,'bandas','INSERT'),
        (gen_random_uuid(), now(),idRolSecretaria,'bandas','UPDATE'),
        (gen_random_uuid(), now(),idRolSecretaria,'bandas','DELETE'),
        (gen_random_uuid(), now(),idRolSecretaria,'bandas','SELECT'),
        /* 02 Categorias */
        (gen_random_uuid(), now(),idRolSecretaria,'categorias','INSERT'),
        (gen_random_uuid(), now(),idRolSecretaria,'categorias','UPDATE'),
        (gen_random_uuid(), now(),idRolSecretaria,'categorias','DELETE'),
        (gen_random_uuid(), now(),idRolSecretaria,'categorias','SELECT'),
        /* 03 Criterios de Evaluacion */
        (gen_random_uuid(), now(),idRolSecretaria,'criterios_evaluacion','SELECT'),
        /* 04 Cumplimientos */
        (gen_random_uuid(), now(),idRolSecretaria,'cumplimientos','SELECT'),
        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolSecretaria,'federaciones','SELECT'),
        /* 07 Perfiles */
        (gen_random_uuid(), now(),idRolSecretaria,'perfiles','INSERT'),
        (gen_random_uuid(), now(),idRolSecretaria,'perfiles','UPDATE'),
        (gen_random_uuid(), now(),idRolSecretaria,'perfiles','DELETE'),
        (gen_random_uuid(), now(),idRolSecretaria,'perfiles','SELECT'),
        /* 09 Regiones */
        (gen_random_uuid(), now(),idRolSecretaria,'regiones','INSERT'),
        (gen_random_uuid(), now(),idRolSecretaria,'regiones','UPDATE'),
        (gen_random_uuid(), now(),idRolSecretaria,'regiones','DELETE'),
        (gen_random_uuid(), now(),idRolSecretaria,'regiones','SELECT'),
        /* 10 Comentarios */
        (gen_random_uuid(), now(),idRolSecretaria,'registro_comentarios','SELECT'),
        /* 11 Cumplimiento Evaluaciones */
        (gen_random_uuid(), now(),idRolSecretaria,'registro_cumplimiento_evaluaciones','SELECT'),
        /* 12 Equipo Evaluador (DELETE al eliminar eventos) */
        (gen_random_uuid(), now(),idRolSecretaria,'registro_equipo_evaluador','DELETE'),
        (gen_random_uuid(), now(),idRolSecretaria,'registro_equipo_evaluador','SELECT'),
        /* 13 Eventos */
        (gen_random_uuid(), now(),idRolSecretaria,'registro_eventos','INSERT'),
        (gen_random_uuid(), now(),idRolSecretaria,'registro_eventos','UPDATE'),
        (gen_random_uuid(), now(),idRolSecretaria,'registro_eventos','DELETE'),
        (gen_random_uuid(), now(),idRolSecretaria,'registro_eventos','SELECT'),
        /* 15 Solicitud de revision */
        (gen_random_uuid(), now(),idRolSecretaria,'respuesta_solicitud_revision','SELECT'),
        /* 16 Roles */
        (gen_random_uuid(), now(),idRolSecretaria,'roles','SELECT'),
        /* 18 Rubricas */
        (gen_random_uuid(), now(),idRolSecretaria,'rubricas','SELECT'),
        /* 19 Solicitud de revision */
        (gen_random_uuid(), now(),idRolSecretaria,'solicitud_revision','SELECT'),
        /* 20 Confirmacion asistencia */
        (gen_random_uuid(), now(),idRolSecretaria,'confirmacion_asistencia','INSERT'),
        (gen_random_uuid(), now(),idRolSecretaria,'confirmacion_asistencia','UPDATE'),
        (gen_random_uuid(), now(),idRolSecretaria,'confirmacion_asistencia','SELECT'),

        /* 23 Copas */
        (gen_random_uuid(), now(),idRolSecretaria,'copas','SELECT'),

        /* 24 Sanciones (solo lectura) */
        (gen_random_uuid(), now(),idRolSecretaria,'sanciones','SELECT'),
        /* 25 Registro sanciones (solo lectura) */
        (gen_random_uuid(), now(),idRolSecretaria,'registro_sanciones','SELECT'),

        /* 28 Checkout — secretaria (confirmar/denegar llegada e ingreso) */
        (gen_random_uuid(), now(),idRolSecretaria,'checkout','UPDATE'),
        (gen_random_uuid(), now(),idRolSecretaria,'checkout','SELECT'),


        /* 🔷🔷🔷========================================================================🔷🔷🔷 */

        /* comite de disciplina */
        /* 01 Bandas */
        (gen_random_uuid(), now(),idRolComiteDisciplina,'bandas','SELECT'),
        /* 02 Categorias */
        (gen_random_uuid(), now(),idRolComiteDisciplina,'categorias','SELECT'),
        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolComiteDisciplina,'federaciones','SELECT'),
        /* 07 Perfiles */
        (gen_random_uuid(), now(),idRolComiteDisciplina,'perfiles','SELECT'),
        /* 16 Roles (necesario para embed roles(*) en login) */
        (gen_random_uuid(), now(),idRolComiteDisciplina,'roles','SELECT'),
        /* 09 Regiones */
        (gen_random_uuid(), now(),idRolComiteDisciplina,'regiones','SELECT'),
        /* 24 Sanciones (solo lectura) */
        (gen_random_uuid(), now(),idRolComiteDisciplina,'sanciones','SELECT'),
        /* 25 Registro sanciones (CRUD completo) */
        (gen_random_uuid(), now(),idRolComiteDisciplina,'registro_sanciones','INSERT'),
        (gen_random_uuid(), now(),idRolComiteDisciplina,'registro_sanciones','UPDATE'),
        (gen_random_uuid(), now(),idRolComiteDisciplina,'registro_sanciones','DELETE'),
        (gen_random_uuid(), now(),idRolComiteDisciplina,'registro_sanciones','SELECT'),

        /* 12 Equipo evaluador (ver asignaciones propias) */
        (gen_random_uuid(), now(),idRolComiteDisciplina,'registro_equipo_evaluador','SELECT'),

        /* 13 Eventos (ver eventos donde está asignado) */
        (gen_random_uuid(), now(),idRolComiteDisciplina,'registro_eventos','SELECT'),

        /* 20 Confirmación asistencia (bandas confirmadas por evento en checkout) */
        (gen_random_uuid(), now(),idRolComiteDisciplina,'confirmacion_asistencia','SELECT'),

        /* 28 Checkout — comite de disciplina (registro de llegada e ingreso) */
        (gen_random_uuid(), now(),idRolComiteDisciplina,'checkout','INSERT'),
        (gen_random_uuid(), now(),idRolComiteDisciplina,'checkout','UPDATE'),
        (gen_random_uuid(), now(),idRolComiteDisciplina,'checkout','SELECT'),


        /* 🔷🔷🔷========================================================================🔷🔷🔷 */

        /* lider banda */
        /* 01 Bandas */

        (gen_random_uuid(), now(),idRolLiderbanda,'bandas','SELECT'),

        /* 02 Categorias */

        (gen_random_uuid(), now(),idRolLiderbanda,'categorias','SELECT'),

        /* 03 Criterios de Evaluacion */

        (gen_random_uuid(), now(),idRolLiderbanda,'criterios_evaluacion','SELECT'),

        /* 04 Cumplimientos */

        (gen_random_uuid(), now(),idRolLiderbanda,'cumplimientos','SELECT'),

        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolLiderbanda,'federaciones','SELECT'),

        /* 07 Perfiles */

        (gen_random_uuid(), now(),idRolLiderbanda,'perfiles','UPDATE'),

        (gen_random_uuid(), now(),idRolLiderbanda,'perfiles','SELECT'),

        /*❌ 08 Permisos */

        /* 09 Regiones */


        (gen_random_uuid(), now(),idRolLiderbanda,'regiones','SELECT'),

        /* 10 Comentarios */
        (gen_random_uuid(), now(),idRolLiderbanda,'registro_comentarios','SELECT'),

        /* 11 Cumplimiento Evaluaciones */


        (gen_random_uuid(), now(),idRolLiderbanda,'registro_cumplimiento_evaluaciones','SELECT'),

        /* 12 Equipo Evaluador */

        (gen_random_uuid(), now(),idRolLiderbanda,'registro_equipo_evaluador','SELECT'),

        /* 13 Eventos */

        (gen_random_uuid(), now(),idRolLiderbanda,'registro_eventos','SELECT'),

        /*❌ 14 Penalizaciones */

        /* 15 Solicitud de revision */

        (gen_random_uuid(), now(),idRolLiderbanda,'respuesta_solicitud_revision','SELECT'),

        /* 16 Roles */

        (gen_random_uuid(), now(),idRolLiderbanda,'roles','SELECT'),
        /* ❌ 17 Roles equipo evaluador */

        /* 18 Rubricas */

        (gen_random_uuid(), now(),idRolLiderbanda,'rubricas','SELECT'),

        /* 19 Solicitud de revision */

        (gen_random_uuid(), now(),idRolLiderbanda,'solicitud_revision','SELECT'),

        /* 20 Confirmacion asistencia */

        (gen_random_uuid(), now(),idRolLiderbanda,'confirmacion_asistencia','INSERT'),
        (gen_random_uuid(), now(),idRolLiderbanda,'confirmacion_asistencia','UPDATE'),
        (gen_random_uuid(), now(),idRolLiderbanda,'confirmacion_asistencia','SELECT'),

        /* 23 Copas */
        (gen_random_uuid(), now(),idRolLiderbanda,'copas','SELECT'),

        /* 28 Checkout — lider de banda (confirmar/denegar llegada e ingreso) */
        (gen_random_uuid(), now(),idRolLiderbanda,'checkout','UPDATE'),
        (gen_random_uuid(), now(),idRolLiderbanda,'checkout','SELECT'),


        /* 🔷🔷🔷========================================================================🔷🔷🔷 */
        /* responsable de bandas: CRUD bandas, categorias y regiones; resto SELECT */
        /* 01 Bandas */
        (gen_random_uuid(), now(),idRolResponsableBandas,'bandas','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableBandas,'bandas','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableBandas,'bandas','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableBandas,'bandas','SELECT'),
        /* 02 Categorias */
        (gen_random_uuid(), now(),idRolResponsableBandas,'categorias','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableBandas,'categorias','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableBandas,'categorias','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableBandas,'categorias','SELECT'),
        /* 03 Criterios de Evaluacion */
        (gen_random_uuid(), now(),idRolResponsableBandas,'criterios_evaluacion','SELECT'),
        /* 04 Cumplimientos */
        (gen_random_uuid(), now(),idRolResponsableBandas,'cumplimientos','SELECT'),
        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolResponsableBandas,'federaciones','SELECT'),
        /* 07 Perfiles */
        (gen_random_uuid(), now(),idRolResponsableBandas,'perfiles','SELECT'),
        /* 09 Regiones */
        (gen_random_uuid(), now(),idRolResponsableBandas,'regiones','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableBandas,'regiones','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableBandas,'regiones','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableBandas,'regiones','SELECT'),
        /* 10 Comentarios */
        (gen_random_uuid(), now(),idRolResponsableBandas,'registro_comentarios','SELECT'),
        /* 11 Cumplimiento Evaluaciones */
        (gen_random_uuid(), now(),idRolResponsableBandas,'registro_cumplimiento_evaluaciones','SELECT'),
        /* 12 Equipo Evaluador */
        (gen_random_uuid(), now(),idRolResponsableBandas,'registro_equipo_evaluador','SELECT'),
        /* 13 Eventos */
        (gen_random_uuid(), now(),idRolResponsableBandas,'registro_eventos','SELECT'),
        /* 15 Solicitud de revision */
        (gen_random_uuid(), now(),idRolResponsableBandas,'respuesta_solicitud_revision','SELECT'),
        /* 16 Roles */
        (gen_random_uuid(), now(),idRolResponsableBandas,'roles','SELECT'),
        /* 18 Rubricas */
        (gen_random_uuid(), now(),idRolResponsableBandas,'rubricas','SELECT'),
        /* 19 Solicitud de revision */
        (gen_random_uuid(), now(),idRolResponsableBandas,'solicitud_revision','SELECT'),
        /* 20 Confirmacion asistencia */
        (gen_random_uuid(), now(),idRolResponsableBandas,'confirmacion_asistencia','SELECT'),

        /* 21 Escuadras (CRUD; premios escuadra solo admin / admin temporal / mesa) */
        (gen_random_uuid(), now(),idRolResponsableBandas,'escuadras','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableBandas,'escuadras','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableBandas,'escuadras','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableBandas,'escuadras','SELECT'),

        /* 23 Copas */
        (gen_random_uuid(), now(),idRolResponsableBandas,'copas','SELECT'),


        /* 🔷🔷🔷========================================================================🔷🔷🔷 */
        /* responsable de rubricas: CRUD rubricas/criterios/cumplimientos/categorias/regiones; resto SELECT */
        /* 01 Bandas */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'bandas','SELECT'),
        /* 02 Categorias */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'categorias','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'categorias','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'categorias','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'categorias','SELECT'),
        /* 03 Criterios de Evaluacion */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'criterios_evaluacion','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'criterios_evaluacion','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'criterios_evaluacion','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'criterios_evaluacion','SELECT'),
        /* 04 Cumplimientos */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'cumplimientos','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'cumplimientos','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'cumplimientos','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'cumplimientos','SELECT'),
        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'federaciones','SELECT'),
        /* 07 Perfiles */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'perfiles','SELECT'),
        /* 09 Regiones */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'regiones','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'regiones','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'regiones','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'regiones','SELECT'),
        /* 10 Comentarios */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'registro_comentarios','SELECT'),
        /* 11 Cumplimiento Evaluaciones */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'registro_cumplimiento_evaluaciones','SELECT'),
        /* 12 Equipo Evaluador */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'registro_equipo_evaluador','SELECT'),
        /* 13 Eventos */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'registro_eventos','SELECT'),
        /* 15 Solicitud de revision */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'respuesta_solicitud_revision','SELECT'),
        /* 16 Roles */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'roles','SELECT'),
        /* 18 Rubricas */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'rubricas','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'rubricas','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'rubricas','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableRubricas,'rubricas','SELECT'),
        /* 19 Solicitud de revision */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'solicitud_revision','SELECT'),
        /* 20 Confirmacion asistencia */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'confirmacion_asistencia','SELECT'),
        /* 21 Escuadras */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'escuadras','SELECT'),
        /* 23 Copas */
        (gen_random_uuid(), now(),idRolResponsableRubricas,'copas','SELECT'),


        /* 🔷🔷🔷========================================================================🔷🔷🔷 */
        /* responsable de usuarios: CRUD perfiles; roles SELECT; resto SELECT */
        /* 01 Bandas */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'bandas','SELECT'),
        /* 02 Categorias */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'categorias','SELECT'),
        /* 03 Criterios de Evaluacion */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'criterios_evaluacion','SELECT'),
        /* 04 Cumplimientos */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'cumplimientos','SELECT'),
        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'federaciones','SELECT'),
        /* 07 Perfiles */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'perfiles','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'perfiles','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'perfiles','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'perfiles','SELECT'),
        /* 09 Regiones */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'regiones','SELECT'),
        /* 10 Comentarios */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'registro_comentarios','SELECT'),
        /* 11 Cumplimiento Evaluaciones */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'registro_cumplimiento_evaluaciones','SELECT'),
        /* 12 Equipo Evaluador */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'registro_equipo_evaluador','SELECT'),
        /* 13 Eventos */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'registro_eventos','SELECT'),
        /* 15 Solicitud de revision */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'respuesta_solicitud_revision','SELECT'),
        /* 16 Roles */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'roles','SELECT'),
        /* 18 Rubricas */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'rubricas','SELECT'),
        /* 19 Solicitud de revision */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'solicitud_revision','SELECT'),
        /* 20 Confirmacion asistencia */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'confirmacion_asistencia','SELECT'),

        /* 23 Copas */
        (gen_random_uuid(), now(),idRolResponsableUsuarios,'copas','SELECT'),


        /* 🔷🔷🔷========================================================================🔷🔷🔷 */
        /* responsable de eventos: CRUD eventos y regiones; equipo evaluador solo SELECT */
        /* 01 Bandas */
        (gen_random_uuid(), now(),idRolResponsableEventos,'bandas','SELECT'),
        /* 02 Categorias */
        (gen_random_uuid(), now(),idRolResponsableEventos,'categorias','SELECT'),
        /* 03 Criterios de Evaluacion */
        (gen_random_uuid(), now(),idRolResponsableEventos,'criterios_evaluacion','SELECT'),
        /* 04 Cumplimientos */
        (gen_random_uuid(), now(),idRolResponsableEventos,'cumplimientos','SELECT'),
        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolResponsableEventos,'federaciones','SELECT'),
        /* 07 Perfiles */
        (gen_random_uuid(), now(),idRolResponsableEventos,'perfiles','SELECT'),
        /* 09 Regiones */
        (gen_random_uuid(), now(),idRolResponsableEventos,'regiones','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableEventos,'regiones','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableEventos,'regiones','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableEventos,'regiones','SELECT'),
        /* 10 Comentarios */
        (gen_random_uuid(), now(),idRolResponsableEventos,'registro_comentarios','SELECT'),
        /* 11 Cumplimiento Evaluaciones */
        (gen_random_uuid(), now(),idRolResponsableEventos,'registro_cumplimiento_evaluaciones','SELECT'),
        /* 12 Equipo Evaluador */
        (gen_random_uuid(), now(),idRolResponsableEventos,'registro_equipo_evaluador','SELECT'),
        /* 13 Eventos */
        (gen_random_uuid(), now(),idRolResponsableEventos,'registro_eventos','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableEventos,'registro_eventos','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableEventos,'registro_eventos','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableEventos,'registro_eventos','SELECT'),
        /* 15 Solicitud de revision */
        (gen_random_uuid(), now(),idRolResponsableEventos,'respuesta_solicitud_revision','SELECT'),
        /* 16 Roles */
        (gen_random_uuid(), now(),idRolResponsableEventos,'roles','SELECT'),
        /* 18 Rubricas */
        (gen_random_uuid(), now(),idRolResponsableEventos,'rubricas','SELECT'),
        /* 19 Solicitud de revision */
        (gen_random_uuid(), now(),idRolResponsableEventos,'solicitud_revision','SELECT'),
        /* 20 Confirmacion asistencia */
        (gen_random_uuid(), now(),idRolResponsableEventos,'confirmacion_asistencia','SELECT'),

        /* 23 Copas */
        (gen_random_uuid(), now(),idRolResponsableEventos,'copas','SELECT'),


        /* 🔷🔷🔷========================================================================🔷🔷🔷 */
        /* responsable de mesa: CRUD equipo evaluador; eventos UPDATE+SELECT; solicitudes/revisiones como admin */
        /* 01 Bandas */
        (gen_random_uuid(), now(),idRolResponsableMesa,'bandas','SELECT'),
        /* 02 Categorias */
        (gen_random_uuid(), now(),idRolResponsableMesa,'categorias','SELECT'),
        /* 03 Criterios de Evaluacion */
        (gen_random_uuid(), now(),idRolResponsableMesa,'criterios_evaluacion','SELECT'),
        /* 04 Cumplimientos */
        (gen_random_uuid(), now(),idRolResponsableMesa,'cumplimientos','SELECT'),
        /* 05 Federaciones */
        (gen_random_uuid(), now(),idRolResponsableMesa,'federaciones','SELECT'),
        /* 07 Perfiles (UPDATE: activar/desactivar acceso por categoría en dashboard Accesos) */
        (gen_random_uuid(), now(),idRolResponsableMesa,'perfiles','SELECT'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'perfiles','UPDATE'),
        /* 09 Regiones */
        (gen_random_uuid(), now(),idRolResponsableMesa,'regiones','SELECT'),
        /* 10 Comentarios */
        (gen_random_uuid(), now(),idRolResponsableMesa,'registro_comentarios','SELECT'),
        /* 11 Cumplimiento Evaluaciones */
        (gen_random_uuid(), now(),idRolResponsableMesa,'registro_cumplimiento_evaluaciones','SELECT'),
        /* 12 Equipo Evaluador */
        (gen_random_uuid(), now(),idRolResponsableMesa,'registro_equipo_evaluador','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'registro_equipo_evaluador','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'registro_equipo_evaluador','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'registro_equipo_evaluador','SELECT'),
        /* 13 Eventos */
        (gen_random_uuid(), now(),idRolResponsableMesa,'registro_eventos','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'registro_eventos','SELECT'),
        /* 15 Solicitud de revision */
        (gen_random_uuid(), now(),idRolResponsableMesa,'respuesta_solicitud_revision','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'respuesta_solicitud_revision','SELECT'),
        /* 16 Roles */
        (gen_random_uuid(), now(),idRolResponsableMesa,'roles','SELECT'),
        /* 18 Rubricas */
        (gen_random_uuid(), now(),idRolResponsableMesa,'rubricas','SELECT'),
        /* 19 Solicitud de revision */
        (gen_random_uuid(), now(),idRolResponsableMesa,'registro_cumplimiento_evaluaciones','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'solicitud_revision','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'solicitud_revision','SELECT'),
        /* 20 Confirmacion asistencia */
        (gen_random_uuid(), now(),idRolResponsableMesa,'confirmacion_asistencia','SELECT'),

        /* 21 Premios escuadra (tabla premios_escuadra; gestión desde mesa) */
        (gen_random_uuid(), now(),idRolResponsableMesa,'premios_escuadra','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'premios_escuadra','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'premios_escuadra','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'premios_escuadra','SELECT'),

        /* 23 Copas (gestión desde mesa) */
        (gen_random_uuid(), now(),idRolResponsableMesa,'copas','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'copas','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'copas','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'copas','SELECT'),

        /* 26 Solicitar sanción — secretaria CRUD */
        (gen_random_uuid(), now(),idRolSecretaria,'solicitar_sancion','INSERT'),
        (gen_random_uuid(), now(),idRolSecretaria,'solicitar_sancion','UPDATE'),
        (gen_random_uuid(), now(),idRolSecretaria,'solicitar_sancion','DELETE'),
        (gen_random_uuid(), now(),idRolSecretaria,'solicitar_sancion','SELECT'),
        /* 26 Solicitar sanción — admin CRUD */
        (gen_random_uuid(), now(),idRolAdmin,'solicitar_sancion','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'solicitar_sancion','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'solicitar_sancion','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'solicitar_sancion','SELECT'),
        /* 26 Solicitar sanción — admin temporal CRUD */
        (gen_random_uuid(), now(),idRolAdminTemporal,'solicitar_sancion','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'solicitar_sancion','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'solicitar_sancion','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'solicitar_sancion','SELECT'),

        /* 27 Solicitud de copa — fiscal CRUD */
        (gen_random_uuid(), now(),idRolFiscal,'solicitud_copas','INSERT'),
        (gen_random_uuid(), now(),idRolFiscal,'solicitud_copas','UPDATE'),
        (gen_random_uuid(), now(),idRolFiscal,'solicitud_copas','DELETE'),
        (gen_random_uuid(), now(),idRolFiscal,'solicitud_copas','SELECT'),
        /* 27 Solicitud de copa — responsable de mesa CRUD */
        (gen_random_uuid(), now(),idRolResponsableMesa,'solicitud_copas','INSERT'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'solicitud_copas','UPDATE'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'solicitud_copas','DELETE'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'solicitud_copas','SELECT'),
        /* 27 Solicitud de copa — admin CRUD */
        (gen_random_uuid(), now(),idRolAdmin,'solicitud_copas','INSERT'),
        (gen_random_uuid(), now(),idRolAdmin,'solicitud_copas','UPDATE'),
        (gen_random_uuid(), now(),idRolAdmin,'solicitud_copas','DELETE'),
        (gen_random_uuid(), now(),idRolAdmin,'solicitud_copas','SELECT'),
        /* 27 Solicitud de copa — admin temporal CRUD */
        (gen_random_uuid(), now(),idRolAdminTemporal,'solicitud_copas','INSERT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'solicitud_copas','UPDATE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'solicitud_copas','DELETE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'solicitud_copas','SELECT'),

        /* 28 Alertas evaluación duplicada */
        (gen_random_uuid(), now(),idRolResponsableMesa,'alertas_evaluacion','SELECT'),
        (gen_random_uuid(), now(),idRolResponsableMesa,'alertas_evaluacion','EXECUTE'),
        (gen_random_uuid(), now(),idRolAdmin,'alertas_evaluacion','SELECT'),
        (gen_random_uuid(), now(),idRolAdmin,'alertas_evaluacion','EXECUTE'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'alertas_evaluacion','SELECT'),
        (gen_random_uuid(), now(),idRolAdminTemporal,'alertas_evaluacion','EXECUTE')

    ) AS v(_id_permiso, _created_at, id_foranea_rol, tabla, accion)
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.permisos p
        WHERE p.id_foranea_rol = v.id_foranea_rol
          AND p.tabla = v.tabla
          AND p.accion = v.accion
    );

    /* --------------------------------------------------------------------------
       Comité de disciplina: el login hace embed roles(*) en perfiles.
       Sin permiso roles/SELECT, RLS devuelve roles=null y el front rechaza el acceso.
       (Idempotente por si el bloque VALUES de arriba corrió sin esta fila.)
       -------------------------------------------------------------------------- */
    IF idRolComiteDisciplina IS NOT NULL THEN
        INSERT INTO public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
        SELECT gen_random_uuid(), now(), idRolComiteDisciplina, 'roles', 'SELECT'
        WHERE NOT EXISTS (
          SELECT 1
          FROM public.permisos AS p
          WHERE p.id_foranea_rol = idRolComiteDisciplina
            AND p.tabla = 'roles'
            AND p.accion = 'SELECT'
        );

        INSERT INTO public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
        SELECT gen_random_uuid(), now(), idRolComiteDisciplina, 'registro_equipo_evaluador', 'SELECT'
        WHERE NOT EXISTS (
          SELECT 1 FROM public.permisos AS p
          WHERE p.id_foranea_rol = idRolComiteDisciplina
            AND p.tabla = 'registro_equipo_evaluador' AND p.accion = 'SELECT'
        );

        INSERT INTO public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
        SELECT gen_random_uuid(), now(), idRolComiteDisciplina, 'registro_eventos', 'SELECT'
        WHERE NOT EXISTS (
          SELECT 1 FROM public.permisos AS p
          WHERE p.id_foranea_rol = idRolComiteDisciplina
            AND p.tabla = 'registro_eventos' AND p.accion = 'SELECT'
        );

        INSERT INTO public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
        SELECT gen_random_uuid(), now(), idRolComiteDisciplina, 'confirmacion_asistencia', 'SELECT'
        WHERE NOT EXISTS (
          SELECT 1 FROM public.permisos AS p
          WHERE p.id_foranea_rol = idRolComiteDisciplina
            AND p.tabla = 'confirmacion_asistencia' AND p.accion = 'SELECT'
        );

        INSERT INTO public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
        SELECT gen_random_uuid(), now(), idRolComiteDisciplina, t.tabla, t.accion
        FROM (VALUES
          ('checkout', 'INSERT'),
          ('checkout', 'UPDATE'),
          ('checkout', 'SELECT')
        ) AS t(tabla, accion)
        WHERE NOT EXISTS (
          SELECT 1 FROM public.permisos AS p
          WHERE p.id_foranea_rol = idRolComiteDisciplina
            AND p.tabla = t.tabla AND p.accion = t.accion
        );
    END IF;

END $$;

-- Políticas RLS: sanciones y registro_sanciones (requieren filas en public.permisos arriba)

DROP POLICY IF EXISTS "leer" ON public.sanciones;
CREATE POLICY "leer" ON public.sanciones
  FOR SELECT USING (public.revisar_permisos('sanciones'::text, 'SELECT'::text));

DROP POLICY IF EXISTS "crear" ON public.sanciones;
CREATE POLICY "crear" ON public.sanciones
  FOR INSERT WITH CHECK (public.revisar_permisos('sanciones'::text, 'INSERT'::text));

DROP POLICY IF EXISTS "actualizar" ON public.sanciones;
CREATE POLICY "actualizar" ON public.sanciones
  FOR UPDATE USING (public.revisar_permisos('sanciones'::text, 'UPDATE'::text));

DROP POLICY IF EXISTS "eliminar" ON public.sanciones;
CREATE POLICY "eliminar" ON public.sanciones
  FOR DELETE USING (public.revisar_permisos('sanciones'::text, 'DELETE'::text));

DROP POLICY IF EXISTS "leer" ON public.registro_sanciones;
CREATE POLICY "leer" ON public.registro_sanciones
  FOR SELECT USING (public.revisar_permisos('registro_sanciones'::text, 'SELECT'::text));

DROP POLICY IF EXISTS "crear" ON public.registro_sanciones;
CREATE POLICY "crear" ON public.registro_sanciones
  FOR INSERT WITH CHECK (public.revisar_permisos('registro_sanciones'::text, 'INSERT'::text));

DROP POLICY IF EXISTS "actualizar" ON public.registro_sanciones;
CREATE POLICY "actualizar" ON public.registro_sanciones
  FOR UPDATE USING (public.revisar_permisos('registro_sanciones'::text, 'UPDATE'::text));

DROP POLICY IF EXISTS "eliminar" ON public.registro_sanciones;
CREATE POLICY "eliminar" ON public.registro_sanciones
  FOR DELETE USING (public.revisar_permisos('registro_sanciones'::text, 'DELETE'::text));

-- Políticas RLS: copas (requieren filas en public.permisos con tabla 'copas' arriba)

DROP POLICY IF EXISTS "editar" ON public.copas;
DROP POLICY IF EXISTS "leer" ON public.copas;
CREATE POLICY "leer" ON public.copas
  FOR SELECT USING (public.revisar_permisos('copas'::text, 'SELECT'::text));

DROP POLICY IF EXISTS "crear" ON public.copas;
CREATE POLICY "crear" ON public.copas
  FOR INSERT WITH CHECK (public.revisar_permisos('copas'::text, 'INSERT'::text));

DROP POLICY IF EXISTS "actualizar" ON public.copas;
CREATE POLICY "actualizar" ON public.copas
  FOR UPDATE USING (public.revisar_permisos('copas'::text, 'UPDATE'::text));

DROP POLICY IF EXISTS "eliminar" ON public.copas;
CREATE POLICY "eliminar" ON public.copas
  FOR DELETE USING (public.revisar_permisos('copas'::text, 'DELETE'::text));

-- Políticas RLS: solicitudes de revisión (corrige acción CREATE→UPDATE en editar)

DROP POLICY IF EXISTS "editar" ON public.registro_cumplimiento_evaluaciones;
CREATE POLICY "editar" ON public.registro_cumplimiento_evaluaciones
  FOR UPDATE
  USING (true)
  WITH CHECK (public.revisar_permisos('registro_cumplimiento_evaluaciones'::text, 'UPDATE'::text));

DROP POLICY IF EXISTS "editar" ON public.respuesta_solicitud_revision;
CREATE POLICY "editar" ON public.respuesta_solicitud_revision
  FOR UPDATE
  USING (true)
  WITH CHECK (public.revisar_permisos('respuesta_solicitud_revision'::text, 'UPDATE'::text));

DROP POLICY IF EXISTS "eliminar" ON public.registro_cumplimiento_evaluaciones;
CREATE POLICY "eliminar" ON public.registro_cumplimiento_evaluaciones
  FOR DELETE
  USING (public.revisar_permisos('registro_cumplimiento_evaluaciones'::text, 'DELETE'::text));

GRANT SELECT ON public.vista_aplicacion_sanciones TO anon, authenticated, service_role;

-- Políticas RLS: solicitar_sancion (requieren filas en public.permisos arriba)

DROP POLICY IF EXISTS "leer" ON public.solicitar_sancion;
CREATE POLICY "leer" ON public.solicitar_sancion
  FOR SELECT USING (public.revisar_permisos('solicitar_sancion'::text, 'SELECT'::text));

DROP POLICY IF EXISTS "crear" ON public.solicitar_sancion;
CREATE POLICY "crear" ON public.solicitar_sancion
  FOR INSERT WITH CHECK (public.revisar_permisos('solicitar_sancion'::text, 'INSERT'::text));

DROP POLICY IF EXISTS "actualizar" ON public.solicitar_sancion;
CREATE POLICY "actualizar" ON public.solicitar_sancion
  FOR UPDATE USING (public.revisar_permisos('solicitar_sancion'::text, 'UPDATE'::text));

DROP POLICY IF EXISTS "eliminar" ON public.solicitar_sancion;
CREATE POLICY "eliminar" ON public.solicitar_sancion
  FOR DELETE USING (public.revisar_permisos('solicitar_sancion'::text, 'DELETE'::text));

GRANT SELECT ON public.vista_solicitud_sancion TO anon, authenticated, service_role;

-- Políticas RLS: solicitud_copas (requieren filas en public.permisos arriba)

DROP POLICY IF EXISTS "leer" ON public.solicitud_copas;
CREATE POLICY "leer" ON public.solicitud_copas
  FOR SELECT USING (public.revisar_permisos('solicitud_copas'::text, 'SELECT'::text));

DROP POLICY IF EXISTS "crear" ON public.solicitud_copas;
CREATE POLICY "crear" ON public.solicitud_copas
  FOR INSERT WITH CHECK (public.revisar_permisos('solicitud_copas'::text, 'INSERT'::text));

DROP POLICY IF EXISTS "actualizar" ON public.solicitud_copas;
CREATE POLICY "actualizar" ON public.solicitud_copas
  FOR UPDATE USING (public.revisar_permisos('solicitud_copas'::text, 'UPDATE'::text));

DROP POLICY IF EXISTS "eliminar" ON public.solicitud_copas;
CREATE POLICY "eliminar" ON public.solicitud_copas
  FOR DELETE USING (public.revisar_permisos('solicitud_copas'::text, 'DELETE'::text));

GRANT SELECT ON public.vista_solicitud_copas TO anon, authenticated, service_role;

-- =============================================================================
-- CHECKOUT — función RLS, políticas y permisos (ejecutar TODO este bloque junto)
-- Sustituye: checkout_comite_disciplina.sql, checkout_dirigente.sql,
--            checkout_rls_confirmador_banda.sql, checkout_fix_permisos_por_email.sql
-- Tras ejecutar: cerrar sesión y volver a entrar (dirigente / disciplina).
-- =============================================================================

-- 1) revisar_permisos: preferir perfil con banda; normalizar tabla/acción (snake_case seed + camelCase policies)
CREATE OR REPLACE FUNCTION public.revisar_permisos(target_table text, target_action text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
 SET row_security TO 'off'
AS $function$
DECLARE
  tiene_permisos boolean;
  id_rol_user_auth uuid;
  tabla_norm text;
  accion_norm text;
BEGIN
  SELECT pf.id_foranea_rol INTO id_rol_user_auth
  FROM public.perfiles pf
  WHERE pf.id_foranea_user = auth.uid()
  ORDER BY
    CASE WHEN pf.id_foranea_banda IS NOT NULL THEN 0 ELSE 1 END,
    pf.created_at DESC NULLS LAST
  LIMIT 1;

  IF id_rol_user_auth IS NULL THEN
    RETURN false;
  END IF;

  accion_norm := lower(target_action);
  tabla_norm := replace(lower(target_table), '_', '');

  IF tabla_norm = 'criteriosevalucion' THEN
    tabla_norm := 'criteriosevaluacion';
  ELSIF tabla_norm = 'solicitudrevicion' THEN
    tabla_norm := 'solicitudrevision';
  ELSIF tabla_norm = 'respuestasolicitudrevicion' THEN
    tabla_norm := 'respuestasolicitudrevision';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.permisos p
    WHERE p.id_foranea_rol = id_rol_user_auth
      AND lower(p.accion) = accion_norm
      AND replace(lower(
        CASE replace(lower(p.tabla), '_', '')
          WHEN 'criteriosevalucion' THEN 'criterios_evaluacion'
          WHEN 'solicitudrevicion' THEN 'solicitud_revision'
          WHEN 'respuestasolicitudrevicion' THEN 'respuesta_solicitud_revision'
          ELSE p.tabla
        END
      ), '_', '') = tabla_norm
  ) INTO tiene_permisos;

  RETURN tiene_permisos;
END;
$function$;

-- 2) RLS tabla checkout (por revisar_permisos + por banda del confirmador)
ALTER TABLE public.checkout ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leer" ON public.checkout;
CREATE POLICY "leer" ON public.checkout
  FOR SELECT USING (public.revisar_permisos('checkout'::text, 'SELECT'::text));

DROP POLICY IF EXISTS "crear" ON public.checkout;
CREATE POLICY "crear" ON public.checkout
  FOR INSERT WITH CHECK (public.revisar_permisos('checkout'::text, 'INSERT'::text));

DROP POLICY IF EXISTS "actualizar" ON public.checkout;
CREATE POLICY "actualizar" ON public.checkout
  FOR UPDATE
  USING (public.revisar_permisos('checkout'::text, 'UPDATE'::text))
  WITH CHECK (public.revisar_permisos('checkout'::text, 'UPDATE'::text));

DROP POLICY IF EXISTS "eliminar" ON public.checkout;
CREATE POLICY "eliminar" ON public.checkout
  FOR DELETE USING (public.revisar_permisos('checkout'::text, 'DELETE'::text));

DROP POLICY IF EXISTS "leer_confirmador_banda" ON public.checkout;
CREATE POLICY "leer_confirmador_banda" ON public.checkout
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.perfiles pf
      INNER JOIN public.roles r ON r.id_rol = pf.id_foranea_rol
      WHERE pf.id_foranea_user = auth.uid()
        AND pf.id_foranea_banda IS NOT NULL
        AND pf.id_foranea_banda = checkout.id_foranea_banda
        AND r.nombre_rol IN (
          'dirigente',
          'secretaria',
          'lider de banda',
          'liderBanda',
          'director artistico',
          'directorArtistico'
        )
    )
  );

DROP POLICY IF EXISTS "actualizar_confirmador_banda" ON public.checkout;
CREATE POLICY "actualizar_confirmador_banda" ON public.checkout
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.perfiles pf
      INNER JOIN public.roles r ON r.id_rol = pf.id_foranea_rol
      WHERE pf.id_foranea_user = auth.uid()
        AND pf.id_foranea_banda IS NOT NULL
        AND pf.id_foranea_banda = checkout.id_foranea_banda
        AND r.nombre_rol IN (
          'dirigente',
          'secretaria',
          'lider de banda',
          'liderBanda',
          'director artistico',
          'directorArtistico'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.perfiles pf
      INNER JOIN public.roles r ON r.id_rol = pf.id_foranea_rol
      WHERE pf.id_foranea_user = auth.uid()
        AND pf.id_foranea_banda IS NOT NULL
        AND pf.id_foranea_banda = checkout.id_foranea_banda
        AND r.nombre_rol IN (
          'dirigente',
          'secretaria',
          'lider de banda',
          'liderBanda',
          'director artistico',
          'directorArtistico'
        )
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.checkout TO anon, authenticated, service_role;
GRANT SELECT, UPDATE ON TABLE public.checkout TO authenticated;
GRANT SELECT ON public.vista_detalle_checkout TO anon, authenticated, service_role;

-- 3) Permisos checkout — comité de disciplina (todas las federaciones)
INSERT INTO public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
SELECT gen_random_uuid(), now(), r.id_rol, t.tabla, t.accion
FROM public.roles r
CROSS JOIN (VALUES
  ('checkout', 'INSERT'),
  ('checkout', 'UPDATE'),
  ('checkout', 'SELECT'),
  ('confirmacion_asistencia', 'SELECT')
) AS t(tabla, accion)
WHERE r.nombre_rol = 'comite de disciplina'
  AND NOT EXISTS (
    SELECT 1 FROM public.permisos p
    WHERE p.id_foranea_rol = r.id_rol
      AND p.tabla = t.tabla
      AND p.accion = t.accion
  );

-- 4) Permisos checkout — Mi banda (confirmar llegada / ingreso)
INSERT INTO public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
SELECT gen_random_uuid(), now(), r.id_rol, t.tabla, t.accion
FROM public.roles r
CROSS JOIN (VALUES
  ('checkout', 'UPDATE'),
  ('checkout', 'SELECT')
) AS t(tabla, accion)
WHERE r.nombre_rol IN (
  'dirigente',
  'secretaria',
  'lider de banda',
  'liderBanda',
  'director artistico',
  'directorArtistico'
)
AND NOT EXISTS (
  SELECT 1 FROM public.permisos p
  WHERE p.id_foranea_rol = r.id_rol
    AND p.tabla = t.tabla
    AND p.accion = t.accion
);

-- 8) Permisos checkout — admin / admin temporal (consulta; bases ya desplegadas)
INSERT INTO public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
SELECT gen_random_uuid(), now(), r.id_rol, t.tabla, t.accion
FROM public.roles r
CROSS JOIN (VALUES ('checkout', 'SELECT')) AS t(tabla, accion)
WHERE r.nombre_rol IN ('admin', 'admin temporal')
  AND NOT EXISTS (
    SELECT 1 FROM public.permisos p
    WHERE p.id_foranea_rol = r.id_rol
      AND p.tabla = t.tabla
      AND p.accion = t.accion
  );

-- 5) Copiar permisos de lider de banda → dirigente (misma federación; bases antiguas)
INSERT INTO public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
SELECT gen_random_uuid(), now(), d.id_rol, p."tabla", p."accion"
FROM public.roles AS d
INNER JOIN public.roles AS lb
  ON lb.nombre_rol = 'lider de banda'
  AND lb.id_foranea_federacion = d.id_foranea_federacion
INNER JOIN public.permisos AS p ON p.id_foranea_rol = lb.id_rol
WHERE d.nombre_rol = 'dirigente'
  AND NOT EXISTS (
    SELECT 1
    FROM public.permisos AS x
    WHERE x.id_foranea_rol = d.id_rol
      AND x.tabla = p.tabla
      AND x.accion = p.accion
  );

-- 6) Opcional: forzar permisos en el idRol del usuario por email (descomenta y cambia email)
/*
INSERT INTO public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
SELECT gen_random_uuid(), now(), pf.id_foranea_rol, t.tabla, t.accion
FROM auth.users u
INNER JOIN public.perfiles pf ON pf.id_foranea_user = u.id
CROSS JOIN (VALUES ('checkout', 'UPDATE'), ('checkout', 'SELECT')) AS t(tabla, accion)
WHERE u.email = 'tu-email@ejemplo.com'
  AND pf.id_foranea_rol IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.permisos p
    WHERE p.id_foranea_rol = pf.id_foranea_rol
      AND p.tabla = t.tabla AND p.accion = t.accion
  );
*/

-- 7) Diagnóstico (descomenta; cambia email)
/*
SELECT
  u.email,
  pf.id_perfil,
  pf.id_foranea_banda,
  r.nombre_rol,
  r.id_rol,
  p.tabla,
  p.accion
FROM auth.users u
JOIN public.perfiles pf ON pf.id_foranea_user = u.id
JOIN public.roles r ON r.id_rol = pf.id_foranea_rol
LEFT JOIN public.permisos p ON p.id_foranea_rol = r.id_rol AND p.tabla = 'checkout'
WHERE u.email = 'tu-email@ejemplo.com';
*/

-- =============================================================================
-- Storage: buckets y políticas RLS (fotos de perfil y logos de bandas)
-- Deben coincidir con NEXT_PUBLIC_SUPABASE_BUCKET_PERFILES y bandasServices.ts
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('img-fotos-perfiles-sasha', 'img-fotos-perfiles-sasha', false),
  ('imgLogoBandas', 'imgLogoBandas', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas legacy (migración 20260501031419); se reemplazan por nombres explícitos
DROP POLICY IF EXISTS "agregar 1gmiffv_0" ON storage.objects;
DROP POLICY IF EXISTS "editar 1gmiffv_0" ON storage.objects;
DROP POLICY IF EXISTS "eliminar 1gmiffv_0" ON storage.objects;
DROP POLICY IF EXISTS "eliminar 1gmiffv_1" ON storage.objects;
DROP POLICY IF EXISTS "leer 1gmiffv_0" ON storage.objects;

-- img-fotos-perfiles-sasha
DROP POLICY IF EXISTS "storage_perfiles_agregar" ON storage.objects;
CREATE POLICY "storage_perfiles_agregar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'img-fotos-perfiles-sasha');

DROP POLICY IF EXISTS "storage_perfiles_editar" ON storage.objects;
CREATE POLICY "storage_perfiles_editar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'img-fotos-perfiles-sasha');

DROP POLICY IF EXISTS "storage_perfiles_eliminar" ON storage.objects;
CREATE POLICY "storage_perfiles_eliminar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'img-fotos-perfiles-sasha');

DROP POLICY IF EXISTS "storage_perfiles_leer_authenticated" ON storage.objects;
CREATE POLICY "storage_perfiles_leer_authenticated"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'img-fotos-perfiles-sasha');

DROP POLICY IF EXISTS "storage_perfiles_leer_public" ON storage.objects;
CREATE POLICY "storage_perfiles_leer_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'img-fotos-perfiles-sasha');

-- imgLogoBandas
DROP POLICY IF EXISTS "storage_logo_banda_agregar" ON storage.objects;
CREATE POLICY "storage_logo_banda_agregar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'imgLogoBandas');

DROP POLICY IF EXISTS "storage_logo_banda_editar" ON storage.objects;
CREATE POLICY "storage_logo_banda_editar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'imgLogoBandas');

DROP POLICY IF EXISTS "storage_logo_banda_eliminar" ON storage.objects;
CREATE POLICY "storage_logo_banda_eliminar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'imgLogoBandas');

DROP POLICY IF EXISTS "storage_logo_banda_leer_authenticated" ON storage.objects;
CREATE POLICY "storage_logo_banda_leer_authenticated"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'imgLogoBandas');

DROP POLICY IF EXISTS "storage_logo_banda_leer_public" ON storage.objects;
CREATE POLICY "storage_logo_banda_leer_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'imgLogoBandas');
