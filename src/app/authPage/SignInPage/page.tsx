"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import PerfilesServices from "@/services/perfilesServices";
import { dataBaseSupabase } from "@/lib/supabase";
import { useInicioSesionStore } from "@/store/PerfilStore/InicioSesionStore";
import {
  MENSAJE_USUARIO_ELIMINADO,
  validarAccesoPerfil,
} from "@/helpers/usuarios/validarAccesoPerfil";

const INPUT_CLASS =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-800 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[var(--color-primario)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]/25 disabled:cursor-not-allowed disabled:opacity-60";

function LoginWelcomePanel() {
  return (
    <aside className="flex flex-col justify-center border-b border-slate-700 bg-slate-800 p-8 md:w-1/2 md:border-b-0 md:border-r md:p-12">
      <div
        className="mb-8 flex aspect-[4/3] max-h-40 w-full max-w-xs items-center justify-center rounded-xl border-2 border-dashed border-slate-600 bg-slate-900"
        aria-label="Espacio reservado para el logo"
      >
        <span className="text-2xl font-bold tracking-[0.2em] text-[var(--color-primario)]">SASHA</span>
      </div>
      <h1 className="text-2xl font-semibold text-white md:text-3xl">Bienvenido</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400 md:text-base">
        Accede a la plataforma para gestionar bandas, eventos, evaluaciones y resultados de tu federación.
      </p>
    </aside>
  );
}

const SignInPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const router = useRouter();
  const { iniciarSesionStore } = useInicioSesionStore();
  const perfilServices = useRef(new PerfilesServices());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    if (mensaje) setMensaje("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setLoading(true);

    const { data, error } = await dataBaseSupabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setMensaje("Correo o contraseña incorrectos.");
      } else if (error.message.includes("Email not confirmed")) {
        setMensaje("Por favor confirma tu correo antes de iniciar sesión.");
      } else {
        setMensaje("Error al iniciar sesión: " + error.message);
      }
      setLoading(false);
      return;
    }

    if (data.session?.user?.id) {
      await cargarPerfilUsarioActivo(data.session.user.id);
    }
    setLoading(false);
  };

  const cargarPerfilUsarioActivo = async (userIdDesdeSesion: string) => {
    try {
      const perf = await perfilServices.current.getPerfilPorUserId(userIdDesdeSesion);

      if (!perf) {
        await dataBaseSupabase.auth.signOut().catch(() => {});
        setMensaje("No hay un perfil asociado a esta cuenta. Contacta al administrador.");
        return;
      }

      const acceso = validarAccesoPerfil(perf);
      if (acceso !== "ok") {
        await dataBaseSupabase.auth.signOut().catch(() => {});
        if (acceso === "usuario_eliminado") {
          setMensaje(MENSAJE_USUARIO_ELIMINADO);
        } else if (acceso === "sin_permisos") {
          setMensaje("Tu cuenta no tiene permisos para acceder. Contacta al administrador.");
        } else {
          setMensaje("Tu rol fue desactivado o ya no existe. Inicia sesión con otra cuenta.");
        }
        return;
      }

      const unDia = 24 * 60 * 60;
      document.cookie = `perfilActivo=${encodeURIComponent(JSON.stringify(perf))}; path=/; max-age=${unDia};`;
      document.cookie = `rolPerfil=${perf.roles?.nombreRol || ""}; path=/; max-age=${unDia};`;

      const bandaId = perf.idForaneaBanda ?? perf.bandas?.idBanda;

      if (perf.roles?.nombreRol === "admin") router.push("/PanelControlPage");
      if (perf.roles?.nombreRol === "admin temporal") router.push("/PanelControlPage");
      if (perf.roles?.nombreRol === "developer") router.push("/sup");
      if (perf.roles?.nombreRol === "presidenteJurado") router.push("/PanelControlPage");
      if (perf.roles?.nombreRol === "jurado") router.push("/EvaluarPage");
      if (perf.roles?.nombreRol === "fiscal") router.push("/fiscal");
      if (perf.roles?.nombreRol === "director artistico") router.push("/mi-banda-page");
      if (perf.roles?.nombreRol === "lider de banda") router.push("/mi-banda-page");
      if (perf.roles?.nombreRol === "liderBanda") router.push("/mi-banda-page");
      if (perf.roles?.nombreRol === "responsable de bandas") router.push("/responsable-bandas");
      if (perf.roles?.nombreRol === "responsable de rubricas") router.push("/responsable-rubricas");
      if (perf.roles?.nombreRol === "responsable de usuarios") router.push("/responsable-usuarios");
      if (perf.roles?.nombreRol === "responsable de eventos") router.push("/responsable-eventos");
      if (perf.roles?.nombreRol === "responsable de mesa") router.push("/responsable-mesa");
      if (perf.roles?.nombreRol === "secretaria") router.push("/secretaria");
      if (perf.roles?.nombreRol === "comite de disciplina") router.push("/diciplina");
      if (perf.roles?.nombreRol === "dirigente") {
        if (bandaId) {
          router.push(`/mi-banda-page/${bandaId}`);
        } else {
          console.warn("No se encontró id de banda para dirigente, se mantiene en login");
        }
      }

      iniciarSesionStore();
    } catch (error) {
      console.error("❌ Error cargando el perfil del usuario activo:", error);
      setMensaje("Ocurrió un error al cargar tu perfil. Intenta de nuevo.");
    }
  };

  return (
    <div className="login flex min-h-screen w-full items-center justify-center p-4 sm:p-6">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 md:min-h-[520px] md:flex-row">
        <LoginWelcomePanel />

        <section className="flex flex-col justify-center p-8 md:w-1/2 md:p-12">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white">Iniciar sesión</h2>
            <p className="mt-1 text-sm text-slate-400">Ingresa tu correo y contraseña.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative">
                <EnvelopeIcon
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
                  aria-hidden
                />
                <input
                  type="email"
                  id="email"
                  autoComplete="email"
                  className={INPUT_CLASS}
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={handleChange}
                  onInvalid={(event) =>
                    (event.target as HTMLInputElement).setCustomValidity("El correo es obligatorio.")
                  }
                  onInput={(event) => (event.target as HTMLInputElement).setCustomValidity("")}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="password">
                Contraseña
              </label>
              <div className="relative">
                <LockClosedIcon
                  className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-500"
                  aria-hidden
                />
                <input
                  type={mostrarPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  className={`${INPUT_CLASS} pr-10`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  onInvalid={(event) =>
                    (event.target as HTMLInputElement).setCustomValidity("La contraseña es obligatoria.")
                  }
                  onInput={(event) => (event.target as HTMLInputElement).setCustomValidity("")}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  onClick={() => setMostrarPassword((v) => !v)}
                  aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={-1}
                >
                  {mostrarPassword ? <EyeSlashIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </button>
              </div>
            </div>

            {mensaje ? (
              <div
                className="rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2.5 text-sm text-red-200"
                role="alert"
                data-testid="error-message"
              >
                {mensaje}
              </div>
            ) : null}

            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primario)] text-sm font-semibold text-slate-950 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                  Entrando…
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default SignInPage;
