-- Seed data para la base de datos de Supabase
-- Sintaxis correcta PostgreSQL
--
-- Usuarios por defecto en este seed:
--   admin:      admin@feccah.com      / adminfeccha01
--   secretaria: secretaria@feccah.com / secretariafeccah

-- VARIABLES
DO $$
DECLARE
    id_user UUID := gen_random_uuid();
    user_email TEXT := 'admin@feccah.net';
    user_password TEXT := 'adminfeccah';
    id_user_secretaria UUID := gen_random_uuid();
    user_email_secretaria TEXT := 'secretaria@feccah.com';
    user_password_secretaria TEXT := 'secretariafeccah';
    idRolDeveloper UUID := gen_random_uuid();
    idRolAdmin UUID := gen_random_uuid();
    idRolAdminTemporal UUID := gen_random_uuid();
    idRolJurado UUID := gen_random_uuid();
    idRolFiscal UUID := gen_random_uuid();
    idRolDirigente UUID := gen_random_uuid();
    idRolLiderbanda UUID := gen_random_uuid();
    idRolResponsableBandas UUID := gen_random_uuid();
    idRolResponsableRubricas UUID := gen_random_uuid();
    idRolResponsableUsuarios UUID := gen_random_uuid();
    idRolResponsableEventos UUID := gen_random_uuid();
    idRolResponsableMesa UUID := gen_random_uuid();
    idRolSecretaria UUID := gen_random_uuid();
    idRolComiteDisciplina UUID := gen_random_uuid();
    id_federacion UUID := gen_random_uuid();

   



    
BEGIN

-- FEDERACION (primero)
INSERT INTO public.federaciones ("idFederacion","created_at","nombreFederacion") 
VALUES (
    id_federacion,
    now(),
    'FECCAH-DEV'
);

-- DENTRO DEL BEGIN, después de insertar la federación:


/* 

    idRol: string; // uuid
    created_at: string; // timestamp with time zone
    idForaneaFederacion: string; // uuid
    nombreRol: string; // text
    estadoRol: boolean;

 */

INSERT INTO public.roles ("idRol",created_at,"idForaneaFederacion","nombreRol","estadoRol")
VALUES 
(idRolDeveloper,now(),id_federacion,'developer',true),
(idRolAdmin,now(),id_federacion,'admin',true),
(idRolAdminTemporal,now(),id_federacion,'admin temporal',true),
(idRolJurado,now(),id_federacion,'jurado',true),
(idRolFiscal,now(),id_federacion,'fiscal',true),
(idRolDirigente,now(),id_federacion,'dirigente',true),
(idRolLiderbanda,now(),id_federacion,'lider de banda',true),
(idRolResponsableBandas,now(),id_federacion,'responsable de bandas',true),
(idRolResponsableRubricas,now(),id_federacion,'responsable de rubricas',true),
(idRolResponsableUsuarios,now(),id_federacion,'responsable de usuarios',true),
(idRolResponsableEventos,now(),id_federacion,'responsable de eventos',true),
(idRolResponsableMesa,now(),id_federacion,'responsable de mesa',true),
(idRolSecretaria,now(),id_federacion,'secretaria',true),
(idRolComiteDisciplina,now(),id_federacion,'comite de disciplina',true);





