-- Seed data para la base de datos de Supabase
-- Sintaxis correcta postgre_sql
--
-- Usuarios por defecto en este seed:
--   admin:      admin@sasha.com      / adminsasha01
--   secretaria: secretaria@sasha.com / secretariasasha

-- variables
do $$
declare
    id_user uuid := gen_random_uuid();
    user_email text := 'admin@sasha.com';
    user_password text := 'adminsasha';
    id_user_secretaria uuid := gen_random_uuid();
    user_email_secretaria text := 'secretaria@sasha.com';
    user_password_secretaria text := 'secretariasasha';
    id_rol_developer uuid := gen_random_uuid();
    id_rol_admin uuid := gen_random_uuid();
    id_rol_admin_temporal uuid := gen_random_uuid();
    id_rol_jurado uuid := gen_random_uuid();
    id_rol_fiscal uuid := gen_random_uuid();
    id_rol_dirigente uuid := gen_random_uuid();
    id_rol_liderbanda uuid := gen_random_uuid();
    id_rol_responsable_bandas uuid := gen_random_uuid();
    id_rol_responsable_rubricas uuid := gen_random_uuid();
    id_rol_responsable_usuarios uuid := gen_random_uuid();
    id_rol_responsable_eventos uuid := gen_random_uuid();
    id_rol_responsable_mesa uuid := gen_random_uuid();
    id_rol_secretaria uuid := gen_random_uuid();
    id_rol_comite_disciplina uuid := gen_random_uuid();
    id_federacion uuid := gen_random_uuid();

   



    
begin

-- federacion (primero)
insert into public.federaciones (id_federacion,"created_at",nombre_federacion) 
values (
    id_federacion,
    now(),
    'SASHA-DEV'
);

-- dentro del begin, después de insertar la federación:


/* 

    id_rol: string; // uuid
    created_at: string; // timestamp with time zone
    id_foranea_federacion: string; // uuid
    nombre_rol: string; // text
    estado_rol: boolean;

 */

insert into public.roles (id_rol,created_at,id_foranea_federacion,nombre_rol,estado_rol)
values 
(id_rol_developer,now(),id_federacion,'developer',true),
(id_rol_admin,now(),id_federacion,'admin',true),
(id_rol_admin_temporal,now(),id_federacion,'admin temporal',true),
(id_rol_jurado,now(),id_federacion,'jurado',true),
(id_rol_fiscal,now(),id_federacion,'fiscal',true),
(id_rol_dirigente,now(),id_federacion,'dirigente',true),
(id_rol_liderbanda,now(),id_federacion,'lider de banda',true),
(id_rol_responsable_bandas,now(),id_federacion,'responsable de bandas',true),
(id_rol_responsable_rubricas,now(),id_federacion,'responsable de rubricas',true),
(id_rol_responsable_usuarios,now(),id_federacion,'responsable de usuarios',true),
(id_rol_responsable_eventos,now(),id_federacion,'responsable de eventos',true),
(id_rol_responsable_mesa,now(),id_federacion,'responsable de mesa',true),
(id_rol_secretaria,now(),id_federacion,'secretaria',true),
(id_rol_comite_disciplina,now(),id_federacion,'comite de disciplina',true);





