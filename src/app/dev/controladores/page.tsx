"use client";

import SeccionActualizarDatosMiBanda from "@/component/controladores/SeccionActualizarDatosMiBanda";
import SeccionActualizarDatosPorEvento from "@/component/controladores/SeccionActualizarDatosPorEvento";
import Switches from "@/component/UI/toggle switches/Switches";
import { rolInterface } from "@/interfaces/interfaces";
import RolesServices from "@/lib/services/rolServices";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";

const ROLES_PROTEGIDOS = ["admin", "admin temporal"];

function ordenarRolesPorNombre(roles: rolInterface[]): rolInterface[] {
  return [...roles].sort((a, b) =>
    a.nombreRol.localeCompare(b.nombreRol, "es", { sensitivity: "base" }),
  );
}

function filtrarRolesVisibles(roles: rolInterface[]): rolInterface[] {
  return ordenarRolesPorNombre(
    roles.filter((r) => !ROLES_PROTEGIDOS.includes(r.nombreRol)),
  );
}

export default function DevControladoresPage() {
  const [rolesList, setRolesList] = useState<rolInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const rolesServices = useRef(new RolesServices());

  useEffect(() => {
    const inicializar = async () => {
      setLoading(true);
      await rolesServices.current.initPerfil();
      rolesServices.current
        .get()
        .then((roles) => {
          setRolesList(filtrarRolesVisibles(roles));
        })
        .catch((error) => {
          console.error("Error al obtener roles:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    };
    void inicializar();
  }, []);

  const cambiarEstadoRol = (rol: rolInterface) => {
    if (ROLES_PROTEGIDOS.includes(rol.nombreRol)) {
      return;
    }

    const rolActualizado: rolInterface = {
      ...rol,
      estadoRol: !rol.estadoRol,
    };

    rolesServices.current
      .update(rol.idRol, rolActualizado)
      .then(() => {
        refrescarRoles();
      })
      .catch((error) => {
        console.error("Error al actualizar rol:", error);
      });
  };

  const refrescarRoles = () => {
    setLoading(true);
    rolesServices.current
      .get()
      .then((roles) => {
        setRolesList(filtrarRolesVisibles(roles));
      })
      .catch((error) => {
        console.error("Error al obtener roles:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading && rolesList.length === 0) {
    return (
      <div className="w-full space-y-8 pb-16">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Permisos</h1>
          <p className="text-sm text-slate-400">Activa o desactiva roles del sistema</p>
        </header>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[5.5rem] animate-pulse rounded-2xl border border-slate-700/50 bg-slate-800/40"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!loading && rolesList.length === 0) {
    return (
      <div className="w-full space-y-8 pb-16">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Permisos</h1>
          <p className="text-sm text-slate-400">Activa o desactiva roles del sistema</p>
        </header>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-600/60 bg-slate-900/30 px-6 py-16 text-center">
          <p className="text-lg font-medium text-slate-200">No hay roles disponibles</p>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            Cuando existan roles en la federación, podrás gestionarlos desde aquí.
          </p>
          <button
            type="button"
            onClick={() => void refrescarRoles()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-500/60 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-white transition hover:border-[var(--color-primario)]/50 hover:bg-slate-800"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Permisos</h1>
          <p className="text-sm text-slate-400">
            Activa o desactiva roles del sistema. Los cambios se guardan al instante.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refrescarRoles()}
          disabled={loading}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[var(--color-primario)] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-[var(--color-primario)]/25 transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-50 sm:self-auto"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar lista
        </button>
      </header>

      <div
        className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${loading ? "pointer-events-none opacity-60" : ""}`}
      >
        {rolesList.map((rol) => (
          <Switches key={rol.idRol} rol={rol} cambioEstado={() => cambiarEstadoRol(rol)} />
        ))}
      </div>
      <SeccionActualizarDatosPorEvento />
      <SeccionActualizarDatosMiBanda />
    </div>
  );
}
