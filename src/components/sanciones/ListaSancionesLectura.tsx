"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSanciones } from "@/services/sancionesServices";
import BuscadorRow from "@/components/buscadores/BuscadorRow";
import CardRowSancionLectura from "@/components/CardRow/lectura/CardRowSancionLectura";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";
import { sancionInterface } from "@/models";

type Props = {
  titulo?: string;
};

function coincideBusqueda(s: sancionInterface, q: string): boolean {
  const texto = [
    s.detalles_sancion,
    s.version,
    s.puntos_sancion != null ? String(s.puntos_sancion) : "",
    s.fecha_creacion_sancion ? String(s.fecha_creacion_sancion).slice(0, 10) : "",
  ]
    .join(" ")
    .toLowerCase();
  return texto.includes(q);
}

export default function ListaSancionesLectura({
  titulo = "Sanciones",
}: Props) {
  const [busqueda, setBusqueda] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["sanciones"],
    queryFn: getSanciones,
  });

  const filtradas = useMemo(() => {
    const lista = data ?? [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((s) => coincideBusqueda(s, q));
  }, [data, busqueda]);

  return (
    <div className="w-full">
      <header className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">{titulo}</h1>
          {!isPending ? (
            <span className="text-sm text-slate-400">{filtradas.length}</span>
          ) : null}
        </div>
        <BuscadorRow
          filtrarBuscador={(e) => setBusqueda(e.target.value)}
        />
      </header>

      {isPending ? (
        <SkeletonTabla />
      ) : filtradas.length === 0 ? (
        <p className="rounded-xl border border-slate-600/40 bg-slate-800/40 px-4 py-8 text-center text-slate-400">
          {busqueda.trim()
            ? "No hay sanciones que coincidan con la búsqueda."
            : "No hay sanciones en el catálogo."}
        </p>
      ) : (
        <section className="flex flex-col gap-3">
          {filtradas.map((sancion) => (
            <CardRowSancionLectura key={sancion.id_sancion} sancion={sancion} />
          ))}
        </section>
      )}
    </div>
  );
}
