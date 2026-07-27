
  create table "public"."escuadras" (
    "id_escuadra" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "nombre_escuadra" text
      );


alter table "public"."escuadras" enable row level security;


  create table "public"."premio_escuadra" (
    "id_premio_escuadra" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "id_foranea_banda" uuid,
    "id_foranea_escuadra" uuid,
    "id_foranea_evento" uuid
      );


alter table "public"."premio_escuadra" enable row level security;


  create table "public"."premios_escuadra" (
    "id_premio_escuadra" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "id_foranea_banda" uuid,
    "id_foranea_escuadra" uuid,
    "id_foranea_evento" uuid
      );


alter table "public"."premios_escuadra" enable row level security;

CREATE UNIQUE INDEX escuadras_pkey ON public.escuadras USING btree (id_escuadra);

CREATE UNIQUE INDEX premios_escuadra_pkey ON public.premios_escuadra USING btree (id_premio_escuadra);

alter table "public"."escuadras" add constraint "escuadras_pkey" PRIMARY KEY using index "escuadras_pkey";

alter table "public"."premios_escuadra" add constraint "premios_escuadra_pkey" PRIMARY KEY using index "premios_escuadra_pkey";

alter table "public"."premios_escuadra" add constraint "premios_escuadra_id_foranea_banda_fkey" FOREIGN KEY (id_foranea_banda) REFERENCES public.bandas("idBanda") not valid;

alter table "public"."premios_escuadra" validate constraint "premios_escuadra_id_foranea_banda_fkey";

alter table "public"."premios_escuadra" add constraint "premios_escuadra_id_foranea_escuadra_fkey" FOREIGN KEY (id_foranea_escuadra) REFERENCES public.escuadras(id_escuadra) not valid;

alter table "public"."premios_escuadra" validate constraint "premios_escuadra_id_foranea_escuadra_fkey";

alter table "public"."premios_escuadra" add constraint "premios_escuadra_id_foranea_evento_fkey" FOREIGN KEY (id_foranea_evento) REFERENCES public."registroEventos"("idEvento") not valid;

alter table "public"."premios_escuadra" validate constraint "premios_escuadra_id_foranea_evento_fkey";

grant delete on table "public"."escuadras" to "anon";

grant insert on table "public"."escuadras" to "anon";

grant references on table "public"."escuadras" to "anon";

grant select on table "public"."escuadras" to "anon";

grant trigger on table "public"."escuadras" to "anon";

grant truncate on table "public"."escuadras" to "anon";

grant update on table "public"."escuadras" to "anon";

grant delete on table "public"."escuadras" to "authenticated";

grant insert on table "public"."escuadras" to "authenticated";

grant references on table "public"."escuadras" to "authenticated";

grant select on table "public"."escuadras" to "authenticated";

grant trigger on table "public"."escuadras" to "authenticated";

grant truncate on table "public"."escuadras" to "authenticated";

grant update on table "public"."escuadras" to "authenticated";

grant delete on table "public"."escuadras" to "postgres";

grant insert on table "public"."escuadras" to "postgres";

grant references on table "public"."escuadras" to "postgres";

grant select on table "public"."escuadras" to "postgres";

grant trigger on table "public"."escuadras" to "postgres";

grant truncate on table "public"."escuadras" to "postgres";

grant update on table "public"."escuadras" to "postgres";

grant delete on table "public"."escuadras" to "service_role";

grant insert on table "public"."escuadras" to "service_role";

grant references on table "public"."escuadras" to "service_role";

grant select on table "public"."escuadras" to "service_role";

grant trigger on table "public"."escuadras" to "service_role";

grant truncate on table "public"."escuadras" to "service_role";

grant update on table "public"."escuadras" to "service_role";

grant delete on table "public"."premio_escuadra" to "anon";

grant insert on table "public"."premio_escuadra" to "anon";

grant references on table "public"."premio_escuadra" to "anon";

grant select on table "public"."premio_escuadra" to "anon";

grant trigger on table "public"."premio_escuadra" to "anon";

grant truncate on table "public"."premio_escuadra" to "anon";

grant update on table "public"."premio_escuadra" to "anon";

grant delete on table "public"."premio_escuadra" to "authenticated";

grant insert on table "public"."premio_escuadra" to "authenticated";

grant references on table "public"."premio_escuadra" to "authenticated";

grant select on table "public"."premio_escuadra" to "authenticated";

grant trigger on table "public"."premio_escuadra" to "authenticated";

grant truncate on table "public"."premio_escuadra" to "authenticated";

grant update on table "public"."premio_escuadra" to "authenticated";

grant delete on table "public"."premio_escuadra" to "postgres";

grant insert on table "public"."premio_escuadra" to "postgres";

grant references on table "public"."premio_escuadra" to "postgres";

grant select on table "public"."premio_escuadra" to "postgres";

grant trigger on table "public"."premio_escuadra" to "postgres";

grant truncate on table "public"."premio_escuadra" to "postgres";

grant update on table "public"."premio_escuadra" to "postgres";

grant delete on table "public"."premio_escuadra" to "service_role";

grant insert on table "public"."premio_escuadra" to "service_role";

grant references on table "public"."premio_escuadra" to "service_role";

grant select on table "public"."premio_escuadra" to "service_role";

grant trigger on table "public"."premio_escuadra" to "service_role";

grant truncate on table "public"."premio_escuadra" to "service_role";

grant update on table "public"."premio_escuadra" to "service_role";

grant delete on table "public"."premios_escuadra" to "anon";

grant insert on table "public"."premios_escuadra" to "anon";

grant references on table "public"."premios_escuadra" to "anon";

grant select on table "public"."premios_escuadra" to "anon";

grant trigger on table "public"."premios_escuadra" to "anon";

grant truncate on table "public"."premios_escuadra" to "anon";

grant update on table "public"."premios_escuadra" to "anon";

grant delete on table "public"."premios_escuadra" to "authenticated";

grant insert on table "public"."premios_escuadra" to "authenticated";

grant references on table "public"."premios_escuadra" to "authenticated";

grant select on table "public"."premios_escuadra" to "authenticated";

grant trigger on table "public"."premios_escuadra" to "authenticated";

grant truncate on table "public"."premios_escuadra" to "authenticated";

grant update on table "public"."premios_escuadra" to "authenticated";

grant delete on table "public"."premios_escuadra" to "postgres";

grant insert on table "public"."premios_escuadra" to "postgres";

grant references on table "public"."premios_escuadra" to "postgres";

grant select on table "public"."premios_escuadra" to "postgres";

grant trigger on table "public"."premios_escuadra" to "postgres";

grant truncate on table "public"."premios_escuadra" to "postgres";

grant update on table "public"."premios_escuadra" to "postgres";

grant delete on table "public"."premios_escuadra" to "service_role";

grant insert on table "public"."premios_escuadra" to "service_role";

grant references on table "public"."premios_escuadra" to "service_role";

grant select on table "public"."premios_escuadra" to "service_role";

grant trigger on table "public"."premios_escuadra" to "service_role";

grant truncate on table "public"."premios_escuadra" to "service_role";

grant update on table "public"."premios_escuadra" to "service_role";


