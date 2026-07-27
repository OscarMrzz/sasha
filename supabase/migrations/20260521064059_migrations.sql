drop policy if exists "editar" on "public"."copas";
drop policy if exists "actualizar" on "public"."copas";


  create table "public"."solicitar_sancion" (
    "id_solicitud_sancion" uuid not null default gen_random_uuid(),
    "created_at_solicitud_sancion" timestamp with time zone not null default now(),
    "id_fonranea_sancion" uuid not null,
    "id_foranea_banda" uuid not null,
    "id_foranea_solicitante" uuid not null,
    "justificacion" text not null,
    "estado" boolean
      );


alter table "public"."solicitar_sancion" enable row level security;

CREATE UNIQUE INDEX solicitar_sancion_pkey ON public.solicitar_sancion USING btree (id_solicitud_sancion);

alter table "public"."solicitar_sancion" add constraint "solicitar_sancion_pkey" PRIMARY KEY using index "solicitar_sancion_pkey";

alter table "public"."solicitar_sancion" add constraint "solicitar_sancion_id_fonranea_sancion_fkey" FOREIGN KEY (id_fonranea_sancion) REFERENCES public.sanciones(id_sancion) not valid;

alter table "public"."solicitar_sancion" validate constraint "solicitar_sancion_id_fonranea_sancion_fkey";

alter table "public"."solicitar_sancion" add constraint "solicitar_sancion_id_foranea_banda_fkey" FOREIGN KEY (id_foranea_banda) REFERENCES public.bandas("idBanda") not valid;

alter table "public"."solicitar_sancion" validate constraint "solicitar_sancion_id_foranea_banda_fkey";

alter table "public"."solicitar_sancion" add constraint "solicitar_sancion_id_foranea_solicitante_fkey" FOREIGN KEY (id_foranea_solicitante) REFERENCES public.perfiles("idPerfil") not valid;

alter table "public"."solicitar_sancion" validate constraint "solicitar_sancion_id_foranea_solicitante_fkey";

create or replace view "public"."vista_solicitud_sancion" as  SELECT solicitar_sancion.id_solicitud_sancion,
    solicitar_sancion.created_at_solicitud_sancion,
    solicitar_sancion.justificacion,
    solicitar_sancion.estado,
    sanciones.id_sancion,
    sanciones.detalles_sancion,
    sanciones.puntos_sancion,
    sanciones.version,
    sanciones.fecha_creacion_sancion,
    bandas."idBanda",
    bandas."nombreBanda",
    categorias."idCategoria",
    categorias."nombreCategoria",
    regiones."idRegion",
    regiones."nombreRegion"
   FROM ((((public.solicitar_sancion
     JOIN public.sanciones ON ((sanciones.id_sancion = solicitar_sancion.id_fonranea_sancion)))
     JOIN public.bandas ON ((bandas."idBanda" = solicitar_sancion.id_foranea_banda)))
     JOIN public.categorias ON ((categorias."idCategoria" = bandas."idForaneaCategoria")))
     JOIN public.regiones ON ((regiones."idRegion" = bandas."idForaneaRegion")))
  WHERE (EXTRACT(year FROM solicitar_sancion.created_at_solicitud_sancion) = EXTRACT(year FROM CURRENT_DATE));


grant delete on table "public"."solicitar_sancion" to "anon";

grant insert on table "public"."solicitar_sancion" to "anon";

grant references on table "public"."solicitar_sancion" to "anon";

grant select on table "public"."solicitar_sancion" to "anon";

grant trigger on table "public"."solicitar_sancion" to "anon";

grant truncate on table "public"."solicitar_sancion" to "anon";

grant update on table "public"."solicitar_sancion" to "anon";

grant delete on table "public"."solicitar_sancion" to "authenticated";

grant insert on table "public"."solicitar_sancion" to "authenticated";

grant references on table "public"."solicitar_sancion" to "authenticated";

grant select on table "public"."solicitar_sancion" to "authenticated";

grant trigger on table "public"."solicitar_sancion" to "authenticated";

grant truncate on table "public"."solicitar_sancion" to "authenticated";

grant update on table "public"."solicitar_sancion" to "authenticated";

grant delete on table "public"."solicitar_sancion" to "postgres";

grant insert on table "public"."solicitar_sancion" to "postgres";

grant references on table "public"."solicitar_sancion" to "postgres";

grant select on table "public"."solicitar_sancion" to "postgres";

grant trigger on table "public"."solicitar_sancion" to "postgres";

grant truncate on table "public"."solicitar_sancion" to "postgres";

grant update on table "public"."solicitar_sancion" to "postgres";

grant delete on table "public"."solicitar_sancion" to "service_role";

grant insert on table "public"."solicitar_sancion" to "service_role";

grant references on table "public"."solicitar_sancion" to "service_role";

grant select on table "public"."solicitar_sancion" to "service_role";

grant trigger on table "public"."solicitar_sancion" to "service_role";

grant truncate on table "public"."solicitar_sancion" to "service_role";

grant update on table "public"."solicitar_sancion" to "service_role";


  create policy "actualizar"
  on "public"."copas"
  as permissive
  for update
  to public
using (public.revisar_permisos('copas'::text, 'UPDATE'::text));