-- USER en auth.users (tercero)
-- 1. Insertar el usuario en auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    id_user,
    'authenticated',
    'authenticated',
    user_email,
    extensions.crypt(user_password, extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "FECCAH Admin", "role": "admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 2. Insertar la identidad (Fundamental para que el login funcione)
  INSERT INTO auth.identities (
    provider_id,
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    user_email,
    id_user,
    id_user,
    format('{"sub":"%s","email":"%s"}', id_user, user_email)::jsonb,
    'email',
    now(),
    now(),
    now()
  );

-- Crear perfil en public.perfiles (cuarto)
INSERT into perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos") 
VALUES(
    gen_random_uuid(), now(),'FECCAH Admin',id_federacion,id_user,idRolAdmin,true
);

-- USER secretaria en auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    id_user_secretaria,
    'authenticated',
    'authenticated',
    user_email_secretaria,
    extensions.crypt(user_password_secretaria, extensions.gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "FECCAH Secretaria", "role": "secretaria"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  INSERT INTO auth.identities (
    provider_id,
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    user_email_secretaria,
    id_user_secretaria,
    id_user_secretaria,
    format('{"sub":"%s","email":"%s"}', id_user_secretaria, user_email_secretaria)::jsonb,
    'email',
    now(),
    now(),
    now()
  );

INSERT into perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
VALUES(
    gen_random_uuid(), now(),'FECCAH Secretaria',id_federacion,id_user_secretaria,idRolSecretaria,true
);




-- PERMISOS PARA ADMIN
INSERT INTO public.permisos ("idPermiso","created_at","idForaneaRol","tabla","accion")
VALUES 
/* ======================================================================== */
/* developer */
/* 01 Bandas */

(gen_random_uuid(), now(), idRolDeveloper,'bandas','SELECT'),

/* 02 Categorias */

(gen_random_uuid(), now(), idRolDeveloper,'categorias','SELECT'),

/* 03 Criterios de Evaluacion */

(gen_random_uuid(), now(), idRolDeveloper,'criteriosEvalucion','SELECT'),

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
(gen_random_uuid(), now(), idRolDeveloper,'registroComentarios','SELECT'),
(gen_random_uuid(), now(), idRolDeveloper,'registroComentarios','INSERT'),

/* 11 Cumplimiento Evaluaciones */


(gen_random_uuid(), now(), idRolDeveloper,'registroCumplimientoEvaluaciones','SELECT'),

/* 12 Equipo Evaluador */

(gen_random_uuid(), now(), idRolDeveloper,'registroEquipoEvaluador','SELECT'),

/* 13 Eventos */

(gen_random_uuid(), now(), idRolDeveloper,'registroEventos','SELECT'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */

(gen_random_uuid(), now(), idRolDeveloper,'respuestaSolicitudRevicion','SELECT'),

/* 16 Roles */
(gen_random_uuid(), now(), idRolDeveloper,'roles','INSERT'),
(gen_random_uuid(), now(), idRolDeveloper,'roles','UPDATE'),
(gen_random_uuid(), now(), idRolDeveloper,'roles','DELETE'),
(gen_random_uuid(), now(), idRolDeveloper,'roles','SELECT'),
/* ❌ 17 Roles equipo evaluador */

/* 18 Rubricas */

(gen_random_uuid(), now(), idRolDeveloper,'rubricas','SELECT'),

/* 19 Solicitud de revision */

(gen_random_uuid(), now(), idRolDeveloper,'solicitudRevicion','SELECT'),

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
(gen_random_uuid(), now(),idRolAdmin,'criteriosEvalucion','INSERT'),
(gen_random_uuid(), now(),idRolAdmin,'criteriosEvalucion','UPDATE'),
(gen_random_uuid(), now(),idRolAdmin,'criteriosEvalucion','DELETE'),
(gen_random_uuid(), now(),idRolAdmin,'criteriosEvalucion','SELECT'),

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
(gen_random_uuid(), now(),idRolAdmin,'registroComentarios','SELECT'),

/* 11 Cumplimiento Evaluaciones */

(gen_random_uuid(), now(),idRolAdmin,'registroCumplimientoEvaluaciones','UPDATE'),
(gen_random_uuid(), now(),idRolAdmin,'registroCumplimientoEvaluaciones','SELECT'),

/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),idRolAdmin,'registroEquipoEvaluador','INSERT'),
(gen_random_uuid(), now(),idRolAdmin,'registroEquipoEvaluador','UPDATE'),
(gen_random_uuid(), now(),idRolAdmin,'registroEquipoEvaluador','DELETE'),
(gen_random_uuid(), now(),idRolAdmin,'registroEquipoEvaluador','SELECT'),

/* 13 Eventos */
(gen_random_uuid(), now(),idRolAdmin,'registroEventos','INSERT'),
(gen_random_uuid(), now(),idRolAdmin,'registroEventos','UPDATE'),
(gen_random_uuid(), now(),idRolAdmin,'registroEventos','DELETE'),
(gen_random_uuid(), now(),idRolAdmin,'registroEventos','SELECT'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */
(gen_random_uuid(), now(),idRolAdmin,'respuestaSolicitudRevicion','INSERT'),
(gen_random_uuid(), now(),idRolAdmin,'respuestaSolicitudRevicion','SELECT'),

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

(gen_random_uuid(), now(),idRolAdmin,'solicitudRevicion','UPDATE'),
(gen_random_uuid(), now(),idRolAdmin,'solicitudRevicion','SELECT'),

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
(gen_random_uuid(), now(),idRolAdminTemporal,'criteriosEvalucion','INSERT'),
(gen_random_uuid(), now(),idRolAdminTemporal,'criteriosEvalucion','UPDATE'),
(gen_random_uuid(), now(),idRolAdminTemporal,'criteriosEvalucion','DELETE'),
(gen_random_uuid(), now(),idRolAdminTemporal,'criteriosEvalucion','SELECT'),

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
(gen_random_uuid(), now(),idRolAdminTemporal,'registroComentarios','SELECT'),

/* 11 Cumplimiento Evaluaciones */

(gen_random_uuid(), now(),idRolAdminTemporal,'registroCumplimientoEvaluaciones','UPDATE'),
(gen_random_uuid(), now(),idRolAdminTemporal,'registroCumplimientoEvaluaciones','SELECT'),

/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),idRolAdminTemporal,'registroEquipoEvaluador','INSERT'),
(gen_random_uuid(), now(),idRolAdminTemporal,'registroEquipoEvaluador','UPDATE'),
(gen_random_uuid(), now(),idRolAdminTemporal,'registroEquipoEvaluador','DELETE'),
(gen_random_uuid(), now(),idRolAdminTemporal,'registroEquipoEvaluador','SELECT'),

