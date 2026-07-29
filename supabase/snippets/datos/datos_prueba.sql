-- Datos de prueba SASHA-DEV (region general, 3 categorías, 9 bandas, 5 eventos).
-- Orden en Supabase Studio / SQL Editor:
--   1) supabase/snippets/datos/datos_prueba.sql   (este archivo)
--   2) supabase/snippets/politicas/politicas.sql
-- Si los eventos no aparecen en la app: ejecutar de nuevo politicas.sql (actualiza revisar_permisos)
-- y cerrar sesión → entrar con admin@sasha.com / 12345678.

DO $$

DECLARE

    idRegionGeneral UUID := gen_random_uuid();


    idCategoriaBasica UUID := gen_random_uuid();
    idCategoriaIntermedia UUID := gen_random_uuid();
    idCategoriaAvanzada UUID := gen_random_uuid();



    idRubricaMusicalidad1  UUID := gen_random_uuid();
    idRubricaMusicalidad2 UUID := gen_random_uuid();
    idRubricaCoreografia UUID := gen_random_uuid();
    idRubricaUniformidad UUID := gen_random_uuid();
    idRubricaDiciplina UUID := gen_random_uuid();

    idCriterio_1_Musicalidad1 UUID := gen_random_uuid();
    idCriterio_2_Musicalidad1 UUID := gen_random_uuid();
    idCriterio_3_Musicalidad1 UUID := gen_random_uuid();
    idCriterio_4_Musicalidad1 UUID := gen_random_uuid();
    idCriterio_5_Musicalidad1 UUID := gen_random_uuid();


    idCriterio_1_Musicalidad2 UUID := gen_random_uuid();
    idCriterio_2_Musicalidad2 UUID := gen_random_uuid();
    idCriterio_3_Musicalidad2 UUID := gen_random_uuid();
    idCriterio_4_Musicalidad2 UUID := gen_random_uuid();
    idCriterio_5_Musicalidad2 UUID := gen_random_uuid();


    idCriterio_1_Coreografia UUID := gen_random_uuid();
    idCriterio_2_Coreografia UUID := gen_random_uuid();
    idCriterio_3_Coreografia UUID := gen_random_uuid();
    idCriterio_4_Coreografia UUID := gen_random_uuid();
    idCriterio_5_Coreografia UUID := gen_random_uuid();


    idCriterio_1_Uniformidad UUID := gen_random_uuid();
    idCriterio_2_Uniformidad UUID := gen_random_uuid();
    idCriterio_3_Uniformidad UUID := gen_random_uuid();
    idCriterio_4_Uniformidad UUID := gen_random_uuid();
    idCriterio_5_Uniformidad UUID := gen_random_uuid();


    idCriterio_1_Diciplina UUID := gen_random_uuid();
    idCriterio_2_Diciplina UUID := gen_random_uuid();
    idCriterio_3_Diciplina UUID := gen_random_uuid();
    idCriterio_4_Diciplina UUID := gen_random_uuid();
    idCriterio_5_Diciplina UUID := gen_random_uuid();
    id_federacion UUID;

    -- Roles
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

    -- Ids para sanciones de prueba
    idSancion1 UUID := gen_random_uuid();
    idSancion2 UUID := gen_random_uuid();
    idSancion3 UUID := gen_random_uuid();
    idSancion4 UUID := gen_random_uuid();

    -- Usuarios de prueba
    seed_password TEXT := '12345678';
    new_user_id UUID;
    new_identity_id UUID;
    tmp_email TEXT;
    idPerfilJurados UUID[] := ARRAY[]::UUID[];
    i_jurado INT;
    tmp_id UUID;
    idPerfilFiscal UUID;
    idPerfilResponsableBandas UUID;
    idPerfilResponsableRubricas UUID;
    idPerfilResponsableUsuarios UUID;
    idPerfilResponsableEventos UUID;
    idPerfilResponsableMesa UUID;
    idPerfilSecretaria UUID;
    idBandaEvaluada UUID;
    idEventosSeed UUID[] := ARRAY[]::UUID[];
    idEventosEvaluacion UUID[] := ARRAY[]::UUID[];

    /* Escala fija criterios positivos: techo rúbrica = 5 criterios * pts_cumple (= 25) */
    pts_cumple INT := 5;
    pts_medio_cumple INT := 3;
    pts_no_cumple INT := 0;
    pts_disciplina_no_aplica INT := 0;
    pts_disciplina_aplica INT := -5;  -- techo rúbrica disciplina = 5 * esto (= -25)

    -- Evaluaciones seed para una banda real en un evento nuevo
    v_evento UUID;
    v_jurado UUID;
    v_rubrica RECORD;
    v_criterio RECORD;
    v_pos INT;
    v_cumple_id UUID;
    v_cumple_pts DOUBLE PRECISION;
    v_es_disciplina BOOLEAN;
    v_cumple_label TEXT;
    v_idx_rub INT;

