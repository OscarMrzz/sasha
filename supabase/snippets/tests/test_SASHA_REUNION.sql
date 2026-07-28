DO $$

DECLARE

 idRegionPrincipal UUID := gen_random_uuid();
    idRegionOccidente UUID := gen_random_uuid();
    idRegionCentroSur UUID := gen_random_uuid();
    idRegionAguan UUID := gen_random_uuid();


    idCategoriaPremier UUID := gen_random_uuid();
    idCategoriaA UUID := gen_random_uuid();
    idCategoriaB UUID := gen_random_uuid();
    idCategoriaLibre UUID := gen_random_uuid();



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
    idPerfilResponsableUsuarios UUID;
    idPerfilResponsableEventos UUID;
    idPerfilResponsableMesa UUID;
    idBandaEvaluada UUID;
    idEventosSeed UUID[] := ARRAY[]::UUID[];
    idEventosEvaluacion UUID[] := ARRAY[]::UUID[];

    /* Escala fija criterios positivos: techo rúbrica = 5 criterios * pts_cumple (= 25) */
    pts_cumple INT := 5;
    pts_medio_cumple INT := 3;
    pts_no_cumple INT := 0;
    pts_disciplina_no_aplica INT := 0;
    pts_disciplina_aplica INT := -5;  -- techo rúbrica disciplina = 5 * esto (= -25)

    -- Evaluaciones seed para una banda real en dos eventos nuevos
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

    /* Variables para personal por zona */
    idPerfilJuradosPrincipal UUID[] := ARRAY[]::UUID[];
    idPerfilJuradosOccidente UUID[] := ARRAY[]::UUID[];
    idPerfilJuradosAguan UUID[] := ARRAY[]::UUID[];
    idPerfilJuradosCentro UUID[] := ARRAY[]::UUID[];
    idPerfilFiscalPrincipal UUID;
    idPerfilFiscalOccidente UUID;
    idPerfilFiscalAguan UUID;
    idPerfilFiscalCentro UUID;
    idPerfilMesaPrincipal UUID;
    idPerfilMesaOccidente UUID;
    idPerfilMesaAguan UUID;
    idPerfilMesaCentro UUID;
    idPerfilSecretariaPrincipal UUID;
    idPerfilSecretariaOccidente UUID;
    idPerfilSecretariaAguan UUID;
    idPerfilSecretariaCentro UUID;
    idEventosPrincipal UUID[] := ARRAY[]::UUID[];
    idEventosOccidente UUID[] := ARRAY[]::UUID[];
    idEventosAguan UUID[] := ARRAY[]::UUID[];
    idEventosCentro UUID[] := ARRAY[]::UUID[];
    zona_idx INT;
    zona_jurado_idx INT;

