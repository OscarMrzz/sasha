"use client";

import { useEffect, useState } from "react";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";
import React from "react";
import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import { PlusIcon, ArrowUpTrayIcon } from "@heroicons/react/16/solid";
import {
  categoriaInterface,
  rubricaDatosAmpleosInterface,
} from "@/models";
import RubricasServices from "@/services/rubricasServices";

import FormularioAgregarRubricaComponent from "@/components/formularios/FormulariosRubricas/FormularioAgregarRubricaComponent/Page";
import FormularioCargarPaqueteRubrica from "@/components/formularios/FormulariosRubricas/FormularioCargarPaqueteRubrica/Page";
import TablaRubricasComponent from "@/components/Tablas/tablaRubricasComponent/Page";
import CategoriasServices from "@/services/categoriaServices";
import FormularioAgregarCriterioComponet from "@/components/formularios/FormularioCriterio/FormularioAgregarCriterioComponent/FormularioAgregarCriterioComponet";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import {
  activarOverleyFormularioAgregarRubrica,
  activarOverleyFormularioEditarCriterio,
  activarOverleyFormularioEditarCumplimiento,
  activarOverleyFormularioEditarRubrica,
  activarOverleyCriteriosFormularioAgregar,
  activarOverleyInformacionRubrica,
  desactivarOverleyCriteriosFormularioAgregar,
  desactivarOverleyCumplimientoFormularioAgregar,
  desactivarOverleyFormularioAgregarRubrica,
  desactivarOverleyFormularioEditarCriterio,
  desactivarOverleyFormularioEditarCumplimiento,
  desactivarOverleyFormularioEditarRubrica,
  desactivarOverleyInformacionCriterio,
  desactivarOverleyInformacionCumplimiento,
  desactivarOverleyInformacionRubrica,
} from "@/features/overleys/overleySlice";
import OverleyModal from "@/components/modales/OverleyModal/Page";
import InformacionRubricaComponent from "@/components/informacion/informacionRubricaComponent/Page";
import FormularioEditarRubricaComponent from "@/components/formularios/FormulariosRubricas/FormularioEditarRubricaComponent/Page";
import { activarRefrescarDataRubricas, desactivarRefrescarDataRubricas } from "@/features/RefrescadorData/refrescadorDataSlice";
import { setRubricaSeleccionada } from "@/features/Rubrica/rubricaSlice";
import ConfirmDeleteModal from "@/components/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import InformacionCriterioComponent from "@/components/informacion/informacionCriterioComponent/InformacionCriterioComponet";
import FormularioEditarCriterioComponet from "@/components/formularios/FormularioCriterio/FormilarioEditarCriterioComponent/FormularioEditarCirterioComponent";
import InformacionCumplimientoComponent from "@/components/informacion/informacionCumplimientoComponet/InformacionCumplimientoComponent";
import FormularioAgregarCumplimientoComponet from "@/components/formularios/Cumplimientos/agregar/formularioAgregarCumplimiento";
import FormularioEditarCumplimientoComponet from "@/components/formularios/Cumplimientos/editar/formularioEditarCumplimientoComponet";
import BuscadorRow from "@/components/buscadores/BuscadorRow";
import useAtajoPagina from "@/hooks/useAtajoPagina";
import CriteriosServices from "@/services/criteriosServices";
import { criterioEvaluacionDatosAmpleosInterface } from "@/models";

const selectBaseClass =
  "field-select h-11 w-full rounded-lg border px-3 text-sm transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