BEGIN

    /* ====================================================================== */
    /* LIMPIEZA TOTAL (solo para ambiente de pruebas)                         */
    /* Orden: hijos con FK a eventos/bandas/perfiles antes que tablas padre     */
    /* ====================================================================== */
    DELETE FROM public.registro_cumplimiento_evaluaciones;
    DELETE FROM public.registro_equipo_evaluador;
    DELETE FROM public.registro_comentarios;
    DELETE FROM public.respuesta_solicitud_revision;
    DELETE FROM public.solicitud_revision;
    DELETE FROM public.confirmacion_asistencia;
    DELETE FROM public.copas;
    DELETE FROM public.registro_penalizaciones;
    DELETE FROM public.registro_sanciones;
    DELETE FROM public.solicitar_sancion;
    DELETE FROM public.premios_escuadra;
    DELETE FROM public.premio_escuadra;
    DELETE FROM public.escuadras;
    DELETE FROM public.registro_eventos;
    /* perfiles.id_foranea_banda → bandas: borrar perfiles antes que bandas */
    DELETE FROM public.perfiles;
    DELETE FROM auth.identities;
    DELETE FROM auth.users;
    DELETE FROM public.bandas;
    DELETE FROM public.cumplimientos;
    DELETE FROM public.criterios_evaluacion;
    DELETE FROM public.rubricas;
    DELETE FROM public.categorias;
    DELETE FROM public.regiones;

    -- 1. Asignamos el valor a la variable
    SELECT f.id_federacion INTO id_federacion 
    FROM federaciones f
    WHERE f.nombre_federacion = 'SASHA-DEV';

    -- Si no existe la federación base, la creamos (para que el snippet sea auto-contenido)
    IF id_federacion IS NULL THEN
      id_federacion := gen_random_uuid();
      INSERT INTO public.federaciones (id_federacion,"created_at",nombre_federacion)
      VALUES (id_federacion, now(), 'SASHA-DEV');
    END IF;

    -- Resolver IDs de roles por nombre (si no existen, los creamos)
    SELECT id_rol INTO idRolDeveloper
    FROM public.roles
    WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'developer';

    IF idRolDeveloper IS NULL THEN
      idRolDeveloper := gen_random_uuid();
      idRolAdmin := gen_random_uuid();
      idRolAdminTemporal := gen_random_uuid();
      idRolJurado := gen_random_uuid();
      idRolFiscal := gen_random_uuid();
      idRolDirigente := gen_random_uuid();
      idRolLiderbanda := gen_random_uuid();
      idRolResponsableBandas := gen_random_uuid();
      idRolResponsableRubricas := gen_random_uuid();
      idRolResponsableUsuarios := gen_random_uuid();
      idRolResponsableEventos := gen_random_uuid();
      idRolResponsableMesa := gen_random_uuid();
      idRolSecretaria := gen_random_uuid();

      INSERT INTO public.roles (id_rol, created_at, id_foranea_federacion, nombre_rol, estado_rol)
      VALUES
        (idRolDeveloper, now(), id_federacion, 'developer', true),
        (idRolAdmin, now(), id_federacion, 'admin', true),
        (idRolAdminTemporal, now(), id_federacion, 'admin temporal', true),
        (idRolJurado, now(), id_federacion, 'jurado', true),
        (idRolFiscal, now(), id_federacion, 'fiscal', true),
        (idRolDirigente, now(), id_federacion, 'dirigente', true),
        (idRolLiderbanda, now(), id_federacion, 'lider de banda', true),
        (idRolResponsableBandas, now(), id_federacion, 'responsable de bandas', true),
        (idRolResponsableRubricas, now(), id_federacion, 'responsable de rubricas', true),
        (idRolResponsableUsuarios, now(), id_federacion, 'responsable de usuarios', true),
        (idRolResponsableEventos, now(), id_federacion, 'responsable de eventos', true),
        (idRolResponsableMesa, now(), id_federacion, 'responsable de mesa', true),
        (idRolSecretaria, now(), id_federacion, 'secretaria', true);
    ELSE
      SELECT id_rol INTO idRolAdmin FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'admin';
      SELECT id_rol INTO idRolAdminTemporal FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'admin temporal';
      SELECT id_rol INTO idRolJurado FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'jurado';
      SELECT id_rol INTO idRolFiscal FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'fiscal';
      SELECT id_rol INTO idRolDirigente FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'dirigente';
      SELECT id_rol INTO idRolLiderbanda FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'lider de banda';
      SELECT id_rol INTO idRolResponsableBandas FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'responsable de bandas';
      SELECT id_rol INTO idRolResponsableRubricas FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'responsable de rubricas';
      SELECT id_rol INTO idRolResponsableUsuarios FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'responsable de usuarios';
      SELECT id_rol INTO idRolResponsableEventos FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'responsable de eventos';
      SELECT id_rol INTO idRolResponsableMesa FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'responsable de mesa';
      SELECT id_rol INTO idRolSecretaria FROM public.roles WHERE id_foranea_federacion = id_federacion AND nombre_rol = 'secretaria';
    END IF;

    -- Roles extendidos: crear solo los que falten (no sobrescribir IDs ya resueltos)
    IF idRolResponsableBandas IS NULL THEN
      idRolResponsableBandas := gen_random_uuid();
      INSERT INTO public.roles (id_rol, created_at, id_foranea_federacion, nombre_rol, estado_rol)
      VALUES (idRolResponsableBandas, now(), id_federacion, 'responsable de bandas', true);
    END IF;
    IF idRolResponsableUsuarios IS NULL THEN
      idRolResponsableUsuarios := gen_random_uuid();
      INSERT INTO public.roles (id_rol, created_at, id_foranea_federacion, nombre_rol, estado_rol)
      VALUES (idRolResponsableUsuarios, now(), id_federacion, 'responsable de usuarios', true);
    END IF;
    IF idRolResponsableEventos IS NULL THEN
      idRolResponsableEventos := gen_random_uuid();
      INSERT INTO public.roles (id_rol, created_at, id_foranea_federacion, nombre_rol, estado_rol)
      VALUES (idRolResponsableEventos, now(), id_federacion, 'responsable de eventos', true);
    END IF;
    IF idRolResponsableMesa IS NULL THEN
      idRolResponsableMesa := gen_random_uuid();
      INSERT INTO public.roles (id_rol, created_at, id_foranea_federacion, nombre_rol, estado_rol)
      VALUES (idRolResponsableMesa, now(), id_federacion, 'responsable de mesa', true);
    END IF;

    IF idRolSecretaria IS NULL THEN
      idRolSecretaria := gen_random_uuid();
      INSERT INTO public.roles (id_rol, created_at, id_foranea_federacion, nombre_rol, estado_rol)
      VALUES (idRolSecretaria, now(), id_federacion, 'secretaria', true);
    END IF;

    IF idRolResponsableRubricas IS NULL THEN
      idRolResponsableRubricas := gen_random_uuid();
      INSERT INTO public.roles (id_rol, created_at, id_foranea_federacion, nombre_rol, estado_rol)
      VALUES (idRolResponsableRubricas, now(), id_federacion, 'responsable de rubricas', true);
    END IF;

    /* Rol comité: crear si falta (permisos van en seed.sql / politicas.sql). */
    SELECT r.id_rol INTO idRolComiteDisciplina
    FROM public.roles r
    WHERE r.id_foranea_federacion = id_federacion AND r.nombre_rol = 'comite de disciplina';

    IF idRolComiteDisciplina IS NULL THEN
      idRolComiteDisciplina := gen_random_uuid();
      INSERT INTO public.roles (id_rol, created_at, id_foranea_federacion, nombre_rol, estado_rol)
      VALUES (idRolComiteDisciplina, now(), id_federacion, 'comite de disciplina', true);
    END IF;

    /* ====================================================================== */
    /* USUARIOS DE PRUEBA (1 por rol + 5 jurados) */
    /* Password: 12345678 */
    /* ====================================================================== */

    -- developer@sasha.com
    tmp_email := 'developer@sasha.com';
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sasha Developer", "role": "developer"}',
      now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (tmp_email, new_identity_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id, tmp_email)::jsonb, 'email', now(), now(), now());
    INSERT INTO public.perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
    VALUES (gen_random_uuid(), now(), 'Sasha Developer', id_federacion, new_user_id, idRolDeveloper, true);

    -- admin@sasha.com
    tmp_email := 'admin@sasha.com';
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sasha Admin", "role": "admin"}',
      now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (tmp_email, new_identity_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id, tmp_email)::jsonb, 'email', now(), now(), now());
    INSERT INTO public.perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
    VALUES (gen_random_uuid(), now(), 'Sasha Admin', id_federacion, new_user_id, idRolAdmin, true);

    -- admintemporal@sasha.com
    tmp_email := 'admintemporal@sasha.com';
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sasha Admin Temporal", "role": "admin temporal"}',
      now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (tmp_email, new_identity_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id, tmp_email)::jsonb, 'email', now(), now(), now());
    INSERT INTO public.perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
    VALUES (gen_random_uuid(), now(), 'Sasha Admin Temporal', id_federacion, new_user_id, idRolAdminTemporal, true);

    -- jurado1@sasha.com … jurado5@sasha.com (todos vinculados a todos los eventos abajo)
    FOR i_jurado IN 1..5 LOOP
      tmp_email := format('jurado%s@sasha.com', i_jurado);
      new_user_id := gen_random_uuid();
      new_identity_id := gen_random_uuid();
      tmp_id := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, recovery_sent_at, last_sign_in_at,
        raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
      )
      VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id, 'authenticated', 'authenticated', tmp_email,
        extensions.crypt(seed_password, extensions.gen_salt('bf')),
        now(), now(), now(),
        '{"provider": "email", "providers": ["email"]}',
        format('{"name": "Sasha Jurado %s", "role": "jurado"}', i_jurado)::jsonb,
        now(), now(),
        '', '', '', ''
      );
      INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      VALUES (tmp_email, new_identity_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id, tmp_email)::jsonb, 'email', now(), now(), now());
      INSERT INTO public.perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
      VALUES (tmp_id, now(), format('Sasha Jurado %s', i_jurado), id_federacion, new_user_id, idRolJurado, true);
      idPerfilJurados := array_append(idPerfilJurados, tmp_id);
    END LOOP;

    -- fiscal@sasha.com
    tmp_email := 'fiscal@sasha.com';
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sasha Fiscal", "role": "fiscal"}',
      now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (tmp_email, new_identity_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id, tmp_email)::jsonb, 'email', now(), now(), now());
    idPerfilFiscal := gen_random_uuid();
    INSERT INTO public.perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
    VALUES (idPerfilFiscal, now(), 'Sasha Fiscal', id_federacion, new_user_id, idRolFiscal, true);

    -- liderbanda@sasha.com
    tmp_email := 'liderbanda@sasha.com';
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sasha Lider Banda", "role": "lider de banda"}',
      now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (tmp_email, new_identity_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id, tmp_email)::jsonb, 'email', now(), now(), now());
    INSERT INTO public.perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
    VALUES (gen_random_uuid(), now(), 'Sasha Lider Banda', id_federacion, new_user_id, idRolLiderbanda, true);

    -- responsablebandas@sasha.com
    tmp_email := 'responsablebandas@sasha.com';
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sasha Responsable Bandas", "role": "responsable de bandas"}',
      now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (tmp_email, new_identity_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id, tmp_email)::jsonb, 'email', now(), now(), now());
    idPerfilResponsableBandas := gen_random_uuid();
    INSERT INTO public.perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
    VALUES (idPerfilResponsableBandas, now(), 'Sasha Responsable Bandas', id_federacion, new_user_id, idRolResponsableBandas, true);

    -- responsablerubricas@sasha.com
    tmp_email := 'responsablerubricas@sasha.com';
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sasha Responsable Rubricas", "role": "responsable de rubricas"}',
      now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (tmp_email, new_identity_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id, tmp_email)::jsonb, 'email', now(), now(), now());
    idPerfilResponsableRubricas := gen_random_uuid();
    INSERT INTO public.perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
    VALUES (idPerfilResponsableRubricas, now(), 'Sasha Responsable Rubricas', id_federacion, new_user_id, idRolResponsableRubricas, true);

    -- responsableusuarios@sasha.com
    tmp_email := 'responsableusuarios@sasha.com';
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sasha Responsable Usuarios", "role": "responsable de usuarios"}',
      now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (tmp_email, new_identity_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id, tmp_email)::jsonb, 'email', now(), now(), now());
    idPerfilResponsableUsuarios := gen_random_uuid();
    INSERT INTO public.perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
    VALUES (idPerfilResponsableUsuarios, now(), 'Sasha Responsable Usuarios', id_federacion, new_user_id, idRolResponsableUsuarios, true);

    -- responsableeventos@sasha.com
    tmp_email := 'responsableeventos@sasha.com';
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sasha Responsable Eventos", "role": "responsable de eventos"}',
      now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (tmp_email, new_identity_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id, tmp_email)::jsonb, 'email', now(), now(), now());
    idPerfilResponsableEventos := gen_random_uuid();
    INSERT INTO public.perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
    VALUES (idPerfilResponsableEventos, now(), 'Sasha Responsable Eventos', id_federacion, new_user_id, idRolResponsableEventos, true);

    -- responsablemesa@sasha.com
    tmp_email := 'responsablemesa@sasha.com';
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sasha Responsable Mesa", "role": "responsable de mesa"}',
      now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (tmp_email, new_identity_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id, tmp_email)::jsonb, 'email', now(), now(), now());
    idPerfilResponsableMesa := gen_random_uuid();
    INSERT INTO public.perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
    VALUES (idPerfilResponsableMesa, now(), 'Sasha Responsable Mesa', id_federacion, new_user_id, idRolResponsableMesa, true);

    -- secretaria@sasha.com
    tmp_email := 'secretaria@sasha.com';
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Sasha Secretaria", "role": "secretaria"}',
      now(), now(),
      '', '', '', ''
    );
    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (tmp_email, new_identity_id, new_user_id, format('{"sub":"%s","email":"%s"}', new_user_id, tmp_email)::jsonb, 'email', now(), now(), now());
    idPerfilSecretaria := gen_random_uuid();
    INSERT INTO public.perfiles (id_perfil,"created_at","nombre",id_foranea_federacion,id_foranea_user,id_foranea_rol,"permisos")
    VALUES (idPerfilSecretaria, now(), 'Sasha Secretaria', id_federacion, new_user_id, idRolSecretaria, true);

  