-- user en auth.users (tercero)
-- 1. Insertar el usuario en auth.users
  insert into auth.users (
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
  values (
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
    '{"name": "Sasha Admin", "role": "admin"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- 2. Insertar la identidad (Fundamental para que el login funcione)
  insert into auth.identities (
    provider_id,
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
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
insert into perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos") 
values(
    gen_random_uuid(), now(),'Sasha Admin',id_federacion,id_user,id_rol_admin,true
);

-- user secretaria en auth.users
  insert into auth.users (
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
  values (
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
    '{"name": "Sasha Secretaria", "role": "secretaria"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    provider_id,
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    user_email_secretaria,
    id_user_secretaria,
    id_user_secretaria,
    format('{"sub":"%s","email":"%s"}', id_user_secretaria, user_email_secretaria)::jsonb,
    'email',
    now(),
    now(),
    now()
  );

insert into perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
values(
    gen_random_uuid(), now(),'Sasha Secretaria',id_federacion,id_user_secretaria,id_rol_secretaria,true
);




-- permisos para admin
insert into public.permisos (id_permiso,"created_at",id_foranea_rol,"tabla","accion")
values 
/* ======================================================================== */
/* developer */
/* 01 Bandas */

(gen_random_uuid(), now(), id_rol_developer,'bandas','select'),

/* 02 Categorias */

(gen_random_uuid(), now(), id_rol_developer,'categorias','select'),

/* 03 Criterios de Evaluacion */

(gen_random_uuid(), now(), id_rol_developer,'criterios_evaluacion','select'),

/* 04 Cumplimientos */

(gen_random_uuid(), now(), id_rol_developer,'cumplimientos','select'),

/* 05 Federaciones */

(gen_random_uuid(), now(), id_rol_developer,'federaciones','insert'),
(gen_random_uuid(), now(), id_rol_developer,'federaciones','select'),

/* 07 Perfiles */
(gen_random_uuid(), now(), id_rol_developer,'perfiles','insert'),
(gen_random_uuid(), now(), id_rol_developer,'perfiles','update'),
(gen_random_uuid(), now(), id_rol_developer,'perfiles','delete'),
(gen_random_uuid(), now(), id_rol_developer,'perfiles','select'),

/*❌ 08 Permisos */

/* 09 Regiones */


(gen_random_uuid(), now(), id_rol_developer,'regiones','select'),

/* 10 Comentarios */
(gen_random_uuid(), now(), id_rol_developer,'registro_comentarios','select'),
(gen_random_uuid(), now(), id_rol_developer,'registro_comentarios','insert'),

/* 11 Cumplimiento Evaluaciones */


(gen_random_uuid(), now(), id_rol_developer,'registro_cumplimiento_evaluaciones','select'),

/* 12 Equipo Evaluador */

(gen_random_uuid(), now(), id_rol_developer,'registro_equipo_evaluador','select'),

/* 13 Eventos */

(gen_random_uuid(), now(), id_rol_developer,'registro_eventos','select'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */

(gen_random_uuid(), now(), id_rol_developer,'respuesta_solicitud_revision','select'),

/* 16 Roles */
(gen_random_uuid(), now(), id_rol_developer,'roles','insert'),
(gen_random_uuid(), now(), id_rol_developer,'roles','update'),
(gen_random_uuid(), now(), id_rol_developer,'roles','delete'),
(gen_random_uuid(), now(), id_rol_developer,'roles','select'),
/* ❌ 17 Roles equipo evaluador */

/* 18 Rubricas */

(gen_random_uuid(), now(), id_rol_developer,'rubricas','select'),

/* 19 Solicitud de revision */

(gen_random_uuid(), now(), id_rol_developer,'solicitud_revision','select'),

/* 20 Confirmacion asistencia */

(gen_random_uuid(), now(), id_rol_developer,'confirmacion_asistencia','select'),

/* 23 Copas */
(gen_random_uuid(), now(), id_rol_developer,'copas','select'),

/* 28 Alertas evaluación duplicada */
(gen_random_uuid(), now(), id_rol_developer,'alertas_evaluacion','select'),
(gen_random_uuid(), now(), id_rol_developer,'alertas_evaluacion','execute'),

/*🔷🔷🔷 ========================================================================🔷🔷🔷 */
/* admin */
/* 01 Bandas */
(gen_random_uuid(), now(),id_rol_admin,'bandas','insert'),
(gen_random_uuid(), now(),id_rol_admin,'bandas','update'),
(gen_random_uuid(), now(),id_rol_admin,'bandas','delete'),
(gen_random_uuid(), now(),id_rol_admin,'bandas','select'),

/* 02 Categorias */
(gen_random_uuid(), now(),id_rol_admin,'categorias','insert'),
(gen_random_uuid(), now(),id_rol_admin,'categorias','update'),
(gen_random_uuid(), now(),id_rol_admin,'categorias','delete'),
(gen_random_uuid(), now(),id_rol_admin,'categorias','select'),

/* 03 Criterios de Evaluacion */
(gen_random_uuid(), now(),id_rol_admin,'criterios_evaluacion','insert'),
(gen_random_uuid(), now(),id_rol_admin,'criterios_evaluacion','update'),
(gen_random_uuid(), now(),id_rol_admin,'criterios_evaluacion','delete'),
(gen_random_uuid(), now(),id_rol_admin,'criterios_evaluacion','select'),

/* 04 Cumplimientos */
(gen_random_uuid(), now(),id_rol_admin,'cumplimientos','insert'),
(gen_random_uuid(), now(),id_rol_admin,'cumplimientos','update'),
(gen_random_uuid(), now(),id_rol_admin,'cumplimientos','delete'),
(gen_random_uuid(), now(),id_rol_admin,'cumplimientos','select'),

/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_admin,'federaciones','select'),

/* 07 Perfiles */
(gen_random_uuid(), now(),id_rol_admin,'perfiles','insert'),
(gen_random_uuid(), now(),id_rol_admin,'perfiles','update'),
(gen_random_uuid(), now(),id_rol_admin,'perfiles','delete'),
(gen_random_uuid(), now(),id_rol_admin,'perfiles','select'),

/*❌ 08 Permisos */

/* 09 Regiones */

(gen_random_uuid(), now(),id_rol_admin,'regiones','insert'),
(gen_random_uuid(), now(),id_rol_admin,'regiones','update'),
(gen_random_uuid(), now(),id_rol_admin,'regiones','delete'),
(gen_random_uuid(), now(),id_rol_admin,'regiones','select'),

/* 10 Comentarios */
(gen_random_uuid(), now(),id_rol_admin,'registro_comentarios','select'),

/* 11 Cumplimiento Evaluaciones */

(gen_random_uuid(), now(),id_rol_admin,'registro_cumplimiento_evaluaciones','update'),
(gen_random_uuid(), now(),id_rol_admin,'registro_cumplimiento_evaluaciones','select'),

/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),id_rol_admin,'registro_equipo_evaluador','insert'),
(gen_random_uuid(), now(),id_rol_admin,'registro_equipo_evaluador','update'),
(gen_random_uuid(), now(),id_rol_admin,'registro_equipo_evaluador','delete'),
(gen_random_uuid(), now(),id_rol_admin,'registro_equipo_evaluador','select'),

/* 13 Eventos */
(gen_random_uuid(), now(),id_rol_admin,'registro_eventos','insert'),
(gen_random_uuid(), now(),id_rol_admin,'registro_eventos','update'),
(gen_random_uuid(), now(),id_rol_admin,'registro_eventos','delete'),
(gen_random_uuid(), now(),id_rol_admin,'registro_eventos','select'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_admin,'respuesta_solicitud_revision','insert'),
(gen_random_uuid(), now(),id_rol_admin,'respuesta_solicitud_revision','select'),

/* 16 Roles */
(gen_random_uuid(), now(),id_rol_admin,'roles','update'),
(gen_random_uuid(), now(),id_rol_admin,'roles','select'),
/* ❌ 17 Roles equipo evaluador */

/* 18 Rubricas */
(gen_random_uuid(), now(),id_rol_admin,'rubricas','insert'),
(gen_random_uuid(), now(),id_rol_admin,'rubricas','update'),
(gen_random_uuid(), now(),id_rol_admin,'rubricas','delete'),
(gen_random_uuid(), now(),id_rol_admin,'rubricas','select'),

/* 19 Solicitud de revision */

(gen_random_uuid(), now(),id_rol_admin,'solicitud_revision','update'),
(gen_random_uuid(), now(),id_rol_admin,'solicitud_revision','select'),

/* 20 Confirmacion asistencia */

(gen_random_uuid(), now(),id_rol_admin,'confirmacion_asistencia','insert'),
(gen_random_uuid(), now(),id_rol_admin,'confirmacion_asistencia','update'),
(gen_random_uuid(), now(),id_rol_admin,'confirmacion_asistencia','delete'),
(gen_random_uuid(), now(),id_rol_admin,'confirmacion_asistencia','select'),

/* 21 Escuadras */
(gen_random_uuid(), now(),id_rol_admin,'escuadras','insert'),
(gen_random_uuid(), now(),id_rol_admin,'escuadras','update'),
(gen_random_uuid(), now(),id_rol_admin,'escuadras','delete'),
(gen_random_uuid(), now(),id_rol_admin,'escuadras','select'),

/* 22 Premios escuadra (tabla premios_escuadra) */
(gen_random_uuid(), now(),id_rol_admin,'premios_escuadra','insert'),
(gen_random_uuid(), now(),id_rol_admin,'premios_escuadra','update'),
(gen_random_uuid(), now(),id_rol_admin,'premios_escuadra','delete'),
(gen_random_uuid(), now(),id_rol_admin,'premios_escuadra','select'),

/* 23 Copas (lectura amplia; gestión admin / admin temporal / mesa) */
(gen_random_uuid(), now(),id_rol_admin,'copas','insert'),
(gen_random_uuid(), now(),id_rol_admin,'copas','update'),
(gen_random_uuid(), now(),id_rol_admin,'copas','delete'),
(gen_random_uuid(), now(),id_rol_admin,'copas','select'),

/* 28 Checkout — admin (consulta) */
(gen_random_uuid(), now(),id_rol_admin,'checkout','select'),

/* 24 Sanciones (catálogo; crud completo) */
(gen_random_uuid(), now(),id_rol_admin,'sanciones','insert'),
(gen_random_uuid(), now(),id_rol_admin,'sanciones','update'),
(gen_random_uuid(), now(),id_rol_admin,'sanciones','delete'),
(gen_random_uuid(), now(),id_rol_admin,'sanciones','select'),
/* 25 Registro sanciones (lectura + aplicar sanción al aprobar solicitud) */
(gen_random_uuid(), now(),id_rol_admin,'registro_sanciones','select'),
(gen_random_uuid(), now(),id_rol_admin,'registro_sanciones','insert'),



/* 🔷🔷🔷========================================================================🔷🔷🔷 */
/* admin temporal */
/* 01 Bandas */
(gen_random_uuid(), now(),id_rol_admin_temporal,'bandas','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'bandas','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'bandas','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'bandas','select'),

/* 02 Categorias */
(gen_random_uuid(), now(),id_rol_admin_temporal,'categorias','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'categorias','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'categorias','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'categorias','select'),

/* 03 Criterios de Evaluacion */
(gen_random_uuid(), now(),id_rol_admin_temporal,'criterios_evaluacion','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'criterios_evaluacion','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'criterios_evaluacion','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'criterios_evaluacion','select'),

/* 04 Cumplimientos */
(gen_random_uuid(), now(),id_rol_admin_temporal,'cumplimientos','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'cumplimientos','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'cumplimientos','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'cumplimientos','select'),

/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_admin_temporal,'federaciones','select'),

/* 07 Perfiles */

(gen_random_uuid(), now(),id_rol_admin_temporal,'perfiles','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'perfiles','update'),

(gen_random_uuid(), now(),id_rol_admin_temporal,'perfiles','select'),

/*❌ 08 Permisos */

/* 09 Regiones */

(gen_random_uuid(), now(),id_rol_admin_temporal,'regiones','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'regiones','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'regiones','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'regiones','select'),

/* 10 Comentarios */
(gen_random_uuid(), now(),id_rol_admin_temporal,'registro_comentarios','select'),

/* 11 Cumplimiento Evaluaciones */

(gen_random_uuid(), now(),id_rol_admin_temporal,'registro_cumplimiento_evaluaciones','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'registro_cumplimiento_evaluaciones','select'),

/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),id_rol_admin_temporal,'registro_equipo_evaluador','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'registro_equipo_evaluador','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'registro_equipo_evaluador','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'registro_equipo_evaluador','select'),

/* 13 Eventos */
(gen_random_uuid(), now(),id_rol_admin_temporal,'registro_eventos','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'registro_eventos','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'registro_eventos','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'registro_eventos','select'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_admin_temporal,'respuesta_solicitud_revision','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'respuesta_solicitud_revision','select'),

/* 16 Roles */
(gen_random_uuid(), now(),id_rol_admin_temporal,'roles','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'roles','select'),
/* ❌ 17 Roles equipo evaluador */

/* 18 Rubricas */
(gen_random_uuid(), now(),id_rol_admin_temporal,'rubricas','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'rubricas','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'rubricas','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'rubricas','select'),

/* 19 Solicitud de revision */

(gen_random_uuid(), now(),id_rol_admin_temporal,'solicitud_revision','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'solicitud_revision','select'),

/* 20 Confirmacion asistencia */

(gen_random_uuid(), now(),id_rol_admin_temporal,'confirmacion_asistencia','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'confirmacion_asistencia','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'confirmacion_asistencia','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'confirmacion_asistencia','select'),

/* 21 Escuadras */
(gen_random_uuid(), now(),id_rol_admin_temporal,'escuadras','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'escuadras','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'escuadras','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'escuadras','select'),

/* 22 Premios escuadra (tabla premios_escuadra) */
(gen_random_uuid(), now(),id_rol_admin_temporal,'premios_escuadra','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'premios_escuadra','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'premios_escuadra','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'premios_escuadra','select'),

/* 23 Copas */
(gen_random_uuid(), now(),id_rol_admin_temporal,'copas','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'copas','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'copas','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'copas','select'),

/* 28 Checkout — admin temporal (consulta) */
(gen_random_uuid(), now(),id_rol_admin_temporal,'checkout','select'),

/* 24 Sanciones (catálogo; crud completo) */
(gen_random_uuid(), now(),id_rol_admin_temporal,'sanciones','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'sanciones','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'sanciones','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'sanciones','select'),
/* 25 Registro sanciones (solo lectura) */
(gen_random_uuid(), now(),id_rol_admin_temporal,'registro_sanciones','select'),




/* 🔷🔷🔷========================================================================🔷🔷🔷 */
/* jurado */
/* 01 Bandas */

(gen_random_uuid(), now(),id_rol_jurado,'bandas','select'),

/* 02 Categorias */

(gen_random_uuid(), now(),id_rol_jurado,'categorias','select'),

/* 03 Criterios de Evaluacion */

(gen_random_uuid(), now(),id_rol_jurado,'criterios_evaluacion','select'),

/* 04 Cumplimientos */

(gen_random_uuid(), now(),id_rol_jurado,'cumplimientos','select'),

/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_jurado,'federaciones','select'),

/* 07 Perfiles */

(gen_random_uuid(), now(),id_rol_jurado,'perfiles','update'),

(gen_random_uuid(), now(),id_rol_jurado,'perfiles','select'),

/*❌ 08 Permisos */

/* 09 Regiones */


(gen_random_uuid(), now(),id_rol_jurado,'regiones','select'),

/* 10 Comentarios */
(gen_random_uuid(), now(),id_rol_jurado,'registro_comentarios','select'),
(gen_random_uuid(), now(),id_rol_jurado,'registro_comentarios','insert'),

/* 11 Cumplimiento Evaluaciones */

(gen_random_uuid(), now(),id_rol_jurado,'registro_cumplimiento_evaluaciones','insert'),
(gen_random_uuid(), now(),id_rol_jurado,'registro_cumplimiento_evaluaciones','select'),

/* 12 Equipo Evaluador */

(gen_random_uuid(), now(),id_rol_jurado,'registro_equipo_evaluador','select'),

/* 13 Eventos */

(gen_random_uuid(), now(),id_rol_jurado,'registro_eventos','select'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */

(gen_random_uuid(), now(),id_rol_jurado,'respuesta_solicitud_revision','select'),

/* 16 Roles */

(gen_random_uuid(), now(),id_rol_jurado,'roles','select'),
/* ❌ 17 Roles equipo evaluador */

/* 18 Rubricas */

(gen_random_uuid(), now(),id_rol_jurado,'rubricas','select'),

/* 19 Solicitud de revision */

(gen_random_uuid(), now(),id_rol_jurado,'solicitud_revision','select'),

/* 20 Confirmacion asistencia */

(gen_random_uuid(), now(),id_rol_jurado,'confirmacion_asistencia','select'),

/* 23 Copas */
(gen_random_uuid(), now(),id_rol_jurado,'copas','select'),




/* 🔷🔷🔷========================================================================🔷🔷🔷 */
/* fiscal */
/* 01 Bandas */

(gen_random_uuid(), now(),id_rol_fiscal,'bandas','select'),

/* 02 Categorias */

(gen_random_uuid(), now(),id_rol_fiscal,'categorias','select'),

/* 03 Criterios de Evaluacion */

(gen_random_uuid(), now(),id_rol_fiscal,'criterios_evaluacion','select'),

/* 04 Cumplimientos */

(gen_random_uuid(), now(),id_rol_fiscal,'cumplimientos','select'),

/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_fiscal,'federaciones','select'),

/* 07 Perfiles */

(gen_random_uuid(), now(),id_rol_fiscal,'perfiles','update'),

(gen_random_uuid(), now(),id_rol_fiscal,'perfiles','select'),

/*❌ 08 Permisos */

/* 09 Regiones */


(gen_random_uuid(), now(),id_rol_fiscal,'regiones','select'),

/* 10 Comentarios */
(gen_random_uuid(), now(),id_rol_fiscal,'registro_comentarios','select'),

/* 11 Cumplimiento Evaluaciones */


(gen_random_uuid(), now(),id_rol_fiscal,'registro_cumplimiento_evaluaciones','select'),

/* 12 Equipo Evaluador */

(gen_random_uuid(), now(),id_rol_fiscal,'registro_equipo_evaluador','select'),

/* 13 Eventos */

(gen_random_uuid(), now(),id_rol_fiscal,'registro_eventos','select'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */

(gen_random_uuid(), now(),id_rol_fiscal,'respuesta_solicitud_revision','select'),

/* 16 Roles */

(gen_random_uuid(), now(),id_rol_fiscal,'roles','select'),
/* ❌ 17 Roles equipo evaluador */

/* 18 Rubricas */

(gen_random_uuid(), now(),id_rol_fiscal,'rubricas','select'),

/* 19 Solicitud de revision */

(gen_random_uuid(), now(),id_rol_fiscal,'solicitud_revision','insert'),
(gen_random_uuid(), now(),id_rol_fiscal,'solicitud_revision','select'),

/* 20 Confirmacion asistencia */

(gen_random_uuid(), now(),id_rol_fiscal,'confirmacion_asistencia','select'),

/* 23 Copas */
(gen_random_uuid(), now(),id_rol_fiscal,'copas','select'),



/* 🔷🔷🔷========================================================================🔷🔷🔷 */

/* dirigente (misma matriz que líder de banda: lectura operativa + select en roles para rls/embed) */
/* 01 Bandas */

(gen_random_uuid(), now(),id_rol_dirigente,'bandas','select'),

/* 02 Categorias */

(gen_random_uuid(), now(),id_rol_dirigente,'categorias','select'),

/* 03 Criterios de Evaluacion */

(gen_random_uuid(), now(),id_rol_dirigente,'criterios_evaluacion','select'),

/* 04 Cumplimientos */

(gen_random_uuid(), now(),id_rol_dirigente,'cumplimientos','select'),

/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_dirigente,'federaciones','select'),

/* 07 Perfiles */

(gen_random_uuid(), now(),id_rol_dirigente,'perfiles','update'),

(gen_random_uuid(), now(),id_rol_dirigente,'perfiles','select'),

/*❌ 08 Permisos */

/* 09 Regiones */


(gen_random_uuid(), now(),id_rol_dirigente,'regiones','select'),

/* 10 Comentarios */
(gen_random_uuid(), now(),id_rol_dirigente,'registro_comentarios','select'),

/* 11 Cumplimiento Evaluaciones */


(gen_random_uuid(), now(),id_rol_dirigente,'registro_cumplimiento_evaluaciones','select'),

/* 12 Equipo Evaluador */

(gen_random_uuid(), now(),id_rol_dirigente,'registro_equipo_evaluador','select'),

/* 13 Eventos */

(gen_random_uuid(), now(),id_rol_dirigente,'registro_eventos','select'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */

(gen_random_uuid(), now(),id_rol_dirigente,'respuesta_solicitud_revision','select'),

/* 16 Roles */

(gen_random_uuid(), now(),id_rol_dirigente,'roles','select'),
/* ❌ 17 Roles equipo evaluador */

/* 18 Rubricas */

(gen_random_uuid(), now(),id_rol_dirigente,'rubricas','select'),

/* 19 Solicitud de revision */

(gen_random_uuid(), now(),id_rol_dirigente,'solicitud_revision','select'),

/* 20 Confirmacion asistencia */

(gen_random_uuid(), now(),id_rol_dirigente,'confirmacion_asistencia','insert'),
(gen_random_uuid(), now(),id_rol_dirigente,'confirmacion_asistencia','update'),
(gen_random_uuid(), now(),id_rol_dirigente,'confirmacion_asistencia','select'),

/* 23 Copas */
(gen_random_uuid(), now(),id_rol_dirigente,'copas','select'),

/* 28 Checkout — dirigente (confirmar/denegar llegada e ingreso) */
(gen_random_uuid(), now(),id_rol_dirigente,'checkout','update'),
(gen_random_uuid(), now(),id_rol_dirigente,'checkout','select'),


/* 🔷🔷🔷========================================================================🔷🔷🔷 */

/* secretaria: gestión operativa (usuarios, bandas, categorías, regiones, eventos) + confirmación de asistencia y checkout */
/* 01 Bandas */
(gen_random_uuid(), now(),id_rol_secretaria,'bandas','insert'),
(gen_random_uuid(), now(),id_rol_secretaria,'bandas','update'),
(gen_random_uuid(), now(),id_rol_secretaria,'bandas','delete'),
(gen_random_uuid(), now(),id_rol_secretaria,'bandas','select'),
/* 02 Categorias */
(gen_random_uuid(), now(),id_rol_secretaria,'categorias','insert'),
(gen_random_uuid(), now(),id_rol_secretaria,'categorias','update'),
(gen_random_uuid(), now(),id_rol_secretaria,'categorias','delete'),
(gen_random_uuid(), now(),id_rol_secretaria,'categorias','select'),
/* 03 Criterios de Evaluacion */
(gen_random_uuid(), now(),id_rol_secretaria,'criterios_evaluacion','select'),
/* 04 Cumplimientos */
(gen_random_uuid(), now(),id_rol_secretaria,'cumplimientos','select'),
/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_secretaria,'federaciones','select'),
/* 07 Perfiles */
(gen_random_uuid(), now(),id_rol_secretaria,'perfiles','insert'),
(gen_random_uuid(), now(),id_rol_secretaria,'perfiles','update'),
(gen_random_uuid(), now(),id_rol_secretaria,'perfiles','delete'),
(gen_random_uuid(), now(),id_rol_secretaria,'perfiles','select'),
/* 09 Regiones */
(gen_random_uuid(), now(),id_rol_secretaria,'regiones','insert'),
(gen_random_uuid(), now(),id_rol_secretaria,'regiones','update'),
(gen_random_uuid(), now(),id_rol_secretaria,'regiones','delete'),
(gen_random_uuid(), now(),id_rol_secretaria,'regiones','select'),
/* 10 Comentarios */
(gen_random_uuid(), now(),id_rol_secretaria,'registro_comentarios','select'),
/* 11 Cumplimiento Evaluaciones */
(gen_random_uuid(), now(),id_rol_secretaria,'registro_cumplimiento_evaluaciones','select'),
/* 12 Equipo Evaluador (delete al eliminar eventos) */
(gen_random_uuid(), now(),id_rol_secretaria,'registro_equipo_evaluador','delete'),
(gen_random_uuid(), now(),id_rol_secretaria,'registro_equipo_evaluador','select'),
/* 13 Eventos */
(gen_random_uuid(), now(),id_rol_secretaria,'registro_eventos','insert'),
(gen_random_uuid(), now(),id_rol_secretaria,'registro_eventos','update'),
(gen_random_uuid(), now(),id_rol_secretaria,'registro_eventos','delete'),
(gen_random_uuid(), now(),id_rol_secretaria,'registro_eventos','select'),
/* 15 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_secretaria,'respuesta_solicitud_revision','select'),
/* 16 Roles */
(gen_random_uuid(), now(),id_rol_secretaria,'roles','select'),
/* 18 Rubricas */
(gen_random_uuid(), now(),id_rol_secretaria,'rubricas','select'),
/* 19 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_secretaria,'solicitud_revision','select'),
/* 20 Confirmacion asistencia */
(gen_random_uuid(), now(),id_rol_secretaria,'confirmacion_asistencia','insert'),
(gen_random_uuid(), now(),id_rol_secretaria,'confirmacion_asistencia','update'),
(gen_random_uuid(), now(),id_rol_secretaria,'confirmacion_asistencia','select'),

/* 23 Copas */
(gen_random_uuid(), now(),id_rol_secretaria,'copas','select'),

/* 24 Sanciones (solo lectura) */
(gen_random_uuid(), now(),id_rol_secretaria,'sanciones','select'),
/* 25 Registro sanciones (solo lectura) */
(gen_random_uuid(), now(),id_rol_secretaria,'registro_sanciones','select'),

/* 28 Checkout — secretaria (confirmar/denegar llegada e ingreso) */
(gen_random_uuid(), now(),id_rol_secretaria,'checkout','update'),
(gen_random_uuid(), now(),id_rol_secretaria,'checkout','select'),


/* 🔷🔷🔷========================================================================🔷🔷🔷 */

/* comite de disciplina */
/* 01 Bandas */
(gen_random_uuid(), now(),id_rol_comite_disciplina,'bandas','select'),
/* 02 Categorias */
(gen_random_uuid(), now(),id_rol_comite_disciplina,'categorias','select'),
/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_comite_disciplina,'federaciones','select'),
/* 07 Perfiles */
(gen_random_uuid(), now(),id_rol_comite_disciplina,'perfiles','select'),
/* 16 Roles (necesario para embed roles(*) en login) */
(gen_random_uuid(), now(),id_rol_comite_disciplina,'roles','select'),
/* 09 Regiones */
(gen_random_uuid(), now(),id_rol_comite_disciplina,'regiones','select'),
/* 24 Sanciones (solo lectura) */
(gen_random_uuid(), now(),id_rol_comite_disciplina,'sanciones','select'),
/* 25 Registro sanciones (crud completo) */
(gen_random_uuid(), now(),id_rol_comite_disciplina,'registro_sanciones','insert'),
(gen_random_uuid(), now(),id_rol_comite_disciplina,'registro_sanciones','update'),
(gen_random_uuid(), now(),id_rol_comite_disciplina,'registro_sanciones','delete'),
(gen_random_uuid(), now(),id_rol_comite_disciplina,'registro_sanciones','select'),

/* 12 Equipo evaluador (ver asignaciones propias) */
(gen_random_uuid(), now(),id_rol_comite_disciplina,'registro_equipo_evaluador','select'),

/* 13 Eventos (ver eventos donde está asignado) */
(gen_random_uuid(), now(),id_rol_comite_disciplina,'registro_eventos','select'),

/* 20 Confirmación asistencia (bandas confirmadas por evento en checkout) */
(gen_random_uuid(), now(),id_rol_comite_disciplina,'confirmacion_asistencia','select'),

/* 28 Checkout — comite de disciplina (registro de llegada e ingreso) */
(gen_random_uuid(), now(),id_rol_comite_disciplina,'checkout','insert'),
(gen_random_uuid(), now(),id_rol_comite_disciplina,'checkout','update'),
(gen_random_uuid(), now(),id_rol_comite_disciplina,'checkout','select'),


/* 🔷🔷🔷========================================================================🔷🔷🔷 */

/* lider banda */
/* 01 Bandas */

(gen_random_uuid(), now(),id_rol_liderbanda,'bandas','select'),

/* 02 Categorias */

(gen_random_uuid(), now(),id_rol_liderbanda,'categorias','select'),

/* 03 Criterios de Evaluacion */

(gen_random_uuid(), now(),id_rol_liderbanda,'criterios_evaluacion','select'),

/* 04 Cumplimientos */

(gen_random_uuid(), now(),id_rol_liderbanda,'cumplimientos','select'),

/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_liderbanda,'federaciones','select'),

/* 07 Perfiles */

(gen_random_uuid(), now(),id_rol_liderbanda,'perfiles','update'),

(gen_random_uuid(), now(),id_rol_liderbanda,'perfiles','select'),

/*❌ 08 Permisos */

/* 09 Regiones */


(gen_random_uuid(), now(),id_rol_liderbanda,'regiones','select'),

/* 10 Comentarios */
(gen_random_uuid(), now(),id_rol_liderbanda,'registro_comentarios','select'),

/* 11 Cumplimiento Evaluaciones */


(gen_random_uuid(), now(),id_rol_liderbanda,'registro_cumplimiento_evaluaciones','select'),

/* 12 Equipo Evaluador */

(gen_random_uuid(), now(),id_rol_liderbanda,'registro_equipo_evaluador','select'),

/* 13 Eventos */

(gen_random_uuid(), now(),id_rol_liderbanda,'registro_eventos','select'),

/*❌ 14 Penalizaciones */

/* 15 Solicitud de revision */

(gen_random_uuid(), now(),id_rol_liderbanda,'respuesta_solicitud_revision','select'),

/* 16 Roles */

(gen_random_uuid(), now(),id_rol_liderbanda,'roles','select'),
/* ❌ 17 Roles equipo evaluador */

/* 18 Rubricas */

(gen_random_uuid(), now(),id_rol_liderbanda,'rubricas','select'),

/* 19 Solicitud de revision */

(gen_random_uuid(), now(),id_rol_liderbanda,'solicitud_revision','select'),

/* 20 Confirmacion asistencia */

(gen_random_uuid(), now(),id_rol_liderbanda,'confirmacion_asistencia','insert'),
(gen_random_uuid(), now(),id_rol_liderbanda,'confirmacion_asistencia','update'),
(gen_random_uuid(), now(),id_rol_liderbanda,'confirmacion_asistencia','select'),

/* 23 Copas */
(gen_random_uuid(), now(),id_rol_liderbanda,'copas','select'),

/* 28 Checkout — lider de banda (confirmar/denegar llegada e ingreso) */
(gen_random_uuid(), now(),id_rol_liderbanda,'checkout','update'),
(gen_random_uuid(), now(),id_rol_liderbanda,'checkout','select'),


/* 🔷🔷🔷========================================================================🔷🔷🔷 */
/* responsable de bandas: crud bandas, categorias y regiones; resto select */
/* 01 Bandas */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'bandas','insert'),
(gen_random_uuid(), now(),id_rol_responsable_bandas,'bandas','update'),
(gen_random_uuid(), now(),id_rol_responsable_bandas,'bandas','delete'),
(gen_random_uuid(), now(),id_rol_responsable_bandas,'bandas','select'),
/* 02 Categorias */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'categorias','insert'),
(gen_random_uuid(), now(),id_rol_responsable_bandas,'categorias','update'),
(gen_random_uuid(), now(),id_rol_responsable_bandas,'categorias','delete'),
(gen_random_uuid(), now(),id_rol_responsable_bandas,'categorias','select'),
/* 03 Criterios de Evaluacion */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'criterios_evaluacion','select'),
/* 04 Cumplimientos */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'cumplimientos','select'),
/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'federaciones','select'),
/* 07 Perfiles */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'perfiles','select'),
/* 09 Regiones */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'regiones','insert'),
(gen_random_uuid(), now(),id_rol_responsable_bandas,'regiones','update'),
(gen_random_uuid(), now(),id_rol_responsable_bandas,'regiones','delete'),
(gen_random_uuid(), now(),id_rol_responsable_bandas,'regiones','select'),
/* 10 Comentarios */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'registro_comentarios','select'),
/* 11 Cumplimiento Evaluaciones */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'registro_cumplimiento_evaluaciones','select'),
/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'registro_equipo_evaluador','select'),
/* 13 Eventos */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'registro_eventos','select'),
/* 15 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'respuesta_solicitud_revision','select'),
/* 16 Roles */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'roles','select'),
/* 18 Rubricas */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'rubricas','select'),
/* 19 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'solicitud_revision','select'),
/* 20 Confirmacion asistencia */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'confirmacion_asistencia','select'),

