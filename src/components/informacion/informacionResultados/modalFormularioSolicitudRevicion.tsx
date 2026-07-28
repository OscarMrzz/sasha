import { RootState } from "@/app/store";
import { setfilaResultadoItemSeleccionado } from "@/features/resultadosGenerales/ResultadosGeneralesSlice";
import {
  perfilDatosAmpleosInterface,
  registroComentariosDatosAmpleosInterface,
  registroCumplimientoEvaluacionDatosAmpleosInterface,
  rubricaInterface,
  solicitudRevicionInterface,
} from "@/models";
import RegistroCumplimientoServices from "@/services/RegistroCumplimientosServices";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RegistroComentariosServices from "@/services/RegistroComentariosServices";
import { useSolicitudRevicionStore } from "@/store/revicionesStore/solicitudRevicionStore";
import SolicitudRevicionServices from "@/services/solicitudRevicionServices";
import { useModalSolicitudRevicionesStore } from "@/store/revicionesStore/modalSolicitudRevicionesStore";
import { useModalMessageAprovateSolicitudRevicionStore } from "@/store/revicionesStore/modalMessage/modalMessageAprovateSolicitudRevicionStore";

type OverleyModalProps = {
  open: boolean;
  onClose: () => void;
};

const textareaClass =
  "w-full resize-y rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

