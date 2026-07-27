
  create table "public"."registro_sanciones" (
    "id_registro_sanciones" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "id_foranea_sancion" uuid,
    "id_foranea_banda" uuid,
    "id_foranea_perfil" uuid,
    "fecha" date,
    "justificacion" text
      );


alter table "public"."registro_sanciones" enable row level security;


  create table "public"."sanciones" (
    "id_sancion" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "detalles_sancion" text not null,
    "puntos_sancion" numeric not null,
    "fecha_creacion_sancion" date,
    "version" text
      );


alter table "public"."sanciones" enable row level security;

CREATE UNIQUE INDEX registro_sanciones_pkey ON public.registro_sanciones USING btree (id_registro_sanciones);

CREATE UNIQUE INDEX sanciones_pkey ON public.sanciones USING btree (id_sancion);

alter table "public"."registro_sanciones" add constraint "registro_sanciones_pkey" PRIMARY KEY using index "registro_sanciones_pkey";

alter table "public"."sanciones" add constraint "sanciones_pkey" PRIMARY KEY using index "sanciones_pkey";

alter table "public"."registro_sanciones" add constraint "registro_sanciones_id_foranea_banda_fkey" FOREIGN KEY (id_foranea_banda) REFERENCES public.bandas("idBanda") not valid;

alter table "public"."registro_sanciones" validate constraint "registro_sanciones_id_foranea_banda_fkey";

alter table "public"."registro_sanciones" add constraint "registro_sanciones_id_foranea_perfil_fkey" FOREIGN KEY (id_foranea_perfil) REFERENCES public.perfiles("idPerfil") not valid;

alter table "public"."registro_sanciones" validate constraint "registro_sanciones_id_foranea_perfil_fkey";

alter table "public"."registro_sanciones" add constraint "registro_sanciones_id_foranea_sancion_fkey" FOREIGN KEY (id_foranea_sancion) REFERENCES public.sanciones(id_sancion) not valid;

alter table "public"."registro_sanciones" validate constraint "registro_sanciones_id_foranea_sancion_fkey";

create or replace view "public"."vista_aplicacion_sanciones" as  SELECT registro_sanciones.id_registro_sanciones,
    registro_sanciones.fecha AS fecha_aplico_sancion,
    sanciones.id_sancion,
    sanciones.detalles_sancion,
    sanciones.fecha_creacion_sancion,
    sanciones.version,
    sanciones.puntos_sancion,
    bandas."idBanda",
    bandas."nombreBanda",
    categorias."idCategoria",
    categorias."nombreCategoria",
    regiones."idRegion",
    regiones."nombreRegion",
    registro_sanciones.justificacion,
    perfiles."idPerfil" AS id_sancionador,
    perfiles.nombre AS nombre_sancionador,
    perfiles."primerApellido" AS apellido_sancionador
   FROM (((((public.registro_sanciones
     JOIN public.sanciones ON ((sanciones.id_sancion = registro_sanciones.id_foranea_sancion)))
     JOIN public.bandas ON ((bandas."idBanda" = registro_sanciones.id_foranea_banda)))
     JOIN public.perfiles ON ((perfiles."idPerfil" = registro_sanciones.id_foranea_perfil)))
     JOIN public.categorias ON ((categorias."idCategoria" = bandas."idForaneaCategoria")))
     JOIN public.regiones ON ((regiones."idRegion" = bandas."idForaneaRegion")));


grant delete on table "public"."registro_sanciones" to "anon";

grant insert on table "public"."registro_sanciones" to "anon";

grant references on table "public"."registro_sanciones" to "anon";

grant select on table "public"."registro_sanciones" to "anon";

grant trigger on table "public"."registro_sanciones" to "anon";

grant truncate on table "public"."registro_sanciones" to "anon";

grant update on table "public"."registro_sanciones" to "anon";

grant delete on table "public"."registro_sanciones" to "authenticated";

grant insert on table "public"."registro_sanciones" to "authenticated";

grant references on table "public"."registro_sanciones" to "authenticated";

grant select on table "public"."registro_sanciones" to "authenticated";

grant trigger on table "public"."registro_sanciones" to "authenticated";

grant truncate on table "public"."registro_sanciones" to "authenticated";

grant update on table "public"."registro_sanciones" to "authenticated";

grant delete on table "public"."registro_sanciones" to "postgres";

grant insert on table "public"."registro_sanciones" to "postgres";

grant references on table "public"."registro_sanciones" to "postgres";

grant select on table "public"."registro_sanciones" to "postgres";

grant trigger on table "public"."registro_sanciones" to "postgres";

grant truncate on table "public"."registro_sanciones" to "postgres";

grant update on table "public"."registro_sanciones" to "postgres";

grant delete on table "public"."registro_sanciones" to "service_role";

grant insert on table "public"."registro_sanciones" to "service_role";

grant references on table "public"."registro_sanciones" to "service_role";

grant select on table "public"."registro_sanciones" to "service_role";

grant trigger on table "public"."registro_sanciones" to "service_role";

grant truncate on table "public"."registro_sanciones" to "service_role";

grant update on table "public"."registro_sanciones" to "service_role";

grant delete on table "public"."sanciones" to "anon";

grant insert on table "public"."sanciones" to "anon";

grant references on table "public"."sanciones" to "anon";

grant select on table "public"."sanciones" to "anon";

grant trigger on table "public"."sanciones" to "anon";

grant truncate on table "public"."sanciones" to "anon";

grant update on table "public"."sanciones" to "anon";

grant delete on table "public"."sanciones" to "authenticated";

grant insert on table "public"."sanciones" to "authenticated";

grant references on table "public"."sanciones" to "authenticated";

grant select on table "public"."sanciones" to "authenticated";

grant trigger on table "public"."sanciones" to "authenticated";

grant truncate on table "public"."sanciones" to "authenticated";

grant update on table "public"."sanciones" to "authenticated";

grant delete on table "public"."sanciones" to "postgres";

grant insert on table "public"."sanciones" to "postgres";

grant references on table "public"."sanciones" to "postgres";

grant select on table "public"."sanciones" to "postgres";

grant trigger on table "public"."sanciones" to "postgres";

grant truncate on table "public"."sanciones" to "postgres";

grant update on table "public"."sanciones" to "postgres";

grant delete on table "public"."sanciones" to "service_role";

grant insert on table "public"."sanciones" to "service_role";

grant references on table "public"."sanciones" to "service_role";

grant select on table "public"."sanciones" to "service_role";

grant trigger on table "public"."sanciones" to "service_role";

grant truncate on table "public"."sanciones" to "service_role";

grant update on table "public"."sanciones" to "service_role";