/* 🔷🔷🔷========================================================================🔷🔷🔷 */
/* regiones */






INSERT INTO  public.regiones (id_region,"created_at",nombre_region,id_foranea_federacion) 
VALUES 
(idRegionGeneral, now(),'general',id_federacion);

  
  


INSERT INTO   public.categorias (id_categoria,"created_at",nombre_categoria,detalles_categoria,id_foranea_federacion) 
VALUES 
(idCategoriaBasica, now(),'Categoría Básica','Categoría básica de competencia',id_federacion),
(idCategoriaIntermedia, now(),'Categoría intermedia','Categoría intermedia de competencia',id_federacion),
(idCategoriaAvanzada, now(),'Avanzada','Categoría avanzada de competencia',id_federacion);


/* ====================================================================== */
/* Escuadras (instrumentación / secciones de banda)                     */
/* ====================================================================== */
INSERT INTO public.escuadras (created_at, nombre_escuadra)
VALUES
  (now(), 'Redoblante'),
  (now(), 'Tarolas'),
  (now(), 'Cureros'),
  (now(), 'Liras'),
  (now(), 'Bombos'),
  (now(), 'Platillos'),
  (now(), 'Guiros');



/* 🔷🔷🔷========================================================================🔷🔷🔷 */
/* rubricas + criterios + cumplimientos (mismas rubricas para todas las categorias) */
<<seed_rubricas_por_categoria>>
DECLARE
  cat_id UUID;
  rubrica_m1 UUID;
  rubrica_m2 UUID;
  rubrica_coreo UUID;
  rubrica_unif UUID;
  rubrica_disc UUID;
  criterio_id UUID;
  i INT;
