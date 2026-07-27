import Link from 'next/link'
import React from 'react'

export default function page() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 justify-center items-center w-full    ">
        <Link href="/sup/federaciones" className=" h-25 bg-slate-700  p-4 rounded-lg shadow cursor-pointer hover:bg-slate-600 transition-colors duration-300">
            <h1 className="text-2xl font-bold  text-slate-300">Federaciones</h1>
        </Link>
        <Link href="/sup/usuarios" className=" h-25 bg-slate-700  p-4 rounded-lg shadow cursor-pointer hover:bg-slate-600 transition-colors duration-300">
            <h1 className="text-2xl font-bold text-slate-300 ">Usuarios</h1>
        </Link>
        <Link href="/sup/permisos" className=" h-25 bg-slate-700  p-4 rounded-lg shadow cursor-pointer hover:bg-slate-600 transition-colors duration-300">
            <h1 className="text-2xl font-bold text-slate-300 ">Permisos</h1>
        </Link>
        <Link href="/miPerfilPage" className=" h-25 bg-slate-700  p-4 rounded-lg shadow cursor-pointer hover:bg-slate-600 transition-colors duration-300">
            <h1 className="text-2xl font-bold text-slate-300 ">Mi perfil</h1>
        </Link>
    </div>
  )
}