/* 21 Escuadras (crud; premios escuadra solo admin / admin temporal / mesa) */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'escuadras','insert'),
(gen_random_uuid(), now(),id_rol_responsable_bandas,'escuadras','update'),
(gen_random_uuid(), now(),id_rol_responsable_bandas,'escuadras','delete'),
(gen_random_uuid(), now(),id_rol_responsable_bandas,'escuadras','select'),

/* 23 Copas */
(gen_random_uuid(), now(),id_rol_responsable_bandas,'copas','select'),


/* 🔷🔷🔷========================================================================🔷🔷🔷 */
/* responsable de rubricas: crud rubricas/criterios/cumplimientos/categorias/regiones; resto select */
/* 01 Bandas */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'bandas','select'),
/* 02 Categorias */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'categorias','insert'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'categorias','update'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'categorias','delete'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'categorias','select'),
/* 03 Criterios de Evaluacion */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'criterios_evaluacion','insert'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'criterios_evaluacion','update'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'criterios_evaluacion','delete'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'criterios_evaluacion','select'),
/* 04 Cumplimientos */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'cumplimientos','insert'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'cumplimientos','update'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'cumplimientos','delete'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'cumplimientos','select'),
/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'federaciones','select'),
/* 07 Perfiles */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'perfiles','select'),
/* 09 Regiones */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'regiones','insert'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'regiones','update'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'regiones','delete'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'regiones','select'),
/* 10 Comentarios */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'registro_comentarios','select'),
/* 11 Cumplimiento Evaluaciones */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'registro_cumplimiento_evaluaciones','select'),
/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'registro_equipo_evaluador','select'),
/* 13 Eventos */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'registro_eventos','select'),
/* 15 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'respuesta_solicitud_revision','select'),
/* 16 Roles */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'roles','select'),
/* 18 Rubricas */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'rubricas','insert'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'rubricas','update'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'rubricas','delete'),
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'rubricas','select'),
/* 19 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'solicitud_revision','select'),
/* 20 Confirmacion asistencia */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'confirmacion_asistencia','select'),
/* 21 Escuadras */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'escuadras','select'),
/* 23 Copas */
(gen_random_uuid(), now(),id_rol_responsable_rubricas,'copas','select'),


