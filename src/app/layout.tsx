"use client";

import "./globals.css";

import { Poppins, Geist } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Providers from "@/app/Provider";

import NavBard from "@/components/NavBard/Page";
import Sidebar from "@/components/sidebar/Sidebar";
import { rolTieneNavegacion } from "@/config/navegacion/navigationConfig";
import RegionService from "@/services/regionesServices";
import { useRegionesStore } from "@/store/listRegionesStore";
import RegistroEventossServices from "@/services/registroEventosServices";
import { useEventosStore } from "@/store/EventosStore/listEventosStore";
import CategoriasServices from "@/services/categoriaServices";
import RubricasServices from "@/services/rubricasServices";
import BandasServices from "@/services/bandasServices";
import { useCategoriasStore } from "@/store/CategoriasStore/listCategoriaStore";
import { useRubicasStore } from "@/store/RubricasStore/listRubicasStore";
import { useBandasStore } from "@/store/BandasStore/listBandaStore";
import { useInicioSesionStore } from "@/store/PerfilStore/InicioSesionStore";
import RegistroEquipoEvaluadorServices from "@/services/registroEquipoEvaluadorServices";
import PerfilesServices from "@/services/perfilesServices";
import { validarAccesoPerfil } from "@/helpers/usuarios/validarAccesoPerfil";
import { usePathname } from "next/navigation";
import {
  perfilDatosAmpleosInterface,
  perfilInterface,
  registroEquipoEvaluadorDatosAmpleosInterface,
} from "@/models";

/** Rutas públicas que NO requieren cookie de perfil ni revalidación. */
const RUTAS_PUBLICAS = [
  "/authPage/SignInPage",
  "/authPage/SignUpPage",
  "/error/usuario-no-encontrado",
  "/error/usuario-eliminado",
  "/error/sin-permisos",
  "/error/rol-inactivo",
];

const esRutaPublica = (pathname: string) =>
  RUTAS_PUBLICAS.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));

