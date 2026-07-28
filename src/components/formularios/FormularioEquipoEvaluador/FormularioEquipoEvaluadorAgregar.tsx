"use client";

import React, { useState, useEffect, useMemo } from "react";

import {
  perfilDatosAmpleosInterface,
  registroEquipoEvaluadorDatosAmpleosInterface,
  registroEquipoEvaluadorInterface,
  rubricaDatosAmpleosInterface,
} from "@/models";
import PerfilesServices from "@/services/perfilesServices";

import RegistroEquipoEvaluadorServices from "@/services/registroEquipoEvaluadorServices";
import RubricasServices from "@/services/rubricasServices";
import { rubricasDisponiblesParaJurado } from "@/helpers/utils/rubricasDisponibles";

type Props = {
  refresacar?: () => void;
  onClose: () => void;
  idEvento: string;
  /** Filtra perfiles por rol (ej. "jurado", "fiscal") */
  rolFiltro?: string;
};

const inputBaseClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition focus:border-primario/80 focus:bg-white/[0.07] focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";

export default function FormularioEquipoEvaluadorAgregar({ refresacar, onClose, idEvento, rolFiltro }: Props) {
  const [formData, setFormData] = useState({
    idForaneaPerfil: "",
    id_foranea_rubrica: "",
  });

  const [loading, setLoading] = useState(false);
  const [listaPerfiles, setListaPerfiles] = useState<perfilDatosAmpleosInterface[]>([]);
  const [equipoEvaluador, setEquipoEvaluador] = useState<registroEquipoEvaluadorDatosAmpleosInterface[]>([]);
  const [listaRubricas, setListaRubricas] = useState<rubricaDatosAmpleosInterface[]>([]);
  const [cargadorPerfiles, setCargadorPerfiles] = useState(true);
  const [cargadorRubricas, setCargadorRubricas] = useState(false);

  const perfilSeleccionado = listaPerfiles.find((p) => p.idPerfil === formData.idForaneaPerfil);
  const esJurado = perfilSeleccionado?.roles?.nombreRol === "jurado";

  const rubricasDisponibles = useMemo(
    () => rubricasDisponiblesParaJurado(listaRubricas, equipoEvaluador),
    [equipoEvaluador, listaRubricas],
  );

  useEffect(() => {
    cargarListaPerfiles();
  }, [idEvento, rolFiltro]);

  useEffect(() => {
    if (!esJurado) {
      setFormData((prev) => ({ ...prev, id_foranea_rubrica: "" }));
      return;
    }
    const cargarRubricas = async () => {
      setCargadorRubricas(true);
      try {
        const rubricasServices = new RubricasServices();
        const rubricas = await rubricasServices.getDatosAmpleos();
        setListaRubricas(rubricas);
      } catch (error) {
        console.error("❌ Error cargando rúbricas:", error);
        setListaRubricas([]);
      } finally {
        setCargadorRubricas(false);
      }
    };
    void cargarRubricas();
  }, [esJurado]);

  useEffect(() => {
    if (!esJurado || !formData.id_foranea_rubrica) return;
    const disponible = rubricasDisponibles.some((r) => r.idRubrica === formData.id_foranea_rubrica);
    if (!disponible) {
      setFormData((prev) => ({ ...prev, id_foranea_rubrica: "" }));
    }
  }, [esJurado, formData.id_foranea_rubrica, rubricasDisponibles]);

  const cargarListaPerfiles = async () => {
    setCargadorPerfiles(true);
    try {
      const perfilesServices = new PerfilesServices();
      const registroEquipoEvaluadorServices = new RegistroEquipoEvaluadorServices();
      const registrosEquipoEvaluador = await registroEquipoEvaluadorServices.getDatosAmpleos(idEvento);
      setEquipoEvaluador(registrosEquipoEvaluador);
      const idsYaRegistrados = new Set(registrosEquipoEvaluador.map((registro) => registro.idForaneaPerfil));

      const perfilLogiado = await perfilesServices.getUsuarioLogiado();
      const idFederacion =
        (perfilLogiado as perfilDatosAmpleosInterface)?.idForaneaFederacion ||
        (perfilLogiado as perfilDatosAmpleosInterface)?.federaciones?.idFederacion ||
        "";
      if (!idFederacion) {
        throw new Error("Perfil sin federación asignada");
      }
      const perfiles = await perfilesServices.getEquipoEvaluador(idFederacion);
      const perfilesFiltrados = perfiles
        .filter((p) => !idsYaRegistrados.has(p.idPerfil))
        .filter((p) => (rolFiltro ? p.roles?.nombreRol === rolFiltro : true));
      setListaPerfiles(perfilesFiltrados);
    } catch (error) {
      console.error("❌ Error fetching perfiles by federacion:", error);
      setListaPerfiles([]);
    } finally {
      setCargadorPerfiles(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const registroEquipoEvaluadorServices = new RegistroEquipoEvaluadorServices();
      const nuevaRegsitroEquipoEvaluador: Omit<registroEquipoEvaluadorInterface, "idRegistroEvaluador" | "created_at"> = {
        idForaneaEvento: idEvento,
        idForaneaPerfil: formData.idForaneaPerfil,
        id_foranea_rubrica: esJurado ? formData.id_foranea_rubrica : null,
      };

      await registroEquipoEvaluadorServices.create(nuevaRegsitroEquipoEvaluador as registroEquipoEvaluadorInterface);
      setFormData({
        idForaneaPerfil: "",
        id_foranea_rubrica: "",
      });
    } catch (error) {
      console.error("❌ Error al crear la Registro Equipo evaluador:", error);
      const mensaje =
        error instanceof Error ? error.message : "Error al agregar la miembro del equipo evaluador";
      alert(mensaje);
    } finally {
      setLoading(false);

      await refresacar?.();
      onClose();
    }
  };

  const onClickCancelar = () => {
    setFormData({
      idForaneaPerfil: "",
      id_foranea_rubrica: "",
    });
    onClose();
  };

  const tituloRol =
    rolFiltro === "jurado"
      ? "jurado"
      : rolFiltro === "fiscal"
        ? "fiscal"
        : rolFiltro === "responsable de mesa"
          ? "responsable de mesa"
          : "miembro";

  return (
    <div className="p-2 lg:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Equipo evaluador</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Agregar {tituloRol}</h2>
          <p className="mt-2 text-sm text-white/55">
            Selecciona un perfil para agregarlo al equipo evaluador del evento.
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit} aria-label="formulario para agregar miembro equipo evaluador">
            <div>
              <label className={labelClass} htmlFor="idForaneaPerfil">
                Usuario <span className="text-primario">*</span>
              </label>
              <select
                id="idForaneaPerfil"
                name="idForaneaPerfil"
                value={formData.idForaneaPerfil}
                onChange={handleInputChange}
                className={inputBaseClass}
                required
                disabled={cargadorPerfiles || loading}
              >
                <option className="bg-slate-800 text-slate-100" value="">
                  {cargadorPerfiles ? "Cargando…" : "Selecciona un perfil"}
                </option>
                {listaPerfiles.map((perfil) => (
                  <option className="bg-slate-800 text-slate-100" key={perfil.idPerfil} value={perfil.idPerfil}>
                    {perfil.nombre}
                    {perfil.roles?.nombreRol ? ` (${perfil.roles.nombreRol})` : ""}
                  </option>
                ))}
              </select>
              {!cargadorPerfiles && listaPerfiles.length === 0 && (
                <p className="mt-2 text-sm text-white/55">No hay perfiles disponibles para agregar.</p>
              )}
            </div>

            {esJurado ? (
              <div>
                <label className={labelClass} htmlFor="id_foranea_rubrica">
                  Rúbrica <span className="text-primario">*</span>
                </label>
                <select
                  id="id_foranea_rubrica"
                  name="id_foranea_rubrica"
                  value={formData.id_foranea_rubrica}
                  onChange={handleInputChange}
                  className={inputBaseClass}
                  required
                  disabled={cargadorRubricas || loading}
                >
                  <option className="bg-slate-800 text-slate-100" value="">
                    {cargadorRubricas
                      ? "Cargando…"
                      : rubricasDisponibles.length === 0
                        ? "No hay rúbricas disponibles"
                        : "Selecciona una rúbrica"}
                  </option>
                  {rubricasDisponibles.map((rubrica) => (
                    <option className="bg-slate-800 text-slate-100" key={rubrica.idRubrica} value={rubrica.idRubrica}>
                      {rubrica.nombreRubrica} · {rubrica.categorias?.nombreCategoria ?? "—"}
                    </option>
                  ))}
                </select>
                {!cargadorRubricas && rubricasDisponibles.length === 0 ? (
                  <p className="mt-2 text-sm text-white/55">
                    Todas las rúbricas ya están asignadas a otros jurados en este evento.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onClickCancelar}
                className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  cargadorPerfiles ||
                  !formData.idForaneaPerfil ||
                  (esJurado && !formData.id_foranea_rubrica)
                }
                className="rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/50 disabled:shadow-none"
              >
                {loading ? "Guardando…" : "Agregar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