BEGIN
  FOR cat_id IN
    SELECT unnest(ARRAY[idCategoriaBasica, idCategoriaIntermedia, idCategoriaAvanzada])
  LOOP
    rubrica_m1 := gen_random_uuid();
    rubrica_m2 := gen_random_uuid();
    rubrica_coreo := gen_random_uuid();
    rubrica_unif := gen_random_uuid();
    rubrica_disc := gen_random_uuid();

    INSERT INTO public.rubricas (id_rubrica,"created_at",nombre_rubrica,datalle_rubrica,puntos_rubrica,id_foranea_categoria,id_foranea_federacion,version_rubrica)
    VALUES
      (rubrica_m1, now(), 'Rubrica 1', 'Rúbrica 1 de evaluación', pts_cumple * 5, cat_id, id_federacion, '2026-01'),
      (rubrica_m2, now(), 'Rubrica 2', 'Rúbrica 2 de evaluación', pts_cumple * 5, cat_id, id_federacion, '2026-01'),
      (rubrica_coreo, now(), 'Rubrica 3', 'Rúbrica 3 de evaluación', pts_cumple * 5, cat_id, id_federacion, '2026-01'),
      (rubrica_unif, now(), 'Rubrica 4', 'Rúbrica 4 de evaluación', pts_cumple * 5, cat_id, id_federacion, '2026-01'),
      (rubrica_disc, now(), 'Rubrica 5', 'Rúbrica 5 de evaluación (disciplina)', pts_disciplina_aplica * 5, cat_id, id_federacion, '2026-01');

    -- Rubrica 1 (5 criterios + 3 cumplimientos cada uno)
    FOR i IN 1..5 LOOP
      criterio_id := gen_random_uuid();
      INSERT INTO public.criterios_evaluacion (id_criterio,"created_at",nombre_criterio,detalles_criterio,puntos_criterio,id_foranea_rubrica)
      VALUES (criterio_id, now(), format('Criterio %s Rubrica 1', i), 'Lorem ipsum dolor sit amet', pts_cumple, rubrica_m1);

      INSERT INTO public.cumplimientos (id_cumplimiento,"created_at",detalle_cumplimiento,puntos_cumplimiento,id_foranea_criterio)
      VALUES
        (gen_random_uuid(), now(), 'cumple', pts_cumple, criterio_id),
        (gen_random_uuid(), now(), 'medio cumple', pts_medio_cumple, criterio_id),
        (gen_random_uuid(), now(), 'no cumple', pts_no_cumple, criterio_id);
    END LOOP;

    -- Rubrica 2
    FOR i IN 1..5 LOOP
      criterio_id := gen_random_uuid();
      INSERT INTO public.criterios_evaluacion (id_criterio,"created_at",nombre_criterio,detalles_criterio,puntos_criterio,id_foranea_rubrica)
      VALUES (criterio_id, now(), format('Criterio %s Rubrica 2', i), 'Lorem ipsum dolor sit amet', pts_cumple, rubrica_m2);

      INSERT INTO public.cumplimientos (id_cumplimiento,"created_at",detalle_cumplimiento,puntos_cumplimiento,id_foranea_criterio)
      VALUES
        (gen_random_uuid(), now(), 'cumple', pts_cumple, criterio_id),
        (gen_random_uuid(), now(), 'medio cumple', pts_medio_cumple, criterio_id),
        (gen_random_uuid(), now(), 'no cumple', pts_no_cumple, criterio_id);
    END LOOP;

    -- Rubrica 3
    FOR i IN 1..5 LOOP
      criterio_id := gen_random_uuid();
      INSERT INTO public.criterios_evaluacion (id_criterio,"created_at",nombre_criterio,detalles_criterio,puntos_criterio,id_foranea_rubrica)
      VALUES (criterio_id, now(), format('Criterio %s Rubrica 3', i), 'Lorem ipsum dolor sit amet', pts_cumple, rubrica_coreo);

      INSERT INTO public.cumplimientos (id_cumplimiento,"created_at",detalle_cumplimiento,puntos_cumplimiento,id_foranea_criterio)
      VALUES
        (gen_random_uuid(), now(), 'cumple', pts_cumple, criterio_id),
        (gen_random_uuid(), now(), 'medio cumple', pts_medio_cumple, criterio_id),
        (gen_random_uuid(), now(), 'no cumple', pts_no_cumple, criterio_id);
    END LOOP;

    -- Rubrica 4
    FOR i IN 1..5 LOOP
      criterio_id := gen_random_uuid();
      INSERT INTO public.criterios_evaluacion (id_criterio,"created_at",nombre_criterio,detalles_criterio,puntos_criterio,id_foranea_rubrica)
      VALUES (criterio_id, now(), format('Criterio %s Rubrica 4', i), 'Lorem ipsum dolor sit amet', pts_cumple, rubrica_unif);

      INSERT INTO public.cumplimientos (id_cumplimiento,"created_at",detalle_cumplimiento,puntos_cumplimiento,id_foranea_criterio)
      VALUES
        (gen_random_uuid(), now(), 'cumple', pts_cumple, criterio_id),
        (gen_random_uuid(), now(), 'medio cumple', pts_medio_cumple, criterio_id),
        (gen_random_uuid(), now(), 'no cumple', pts_no_cumple, criterio_id);
    END LOOP;

    -- Rubrica 5 (disciplina: 5 criterios + 2 cumplimientos cada uno)
    FOR i IN 1..5 LOOP
      criterio_id := gen_random_uuid();
      INSERT INTO public.criterios_evaluacion (id_criterio,"created_at",nombre_criterio,detalles_criterio,puntos_criterio,id_foranea_rubrica)
      VALUES (criterio_id, now(), format('Criterio %s Rubrica 5', i), 'Lorem ipsum dolor sit amet', pts_disciplina_aplica, rubrica_disc);

      INSERT INTO public.cumplimientos (id_cumplimiento,"created_at",detalle_cumplimiento,puntos_cumplimiento,id_foranea_criterio)
      VALUES
        (gen_random_uuid(), now(), 'no aplica', pts_disciplina_no_aplica, criterio_id),
        (gen_random_uuid(), now(), 'aplica', pts_disciplina_aplica, criterio_id);
    END LOOP;
  END LOOP;