BEGIN

    /* ====================================================================== */
    /* LIMPIEZA TOTAL (solo para ambiente de pruebas) */
    /* ====================================================================== */
    DELETE FROM public."registroCumplimientoEvaluaciones";
    DELETE FROM public."registroEquipoEvaluador";
    DELETE FROM public."registroComentarios";
    DELETE FROM public."respuestaSolicitudRevicion";
    DELETE FROM public."solicitudRevicion";
    DELETE FROM public.premios_escuadra;
    DELETE FROM public.premio_escuadra;
    DELETE FROM public.escuadras;
    DELETE FROM public."registroEventos";
    DELETE FROM public."bandas";
    DELETE FROM public."cumplimientos";
    DELETE FROM public."criteriosEvalucion";
    DELETE FROM public."rubricas";
    DELETE FROM public."categorias";
    DELETE FROM public."regiones";
    DELETE FROM public."perfiles";
    DELETE FROM auth.identities;
    DELETE FROM auth.users;

    -- 1. Asignamos el valor a la variable
    SELECT "idFederacion" INTO id_federacion 
    FROM federaciones 
    WHERE "nombreFederacion" = 'SASHA-DEV';

    -- Si no existe la federación base, la creamos (para que el snippet sea auto-contenido)
    IF id_federacion IS NULL THEN
      id_federacion := gen_random_uuid();
      INSERT INTO public.federaciones ("idFederacion","created_at","nombreFederacion")
      VALUES (id_federacion, now(), 'SASHA-DEV');
    END IF;

    -- Resolver IDs de roles por nombre (si no existen, los creamos)
    SELECT "idRol" INTO idRolDeveloper
    FROM public.roles
    WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'developer';

    IF idRolDeveloper IS NULL THEN
      idRolDeveloper := gen_random_uuid();
      idRolAdmin := gen_random_uuid();
      idRolAdminTemporal := gen_random_uuid();
      idRolJurado := gen_random_uuid();
      idRolFiscal := gen_random_uuid();
      idRolDirigente := gen_random_uuid();
      idRolLiderbanda := gen_random_uuid();
      idRolResponsableBandas := gen_random_uuid();
      idRolResponsableUsuarios := gen_random_uuid();
      idRolResponsableEventos := gen_random_uuid();
      idRolResponsableMesa := gen_random_uuid();
      idRolSecretaria := gen_random_uuid();

      INSERT INTO public.roles ("idRol", created_at, "idForaneaFederacion", "nombreRol", "estadoRol")
      VALUES
        (idRolDeveloper, now(), id_federacion, 'developer', true),
        (idRolAdmin, now(), id_federacion, 'admin', true),
        (idRolAdminTemporal, now(), id_federacion, 'admin temporal', true),
        (idRolJurado, now(), id_federacion, 'jurado', true),
        (idRolFiscal, now(), id_federacion, 'fiscal', true),
        (idRolDirigente, now(), id_federacion, 'dirigente', true),
        (idRolLiderbanda, now(), id_federacion, 'lider de banda', true),
        (idRolResponsableBandas, now(), id_federacion, 'responsable de bandas', true),
        (idRolResponsableUsuarios, now(), id_federacion, 'responsable de usuarios', true),
        (idRolResponsableEventos, now(), id_federacion, 'responsable de eventos', true),
        (idRolResponsableMesa, now(), id_federacion, 'responsable de mesa', true),
        (idRolSecretaria, now(), id_federacion, 'secretaria', true);
    ELSE
      SELECT "idRol" INTO idRolAdmin FROM public.roles WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'admin';
      SELECT "idRol" INTO idRolAdminTemporal FROM public.roles WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'admin temporal';
      SELECT "idRol" INTO idRolJurado FROM public.roles WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'jurado';
      SELECT "idRol" INTO idRolFiscal FROM public.roles WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'fiscal';
      SELECT "idRol" INTO idRolDirigente FROM public.roles WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'dirigente';
      SELECT "idRol" INTO idRolLiderbanda FROM public.roles WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'lider de banda';
      SELECT "idRol" INTO idRolResponsableBandas FROM public.roles WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'responsable de bandas';
      SELECT "idRol" INTO idRolResponsableUsuarios FROM public.roles WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'responsable de usuarios';
      SELECT "idRol" INTO idRolResponsableEventos FROM public.roles WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'responsable de eventos';
      SELECT "idRol" INTO idRolResponsableMesa FROM public.roles WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'responsable de mesa';
      SELECT "idRol" INTO idRolSecretaria FROM public.roles WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'secretaria';
    END IF;

    -- Roles extendidos: federación ya existía con roles viejos (sin los 4 responsables)
    IF idRolResponsableBandas IS NULL THEN
      idRolResponsableBandas := gen_random_uuid();
      idRolResponsableUsuarios := gen_random_uuid();
      idRolResponsableEventos := gen_random_uuid();
      idRolResponsableMesa := gen_random_uuid();
      INSERT INTO public.roles ("idRol", created_at, "idForaneaFederacion", "nombreRol", "estadoRol")
      VALUES
        (idRolResponsableBandas, now(), id_federacion, 'responsable de bandas', true),
        (idRolResponsableUsuarios, now(), id_federacion, 'responsable de usuarios', true),
        (idRolResponsableEventos, now(), id_federacion, 'responsable de eventos', true),
        (idRolResponsableMesa, now(), id_federacion, 'responsable de mesa', true);
    END IF;

    IF idRolSecretaria IS NULL THEN
      idRolSecretaria := gen_random_uuid();
      INSERT INTO public.roles ("idRol", created_at, "idForaneaFederacion", "nombreRol", "estadoRol")
      VALUES (idRolSecretaria, now(), id_federacion, 'secretaria', true);
    END IF;

    /* Rol y permisos de comité: solo en seed.sql (no crear ni permisos aquí). */
    SELECT "idRol" INTO idRolComiteDisciplina
    FROM public.roles
    WHERE "idForaneaFederacion" = id_federacion AND "nombreRol" = 'comite de disciplina';

    IF idRolComiteDisciplina IS NULL THEN
      RAISE EXCEPTION 'Falta el rol "comite de disciplina". Ejecuta supabase db reset (seed.sql) antes de este snippet.';
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
    INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
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
    INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
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
    INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
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
      INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
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
    INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
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
    INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
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
    INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
    VALUES (idPerfilResponsableBandas, now(), 'Sasha Responsable Bandas', id_federacion, new_user_id, idRolResponsableBandas, true);

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
    INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
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
    INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
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
    INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
    VALUES (idPerfilResponsableMesa, now(), 'Sasha Responsable Mesa', id_federacion, new_user_id, idRolResponsableMesa, true);

    /* ====================================================================== */
    /* PERSONAL POR ZONA - 4 JURADOS + 1 FISCAL + 1 RESPONSABLE DE MESA + 1 SECRETARIA */
    /* ====================================================================== */
    <<seed_personal_por_zona>>
    DECLARE
      zona_info RECORD;
      zona_nombre TEXT;
      zona_jurados UUID[];
      zona_fiscal UUID;
      zona_mesa UUID;
      zona_secretaria UUID;
    BEGIN
      FOR zona_info IN
        SELECT * FROM (VALUES
          ('Principal', idRegionPrincipal),
          ('Occidente', idRegionOccidente),
          ('Aguan', idRegionAguan),
          ('Centro', idRegionCentroSur)
        ) AS zonas_data(nombre, region_id)
      LOOP
        zona_nombre := zona_info.nombre;
        zona_jurados := ARRAY[]::UUID[];

        /* Crear 4 jurados por zona */
        FOR zona_jurado_idx IN 1..4 LOOP
          tmp_email := format('jurado%s%s@sasha.com', lower(CASE WHEN zona_nombre = 'Centro' THEN 'centro' ELSE zona_nombre END), zona_jurado_idx);
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
            jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
            jsonb_build_object('name', format('Jurado %s %s', zona_nombre, zona_jurado_idx), 'role', 'jurado'),
            now(), now(),
            '', '', '', ''
          );
          INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
          VALUES (tmp_email, new_identity_id, new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', tmp_email), 'email', now(), now(), now());
          INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
          VALUES (tmp_id, now(), format('Jurado %s %s', zona_nombre, zona_jurado_idx), id_federacion, new_user_id, idRolJurado, true);
          zona_jurados := array_append(zona_jurados, tmp_id);
        END LOOP;

        /* Crear fiscal por zona */
        tmp_email := format('fiscal%s@sasha.com', lower(CASE WHEN zona_nombre = 'Centro' THEN 'centro' ELSE zona_nombre END));
        new_user_id := gen_random_uuid();
        new_identity_id := gen_random_uuid();
        zona_fiscal := gen_random_uuid();
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
          jsonb_build_object('name', format('Fiscal %s', zona_nombre), 'role', 'fiscal'),
          now(), now(),
          '', '', '', ''
        );
        INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (tmp_email, new_identity_id, new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', tmp_email), 'email', now(), now(), now());
        INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
        VALUES (zona_fiscal, now(), format('Fiscal %s', zona_nombre), id_federacion, new_user_id, idRolFiscal, true);

        /* Crear responsable de mesa por zona */
        tmp_email := format('responsablemesa%s@sasha.com', lower(CASE WHEN zona_nombre = 'Centro' THEN 'centro' ELSE zona_nombre END));
        new_user_id := gen_random_uuid();
        new_identity_id := gen_random_uuid();
        zona_mesa := gen_random_uuid();
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
          jsonb_build_object('name', format('Responsable Mesa %s', zona_nombre), 'role', 'responsable de mesa'),
          now(), now(),
          '', '', '', ''
        );
        INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (tmp_email, new_identity_id, new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', tmp_email), 'email', now(), now(), now());
        INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
        VALUES (zona_mesa, now(), format('Responsable Mesa %s', zona_nombre), id_federacion, new_user_id, idRolResponsableMesa, true);

        /* Secretaria por zona (emails fijos para login de prueba) */
        tmp_email := CASE zona_nombre
          WHEN 'Principal' THEN 'secretariaprincipal@sasha.com'
          WHEN 'Occidente' THEN 'secretariaoccidente@sasha.com'
          WHEN 'Aguan' THEN 'secretariaaguan@sasha.com'
          WHEN 'Centro' THEN 'secretariacentro@sasha.com'
        END;
        new_user_id := gen_random_uuid();
        new_identity_id := gen_random_uuid();
        zona_secretaria := gen_random_uuid();
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
          jsonb_build_object('name', format('Secretaria %s', zona_nombre), 'role', 'secretaria'),
          now(), now(),
          '', '', '', ''
        );
        INSERT INTO auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (tmp_email, new_identity_id, new_user_id, jsonb_build_object('sub', new_user_id::text, 'email', tmp_email), 'email', now(), now(), now());
        INSERT INTO public.perfiles ("idPerfil","created_at","nombre","idForaneaFederacion","idForaneaUser","idForaneaRol","permisos")
        VALUES (zona_secretaria, now(), format('Secretaria %s', zona_nombre), id_federacion, new_user_id, idRolSecretaria, true);

        /* Asignar perfiles a variables globales por zona */
        IF zona_nombre = 'Principal' THEN
          idPerfilJuradosPrincipal := zona_jurados;
          idPerfilFiscalPrincipal := zona_fiscal;
          idPerfilMesaPrincipal := zona_mesa;
          idPerfilSecretariaPrincipal := zona_secretaria;
        ELSIF zona_nombre = 'Occidente' THEN
          idPerfilJuradosOccidente := zona_jurados;
          idPerfilFiscalOccidente := zona_fiscal;
          idPerfilMesaOccidente := zona_mesa;
          idPerfilSecretariaOccidente := zona_secretaria;
        ELSIF zona_nombre = 'Aguan' THEN
          idPerfilJuradosAguan := zona_jurados;
          idPerfilFiscalAguan := zona_fiscal;
          idPerfilMesaAguan := zona_mesa;
          idPerfilSecretariaAguan := zona_secretaria;
        ELSIF zona_nombre = 'Centro' THEN
          idPerfilJuradosCentro := zona_jurados;
          idPerfilFiscalCentro := zona_fiscal;
          idPerfilMesaCentro := zona_mesa;
          idPerfilSecretariaCentro := zona_secretaria;
        END IF;
      END LOOP;
    END seed_personal_por_zona;

  


