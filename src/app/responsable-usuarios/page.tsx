"use client";

import UsuariosCrud from "@/component/usuarios/UsuariosCrud";
import { ROLES_PRIVILEGIADOS_USUARIOS } from "@/lib/usuarios/rolesUsuarios";

export default function ResponsableUsuariosPage() {
  return (
    <UsuariosCrud
      queryKey={["responsable-usuarios", "perfiles"]}
      rolesExcluidos={ROLES_PRIVILEGIADOS_USUARIOS}
    />
  );
}
