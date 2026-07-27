"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useAtajosContext } from "@/providers/AtajosProvider";

export default function BuscadorGeneralComponent() {
  const router = useRouter();
  const { paginasFiltradas, modalRef, idBuscador, cerrarBuscador } = useAtajosContext();

  const [buscadorValue, setBuscadorValue] = useState("");
  const [paginasListFiltradas, setPaginasListFiltradas] = useState(paginasFiltradas);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(0);
  const [buscadorConTexto, setBuscadorConTexto] = useState(false);

  useEffect(() => {
    setPaginasListFiltradas(paginasFiltradas);
  }, [paginasFiltradas]);

  const cerrarYRecetiar = () => {
    setBuscadorValue("");
    setIndiceSeleccionado(0);
    setBuscadorConTexto(false);
    cerrarBuscador();
  };

  const manejarCambioBusqueda = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBuscadorValue(event.target.value);
    if (!event.target.value) {
      setBuscadorConTexto(false);
      return;
    }
    setBuscadorConTexto(true);

    const valorBuscado = event.target.value.toLowerCase();
    const paginasFiltradasBusqueda = paginasFiltradas.filter((pagina) =>
      pagina.valorBuscado.some((valor) => valor.toLowerCase().includes(valorBuscado)),
    );
    setPaginasListFiltradas(paginasFiltradasBusqueda);
    setIndiceSeleccionado(0);
  };

  const manejarPresionTeclas = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      let indiceActual = indiceSeleccionado;
      indiceActual++;
      if (indiceActual >= paginasListFiltradas.length) {
        indiceActual = 0;
      }
      setIndiceSeleccionado(indiceActual);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      let indiceActual = indiceSeleccionado;
      indiceActual--;
      if (indiceActual < 0) {
        indiceActual = paginasListFiltradas.length - 1;
      }
      setIndiceSeleccionado(indiceActual);
    }
    if (event.key === "Enter" && paginasListFiltradas.length > 0) {
      router.push(paginasListFiltradas[indiceSeleccionado].ruta);
      cerrarYRecetiar();
    }
    if (event.key === "Escape") {
      cerrarYRecetiar();
    }
  };

  return (
    <div className="">
      <dialog
        ref={modalRef}
        closedby="any"
        className=" fixed ml-auto mr-auto mt-10  bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-xs"
        onClose={cerrarYRecetiar}
      >
        <div className="     ">
          <search className=" bg-slate-600  flex justify-center items-center px-4 py-2 rounded-sm shadow">
            <input
              value={buscadorValue}
              onChange={manejarCambioBusqueda}
              onKeyDown={manejarPresionTeclas}
              id={idBuscador}
              type="text"
              placeholder="Buscar..."
              className="p-1 font-light text-white rounded-md w-96 border-2 border-slate-500"
            />
          </search>

          {buscadorConTexto && (
            <div className="p-4 mt-2 bg-slate-600 ">
              {paginasListFiltradas.map((pagina, index) => (
                <div
                  key={pagina.ruta}
                  className={` text-slate-400 ${index === indiceSeleccionado ? "bg-slate-400 text-slate-800" : ""} p-2 rounded-md hover:bg-slate-500 cursor-pointer mb-2`}
                >
                  <Link onClick={cerrarYRecetiar} href={pagina.ruta} className=" font-medium">
                    {pagina.nombre}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