/* 🔷🔷🔷========================================================================🔷🔷🔷 */
/* regiones */






INSERT INTO  public.regiones ("idRegion","created_at","nombreRegion","idForaneaFederacion") 
VALUES 
(idRegionPrincipal, now(),'Principal',id_federacion),
(idRegionOccidente, now(),'Occidente',id_federacion),
(idRegionCentroSur, now(),'Centro sur',id_federacion),
(idRegionAguan, now(),'Bajos de Aguan',id_federacion);





INSERT INTO   public.categorias ("idCategoria","created_at","nombreCategoria","detallesCategoria","idForaneaFederacion") 
VALUES 
(idCategoriaPremier, now(),'Categoria Premier','Lorem ipsum dolor sit amet',id_federacion),
(idCategoriaA, now(),'Categoria A','Lorem ipsum dolor sit amet',id_federacion),
(idCategoriaB, now(),'Categoria B','Lorem ipsum dolor sit amet',id_federacion),
(idCategoriaLibre, now(),'Categoria Libre','Lorem ipsum dolor sit amet',id_federacion);


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
    SELECT unnest(ARRAY[idCategoriaPremier, idCategoriaA, idCategoriaB, idCategoriaLibre])
  LOOP
    rubrica_m1 := gen_random_uuid();
    rubrica_m2 := gen_random_uuid();
    rubrica_coreo := gen_random_uuid();
    rubrica_unif := gen_random_uuid();
    rubrica_disc := gen_random_uuid();

    INSERT INTO public.rubricas ("idRubrica","created_at","nombreRubrica","datalleRubrica","puntosRubrica","idForaneaCategoria","idForaneaFederacion","versionRubrica")
    VALUES
      (rubrica_m1, now(), 'Rubrica Musicalidad 1', 'Lorem ipsum dolor sit amet', pts_cumple * 5, cat_id, id_federacion, '2026-01'),
      (rubrica_m2, now(), 'Rubrica Musicalidad 2', 'Lorem ipsum dolor sit amet', pts_cumple * 5, cat_id, id_federacion, '2026-01'),
      (rubrica_coreo, now(), 'Rubrica Coreografia', 'Lorem ipsum dolor sit amet', pts_cumple * 5, cat_id, id_federacion, '2026-01'),
      (rubrica_unif, now(), 'Rubrica Uniformidad', 'Lorem ipsum dolor sit amet', pts_cumple * 5, cat_id, id_federacion, '2026-01'),
      (rubrica_disc, now(), 'Rubrica Diciplina', 'Lorem ipsum dolor sit amet', pts_disciplina_aplica * 5, cat_id, id_federacion, '2026-01');

    -- Musicalidad 1 (5 criterios + 3 cumplimientos cada uno)
    FOR i IN 1..5 LOOP
      criterio_id := gen_random_uuid();
      INSERT INTO public."criteriosEvalucion" ("idCriterio","created_at","nombreCriterio","detallesCriterio","puntosCriterio","idForaneaRubrica")
      VALUES (criterio_id, now(), format('Criterio %s Musicalidad 1', i), 'Lorem ipsum dolor sit amet', pts_cumple, rubrica_m1);

      INSERT INTO public.cumplimientos ("idCumplimiento","created_at","detalleCumplimiento","puntosCumplimiento","idForaneaCriterio")
      VALUES
        (gen_random_uuid(), now(), 'cumple', pts_cumple, criterio_id),
        (gen_random_uuid(), now(), 'medio cumple', pts_medio_cumple, criterio_id),
        (gen_random_uuid(), now(), 'no cumple', pts_no_cumple, criterio_id);
    END LOOP;

    -- Musicalidad 2
    FOR i IN 1..5 LOOP
      criterio_id := gen_random_uuid();
      INSERT INTO public."criteriosEvalucion" ("idCriterio","created_at","nombreCriterio","detallesCriterio","puntosCriterio","idForaneaRubrica")
      VALUES (criterio_id, now(), format('Criterio %s Musicalidad 2', i), 'Lorem ipsum dolor sit amet', pts_cumple, rubrica_m2);

      INSERT INTO public.cumplimientos ("idCumplimiento","created_at","detalleCumplimiento","puntosCumplimiento","idForaneaCriterio")
      VALUES
        (gen_random_uuid(), now(), 'cumple', pts_cumple, criterio_id),
        (gen_random_uuid(), now(), 'medio cumple', pts_medio_cumple, criterio_id),
        (gen_random_uuid(), now(), 'no cumple', pts_no_cumple, criterio_id);
    END LOOP;

    -- Coreografia
    FOR i IN 1..5 LOOP
      criterio_id := gen_random_uuid();
      INSERT INTO public."criteriosEvalucion" ("idCriterio","created_at","nombreCriterio","detallesCriterio","puntosCriterio","idForaneaRubrica")
      VALUES (criterio_id, now(), format('Criterio %s Coreografia', i), 'Lorem ipsum dolor sit amet', pts_cumple, rubrica_coreo);

      INSERT INTO public.cumplimientos ("idCumplimiento","created_at","detalleCumplimiento","puntosCumplimiento","idForaneaCriterio")
      VALUES
        (gen_random_uuid(), now(), 'cumple', pts_cumple, criterio_id),
        (gen_random_uuid(), now(), 'medio cumple', pts_medio_cumple, criterio_id),
        (gen_random_uuid(), now(), 'no cumple', pts_no_cumple, criterio_id);
    END LOOP;

    -- Uniformidad
    FOR i IN 1..5 LOOP
      criterio_id := gen_random_uuid();
      INSERT INTO public."criteriosEvalucion" ("idCriterio","created_at","nombreCriterio","detallesCriterio","puntosCriterio","idForaneaRubrica")
      VALUES (criterio_id, now(), format('Criterio %s Uniformidad', i), 'Lorem ipsum dolor sit amet', pts_cumple, rubrica_unif);

      INSERT INTO public.cumplimientos ("idCumplimiento","created_at","detalleCumplimiento","puntosCumplimiento","idForaneaCriterio")
      VALUES
        (gen_random_uuid(), now(), 'cumple', pts_cumple, criterio_id),
        (gen_random_uuid(), now(), 'medio cumple', pts_medio_cumple, criterio_id),
        (gen_random_uuid(), now(), 'no cumple', pts_no_cumple, criterio_id);
    END LOOP;

    -- Disciplina (5 criterios + 2 cumplimientos cada uno)
    FOR i IN 1..5 LOOP
      criterio_id := gen_random_uuid();
      INSERT INTO public."criteriosEvalucion" ("idCriterio","created_at","nombreCriterio","detallesCriterio","puntosCriterio","idForaneaRubrica")
      VALUES (criterio_id, now(), format('Criterio %s Diciplina', i), 'Lorem ipsum dolor sit amet', pts_disciplina_aplica, rubrica_disc);

      INSERT INTO public.cumplimientos ("idCumplimiento","created_at","detalleCumplimiento","puntosCumplimiento","idForaneaCriterio")
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
      ('Inst. Fran D.R', 'B', 'dirigentefrandr@sasha.com'),
      ('Inst. Minerva', 'B', 'dirigenteminerva@sasha.com'),
      ('Inst. Santa Cruz', 'B', 'dirigenteinstitutosantacruz@sasha.com'),
      ('Inst. Manantial de valores', 'B', 'dirigentemanantialdevalores@sasha.com'),
      ('ind. Cholomeña', 'B', 'dirigentecholomena@sasha.com'),
      ('ind. 0501', 'B', 'dirigente0501@sasha.com'),
      ('Inst. Ponce', 'B', 'dirigenteponce@sasha.com'),
      ('Inst. En-Hacore', 'B', 'dirigenteenhacore@sasha.com'),
      ('Inst. Saunt Anthony', 'B', 'dirigentesauntanthony@sasha.com'),
      ('ind. Lluvia de Peces', 'B', 'dirigentelluviadepeces@sasha.com'),
      ('Inst. bethel', 'B', 'dirigentebethel@sasha.com'),
      ('ind. Furia Blanca', 'B', 'dirigentefuriablanca@sasha.com'),
      ('Inst. Republica de Honduras', 'B', 'dirigenterepublicadehonduras@sasha.com'),
      ('Ind. Santa Cruz', 'B', 'dirigenteindependientesantacruz@sasha.com'),
      ('Inst. Sotero Barahona', 'B', 'dirigentesoterobarahona@sasha.com'),
      ('Inst. Union y Esfurzo', 'B', 'dirigenteunionyesfurzo@sasha.com'),
      ('ind. Crito Rey', 'B', 'dirigenteindependientecritorey@sasha.com'),
      ('inst. Crito Rey', 'A', 'dirigenteinstitutocritorey@sasha.com'),
      ('Muni. Negriteña', 'A', 'dirigentenegritena@sasha.com'),
      ('ind. Cofradilla', 'A', 'dirigentecofradilla@sasha.com'),
      ('inst. Subirana', 'A', 'dirigentesubirana@sasha.com'),
      ('Ind.  Dos caminos', 'A', 'dirigentedoscaminos@sasha.com'),
      ('Ind.  Mezapeña', 'A', 'dirigentemezapena@sasha.com'),
      ('Ind.  Legion Porteña', 'A', 'dirigentelegionportena@sasha.com'),
      ('Ind.  Delfina Mejia', 'A', 'dirigentedelfinamejia@sasha.com'),
      ('Ind.  San Antonio', 'A', 'dirigentesanantonio@sasha.com'),
      ('Ind.  Perla ', 'A', 'dirigenteperla@sasha.com'),
      ('Ind. Tecno', 'PREMIER', 'dirigentetecno@sasha.com'),
      ('Ind. ASB', 'PREMIER', 'dirigenteasb@sasha.com'),
      ('Ind. BIT', 'PREMIER', 'dirigentebit@sasha.com'),
      ('Inst. San ramon', 'PREMIER', 'dirigentesanramon@sasha.com'),
      ('Inst. Patria', 'PREMIER', 'dirigentepatria@sasha.com'),
      ('Inst. Pagan', 'PREMIER', 'dirigentepagan@sasha.com'),
      ('Ind. IPC', 'PREMIER', 'dirigenteipc@sasha.com'),
      ('Ind. MBP', 'PREMIER', 'dirigentembp@sasha.com')
    ) AS bandas_seed(nombre_banda, categoria_banda, email_dirigente)
  LOOP
    categoria_id := CASE banda_row.categoria_banda
      WHEN 'PREMIER' THEN idCategoriaPremier
      WHEN 'A' THEN idCategoriaA
      WHEN 'B' THEN idCategoriaB
      ELSE idCategoriaLibre
    END;

    banda_id := gen_random_uuid();

    INSERT INTO public."bandas"(
      "idBanda",
      created_at,
      "nombreBanda",
      "idForaneaCategoria",
      "idForaneaRegion",
      "idForaneaFederacion"
    )
    VALUES (banda_id, now(), banda_row.nombre_banda, categoria_id, idRegionPrincipal, id_federacion);

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
      "idPerfil",
      "created_at",
      "nombre",
      "idForaneaFederacion",
      "idForaneaUser",
      "idForaneaRol",
      "idForaneaBanda",
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

    IF banda_row.nombre_banda = 'Ind.  Dos caminos' THEN
      idBandaEvaluada := banda_id;
    END IF;
  END LOOP;
