import { RootState } from "@/app/store";
import { setfilaResultadoItemSeleccionado } from "@/feacture/resultadosGenerales/ResultadosGeneralesSlice";
import {
  bandaInterface,
  registroComentariosDatosAmpleosInterface,
  registroCumplimientoEvaluacionDatosAmpleosInterface,
  rubricaInterface,
} from "@/interfaces/interfaces";
import RegistroCumplimientoServices from "@/lib/services/RegistroCumplimientosServices";
import loading2 from "@/animacionesJson/Loading2.json";

import Lottie from "lottie-react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RegistroComentariosServices from "@/lib/services/RegistroComentariosServices";
import ModalFormularioSolicitudRevicion from "./modalFormularioSolicitudRevicion";
import { useModalSolicitudRevicionesStore } from "@/Store/revicionesStore/modalSolicitudRevicionesStore";
import {
  baseSolicitudRevicionInterface,
  useSolicitudRevicionStore,
} from "@/Store/revicionesStore/solicitudRevicionStore";
import { EyeIcon } from "@heroicons/react/24/outline";
import BandasServices from "@/lib/services/bandasServices";

export type ModalInformacionSelectedItem = { idBanda: string; idEvento: string };

type OverleyModalProps = {
  open: boolean;
  onClose: () => void;
  /** Si se pasa desde el padre (p. ej. fiscal), el modal ignora Redux para esa fila. */
  selectedItem?: ModalInformacionSelectedItem | null;
};

