drop policy if exists "editar_propio_perfil" on "public"."perfiles";

create or replace view "public"."vista_condensado" as  SELECT regiones."idRegion",
    regiones."nombreRegion",
    categorias."idCategoria",
    categorias."nombreCategoria",
    "registroEventos"."idEvento",
    "registroEventos"."LugarEvento",
    bandas."idBanda",
    bandas."nombreBanda",
    rubricas."idRubrica",
    rubricas."nombreRubrica",
    sum("registroCumplimientoEvaluaciones"."puntosObtenidos") AS total
   FROM (((((public."registroCumplimientoEvaluaciones"
     JOIN public.rubricas ON ((rubricas."idRubrica" = "registroCumplimientoEvaluaciones"."idForaneaRubrica")))
     JOIN public.bandas ON ((bandas."idBanda" = "registroCumplimientoEvaluaciones"."idForaneaBanda")))
     JOIN public.regiones ON ((regiones."idRegion" = "registroCumplimientoEvaluaciones"."idForaneaRegion")))
     JOIN public.categorias ON ((categorias."idCategoria" = "registroCumplimientoEvaluaciones"."idForaneaCategoria")))
     JOIN public."registroEventos" ON (("registroEventos"."idEvento" = "registroCumplimientoEvaluaciones"."idForaneaEvento")))
  GROUP BY regiones."idRegion", regiones."nombreRegion", categorias."idCategoria", categorias."nombreCategoria", "registroEventos"."idEvento", "registroEventos"."LugarEvento", bandas."idBanda", bandas."nombreBanda", rubricas."idRubrica", rubricas."nombreRubrica";


drop policy if exists "agregar 1gmiffv_0" on "storage"."objects";

drop policy if exists "editar 1gmiffv_0" on "storage"."objects";

drop policy if exists "eliminar 1gmiffv_0" on "storage"."objects";

drop policy if exists "eliminar 1gmiffv_1" on "storage"."objects";

drop policy if exists "leer 1gmiffv_0" on "storage"."objects";


  create policy "storage_logo_banda_agregar"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'imgLogoBandas'::text));



  create policy "storage_logo_banda_editar"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'imgLogoBandas'::text));



  create policy "storage_logo_banda_eliminar"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'imgLogoBandas'::text));



  create policy "storage_logo_banda_leer_authenticated"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'imgLogoBandas'::text));



  create policy "storage_logo_banda_leer_public"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'imgLogoBandas'::text));



  create policy "storage_perfiles_agregar"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'img-fotos-perfiles-aurora'::text));



  create policy "storage_perfiles_editar"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'img-fotos-perfiles-aurora'::text));



  create policy "storage_perfiles_eliminar"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using ((bucket_id = 'img-fotos-perfiles-aurora'::text));



  create policy "storage_perfiles_leer_authenticated"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'img-fotos-perfiles-aurora'::text));



  create policy "storage_perfiles_leer_public"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'img-fotos-perfiles-aurora'::text));