export default function ModalFormularioSolicitudRevicion({ open, onClose }: OverleyModalProps) {
  const { activarOverleyCriteriosFormularioSolicitudRevisarMessage } = useModalMessageAprovateSolicitudRevicionStore();
  const { solicitudRevicion } = useSolicitudRevicionStore();
  const registroCumplimientoServices = useRef(new RegistroCumplimientoServices());
  const [datosCumplimientosbandaSelecionada, setDatosCumplimientosbandaSelecionada] = React.useState<
    registroCumplimientoEvaluacionDatosAmpleosInterface[]
  >([]);
  const [datosComentariosbandaSelecionada, setDatosComentariosbandaSelecionada] = React.useState<
    registroComentariosDatosAmpleosInterface[]
  >([]);
  const filaResultadosSelecionada = useSelector((state: RootState) => state.resultadosGeneralesReducer);
  const [cargadoDatos, setCargadoDatos] = React.useState(true);
  const [listaCRubricasUnicas, setListaRubricaUnicas] = React.useState<rubricaInterface[]>([]);
  const [totalPorRubrica, setTotalPorRubrica] = React.useState<{ [key: string]: number }>({});
  const registroComentariosServices = useRef(new RegistroComentariosServices());
  const [deseaSolicitarRevision, setDeseaSolicitarRevision] = React.useState(false);
  const solicitudRevicionServices = useRef(new SolicitudRevicionServices());
  const [justificacion, setJustificacion] = React.useState("");
  const { desactivarOverleyCriteriosFormularioSolicitudRevisar } = useModalSolicitudRevicionesStore();
  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface>({} as perfilDatosAmpleosInterface);
  useEffect(() => {
    const perfilCookie = document.cookie.split(";").find((c) => c.trim().startsWith("perfilActivo="));
    const perfilBruto = perfilCookie ? decodeURIComponent(perfilCookie.split("=")[1]) : null;
    if (perfilBruto) {
      const perfil: perfilDatosAmpleosInterface = JSON.parse(perfilBruto);
      if (perfil) {
        setPerfil(perfil);
      }
    }
  }, []);


  const dispatch = useDispatch();
  useEffect(() => {
    const fetchData = async () => {
      setCargadoDatos(true);

      if (!filaResultadosSelecionada || !filaResultadosSelecionada.idEvento) return;
      const { idEvento, idBanda } = filaResultadosSelecionada;
      const data = await registroCumplimientoServices.current.getPorBandaYEvento(idBanda, idEvento);
      const dataComentarios = await registroComentariosServices.current.getPorBandaYEvento(idBanda, idEvento);

      setDatosCumplimientosbandaSelecionada(data);
      setDatosComentariosbandaSelecionada(dataComentarios);

      setCargadoDatos(false);
    };
    fetchData();
  }, [filaResultadosSelecionada]);

  useEffect(() => {

      setDeseaSolicitarRevision(false);
      setJustificacion("");
      
   
  
  }, [solicitudRevicion]);

  useEffect(() => {
    procesarDatos();
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
    dispatch(setfilaResultadoItemSeleccionado({ idBanda: "", idEvento: "" }));
    setCargadoDatos(true);

    setAnimar(false);
    onClose();
  };

  const procesarDatos = () => {
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

  const siDeseasolicitarRevision = () => {
    setDeseaSolicitarRevision(true);
  };

  const enviarSolicitud = async () => {
    if (!solicitudRevicion) return;

    const datosSolicitud: Omit<solicitudRevicionInterface, "idSolicitud" | "created_at"> = {
      idForaneaRegistroCumplimiento: solicitudRevicion.idRegistroCumplimiento,
      idForaneaFederacion: perfil.idForaneaFederacion || "",
      idForaneaSolicitanteRevicion: perfil.idPerfil,
      detallesSolicitud: justificacion,
      estado: "pendiente",
    };
    await solicitudRevicionServices.current.create(datosSolicitud as solicitudRevicionInterface);
    activarOverleyCriteriosFormularioSolicitudRevisarMessage();
    limpiarFormulario();
    desactivarOverleyCriteriosFormularioSolicitudRevisar();
  };

  const limpiarFormulario = () => {
    setJustificacion("");
    setDeseaSolicitarRevision(false);
  };

  return (
    <>
      {open ? (
        <div
          role="presentation"
          onDoubleClick={() => cerrarModal()}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-solicitud-revision-titulo"
            onDoubleClick={(e) => e.stopPropagation()}
            className={`flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-600 bg-slate-800 shadow-xl transition-all duration-300 ease-out ${
              Animar ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <div className="scrollbar-estetica flex-1 overflow-y-auto px-4 pb-4 pt-6 sm:px-8">
              <div className="flex flex-col gap-4">
                <h2 id="modal-solicitud-revision-titulo" className="text-2xl font-bold text-slate-100">
                  {solicitudRevicion?.nombreBanda}
                </h2>
                <dl className="flex flex-col gap-3 rounded-xl border border-slate-600/60 bg-slate-700/30 p-4 text-sm text-slate-200">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-white/70">Rúbrica</dt>
                    <dd className="mt-0.5 font-medium text-slate-100">{solicitudRevicion?.nombreRubrica}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-white/70">Criterio</dt>
                    <dd className="mt-0.5 font-medium text-slate-100">{solicitudRevicion?.nombreCriterio}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-white/70">Cumplimiento</dt>
                    <dd className="mt-0.5 font-medium text-slate-100">{solicitudRevicion?.nombreCumplimiento}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-white/70">Puntos</dt>
                    <dd className="mt-0.5 font-medium text-slate-100">{solicitudRevicion?.puntosObtenidos}%</dd>
                  </div>
                </dl>
              </div>

              <div className="mt-6">
                {!deseaSolicitarRevision ? (
                  <div className="flex justify-center py-4">
                    <button
                      type="button"
                      onClick={() => siDeseasolicitarRevision()}
                      className="rounded-lg bg-[var(--color-primario)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition-colors hover:brightness-110"
                    >
                      Solicitar revisión
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      enviarSolicitud();
                    }}
                    className="w-full space-y-4"
                  >
                    <div>
                      <label htmlFor="justificacion-revision" className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
                        Justificación
                      </label>
                      <textarea
                        id="justificacion-revision"
                        maxLength={200}
                        rows={4}
                        value={justificacion}
                        onChange={(e) => setJustificacion(e.target.value)}
                        placeholder="Explique por qué solicita una revisión…"
                        className={`${textareaClass} min-h-[140px]`}
                      />
                      <p className="mt-1 text-right text-xs text-slate-400">{justificacion.length}/200</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDeseaSolicitarRevision(false)}
                        className="rounded-lg border border-slate-500 bg-transparent px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700/50"
                      >
                        Volver
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-[var(--color-primario)] px-4 py-2 text-sm font-semibold text-slate-950 transition-colors hover:brightness-110"
                      >
                        Enviar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-600/80 bg-slate-900/30 px-4 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => cerrarModal()}
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
