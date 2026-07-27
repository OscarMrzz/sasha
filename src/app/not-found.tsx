"use client";

import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const NotFound = () => {
    return (
        <div className="login h-screen flex justify-center items-center px-4 lg:px-12">
            <div className="backdrop-blur-3xl bg-gray-900/40 text-white p-8 rounded-lg shadow-md max-w-md w-full mx-auto flex flex-col items-center text-center">
                <div className="mb-4 text-slate-200" aria-hidden="true">
                    <MagnifyingGlassIcon className="w-16 h-16" />
                </div>
                <h1 className="text-3xl font-bold text-gray-100">Página no encontrada</h1>
                <p className="text-gray-400 mt-4 leading-relaxed">
                    No pudimos encontrar la página que buscas. Puede que haya sido movida o ya no exista.
                </p>

                <div className="mt-8 w-full flex flex-col gap-3">
                    <Link
                        href="/"
                        className="bg-gray-900/40 text-white px-4 py-2 w-full rounded hover:bg-gray-800/40 transition-colors text-center"
                    >
                        Volver al inicio
                    </Link>
                    <Link
                        href="/authPage/SignInPage"
                        className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                    >
                        Ir a iniciar sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
