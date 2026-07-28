"use client";

import UsuariosCrud from "@/components/usuarios/UsuariosCrud";
import { ROLES_PRIVILEGIADOS_USUARIOS } from "@/helpers/usuarios/rolesUsuarios";

export default function ResponsableUsuariosPage() {
  return (
    <UsuariosCrud
      queryKey={["responsable-usuarios", "perfiles"]}
      rolesExcluidos={ROLES_PRIVILEGIADOS_USUARIOS}
    />
  );
}
