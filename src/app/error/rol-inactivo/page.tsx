"use client";

import { Suspense } from "react";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";
import ErrorPageShell from "../_components/ErrorPageShell";

const Page = () => {
    return (
        <Suspense fallback={null}>
            <ErrorPageShell
                icon={<ShieldExclamationIcon className="w-16 h-16" />}
                titulo="Rol inactivo"
                mensaje="Tu rol fue desactivado o ya no está disponible. Inicia sesión con otra cuenta o pide al administrador que reactive tu rol."
            />
        </Suspense>
    );
};

export default Page;