/* 13 Eventos */
(gen_random_uuid(), now(),idRolAdminTemporal,'registroEventos','INSERT'),
(gen_random_uuid(), now(),idRolAdminTemporal,'registroEventos','UPDATE'),
(gen_random_uuid(), now(),idRolAdminTemporal,'registroEventos','DELETE'),
(gen_random_uuid(), now(),idRolAdminTemporal,'registroEventos','SELECT'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */
(gen_random_uuid(), now(),idRolAdminTemporal,'respuestaSolicitudRevicion','INSERT'),
(gen_random_uuid(), now(),idRolAdminTemporal,'respuestaSolicitudRevicion','SELECT'),

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

(gen_random_uuid(), now(),idRolAdminTemporal,'solicitudRevicion','UPDATE'),
(gen_random_uuid(), now(),idRolAdminTemporal,'solicitudRevicion','SELECT'),

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

(gen_random_uuid(), now(),idRolJurado,'criteriosEvalucion','SELECT'),

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
(gen_random_uuid(), now(),idRolJurado,'registroComentarios','SELECT'),
(gen_random_uuid(), now(),idRolJurado,'registroComentarios','INSERT'),

/* 11 Cumplimiento Evaluaciones */

(gen_random_uuid(), now(),idRolJurado,'registroCumplimientoEvaluaciones','INSERT'),
(gen_random_uuid(), now(),idRolJurado,'registroCumplimientoEvaluaciones','SELECT'),

/* 12 Equipo Evaluador */

(gen_random_uuid(), now(),idRolJurado,'registroEquipoEvaluador','SELECT'),

/* 13 Eventos */

(gen_random_uuid(), now(),idRolJurado,'registroEventos','SELECT'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */

(gen_random_uuid(), now(),idRolJurado,'respuestaSolicitudRevicion','SELECT'),

/* 16 Roles */

(gen_random_uuid(), now(),idRolJurado,'roles','SELECT'),
/* ❌ 17 Roles equipo evaluador */

/* 18 Rubricas */

(gen_random_uuid(), now(),idRolJurado,'rubricas','SELECT'),

/* 19 Solicitud de revision */

(gen_random_uuid(), now(),idRolJurado,'solicitudRevicion','SELECT'),

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

(gen_random_uuid(), now(),idRolFiscal,'criteriosEvalucion','SELECT'),

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
(gen_random_uuid(), now(),idRolFiscal,'registroComentarios','SELECT'),

/* 11 Cumplimiento Evaluaciones */


(gen_random_uuid(), now(),idRolFiscal,'registroCumplimientoEvaluaciones','SELECT'),

/* 12 Equipo Evaluador */

(gen_random_uuid(), now(),idRolFiscal,'registroEquipoEvaluador','SELECT'),

/* 13 Eventos */

(gen_random_uuid(), now(),idRolFiscal,'registroEventos','SELECT'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */

(gen_random_uuid(), now(),idRolFiscal,'respuestaSolicitudRevicion','SELECT'),

/* 16 Roles */

(gen_random_uuid(), now(),idRolFiscal,'roles','SELECT'),
/* ❌ 17 Roles equipo evaluador */

/* 18 Rubricas */

(gen_random_uuid(), now(),idRolFiscal,'rubricas','SELECT'),

/* 19 Solicitud de revision */

(gen_random_uuid(), now(),idRolFiscal,'solicitudRevicion','INSERT'),
(gen_random_uuid(), now(),idRolFiscal,'solicitudRevicion','SELECT'),

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

(gen_random_uuid(), now(),idRolDirigente,'criteriosEvalucion','SELECT'),

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
(gen_random_uuid(), now(),idRolDirigente,'registroComentarios','SELECT'),

/* 11 Cumplimiento Evaluaciones */


(gen_random_uuid(), now(),idRolDirigente,'registroCumplimientoEvaluaciones','SELECT'),

/* 12 Equipo Evaluador */

(gen_random_uuid(), now(),idRolDirigente,'registroEquipoEvaluador','SELECT'),

/* 13 Eventos */

(gen_random_uuid(), now(),idRolDirigente,'registroEventos','SELECT'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */

(gen_random_uuid(), now(),idRolDirigente,'respuestaSolicitudRevicion','SELECT'),

/* 16 Roles */

(gen_random_uuid(), now(),idRolDirigente,'roles','SELECT'),
/* ❌ 17 Roles equipo evaluador */

/* 18 Rubricas */

(gen_random_uuid(), now(),idRolDirigente,'rubricas','SELECT'),

/* 19 Solicitud de revision */

(gen_random_uuid(), now(),idRolDirigente,'solicitudRevicion','SELECT'),

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
(gen_random_uuid(), now(),idRolSecretaria,'criteriosEvalucion','SELECT'),
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
(gen_random_uuid(), now(),idRolSecretaria,'registroComentarios','SELECT'),
/* 11 Cumplimiento Evaluaciones */
(gen_random_uuid(), now(),idRolSecretaria,'registroCumplimientoEvaluaciones','SELECT'),
/* 12 Equipo Evaluador (DELETE al eliminar eventos) */
(gen_random_uuid(), now(),idRolSecretaria,'registroEquipoEvaluador','DELETE'),
(gen_random_uuid(), now(),idRolSecretaria,'registroEquipoEvaluador','SELECT'),
/* 13 Eventos */
(gen_random_uuid(), now(),idRolSecretaria,'registroEventos','INSERT'),
(gen_random_uuid(), now(),idRolSecretaria,'registroEventos','UPDATE'),
(gen_random_uuid(), now(),idRolSecretaria,'registroEventos','DELETE'),
(gen_random_uuid(), now(),idRolSecretaria,'registroEventos','SELECT'),
/* 15 Solicitud de revision */
(gen_random_uuid(), now(),idRolSecretaria,'respuestaSolicitudRevicion','SELECT'),
/* 16 Roles */
(gen_random_uuid(), now(),idRolSecretaria,'roles','SELECT'),
/* 18 Rubricas */
(gen_random_uuid(), now(),idRolSecretaria,'rubricas','SELECT'),
/* 19 Solicitud de revision */
(gen_random_uuid(), now(),idRolSecretaria,'solicitudRevicion','SELECT'),
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
(gen_random_uuid(), now(),idRolComiteDisciplina,'registroEquipoEvaluador','SELECT'),

/* 13 Eventos (ver eventos donde está asignado) */
(gen_random_uuid(), now(),idRolComiteDisciplina,'registroEventos','SELECT'),

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

(gen_random_uuid(), now(),idRolLiderbanda,'criteriosEvalucion','SELECT'),

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
(gen_random_uuid(), now(),idRolLiderbanda,'registroComentarios','SELECT'),

/* 11 Cumplimiento Evaluaciones */


(gen_random_uuid(), now(),idRolLiderbanda,'registroCumplimientoEvaluaciones','SELECT'),

/* 12 Equipo Evaluador */

(gen_random_uuid(), now(),idRolLiderbanda,'registroEquipoEvaluador','SELECT'),

/* 13 Eventos */

(gen_random_uuid(), now(),idRolLiderbanda,'registroEventos','SELECT'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */

(gen_random_uuid(), now(),idRolLiderbanda,'respuestaSolicitudRevicion','SELECT'),

/* 16 Roles */

(gen_random_uuid(), now(),idRolLiderbanda,'roles','SELECT'),
/* ❌ 17 Roles equipo evaluador */

/* 18 Rubricas */

(gen_random_uuid(), now(),idRolLiderbanda,'rubricas','SELECT'),

/* 19 Solicitud de revision */

(gen_random_uuid(), now(),idRolLiderbanda,'solicitudRevicion','SELECT'),

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
(gen_random_uuid(), now(),idRolResponsableBandas,'criteriosEvalucion','SELECT'),
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
(gen_random_uuid(), now(),idRolResponsableBandas,'registroComentarios','SELECT'),
/* 11 Cumplimiento Evaluaciones */
(gen_random_uuid(), now(),idRolResponsableBandas,'registroCumplimientoEvaluaciones','SELECT'),
/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),idRolResponsableBandas,'registroEquipoEvaluador','SELECT'),
/* 13 Eventos */
(gen_random_uuid(), now(),idRolResponsableBandas,'registroEventos','SELECT'),
/* 15 Solicitud de revision */
(gen_random_uuid(), now(),idRolResponsableBandas,'respuestaSolicitudRevicion','SELECT'),
/* 16 Roles */
(gen_random_uuid(), now(),idRolResponsableBandas,'roles','SELECT'),
/* 18 Rubricas */
(gen_random_uuid(), now(),idRolResponsableBandas,'rubricas','SELECT'),
/* 19 Solicitud de revision */
(gen_random_uuid(), now(),idRolResponsableBandas,'solicitudRevicion','SELECT'),
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
(gen_random_uuid(), now(),idRolResponsableRubricas,'criteriosEvalucion','INSERT'),
(gen_random_uuid(), now(),idRolResponsableRubricas,'criteriosEvalucion','UPDATE'),
(gen_random_uuid(), now(),idRolResponsableRubricas,'criteriosEvalucion','DELETE'),
(gen_random_uuid(), now(),idRolResponsableRubricas,'criteriosEvalucion','SELECT'),
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
(gen_random_uuid(), now(),idRolResponsableRubricas,'registroComentarios','SELECT'),
/* 11 Cumplimiento Evaluaciones */
(gen_random_uuid(), now(),idRolResponsableRubricas,'registroCumplimientoEvaluaciones','SELECT'),
/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),idRolResponsableRubricas,'registroEquipoEvaluador','SELECT'),
/* 13 Eventos */
(gen_random_uuid(), now(),idRolResponsableRubricas,'registroEventos','SELECT'),
/* 15 Solicitud de revision */
(gen_random_uuid(), now(),idRolResponsableRubricas,'respuestaSolicitudRevicion','SELECT'),
/* 16 Roles */
(gen_random_uuid(), now(),idRolResponsableRubricas,'roles','SELECT'),
/* 18 Rubricas */
(gen_random_uuid(), now(),idRolResponsableRubricas,'rubricas','INSERT'),
(gen_random_uuid(), now(),idRolResponsableRubricas,'rubricas','UPDATE'),
(gen_random_uuid(), now(),idRolResponsableRubricas,'rubricas','DELETE'),
(gen_random_uuid(), now(),idRolResponsableRubricas,'rubricas','SELECT'),
/* 19 Solicitud de revision */
(gen_random_uuid(), now(),idRolResponsableRubricas,'solicitudRevicion','SELECT'),
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
(gen_random_uuid(), now(),idRolResponsableUsuarios,'criteriosEvalucion','SELECT'),
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
(gen_random_uuid(), now(),idRolResponsableUsuarios,'registroComentarios','SELECT'),
/* 11 Cumplimiento Evaluaciones */
(gen_random_uuid(), now(),idRolResponsableUsuarios,'registroCumplimientoEvaluaciones','SELECT'),
/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),idRolResponsableUsuarios,'registroEquipoEvaluador','SELECT'),
/* 13 Eventos */
(gen_random_uuid(), now(),idRolResponsableUsuarios,'registroEventos','SELECT'),
/* 15 Solicitud de revision */
(gen_random_uuid(), now(),idRolResponsableUsuarios,'respuestaSolicitudRevicion','SELECT'),
/* 16 Roles */
(gen_random_uuid(), now(),idRolResponsableUsuarios,'roles','SELECT'),
/* 18 Rubricas */
(gen_random_uuid(), now(),idRolResponsableUsuarios,'rubricas','SELECT'),
/* 19 Solicitud de revision */
(gen_random_uuid(), now(),idRolResponsableUsuarios,'solicitudRevicion','SELECT'),
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
(gen_random_uuid(), now(),idRolResponsableEventos,'criteriosEvalucion','SELECT'),
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
(gen_random_uuid(), now(),idRolResponsableEventos,'registroComentarios','SELECT'),
/* 11 Cumplimiento Evaluaciones */
(gen_random_uuid(), now(),idRolResponsableEventos,'registroCumplimientoEvaluaciones','SELECT'),
/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),idRolResponsableEventos,'registroEquipoEvaluador','SELECT'),
/* 13 Eventos */
(gen_random_uuid(), now(),idRolResponsableEventos,'registroEventos','INSERT'),
(gen_random_uuid(), now(),idRolResponsableEventos,'registroEventos','UPDATE'),
(gen_random_uuid(), now(),idRolResponsableEventos,'registroEventos','DELETE'),
(gen_random_uuid(), now(),idRolResponsableEventos,'registroEventos','SELECT'),
/* 15 Solicitud de revision */
(gen_random_uuid(), now(),idRolResponsableEventos,'respuestaSolicitudRevicion','SELECT'),
/* 16 Roles */
(gen_random_uuid(), now(),idRolResponsableEventos,'roles','SELECT'),
/* 18 Rubricas */
(gen_random_uuid(), now(),idRolResponsableEventos,'rubricas','SELECT'),
/* 19 Solicitud de revision */
(gen_random_uuid(), now(),idRolResponsableEventos,'solicitudRevicion','SELECT'),
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
(gen_random_uuid(), now(),idRolResponsableMesa,'criteriosEvalucion','SELECT'),
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
(gen_random_uuid(), now(),idRolResponsableMesa,'registroComentarios','SELECT'),
/* 11 Cumplimiento Evaluaciones */
(gen_random_uuid(), now(),idRolResponsableMesa,'registroCumplimientoEvaluaciones','SELECT'),
/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),idRolResponsableMesa,'registroEquipoEvaluador','INSERT'),
(gen_random_uuid(), now(),idRolResponsableMesa,'registroEquipoEvaluador','UPDATE'),
(gen_random_uuid(), now(),idRolResponsableMesa,'registroEquipoEvaluador','DELETE'),
(gen_random_uuid(), now(),idRolResponsableMesa,'registroEquipoEvaluador','SELECT'),
/* 13 Eventos */
(gen_random_uuid(), now(),idRolResponsableMesa,'registroEventos','UPDATE'),
(gen_random_uuid(), now(),idRolResponsableMesa,'registroEventos','SELECT'),
/* 15 Solicitud de revision */
(gen_random_uuid(), now(),idRolResponsableMesa,'respuestaSolicitudRevicion','INSERT'),
(gen_random_uuid(), now(),idRolResponsableMesa,'respuestaSolicitudRevicion','SELECT'),
/* 16 Roles */
(gen_random_uuid(), now(),idRolResponsableMesa,'roles','SELECT'),
/* 18 Rubricas */
(gen_random_uuid(), now(),idRolResponsableMesa,'rubricas','SELECT'),
/* 19 Solicitud de revision */
(gen_random_uuid(), now(),idRolResponsableMesa,'registroCumplimientoEvaluaciones','UPDATE'),
(gen_random_uuid(), now(),idRolResponsableMesa,'solicitudRevicion','UPDATE'),
(gen_random_uuid(), now(),idRolResponsableMesa,'solicitudRevicion','SELECT'),
/* 20 Confirmacion asistencia */
(gen_random_uuid(), now(),idRolResponsableMesa,'confirmacion_asistencia','SELECT'),
(gen_random_uuid(), now(),idRolResponsableMesa,'confirmacion_asistencia','UPDATE'),

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
(gen_random_uuid(), now(),idRolAdminTemporal,'alertas_evaluacion','EXECUTE');