function leerRolCookie(): string | null {
  if (typeof document === "undefined") return null;
  const perfilCookie = document.cookie.split(";").find((c) => c.trim().startsWith("perfilActivo="));
  const perfilBruto = perfilCookie ? decodeURIComponent(perfilCookie.split("=")[1]) : null;
  if (!perfilBruto) return null;
  try {
    const perfil = JSON.parse(perfilBruto) as perfilDatosAmpleosInterface;
    return perfil.roles?.nombreRol ?? null;
  } catch {
    return null;
  }
}

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setRegionesStore } = useRegionesStore();
  const { setEventosStore } = useEventosStore();
  const { setCategoriasStore } = useCategoriasStore();
  const { setRubicasStore } = useRubicasStore();
  const { setBandasStore } = useBandasStore();

  const regionesServices = useRef(new RegionService());
  const eventosServices = useRef(new RegistroEventossServices());
  const categoriasServices = useRef(new CategoriasServices());
  const rubicasServices = useRef(new RubricasServices());
  const bandasServices = useRef(new BandasServices());
  const equipoEvaluadorServices = useRef(new RegistroEquipoEvaluadorServices());
  const perfilesServices = useRef(new PerfilesServices());

  const { haySesionStore } = useInicioSesionStore();
  const [isReady, setIsReady] = useState(false);
  const pathname = usePathname();
  const [rol, setRol] = useState<string | null>(null);

  useEffect(() => {
    setRol(leerRolCookie());
  }, [pathname, haySesionStore]);

  const mostrarSidebar = !esRutaPublica(pathname) && !!rol && rolTieneNavegacion(rol);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const pathname = window.location.pathname;

    // Las rutas públicas (login, error pages) no necesitan ni cookie ni revalidación.
    if (esRutaPublica(pathname)) {
      setIsReady(true);
      return;
    }

    const initializeServices = async () => {
      try {
        const perfilCookie = document.cookie.split(";").find((c) => c.trim().startsWith("perfilActivo="));
        const perfiBruto = perfilCookie ? decodeURIComponent(perfilCookie.split("=")[1]) : null;
        if (!perfiBruto) {
          window.location.href = "/authPage/SignInPage";
          return;
        }
        const perfil: perfilInterface = JSON.parse(perfiBruto);
        const rolPerfil = (perfil as perfilDatosAmpleosInterface).roles?.nombreRol;

        // Revalida la cookie contra la BD: si el usuario fue eliminado,
        // perdió permisos o su rol se desactivó, redirigimos a la página
        // de error correspondiente y dejamos que esa página limpie la sesión.
        try {
          const perfilFresco = await perfilesServices.current.getPerfilPorUserId(perfil.idForaneaUser);
          if (!perfilFresco) {
            window.location.href = "/error/usuario-no-encontrado?clear=1";
            return;
          }
          const acceso = validarAccesoPerfil(perfilFresco);
          if (acceso === "usuario_eliminado") {
            window.location.href = "/error/usuario-eliminado?clear=1";
            return;
          }
          if (acceso === "sin_permisos") {
            window.location.href = "/error/sin-permisos?clear=1";
            return;
          }
          if (acceso === "rol_inactivo") {
            window.location.href = "/error/rol-inactivo?clear=1";
            return;
          }
        } catch (errValidacion) {
          console.warn("⚠️ No se pudo revalidar el perfil contra la BD:", errValidacion);
          // No bloqueamos la app por un fallo de red; el proxy hará la validación dura en cada navegación.
        }

        if (rolPerfil === "responsable de usuarios" || rolPerfil === "responsable de rubricas") {
          return;
        }

        regionesServices.current.get().then((datosRegiones) => {
          setRegionesStore(datosRegiones);
        });

        categoriasServices.current.get().then((data) => {
          setCategoriasStore(data);
        });

        rubicasServices.current.get().then((data) => {
          setRubicasStore(data);
        });

        void equipoEvaluadorServices.current.initPerfil();
        void categoriasServices.current.initPerfil();
        equipoEvaluadorServices.current
          .getporPerfil(perfil.idPerfil)
          .then((EventosParaElPerfil: registroEquipoEvaluadorDatosAmpleosInterface[]) => {
            void eventosServices.current.initPerfil();
            eventosServices.current.get().then((data) => {
              const eventosFiltrados = data.filter((evento) =>
                EventosParaElPerfil.some(
                  (equipo: registroEquipoEvaluadorDatosAmpleosInterface) =>
                    equipo.idForaneaEvento === evento.idEvento
                )
              );
              setEventosStore(eventosFiltrados);
            });
          });

        bandasServices.current
          .get()
          .then((data) => {
            setBandasStore(data);
          })
          .catch((error) => {
            console.warn("⚠️ No se pudieron cargar las bandas:", error.message);
            setBandasStore([]);
          });
      } catch (error) {
        console.error("❌ Error al obtener los datos:", error);
      }
    };

    initializeServices();
    setIsReady(true);
  }, [haySesionStore, setBandasStore, setCategoriasStore, setEventosStore, setRegionesStore, setRubicasStore]);

  if (!isReady) {
    return (
      <html lang="es" className={cn("font-sans", geist.variable)}>
        <head>
          <title>Sasha</title>
          <link rel="icon" href="/favicon.ico?v=blank" sizes="any" />
          <link rel="shortcut icon" href="/favicon.ico?v=blank" />
          <link rel="apple-touch-icon" href="/favicon.ico?v=blank" />
        </head>
        <body
          className={`app-bg lg:pt-0 w-full flex min-h-screen font-poppins ${poppins.className}`}
          suppressHydrationWarning={true}
        >
          <Providers>
            <div className="flex justify-center items-center h-screen w-full">
              <span className="text-2xl font-bold text-gray-300" />
            </div>
          </Providers>
        </body>
      </html>
    );
  }

  return (
    <html lang="es" className={cn("font-sans", geist.variable)}>
      <head>
        <title>Sasha</title>
        <link rel="icon" href="/favicon.ico?v=blank" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico?v=blank" />
        <link rel="apple-touch-icon" href="/favicon.ico?v=blank" />
      </head>
      <body
        className={`app-bg w-full flex flex-col h-full font-poppins ${poppins.className}`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <NavBard />
          <div className="flex  w-full h-full min-h-screen">
            {mostrarSidebar && <Sidebar />}
            <main
              className={cn("min-w-0 flex-1", !esRutaPublica(pathname) && "pt-18")}
            >
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