/* 🔷🔷🔷========================================================================🔷🔷🔷 */
/* responsable de usuarios: crud perfiles; roles select; resto select */
/* 01 Bandas */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'bandas','select'),
/* 02 Categorias */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'categorias','select'),
/* 03 Criterios de Evaluacion */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'criterios_evaluacion','select'),
/* 04 Cumplimientos */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'cumplimientos','select'),
/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'federaciones','select'),
/* 07 Perfiles */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'perfiles','insert'),
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'perfiles','update'),
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'perfiles','delete'),
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'perfiles','select'),
/* 09 Regiones */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'regiones','select'),
/* 10 Comentarios */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'registro_comentarios','select'),
/* 11 Cumplimiento Evaluaciones */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'registro_cumplimiento_evaluaciones','select'),
/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'registro_equipo_evaluador','select'),
/* 13 Eventos */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'registro_eventos','select'),
/* 15 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'respuesta_solicitud_revision','select'),
/* 16 Roles */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'roles','select'),
/* 18 Rubricas */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'rubricas','select'),
/* 19 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'solicitud_revision','select'),
/* 20 Confirmacion asistencia */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'confirmacion_asistencia','select'),

/* 23 Copas */
(gen_random_uuid(), now(),id_rol_responsable_usuarios,'copas','select'),