END seed_rubricas_por_categoria;




/* ====================================================================== */
/* BANDAS SASHA 2026 + UN DIRIGENTE POR BANDA                            */
/* ====================================================================== */
<<seed_bandas_y_dirigentes>>
DECLARE
  banda_row RECORD;
  banda_id UUID;
  categoria_id UUID;
BEGIN
  FOR banda_row IN
    SELECT *
    FROM (VALUES
      ('Francisco Morazan', 'BASICA', 'dirigentefranciscomorazan@sasha.com'),
      ('Luis Landa', 'BASICA', 'dirigenteluislanda@sasha.com'),
      ('Dionisio de Herrera', 'BASICA', 'dirigentedionisiodeherrera@sasha.com'),
      ('San Francisco', 'BASICA', 'dirigentesanfrancisco@sasha.com'),
      ('Centro educativo perfecto', 'INTERMEDIA', 'dirigentecentroeducativoperfecto@sasha.com'),
      ('Las aguilas', 'INTERMEDIA', 'dirigentelasaguilas@sasha.com'),
      ('San José', 'INTERMEDIA', 'dirigentesanjose@sasha.com'),
      ('Fraternidad', 'AVANZADA', 'dirigentefraternidad@sasha.com'),
      ('San Antonio', 'AVANZADA', 'dirigentesanantonio@sasha.com')
    ) AS bandas_seed(nombre_banda, categoria_banda, email_dirigente)
  LOOP
    categoria_id := CASE banda_row.categoria_banda
      WHEN 'BASICA' THEN idCategoriaBasica
      WHEN 'INTERMEDIA' THEN idCategoriaIntermedia
      WHEN 'AVANZADA' THEN idCategoriaAvanzada
      ELSE idCategoriaBasica
    END;

    banda_id := gen_random_uuid();

    INSERT INTO public."bandas"(
      id_banda,
      created_at,
      nombre_banda,
      id_foranea_categoria,
      id_foranea_region,
      id_foranea_federacion
    )
    VALUES (banda_id, now(), banda_row.nombre_banda, categoria_id, idRegionGeneral, id_federacion);

    tmp_email := banda_row.email_dirigente;
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('name', format('Dirigente %s', banda_row.nombre_banda), 'role', 'dirigente'),
      now(), now(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      tmp_email,
      new_identity_id,
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', tmp_email),
      'email',
      now(),
      now(),
      now()
    );

    INSERT INTO public.perfiles (
      id_perfil,
      "created_at",
      "nombre",
      id_foranea_federacion,
      id_foranea_user,
      id_foranea_rol,
      id_foranea_banda,
      "permisos"
    )
    VALUES (
      gen_random_uuid(),
      now(),
      format('Dirigente %s', banda_row.nombre_banda),
      id_federacion,
      new_user_id,
      idRolDirigente,
      banda_id,
      true
    );

    IF banda_row.nombre_banda = 'Dionisio de Herrera' THEN
      idBandaEvaluada := banda_id;
    END IF;
  END LOOP;
