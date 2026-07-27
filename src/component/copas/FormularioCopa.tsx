"use client";

import type { CopaFilaDisplay } from "@/component/copas/CardRowCopa";
import { ComboBoxBandas } from "@/component/ComboBox/ComboBoxBandas";
import SelectorLugarCopa from "@/component/copas/SelectorLugarCopa";
import type {
  bandaInterface,
  categoriaInterface,
  copaInterface,
  registroEventoDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import {
  guardarCopasEventoCategoria,
  obtenerCopasPorEventoAccion,
} from "@/lib/actions/copasAcciones";
import { cn } from "@/lib/utils";
import BandasServices from "@/lib/services/bandasServices";
import CategoriasServices from "@/lib/services/categoriaServices";
import ConfirmacionAsistenciaServices from "@/lib/services/confirmacionAsistenciaServices";
import PerfilesServices from "@/lib/services/perfilesServices";
import { createSolicitudCopa } from "@/lib/services/solicitudCopasServices";
import { CheckIcon } from "@heroicons/react/16/solid";
import { useEffect, useMemo, useRef, useState } from "react";

const selectBaseClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

const LUGARES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const COPAS_VACIAS: copaInterface[] = [];

const WIZARD_PASOS = [
  { label: "Evento" },
  { label: "Categoría" },
  { label: "Lugar" },
  { label: "Banda" },
] as const;

type PasoWizard = 0 | 1 | 2 | 3;

type Props = {
  idEvento?: string;
  eventosDisponibles?: registroEventoDatosAmpleosInterface[];
  idCategoriaInicial?: string;
  copaEditar?: CopaFilaDisplay | null;
  copasDelEvento?: copaInterface[];
  modo?: "asignar" | "solicitar";
  onClose: () => void;
  onGuardado: (idEventoGuardado?: string) => void;
};

export default function FormularioCopa({
  idEvento = "",
  eventosDisponibles,
  idCategoriaInicial = "",
  copaEditar = null,
  copasDelEvento = COPAS_VACIAS,
  modo = "asignar",
  onClose,
  onGuardado,
}: Props) {
  const confirmacionServices = useRef(new ConfirmacionAsistenciaServices());
  const bandasServices = useRef(new BandasServices());
  const categoriasServices = useRef(new CategoriasServices());
  const perfilesServices = useRef(new PerfilesServices());

  const esSolicitar = modo === "solicitar";
  const esAgregarWizard = !copaEditar && Boolean(eventosDisponibles?.length);

  const [paso, setPaso] = useState<PasoWizard>(0);
  const [idCategoria, setIdCategoria] = useState(
    copaEditar ? "" : idCategoriaInicial,
  );
  const [idBanda, setIdBanda] = useState(copaEditar?.id_foranea_banda ?? "");
  const [lugar, setLugar] = useState<number | null>(
    copaEditar ? Number(copaEditar.lugar) || 1 : null,
  );
  const [tipo, setTipo] = useState<"directo" | "desempate">(
    (copaEditar?.tipo as "directo" | "desempate") || "directo",
  );
  const [justificacion, setJustificacion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [categoriasList, setCategoriasList] = useState<categoriaInterface[]>([]);
  const [bandasConfirmadas, setBandasConfirmadas] = useState<bandaInterface[]>([]);
  const [copasInternas, setCopasInternas] = useState<copaInterface[]>([]);
  const [idEventoActivo, setIdEventoActivo] = useState(idEvento);
  const [cargando, setCargando] = useState(true);

  const idEventoEfectivo = copaEditar ? idEvento : idEventoActivo;
  const copasEfectivas = esAgregarWizard ? copasInternas : copasDelEvento;

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      if (!idEventoEfectivo.trim()) {
        setCopasInternas((prev) => (prev.length === 0 ? prev : []));
        setBandasConfirmadas((prev) => (prev.length === 0 ? prev : []));
        setCargando((prev) => (prev ? false : prev));
        return;
      }
      setCargando(true);
      setError(null);
      try {
        const [categorias, confirmaciones, copas] = await Promise.all([
          categoriasServices.current.get(),
          confirmacionServices.current.getConfirmacionesPorEvento(idEventoEfectivo),
          esAgregarWizard
            ? obtenerCopasPorEventoAccion(idEventoEfectivo)
            : Promise.resolve(copasDelEvento),
        ]);
        await bandasServices.current.initPerfil();
        const bandas = await bandasServices.current.getDatosAmpleos();
        const ids = new Set(
          confirmaciones
            .map((c) => c.id_foranea_banda)
            .filter((id): id is string => Boolean(id?.trim())),
        );
        const confirmadas = bandas.filter((b) => ids.has(b.idBanda));
        if (cancelado) return;
        setCategoriasList(categorias);
        setBandasConfirmadas(confirmadas);
        if (esAgregarWizard) setCopasInternas(copas);

        if (copaEditar) {
          const banda = confirmadas.find(
            (b) => b.idBanda === copaEditar.id_foranea_banda,
          );
          setIdCategoria(banda?.idForaneaCategoria ?? "");
        } else if (idCategoriaInicial) {
          setIdCategoria(idCategoriaInicial);
        }
      } catch (e) {
        if (!cancelado) {
          setError(e instanceof Error ? e.message : "Error al cargar datos.");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    void cargar();
    return () => {
      cancelado = true;
    };
  }, [
    idEventoEfectivo,
    copaEditar,
    idCategoriaInicial,
    esAgregarWizard,
    ...(copaEditar ? [copasDelEvento] : []),
  ]);

  const categoriasConBandas = useMemo(() => {
    const ids = new Set(
      bandasConfirmadas.map((b) => b.idForaneaCategoria).filter(Boolean),
    );
    return categoriasList.filter((c) => ids.has(c.idCategoria));
  }, [bandasConfirmadas, categoriasList]);

  const bandasEnCategoria = useMemo(
    () =>
      bandasConfirmadas.filter((b) => b.idForaneaCategoria === idCategoria),
    [bandasConfirmadas, idCategoria],
  );

  const bandasConCopaEnCategoria = useMemo(() => {
    const ids = new Set<string>();
    for (const c of copasEfectivas) {
      const banda = bandasConfirmadas.find(
        (b) => b.idBanda === c.id_foranea_banda,
      );
      if (banda?.idForaneaCategoria === idCategoria) {
        ids.add(c.id_foranea_banda);
      }
    }
    return ids;
  }, [copasEfectivas, idCategoria, bandasConfirmadas]);

  const bandasSeleccionables = useMemo(() => {
    if (copaEditar) return bandasEnCategoria;
    return bandasEnCategoria.filter((b) => !bandasConCopaEnCategoria.has(b.idBanda));
  }, [bandasEnCategoria, bandasConCopaEnCategoria, copaEditar]);

  useEffect(() => {
    if (copaEditar || !idBanda) return;
    if (!bandasSeleccionables.some((b) => b.idBanda === idBanda)) {
      setIdBanda("");
    }
  }, [bandasSeleccionables, idBanda, copaEditar]);

  const lugaresOcupados = useMemo(() => {
    const ocupados = new Set<number>();
    for (const c of copasEfectivas) {
      const banda = bandasConfirmadas.find(
        (b) => b.idBanda === c.id_foranea_banda,
      );
      if (banda?.idForaneaCategoria !== idCategoria) continue;
      if (copaEditar && c.id_copas === copaEditar.id_copas) continue;
      ocupados.add(Number(c.lugar));
    }
    return ocupados;
  }, [copasEfectivas, idCategoria, copaEditar, bandasConfirmadas]);

  const eventoSeleccionado = eventosDisponibles?.find(
    (e) => e.idEvento === idEventoActivo,
  );
  const categoriaSeleccionada = categoriasConBandas.find(
    (c) => c.idCategoria === idCategoria,
  );

  const puedeAvanzar = useMemo(() => {
    if (paso === 0) return Boolean(idEventoActivo.trim()) && !cargando;
    if (paso === 1) return Boolean(idCategoria);
    if (paso === 2) return lugar !== null;
    return Boolean(idBanda);
  }, [paso, idEventoActivo, cargando, idCategoria, lugar, idBanda]);

  const seleccionarEvento = (id: string) => {
    setIdEventoActivo(id);
    setIdCategoria("");
    setIdBanda("");
    setLugar(null);
    setError(null);
  };

  const seleccionarCategoria = (id: string) => {
    setIdCategoria(id);
    setIdBanda("");
    setLugar(null);
    setError(null);
  };

  const avanzar = () => {
    if (!puedeAvanzar || paso >= 3) return;
    setError(null);
    setPaso((p) => (p + 1) as PasoWizard);
  };

  const retroceder = () => {
    setError(null);
    if (paso === 0) return;
    setPaso((p) => (p - 1) as PasoWizard);
  };

  const guardar = async () => {
    if (!idEventoEfectivo.trim()) {
      setError("Selecciona un evento.");
      return;
    }
    if (!idCategoria || !idBanda) {
      setError("Selecciona categoría y banda.");
      return;
    }
    if (lugar === null) {
      setError("Selecciona un lugar.");
      return;
    }
    if (!copaEditar && lugaresOcupados.has(lugar)) {
      setError("Ese lugar ya está ocupado en esta categoría.");
      return;
    }
    if (!copaEditar && bandasConCopaEnCategoria.has(idBanda)) {
      setError("Esa banda ya tiene una copa asignada en este evento.");
      return;
    }
    if (esSolicitar && !justificacion.trim()) {
      setError("La justificación es obligatoria.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      if (esSolicitar) {
        const perfil = await perfilesServices.current.getUsuarioLogiado();
        await createSolicitudCopa({
          id_foranea_evento: idEventoEfectivo,
          id_foranea_banda: idBanda,
          id_foranea_solicitante: perfil.idPerfil,
          tipo_solicitud_copa: tipo,
          justificacion_solicitud_copa: justificacion.trim(),
          lugar_solicitud_copas: lugar,
          estado: null,
        });
      } else {
        await guardarCopasEventoCategoria(idEventoEfectivo, idCategoria, [
          {
            id_foranea_banda: idBanda,
            lugar,
            tipo,
            id_copas: copaEditar?.id_copas,
          },
        ]);
      }
      onGuardado(idEventoEfectivo);
      onClose();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : esSolicitar
            ? "Error al enviar la solicitud."
            : "Error al guardar.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const renderWizardProgress = () => (
    <nav aria-label="Pasos" className="mb-6 w-full">
      <ol className="flex w-full items-center">
        {WIZARD_PASOS.map((step, i) => {
          const isDone = i < paso;
          const isCurrent = paso === i;
          return (
            <li
              key={step.label}
              className="flex min-w-0 flex-1 items-center last:flex-[0_0_auto]"
            >
              <div className="flex w-full min-w-0 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    isDone && "border-sky-500/80 bg-sky-500/20 text-sky-100",
                    isCurrent &&
                      "border-sky-400 bg-slate-800 text-white ring-2 ring-sky-400/35",
                    !isDone &&
                      !isCurrent &&
                      "border-slate-600 bg-slate-800/60 text-slate-500",
                  )}
                >
                  {isDone ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className="text-center text-[10px] text-slate-400 sm:text-xs">
                  {step.label}
                </span>
              </div>
              {i < WIZARD_PASOS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 min-w-[8px] flex-1",
                    i < paso ? "bg-sky-500/70" : "bg-slate-600",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  const renderContextoWizard = () => {
    const partes: string[] = [];
    if (eventoSeleccionado) partes.push(eventoSeleccionado.LugarEvento);
    if (categoriaSeleccionada) partes.push(categoriaSeleccionada.nombreCategoria);
    if (lugar !== null) partes.push(`${lugar}º lugar`);
    if (!partes.length) return null;
    return (
      <p className="mb-4 text-sm text-slate-400">{partes.join(" · ")}</p>
    );
  };

  const renderWizardPaso = () => {
    if (paso === 0) {
      return (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-100">
            {esSolicitar
              ? "¿En qué evento solicitas la copa?"
              : "¿En qué evento asignas la copa?"}
          </h3>
          <div className="modal-scroll max-h-[45vh] flex flex-col gap-2 overflow-y-auto pr-1">
            {eventosDisponibles!.map((evento) => (
              <button
                key={evento.idEvento}
                type="button"
                onClick={() => seleccionarEvento(evento.idEvento)}
                className={cn(
                  "w-full rounded-lg p-3 text-left transition-colors",
                  idEventoActivo === evento.idEvento
                    ? "bg-sky-600 ring-2 ring-sky-400"
                    : "bg-slate-700 hover:bg-slate-600",
                )}
              >
                <span className="font-semibold text-slate-100">
                  {evento.LugarEvento}
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (paso === 1) {
      return (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-100">
            Elige la categoría
          </h3>
          {renderContextoWizard()}
          {cargando ? (
            <p className="text-slate-300">Cargando categorías…</p>
          ) : !categoriasConBandas.length ? (
            <p className="rounded-lg bg-slate-800/60 p-4 text-sm text-slate-300">
              No hay categorías con bandas confirmadas en este evento.
            </p>
          ) : (
            <div className="modal-scroll max-h-[45vh] flex flex-col gap-2 overflow-y-auto pr-1">
              {categoriasConBandas.map((cat) => (
                <button
                  key={cat.idCategoria}
                  type="button"
                  onClick={() => seleccionarCategoria(cat.idCategoria)}
                  className={cn(
                    "w-full rounded-lg p-3 text-left text-base font-semibold transition-colors",
                    idCategoria === cat.idCategoria
                      ? "bg-sky-600 ring-2 ring-sky-400"
                      : "bg-slate-700 hover:bg-slate-600",
                  )}
                >
                  {cat.nombreCategoria}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (paso === 2) {
      return (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-100">
            ¿Qué lugar ocupa la copa?
          </h3>
          {renderContextoWizard()}
          <SelectorLugarCopa
            lugarSeleccionado={lugar}
            lugaresOcupados={Array.from(lugaresOcupados)}
            onSeleccionar={setLugar}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-slate-100">
          ¿Qué banda recibe la copa?
        </h3>
        {renderContextoWizard()}
        {!bandasSeleccionables.length ? (
          <p className="rounded-lg bg-slate-800/60 p-4 text-sm text-slate-300">
            No quedan bandas sin copa en esta categoría.
          </p>
        ) : (
          <div className="modal-scroll max-h-[35vh] flex flex-col gap-2 overflow-y-auto pr-1">
            {bandasSeleccionables.map((banda) => (
              <button
                key={banda.idBanda}
                type="button"
                onClick={() => {
                  setIdBanda(banda.idBanda);
                  setError(null);
                }}
                className={cn(
                  "w-full rounded-lg p-3 text-left text-base font-semibold transition-colors",
                  idBanda === banda.idBanda
                    ? "bg-sky-600 ring-2 ring-sky-400"
                    : "bg-slate-700 hover:bg-slate-600",
                )}
              >
                {banda.nombreBanda}
              </button>
            ))}
          </div>
        )}
        <label className="block text-sm text-slate-400">
          Tipo
          <select
            className={`${selectBaseClass} mt-1`}
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "directo" | "desempate")}
          >
            <option value="directo">Directo</option>
            <option value="desempate">Desempate</option>
          </select>
        </label>
        {esSolicitar ? (
          <label className="block text-sm text-slate-400">
            Justificación *
            <textarea
              className={`${selectBaseClass} mt-1 min-h-[100px] resize-y`}
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Describe el motivo de la solicitud"
              required
            />
          </label>
        ) : null}
      </div>
    );
  };

  const renderFormularioEdicion = () => (
    <>
      {cargando ? (
        <p className="text-slate-300">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-4">
          <label className="block text-sm text-slate-400">
            Categoría
            <select
              className={`${selectBaseClass} mt-1`}
              value={idCategoria}
              onChange={(e) => {
                setIdCategoria(e.target.value);
                setIdBanda("");
              }}
              disabled={!idEventoEfectivo}
            >
              <option value="">
                {!idEventoEfectivo
                  ? "Selecciona evento primero"
                  : "Selecciona categoría"}
              </option>
              {categoriasConBandas.map((c) => (
                <option key={c.idCategoria} value={c.idCategoria}>
                  {c.nombreCategoria}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-400">
            Banda
            <div className="mt-1">
              <ComboBoxBandas
                bandas={bandasSeleccionables}
                value={idBanda}
                onChange={setIdBanda}
                disabled={
                  !idEventoEfectivo ||
                  !idCategoria ||
                  bandasSeleccionables.length === 0
                }
                placeholder={
                  !idCategoria
                    ? "Selecciona categoría primero"
                    : bandasSeleccionables.length === 0
                      ? "No quedan bandas sin copa en esta categoría"
                      : "Selecciona banda"
                }
                emptyLabel="No quedan bandas sin copa en esta categoría"
              />
            </div>
          </label>

          <label className="block text-sm text-slate-400">
            Lugar
            <select
              className={`${selectBaseClass} mt-1`}
              value={lugar ?? 1}
              onChange={(e) => setLugar(Number(e.target.value))}
              disabled={!idEventoEfectivo || !idCategoria}
            >
              {LUGARES.map((n) => {
                const ocupado = lugaresOcupados.has(n);
                return (
                  <option key={n} value={n} disabled={ocupado}>
                    {n}º lugar
                    {ocupado ? " (ocupado)" : ""}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="block text-sm text-slate-400">
            Tipo
            <select
              className={`${selectBaseClass} mt-1`}
              value={tipo}
              onChange={(e) =>
                setTipo(e.target.value as "directo" | "desempate")
              }
            >
              <option value="directo">Directo</option>
              <option value="desempate">Desempate</option>
            </select>
          </label>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={guardando}
          className="rounded-lg border border-slate-500 px-6 py-2.5 font-semibold text-slate-200"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => void guardar()}
          disabled={guardando || cargando || !idEventoEfectivo.trim()}
          className="rounded-lg bg-sky-600 px-6 py-2.5 font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">
        {copaEditar
          ? "Editar copa"
          : esSolicitar
            ? "Solicitar copa"
            : "Agregar copa"}
      </h2>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {esAgregarWizard ? (
        <>
          {renderWizardProgress()}
          {renderWizardPaso()}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex gap-3">
              {paso > 0 && (
                <button
                  type="button"
                  onClick={retroceder}
                  disabled={guardando}
                  className="rounded-lg border border-slate-500 px-5 py-2.5 font-semibold text-slate-200"
                >
                  Atrás
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={guardando}
                className="rounded-lg border border-slate-500 px-5 py-2.5 font-semibold text-slate-200"
              >
                Cancelar
              </button>
            </div>
            {paso < 3 ? (
              <button
                type="button"
                onClick={avanzar}
                disabled={!puedeAvanzar}
                className="rounded-lg bg-sky-600 px-6 py-2.5 font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void guardar()}
                disabled={
                  guardando ||
                  !idBanda ||
                  (esSolicitar && !justificacion.trim())
                }
                className="rounded-lg bg-sky-600 px-6 py-2.5 font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
              >
                {guardando
                  ? esSolicitar
                    ? "Enviando…"
                    : "Guardando…"
                  : esSolicitar
                    ? "Enviar solicitud"
                    : "Guardar"}
              </button>
            )}
          </div>
        </>
      ) : (
        renderFormularioEdicion()
      )}
    </div>
  );
}