/* 🔷🔷🔷========================================================================🔷🔷🔷 */
/* responsable de eventos: crud eventos y regiones; equipo evaluador solo select */
/* 01 Bandas */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'bandas','select'),
/* 02 Categorias */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'categorias','select'),
/* 03 Criterios de Evaluacion */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'criterios_evaluacion','select'),
/* 04 Cumplimientos */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'cumplimientos','select'),
/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'federaciones','select'),
/* 07 Perfiles */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'perfiles','select'),
/* 09 Regiones */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'regiones','insert'),
(gen_random_uuid(), now(),id_rol_responsable_eventos,'regiones','update'),
(gen_random_uuid(), now(),id_rol_responsable_eventos,'regiones','delete'),
(gen_random_uuid(), now(),id_rol_responsable_eventos,'regiones','select'),
/* 10 Comentarios */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'registro_comentarios','select'),
/* 11 Cumplimiento Evaluaciones */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'registro_cumplimiento_evaluaciones','select'),
/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'registro_equipo_evaluador','select'),
/* 13 Eventos */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'registro_eventos','insert'),
(gen_random_uuid(), now(),id_rol_responsable_eventos,'registro_eventos','update'),
(gen_random_uuid(), now(),id_rol_responsable_eventos,'registro_eventos','delete'),
(gen_random_uuid(), now(),id_rol_responsable_eventos,'registro_eventos','select'),
/* 15 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'respuesta_solicitud_revision','select'),
/* 16 Roles */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'roles','select'),
/* 18 Rubricas */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'rubricas','select'),
/* 19 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'solicitud_revision','select'),
/* 20 Confirmacion asistencia */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'confirmacion_asistencia','select'),

