"use client";

import { Suspense } from "react";
import { UserMinusIcon } from "@heroicons/react/24/outline";
import ErrorPageShell from "../_components/ErrorPageShell";

const Page = () => {
    return (
        <Suspense fallback={null}>
            <ErrorPageShell
                icon={<UserMinusIcon className="w-16 h-16" />}
                titulo="Usuario no encontrado"
                mensaje="No encontramos tu usuario en la base de datos. Es posible que haya sido eliminado o desactivado. Inicia sesión de nuevo para continuar."
            />
        </Suspense>
    );
};

export default Page;
