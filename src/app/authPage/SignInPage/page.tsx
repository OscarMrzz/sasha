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
  "h-12 w-full rounded-xl border border-[var(--vz-border-strong)] bg-white pl-11 pr-3 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] transition-[border-color,box-shadow] focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)] disabled:cursor-not-allowed disabled:opacity-60";

function LoginWelcomePanel() {
  return (
    <aside className="login-panel-in relative flex flex-col justify-between overflow-hidden bg-[var(--brand)] px-8 py-10 text-white md:w-[44%] md:px-12 md:py-14">
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border-[28px] border-white/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 size-44 rounded-full border-[22px] border-white/10"
        aria-hidden
      />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
          Federación
        </p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight text-white md:text-6xl">
          SASHA
        </h1>
        <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/90 md:text-base">
          Gestiona bandas, eventos, evaluaciones y resultados desde un solo lugar.
        </p>
      </div>

      <div className="relative mt-10 space-y-3 border-t border-white/25 pt-8 md:mt-0">
        <p className="text-sm font-medium text-white">Acceso seguro</p>
        <p className="max-w-xs text-xs leading-relaxed text-white/75">
          Usa el correo y la contraseña asignados por tu administrador.
        </p>
      </div>
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
    <div className="login flex min-h-screen w-full items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="login-shell-in flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--vz-border)] bg-white shadow-[0_24px_64px_-28px_rgba(15,23,42,0.18)] md:min-h-[560px] md:flex-row">
        <LoginWelcomePanel />

        <section className="login-form-in flex flex-col justify-center bg-white px-8 py-10 md:w-[56%] md:px-14 md:py-14">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--vz-black)]">
              Iniciar sesión
            </h2>
            <p className="mt-2 text-sm text-[var(--app-fg-muted)]">
              Ingresa tu correo y contraseña para continuar.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--app-fg-muted)]"
                htmlFor="email"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <EnvelopeIcon
                  className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-[var(--app-fg-muted)]"
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
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--app-fg-muted)]"
                htmlFor="password"
              >
                Contraseña
              </label>
              <div className="relative">
                <LockClosedIcon
                  className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-[var(--app-fg-muted)]"
                  aria-hidden
                />
                <input
                  type={mostrarPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  className={`${INPUT_CLASS} pr-12`}
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--vz-surface)] hover:text-[var(--app-fg)]"
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
                className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                role="alert"
                data-testid="error-message"
              >
                {mensaje}
              </div>
            ) : null}

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Entrando…
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default SignInPage;