/* 23 Copas */
(gen_random_uuid(), now(),id_rol_responsable_eventos,'copas','select'),


/* 🔷🔷🔷========================================================================🔷🔷🔷 */
/* responsable de mesa: crud equipo evaluador; eventos update+select; solicitudes/revisiones como admin */
/* 01 Bandas */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'bandas','select'),
/* 02 Categorias */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'categorias','select'),
/* 03 Criterios de Evaluacion */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'criterios_evaluacion','select'),
/* 04 Cumplimientos */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'cumplimientos','select'),
/* 05 Federaciones */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'federaciones','select'),
/* 07 Perfiles (update: activar/desactivar acceso por categoría en dashboard Accesos) */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'perfiles','select'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'perfiles','update'),
/* 09 Regiones */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'regiones','select'),
/* 10 Comentarios */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'registro_comentarios','select'),
/* 11 Cumplimiento Evaluaciones */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'registro_cumplimiento_evaluaciones','select'),
/* 12 Equipo Evaluador */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'registro_equipo_evaluador','insert'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'registro_equipo_evaluador','update'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'registro_equipo_evaluador','delete'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'registro_equipo_evaluador','select'),
/* 13 Eventos */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'registro_eventos','update'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'registro_eventos','select'),
/* 15 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'respuesta_solicitud_revision','insert'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'respuesta_solicitud_revision','select'),
/* 16 Roles */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'roles','select'),
/* 18 Rubricas */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'rubricas','select'),
/* 19 Solicitud de revision */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'registro_cumplimiento_evaluaciones','update'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'solicitud_revision','update'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'solicitud_revision','select'),
/* 20 Confirmacion asistencia */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'confirmacion_asistencia','select'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'confirmacion_asistencia','update'),

