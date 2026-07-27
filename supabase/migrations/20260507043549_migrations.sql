
  create table "public"."confirmacion_asistencia" (
    "id_confirmacion_asistencia" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "id_foranea_banda" uuid,
    "id_foranea_evento" uuid,
    "estado_asistencia" boolean
      );


alter table "public"."confirmacion_asistencia" enable row level security;

CREATE UNIQUE INDEX confirmacion_asistencia_pkey ON public.confirmacion_asistencia USING btree (id_confirmacion_asistencia);

alter table "public"."confirmacion_asistencia" add constraint "confirmacion_asistencia_pkey" PRIMARY KEY using index "confirmacion_asistencia_pkey";

alter table "public"."confirmacion_asistencia" add constraint "confirmacion_asistencia_id_foranea_banda_fkey" FOREIGN KEY (id_foranea_banda) REFERENCES public.bandas("idBanda") not valid;

alter table "public"."confirmacion_asistencia" validate constraint "confirmacion_asistencia_id_foranea_banda_fkey";

alter table "public"."confirmacion_asistencia" add constraint "confirmacion_asistencia_id_foranea_evento_fkey" FOREIGN KEY (id_foranea_evento) REFERENCES public."registroEventos"("idEvento") not valid;

alter table "public"."confirmacion_asistencia" validate constraint "confirmacion_asistencia_id_foranea_evento_fkey";

grant delete on table "public"."confirmacion_asistencia" to "anon";

grant insert on table "public"."confirmacion_asistencia" to "anon";

grant references on table "public"."confirmacion_asistencia" to "anon";

grant select on table "public"."confirmacion_asistencia" to "anon";

grant trigger on table "public"."confirmacion_asistencia" to "anon";

grant truncate on table "public"."confirmacion_asistencia" to "anon";

grant update on table "public"."confirmacion_asistencia" to "anon";

grant delete on table "public"."confirmacion_asistencia" to "authenticated";

grant insert on table "public"."confirmacion_asistencia" to "authenticated";

grant references on table "public"."confirmacion_asistencia" to "authenticated";

grant select on table "public"."confirmacion_asistencia" to "authenticated";

grant trigger on table "public"."confirmacion_asistencia" to "authenticated";

grant truncate on table "public"."confirmacion_asistencia" to "authenticated";

grant update on table "public"."confirmacion_asistencia" to "authenticated";

grant delete on table "public"."confirmacion_asistencia" to "postgres";

grant insert on table "public"."confirmacion_asistencia" to "postgres";

grant references on table "public"."confirmacion_asistencia" to "postgres";

grant select on table "public"."confirmacion_asistencia" to "postgres";

grant trigger on table "public"."confirmacion_asistencia" to "postgres";

grant truncate on table "public"."confirmacion_asistencia" to "postgres";

grant update on table "public"."confirmacion_asistencia" to "postgres";

grant delete on table "public"."confirmacion_asistencia" to "service_role";

grant insert on table "public"."confirmacion_asistencia" to "service_role";

grant references on table "public"."confirmacion_asistencia" to "service_role";

grant select on table "public"."confirmacion_asistencia" to "service_role";

grant trigger on table "public"."confirmacion_asistencia" to "service_role";

grant truncate on table "public"."confirmacion_asistencia" to "service_role";

grant update on table "public"."confirmacion_asistencia" to "service_role";


  create policy "crear"
  on "public"."confirmacion_asistencia"
  as permissive
  for insert
  to public
with check (public.revisar_permisos('confirmacion_asistencia'::text, 'INSERT'::text));



  create policy "editar"
  on "public"."confirmacion_asistencia"
  as permissive
  for update
  to public
using (true)
with check (public.revisar_permisos('confirmacion_asistencia'::text, 'UPDATE'::text));



  create policy "eliminar"
  on "public"."confirmacion_asistencia"
  as permissive
  for delete
  to public
using (public.revisar_permisos('confirmacion_asistencia'::text, 'DELETE'::text));



  create policy "leer"
  on "public"."confirmacion_asistencia"
  as permissive
  for select
  to public
using (public.revisar_permisos('confirmacion_asistencia'::text, 'SELECT'::text));



