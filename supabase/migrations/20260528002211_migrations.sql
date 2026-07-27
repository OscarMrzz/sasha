
  create table "public"."checkout" (
    "id_checkout" uuid not null default gen_random_uuid(),
    "created_at_checkout" timestamp with time zone not null default now(),
    "id_foranea_banda" uuid,
    "hora_llegada_banda" timestamp without time zone,
    "confirmacion_horallegada" boolean,
    "time_confirmacion_hora_llegada" time without time zone,
    "cantidad_integrantes" numeric,
    "cantidad_palillonas" numeric,
    "aportacion" numeric,
    "hora_ingreso" timestamp without time zone,
    "confirmacion_hora_ingreso" boolean,
    "time_confirmacion_hora_ingreso" timestamp without time zone,
    "observaciones" text,
    "time_envio_confirmacion_llegada" timestamp without time zone,
    "time_envio_confirmacion_ingreso" timestamp without time zone,
    "id_foranea_diciplina" uuid,
    "id_foranea_confirmador" uuid,
    "id_foranea_evento" uuid
      );


alter table "public"."checkout" enable row level security;

alter table "public"."confirmacion_asistencia" add column "estado_cancha" text;

alter table "public"."registroEquipoEvaluador" add column "id_foranea_rubrica" uuid;

CREATE UNIQUE INDEX checkout_pkey ON public.checkout USING btree (id_checkout);

alter table "public"."checkout" add constraint "checkout_pkey" PRIMARY KEY using index "checkout_pkey";

alter table "public"."checkout" add constraint "checkoup_id_foranea_banda_fkey" FOREIGN KEY (id_foranea_banda) REFERENCES public.bandas("idBanda") not valid;

alter table "public"."checkout" validate constraint "checkoup_id_foranea_banda_fkey";

alter table "public"."checkout" add constraint "checkoup_id_foranea_confirmador_fkey" FOREIGN KEY (id_foranea_confirmador) REFERENCES public.perfiles("idPerfil") not valid;

alter table "public"."checkout" validate constraint "checkoup_id_foranea_confirmador_fkey";

alter table "public"."checkout" add constraint "checkoup_id_foranea_diciplina_fkey" FOREIGN KEY (id_foranea_diciplina) REFERENCES public.perfiles("idPerfil") not valid;

alter table "public"."checkout" validate constraint "checkoup_id_foranea_diciplina_fkey";

alter table "public"."checkout" add constraint "checkout_id_foranea_evento_fkey" FOREIGN KEY (id_foranea_evento) REFERENCES public."registroEventos"("idEvento") not valid;

alter table "public"."checkout" validate constraint "checkout_id_foranea_evento_fkey";

alter table "public"."registroEquipoEvaluador" add constraint "registroEquipoEvaluador_id_foranea_rubrica_fkey" FOREIGN KEY (id_foranea_rubrica) REFERENCES public.rubricas("idRubrica") not valid;

alter table "public"."registroEquipoEvaluador" validate constraint "registroEquipoEvaluador_id_foranea_rubrica_fkey";

create or replace view "public"."vista_bandas_evento" as  SELECT confirmacion_asistencia.id_confirmacion_asistencia,
    confirmacion_asistencia.estado_asistencia,
    confirmacion_asistencia.estado_cancha,
    "registroEventos"."idEvento",
    "registroEventos"."LugarEvento",
    "registroEventos".estado_evento,
    bandas."idBanda",
    bandas."nombreBanda",
    bandas."AliasBanda",
    categorias."idCategoria",
    categorias."nombreCategoria",
    "registroEquipoEvaluador"."idForaneaPerfil",
    "registroEquipoEvaluador".id_foranea_rubrica
   FROM ((((public.confirmacion_asistencia
     JOIN public."registroEventos" ON (("registroEventos"."idEvento" = confirmacion_asistencia.id_foranea_evento)))
     JOIN public.bandas ON ((bandas."idBanda" = confirmacion_asistencia.id_foranea_banda)))
     JOIN public.categorias ON ((categorias."idCategoria" = bandas."idForaneaCategoria")))
     JOIN public."registroEquipoEvaluador" ON (("registroEquipoEvaluador"."idForaneaEvento" = "registroEventos"."idEvento")));