END seed_bandas_y_dirigentes;

/* ====================================================================== */
/* EVENTOS SASHA 2026                                                    */
/* evento test 1 = "hoy" en America/Tegucigalpa (no CURRENT_DATE UTC).   */
/* Supabase/Postgres usan UTC: de noche en HN, CURRENT_DATE ya es mañana */
/* y el dashboard (fecha local) no lo muestra como evento del día.       */
/* + Dionisio 8 ago + test 2/3/4. Todos en región general.               */
/* ====================================================================== */
<<seed_eventos_sasha_2026>>
DECLARE
  evento_row RECORD;
  evento_id UUID;
  fecha_hoy_hn date := (timezone('America/Tegucigalpa', now()))::date;
BEGIN
  FOR evento_row IN
    SELECT *
    FROM (VALUES
      ('evento test 1', fecha_hoy_hn),
      ('Dionisio de Herrera SPS', '2026-08-08'::date),
      ('evento test 2', '2026-08-09'::date),
      ('evento test 3', '2026-08-16'::date),
      ('evento test 4', '2026-08-23'::date)
    ) AS eventos_seed(lugar_evento, fecha_evento)
  LOOP
    evento_id := gen_random_uuid();

    INSERT INTO public.registro_eventos(
      id_evento,
      created_at,
      lugar_evento,
      fecha_evento,
      id_foranea_region,
      id_foranea_federacion,
      tipo_evento
    )
    VALUES (
      evento_id,
      now(),
      evento_row.lugar_evento,
      evento_row.fecha_evento,
      idRegionGeneral,
      id_federacion,
      'regional'
    );

    idEventosSeed := array_append(idEventosSeed, evento_id);

    IF coalesce(array_length(idEventosEvaluacion, 1), 0) < 1 THEN
      idEventosEvaluacion := array_append(idEventosEvaluacion, evento_id);
    END IF;
  END LOOP;
