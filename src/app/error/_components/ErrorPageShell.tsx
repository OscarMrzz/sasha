"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cerrarSesionYLimpiar, limpiarSesionLocal } from "@/helpers/utils/sesion";

interface ErrorPageShellProps {
    icon: ReactNode;
    titulo: string;
    mensaje: string;
    /** Texto del botón principal. Por defecto "Ir a iniciar sesión". */
    textoBotonLogin?: string;
}

const ErrorPageShell = ({ icon, titulo, mensaje, textoBotonLogin = "Ir a iniciar sesión" }: ErrorPageShellProps) => {
    const searchParams = useSearchParams();
    const [procesando, setProcesando] = useState(false);
    const limpiezaIniciada = useRef(false);

    useEffect(() => {
        if (limpiezaIniciada.current) return;
        if (searchParams.get("clear") === "1") {
            limpiezaIniciada.current = true;
            void limpiarSesionLocal();
        }
    }, [searchParams]);

    const irAlLogin = async () => {
        if (procesando) return;
        setProcesando(true);
        await cerrarSesionYLimpiar();
    };

    return (
        <div className="login h-screen flex justify-center items-center px-4 lg:px-12">
            <div className="backdrop-blur-3xl bg-gray-900/40 text-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto flex flex-col items-center text-center">
                <div className="mb-4 text-slate-200" aria-hidden="true">
                    {icon}
                </div>
                <h1 className="text-3xl font-bold text-gray-100">{titulo}</h1>
                <p className="text-gray-400 mt-4 leading-relaxed">{mensaje}</p>

                <div className="mt-8 w-full flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={irAlLogin}
                        disabled={procesando}
                        className="bg-gray-900/40 text-white px-4 py-2 w-full rounded hover:bg-gray-800/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {procesando ? "Cerrando sesión..." : textoBotonLogin}
                    </button>
                    <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ErrorPageShell;
