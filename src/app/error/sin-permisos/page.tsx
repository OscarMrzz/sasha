"use client";

import { Suspense } from "react";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import ErrorPageShell from "../_components/ErrorPageShell";

const Page = () => {
    return (
        <Suspense fallback={null}>
            <ErrorPageShell
                icon={<LockClosedIcon className="w-16 h-16" />}
                titulo="Sin permisos"
                mensaje="Tu cuenta ya no tiene permisos para acceder. Si crees que es un error, contacta al administrador de la federación."
            />
        </Suspense>
    );
};

export default Page;
