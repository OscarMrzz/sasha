import {
  bandaInterface,
  categoriaInterface,
  criterioEvaluacionDatosAmpleosInterface,
  perfilInterface,
  regionesInterface,
  registroComentariosInterface,
  registroCumplimientoEvaluacionInterface,
  RegistroEventoInterface,
  rubricaInterface,
} from "@/models";

import React, { useEffect, useState, useCallback, useRef } from "react";
import EvaluarCriterioComponent from "./EvaluarCriterioComponent";
import CriteriosServices from "@/services/criteriosServices";
import { useDispatch, useSelector } from "react-redux";
import { agregarCriterioEvaluar, recetiarCriteriosEvaluados } from "@/features/evaluar/evaluarSlice";
import { RootState } from "@/app/store";
import RegistroCumplimientoServices, {
  esErrorInsertDuplicadoEvaluacion,
} from "@/services/RegistroCumplimientosServices";

import PerfilesServices from "@/services/perfilesServices";

import RegistroComentariosServices from "@/services/RegistroComentariosServices";
import loading2 from "@/animacionesJson/Loading2.json";
import Lottie from "lottie-react";
import { readEvaluarDraftCookie, setEvaluarDraftCookie } from "@/lib/evaluarPersistence";
import type { EvaluarDraftCookieState, EvaluarDraftItem } from "@/lib/evaluarPersistence";
import ConfirmRefrescarDatosModal from "@/components/controladores/ConfirmRefrescarDatosModal";

