"use client";

import UsuariosCrud from "@/component/usuarios/UsuariosCrud";
import { ROLES_PRIVILEGIADOS_USUARIOS } from "@/lib/usuarios/rolesUsuarios";

export default function SecretariaUsuariosGestor() {
  return (
    <UsuariosCrud
      queryKey={["secretaria", "perfiles"]}
      rolesExcluidos={ROLES_PRIVILEGIADOS_USUARIOS}
    />
  );
}
