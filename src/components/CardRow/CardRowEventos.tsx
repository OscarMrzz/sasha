"use client";

import ControlesIniciarPararEvento from "@/components/eventos/ControlesIniciarPararEvento";
import IndicadorEstadoEvento from "@/components/eventos/IndicadorEstadoEvento";
import { registroEventoDatosAmpleosInterface } from "@/models";
import MenuMasOpciones from "@/components/ui/MenuMasOpciones";
import MenuMasOpcionesEventos from "@/components/ui/MenuMasOpcionesEventos";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import React from "react";

type Props = {
  index?: number;
  evento: registroEventoDatosAmpleosInterface;
  abrirInformacion: (evento: registroEventoDatosAmpleosInterface) => void;
  abrirEditar?: (evento: registroEventoDatosAmpleosInterface) => void;
  abrirEliminar?: (evento: registroEventoDatosAmpleosInterface) => void;
  onJurados?: (evento: registroEventoDatosAmpleosInterface) => void;
  onFiscal?: (evento: registroEventoDatosAmpleosInterface) => void;
  onDisciplina?: (evento: registroEventoDatosAmpleosInterface) => void;
  onMesa?: (evento: registroEventoDatosAmpleosInterface) => void;
  onFusionarEstadoEvento?: (idEvento: string, estado_evento: "iniciado" | "finalizado") => void;
  /** Solo "Ver" (sin editar / eliminar en el menú) */
  modoSoloVer?: boolean;
  /** Oculta iniciar/parar (p. ej. rol responsable de eventos) */
  ocultarControles?: boolean;
};

export default function CardRowEventos({
  index,
  evento,
  abrirInformacion,
  abrirEditar,
  abrirEliminar,
  onJurados,
  onFiscal,
  onDisciplina,
  onMesa,
  onFusionarEstadoEvento,
  modoSoloVer = false,
  ocultarControles = false,
}: Props) {
  const noop = () => {};
  const menuEventos = Boolean(onJurados || onFiscal || onDisciplina || onMesa);

  return (
    <div
      data-testid="card-row"
      data-codigo={evento.idEvento}
      onDoubleClick={() => abrirInformacion(evento)}
      className="relative w-full min-h-25 rounded-lg bg-slate-700 p-4 shadow-md flex cursor-pointer flex-row justify-between hover:bg-slate-600"
    >
      <div className="pointer-events-none absolute right-12 top-3.5 z-[1]" aria-hidden>
        <IndicadorEstadoEvento iniciado={evento.estado_evento === "iniciado"} />
      </div>

      <div className="flex w-full flex-row items-center justify-between pr-1">
        <div className="flex min-w-0 flex-1 items-center gap-4 pr-2">
          {index != null ? (
            <p className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-600 text-lg font-bold text-slate-100">
              {index}
            </p>
          ) : null}
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-xl font-bold text-white">{evento.LugarEvento || "—"}</h2>
            <p className="text-slate-400">Región: {evento.regiones?.nombreRegion ?? "—"}</p>
            <p className="text-slate-400">Fecha: {evento.fechaEvento ?? "—"}</p>
            {!ocultarControles ? (
              <div className="pointer-events-auto mt-2">
                <ControlesIniciarPararEvento
                  evento={evento}
                  compact
                  onFusionarEstadoEvento={onFusionarEstadoEvento}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div data-testid="menu-mas-opciones" onDoubleClick={(e) => e.stopPropagation()}>
          {modoSoloVer ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-white/10"
              onClick={() => abrirInformacion(evento)}
              aria-label="Ver evento"
            >
              <EyeIcon className="h-6 w-6" />
            </Button>
          ) : menuEventos ? (
            <MenuMasOpcionesEventos
              onView={() => abrirInformacion(evento)}
              onJurados={onJurados ? () => onJurados(evento) : noop}
              onFiscal={onFiscal ? () => onFiscal(evento) : noop}
              onDisciplina={onDisciplina ? () => onDisciplina(evento) : undefined}
              onMesa={onMesa ? () => onMesa(evento) : undefined}
              mostrarDisciplina={Boolean(onDisciplina)}
              onEdit={abrirEditar ? () => abrirEditar(evento) : undefined}
              onDelete={abrirEliminar ? () => abrirEliminar(evento) : undefined}
              mostrarMesa={Boolean(onMesa)}
              mostrarEditar={Boolean(abrirEditar)}
              mostrarEliminar={Boolean(abrirEliminar)}
            />
          ) : (
            <MenuMasOpciones
              onView={() => abrirInformacion(evento)}
              onEdit={abrirEditar ? () => abrirEditar(evento) : noop}
              onDelete={abrirEliminar ? () => abrirEliminar(evento) : noop}
            />
          )}
        </div>
      </div>
    </div>
  );
}
