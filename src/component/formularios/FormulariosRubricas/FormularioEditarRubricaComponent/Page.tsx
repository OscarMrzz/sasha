"use client";

import React, { useState, useEffect, useRef } from "react";

import {
  rubricaInterface,
  perfilDatosAmpleosInterface,
  categoriaInterface,
  rubricaDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import PerfilesServices from "@/lib/services/perfilesServices";
import RubricasServices, {
  mensajeRubricaDuplicada,
} from "@/lib/services/rubricasServices";
import CategoriasServices from "@/lib/services/categoriaServices";
import { useDispatch } from "react-redux";
import { activarRefrescarDataRubricas } from "@/feacture/RefrescadorData/refrescadorDataSlice";
import { setRubricaSeleccionada } from "@/feacture/Rubrica/rubricaSlice";

type Props = {
  rubricaAEditar: rubricaInterface;
  refresacar?: () => void | Promise<void>;
  onClose: () => void;
};

const inputBaseClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition focus:border-primario/80 focus:bg-white/[0.07] focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";


export default function FormularioEditarRubricaComponent({
  refresacar,
  onClose,
  rubricaAEditar,
}: Props) {
  const [categoriasList, setCategoriasList] = useState<categoriaInterface[]>(
    []
  );
  const dispatch = useDispatch();
  const rubricasServiceRef = useRef(new RubricasServices());

  const [loadingCategorias, setLoadingCategorias] = useState(true);

  const [formData, setFormData] = useState({
    nombreRubrica: "",
    datalleRubrica: "",
    puntosRubrica: 0,
    idForaneaCategoria: "",
    idForaneaFederacion: "",
    versionRubrica: "",
  });

  const [loading, setLoading] = useState(false);
  const [mensajeDuplicado, setMensajeDuplicado] = useState("");
  const [errorMensaje, setErrorMensaje] = useState("");
  const [verificandoDuplicado, setVerificandoDuplicado] = useState(false);
  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface>(
    {} as perfilDatosAmpleosInterface
  );

  useEffect(() => {
    const perfilesServices = new PerfilesServices();
    perfilesServices.getUsuarioLogiado().then((perfil) => {
      if (perfil) {
        setPerfil(perfil);
      }
    });
  }, []);

  useEffect(() => {
    if (rubricaAEditar) {
      cargarFormulario();
    }
  }, []);

  const cargarFormulario = () => {
    setFormData({
      nombreRubrica: rubricaAEditar.nombreRubrica,
      datalleRubrica: rubricaAEditar.datalleRubrica,
      puntosRubrica: rubricaAEditar.puntosRubrica,
      idForaneaCategoria: rubricaAEditar.idForaneaCategoria,
      idForaneaFederacion: rubricaAEditar.idForaneaFederacion,
      versionRubrica: rubricaAEditar.versionRubrica,
    });
  };

  useEffect(() => {
    setLoadingCategorias(true);

    const categoriasServices = new CategoriasServices();
    categoriasServices
      .get()
      .then((categorias) => {
        setCategoriasList(categorias);
      })
      .catch((error) => {
        console.error("❌ Error al obtener las categorías:", error);
      })
      .finally(() => {
        setLoadingCategorias(false);
      });
  }, []);

  useEffect(() => {
    const { nombreRubrica, idForaneaCategoria, versionRubrica } = formData;

    if (!nombreRubrica.trim() || !idForaneaCategoria || !versionRubrica.trim()) {
      setMensajeDuplicado("");
      return;
    }

    let cancelado = false;
    setVerificandoDuplicado(true);

    rubricasServiceRef.current
      .existeRubricaDuplicada(
        nombreRubrica.trim(),
        idForaneaCategoria,
        versionRubrica.trim(),
        rubricaAEditar.idRubrica
      )
      .then((duplicada) => {
        if (cancelado) return;

        if (!duplicada) {
          setMensajeDuplicado("");
          return;
        }

        const nombreCategoria =
          categoriasList.find((c) => c.idCategoria === idForaneaCategoria)
            ?.nombreCategoria ?? "seleccionada";

        setMensajeDuplicado(
          mensajeRubricaDuplicada(
            nombreRubrica.trim(),
            nombreCategoria,
            versionRubrica.trim()
          )
        );
      })
      .catch(() => {
        if (!cancelado) setMensajeDuplicado("");
      })
      .finally(() => {
        if (!cancelado) setVerificandoDuplicado(false);
      });

    return () => {
      cancelado = true;
    };
  }, [
    formData.nombreRubrica,
    formData.idForaneaCategoria,
    formData.versionRubrica,
    categoriasList,
    rubricaAEditar.idRubrica,
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setErrorMensaje("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mensajeDuplicado) return;

    setLoading(true);
    setErrorMensaje("");

    try {
      const rubricaService = new RubricasServices();
      await rubricaService.initPerfil();
      const nuevaRubrica: Omit<rubricaInterface, "idRubrica" | "created_at"> = {
        nombreRubrica: formData.nombreRubrica.trim(),
        datalleRubrica: formData.datalleRubrica,
        puntosRubrica: formData.puntosRubrica,
        idForaneaCategoria: formData.idForaneaCategoria,
        idForaneaFederacion: perfil.idForaneaFederacion || "",
        versionRubrica: formData.versionRubrica.trim(),
      };

      const returned = (await rubricaService.update(
        rubricaAEditar.idRubrica,
        nuevaRubrica as rubricaInterface
      )) as rubricaInterface;

      const prev = rubricaAEditar as unknown as rubricaDatosAmpleosInterface;
      dispatch(
        setRubricaSeleccionada({
          ...prev,
          ...returned,
          categorias: prev.categorias,
          federaciones: prev.federaciones,
        })
      );

      setFormData({
        nombreRubrica: "",
        datalleRubrica: "",
        puntosRubrica: 0,
        idForaneaCategoria: "",
        idForaneaFederacion: "",
        versionRubrica: "",
      });

      if (refresacar) {
        await refresacar();
      } else {
        dispatch(activarRefrescarDataRubricas());
      }
      onClose();
    } catch (error) {
      console.error("❌ Error al editar la Rubrica:", error);
      const mensaje =
        error instanceof Error ? error.message : "Error al editar la rúbrica";
      setErrorMensaje(mensaje);
    } finally {
      setLoading(false);
    }
  };
  const onClickCancelar=()=>{
      setFormData({
        nombreRubrica: "",
        datalleRubrica: "",
        puntosRubrica: 0,
        idForaneaCategoria: "",
        idForaneaFederacion: "",
        versionRubrica: "",
      });
    onClose();
  }

  return (
    <div className="p-2 lg:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Editar rúbrica</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Actualizar rúbrica</h2>
          <p className="mt-2 text-sm text-white/55">Modifica la información base y guarda cambios.</p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit} aria-label="formulario para editar rubrica">
            <div>
              <label className={labelClass} htmlFor="nombreRubrica">
                Nombre <span className="text-primario">*</span>
              </label>
              <input
                type="text"
                id="nombreRubrica"
                name="nombreRubrica"
                value={formData.nombreRubrica}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Ej. Evaluación temporada"
                required
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="versionRubrica">
                  Versión <span className="text-primario">*</span>
                </label>
                <input
                  type="text"
                  id="versionRubrica"
                  name="versionRubrica"
                  value={formData.versionRubrica ?? ""}
                  onChange={handleInputChange}
                  className={inputBaseClass}
                  placeholder="Ej. 2026.1"
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="puntosRubrica">
                  Puntos (%) <span className="text-primario">*</span>
                </label>
                <input
                  type="number"
                  id="puntosRubrica"
                  name="puntosRubrica"
                  value={formData.puntosRubrica}
                  onChange={handleInputChange}
                  className={inputBaseClass}
                  min={-100}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="datalleRubrica">
                Detalles <span className="text-primario">*</span>
              </label>
              <input
                type="text"
                id="datalleRubrica"
                name="datalleRubrica"
                value={formData.datalleRubrica}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Describe la rúbrica"
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="idForaneaCategoria">
                Categoría <span className="text-primario">*</span>
              </label>
              <select
                id="idForaneaCategoria"
                name="idForaneaCategoria"
                value={formData.idForaneaCategoria}
                onChange={handleInputChange}
                className={inputBaseClass}
                required
              >
                {loadingCategorias ? (
                  <option className="bg-slate-800 text-slate-100" value="" disabled>
                    Cargando categorías...
                  </option>
                ) : (
                  <>
                    <option className="bg-slate-800 text-slate-100" value="">
                      Seleccione una categoría
                    </option>
                    {categoriasList.map((cat) => (
                      <option className="bg-slate-800 text-slate-100" key={cat.idCategoria} value={cat.idCategoria}>
                        {cat.nombreCategoria}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {mensajeDuplicado ? (
              <p className="text-sm text-red-400" role="alert">
                {mensajeDuplicado}
              </p>
            ) : null}

            {errorMensaje ? (
              <p className="text-sm text-red-400" role="alert">
                {errorMensaje}
              </p>
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
                disabled={loading || verificandoDuplicado || Boolean(mensajeDuplicado)}
                className="rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/50 disabled:shadow-none"
              >
                {loading
                  ? "Guardando…"
                  : verificandoDuplicado
                    ? "Verificando…"
                    : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
