"use client";

import Link from "next/link";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import PerfilesServices from "@/lib/services/perfilesServices";
import { dataBaseSupabase } from "@/lib/supabase";
import { setPerfilActivo } from "@/feacture/Perfil/PerfilSlice";
import { perfilDatosAmpleosInterface, perfilInterface } from "@/interfaces/interfaces";
import { useInicioSesionStore } from "@/Store/PerfilStore/InicioSesionStore";
import {
  MENSAJE_USUARIO_ELIMINADO,
  validarAccesoPerfil,
} from "@/lib/usuarios/validarAccesoPerfil";

const SignInPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [direcionHomesegunRol, setDirecionHomesegunRol] = useState<string>("/");
  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface>({} as perfilDatosAmpleosInterface);
  const router = useRouter();

  const { iniciarSesionStore } = useInicioSesionStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
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

  const perfilServices = useRef(new PerfilesServices());

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

      setPerfil(perf);

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
    <div className="login min-h-screen w-full flex justify-center items-center px-4 lg:px-12">
      <div className=" backdrop-blur-3xl  text-white p-8 rounded-lg shadow-md max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-100">Iniciar Sesión</h1>
        <p className="text-gray-400 mt-4">Ingresa tus credenciales para acceder a tu cuenta.</p>
        <form className="mt-8" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="email">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-2 bg-gray-100/10 text-white rounded"
              placeholder="Ingresa tu correo electrónico"
              value={form.email}
              onChange={handleChange}
              onInvalid={(event) => (event.target as HTMLInputElement).setCustomValidity("¡El correo es obligatorio!")}
              onInput={(event) => (event.target as HTMLInputElement).setCustomValidity("")}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2  bg-gray-100/10 text-white rounded"
              placeholder="Ingresa tu contraseña"
              value={form.password}
              onChange={handleChange}
              onInvalid={(event) =>
                (event.target as HTMLInputElement).setCustomValidity("¡La contraseña es obligatoria!")
              }
              onInput={(event) => (event.target as HTMLInputElement).setCustomValidity("")}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-gray-900/40 text-white px-4 py-2  w-full rounded hover:bg-gray-800/40 transition-colors"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>
          {mensaje && (
            <div className="mt-4 text-sm text-red-300" data-testid="error-message">
              {mensaje}
            </div>
          )}
        </form>
        {/*   <p className="mt-3">
          ¿No tienes una cuenta?
          <Link href="/authPage/SignUpPage" className="text-blue-300 ml-1">
            Registrate
          </Link>
        </p> */}
      </div>
    </div>
  );
};

export default SignInPage;