/* --------------------------------------------------------------------------
   Comité de disciplina: el login hace embed roles(*) en perfiles.
   Sin permiso roles/SELECT, RLS devuelve roles=null y el front rechaza el acceso.
   (Idempotente por si el bloque VALUES de arriba corrió sin esta fila.)
   -------------------------------------------------------------------------- */
INSERT INTO public.permisos ("idPermiso", "created_at", "idForaneaRol", "tabla", "accion")
SELECT gen_random_uuid(), now(), idRolComiteDisciplina, 'roles', 'SELECT'
WHERE NOT EXISTS (
  SELECT 1
  FROM public.permisos AS p
  WHERE p."idForaneaRol" = idRolComiteDisciplina
    AND p.tabla = 'roles'
    AND p.accion = 'SELECT'
);

INSERT INTO public.permisos ("idPermiso", "created_at", "idForaneaRol", "tabla", "accion")
SELECT gen_random_uuid(), now(), idRolComiteDisciplina, 'registroEquipoEvaluador', 'SELECT'
WHERE NOT EXISTS (
  SELECT 1 FROM public.permisos AS p
  WHERE p."idForaneaRol" = idRolComiteDisciplina
    AND p.tabla = 'registroEquipoEvaluador' AND p.accion = 'SELECT'
);

