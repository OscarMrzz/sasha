"use client";

import { Suspense } from "react";
import { UserMinusIcon } from "@heroicons/react/24/outline";
import ErrorPageShell from "../_components/ErrorPageShell";
import { MENSAJE_USUARIO_ELIMINADO } from "@/lib/usuarios/validarAccesoPerfil";

const Page = () => {
  return (
    <Suspense fallback={null}>
      <ErrorPageShell
        icon={<UserMinusIcon className="w-16 h-16" />}
        titulo="Cuenta eliminada"
        mensaje={MENSAJE_USUARIO_ELIMINADO}
      />
    </Suspense>
  );
};

export default Page;
