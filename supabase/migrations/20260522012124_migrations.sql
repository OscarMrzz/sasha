
  create table "public"."solicitud_copas" (
    "id_solicitud_copa" uuid not null default gen_random_uuid(),
    "created_at_solicitud_copa" timestamp with time zone not null default now(),
    "id_foranea_evento" uuid not null,
    "id_foranea_banda" uuid not null,
    "id_foranea_solicitante" uuid not null,
    "tipo_solicitud_copa" text not null,
    "justificacion_solicitud_copa" text not null,
    "estado" boolean,
    "lugar_solicitud_copas" numeric not null
      );


alter table "public"."solicitud_copas" enable row level security;

CREATE UNIQUE INDEX solicitud_copas_pkey ON public.solicitud_copas USING btree (id_solicitud_copa);

alter table "public"."solicitud_copas" add constraint "solicitud_copas_pkey" PRIMARY KEY using index "solicitud_copas_pkey";

alter table "public"."solicitud_copas" add constraint "solicitud_copas_id_foranea_banda_fkey" FOREIGN KEY (id_foranea_banda) REFERENCES public.bandas("idBanda") not valid;

alter table "public"."solicitud_copas" validate constraint "solicitud_copas_id_foranea_banda_fkey";

alter table "public"."solicitud_copas" add constraint "solicitud_copas_id_foranea_evento_fkey" FOREIGN KEY (id_foranea_evento) REFERENCES public."registroEventos"("idEvento") not valid;

alter table "public"."solicitud_copas" validate constraint "solicitud_copas_id_foranea_evento_fkey";

alter table "public"."solicitud_copas" add constraint "solicitud_copas_id_foranea_solicitante_fkey" FOREIGN KEY (id_foranea_solicitante) REFERENCES public.perfiles("idPerfil") not valid;

alter table "public"."solicitud_copas" validate constraint "solicitud_copas_id_foranea_solicitante_fkey";

set check_function_bodies = off;

create or replace view "public"."vista_solicitud_copas" as  SELECT solicitud_copas.id_solicitud_copa,
    solicitud_copas.created_at_solicitud_copa,
    solicitud_copas.justificacion_solicitud_copa,
    solicitud_copas.lugar_solicitud_copas,
    solicitud_copas.tipo_solicitud_copa,
    solicitud_copas.estado,
    "registroEventos"."idEvento",
    "registroEventos"."LugarEvento",
    "registroEventos".estado_evento,
    "registroEventos"."fechaEvento",
    bandas."idBanda",
    bandas."nombreBanda",
    categorias."idCategoria",
    categorias."nombreCategoria",
    regiones."idRegion",
    regiones."nombreRegion",
    solicitud_copas.id_foranea_solicitante,
    perfiles.nombre AS nombre_solicitante,
    perfiles."primerApellido" AS apelli_solicitante
   FROM (((((public.solicitud_copas
     JOIN public."registroEventos" ON (("registroEventos"."idEvento" = solicitud_copas.id_foranea_evento)))
     JOIN public.bandas ON ((bandas."idBanda" = solicitud_copas.id_foranea_banda)))
     JOIN public.perfiles ON ((perfiles."idPerfil" = solicitud_copas.id_foranea_solicitante)))
     JOIN public.regiones ON ((regiones."idRegion" = bandas."idForaneaRegion")))
     JOIN public.categorias ON ((categorias."idCategoria" = bandas."idForaneaCategoria")));


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
BEGIN
  SELECT "idForaneaRol" INTO id_rol_user_auth
  FROM perfiles
  WHERE perfiles."idForaneaUser" = auth.uid()
  LIMIT 1;

  IF id_rol_user_auth IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM permisos
    WHERE permisos."idForaneaRol" = id_rol_user_auth
      AND permisos.tabla = target_table
      AND permisos.accion = target_action
  ) INTO tiene_permisos;

  RETURN tiene_permisos;
END;
$function$
;

grant delete on table "public"."solicitud_copas" to "anon";

grant insert on table "public"."solicitud_copas" to "anon";

grant references on table "public"."solicitud_copas" to "anon";

grant select on table "public"."solicitud_copas" to "anon";

grant trigger on table "public"."solicitud_copas" to "anon";

grant truncate on table "public"."solicitud_copas" to "anon";

grant update on table "public"."solicitud_copas" to "anon";

grant delete on table "public"."solicitud_copas" to "authenticated";

grant insert on table "public"."solicitud_copas" to "authenticated";

grant references on table "public"."solicitud_copas" to "authenticated";

grant select on table "public"."solicitud_copas" to "authenticated";

grant trigger on table "public"."solicitud_copas" to "authenticated";

grant truncate on table "public"."solicitud_copas" to "authenticated";

grant update on table "public"."solicitud_copas" to "authenticated";

grant delete on table "public"."solicitud_copas" to "postgres";

grant insert on table "public"."solicitud_copas" to "postgres";

grant references on table "public"."solicitud_copas" to "postgres";

grant select on table "public"."solicitud_copas" to "postgres";

grant trigger on table "public"."solicitud_copas" to "postgres";

grant truncate on table "public"."solicitud_copas" to "postgres";

grant update on table "public"."solicitud_copas" to "postgres";

grant delete on table "public"."solicitud_copas" to "service_role";

grant insert on table "public"."solicitud_copas" to "service_role";

grant references on table "public"."solicitud_copas" to "service_role";

grant select on table "public"."solicitud_copas" to "service_role";

grant trigger on table "public"."solicitud_copas" to "service_role";

grant truncate on table "public"."solicitud_copas" to "service_role";

grant update on table "public"."solicitud_copas" to "service_role";


  create policy "actualizar"
  on "public"."solicitar_sancion"
  as permissive
  for update
  to public
using (public.revisar_permisos('solicitar_sancion'::text, 'UPDATE'::text));



  create policy "crear"
  on "public"."solicitar_sancion"
  as permissive
  for insert
  to public
with check (public.revisar_permisos('solicitar_sancion'::text, 'INSERT'::text));



  create policy "eliminar"
  on "public"."solicitar_sancion"
  as permissive
  for delete
  to public
using (public.revisar_permisos('solicitar_sancion'::text, 'DELETE'::text));



  create policy "leer"
  on "public"."solicitar_sancion"
  as permissive
  for select
  to public
using (public.revisar_permisos('solicitar_sancion'::text, 'SELECT'::text));



