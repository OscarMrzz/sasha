"use client";

import CardRowEquipoEvaluador from "@/components/CardRow/CardRowEquipoEvaluador";
import ConfirmDeleteModal from "@/components/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import OverleyModal from "@/components/modales/OverleyModal/Page";
import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import FormularioEquipoEvaluadorAgregar from "@/components/formularios/FormularioEquipoEvaluador/FormularioEquipoEvaluadorAgregar";
import InformacionRegistroEquipoEvaluadorComponent from "@/components/informacion/informacionRegistroEquipoEvaluador/InformacionRegistroEquipoEvaluador";
import {
  registroEquipoEvaluadorDatosAmpleosInterface,
  registroEventoDatosAmpleosInterface,
} from "@/models";
import RegistroEquipoEvaluadorServices from "@/services/registroEquipoEvaluadorServices";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  evento: registroEventoDatosAmpleosInterface;
  onRefresh?: () => void;
};

function esComiteDisciplina(registro: registroEquipoEvaluadorDatosAmpleosInterface): boolean {
  return registro.perfiles?.roles?.nombreRol === "comite de disciplina";
}

export default function ModalDisciplina({ open, onClose, evento, onRefresh }: Props) {
  const queryClient = useQueryClient();
  const registroEquipoEvaluadorServices = useRef(new RegistroEquipoEvaluadorServices());

  const [openAgregar, setOpenAgregar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openConfirmEliminar, setOpenConfirmEliminar] = useState(false);
  const [disciplinaSeleccionado, setDisciplinaSeleccionado] =
    useState<registroEquipoEvaluadorDatosAmpleosInterface | null>(null);

  const { data: equipoEvaluadorList = [], refetch } = useQuery({
    queryKey: ["equipoEvaluador", evento.idEvento],
    queryFn: async () => registroEquipoEvaluadorServices.current.getDatosAmpleos(evento.idEvento),
    enabled: open && Boolean(evento?.idEvento),
  });

  const miembrosDisciplina = useMemo(
    () => equipoEvaluadorList.filter(esComiteDisciplina),
    [equipoEvaluadorList],
  );

  const handleEliminar = async () => {
    if (!disciplinaSeleccionado) return;
    try {
      await registroEquipoEvaluadorServices.current.delete(
        disciplinaSeleccionado.idRegistroEvaluador,
      );
      await queryClient.invalidateQueries({ queryKey: ["equipoEvaluador", evento.idEvento] });
      await refetch();
      onRefresh?.();
    } catch (error) {
      console.error("❌ Error al eliminar miembro de disciplina:", error);
    }
  };

  const refrescar = async () => {
    await queryClient.invalidateQueries({ queryKey: ["equipoEvaluador", evento.idEvento] });
    await refetch();
    onRefresh?.();
  };

  return (
    <>
      <OverleyModal open={open} onClose={onClose}>
        <div className="flex max-h-[70vh] min-w-[min(100%,28rem)] flex-col text-white">
          <header className="mb-4 border-b border-white/10 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">
              Evento
            </p>
            <h2 className="mt-1 text-xl font-bold">Comité de disciplina</h2>
            <p className="mt-1 text-sm text-white/60">{evento.LugarEvento}</p>
          </header>

          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setOpenAgregar(true)}
              className="flex items-center gap-2 rounded-xl bg-primario px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110"
            >
              <PlusIcon className="h-5 w-5" />
              Agregar disciplina
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-estetica">
            {miembrosDisciplina.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                No hay miembros del comité de disciplina asignados a este evento.
              </div>
            ) : (
              miembrosDisciplina.map((miembro) => (
                <CardRowEquipoEvaluador
                  key={miembro.idRegistroEvaluador}
                  registro={miembro}
                  abrirInformacion={(reg) => {
                    setDisciplinaSeleccionado(reg);
                    setOpenVer(true);
                  }}
                  abrirEliminar={(reg) => {
                    setDisciplinaSeleccionado(reg);
                    setOpenConfirmEliminar(true);
                  }}
                />
              ))
            )}
          </div>
        </div>
      </OverleyModal>

      <OverleyModalFormulario open={openAgregar} onClose={() => setOpenAgregar(false)}>
        <FormularioEquipoEvaluadorAgregar
          idEvento={evento.idEvento}
          rolFiltro="comite de disciplina"
          onClose={() => setOpenAgregar(false)}
          refresacar={refrescar}
        />
      </OverleyModalFormulario>

      <OverleyModal open={openVer} onClose={() => setOpenVer(false)}>
        {disciplinaSeleccionado ? (
          <InformacionRegistroEquipoEvaluadorComponent
            registroEquipoEvaluador={disciplinaSeleccionado}
          />
        ) : null}
      </OverleyModal>

      <ConfirmDeleteModal
        open={openConfirmEliminar}
        onClose={() => {
          setOpenConfirmEliminar(false);
          setDisciplinaSeleccionado(null);
        }}
        onConfirm={handleEliminar}
        nombreElemento={
          disciplinaSeleccionado?.perfiles?.nombre ?? "este miembro de disciplina"
        }
        titulo="Confirmar eliminación"
      />
    </>
  );
}
