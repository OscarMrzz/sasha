"use client";

import { dataBaseSupabase } from "@/lib/supabase";
import { KeyIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-500 bg-slate-700/50 px-3 text-sm text-gray-100 placeholder:text-gray-500 transition focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400";

type Props = {
  onclose: () => void;
  activarMessageApprovate: () => void;
};

export default function FormularioCambiarPassword({ onclose, activarMessageApprovate }: Props) {
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [confirmacionPassword, setConfirmacionPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setErrorMsg("");

    if (nuevoPassword !== confirmacionPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }
    if (nuevoPassword.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const respuesta = await dataBaseSupabase.auth.updateUser({
        password: nuevoPassword,
      });
      if (respuesta.error) {
        console.error("❌ Error actualizando la contraseña:", respuesta.error.message);
        setErrorMsg(respuesta.error.message);
        return;
      }
      if (respuesta.data) {
        activarMessageApprovate();
        setNuevoPassword("");
        setConfirmacionPassword("");
        onclose();
      }
    } catch (err) {
      console.error("❌ Error actualizando la contraseña:", err);
      setErrorMsg("No se pudo actualizar la contraseña. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const onClickCancelar = () => {
    setNuevoPassword("");
    setConfirmacionPassword("");
    setErrorMsg("");
    onclose();
  };

  return (
    <div className="mx-auto w-full max-w-md pb-2">
      <header className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Seguridad</p>
        <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-50">
          <KeyIcon className="h-7 w-7 text-primario" aria-hidden />
          Cambiar contraseña
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          Elige una contraseña nueva y confírmala. Debe tener al menos 6 caracteres.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-500/60 bg-slate-800/35 p-4 sm:p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMsg ? (
            <p
              className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200"
              role="alert"
            >
              {errorMsg}
            </p>
          ) : null}

          <div>
            <label className={labelClass} htmlFor="nuevoPassword">
              Nueva contraseña
            </label>
            <input
              className={inputClass}
              id="nuevoPassword"
              name="nuevoPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={nuevoPassword}
              onChange={(e) => setNuevoPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="confirmacionPassword">
              Confirmar contraseña
            </label>
            <input
              className={inputClass}
              id="confirmacionPassword"
              name="confirmacionPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              value={confirmacionPassword}
              onChange={(e) => setConfirmacionPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClickCancelar}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-500 bg-slate-700/50 px-5 text-sm font-semibold text-gray-100 transition hover:border-slate-400 hover:bg-slate-600/50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primario px-6 text-sm font-semibold text-slate-900 shadow-lg shadow-primario/20 transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-45"
            >
              {loading ? "Guardando…" : "Aceptar"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
