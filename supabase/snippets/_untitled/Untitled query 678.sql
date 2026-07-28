create or replace function revisar_permisos(target_table text,target_action text) returns boolean as
$$

declare
tiene_permisos boolean;
id_rol_user_auth uuid;

begin

select "idForaneaRol" into id_rol_user_auth from perfiles where perfiles."idForaneaUser" = auth.uid();

-- Si no se encuentra el rol del usuario, retornar false
if id_rol_user_auth is null then
  return false;
end if;

  select exists(
    select 1 from permisos
    where "idForaneaRol" =id_rol_user_auth 
    and
    tabla = target_table
    and
    accion = target_action

  ) into tiene_permisos;
  return tiene_permisos;




end;

$$language plpgsql security definer;