END seed_bandas_y_dirigentes;

/* ====================================================================== */
/* EVENTOS SASHA 2026                                                    */
/* Cuatro eventos "del día": una zona cada uno, fecha = día de ejecución   */
/* (CURRENT_DATE). El resto del calendario mantiene fechas de ejemplo.     */
/* ====================================================================== */
<<seed_eventos_sasha_2026>>
DECLARE
  evento_row RECORD;
  evento_id UUID;
BEGIN
  FOR evento_row IN
    SELECT *
    FROM (VALUES
      ('Inst. Patria', CURRENT_DATE, 'Principal'),
      ('IBCC', CURRENT_DATE, 'Occidente'),
      ('Ind. de Saba', CURRENT_DATE, 'Aguan'),
      ('Inst. Leon Alvarado', CURRENT_DATE, 'Centro'),
      ('Santa Clara', '2026-06-14'::date, 'Centro'),
      ('Inst. Franklin D.R', '2026-06-28'::date, 'Principal'),
      ('Inst. San Antonio', '2026-07-05'::date, 'Principal'),
      ('Inst. Ramon Rosa', '2026-07-12'::date, 'Principal'),
      ('Inst. Manuel Pagan Lozano', '2026-07-19'::date, 'Principal'),
      ('Inst. Republica de Honduras', '2026-07-26'::date, 'Principal'),
      ('Ind. Puerto Cortes', '2026-08-02'::date, 'Principal'),
      ('Inst. San ramon', '2026-08-09'::date, 'Principal'),
      ('Nacional Zona Centro', '2026-08-16'::date, 'Centro'),
      ('Inst. Liceo Insular', '2026-08-22'::date, 'Principal'),
      ('Ins. Minerva', '2026-08-23'::date, 'Principal'),
      ('Inst. Delfina Mejia', '2026-08-30'::date, 'Principal'),
      ('Ins. Perla del ulua', '2026-09-06'::date, 'Principal'),
      ('Inst. Tecnico Honduras', '2026-09-19'::date, 'Principal'),
      ('Latinos de Sula', '2026-09-20'::date, 'Principal'),
      ('Ind. Cofradilla', '2026-10-04'::date, 'Principal'),
      ('Ind. Teleña', '2026-10-18'::date, 'Occidente'),
      ('nacional Zona aguan', '2026-10-25'::date, 'Aguan')
    ) AS eventos_seed(lugar_evento, fecha_evento, zona_evento)
  LOOP
    evento_id := gen_random_uuid();

    INSERT INTO public."registroEventos"(
      "idEvento",
      created_at,
      "LugarEvento",
      "fechaEvento",
      "idForaneaRegion",
      "idForaneaFederacion"
    )
    VALUES (evento_id, now(), evento_row.lugar_evento, evento_row.fecha_evento, 
      CASE evento_row.zona_evento
        WHEN 'Principal' THEN idRegionPrincipal
        WHEN 'Occidente' THEN idRegionOccidente
        WHEN 'Aguan' THEN idRegionAguan
        WHEN 'Centro' THEN idRegionCentroSur
        ELSE idRegionPrincipal
      END,
      id_federacion);

    idEventosSeed := array_append(idEventosSeed, evento_id);

    /* Asignar eventos del día actual a arrays por zona (equipo evaluador por región) */
    IF evento_row.fecha_evento = CURRENT_DATE THEN
      CASE evento_row.zona_evento
        WHEN 'Principal' THEN idEventosPrincipal := array_append(idEventosPrincipal, evento_id);
        WHEN 'Occidente' THEN idEventosOccidente := array_append(idEventosOccidente, evento_id);
        WHEN 'Aguan' THEN idEventosAguan := array_append(idEventosAguan, evento_id);
        WHEN 'Centro' THEN idEventosCentro := array_append(idEventosCentro, evento_id);
        ELSE NULL;
      END CASE;
    END IF;

    IF coalesce(array_length(idEventosEvaluacion, 1), 0) < 2 THEN
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
/* EQUIPO EVALUADOR: Personal asignado por zona a sus eventos            */
/* ====================================================================== */
    /* Asignación de equipo evaluador para Zona Principal */
    FOREACH v_evento IN ARRAY idEventosPrincipal LOOP
      FOREACH tmp_id IN ARRAY idPerfilJuradosPrincipal LOOP
        INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
        VALUES (gen_random_uuid(), now(), v_evento, tmp_id);
      END LOOP;
      INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
      VALUES (gen_random_uuid(), now(), v_evento, idPerfilFiscalPrincipal);
      INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
      VALUES (gen_random_uuid(), now(), v_evento, idPerfilMesaPrincipal);
      INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
      VALUES (gen_random_uuid(), now(), v_evento, idPerfilSecretariaPrincipal);
    END LOOP;

    /* Asignación de equipo evaluador para Zona Occidente */
    FOREACH v_evento IN ARRAY idEventosOccidente LOOP
      FOREACH tmp_id IN ARRAY idPerfilJuradosOccidente LOOP
        INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
        VALUES (gen_random_uuid(), now(), v_evento, tmp_id);
      END LOOP;
      INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
      VALUES (gen_random_uuid(), now(), v_evento, idPerfilFiscalOccidente);
      INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
      VALUES (gen_random_uuid(), now(), v_evento, idPerfilMesaOccidente);
      INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
      VALUES (gen_random_uuid(), now(), v_evento, idPerfilSecretariaOccidente);
    END LOOP;

    /* Asignación de equipo evaluador para Zona Aguan */
    FOREACH v_evento IN ARRAY idEventosAguan LOOP
      FOREACH tmp_id IN ARRAY idPerfilJuradosAguan LOOP
        INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
        VALUES (gen_random_uuid(), now(), v_evento, tmp_id);
      END LOOP;
      INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
      VALUES (gen_random_uuid(), now(), v_evento, idPerfilFiscalAguan);
      INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
      VALUES (gen_random_uuid(), now(), v_evento, idPerfilMesaAguan);
      INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
      VALUES (gen_random_uuid(), now(), v_evento, idPerfilSecretariaAguan);
    END LOOP;

    /* Asignación de equipo evaluador para Zona Centro */
    FOREACH v_evento IN ARRAY idEventosCentro LOOP
      FOREACH tmp_id IN ARRAY idPerfilJuradosCentro LOOP
        INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
        VALUES (gen_random_uuid(), now(), v_evento, tmp_id);
      END LOOP;
      INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
      VALUES (gen_random_uuid(), now(), v_evento, idPerfilFiscalCentro);
      INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
      VALUES (gen_random_uuid(), now(), v_evento, idPerfilMesaCentro);
      INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
      VALUES (gen_random_uuid(), now(), v_evento, idPerfilSecretariaCentro);
    END LOOP;

    /* Asignación de equipo evaluador para eventos que no son del día (CURRENT_DATE) */
    <<assign_legacy_events>>
    DECLARE
      legacy_event UUID;
      legacy_event_count INT := 0;
    BEGIN
      FOREACH legacy_event IN ARRAY idEventosSeed LOOP
        IF NOT (legacy_event = ANY(idEventosPrincipal) OR legacy_event = ANY(idEventosOccidente) 
                OR legacy_event = ANY(idEventosAguan) OR legacy_event = ANY(idEventosCentro)) THEN
          FOREACH tmp_id IN ARRAY idPerfilJurados LOOP
            INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
            VALUES (gen_random_uuid(), now(), legacy_event, tmp_id);
          END LOOP;

          FOREACH tmp_id IN ARRAY ARRAY[
            idPerfilFiscal,
            idPerfilResponsableBandas,
            idPerfilResponsableUsuarios,
            idPerfilResponsableEventos,
            idPerfilResponsableMesa
          ] LOOP
            INSERT INTO public."registroEquipoEvaluador" ("idRegistroEvaluador", "created_at", "idForaneaEvento", "idForaneaPerfil")
            VALUES (gen_random_uuid(), now(), legacy_event, tmp_id);
          END LOOP;
        END IF;
      END LOOP;
    END assign_legacy_events;

    /* ====================================================================== */
    /* EVALUACIONES: 5 jurados = 5 rúbricas (cada jurado evalúa solo 1).       */
    /* Banda Dos Caminos en los dos primeros eventos SASHA 2026.             */
    /* ====================================================================== */
    IF idBandaEvaluada IS NOT NULL THEN
      FOREACH v_evento IN ARRAY idEventosEvaluacion LOOP
        v_idx_rub := 0;
        FOR v_rubrica IN
          SELECT r."idRubrica" AS id_rubrica, r."nombreRubrica" AS nombre_rubrica
          FROM public.rubricas r
          WHERE r."idForaneaCategoria" = idCategoriaA
            AND r."idForaneaFederacion" = id_federacion
          ORDER BY r."nombreRubrica"
        LOOP
          v_idx_rub := v_idx_rub + 1;
          EXIT WHEN v_idx_rub > 5;
          v_jurado := idPerfilJurados[v_idx_rub];

          v_es_disciplina := v_rubrica.nombre_rubrica ILIKE '%Diciplina%';
          v_pos := 0;

          FOR v_criterio IN
            SELECT ce."idCriterio" AS id_criterio
            FROM public."criteriosEvalucion" ce
            WHERE ce."idForaneaRubrica" = v_rubrica.id_rubrica
            ORDER BY ce."nombreCriterio"
          LOOP
            v_pos := v_pos + 1;

            IF v_es_disciplina THEN
              v_cumple_label := CASE WHEN v_pos = 5 THEN 'aplica' ELSE 'no aplica' END;
            ELSE
              v_cumple_label := CASE WHEN v_pos = 5 THEN 'medio cumple' ELSE 'cumple' END;
            END IF;

            SELECT c."idCumplimiento"
              INTO v_cumple_id
            FROM public.cumplimientos c
            WHERE c."idForaneaCriterio" = v_criterio.id_criterio
              AND c."detalleCumplimiento" = v_cumple_label
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

            INSERT INTO public."registroCumplimientoEvaluaciones"
              ("idRegistroCumplimientoEvaluacion", "created_at", "idForaneaEvento", "idForaneaBanda",
               "idForaneaCriterio", "idForaneaCumplimiento", "idForaneaCategoria", "idForaneaRegion",
               "puntosObtenidos", "idForaneaPerfil", "idForaneaFederacion", "idForaneaRubrica")
            VALUES
              (gen_random_uuid(), now(), v_evento, idBandaEvaluada,
               v_criterio.id_criterio, v_cumple_id, idCategoriaA, idRegionPrincipal,
               v_cumple_pts, v_jurado, id_federacion, v_rubrica.id_rubrica);
          END LOOP;

          INSERT INTO public."registroComentarios"
            ("idRegistroComentario", "created_at", "idForaneaEvento", "idForaneaBanda",
             "idForaneaCategoria", "idForaneaRegion", "idForaneaPerfil", "comentario",
             "idForaneaRubrica", "idForaneaFederacion")
          VALUES
            (gen_random_uuid(), now(), v_evento, idBandaEvaluada,
             idCategoriaA, idRegionPrincipal, v_jurado,
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
      "idPerfil", "created_at", "nombre", "primerApellido",
      "idForaneaFederacion", "idForaneaUser", "idForaneaRol", "permisos"
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