create or replace view "public"."vista_detalle_checkout" as  SELECT checkout.id_checkout,
    checkout.created_at_checkout,
    checkout.id_foranea_banda,
    checkout.hora_llegada_banda,
    checkout.confirmacion_horallegada,
    checkout.time_confirmacion_hora_llegada,
    checkout.cantidad_integrantes,
    checkout.cantidad_palillonas,
    checkout.aportacion,
    checkout.hora_ingreso,
    checkout.confirmacion_hora_ingreso,
    checkout.time_confirmacion_hora_ingreso,
    checkout.observaciones,
    checkout.time_envio_confirmacion_llegada,
    checkout.time_envio_confirmacion_ingreso,
    checkout.id_foranea_diciplina,
    checkout.id_foranea_confirmador,
    checkout.id_foranea_evento,
    bandas."nombreBanda",
    categorias."idCategoria" AS id_foranea_categoria,
    categorias."nombreCategoria",
    regiones."idRegion" AS id_foranea_region,
    regiones."nombreRegion",
    disiplina.nombre AS nombre_encargado_diciplina,
    disiplina."primerApellido" AS apellido_encargado_diciplina,
    confirmador.nombre AS nombre_confirmador,
    confirmador."primerApellido" AS apellido_confirmador,
    "registroEventos"."LugarEvento"
   FROM ((((((public.checkout
     JOIN public.bandas ON ((bandas."idBanda" = checkout.id_foranea_banda)))
     JOIN public.categorias ON ((categorias."idCategoria" = bandas."idForaneaCategoria")))
     JOIN public.regiones ON ((regiones."idRegion" = bandas."idForaneaRegion")))
     LEFT JOIN public.perfiles disiplina ON ((disiplina."idPerfil" = checkout.id_foranea_diciplina)))
     LEFT JOIN public.perfiles confirmador ON ((confirmador."idPerfil" = checkout.id_foranea_confirmador)))
     JOIN public."registroEventos" ON (("registroEventos"."idEvento" = checkout.id_foranea_evento)));


create or replace view "public"."vista_usuarios_por_banda_en_evento" as  SELECT confirmacion_asistencia.id_foranea_banda,
    confirmacion_asistencia.id_foranea_evento,
    bandas."idForaneaCategoria" AS id_foranea_categoria,
    perfiles."idPerfil" AS id_fonranea_perfil,
    perfiles.nombre,
    perfiles."primerApellido"
   FROM ((public.confirmacion_asistencia
     JOIN public.bandas ON ((bandas."idBanda" = confirmacion_asistencia.id_foranea_banda)))
     JOIN public.perfiles ON ((perfiles."idForaneaBanda" = bandas."idBanda")));


grant delete on table "public"."checkout" to "anon";

grant insert on table "public"."checkout" to "anon";

grant references on table "public"."checkout" to "anon";

grant select on table "public"."checkout" to "anon";

grant trigger on table "public"."checkout" to "anon";

grant truncate on table "public"."checkout" to "anon";

grant update on table "public"."checkout" to "anon";

grant delete on table "public"."checkout" to "authenticated";

grant insert on table "public"."checkout" to "authenticated";

grant references on table "public"."checkout" to "authenticated";

grant select on table "public"."checkout" to "authenticated";

grant trigger on table "public"."checkout" to "authenticated";

grant truncate on table "public"."checkout" to "authenticated";

grant update on table "public"."checkout" to "authenticated";

grant delete on table "public"."checkout" to "postgres";

grant insert on table "public"."checkout" to "postgres";

grant references on table "public"."checkout" to "postgres";

grant select on table "public"."checkout" to "postgres";

grant trigger on table "public"."checkout" to "postgres";

grant truncate on table "public"."checkout" to "postgres";

grant update on table "public"."checkout" to "postgres";

grant delete on table "public"."checkout" to "service_role";