INSERT INTO public.permisos ("idPermiso", "created_at", "idForaneaRol", "tabla", "accion")
SELECT gen_random_uuid(), now(), idRolComiteDisciplina, 'registroEventos', 'SELECT'
WHERE NOT EXISTS (
  SELECT 1 FROM public.permisos AS p
  WHERE p."idForaneaRol" = idRolComiteDisciplina
    AND p.tabla = 'registroEventos' AND p.accion = 'SELECT'
);

INSERT INTO public.permisos ("idPermiso", "created_at", "idForaneaRol", "tabla", "accion")
SELECT gen_random_uuid(), now(), idRolComiteDisciplina, 'confirmacion_asistencia', 'SELECT'
WHERE NOT EXISTS (
  SELECT 1 FROM public.permisos AS p
  WHERE p."idForaneaRol" = idRolComiteDisciplina
    AND p.tabla = 'confirmacion_asistencia' AND p.accion = 'SELECT'
);

INSERT INTO public.permisos ("idPermiso", "created_at", "idForaneaRol", "tabla", "accion")
SELECT gen_random_uuid(), now(), idRolComiteDisciplina, t.tabla, t.accion
FROM (VALUES
  ('checkout', 'INSERT'),
  ('checkout', 'UPDATE'),
  ('checkout', 'SELECT')
) AS t(tabla, accion)
WHERE NOT EXISTS (
  SELECT 1 FROM public.permisos AS p
  WHERE p."idForaneaRol" = idRolComiteDisciplina
    AND p.tabla = t.tabla AND p.accion = t.accion
);

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

