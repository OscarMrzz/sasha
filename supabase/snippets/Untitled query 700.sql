DO $$
DECLARE
    id_user UUID := gen_random_uuid();

begin

INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    id_user,
    'osscarodriguez@gmail.com',
    crypt('12345678', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"name":"oscar admin","role":"admin"}'
);

END $$;