END seed_eventos_sasha_2026;

/* ====================================================================== */
/* Premios por escuadra (demo: banda evaluada × eventos de evaluación)    */
/* ====================================================================== */
    IF idBandaEvaluada IS NOT NULL AND coalesce(array_length(idEventosEvaluacion, 1), 0) > 0 THEN
      FOREACH v_evento IN ARRAY idEventosEvaluacion LOOP
        INSERT INTO public.premios_escuadra (
          created_at,
          id_foranea_banda,
          id_foranea_escuadra,
          id_foranea_evento
        )
        SELECT
          now(),
          idBandaEvaluada,
          e.id_escuadra,
          v_evento
        FROM public.escuadras e
        WHERE e.nombre_escuadra IN (
          'Redoblante',
          'Tarolas',
          'Cureros',
          'Liras',
          'Bombos',
          'Platillos',
          'Guiros'
        );
      END LOOP;
    END IF;

/* ====================================================================== */
/* EQUIPO EVALUADOR: personal global en los 4 eventos                     */
/* Jurados: 1 rúbrica cada uno (BASICA Rubrica 1..5) para poder evaluar.  */
/* ====================================================================== */
    FOREACH v_evento IN ARRAY idEventosSeed LOOP
      v_idx_rub := 0;
      FOR v_rubrica IN
        SELECT r.id_rubrica AS id_rubrica, r.nombre_rubrica AS nombre_rubrica
        FROM public.rubricas r
        WHERE r.id_foranea_categoria = idCategoriaBasica
          AND r.id_foranea_federacion = id_federacion
        ORDER BY r.nombre_rubrica
      LOOP
        v_idx_rub := v_idx_rub + 1;
        EXIT WHEN v_idx_rub > coalesce(array_length(idPerfilJurados, 1), 0);
        v_jurado := idPerfilJurados[v_idx_rub];

        INSERT INTO public.registro_equipo_evaluador (
          id_registro_evaluador,
          "created_at",
          id_foranea_evento,
          id_foranea_perfil,
          id_foranea_rubrica
        )
        VALUES (gen_random_uuid(), now(), v_evento, v_jurado, v_rubrica.id_rubrica);
      END LOOP;

      FOREACH tmp_id IN ARRAY ARRAY[
        idPerfilFiscal,
        idPerfilResponsableBandas,
        idPerfilResponsableUsuarios,
        idPerfilResponsableEventos,
        idPerfilResponsableMesa,
        idPerfilSecretaria
      ] LOOP
        INSERT INTO public.registro_equipo_evaluador (id_registro_evaluador, "created_at", id_foranea_evento, id_foranea_perfil)
        VALUES (gen_random_uuid(), now(), v_evento, tmp_id);
      END LOOP;
    END LOOP;

    /* ====================================================================== */
    /* EVALUACIONES: 5 jurados = 5 rúbricas (cada jurado evalúa solo 1).       */
    /* Banda Dionisio de Herrera en el primer evento SASHA 2026.              */
    /* ====================================================================== */
    IF idBandaEvaluada IS NOT NULL THEN
      FOREACH v_evento IN ARRAY idEventosEvaluacion LOOP
        v_idx_rub := 0;
        FOR v_rubrica IN
          SELECT r.id_rubrica AS id_rubrica, r.nombre_rubrica AS nombre_rubrica
          FROM public.rubricas r
          WHERE r.id_foranea_categoria = idCategoriaBasica
            AND r.id_foranea_federacion = id_federacion
          ORDER BY r.nombre_rubrica
        LOOP
          v_idx_rub := v_idx_rub + 1;
          EXIT WHEN v_idx_rub > 5;
          v_jurado := idPerfilJurados[v_idx_rub];

          v_es_disciplina := v_rubrica.nombre_rubrica = 'Rubrica 5';
          v_pos := 0;

          FOR v_criterio IN
            SELECT ce.id_criterio AS id_criterio
            FROM public.criterios_evaluacion ce
            WHERE ce.id_foranea_rubrica = v_rubrica.id_rubrica
            ORDER BY ce.nombre_criterio
          LOOP
            v_pos := v_pos + 1;

            IF v_es_disciplina THEN
              v_cumple_label := CASE WHEN v_pos = 5 THEN 'aplica' ELSE 'no aplica' END;
            ELSE
              v_cumple_label := CASE WHEN v_pos = 5 THEN 'medio cumple' ELSE 'cumple' END;
            END IF;

            SELECT c.id_cumplimiento
              INTO v_cumple_id
            FROM public.cumplimientos c
            WHERE c.id_foranea_criterio = v_criterio.id_criterio
              AND c.detalle_cumplimiento = v_cumple_label
            LIMIT 1;

            /* puntosObtenidos = misma escala que pts_* (no confiar en duplicados/typos en tabla) */
            v_cumple_pts := CASE v_cumple_label
              WHEN 'cumple' THEN pts_cumple
              WHEN 'medio cumple' THEN pts_medio_cumple
              WHEN 'no cumple' THEN pts_no_cumple
              WHEN 'no aplica' THEN pts_disciplina_no_aplica
              WHEN 'aplica' THEN pts_disciplina_aplica
              ELSE pts_no_cumple
            END;

            INSERT INTO public.registro_cumplimiento_evaluaciones
              (id_registro_cumplimiento_evaluacion, "created_at", id_foranea_evento, id_foranea_banda,
               id_foranea_criterio, id_foranea_cumplimiento, id_foranea_categoria, id_foranea_region,
               puntos_obtenidos, id_foranea_perfil, id_foranea_federacion, id_foranea_rubrica)
            VALUES
              (gen_random_uuid(), now(), v_evento, idBandaEvaluada,
               v_criterio.id_criterio, v_cumple_id, idCategoriaBasica, idRegionGeneral,
               v_cumple_pts, v_jurado, id_federacion, v_rubrica.id_rubrica);
          END LOOP;

          INSERT INTO public.registro_comentarios
            (id_registro_comentario, "created_at", id_foranea_evento, id_foranea_banda,
             id_foranea_categoria, id_foranea_region, id_foranea_perfil, "comentario",
             id_foranea_rubrica, id_foranea_federacion)
          VALUES
            (gen_random_uuid(), now(), v_evento, idBandaEvaluada,
             idCategoriaBasica, idRegionGeneral, v_jurado,
             'Lorem ipsum dolor sit amet.',
             v_rubrica.id_rubrica, id_federacion);
        END LOOP;
      END LOOP;
    END IF;











    /* ====================================================================== */
    /* COMITÉ DE DISCIPLINA — usuario de prueba                               */
    /* Email: comite.disciplina@sasha.com  |  Password: 12345678             */
    /* ====================================================================== */

    tmp_email := 'comite.disciplina@sasha.com';
    new_user_id := gen_random_uuid();
    new_identity_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id, 'authenticated', 'authenticated', tmp_email,
      extensions.crypt(seed_password, extensions.gen_salt('bf')),
      now(), now(), now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('name', 'Carlos Aguilar', 'role', 'comite de disciplina'),
      now(), now(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (
      tmp_email,
      new_identity_id,
      new_user_id,
      jsonb_build_object('sub', new_user_id::text, 'email', tmp_email),
      'email',
      now(), now(), now()
    );

    INSERT INTO public.perfiles (
      id_perfil, "created_at", "nombre", primer_apellido,
      id_foranea_federacion, id_foranea_user, id_foranea_rol, "permisos"
    )
    VALUES (
      gen_random_uuid(), now(), 'Carlos', 'Aguilar',
      id_federacion, new_user_id, idRolComiteDisciplina, true
    );

    /* ====================================================================== */
    /* SANCIONES — catálogo de prueba (4 sanciones)                           */
    /* ====================================================================== */

    INSERT INTO public.sanciones (
      id_sancion, created_at, detalles_sancion, puntos_sancion,
      fecha_creacion_sancion, version
    )
    VALUES
      (
        idSancion1, now(),
        'Llegada tardía al evento (más de 15 minutos de retraso sin justificación previa)',
        5,
        CURRENT_DATE, '1.0'
      ),
      (
        idSancion2, now(),
        'Conducta antideportiva o irrespeto hacia jueces, árbitros u organizadores',
        10,
        CURRENT_DATE, '1.0'
      ),
      (
        idSancion3, now(),
        'Uniforme incompleto o no acorde al reglamento oficial de la federación',
        3,
        CURRENT_DATE, '1.0'
      ),
      (
        idSancion4, now(),
        'Abandono del evento sin autorización previa del comité organizador',
        15,
        CURRENT_DATE, '1.0'
      );

END $$