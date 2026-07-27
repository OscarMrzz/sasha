"use client";

import CardRowJuradoConRubrica from "@/component/CardRow/CardRowJuradoConRubrica";
import ConfirmDeleteModal from "@/component/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import OverleyModal from "@/component/modales/OverleyModal/Page";
import OverleyModalFormulario from "@/component/modales/OverleyModalFormulario/Page";
import FormularioEquipoEvaluadorAgregar from "@/component/formularios/FormularioEquipoEvaluador/FormularioEquipoEvaluadorAgregar";
import InformacionRegistroEquipoEvaluadorComponent from "@/component/informacion/informacionRegistroEquipoEvaluador/InformacionRegistroEquipoEvaluador";
import ModalAsignarRubricaJurado from "@/component/informacion/ifnromacionEventoComponent/ModalAsignarRubricaJurado";
import {
  registroEquipoEvaluadorDatosAmpleosInterface,
  registroEventoDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import RegistroEquipoEvaluadorServices from "@/lib/services/registroEquipoEvaluadorServices";
import RubricasServices from "@/lib/services/rubricasServices";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  evento: registroEventoDatosAmpleosInterface;
  onRefresh?: () => void;
};

function esJurado(registro: registroEquipoEvaluadorDatosAmpleosInterface): boolean {
  return registro.perfiles?.roles?.nombreRol === "jurado";
}

export default function ModalJurados({ open, onClose, evento, onRefresh }: Props) {
  const queryClient = useQueryClient();
  const registroEquipoEvaluadorServices = useRef(new RegistroEquipoEvaluadorServices());
  const rubricasServices = useRef(new RubricasServices());

  const [openAgregar, setOpenAgregar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openRubrica, setOpenRubrica] = useState(false);
  const [openConfirmEliminar, setOpenConfirmEliminar] = useState(false);
  const [juradoSeleccionado, setJuradoSeleccionado] =
    useState<registroEquipoEvaluadorDatosAmpleosInterface | null>(null);

  const { data: equipoEvaluadorList = [], refetch } = useQuery({
    queryKey: ["equipoEvaluador", evento.idEvento],
    queryFn: async () => registroEquipoEvaluadorServices.current.getDatosAmpleos(evento.idEvento),
    enabled: open && Boolean(evento?.idEvento),
  });

  const { data: rubricas = [] } = useQuery({
    queryKey: ["rubricas", "datosAmpleos"],
    queryFn: async () => rubricasServices.current.getDatosAmpleos(),
    enabled: open,
  });

  const jurados = useMemo(() => equipoEvaluadorList.filter(esJurado), [equipoEvaluadorList]);

  const handleEliminar = async () => {
    if (!juradoSeleccionado) return;
    try {
      await registroEquipoEvaluadorServices.current.delete(juradoSeleccionado.idRegistroEvaluador);
      await queryClient.invalidateQueries({ queryKey: ["equipoEvaluador", evento.idEvento] });
      await refetch();
      onRefresh?.();
    } catch (error) {
      console.error("❌ Error al eliminar jurado:", error);
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Evento</p>
            <div className="flex gap-2 items-center">

            <h2 className="mt-1 text-xl font-bold">Jurados</h2><span className="text-sm text-white/60">({jurados.length})</span>
            </div>
            <p className="mt-1 text-sm text-white/60">{evento.LugarEvento}</p>
          </header>

          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setOpenAgregar(true)}
              className="flex items-center gap-2 rounded-xl bg-primario px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110"
            >
              <PlusIcon className="h-5 w-5" />
              Agregar jurado
            </button>
          </div>
        

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-estetica h-full  pb-32">
            {jurados.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60 ">
                No hay jurados asignados a este evento.
              </div>
            ) : (
              jurados.map((jurado) => (
                <CardRowJuradoConRubrica
                  key={jurado.idRegistroEvaluador}
                  registro={jurado}
                  rubricas={rubricas}
                  onRubrica={(reg) => {
                    setJuradoSeleccionado(reg);
                    setOpenRubrica(true);
                  }}
                  onView={(reg) => {
                    setJuradoSeleccionado(reg);
                    setOpenVer(true);
                  }}
                  onDelete={(reg) => {
                    setJuradoSeleccionado(reg);
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
          rolFiltro="jurado"
          onClose={() => setOpenAgregar(false)}
          refresacar={refrescar}
        />
      </OverleyModalFormulario>

      <OverleyModal open={openVer} onClose={() => setOpenVer(false)}>
        {juradoSeleccionado ? (
          <InformacionRegistroEquipoEvaluadorComponent registroEquipoEvaluador={juradoSeleccionado} />
        ) : null}
      </OverleyModal>

      <ModalAsignarRubricaJurado
        open={openRubrica}
        onClose={() => {
          setOpenRubrica(false);
        }}
        registro={juradoSeleccionado}
        rubricas={rubricas}
        jurados={jurados}
        onSaved={refrescar}
      />

      <ConfirmDeleteModal
        open={openConfirmEliminar}
        onClose={() => {
          setOpenConfirmEliminar(false);
          setJuradoSeleccionado(null);
        }}
        onConfirm={handleEliminar}
        nombreElemento={juradoSeleccionado?.perfiles?.nombre ?? "este jurado"}
        titulo="Confirmar eliminación"
      />
    </>
  );
}