grant insert on table "public"."checkout" to "service_role";

grant references on table "public"."checkout" to "service_role";

grant select on table "public"."checkout" to "service_role";

grant trigger on table "public"."checkout" to "service_role";

grant truncate on table "public"."checkout" to "service_role";

grant update on table "public"."checkout" to "service_role";

grant delete on table "public"."solicitud_copas" to "postgres";

grant insert on table "public"."solicitud_copas" to "postgres";

grant references on table "public"."solicitud_copas" to "postgres";

grant select on table "public"."solicitud_copas" to "postgres";

grant trigger on table "public"."solicitud_copas" to "postgres";

grant truncate on table "public"."solicitud_copas" to "postgres";

grant update on table "public"."solicitud_copas" to "postgres";


  create policy "actualizar"
  on "public"."checkout"
  as permissive
  for update
  to public
using (public.revisar_permisos('checkout'::text, 'UPDATE'::text))
with check (public.revisar_permisos('checkout'::text, 'UPDATE'::text));



  create policy "actualizar_confirmador_banda"
  on "public"."checkout"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM (public.perfiles pf
     JOIN public.roles r ON ((r."idRol" = pf."idForaneaRol")))
  WHERE ((pf."idForaneaUser" = auth.uid()) AND (pf."idForaneaBanda" IS NOT NULL) AND (pf."idForaneaBanda" = checkout.id_foranea_banda) AND (r."nombreRol" = ANY (ARRAY['dirigente'::text, 'secretaria'::text, 'lider de banda'::text, 'liderBanda'::text, 'director artistico'::text, 'directorArtistico'::text]))))))
with check ((EXISTS ( SELECT 1
   FROM (public.perfiles pf
     JOIN public.roles r ON ((r."idRol" = pf."idForaneaRol")))
  WHERE ((pf."idForaneaUser" = auth.uid()) AND (pf."idForaneaBanda" IS NOT NULL) AND (pf."idForaneaBanda" = checkout.id_foranea_banda) AND (r."nombreRol" = ANY (ARRAY['dirigente'::text, 'secretaria'::text, 'lider de banda'::text, 'liderBanda'::text, 'director artistico'::text, 'directorArtistico'::text]))))));



  create policy "crear"
  on "public"."checkout"
  as permissive
  for insert
  to public
with check (public.revisar_permisos('checkout'::text, 'INSERT'::text));



  create policy "eliminar"
  on "public"."checkout"
  as permissive
  for delete
  to public
using (public.revisar_permisos('checkout'::text, 'DELETE'::text));



  create policy "leer"
  on "public"."checkout"
  as permissive
  for select
  to public
using (public.revisar_permisos('checkout'::text, 'SELECT'::text));



  create policy "leer_confirmador_banda"
  on "public"."checkout"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM (public.perfiles pf
     JOIN public.roles r ON ((r."idRol" = pf."idForaneaRol")))
  WHERE ((pf."idForaneaUser" = auth.uid()) AND (pf."idForaneaBanda" IS NOT NULL) AND (pf."idForaneaBanda" = checkout.id_foranea_banda) AND (r."nombreRol" = ANY (ARRAY['dirigente'::text, 'secretaria'::text, 'lider de banda'::text, 'liderBanda'::text, 'director artistico'::text, 'directorArtistico'::text]))))));



  create policy "actualizar"
  on "public"."solicitud_copas"
  as permissive
  for update
  to public
using (public.revisar_permisos('solicitud_copas'::text, 'UPDATE'::text));



  create policy "crear"
  on "public"."solicitud_copas"
  as permissive
  for insert
  to public
with check (public.revisar_permisos('solicitud_copas'::text, 'INSERT'::text));



  create policy "eliminar"
  on "public"."solicitud_copas"
  as permissive
  for delete
  to public
using (public.revisar_permisos('solicitud_copas'::text, 'DELETE'::text));



  create policy "leer"
  on "public"."solicitud_copas"
  as permissive
  for select
  to public
using (public.revisar_permisos('solicitud_copas'::text, 'SELECT'::text));