/* 21 Premios escuadra (tabla premios_escuadra; gestión desde mesa) */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'premios_escuadra','insert'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'premios_escuadra','update'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'premios_escuadra','delete'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'premios_escuadra','select'),

/* 23 Copas (gestión desde mesa) */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'copas','insert'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'copas','update'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'copas','delete'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'copas','select'),

/* 26 Solicitar sanción — secretaria crud */
(gen_random_uuid(), now(),id_rol_secretaria,'solicitar_sancion','insert'),
(gen_random_uuid(), now(),id_rol_secretaria,'solicitar_sancion','update'),
(gen_random_uuid(), now(),id_rol_secretaria,'solicitar_sancion','delete'),
(gen_random_uuid(), now(),id_rol_secretaria,'solicitar_sancion','select'),
/* 26 Solicitar sanción — admin crud */
(gen_random_uuid(), now(),id_rol_admin,'solicitar_sancion','insert'),
(gen_random_uuid(), now(),id_rol_admin,'solicitar_sancion','update'),
(gen_random_uuid(), now(),id_rol_admin,'solicitar_sancion','delete'),
(gen_random_uuid(), now(),id_rol_admin,'solicitar_sancion','select'),
/* 26 Solicitar sanción — admin temporal crud */
(gen_random_uuid(), now(),id_rol_admin_temporal,'solicitar_sancion','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'solicitar_sancion','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'solicitar_sancion','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'solicitar_sancion','select'),

/* 27 Solicitud de copa — fiscal crud */
(gen_random_uuid(), now(),id_rol_fiscal,'solicitud_copas','insert'),
(gen_random_uuid(), now(),id_rol_fiscal,'solicitud_copas','update'),
(gen_random_uuid(), now(),id_rol_fiscal,'solicitud_copas','delete'),
(gen_random_uuid(), now(),id_rol_fiscal,'solicitud_copas','select'),
/* 27 Solicitud de copa — responsable de mesa crud */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'solicitud_copas','insert'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'solicitud_copas','update'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'solicitud_copas','delete'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'solicitud_copas','select'),
/* 27 Solicitud de copa — admin crud */
(gen_random_uuid(), now(),id_rol_admin,'solicitud_copas','insert'),
(gen_random_uuid(), now(),id_rol_admin,'solicitud_copas','update'),
(gen_random_uuid(), now(),id_rol_admin,'solicitud_copas','delete'),
(gen_random_uuid(), now(),id_rol_admin,'solicitud_copas','select'),
/* 27 Solicitud de copa — admin temporal crud */
(gen_random_uuid(), now(),id_rol_admin_temporal,'solicitud_copas','insert'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'solicitud_copas','update'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'solicitud_copas','delete'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'solicitud_copas','select'),

/* 28 Alertas evaluación duplicada */
(gen_random_uuid(), now(),id_rol_responsable_mesa,'alertas_evaluacion','select'),
(gen_random_uuid(), now(),id_rol_responsable_mesa,'alertas_evaluacion','execute'),
(gen_random_uuid(), now(),id_rol_admin,'alertas_evaluacion','select'),
(gen_random_uuid(), now(),id_rol_admin,'alertas_evaluacion','execute'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'alertas_evaluacion','select'),
(gen_random_uuid(), now(),id_rol_admin_temporal,'alertas_evaluacion','execute');

/* --------------------------------------------------------------------------
   Comité de disciplina: el login hace embed roles(*) en perfiles.
   Sin permiso roles/select, rls devuelve roles=null y el front rechaza el acceso.
   (Idempotente por si el bloque values de arriba corrió sin esta fila.)
   -------------------------------------------------------------------------- */
insert into public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
select gen_random_uuid(), now(), id_rol_comite_disciplina, 'roles', 'select'
where not exists (
  select 1
  from public.permisos as p
  where p.id_foranea_rol = id_rol_comite_disciplina
    and p.tabla = 'roles'
    and p.accion = 'select'
);

insert into public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
select gen_random_uuid(), now(), id_rol_comite_disciplina, 'registro_equipo_evaluador', 'select'
where not exists (
  select 1 from public.permisos as p
  where p.id_foranea_rol = id_rol_comite_disciplina
    and p.tabla = 'registro_equipo_evaluador' and p.accion = 'select'
);

insert into public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
select gen_random_uuid(), now(), id_rol_comite_disciplina, 'registro_eventos', 'select'
where not exists (
  select 1 from public.permisos as p
  where p.id_foranea_rol = id_rol_comite_disciplina
    and p.tabla = 'registro_eventos' and p.accion = 'select'
);

insert into public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
select gen_random_uuid(), now(), id_rol_comite_disciplina, 'confirmacion_asistencia', 'select'
where not exists (
  select 1 from public.permisos as p
  where p.id_foranea_rol = id_rol_comite_disciplina
    and p.tabla = 'confirmacion_asistencia' and p.accion = 'select'
);

insert into public.permisos (id_permiso, "created_at", id_foranea_rol, "tabla", "accion")
select gen_random_uuid(), now(), id_rol_comite_disciplina, t.tabla, t.accion
from (values
  ('checkout', 'insert'),
  ('checkout', 'update'),
  ('checkout', 'select')
) as t(tabla, accion)
where not exists (
  select 1 from public.permisos as p
  where p.id_foranea_rol = id_rol_comite_disciplina
    and p.tabla = t.tabla and p.accion = t.accion
);

end $$;

-- Políticas rls: sanciones y registro_sanciones (requieren filas en public.permisos arriba)

drop policy if exists "leer" on public.sanciones;
create policy "leer" on public.sanciones
  for select using (public.revisar_permisos('sanciones'::text, 'select'::text));

drop policy if exists "crear" on public.sanciones;
create policy "crear" on public.sanciones
  for insert with check (public.revisar_permisos('sanciones'::text, 'insert'::text));

drop policy if exists "actualizar" on public.sanciones;
create policy "actualizar" on public.sanciones
  for update using (public.revisar_permisos('sanciones'::text, 'update'::text));

drop policy if exists "eliminar" on public.sanciones;
create policy "eliminar" on public.sanciones
  for delete using (public.revisar_permisos('sanciones'::text, 'delete'::text));

drop policy if exists "leer" on public.registro_sanciones;
create policy "leer" on public.registro_sanciones
  for select using (public.revisar_permisos('registro_sanciones'::text, 'select'::text));

drop policy if exists "crear" on public.registro_sanciones;
create policy "crear" on public.registro_sanciones
  for insert with check (public.revisar_permisos('registro_sanciones'::text, 'insert'::text));

drop policy if exists "actualizar" on public.registro_sanciones;
create policy "actualizar" on public.registro_sanciones
  for update using (public.revisar_permisos('registro_sanciones'::text, 'update'::text));

drop policy if exists "eliminar" on public.registro_sanciones;
create policy "eliminar" on public.registro_sanciones
  for delete using (public.revisar_permisos('registro_sanciones'::text, 'delete'::text));

