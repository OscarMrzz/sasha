"use client";

import { ComboBoxCategorias } from "@/components/ComboBox/ComboBoxCategorias";
import CardRubricaConsulta from "@/components/rubricas/CardRubricaConsulta";
import type {
  categoriaDatosAmpleosInterface,
  categoriaInterface,
  perfilDatosAmpleosInterface,
} from "@/models";
import { obtenerRubricasCompletas } from "@/actions/obtenerRubricasCompletas";
import CategoriasServices from "@/services/categoriaServices";
import PerfilesServices from "@/services/perfilesServices";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

type TablaRubricasConsultaProps = {
  titulo?: string;
  mostrarFiltroCategorias?: boolean;
  idCategoriaFija?: string;
  idForaneaFederacionFija?: string;
  nombreCategoriaFija?: string;
};

const labelClassName =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--app-fg-muted)]";

const emptyBoxClass =
  "rounded-xl border border-dashed border-[var(--vz-border-strong)] bg-white px-4 py-8 text-center text-sm text-[var(--app-fg-muted)]";

export default function TablaRubricasConsulta({
  titulo = "Rúbricas",
  mostrarFiltroCategorias = true,
  idCategoriaFija,
  idForaneaFederacionFija,
  nombreCategoriaFija,
}: TablaRubricasConsultaProps) {
  const perfilesServices = useRef(new PerfilesServices());
  const categoriasServices = useRef(new CategoriasServices());

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(
    idCategoriaFija?.trim() ?? "",
  );

  useEffect(() => {
    if (idCategoriaFija?.trim()) {
      setCategoriaSeleccionada(idCategoriaFija.trim());
    }
  }, [idCategoriaFija]);

  const { data: perfil } = useQuery({
    queryKey: ["rubricas-consulta", "perfil"],
    queryFn: () => perfilesServices.current.getUsuarioLogiado(),
    enabled: !idForaneaFederacionFija?.trim(),
  });

  const idFederacion =
    idForaneaFederacionFija?.trim() ||
    (perfil as perfilDatosAmpleosInterface | undefined)?.idForaneaFederacion ||
    "";

  const { data: categoriasList = [] as categoriaDatosAmpleosInterface[] } =
    useQuery({
      queryKey: ["rubricas-consulta", "categorias"],
      queryFn: () => categoriasServices.current.getDatosAmpleos(),
      enabled: mostrarFiltroCategorias,
    });

  const categoriasParaCombo: categoriaInterface[] = useMemo(
    () => categoriasList,
    [categoriasList],
  );

  const idCategoriaConsulta = idCategoriaFija?.trim() || categoriaSeleccionada;
  const requiereCategoria = mostrarFiltroCategorias || !!idCategoriaFija?.trim();
  const filtrosListos =
    !!idFederacion.trim() &&
    (!requiereCategoria || !!idCategoriaConsulta.trim());

  const {
    data: rubricas = [],
    isFetching: cargandoRubricas,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "rubricas-consulta",
      "completas",
      idFederacion,
      idCategoriaConsulta,
    ],
    queryFn: () =>
      obtenerRubricasCompletas(
        idFederacion,
        idCategoriaConsulta || undefined,
      ),
    enabled: filtrosListos,
  });

  const nombreCategoriaActiva = useMemo(() => {
    if (nombreCategoriaFija?.trim()) return nombreCategoriaFija.trim();
    const cat = categoriasParaCombo.find(
      (c) => c.idCategoria === idCategoriaConsulta,
    );
    return cat?.nombreCategoria ?? "";
  }, [
    nombreCategoriaFija,
    categoriasParaCombo,
    idCategoriaConsulta,
  ]);

  const totalCriterios = useMemo(
    () =>
      rubricas.reduce(
        (acc, r) => acc + (r.criteriosEvalucion?.length ?? 0),
        0,
      ),
    [rubricas],
  );

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-8">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--app-fg)]">
            {titulo}
          </h1>
          {filtrosListos && !cargandoRubricas ? (
            <span className="rounded-full border border-[var(--vz-border)] bg-[#f5f5f5] px-3 py-0.5 text-xs font-medium text-[var(--app-fg)]">
              {rubricas.length} rúbrica{rubricas.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
        <p className="text-sm text-[var(--app-fg-muted)]">
          {mostrarFiltroCategorias
            ? "Consulta las rúbricas con todos sus criterios y niveles de cumplimiento."
            : nombreCategoriaActiva
              ? `Rúbricas de la categoría ${nombreCategoriaActiva}.`
              : "Rúbricas de tu categoría."}
        </p>
      </header>

      {mostrarFiltroCategorias ? (
        <div className="max-w-md">
          <label htmlFor="filtro-categoria-rubricas" className={labelClassName}>
            Categoría
          </label>
          <ComboBoxCategorias
            id="filtro-categoria-rubricas"
            categorias={categoriasParaCombo}
            value={categoriaSeleccionada}
            onChange={setCategoriaSeleccionada}
            placeholder="Selecciona una categoría"
            emptyLabel="No hay categorías disponibles"
          />
        </div>
      ) : null}

      {!idFederacion.trim() ? (
        <p className={emptyBoxClass}>
          No se pudo determinar la federación del usuario.
        </p>
      ) : null}

      {idFederacion.trim() && requiereCategoria && !idCategoriaConsulta.trim() ? (
        <p className={emptyBoxClass}>
          Selecciona una categoría para ver las rúbricas.
        </p>
      ) : null}

      {filtrosListos && cargandoRubricas ? (
        <p className="text-center text-sm text-[var(--app-fg-muted)]">Cargando rúbricas…</p>
      ) : null}

      {filtrosListos && isError ? (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-800">
          {error instanceof Error
            ? error.message
            : "No se pudieron cargar las rúbricas."}
        </p>
      ) : null}

      {filtrosListos && !cargandoRubricas && !isError && rubricas.length === 0 ? (
        <p className={emptyBoxClass}>
          No hay rúbricas registradas
          {nombreCategoriaActiva ? ` para ${nombreCategoriaActiva}` : ""}.
        </p>
      ) : null}

      {filtrosListos && !cargandoRubricas && rubricas.length > 0 ? (
        <p className="text-xs text-[var(--app-fg-muted)]">
          {totalCriterios} criterio{totalCriterios === 1 ? "" : "s"} en total
        </p>
      ) : null}

      <div className="flex w-full flex-col gap-8">
        {filtrosListos && !cargandoRubricas && !isError
          ? rubricas.map((rubrica, indice) => (
              <CardRubricaConsulta
                key={rubrica.idRubrica}
                rubrica={rubrica}
                indice={indice}
              />
            ))
          : null}
      </div>
    </div>
  );
}
