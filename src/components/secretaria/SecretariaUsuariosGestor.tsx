"use client";

import UsuariosCrud from "@/components/usuarios/UsuariosCrud";
import { ROLES_PRIVILEGIADOS_USUARIOS } from "@/helpers/usuarios/rolesUsuarios";

export default function SecretariaUsuariosGestor() {
  return (
    <UsuariosCrud
      queryKey={["secretaria", "perfiles"]}
      rolesExcluidos={ROLES_PRIVILEGIADOS_USUARIOS}
    />
  );
}