-- Políticas rls: copas (requieren filas en public.permisos con tabla 'copas' arriba)

drop policy if exists "editar" on public.copas;
drop policy if exists "leer" on public.copas;
create policy "leer" on public.copas
  for select using (public.revisar_permisos('copas'::text, 'select'::text));

drop policy if exists "crear" on public.copas;
create policy "crear" on public.copas
  for insert with check (public.revisar_permisos('copas'::text, 'insert'::text));

drop policy if exists "actualizar" on public.copas;
create policy "actualizar" on public.copas
  for update using (public.revisar_permisos('copas'::text, 'update'::text));

drop policy if exists "eliminar" on public.copas;
create policy "eliminar" on public.copas
  for delete using (public.revisar_permisos('copas'::text, 'delete'::text));

-- Políticas rls: solicitudes de revisión (corrige acción create→update en editar)

drop policy if exists "editar" on public.registro_cumplimiento_evaluaciones;
create policy "editar" on public.registro_cumplimiento_evaluaciones
  for update
  using (true)
  with check (public.revisar_permisos('registro_cumplimiento_evaluaciones'::text, 'update'::text));

drop policy if exists "editar" on public.respuesta_solicitud_revision;
create policy "editar" on public.respuesta_solicitud_revision
  for update
  using (true)
  with check (public.revisar_permisos('respuesta_solicitud_revision'::text, 'update'::text));

drop policy if exists "eliminar" on public.registro_cumplimiento_evaluaciones;
create policy "eliminar" on public.registro_cumplimiento_evaluaciones
  for delete
  using (public.revisar_permisos('registro_cumplimiento_evaluaciones'::text, 'delete'::text));

grant select on public.vista_aplicacion_sanciones to anon, authenticated, service_role;

-- Políticas rls: solicitar_sancion (requieren filas en public.permisos arriba)

drop policy if exists "leer" on public.solicitar_sancion;
create policy "leer" on public.solicitar_sancion
  for select using (public.revisar_permisos('solicitar_sancion'::text, 'select'::text));

drop policy if exists "crear" on public.solicitar_sancion;
create policy "crear" on public.solicitar_sancion
  for insert with check (public.revisar_permisos('solicitar_sancion'::text, 'insert'::text));

drop policy if exists "actualizar" on public.solicitar_sancion;
create policy "actualizar" on public.solicitar_sancion
  for update using (public.revisar_permisos('solicitar_sancion'::text, 'update'::text));

drop policy if exists "eliminar" on public.solicitar_sancion;
create policy "eliminar" on public.solicitar_sancion
  for delete using (public.revisar_permisos('solicitar_sancion'::text, 'delete'::text));

grant select on public.vista_solicitud_sancion to anon, authenticated, service_role;

-- Políticas rls: solicitud_copas (requieren filas en public.permisos arriba)

drop policy if exists "leer" on public.solicitud_copas;
create policy "leer" on public.solicitud_copas
  for select using (public.revisar_permisos('solicitud_copas'::text, 'select'::text));

drop policy if exists "crear" on public.solicitud_copas;
create policy "crear" on public.solicitud_copas
  for insert with check (public.revisar_permisos('solicitud_copas'::text, 'insert'::text));

drop policy if exists "actualizar" on public.solicitud_copas;
create policy "actualizar" on public.solicitud_copas
  for update using (public.revisar_permisos('solicitud_copas'::text, 'update'::text));

drop policy if exists "eliminar" on public.solicitud_copas;
create policy "eliminar" on public.solicitud_copas
  for delete using (public.revisar_permisos('solicitud_copas'::text, 'delete'::text));

grant select on public.vista_solicitud_copas to anon, authenticated, service_role;

-- Políticas rls: checkout (requieren filas en public.permisos arriba)

drop policy if exists "leer" on public.checkout;
create policy "leer" on public.checkout
  for select using (public.revisar_permisos('checkout'::text, 'select'::text));

drop policy if exists "crear" on public.checkout;
create policy "crear" on public.checkout
  for insert with check (public.revisar_permisos('checkout'::text, 'insert'::text));

drop policy if exists "actualizar" on public.checkout;
create policy "actualizar" on public.checkout
  for update
  using (public.revisar_permisos('checkout'::text, 'update'::text))
  with check (public.revisar_permisos('checkout'::text, 'update'::text));

drop policy if exists "eliminar" on public.checkout;
create policy "eliminar" on public.checkout
  for delete using (public.revisar_permisos('checkout'::text, 'delete'::text));

grant select, insert, update, delete on table public.checkout to anon, authenticated, service_role;
grant select on public.vista_detalle_checkout to anon, authenticated, service_role;

-- =============================================================================
-- Storage: buckets y políticas rls (fotos de perfil y logos de bandas)
-- Deben coincidir con NEXT_PUBLIC_SUPABASE_BUCKET_PERFILES y bandas_services.ts
-- =============================================================================

insert into storage.buckets (id, name, public)
values
  ('img-fotos-perfiles-sasha', 'img-fotos-perfiles-sasha', false),
  ('img_logo_bandas', 'img_logo_bandas', false)
on conflict (id) do nothing;

-- Políticas legacy (migración 20260501031419); se reemplazan por nombres explícitos
drop policy if exists "agregar 1gmiffv_0" on storage.objects;
drop policy if exists "editar 1gmiffv_0" on storage.objects;
drop policy if exists "eliminar 1gmiffv_0" on storage.objects;
drop policy if exists "eliminar 1gmiffv_1" on storage.objects;
drop policy if exists "leer 1gmiffv_0" on storage.objects;

-- img-fotos-perfiles-sasha
drop policy if exists "storage_perfiles_agregar" on storage.objects;
create policy "storage_perfiles_agregar"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'img-fotos-perfiles-sasha');

drop policy if exists "storage_perfiles_editar" on storage.objects;
create policy "storage_perfiles_editar"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'img-fotos-perfiles-sasha');

drop policy if exists "storage_perfiles_eliminar" on storage.objects;
create policy "storage_perfiles_eliminar"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'img-fotos-perfiles-sasha');

drop policy if exists "storage_perfiles_leer_authenticated" on storage.objects;
create policy "storage_perfiles_leer_authenticated"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'img-fotos-perfiles-sasha');

drop policy if exists "storage_perfiles_leer_public" on storage.objects;
create policy "storage_perfiles_leer_public"
  on storage.objects
  for select
  to public
  using (bucket_id = 'img-fotos-perfiles-sasha');

-- img_logo_bandas
drop policy if exists "storage_logo_banda_agregar" on storage.objects;
create policy "storage_logo_banda_agregar"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'img_logo_bandas');

drop policy if exists "storage_logo_banda_editar" on storage.objects;
create policy "storage_logo_banda_editar"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'img_logo_bandas');

drop policy if exists "storage_logo_banda_eliminar" on storage.objects;
create policy "storage_logo_banda_eliminar"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'img_logo_bandas');

drop policy if exists "storage_logo_banda_leer_authenticated" on storage.objects;
create policy "storage_logo_banda_leer_authenticated"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'img_logo_bandas');

drop policy if exists "storage_logo_banda_leer_public" on storage.objects;
create policy "storage_logo_banda_leer_public"
  on storage.objects
  for select
  to public
  using (bucket_id = 'img_logo_bandas');
