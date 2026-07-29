import Link from 'next/link'
import React from 'react'

export default function page() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 justify-center items-center w-full    ">
        <Link href="/sup/federaciones" className="h-25 rounded-lg border border-[var(--vz-border-strong)] p-4 transition-colors duration-300 hover:bg-[#f5f5f5]">
            <h1 className="text-2xl font-bold">Federaciones</h1>
        </Link>
        <Link href="/sup/usuarios" className="h-25 rounded-lg border border-[var(--vz-border-strong)] p-4 transition-colors duration-300 hover:bg-[#f5f5f5]">
            <h1 className="text-2xl font-bold">Usuarios</h1>
        </Link>
        <Link href="/sup/permisos" className="h-25 rounded-lg border border-[var(--vz-border-strong)] p-4 transition-colors duration-300 hover:bg-[#f5f5f5]">
            <h1 className="text-2xl font-bold">Permisos</h1>
        </Link>
        <Link href="/miPerfilPage" className="h-25 rounded-lg border border-[var(--vz-border-strong)] p-4 transition-colors duration-300 hover:bg-[#f5f5f5]">
            <h1 className="text-2xl font-bold">Mi perfil</h1>
        </Link>
    </div>
  )
}