export default function ModalInformacionResultados({ open, onClose, selectedItem }: OverleyModalProps) {
  const { setSolicitudRevicion } = useSolicitudRevicionStore();
  const { activarOverleyCriteriosFormularioSolicitudRevisar } = useModalSolicitudRevicionesStore();
  const registroCumpliminetoServices = useRef(new RegistroCumplimientoServices());
  const registroCumplimientoServices = useRef(new RegistroCumplimientoServices());
  const [datosCumplimientosbandaSelecionada, setDatosCumplimientosbandaSelecionada] = React.useState<
    registroCumplimientoEvaluacionDatosAmpleosInterface[]
  >([]);
  const [datosComentariosbandaSelecionada, setDatosComentariosbandaSelecionada] = React.useState<
    registroComentariosDatosAmpleosInterface[]
  >([]);
  const filaResultadosRedux = useSelector((state: RootState) => state.resultadosGeneralesReducer);
  const filaResultadosSelecionada = selectedItem ?? filaResultadosRedux;
  const [cargadoDatos, setCargadoDatos] = React.useState(true);
  const [listaCRubricasUnicas, setListaRubricaUnicas] = React.useState<rubricaInterface[]>([]);
  const [totalPorRubrica, setTotalPorRubrica] = React.useState<{ [key: string]: number }>({});
  const registroComentariosServices = useRef(new RegistroComentariosServices());
  const [bandaSelecionada, setBandaSelecionada] = useState<bandaInterface>({} as bandaInterface);


  const bandasServices = useRef (new BandasServices())

  const dispatch = useDispatch();
  useEffect(() => {
    const fetchData = async () => {
      setCargadoDatos(true);

      if (!filaResultadosSelecionada || !filaResultadosSelecionada.idEvento) return;
      const { idEvento, idBanda } = filaResultadosSelecionada;
      const data = await registroCumplimientoServices.current.getPorBandaYEvento(idBanda, idEvento);
      const banda = await bandasServices.current.getOne(idBanda);
      setBandaSelecionada(banda);
       
      const dataComentarios = await registroComentariosServices.current.getPorBandaYEvento(idBanda, idEvento);

      setDatosCumplimientosbandaSelecionada(data);
      setDatosComentariosbandaSelecionada(dataComentarios);

      setCargadoDatos(false);
    };
    fetchData();
  }, [filaResultadosSelecionada]);

  useEffect(() => {
    porcesarDatos();
  }, [datosCumplimientosbandaSelecionada]);

  const [Animar, setAnimar] = React.useState(false);
  useEffect(() => {
    if (open) {
      setAnimar(false);
      setTimeout(() => {
        setAnimar(true);
      }, 10);
    } else {
      setAnimar(false); // Reinicia la animación al cerrar
    }
  }, [open]);

  const cerrarModal = () => {
    setDatosCumplimientosbandaSelecionada([]);
    if (selectedItem == null) {
      dispatch(setfilaResultadoItemSeleccionado({ idBanda: "", idEvento: "" }));
    }
    setCargadoDatos(true);

    setAnimar(false);
    onClose();
  };

  const porcesarDatos = () => {
    const rubricasUnicas: { [key: string]: rubricaInterface } = {};
    const rubricasUnicasList: rubricaInterface[] = [];
    for (const dato of datosCumplimientosbandaSelecionada) {
      if (!rubricasUnicas[dato.rubricas.idRubrica]) {
        rubricasUnicas[dato.rubricas.idRubrica] = dato.rubricas;
        rubricasUnicasList.push(dato.rubricas);
      }
    }
    setListaRubricaUnicas(rubricasUnicasList);

    const totales: { [key: string]: number } = {};
    for (const dato of datosCumplimientosbandaSelecionada) {
      if (!totales[dato.rubricas.idRubrica]) {
        totales[dato.rubricas.idRubrica] = 0;
      }
      totales[dato.rubricas.idRubrica] += dato.puntosObtenidos;
    }
    setTotalPorRubrica(totales);
  };

  const onDoubleClickFila = (resultado: registroCumplimientoEvaluacionDatosAmpleosInterface) => {
    const idRegistroCumplimientoEvaluacion = resultado.idRegistroCumplimientoEvaluacion;
    const nombreBanda = resultado.bandas.nombreBanda;
    const rubricaNombre = resultado.rubricas.nombreRubrica;
    const criterioNombre = resultado.criteriosEvalucion.nombreCriterio;
    const cumplimientoDetalles = resultado.cumplimientos.detalleCumplimiento;
    const puntosObtenidos = resultado.puntosObtenidos;

    const solicitud: baseSolicitudRevicionInterface = {
      idRegistroCumplimiento: idRegistroCumplimientoEvaluacion,
      nombreBanda: nombreBanda,
      nombreRubrica: rubricaNombre,
      nombreCriterio: criterioNombre,
      nombreCumplimiento: cumplimientoDetalles,
      puntosObtenidos: puntosObtenidos,
    };

    setSolicitudRevicion(solicitud);
    activarOverleyCriteriosFormularioSolicitudRevisar();
    cerrarModal();
  };

  return (
    <>
      {open ? (
        <div
          role="presentation"
          onDoubleClick={() => cerrarModal()}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-resultados-banda-titulo"
            onDoubleClick={(e) => e.stopPropagation()}
            className={`flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-600 bg-slate-800 shadow-xl transition-all duration-300 ease-out ${
              Animar ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="scrollbar-estetica flex-1 overflow-y-auto px-4 pb-4 pt-6 sm:px-8">
              {!cargadoDatos ? (
                <div className="flex flex-col">
                  <h2 id="modal-resultados-banda-titulo" className="mb-6 text-2xl font-bold text-slate-100">
                    {bandaSelecionada.nombreBanda}
                  </h2>

                  {listaCRubricasUnicas.map((rubrica) => (
                    <div key={rubrica.idRubrica} className="mb-8 rounded-xl border border-slate-600/60 bg-slate-700/30 p-4 last:mb-2">
                      <div className="mb-4 flex flex-row flex-wrap items-center gap-4 border-b border-slate-600/50 pb-3">
                        <h3 className="text-lg font-semibold text-slate-100">{rubrica.nombreRubrica}</h3>
                        <p className="rounded-md bg-slate-900/40 px-2 py-1 text-sm font-semibold text-slate-200">
                          {totalPorRubrica[rubrica.idRubrica] || 0}%
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        {datosCumplimientosbandaSelecionada
                          .filter((dato) => dato.rubricas.idRubrica === rubrica.idRubrica)
                          .map((dato) => (
                            <div
                              onDoubleClick={() => onDoubleClickFila(dato)}
                              key={dato.idRegistroCumplimientoEvaluacion}
                              className="flex min-h-24 cursor-pointer justify-between rounded-lg border border-slate-600/80 bg-slate-700/50 py-2 text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-600/60"
                            >
                              <div className="flex w-full items-center gap-4">
                                <div className="flex h-full min-w-12 items-center justify-center p-2">
                                  <p className="font-bold text-slate-100">{dato.puntosObtenidos}%</p>
                                </div>

                                <p className="text-sm sm:text-base">
                                  <span className="font-semibold">{dato.criteriosEvalucion.nombreCriterio}</span>
                                </p>
                              </div>
                              <div className="p-2">
                                <button
                                  type="button"
                                  aria-label="Solicitar revisión"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDoubleClickFila(dato);
                                  }}
                                  className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-600/80 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primario)]"
                                >
                                  <EyeIcon className="h-6 w-6" aria-hidden />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>

                      <div className="mt-4">
                        <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-white/70">Comentarios</h4>
                        <div className="flex flex-col gap-2">
                          {datosComentariosbandaSelecionada
                            .filter((comentario) => comentario.rubricas.idRubrica === rubrica.idRubrica)
                            .map((comentario) => (
                              <div
                                key={comentario.idRegistroComentario}
                                className="rounded-lg border border-cyan-500/25 bg-cyan-950/35 p-3 text-sm text-slate-100"
                              >
                                <p className="font-normal leading-relaxed">{comentario.comentario}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[200px] items-center justify-center py-8">
                  <div className="w-full max-w-xs">
                    <Lottie animationData={loading2} loop={true} />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end border-t border-slate-600/80 bg-slate-900/30 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={cerrarModal}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