type Props = {
  eventoSelecionado: RegistroEventoInterface;
  categoriaSelecionada: categoriaInterface;
  rubricaSelecionada: rubricaInterface;
  bandaSelecionada: bandaInterface;
  idRegionSelecionada: string;

  revisandoEvluacion: () => void;
  finalizarEvaluacionBanda: () => void;
  cancelarEvaluacionBanda: () => void;
  lanzarError:(mensaje:string)=>void;
 
};
export default function EvaluarBaseRubricaComponet({
  eventoSelecionado,
  categoriaSelecionada,
  rubricaSelecionada,
  bandaSelecionada,
  idRegionSelecionada,


  revisandoEvluacion,
  finalizarEvaluacionBanda,
  cancelarEvaluacionBanda,
  lanzarError,

}: Props) {
  const dispatch = useDispatch();
  const registroCumplimientosServices = useRef(new RegistroCumplimientoServices());
  const registroComentariosServices = useRef(new RegistroComentariosServices());

  const dataCriteriosEvaluar = useSelector((state: RootState) => state.evaluarCriterio.evaluaciones);

  const [listCriterios, setListCriterios] = React.useState<criterioEvaluacionDatosAmpleosInterface[]>([]);
  const [cargandoCriterios, setCargandoCriterios] = React.useState<boolean>(true);
  const [cargandoFichaResultados, setCargandoFichaResultados] = React.useState<boolean>(true);
  const [comentarios, setComentarios] = useState("");
  const [perfilActivo, setPerfilActivo] = useState<perfilInterface | null>(null);
  const [sePrecionoElBotoGuardar, setSeprecionoElBotoGuardar] = React.useState<boolean>(false);
  const [campoImcompleto, setCampoIncompleto] = useState("");
  const [modalConfirmacion, setModalConfirmacion] = useState<null | "guardar" | "cancelar">(null);
  const [guardando, setGuardando] = useState(false);

  const [totalPuntos, setTotalPuntos] = useState(0);
  const [evaluacionBloqueada, setEvaluacionBloqueada] = useState(false);
  const [criteriosParcialesGuardados, setCriteriosParcialesGuardados] = useState(0);
  const [verificandoEvaluacionExistente, setVerificandoEvaluacionExistente] = useState(true);
  const verificacionEvaluacionRef = useRef<string | null>(null);
  const lanzarErrorRef = useRef(lanzarError);

  useEffect(() => {
    lanzarErrorRef.current = lanzarError;
  }, [lanzarError]);

  const esBorradorDeEstaEvaluacion = useCallback(
    (borrador: EvaluarDraftCookieState | null): borrador is EvaluarDraftCookieState =>
      Boolean(
        borrador &&
          borrador.idEvento === eventoSelecionado.idEvento &&
          borrador.idCategoria === categoriaSelecionada.idCategoria &&
          borrador.idRubrica === rubricaSelecionada.idRubrica &&
          borrador.idBanda === bandaSelecionada.idBanda
      ),
    [
      bandaSelecionada.idBanda,
      categoriaSelecionada.idCategoria,
      eventoSelecionado.idEvento,
      rubricaSelecionada.idRubrica,
    ]
  );

  const guardarBorradorEvaluacion = useCallback(
    ({
      comentariosActualizados,
      evaluacionesActualizadas,
    }: {
      comentariosActualizados?: string;
      evaluacionesActualizadas?: Record<string, EvaluarDraftItem>;
    }) => {
      const borradorActual = readEvaluarDraftCookie();
      const borradorValido = esBorradorDeEstaEvaluacion(borradorActual) ? borradorActual : null;

      setEvaluarDraftCookie({
        idEvento: eventoSelecionado.idEvento,
        idCategoria: categoriaSelecionada.idCategoria,
        idRubrica: rubricaSelecionada.idRubrica,
        idBanda: bandaSelecionada.idBanda,
        comentarios: comentariosActualizados ?? borradorValido?.comentarios ?? comentarios,
        evaluaciones: evaluacionesActualizadas ?? borradorValido?.evaluaciones ?? dataCriteriosEvaluar,
        updatedAt: Date.now(),
      });
    },
    [
      bandaSelecionada.idBanda,
      categoriaSelecionada.idCategoria,
      comentarios,
      dataCriteriosEvaluar,
      esBorradorDeEstaEvaluacion,
      eventoSelecionado.idEvento,
      rubricaSelecionada.idRubrica,
    ]
  );

  useEffect(() => {
    const fetchCriterios = async () => {
      setCargandoCriterios(true);
      setCargandoFichaResultados(true);
      try {
        const criteriosServices = new CriteriosServices();
        await criteriosServices.initPerfil();
        const dataCriterios = await criteriosServices.getDatosAmpleos();
        const criteriosFiltrados = dataCriterios.filter(
          (criterio) => criterio.idForaneaRubrica === rubricaSelecionada.idRubrica
        );
        setListCriterios(criteriosFiltrados);

        const borradorGuardado = readEvaluarDraftCookie();
        const borradorValido = esBorradorDeEstaEvaluacion(borradorGuardado) ? borradorGuardado : null;

        setComentarios(borradorValido?.comentarios ?? "");
        dispatch(recetiarCriteriosEvaluados());
        criteriosFiltrados.forEach((criterio) => {
          const criterioGuardado = borradorValido?.evaluaciones[criterio.idCriterio];

          dispatch(
            agregarCriterioEvaluar({
              idCriterio: criterio.idCriterio,
              idCumplimiento: criterioGuardado?.idCumplimiento ?? "",
              valor: typeof criterioGuardado?.valor === "number" ? criterioGuardado.valor : 0,
            })
          );
        });

        if (criteriosFiltrados.length === 0) {
          lanzarErrorRef.current(
            "Esta rúbrica no tiene criterios configurados. Contacta al administrador."
          );
        }
      } catch (error) {
        console.error("❌ Error cargando criterios de la rúbrica:", error);
        setListCriterios([]);
        dispatch(recetiarCriteriosEvaluados());
        lanzarErrorRef.current(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los criterios de la rúbrica."
        );
      } finally {
        setCargandoCriterios(false);
        setCargandoFichaResultados(false);
      }
    };

    void fetchCriterios();
  }, [dispatch, esBorradorDeEstaEvaluacion, rubricaSelecionada.idRubrica]);

  const guardarCumplimientoEnBorrador = useCallback(
    (item: EvaluarDraftItem) => {
      const borradorActual = readEvaluarDraftCookie();
      const borradorValido = esBorradorDeEstaEvaluacion(borradorActual) ? borradorActual : null;
      const evaluacionesBase = borradorValido?.evaluaciones ?? dataCriteriosEvaluar;

      guardarBorradorEvaluacion({
        evaluacionesActualizadas: {
          ...evaluacionesBase,
          [item.idCriterio]: item,
        },
      });
    },
    [dataCriteriosEvaluar, esBorradorDeEstaEvaluacion, guardarBorradorEvaluacion]
  );

  const sumarPuntosDeCriterios = useCallback(() => {
    let total = 0;
    Object.values(dataCriteriosEvaluar).forEach((item) => {
      if (typeof item === "object" && item !== null && "valor" in item) {
        total += item.valor;
      } else if (typeof item === "number") {
        total += item;
      }
    });
    setTotalPuntos(total);
  }, [dataCriteriosEvaluar]);

  useEffect(() => {
    sumarPuntosDeCriterios();
  }, [sumarPuntosDeCriterios]);

  const agregarComentario = (comentario: string) => {
    setComentarios(comentario);
    guardarBorradorEvaluacion({ comentariosActualizados: comentario });
  };

  const cargarPerfilActivo = async () => {
    try {
      const perfilServices = new PerfilesServices();
      const perfil = await perfilServices.getUsuarioLogiado();
      if (perfil) {
        setPerfilActivo(perfil);
      }
    } catch (error) {
      console.error("❌ Error cargando el perfil activo:", error);
    }
  };

  useEffect(() => {
    cargarPerfilActivo();
  }, []);

  useEffect(() => {
    const claveVerificacion = `${bandaSelecionada.idBanda}:${eventoSelecionado.idEvento}:${rubricaSelecionada.idRubrica}`;
    if (verificacionEvaluacionRef.current === claveVerificacion) {
      return;
    }
    verificacionEvaluacionRef.current = claveVerificacion;

    const verificarEvaluacionExistente = async () => {
      setVerificandoEvaluacionExistente(true);
      setEvaluacionBloqueada(false);
      setCriteriosParcialesGuardados(0);
      try {
        await registroComentariosServices.current.initPerfil();
        const yaEvaluada = await registroComentariosServices.current.rubricaYaEvaluadaEnEvento(
          bandaSelecionada.idBanda,
          eventoSelecionado.idEvento,
          rubricaSelecionada.idRubrica,
        );
        if (yaEvaluada) {
          setEvaluacionBloqueada(true);
          lanzarErrorRef.current("Esta banda ya fue evaluada con esta rúbrica en el evento.");
          return;
        }

        await registroCumplimientosServices.current.initPerfil();
        const guardados = await registroCumplimientosServices.current.getIdsCriteriosGuardadosEnRubrica(
          bandaSelecionada.idBanda,
          eventoSelecionado.idEvento,
          rubricaSelecionada.idRubrica,
        );
        if (guardados.size > 0) {
          setCriteriosParcialesGuardados(guardados.size);
        }
      } catch (error) {
        console.error("No se pudo verificar si la rúbrica ya fue evaluada:", error);
      } finally {
        setVerificandoEvaluacionExistente(false);
      }
    };

    void verificarEvaluacionExistente();
  }, [bandaSelecionada.idBanda, eventoSelecionado.idEvento, rubricaSelecionada.idRubrica]);

  const guardarEvaluacion = async () => {
    if (guardando) return;

    setSeprecionoElBotoGuardar(true);

    try {
      await registroComentariosServices.current.initPerfil();
      const yaEvaluada = await registroComentariosServices.current.rubricaYaEvaluadaEnEvento(
        bandaSelecionada.idBanda,
        eventoSelecionado.idEvento,
        rubricaSelecionada.idRubrica,
      );
      if (yaEvaluada) {
        lanzarError("Esta banda ya fue evaluada con esta rúbrica en el evento.");
        return;
      }
    } catch {
      lanzarError("No se pudo verificar si la evaluación ya existe. Intenta de nuevo.");
      return;
    }

    const camposCompletos = revisarCamposCompletos();
    if (!camposCompletos) return;

    const hayComentario = revisarComentario();
    if (!hayComentario) return;

    if (perfilActivo === null) {
      lanzarError("No se pudo obtener tu perfil. Vuelve a iniciar sesión.");
      return;
    }

    const bandaAGuardar = bandaSelecionada.idBanda;
    const eventoAGuardar = eventoSelecionado.idEvento;
    const categoriaAGurdar = categoriaSelecionada.idCategoria;
    const rubricaAGurardar = rubricaSelecionada.idRubrica;
    const perfilEvaluadorAguardar = perfilActivo.idPerfil;
    const federaciónAGuardar = perfilActivo.idForaneaFederacion || "";
    const regionAguardar = idRegionSelecionada;

    if (!perfilEvaluadorAguardar) {
      lanzarError("Tu perfil no tiene identificador de evaluador.");
      return;
    }

    const arregloDeCriteriosAGuardar = Object.entries(dataCriteriosEvaluar);
    if (
      arregloDeCriteriosAGuardar.length === 0 ||
      comentarios.trim() === "" ||
      bandaAGuardar === null ||
      eventoAGuardar === null ||
      categoriaAGurdar === null ||
      rubricaAGurardar === null
    ) {
      lanzarError("Faltan datos para guardar la evaluación.");
      return;
    }

    setGuardando(true);
    revisandoEvluacion();

    try {
      await registroCumplimientosServices.current.initPerfil();

      const totalCriterios = arregloDeCriteriosAGuardar.length;
      let guardados = await registroCumplimientosServices.current.getIdsCriteriosGuardadosEnRubrica(
        bandaAGuardar,
        eventoAGuardar,
        rubricaAGurardar,
      );

      const pendientes = arregloDeCriteriosAGuardar.filter(([idCriterio]) => !guardados.has(idCriterio));

      for (const [idCriterio, item] of pendientes) {
        const data: Omit<
          registroCumplimientoEvaluacionInterface,
          "idRegistroCumplimientoEvaluacion" | "created_at"
        > = {
          idForaneaBanda: bandaAGuardar,
          idForaneaEvento: eventoAGuardar,
          idForaneaCategoria: categoriaAGurdar,
          idForaneaRubrica: rubricaAGurardar,
          idForaneaPerfil: perfilEvaluadorAguardar,
          idForaneaFederacion: federaciónAGuardar,
          idForaneaRegion: regionAguardar,
          puntosObtenidos: item.valor,
          idForaneaCumplimiento: item.idCumplimiento,
          idForaneaCriterio: idCriterio,
        };

        try {
          const respuesta = await registroCumplimientosServices.current.create(
            data as registroCumplimientoEvaluacionInterface
          );
          if (!respuesta) {
            throw new Error("No se pudo guardar un criterio de la evaluación.");
          }
        } catch (error) {
          if (esErrorInsertDuplicadoEvaluacion(error)) {
            continue;
          }
          throw error;
        }
      }

      guardados = await registroCumplimientosServices.current.getIdsCriteriosGuardadosEnRubrica(
        bandaAGuardar,
        eventoAGuardar,
        rubricaAGurardar,
      );

      if (guardados.size < totalCriterios) {
        setCriteriosParcialesGuardados(guardados.size);
        lanzarError(
          `Se guardaron ${guardados.size} de ${totalCriterios} criterios. Revisa tu conexión e intenta de nuevo.`
        );
        return;
      }

      let comentarioExiste = await registroComentariosServices.current.rubricaYaEvaluadaEnEvento(
        bandaAGuardar,
        eventoAGuardar,
        rubricaAGurardar,
      );

      if (!comentarioExiste) {
        const dataComentario: Omit<registroComentariosInterface, "idRegistroComentario" | "created_at"> = {
          idForaneaBanda: bandaAGuardar,
          idForaneaEvento: eventoAGuardar,
          idForaneaCategoria: categoriaAGurdar,
          idForaneaRubrica: rubricaAGurardar,
          idForaneaPerfil: perfilEvaluadorAguardar,
          idForaneaFederacion: federaciónAGuardar,
          idForaneaRegion: regionAguardar,
          comentario: comentarios.trim(),
        };

        try {
          const respuestaComentario = await registroComentariosServices.current.create(
            dataComentario as registroComentariosInterface
          );
          if (!respuestaComentario) {
            lanzarError("No se pudo guardar el comentario. Intenta de nuevo.");
            return;
          }
        } catch (error) {
          if (!esErrorInsertDuplicadoEvaluacion(error)) {
            throw error;
          }
        }

        comentarioExiste = await registroComentariosServices.current.rubricaYaEvaluadaEnEvento(
          bandaAGuardar,
          eventoAGuardar,
          rubricaAGurardar,
        );
      }

      if (!comentarioExiste) {
        lanzarError("No se pudo completar el guardado del comentario. Intenta de nuevo.");
        return;
      }

      setCriteriosParcialesGuardados(0);
      setModalConfirmacion(null);
      finalizarEvaluacionBanda();
    } catch (error) {
      console.error("❌ Error al guardar la evaluación:", error);
      lanzarError("Error al guardar la evaluación. Si el problema continúa, revisa permisos en la base de datos.");
    } finally {
      setGuardando(false);
    }
  };
  const revisarComentario =()=>{
   if(  comentarios.length===0 || comentarios.trim() ===""){
     lanzarError("No a dejado ningun comentario")
     return false

   }else{
    return true
   }
  }

  const revisarCamposCompletos = () => {
    const arregloDeCriteriosAGuardar = Object.entries(dataCriteriosEvaluar);
    let criterioNoEvaluado = "";
    arregloDeCriteriosAGuardar.forEach(([idCriterio, item]) => {
      if (item.idCumplimiento === "") {
        criterioNoEvaluado = idCriterio;
        
        return;
      }
    });
    if (criterioNoEvaluado !== "") {
      setCampoIncompleto(criterioNoEvaluado);
       lanzarError("Campos incompletos, te faltan criterios por evaluar")
      return false;
    } else {
      
      return true;
    }
  };
  const criteriosListos = Array.isArray(listCriterios) && listCriterios.length > 0;
  const criteriosEvaluarListos = dataCriteriosEvaluar && Object.keys(dataCriteriosEvaluar).length > 0;
  const cargandoRubrica = verificandoEvaluacionExistente || cargandoCriterios;

  if (cargandoRubrica) {
    return (
      <div className="flex min-h-[10rem] w-full max-w-full flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--vz-border)] bg-white px-4 py-8 shadow-sm">
        <Lottie animationData={loading2} loop className="max-h-28 w-28" aria-hidden />
        <p className="text-center text-sm text-[var(--app-fg-muted)]">
          {verificandoEvaluacionExistente ? "Verificando evaluación…" : "Cargando rúbrica…"}
        </p>
      </div>
    );
  }

  if (evaluacionBloqueada) {
    return (
      <div className="mx-4 my-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-6 text-center">
        <p className="text-base font-semibold text-amber-900">
          Esta banda ya fue evaluada con esta rúbrica en el evento.
        </p>
        <p className="mt-2 text-sm text-amber-800/80">
          Espera a que cambie la banda en cancha y usa Actualizar en la sala de espera.
        </p>
      </div>
    );
  }

  if (!criteriosListos || !criteriosEvaluarListos) {
    return (
      <div className="mx-4 my-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-6 text-center">
        <p className="text-base font-semibold text-amber-900">No se pudo cargar la rúbrica</p>
        <p className="mt-2 text-sm text-amber-800/80">
          No hay criterios asociados a esta rúbrica o falló la carga. Revisa la configuración o vuelve a
          intentar.
        </p>
      </div>
    );
  }

  return (
    <>
    <ConfirmRefrescarDatosModal
      open={modalConfirmacion === "guardar"}
      onClose={() => {
        if (!guardando) setModalConfirmacion(null);
      }}
      loading={guardando}
      onConfirm={async () => {
        await guardarEvaluacion();
      }}
      titulo="Confirmar guardado"
      mensaje="¿Seguro que quieres guardar esta evaluación?"
      textoBotonConfirmar="Sí, guardar"
      textoBotonCancelar="No, volver"
    />
    <ConfirmRefrescarDatosModal
      open={modalConfirmacion === "cancelar"}
      onClose={() => setModalConfirmacion(null)}
      onConfirm={() => {
        setModalConfirmacion(null);
        cancelarEvaluacionBanda();
      }}
      titulo="Confirmar cancelación"
      mensaje="¿Seguro que deseas cancelar? Se perderán los cambios no guardados."
      textoBotonConfirmar="Sí, cancelar"
      textoBotonCancelar="No, volver"
      variante="peligro"
    />
    <div className="flex w-full max-w-full min-w-0 flex-col gap-4 px-1 pb-[env(safe-area-inset-bottom,0px)] sm:px-2">
      {criteriosParcialesGuardados > 0 && listCriterios.length > 0 ? (
        <div
          className="rounded-xl border border-[var(--brand)]/30 bg-[var(--brand)]/10 px-4 py-3 text-sm text-[var(--app-fg)]"
          role="status"
        >
          Guardado incompleto: {criteriosParcialesGuardados} de {listCriterios.length} criterios ya
          están en el sistema. Completa la evaluación y vuelve a guardar.
        </div>
      ) : null}
      <div className="w-full min-w-0">
        {Object.keys(dataCriteriosEvaluar).length === 0 ? (
          <div className="flex justify-center py-4">
            <Lottie animationData={loading2} loop className="max-h-24 w-24" aria-hidden />
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:gap-5">
          {cargandoCriterios ? (
            <p className="text-center text-sm text-[var(--app-fg-muted)]">Cargando criterios…</p>
          ) : (
            listCriterios.map((criterio) => (
              <EvaluarCriterioComponent
                key={criterio.idCriterio}
                criterioSelecionado={criterio}
                criterioNoEvaluado={campoImcompleto}
                onSeleccionarCumplimiento={guardarCumplimientoEnBorrador}
              />
            ))
          )}
        </div>

        {Object.keys(dataCriteriosEvaluar).length === 0 ? null : (
          <section
            className="card-row-bg mt-2 w-full min-w-0 overflow-hidden rounded-2xl shadow-sm sm:mt-4"
            aria-label="Resumen y comentarios de evaluación"
          >
            <header className="flex flex-col gap-2 border-b border-[var(--vz-border)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3.5">
              <h2 className="min-w-0 text-lg font-semibold leading-snug tracking-tight text-[var(--app-fg)] sm:text-xl">
                <span className="block truncate">{bandaSelecionada.nombreBanda}</span>
              </h2>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                  Total
                </span>
                <span className="rounded-lg bg-[var(--brand)]/15 px-3 py-1.5 text-base font-bold tabular-nums text-[var(--brand)] ring-1 ring-[var(--brand)]/25">
                  {totalPuntos}
                </span>
              </div>
            </header>

            <div className="scrollbar-estetica max-h-[min(40vh,16rem)] overflow-y-auto border-b border-[var(--vz-border)] px-3 py-2 sm:max-h-[min(45vh,20rem)] sm:px-4">
              {Object.keys(dataCriteriosEvaluar).length > 0 ? (
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2">
                  {Object.entries(dataCriteriosEvaluar).map(([idCriterio, item]) => {
                    const criterio = listCriterios.find((c) => c.idCriterio === idCriterio);
                    if (!criterio) return null;
                    return (
                      <li
                        key={idCriterio}
                        className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-[var(--vz-border)] bg-[#fafafa] px-2.5 py-2 sm:px-3"
                      >
                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--app-fg)] sm:text-sm">
                          {criterio.nombreCriterio}
                        </span>
                        <span className="shrink-0 tabular-nums text-sm font-semibold text-[var(--brand)] sm:text-base">
                          {item.valor}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="py-2 text-center text-sm text-[var(--app-fg-muted)]">
                  No hay criterios para evaluar.
                </p>
              )}
            </div>

            <div className="px-3 py-3 sm:px-4 sm:py-4">
              <label
                htmlFor="evaluar-comentarios"
                className="mb-1.5 block text-xs font-medium text-[var(--app-fg-muted)]"
              >
                Comentarios u observaciones
              </label>
              <textarea
                id="evaluar-comentarios"
                value={comentarios}
                onChange={(evento) => agregarComentario(evento.target.value)}
                maxLength={250}
                rows={4}
                autoComplete="off"
                className={[
                  "w-full min-h-[6.5rem] resize-y rounded-xl border bg-white p-3 text-base text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  comentarios.length === 0 && sePrecionoElBotoGuardar
                    ? "border-rose-400 ring-1 ring-rose-300"
                    : "border-[var(--vz-border-strong)]",
                ].join(" ")}
                placeholder="Observaciones, comentarios y sugerencias…"
              />
              <p className="mt-1 text-right text-xs tabular-nums text-[var(--app-fg-muted)]">
                {comentarios.length}/250
              </p>
            </div>

            <footer className="sticky bottom-0 z-[1] flex flex-col gap-2 border-t border-[var(--vz-border)] bg-white/95 px-3 py-3 backdrop-blur-md sm:static sm:flex-row sm:justify-end sm:bg-transparent sm:px-4 sm:py-4 sm:backdrop-blur-none">
              <button
                type="button"
                disabled={guardando}
                onClick={() => setModalConfirmacion("guardar")}
                className="btn-surface min-h-11 w-full touch-manipulation rounded-xl px-4 py-3 text-base font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[10.5rem]"
              >
                {guardando ? "Guardando…" : "Guardar"}
              </button>
              <button
                type="button"
                disabled={guardando}
                onClick={() => setModalConfirmacion("cancelar")}
                className="min-h-11 w-full touch-manipulation rounded-xl border border-[var(--vz-border-strong)] bg-white px-4 py-3 text-base font-medium text-[var(--app-fg)] transition-colors hover:bg-[#fafafa] sm:w-auto sm:min-w-[10.5rem]"
              >
                Cancelar
              </button>
            </footer>
          </section>
        )}
      </div>
    </div>
    </>
  );
}
