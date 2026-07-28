import { perfilDatosAmpleosInterface } from "@/models";
import { shouldUseUnoptimizedImageForSupabaseStorage } from "@/lib/supabaseStorageImage";
import PerfilesServices from "@/services/perfilesServices";
import { MapPinIcon, PhoneIcon } from "@heroicons/react/16/solid";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  perfil: perfilDatosAmpleosInterface;
};

function Campo({
  etiqueta,
  iconoEtiqueta,
  children,
  className = "",
}: {
  etiqueta: string;
  iconoEtiqueta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-1 border-b border-slate-500/40 py-3 sm:grid-cols-[minmax(7rem,9rem)_1fr] sm:items-start sm:gap-4 ${className}`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {iconoEtiqueta ? <span className="shrink-0 text-slate-400 [&>svg]:h-4 [&>svg]:w-4">{iconoEtiqueta}</span> : null}
        <span>{etiqueta}</span>
      </div>
      <div className="min-w-0 text-sm font-medium text-slate-100">{children}</div>
    </div>
  );
}

export default function InformacionUsuarioComponent({ perfil }: Props) {
  const [fotoFallo, setFotoFallo] = useState(false);
  const [urlFotoResuelta, setUrlFotoResuelta] = useState("");
  const perfilesServices = useRef(new PerfilesServices());

  const urlFotoRaw = perfil.urlFotoPerfil?.trim() ?? "";

  useEffect(() => {
    let cancelado = false;
    setFotoFallo(false);

    const isRenderableSrc = (src: string) =>
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("/") ||
      src.startsWith("data:") ||
      src.startsWith("blob:");

    const resolver = async () => {
      if (!urlFotoRaw) {
        setUrlFotoResuelta("");
        return;
      }

      // Si ya es URL/route válida para next/image, úsala directo.
      if (isRenderableSrc(urlFotoRaw)) {
        setUrlFotoResuelta(urlFotoRaw);
        return;
      }

      try {
        const signed = await perfilesServices.current.obtenerUrlFotoPerfil(urlFotoRaw);
        if (!cancelado) setUrlFotoResuelta(signed || "");
      } catch (e) {
        console.error("❌ Error resolviendo URL de foto:", e);
        if (!cancelado) setUrlFotoResuelta("");
      }
    };

    resolver();
    return () => {
      cancelado = true;
    };
  }, [urlFotoRaw]);

  const mostrarFoto = Boolean(urlFotoResuelta) && !fotoFallo;

  /** Evita `/_next/image` para firmas del Storage del proyecto configurado en `NEXT_PUBLIC_SUPABASE_URL`. */
  const imagenSinOptimizar = useMemo(
    () => shouldUseUnoptimizedImageForSupabaseStorage(urlFotoResuelta),
    [urlFotoResuelta],
  );

  const nombreCompleto = useMemo(
    () =>
      [perfil.nombre, perfil.segundoNombre, perfil.primerApellido, perfil.segundoApellido]
        .filter((p) => p && String(p).trim())
        .join(" ")
        .trim() || "—",
    [perfil.nombre, perfil.segundoNombre, perfil.primerApellido, perfil.segundoApellido],
  );

  const nombreCorto = useMemo(
    () => [perfil.nombre, perfil.segundoNombre].filter((p) => p && String(p).trim()).join(" ").trim(),
    [perfil.nombre, perfil.segundoNombre],
  );

  return (
    <div className="h-full w-full min-w-0 max-w-2xl overflow-y-auto text-slate-100 scrollbar-estetica">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Información del usuario</h2>

      <header className="mt-4 border-b border-slate-500/45 pb-6">
        <div className="flex flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:gap-8">
          <div className="relative mx-auto h-24 w-24 shrink-0 overflow-hidden bg-slate-600 sm:mx-0 sm:h-28 sm:w-28">
            {mostrarFoto ? (
              <Image
                src={urlFotoResuelta}
                alt={`Foto de ${nombreCorto || perfil.nombre}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 96px, 112px"
                unoptimized={imagenSinOptimizar}
                priority
                onError={() => setFotoFallo(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <UserIcon className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h2 className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl">
              {nombreCorto || perfil.nombre}
            </h2>
            <p className="mt-2 font-mono text-sm text-slate-300">{perfil.codigo}</p>
            <p className="mt-1 text-sm text-slate-400" data-testid="informacion-usuario-rol">
              {perfil.roles?.nombreRol?.trim() || "—"}
            </p>
          </div>
        </div>
      </header>

      <div className="pt-2">
        <div className="flex flex-col">
          <Campo etiqueta="Nombre completo">
            <span className="leading-snug">{nombreCompleto}</span>
          </Campo>
          <Campo etiqueta="Alias">
            <span>{perfil.alias?.trim() || "—"}</span>
          </Campo>
          <Campo etiqueta="ID">
            <span data-testid="identidad">{perfil.identidad || "—"}</span>
          </Campo>
          <Campo etiqueta="Teléfono" iconoEtiqueta={<PhoneIcon aria-hidden />}>
            <span data-testid="numeroTelefono">{perfil.numeroTelefono?.trim() || "—"}</span>
          </Campo>
          <Campo etiqueta="Dirección" iconoEtiqueta={<MapPinIcon aria-hidden />}>
            <span className="leading-snug" data-testid="direccion">
              {perfil.direccion?.trim() || "—"}
            </span>
          </Campo>
          <Campo etiqueta="Fecha de nacimiento">
            <span>{perfil.fechaNacimiento?.trim() || "—"}</span>
          </Campo>
          <Campo etiqueta="Género" className="border-b-0">
            <span>{perfil.sexo?.trim() || "—"}</span>
          </Campo>
        </div>
      </div>
    </div>
  );
}
