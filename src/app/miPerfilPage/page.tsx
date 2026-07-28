"use client";

import FormularioCambiarPassword from "@/components/formularios/Perfil/CambierContraseña/CambiarPassword";
import CambiarFotoPerfil from "@/components/formularios/Perfil/CambiarFotoPerfil/CambiarFotoPerfil";
import FormularioEditarMiPerfil from "@/components/formularios/Perfil/EditarMiPerfil/EditarMiPerfil";
import ApprovateMessage from "@/components/Message/ApprovateMessage";
import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import {
  activarOverleyFormularioCambiarPassword,
  activarOverleyFormularioEditarPerfiles,
  desactivarOverleyFormularioCambiarPassword,
  desactivarOverleyFormularioEditarPerfiles,
} from "@/features/Perfil/overleyPerfil";
import { perfilDatosAmpleosInterface } from "@/models";
import PerfilesServices from "@/services/perfilesServices";
import {
  BuildingLibraryIcon,
  CalendarDaysIcon,
  CameraIcon,
  IdentificationIcon,
  KeyIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import FotoPerfilImage from "@/components/FotoPerfil/FotoPerfilImage";
import loading2 from "@/animacionesJson/Loading2.json";
import Lottie from "lottie-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { useInicioSesionStore } from "@/store/PerfilStore/InicioSesionStore";

function textoO(texto: string | null | undefined, fallback = "Pendiente") {
  const t = texto?.trim();
  return t ? t : fallback;
}

export default function MiPerfilPage() {
  const [ActivadorApprovateMessage, setActivadorApprovateMessage] = useState(false);
  const [mensajeApprovate, setMensajeApprovate] = useState({ titulo: "Exito", texto: "" });
  const [urlFotoPerfil, setUrlFotoPerfil] = useState<string>("");

  const activarMessageApprovate = () => {
    setMensajeApprovate({
      titulo: "Contraseña actualizada",
      texto: "La contraseña se ha actualizado con éxito.",
    });
    setActivadorApprovateMessage(true);
  };
  const dispatch = useDispatch();
  const activadorOverleyFormularioEditarEPerfiles = useSelector(
    (state: RootState) => state.overleyPerfiles.activadorOverleyFormularioEditarPerfiles,
  );

  const activadorOverleyFormularioCambiarPassword = useSelector(
    (state: RootState) => state.overleyPerfiles.activadorOverleyFormularioCambiarPassword,
  );
  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface>({} as perfilDatosAmpleosInterface);
  const [openFormularioCambiarFotoPerfil, setOpenFormularioCambiarFotoPerfil] = useState(false);
  const perfilServices = useRef(new PerfilesServices());
  const { refrescarPerfil } = useInicioSesionStore();

  useEffect(() => {
    traerInformacionUsuarioLogaido();
  }, []);

  useEffect(() => {
    traerFotoPerfil();
  }, [perfil?.urlFotoPerfil]);

  const traerFotoPerfil = async () => {
    try {
      const url = await perfilServices.current.obtenerUrlFotoPerfil(perfil?.urlFotoPerfil || "");
      setUrlFotoPerfil(url || "");
    } catch (error) {
      console.error("❌ Error al obtener la URL de la foto de perfil:", error);
      setUrlFotoPerfil("");
    }
  };

  const traerInformacionUsuarioLogaido = async () => {
    try {
      const perfilActivo: perfilDatosAmpleosInterface = await perfilServices.current.getUsuarioLogiado();
      setPerfil(perfilActivo);
      const unDia = 24 * 60 * 60;
      document.cookie = `perfilActivo=${encodeURIComponent(JSON.stringify(perfilActivo))}; path=/; max-age=${unDia};`;
      refrescarPerfil();
    } catch (error) {
      console.error("❌ Error trayendo la informacion del usuario logeado:", error);
    }
  };

  const cerrarFormularioEditarPerfil = () => {
    dispatch(desactivarOverleyFormularioEditarPerfiles());
    traerInformacionUsuarioLogaido();
  };
  const cerrarFormularioCambiarPassword = () => {
    dispatch(desactivarOverleyFormularioCambiarPassword());
  };

  const ActivarFormularioEditarPerfil = async () => {
    dispatch(activarOverleyFormularioEditarPerfiles());

    try {
      const url = await perfilServices.current.obtenerUrlFotoPerfil(perfil?.urlFotoPerfil || "");
      setUrlFotoPerfil(url || "");
    } catch (error) {
      console.error("❌ Error al obtener la URL de la foto de perfil:", error);
      setUrlFotoPerfil("");
    }
  };
  const abrirFormularioCambiarFotoPerfil = async () => {
    setOpenFormularioCambiarFotoPerfil(true);
    try {
      const url = await perfilServices.current.obtenerUrlFotoPerfil(perfil?.urlFotoPerfil || "");
      setUrlFotoPerfil(url || "");
    } catch (error) {
      console.error("❌ Error al obtener la URL de la foto de perfil:", error);
      setUrlFotoPerfil("");
    }
  };
  const cerrarFormularioCambiarFotoPerfil = () => {
    setOpenFormularioCambiarFotoPerfil(false);
    traerInformacionUsuarioLogaido();
  };

  const AbrirFormularioCambiarPassword = () => {
    dispatch(activarOverleyFormularioCambiarPassword());
  };

  if (!perfil || Object.keys(perfil).length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <div className="h-32 w-32">
          <Lottie animationData={loading2} loop />
        </div>
        <p className="text-sm text-gray-400">Cargando tu perfil…</p>
      </div>
    );
  }

  const nombreVisible = textoO(perfil.nombre, "Usuario");
  const federacion = textoO(perfil.federaciones?.nombreFederacion);
  const rol = textoO(perfil.roles?.nombreRol);

  return (
    <>
      <OverleyModalFormulario open={activadorOverleyFormularioEditarEPerfiles} onClose={cerrarFormularioEditarPerfil}>
        <FormularioEditarMiPerfil
          urlFotoPerfil={urlFotoPerfil}
          perfilAEditar={perfil}
          onClose={cerrarFormularioEditarPerfil}
        />
      </OverleyModalFormulario>

      <OverleyModalFormulario
        open={activadorOverleyFormularioCambiarPassword}
        onClose={cerrarFormularioCambiarPassword}
      >
        <FormularioCambiarPassword
          onclose={cerrarFormularioCambiarPassword}
          activarMessageApprovate={activarMessageApprovate}
        />
      </OverleyModalFormulario>
      <OverleyModalFormulario open={openFormularioCambiarFotoPerfil} onClose={cerrarFormularioCambiarFotoPerfil}>
        <CambiarFotoPerfil
          onClose={cerrarFormularioCambiarFotoPerfil}
          urlFotoPerfilActual={urlFotoPerfil}
          idMiPerfil={perfil.idForaneaUser}
        />
      </OverleyModalFormulario>

      <ApprovateMessage
        open={ActivadorApprovateMessage}
        onClose={() => {
          setActivadorApprovateMessage(false);
        }}
        titulo={mensajeApprovate.titulo}
        texto={mensajeApprovate.texto}
      />

      <div className="mx-auto py-24 w-full max-w-3xl px-4  sm:px-6 lg:px-8 lg:py-24">
        <header className="mb-8 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-primario">Cuenta</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-50 sm:text-4xl">Mi perfil</h1>
          
        </header>

        <article className="overflow-hidden rounded-3xl border border-slate-600/80 bg-slate-700/35 backdrop-blur-sm">
          <div className="h-28 bg-slate-700 sm:h-32" aria-hidden />

          <div className="relative px-5 pb-8 pt-0 sm:px-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:gap-8">
              <div className="-mt-16 flex shrink-0 flex-col items-center sm:-mt-20">
                <div className="relative h-36 w-36 sm:h-40 sm:w-40">
                  <div className="absolute inset-0 rounded-full p-1 ring-2 ring-primario" aria-hidden>
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-800 ring-2 ring-slate-800">
                      <FotoPerfilImage
                        src={urlFotoPerfil}
                        alt={`Foto de ${nombreVisible}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 144px, 160px"
                        priority
                        fallbackIconClassName="h-16 w-16 text-slate-400 sm:h-20 sm:w-20"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={abrirFormularioCambiarFotoPerfil}
                    className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full border border-slate-500 bg-slate-700 text-primario transition hover:border-primario hover:bg-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
                    title="Cambiar foto de perfil"
                    aria-label="Cambiar foto de perfil"
                  >
                    <CameraIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="min-w-0 flex-1 pb-1 text-center sm:pb-3 sm:text-left">
                <h2 className="truncate text-2xl font-semibold text-gray-50 sm:text-3xl">{nombreVisible}</h2>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-700/60 px-3 py-1 text-xs font-medium text-gray-200">
                    <BuildingLibraryIcon className="h-3.5 w-3.5 text-primario" aria-hidden />
                    {federacion}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-700/60 px-3 py-1 text-xs font-medium text-gray-200">
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
                    {rol}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-600/80 bg-slate-800/40 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
                  <CalendarDaysIcon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Nacimiento</p>
                  <p className="truncate text-sm font-medium text-gray-100">
                    {textoO(perfil.fechaNacimiento ?? undefined)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-600/80 bg-slate-800/40 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-200">
                  <ShieldCheckIcon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Rol</p>
                  <p className="truncate text-sm font-medium text-gray-100">{rol}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-600/80 bg-slate-800/40 px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-200">
                  <PhoneIcon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Teléfono</p>
                  <p className="truncate text-sm font-medium text-gray-100">{textoO(perfil.numeroTelefono)}</p>
                </div>
              </div>
            </div>

            <section className="mt-8 rounded-2xl border border-slate-600/80 bg-slate-800/30 p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-gray-50">Información personal</h3>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3">
                  <UserIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" aria-hidden />
                  <div>
                    <dt className="text-xs text-gray-500">Sexo</dt>
                    <dd className="text-sm text-gray-100">{textoO(perfil.sexo)}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <IdentificationIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" aria-hidden />
                  <div>
                    <dt className="text-xs text-gray-500">Identidad</dt>
                    <dd className="text-sm text-gray-100">{textoO(perfil.identidad)}</dd>
                  </div>
                </div>
                <div className="flex gap-3 sm:col-span-2">
                  <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-xs text-gray-500">Dirección</dt>
                    <dd className="text-sm leading-relaxed text-gray-100">{textoO(perfil.direccion)}</dd>
                  </div>
                </div>
              </dl>
            </section>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={ActivarFormularioEditarPerfil}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primario px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
              >
                <PencilSquareIcon className="h-5 w-5" aria-hidden />
                Editar perfil
              </button>
              <button
                type="button"
                onClick={AbrirFormularioCambiarPassword}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-500 bg-slate-700/50 px-5 py-2.5 text-sm font-semibold text-gray-100 transition hover:border-slate-400 hover:bg-slate-600/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400"
              >
                <KeyIcon className="h-5 w-5" aria-hidden />
                Cambiar contraseña
              </button>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