export default function RubricaHomeContent() {
  const dispatch = useDispatch();

  /* ---------------Rubricas  */
  const refrescadorDataRubricas = useSelector(
    (state: RootState) => state.refrescadorData.RefrescadorDataRubricas
  );
  const activarOverleyFormularioAgregarRubricaValue = useSelector(
    (state: RootState) =>
      state.overley.activarOverleyFormularioAgregarRubrica
  );


  const activadorInformacionRubrica = useSelector(
    (state: RootState) => state.overley.activadorOverleyInformacionRubrica
  );
  const activadorOverleyFormularioEditar = useSelector(
    (state: RootState) => state.overley.activadorOverleyFormularioEditarRubrica
  );
  const rubricaSeleccionada = useSelector(
    (state: RootState) => state.rubrica.RubricaSeleccionada
  );

  /* --------------------Criterios ------------------- */



  const activadorInformacionCriterio = useSelector((state: RootState) => state.overley.activadorOverleyInformacionCriterio);
 
  const activadorOverleyFormularioAgregarCriterios = useSelector((state: RootState) =>state.overley.activadorOverleyFormularioAgregarCriterios);

  const criterioSeleccionado = useSelector((state: RootState) => state.criterio.CriterioSeleccionado);
  const activadorFormularioEditarCriterio = useSelector((state: RootState) => state.overley.activadorOverleyFormularioEditarCriterios);
  /*  ------------------- 03 cumplimiento --------------------- */
  
  const activadorInformacionCumplimiento = useSelector((state: RootState) => state.overley.activadorOverleyInformacionCumplimiento);
 
  const activadorOverleyFormularioAgregarCumplimiento = useSelector((state: RootState) =>state.overley.activadorOverleyFormularioAgregarCumplimiento);

  const cumplimientoSeleccionado = useSelector((state: RootState) => state.cumplimiento.CumplimientoSeleccionado);
  const activadorFormularioEditarCumplimiento = useSelector((state: RootState) => state.overley.activadorOverleyFormularioEditarCumplimiento);


  const [versionesList, setVersionesList] = useState<string[]>([]);
  const [versionSeleccionada, setVersionSeleccionada] = useState<string>("");




  const [rubricas, setRubricas] = useState<rubricaDatosAmpleosInterface[]>([]);
  
  const [rubricasOriginales, setRubricasOriginales] = useState<
    rubricaDatosAmpleosInterface[]
  >([]);
  const [openConfirmEliminarRubrica, setOpenConfirmEliminarRubrica] = useState(false);
  const [rubricaParaEliminar, setRubricaParaEliminar] = useState<rubricaDatosAmpleosInterface | null>(null);
  const [criteriosCountPorRubrica, setCriteriosCountPorRubrica] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [cargandoFiltros, setCargadoFiltros] = useState(false);
  const [categoriasLista, setCategoriasLista] = useState<categoriaInterface[]>(
    []
  );
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>("");
  const [openModalCargarPaquete, setOpenModalCargarPaquete] = useState(false);

  const abrirFormularioAgregar = () => {
    dispatch(activarOverleyFormularioAgregarRubrica());
  };

  useAtajoPagina("agregar", abrirFormularioAgregar);

  const abrirFormularioAgregarCriterio = () => {
    dispatch(activarOverleyCriteriosFormularioAgregar());
  };

  const abrirModalCargarPaquete = () => {
    setOpenModalCargarPaquete(true);
  };

  const cerrarModalCargarPaquete = () => {
    setOpenModalCargarPaquete(false);
  };

  const onVerRubricaDesdeLista = (r: rubricaDatosAmpleosInterface) => {
    dispatch(setRubricaSeleccionada(r));
    dispatch(activarOverleyInformacionRubrica());
  };

  const onEditarRubricaDesdeLista = (r: rubricaDatosAmpleosInterface) => {
    dispatch(setRubricaSeleccionada(r));
    dispatch(activarOverleyFormularioEditarRubrica());
  };

  const onEliminarRubricaDesdeLista = (r: rubricaDatosAmpleosInterface) => {
    dispatch(setRubricaSeleccionada(r));
    setRubricaParaEliminar(r);
    setOpenConfirmEliminarRubrica(true);
  };

  const cerrarConfirmEliminarRubrica = () => {
    setOpenConfirmEliminarRubrica(false);
    setRubricaParaEliminar(null);
  };

  const ejecutarEliminarRubrica = async () => {
    if (!rubricaParaEliminar) return;
    try {
      const svc = new RubricasServices();
      await svc.initPerfil();
      await svc.delete(rubricaParaEliminar.idRubrica);
    } catch (e) {
      console.error("❌ Error al eliminar la rúbrica:", e);
    } finally {
      dispatch(activarRefrescarDataRubricas());
      cerrarConfirmEliminarRubrica();
    }
  };

  useEffect(() => {
    traerDatosTabla();
  }, []);

  useEffect(() => {
    if (refrescadorDataRubricas) {
      traerDatosTabla();
      dispatch(desactivarRefrescarDataRubricas());
    }
  }, [refrescadorDataRubricas]);

  async function traerDatosTabla() {
    const rubricasServices = new RubricasServices();
    try {
      const rubricasData: rubricaDatosAmpleosInterface[] =
        await rubricasServices.getDatosAmpleos();

      // Conteo de criterios por rúbrica (para mostrar en la card row)
      const criteriosServices = new CriteriosServices();
      await criteriosServices.initPerfil();
      const criteriosData = (await criteriosServices.getDatosAmpleos()) as criterioEvaluacionDatosAmpleosInterface[];
      const counts: Record<string, number> = {};
      for (const c of criteriosData || []) {
        if (!c?.idForaneaRubrica) continue;
        counts[c.idForaneaRubrica] = (counts[c.idForaneaRubrica] ?? 0) + 1;
      }
      setCriteriosCountPorRubrica(counts);

      setRubricas(rubricasData);
      setRubricasOriginales(rubricasData);
      setLoading(false);
     
    } catch (error) {
      console.error("❌ Error al obtener las Rubricas:", error);
      setLoading(false);
    } finally {
      setCargadoFiltros(true);
    }
  }

  const cargarFiltros = async () => {
    const categoriasServices = new CategoriasServices();
    try {
      const categoriasData = await categoriasServices.get();
      setCategoriasLista(categoriasData);
    } catch (error) {
      console.error("❌ Error al obtener las Categorias:", error);
    }
  };

  useEffect(() => {
    cargarFiltros();
  }, []);

  const seleccionarCategoria = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const categoriaId = event.target.value;
    setCategoriaSeleccionada(categoriaId);
    filtrarRubricas(categoriaId, versionSeleccionada);
  };

  const filtrarRubricas = (categoriaId: string, version:string) => {
    let rubricasFiltradas = rubricasOriginales;

    if (categoriaId) {
      rubricasFiltradas = rubricasFiltradas.filter(
        (rubrica) => rubrica.categorias.idCategoria === categoriaId
      );
    }
    if (version) {
      rubricasFiltradas = rubricasFiltradas.filter(
        (rubrica) => rubrica.versionRubrica === version
      );
    }
    setRubricas(rubricasFiltradas);
  };

  /* --------------01 Rubricas---------------------- */
  const cerrarFormularioAgregarRubrica = () => {
    dispatch(desactivarOverleyFormularioAgregarRubrica());
  }
    const cerrarInformacionRubrica = () => {
    dispatch(desactivarOverleyInformacionRubrica());
  };
  const cerrarFormularioEditarRubrica = () => {
    dispatch(desactivarOverleyFormularioEditarRubrica());
  }
  const ActivarFormularioEditarRubrica = () => {
    dispatch(activarOverleyFormularioEditarRubrica());
  }

  /* ---------------- 02 Criterios -------------------- */

  const cerrarFormularioAgregarCriterio = () => {
    dispatch(desactivarOverleyCriteriosFormularioAgregar());
  };

  const cerrarInformacionCriterio = () => {
    dispatch(desactivarOverleyInformacionCriterio());
  }
  const activarFormularioEditarCriterio = () => {
    dispatch(activarOverleyFormularioEditarCriterio());
  }
  const cerrarFormularioEditarCriterio = () => {
    dispatch(desactivarOverleyFormularioEditarCriterio());
  }

  /* -------------03 cumplimiento -------------------------- */
  const cerrarFormularioAgregarCumplimiento = () => {
    dispatch(desactivarOverleyCumplimientoFormularioAgregar());
  }
    const cerrarInformacionCumplimiento = () => {
    dispatch(desactivarOverleyInformacionCumplimiento());
  }
  const activarFormularioEditarCumplimiento = () => {
    dispatch( activarOverleyFormularioEditarCumplimiento());
  }
  const cerrarFormularioEditarCumplimiento = () => {
    dispatch(desactivarOverleyFormularioEditarCumplimiento());
  }

    useEffect(() => {
    const versionesUnicas = Array.from(
      new Set(rubricas.map((rubrica) => rubrica.versionRubrica))
    );
    setVersionesList(versionesUnicas);
  }, [rubricas]);

  const seleccionarVersion = ( event: React.ChangeEvent<HTMLSelectElement>) => {
    const version = event.target.value;
    setVersionSeleccionada(version);
    filtrarRubricas(categoriaSeleccionada, version);
 
  };

  const filtrarBuscador = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const texto = evento.target.value.toLowerCase();
    if (!texto) {
      setRubricas(rubricasOriginales || []);
      return;
    }

    const filtradas = (rubricasOriginales || []).filter((r) => {
      const nombre = (r.nombreRubrica || "").toLowerCase();
      const detalle = (r.datalleRubrica || "").toLowerCase();
      const version = (r.versionRubrica || "").toLowerCase();
      return nombre.includes(texto) || detalle.includes(texto) || version.includes(texto);
    });
    setRubricas(filtradas);
  };

  return (
    <div className=" ">
      <ConfirmDeleteModal
        open={openConfirmEliminarRubrica}
        onClose={cerrarConfirmEliminarRubrica}
        onConfirm={ejecutarEliminarRubrica}
        nombreElemento={rubricaParaEliminar?.nombreRubrica ?? ""}
        titulo="Confirmar eliminación"
      />
      {/*---------------01 RURBICA----------------- */}
      <OverleyModal
        open={activadorInformacionRubrica}
        onClose={cerrarInformacionRubrica}
      >
        {rubricaSeleccionada && (
          <InformacionRubricaComponent
            rubrica={rubricaSeleccionada}
            onClose={
              cerrarInformacionRubrica
            } 
            onRefresh={() => {}}
            openFormEditar={ActivarFormularioEditarRubrica}
            openFormAgregar={abrirFormularioAgregarCriterio}
          />
        )}
      </OverleyModal>
      <OverleyModalFormulario
        open={activarOverleyFormularioAgregarRubricaValue}
        onClose={cerrarFormularioAgregarRubrica}
      >
        <FormularioAgregarRubricaComponent
          refresacar={traerDatosTabla}
          onClose={cerrarFormularioAgregarRubrica}
        />
      </OverleyModalFormulario>

      <OverleyModalFormulario
        open={openModalCargarPaquete}
        onClose={cerrarModalCargarPaquete}
      >
        <FormularioCargarPaqueteRubrica onClose={cerrarModalCargarPaquete} />
      </OverleyModalFormulario>

      <OverleyModalFormulario
        open={ activadorOverleyFormularioEditar}
        onClose={cerrarFormularioEditarRubrica}
      >
        <FormularioEditarRubricaComponent
          rubricaAEditar={rubricaSeleccionada!}
          //

          onClose={cerrarFormularioEditarRubrica}
          refresacar={traerDatosTabla}
        />
      </OverleyModalFormulario>
        {/*--------------- 02 Criterio ----------------- */}
              <OverleyModal open={activadorInformacionCriterio} onClose={cerrarInformacionCriterio}>
        {criterioSeleccionado && (
          <InformacionCriterioComponent
            criterio={criterioSeleccionado}
            onClose={cerrarInformacionCriterio}
            onRefresh={()=>{}}
            openFormEditar={activarFormularioEditarCriterio}
          />
        )}
      </OverleyModal>

      <OverleyModalFormulario
        open={activadorOverleyFormularioAgregarCriterios}
        onClose={cerrarFormularioAgregarCriterio}
      >
        <FormularioAgregarCriterioComponet
          rubrica={rubricaSeleccionada!}
          refresacar={() => {}}
          onClose={cerrarFormularioAgregarCriterio}
        />
      </OverleyModalFormulario>

          <OverleyModalFormulario
        open={activadorFormularioEditarCriterio}
        onClose={cerrarFormularioEditarCriterio}
      >
        <FormularioEditarCriterioComponet
          criterioAEditar={criterioSeleccionado!}
          //

          onClose={cerrarFormularioEditarCriterio}
          refresacar={() => {}}
        />
      </OverleyModalFormulario>


      {/* --------------- 03 cumplimiento ------------------- */}
          <OverleyModal open={activadorInformacionCumplimiento} onClose={cerrarInformacionCumplimiento}>
        {cumplimientoSeleccionado && (
          <InformacionCumplimientoComponent
            cumplimiento={cumplimientoSeleccionado}
            onClose={cerrarInformacionCumplimiento}
            onRefresh={()=>{}}
            openFormEditar={activarFormularioEditarCumplimiento}
          />
        )}
      </OverleyModal>

      <OverleyModalFormulario
        open={activadorOverleyFormularioAgregarCumplimiento}
        onClose={cerrarFormularioAgregarCumplimiento}
      >
        <FormularioAgregarCumplimientoComponet
          criterio={criterioSeleccionado!}
         
          onClose={cerrarFormularioAgregarCumplimiento}
        />
      </OverleyModalFormulario>

          <OverleyModalFormulario
        open={activadorFormularioEditarCumplimiento}
        onClose={cerrarFormularioEditarCumplimiento}
      >
        <FormularioEditarCumplimientoComponet
          cumplimientoAEditar={cumplimientoSeleccionado!}
       

          onClose={cerrarFormularioEditarCumplimiento}
         
        />
      </OverleyModalFormulario>


      <section className="flex w-full flex-col gap-4 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Rúbricas</h1>
          <span className="text-sm text-slate-400">{rubricas.length}</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <BuscadorRow filtrarBuscador={filtrarBuscador} />
          <div className="flex items-center gap-2">
            <button
              className="btn-surface flex cursor-pointer gap-2 rounded-lg px-4 py-2"
              onClick={abrirModalCargarPaquete}
            >
              <ArrowUpTrayIcon className="w-5 h-5 rounded-2xl" />
              Cargar
            </button>
            <button
              className="btn-surface flex cursor-pointer gap-2 rounded-lg px-4 py-2"
              onClick={abrirFormularioAgregar}
            >
              <PlusIcon className="w-5 h-5 rounded-2xl" />
              Agregar
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:max-w-2xl">
          <div className="min-w-0">
            <label htmlFor="filtro-categoria" className="field-label">
              Categoría
            </label>
            <select
              id="filtro-categoria"
              className={selectBaseClass}
              value={categoriaSeleccionada}
              onChange={seleccionarCategoria}
              disabled={!cargandoFiltros}
            >
              <option value="">
                Todas las categorías
              </option>
              {categoriasLista.map((categoria) => (
                <option key={categoria.idCategoria} value={categoria.idCategoria}>
                  {categoria.nombreCategoria}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label htmlFor="filtro-version" className="field-label">
              Versión
            </label>
            <select
              id="filtro-version"
              className={selectBaseClass}
              value={versionSeleccionada}
              onChange={seleccionarVersion}
              disabled={!cargandoFiltros}
            >
              <option value="">
                Todas las versiones
              </option>
              {versionesList.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
      {loading ? (
        <SkeletonTabla />
      ) : (
        <TablaRubricasComponent
          rubricas={rubricas}
          criteriosCountPorRubrica={criteriosCountPorRubrica}
          onRefresh={traerDatosTabla}
          onVerRubrica={onVerRubricaDesdeLista}
          onEditarRubrica={onEditarRubricaDesdeLista}
          onEliminarRubrica={onEliminarRubricaDesdeLista}
        />
      )}
    </div>
  );
}