DROP POLICY IF EXISTS "editar" ON public."registroCumplimientoEvaluaciones";
CREATE POLICY "editar" ON public."registroCumplimientoEvaluaciones"
  FOR UPDATE
  USING (true)
  WITH CHECK (public.revisar_permisos('registroCumplimientoEvaluaciones'::text, 'UPDATE'::text));

DROP POLICY IF EXISTS "editar" ON public."respuestaSolicitudRevicion";
CREATE POLICY "editar" ON public."respuestaSolicitudRevicion"
  FOR UPDATE
  USING (true)
  WITH CHECK (public.revisar_permisos('respuestaSolicitudRevicion'::text, 'UPDATE'::text));

DROP POLICY IF EXISTS "eliminar" ON public."registroCumplimientoEvaluaciones";
CREATE POLICY "eliminar" ON public."registroCumplimientoEvaluaciones"
  FOR DELETE
  USING (public.revisar_permisos('registroCumplimientoEvaluaciones'::text, 'DELETE'::text));

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

-- Políticas RLS: checkout (requieren filas en public.permisos arriba)

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

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.checkout TO anon, authenticated, service_role;
GRANT SELECT ON public.vista_detalle_checkout TO anon, authenticated, service_role;

-- =============================================================================
-- Storage: buckets y políticas RLS (fotos de perfil y logos de bandas)
-- Deben coincidir con NEXT_PUBLIC_SUPABASE_BUCKET_PERFILES y bandasServices.ts
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('img-fotos-perfiles-aurora', 'img-fotos-perfiles-aurora', false),
  ('imgLogoBandas', 'imgLogoBandas', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas legacy (migración 20260501031419); se reemplazan por nombres explícitos
DROP POLICY IF EXISTS "agregar 1gmiffv_0" ON storage.objects;
DROP POLICY IF EXISTS "editar 1gmiffv_0" ON storage.objects;
DROP POLICY IF EXISTS "eliminar 1gmiffv_0" ON storage.objects;
DROP POLICY IF EXISTS "eliminar 1gmiffv_1" ON storage.objects;
DROP POLICY IF EXISTS "leer 1gmiffv_0" ON storage.objects;

-- img-fotos-perfiles-aurora
DROP POLICY IF EXISTS "storage_perfiles_agregar" ON storage.objects;
CREATE POLICY "storage_perfiles_agregar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'img-fotos-perfiles-aurora');

DROP POLICY IF EXISTS "storage_perfiles_editar" ON storage.objects;
CREATE POLICY "storage_perfiles_editar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'img-fotos-perfiles-aurora');

DROP POLICY IF EXISTS "storage_perfiles_eliminar" ON storage.objects;
CREATE POLICY "storage_perfiles_eliminar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'img-fotos-perfiles-aurora');

DROP POLICY IF EXISTS "storage_perfiles_leer_authenticated" ON storage.objects;
CREATE POLICY "storage_perfiles_leer_authenticated"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'img-fotos-perfiles-aurora');

DROP POLICY IF EXISTS "storage_perfiles_leer_public" ON storage.objects;
CREATE POLICY "storage_perfiles_leer_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'img-fotos-perfiles-aurora');

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
