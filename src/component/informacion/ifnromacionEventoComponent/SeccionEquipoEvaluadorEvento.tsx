"use client";

import CardRowEquipoEvaluador from "@/component/CardRow/CardRowEquipoEvaluador";
import ConfirmDeleteModal from "@/component/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import { setregistrosEquipoEvaliadorSeleccionado } from "@/feacture/EquipoEvaluador/EquipoEvaluadorSlice";
import { activarOverleyInformacionRegistroEquipoEvaluador } from "@/feacture/EquipoEvaluador/OverleyEquipoEvaluador";
import {
  registroEquipoEvaluadorDatosAmpleosInterface,
  registroEventoDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import RegistroEquipoEvaluadorServices from "@/lib/services/registroEquipoEvaluadorServices";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";

type Props = {
  Evento: registroEventoDatosAmpleosInterface;
  openFormAgregarEquipoEvaluador: () => void;
};

export default function SeccionEquipoEvaluadorEvento({
  Evento,
  openFormAgregarEquipoEvaluador,
}: Props) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const registroEquipoEvaluadorServices = useRef(new RegistroEquipoEvaluadorServices());

  const { data: equipoEvaluadorList = [] } = useQuery({
    queryKey: ["equipoEvaluador", Evento.idEvento],
    queryFn: async () => {
      return await registroEquipoEvaluadorServices.current.getDatosAmpleos(Evento.idEvento);
    },
    enabled: Boolean(Evento?.idEvento),
  });

  const abrirInformacionRegistroEquipoEvaluador = (
    registro: registroEquipoEvaluadorDatosAmpleosInterface,
  ) => {
    dispatch(setregistrosEquipoEvaliadorSeleccionado(registro));
    dispatch(activarOverleyInformacionRegistroEquipoEvaluador());
  };

  const [openConfirmEliminarMiembro, setOpenConfirmEliminarMiembro] = useState(false);
  const [miembroParaEliminar, setMiembroParaEliminar] =
    useState<registroEquipoEvaluadorDatosAmpleosInterface | null>(null);

  const solicitarEliminarRegistroEquipoEvaluador = (
    registro: registroEquipoEvaluadorDatosAmpleosInterface,
  ) => {
    setMiembroParaEliminar(registro);
    setOpenConfirmEliminarMiembro(true);
  };

  const ejecutarEliminarRegistroEquipoEvaluador = async () => {
    if (!miembroParaEliminar) return;
    try {
      await registroEquipoEvaluadorServices.current.delete(miembroParaEliminar.idRegistroEvaluador);
      await queryClient.invalidateQueries({ queryKey: ["equipoEvaluador", Evento.idEvento] });
    } catch (e) {
      console.error("❌ Error al eliminar el miembro del equipo evaluador:", e);
    }
  };

  return (
    <>
      <ConfirmDeleteModal
        open={openConfirmEliminarMiembro}
        onClose={() => {
          setOpenConfirmEliminarMiembro(false);
          setMiembroParaEliminar(null);
        }}
        onConfirm={ejecutarEliminarRegistroEquipoEvaluador}
        nombreElemento={miembroParaEliminar?.perfiles?.nombre ?? "este miembro"}
        titulo="Confirmar eliminación"
      />

      <section className="pt-6">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold tracking-tight text-white">Equipo evaluador</h4>
          <button
            type="button"
            onClick={openFormAgregarEquipoEvaluador}
            className="rounded-xl bg-primario px-5 py-2.5 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Agregar
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {equipoEvaluadorList.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              No hay miembros en el equipo evaluador.
            </div>
          ) : (
            equipoEvaluadorList.map((equipoEvaluador) => (
              <CardRowEquipoEvaluador
                key={equipoEvaluador.idRegistroEvaluador ?? equipoEvaluador.idForaneaPerfil}
                registro={equipoEvaluador}
                abrirInformacion={abrirInformacionRegistroEquipoEvaluador}
                abrirEliminar={solicitarEliminarRegistroEquipoEvaluador}
              />
            ))
          )}
        </div>
      </section>
    </>
  );
}
