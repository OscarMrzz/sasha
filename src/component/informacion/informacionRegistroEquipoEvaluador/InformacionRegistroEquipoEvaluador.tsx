import { perfilDatosAmpleosInterface, registroEquipoEvaluadorDatosAmpleosInterface } from "@/interfaces/interfaces";
import { shouldUseUnoptimizedImageForSupabaseStorage } from "@/lib/supabaseStorageImage";
import PerfilesServices from "@/lib/services/perfilesServices";
import { MapPinIcon, PhoneIcon } from "@heroicons/react/16/solid";
import { UserIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

type Props = {
  registroEquipoEvaluador: registroEquipoEvaluadorDatosAmpleosInterface;
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

export default function InformacionRegistroEquipoEvaluadorComponent({ registroEquipoEvaluador }: Props) {
  const { data: perfil } = useQuery({
    queryKey: ["perfil", registroEquipoEvaluador.idForaneaPerfil],
    queryFn: async () => {
      const svc = new PerfilesServices();
      return await svc.getOneDatosAmpleos(registroEquipoEvaluador.idForaneaPerfil);
    },
    enabled: Boolean(registroEquipoEvaluador?.idForaneaPerfil),
  });

  const perfilVista: perfilDatosAmpleosInterface | undefined =
    perfil ?? (registroEquipoEvaluador.perfiles as unknown as perfilDatosAmpleosInterface | undefined);

  const [fotoFallo, setFotoFallo] = useState(false);
  const [urlFotoResuelta, setUrlFotoResuelta] = useState("");
  const perfilesServices = useRef(new PerfilesServices());

  const urlFotoRaw = perfilVista?.urlFotoPerfil?.trim() ?? "";

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

  const imagenSinOptimizar = useMemo(() => shouldUseUnoptimizedImageForSupabaseStorage(urlFotoResuelta), [urlFotoResuelta]);

  const nombreCompleto = useMemo(() => {
    if (!perfilVista) return "—";
    return (
      [perfilVista.nombre, perfilVista.segundoNombre, perfilVista.primerApellido, perfilVista.segundoApellido]
        .filter((p) => p && String(p).trim())
        .join(" ")
        .trim() || "—"
    );
  }, [perfilVista]);

  const nombreCorto = useMemo(() => {
    if (!perfilVista) return "";
    return [perfilVista.nombre, perfilVista.segundoNombre].filter((p) => p && String(p).trim()).join(" ").trim();
  }, [perfilVista]);

  return (
    <div className="h-full w-full min-w-0 max-w-2xl overflow-y-auto text-slate-100 scrollbar-estetica">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Información del miembro</h2>

      <header className="mt-4 border-b border-slate-500/45 pb-6">
        <div className="flex flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:gap-8">
          <div className="relative mx-auto h-24 w-24 shrink-0 overflow-hidden bg-slate-600 sm:mx-0 sm:h-28 sm:w-28">
            {mostrarFoto ? (
              <Image
                src={urlFotoResuelta}
                alt={`Foto de ${nombreCorto || perfilVista?.nombre || "usuario"}`}
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
              {nombreCorto || perfilVista?.nombre || "—"}
            </h2>
            <p className="mt-2 font-mono text-sm text-slate-300">{perfilVista?.codigo || "—"}</p>
            <p className="mt-1 text-sm text-slate-400">{perfilVista?.roles?.nombreRol?.trim() || "—"}</p>
          </div>
        </div>
      </header>

      <div className="pt-2">
        <div className="flex flex-col">
          <Campo etiqueta="Nombre completo">
            <span className="leading-snug">{nombreCompleto}</span>
          </Campo>
          <Campo etiqueta="Alias">
            <span>{perfilVista?.alias?.trim() || "—"}</span>
          </Campo>
          <Campo etiqueta="ID">
            <span>{perfilVista?.identidad || "—"}</span>
          </Campo>
          <Campo etiqueta="Teléfono" iconoEtiqueta={<PhoneIcon aria-hidden />}>
            <span>{perfilVista?.numeroTelefono?.trim() || "—"}</span>
          </Campo>
          <Campo etiqueta="Dirección" iconoEtiqueta={<MapPinIcon aria-hidden />}>
            <span className="leading-snug">{perfilVista?.direccion?.trim() || "—"}</span>
          </Campo>
          <Campo etiqueta="Fecha de nacimiento">
            <span>{perfilVista?.fechaNacimiento?.trim() || "—"}</span>
          </Campo>
          <Campo etiqueta="Género" className="border-b-0">
            <span>{perfilVista?.sexo?.trim() || "—"}</span>
          </Campo>
        </div>
      </div>
    </div>
  );
}
