"use client";

import {
  cumplimientosInterface,
  perfilDatosAmpleosInterface,
  registroCumplimientoEvaluacionInterface,
  respuestaSolicitudRevicionInterface,
  solicitudRevicionInterface,
  vistaSolicitudRevicionInterface,
} from "@/interfaces/interfaces";
import React, { useEffect, useRef, useState } from "react";
import SolicitudRevicionServices from "@/lib/services/solicitudRevicionServices";
import cumplimientossServices from "@/lib/services/cumplimientosServices";
import RespuestaSolicitudRevicionesServices from "@/lib/services/respuestaSolicitudRevicionesServices";
import RegistroCumplimientoServices from "@/lib/services/RegistroCumplimientosServices";
import ErrorMessage from "@/component/Message/ErrorMessage";
import {
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const textareaClass =
  "w-full resize-y rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

function badgeEstadoClases(estado: string) {
  const e = estado?.toLowerCase() ?? "";
  if (e === "aprobado") return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/35";
  if (e === "denegado") return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/35";
  return "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/35";
}

function etiquetaEstado(estado: string) {
  const e = estado?.toLowerCase() ?? "";
  if (e === "aprobado") return "Aprobada";
  if (e === "denegado") return "Denegada";
  return "Pendiente";
}

type OverleyModalProps = {
  open: boolean;
  onClose: () => void;
  solicitudRevicion: vistaSolicitudRevicionInterface;
  /** Se invoca tras guardar la respuesta correctamente (para refrescar listas). */
  onRespuestaEnviada?: () => void | Promise<void>;
};

export default function InformacionSolicitudRevicion({
  open,
  onClose,
  solicitudRevicion,
  onRespuestaEnviada,
}: OverleyModalProps) {
  const [justificacion, setJustificacion] = React.useState("");
  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface>({} as perfilDatosAmpleosInterface);
  const [listCumplimientos, setListCumplimientos] = useState<cumplimientosInterface[]>([]);
  const [aprobacion, setaprobacion] = useState<string>("pendiente");
  const [idCumplimientoSeleccionado, setIdCumplimientoSeleccionado] = useState<string>(
    solicitudRevicion?.idForaneaCumplimiento || "",
  );

  const cumplimientosServices = useRef(new cumplimientossServices());
  const respuestaSolicitudRevicionServices = useRef(new RespuestaSolicitudRevicionesServices());
  const solicitudRevicionServices = useRef(new SolicitudRevicionServices());
  const registroCumpliminetoServices = useRef(new RegistroCumplimientoServices());
  const [enviarPrecionado, setEnviarPrecionado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [openError, setOpenError] = useState(false);

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

  const aprobarCambios = async () => {
    const cumplimientos = await cumplimientosServices.current.getPorCriterio(solicitudRevicion.idForaneaCriterio);
    setListCumplimientos(cumplimientos);
    setaprobacion("aprobado");
  };

  const denegarCambios = async () => {
    setaprobacion("denegado");
  };

  const [Animar, setAnimar] = React.useState(false);
  useEffect(() => {
    if (open) {
      setAnimar(false);
      setTimeout(() => {
        setAnimar(true);
      }, 10);
      setaprobacion("pendiente");
      setJustificacion("");
      setEnviarPrecionado(false);
      setIdCumplimientoSeleccionado(solicitudRevicion?.idForaneaCumplimiento || "");
      setListCumplimientos([]);
    } else {
      setAnimar(false);
    }
  }, [open, solicitudRevicion?.idSolicitud, solicitudRevicion?.idForaneaCumplimiento]);

  const cerrarModal = () => {
    setAnimar(false);
    onClose();
  };

  const limpiarFormulario = () => {
    setJustificacion("");
    setaprobacion("pendiente");
    setIdCumplimientoSeleccionado("");
    setEnviarPrecionado(false);
  };

  const selecionarFilaCumplimiento = (idCumplimiento: string) => {
    setIdCumplimientoSeleccionado(idCumplimiento);
  };

  const cancelar = () => {
    setaprobacion("pendiente");
    setIdCumplimientoSeleccionado(solicitudRevicion?.idForaneaCumplimiento || "");
    onClose();
    limpiarFormulario();
    setEnviarPrecionado(false);
  };

  const mostrarError = (texto: string) => {
    setMensajeError(texto);
    setOpenError(true);
  };

  const mensajeErrorSupabase = (error: unknown, contexto: string): string => {
    if (error instanceof Error && error.message.trim()) {
      return `${contexto}: ${error.message}`;
    }
    if (error && typeof error === "object") {
      const o = error as Record<string, unknown>;
      const partes = [contexto];
      for (const key of ["message", "details", "hint", "code"] as const) {
        const v = o[key];
        if (typeof v === "string" && v.trim()) partes.push(v.trim());
      }
      if (partes.length > 1) return partes.join(" · ");
    }
    return `${contexto}. Revise permisos o conexión.`;
  };

  const enviarSolicitudRevision = async () => {
    setEnviarPrecionado(true);
    if (justificacion.trim().length === 0 || aprobacion === "pendiente") {
      mostrarError("Escriba una justificación y elija aprobar o denegar antes de enviar.");
      return;
    }
    if (aprobacion === "aprobado" && !idCumplimientoSeleccionado) {
      mostrarError("Seleccione el cumplimiento que aplicará con la aprobación.");
      return;
    }
    if (!perfil?.idPerfil || !perfil?.idForaneaFederacion) {
      mostrarError("No se encontró el perfil activo. Vuelva a iniciar sesión.");
      return;
    }

    setEnviando(true);
    try {
      await Promise.all([
        respuestaSolicitudRevicionServices.current.initPerfil(),
        solicitudRevicionServices.current.initPerfil(),
        registroCumpliminetoServices.current.initPerfil(),
      ]);

      const datosRegistroCumplimiento = await registroCumpliminetoServices.current.getOne(
        solicitudRevicion.idForaneaRegistroCumplimiento,
      );

      const datosSolicitudActualizada: Partial<solicitudRevicionInterface> = {
        estado: aprobacion,
      };

      const datosRespuesta: Omit<respuestaSolicitudRevicionInterface, "idRespuesta" | "created_at"> = {
        idForaneaFederacion: perfil.idForaneaFederacion,
        idForaneaSolicitudRevicion: solicitudRevicion.idSolicitud,
        idForaneaRevisor: perfil.idPerfil,
        aprobacion,
        detallesRespuesta: justificacion.trim(),
      };

      await respuestaSolicitudRevicionServices.current.create(
        datosRespuesta as respuestaSolicitudRevicionInterface,
      );
      try {
        await solicitudRevicionServices.current.update(
          solicitudRevicion.idSolicitud,
          datosSolicitudActualizada as solicitudRevicionInterface,
        );
      } catch (error) {
        throw new Error(mensajeErrorSupabase(error, "No se pudo actualizar el estado de la solicitud"));
      }

      if (aprobacion === "aprobado") {
        const cumplimientoElegido = listCumplimientos.find(
          (c) => c.idCumplimiento === idCumplimientoSeleccionado,
        );
        const nuevosDatosRegistroCumplimiento: Partial<registroCumplimientoEvaluacionInterface> = {
          idRegistroCumplimientoEvaluacion: datosRegistroCumplimiento.idRegistroCumplimientoEvaluacion,
          idForaneaEvento: datosRegistroCumplimiento.idForaneaEvento,
          idForaneaBanda: datosRegistroCumplimiento.idForaneaBanda,
          idForaneaCriterio: datosRegistroCumplimiento.idForaneaCriterio,
          idForaneaCumplimiento: idCumplimientoSeleccionado,
          idForaneaCategoria: datosRegistroCumplimiento.idForaneaCategoria,
          idForaneaRegion: datosRegistroCumplimiento.idForaneaRegion,
          puntosObtenidos:
            cumplimientoElegido?.puntosCumplimiento ?? datosRegistroCumplimiento.puntosObtenidos,
          idForaneaPerfil: datosRegistroCumplimiento.idForaneaPerfil,
          idForaneaFederacion: datosRegistroCumplimiento.idForaneaFederacion,
          idForaneaRubrica: datosRegistroCumplimiento.idForaneaRubrica,
        };
        try {
          await registroCumpliminetoServices.current.update(
            solicitudRevicion.idForaneaRegistroCumplimiento,
            nuevosDatosRegistroCumplimiento as registroCumplimientoEvaluacionInterface,
          );
        } catch (error) {
          throw new Error(
            mensajeErrorSupabase(error, "No se pudo aplicar el cumplimiento aprobado al registro de evaluación"),
          );
        }
      }

      limpiarFormulario();
      await onRespuestaEnviada?.();
      onClose();
    } catch (error) {
      console.error("Error al enviar la respuesta de la solicitud de revisión:", error);
      mostrarError(
        error instanceof Error
          ? error.message
          : mensajeErrorSupabase(error, "No se pudo guardar la respuesta"),
      );
    } finally {
      setEnviando(false);
    }
  };

  const estadoSolicitud = solicitudRevicion?.estado ?? "pendiente";
  const puedeResponder =
    solicitudRevicion.estado === "pendiente" && aprobacion === "pendiente";
  const enFlujoRespuesta =
    solicitudRevicion.estado === "pendiente" && aprobacion !== "pendiente";
  const yaResuelta = solicitudRevicion.estado !== "pendiente";

  return (
    <>
      <ErrorMessage
        titulo="No se pudo enviar"
        open={openError}
        onClose={() => setOpenError(false)}
        texto={mensajeError}
      />

      {open ? (
        <div
          role="presentation"
          onDoubleClick={() => cerrarModal()}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-revision-responder-titulo"
            onDoubleClick={(e) => e.stopPropagation()}
            className={`flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-600 bg-slate-800 shadow-xl transition-all duration-300 ease-out ${
              Animar ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            {/* Encabezado */}
            <div
              className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-600/80 bg-slate-900/30 px-4 py-4 sm:px-6"
            >
              <div className="min-w-0 flex-1 border-l-4 border-[#00b4d8] pl-3">
                <p className="text-xs font-medium uppercase tracking-wide text-[#00b4d8]/90">
                  Solicitud de revisión
                </p>
                <h2
                  id="modal-revision-responder-titulo"
                  className="truncate text-xl font-bold text-slate-100 sm:text-2xl"
                >
                  {solicitudRevicion?.nombreBanda}
                </h2>
                {(solicitudRevicion?.LugarEvento || solicitudRevicion?.nombreRegion) && (
                  <p className="mt-0.5 truncate text-sm text-slate-400">
                    {[solicitudRevicion?.LugarEvento, solicitudRevicion?.nombreRegion]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${badgeEstadoClases(estadoSolicitud)}`}
              >
                {etiquetaEstado(estadoSolicitud)}
              </span>
              <button
                type="button"
                onClick={() => cerrarModal()}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-700/80 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primario)]"
                aria-label="Cerrar"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {/* Contenido */}
            <div className="scrollbar-estetica flex-1 overflow-y-auto px-4 py-5 sm:px-6">
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
                  <dt className="text-xs font-medium uppercase tracking-wide text-white/70">
                    Cumplimiento actual
                  </dt>
                  <dd className="mt-0.5 font-medium text-slate-100">
                    {solicitudRevicion?.detalleCumplimiento}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-white/70">Puntos</dt>
                  <dd className="mt-0.5 inline-flex rounded-md bg-slate-900/40 px-2 py-0.5 font-semibold text-[#00b4d8]">
                    {solicitudRevicion?.puntosCumplimiento}%
                  </dd>
                </div>
              </dl>

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/70">
                  Detalles de la solicitud
                </p>
                <div className="rounded-lg border border-cyan-500/25 bg-cyan-950/35 p-3 text-sm leading-relaxed text-slate-100">
                  {solicitudRevicion?.detallesSolicitud}
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6">
                {puedeResponder ? (
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <button
                      type="button"
                      onClick={() => aprobarCambios()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-6 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25 sm:w-auto"
                    >
                      <CheckCircleIcon className="h-5 w-5 shrink-0" aria-hidden />
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => denegarCambios()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/15 px-6 py-3 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/25 sm:w-auto"
                    >
                      <XCircleIcon className="h-5 w-5 shrink-0" aria-hidden />
                      Denegar
                    </button>
                  </div>
                ) : enFlujoRespuesta ? (
                  <div className="space-y-5">
                    {aprobacion === "aprobado" ? (
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                        <h3 className="text-lg font-semibold text-emerald-300">Aprobar solicitud</h3>
                        <p className="mt-1 text-sm text-slate-300">
                          Elija el cumplimiento que quedará registrado para este criterio.
                        </p>
                        <div className="mt-4 flex flex-col gap-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                            Criterio: {solicitudRevicion.nombreCriterio}
                          </p>
                          {listCumplimientos.map((cumplimiento) => {
                            const seleccionado =
                              cumplimiento.idCumplimiento === idCumplimientoSeleccionado;
                            return (
                              <button
                                key={cumplimiento.idCumplimiento}
                                type="button"
                                onClick={() => selecionarFilaCumplimiento(cumplimiento.idCumplimiento)}
                                className={`flex w-full cursor-pointer items-center gap-4 rounded-lg border p-3 text-left transition-colors ${
                                  seleccionado
                                    ? "border-[#00b4d8] bg-[#00b4d8]/15 ring-1 ring-[#00b4d8]/40"
                                    : "border-slate-600/80 bg-slate-700/50 hover:border-slate-500 hover:bg-slate-600/60"
                                }`}
                              >
                                <span
                                  className={`flex min-w-14 shrink-0 items-center justify-center rounded-md px-2 py-1 text-sm font-bold ${
                                    seleccionado ? "bg-[#00b4d8]/25 text-[#00b4d8]" : "bg-slate-900/40 text-slate-200"
                                  }`}
                                >
                                  {cumplimiento.puntosCumplimiento}%
                                </span>
                                <span className="text-sm text-slate-200">{cumplimiento.detalleCumplimiento}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                        <h3 className="text-lg font-semibold text-rose-300">Denegar solicitud</h3>
                        <p className="mt-1 text-sm text-slate-300">
                          Indique en la justificación el motivo del rechazo.
                        </p>
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        void enviarSolicitudRevision();
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label
                          htmlFor="justificacion-respuesta-revision"
                          className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
                        >
                          Justificación de la respuesta
                        </label>
                        <textarea
                          id="justificacion-respuesta-revision"
                          maxLength={200}
                          rows={4}
                          value={justificacion}
                          onChange={(e) => setJustificacion(e.target.value)}
                          placeholder="Explique su decisión…"
                          className={`${textareaClass} min-h-[120px] ${
                            justificacion.length === 0 && enviarPrecionado
                              ? "border-rose-500/60 ring-1 ring-rose-500/30"
                              : ""
                          }`}
                        />
                        <p className="mt-1 text-right text-xs text-slate-400">{justificacion.length}/200</p>
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => cancelar()}
                          disabled={enviando}
                          className="rounded-lg border border-slate-500 bg-transparent px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={enviando}
                          className="rounded-lg bg-[var(--color-primario)] px-5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {enviando ? "Enviando…" : "Enviar respuesta"}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : yaResuelta ? (
                  <div
                    className={`rounded-xl border px-4 py-4 text-center ${
                      estadoSolicitud === "aprobado"
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-rose-500/30 bg-rose-500/10"
                    }`}
                  >
                    <p
                      className={`text-lg font-semibold ${
                        estadoSolicitud === "aprobado" ? "text-emerald-300" : "text-rose-300"
                      }`}
                    >
                      Esta solicitud ya fue {etiquetaEstado(estadoSolicitud).toLowerCase()}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      No requiere más acciones por su parte.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Pie */}
            <div className="flex shrink-0 justify-end border-t border-slate-600/80 bg-slate-900/30 px-4 py-4 sm:px-6">
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
