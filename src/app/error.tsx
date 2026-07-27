"use client";

import { useEffect, useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { cerrarSesionYLimpiar } from "@/lib/utils/sesion";

interface ErrorBoundaryProps {
    error: Error & { digest?: string };
    reset: () => void;
}

const GlobalError = ({ error, reset }: ErrorBoundaryProps) => {
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        console.error("❌ Error no capturado en la app:", error);
    }, [error]);

    const irAlLogin = async () => {
        if (procesando) return;
        setProcesando(true);
        await cerrarSesionYLimpiar();
    };

    return (
        <div className="login h-screen flex justify-center items-center px-4 lg:px-12">
            <div className="backdrop-blur-3xl bg-gray-900/40 text-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto flex flex-col items-center text-center">
                <div className="mb-4 text-amber-300" aria-hidden="true">
                    <ExclamationTriangleIcon className="w-16 h-16" />
                </div>
                <h1 className="text-3xl font-bold text-gray-100">Algo salió mal</h1>
                <p className="text-gray-400 mt-4 leading-relaxed">
                    Ocurrió un error inesperado. Puedes intentar de nuevo o cerrar sesión y volver a entrar.
                </p>

                <div className="mt-8 w-full flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={() => reset()}
                        className="bg-gray-100/10 text-white px-4 py-2 w-full rounded hover:bg-gray-100/20 transition-colors"
                    >
                        Intentar de nuevo
                    </button>
                    <button
                        type="button"
                        onClick={irAlLogin}
                        disabled={procesando}
                        className="bg-gray-900/40 text-white px-4 py-2 w-full rounded hover:bg-gray-800/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {procesando ? "Cerrando sesión..." : "Ir a iniciar sesión"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalError;
