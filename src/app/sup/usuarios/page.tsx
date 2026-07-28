"use client";

import { use, useEffect, useRef, useState } from "react";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";
import React from "react";
import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import { PlusIcon } from "@heroicons/react/16/solid";
import { perfilDatosAmpleosInterface, rolInterface } from "@/models";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import {} from "@/features/overleys/overleySlice";
import OverleyModal from "@/components/modales/OverleyModal/Page";
import {
  activarOverleyFormularioAgregarPerfiles,
  activarOverleyInformacionPerfiles,
  desactivarOverleyFormularioAgregarPerfiles,
  desactivarOverleyFormularioEditarPerfiles,
  desactivarOverleyInformacionPerfiles,
} from "@/features/Perfil/overleyPerfil";
import { desactivarRefrescarDataPerfiles } from "@/features/Perfil/refrescadorPerfiles";
import PerfilesServices from "@/services/perfilesServices";
import InformacionUsuarioComponent from "@/components/informacion/informacionUsuarioComponent/InformacionUsuarioComponent";
import FormularioAgregarUsuario from "@/components/formularios/Perfil/Agregar/FormularioAgregarUsuario";
import FormularioEditarUsuario from "@/components/formularios/Perfil/editar/FormularioEditarUsuario";
import TablaRegistroPerfilesComponent from "@/components/Tablas/TablaUsuariosComponent/TablaUsuariosComponent";
import { div } from "framer-motion/client";
import { setPerfilSeleccionado } from "@/features/Perfil/PerfilSlice";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import RolesServices from "@/services/rolServices";

export default function PerfilesHomePage() {
  const dispatch = useDispatch();

  const refrescadorDataPerfiles = useSelector(
    (state: RootState) => state.refrescadorDataPerfiles.RefrescadorDataPerfiles
  );
  const activadorOverleyFormularioAgregarPerfiles = useSelector(
    (state: RootState) => state.overleyPerfiles.activadorOverleyFormularioAgregarPerfiles
  );

  const activadorOverleyInformacionPerfiles = useSelector(
    (state: RootState) => state.overleyPerfiles.activadorOverleyInformacionPerfiles
  );
  const activadorOverleyFormularioEditarEPerfiles = useSelector(
    (state: RootState) => state.overleyPerfiles.activadorOverleyFormularioEditarPerfiles
  );
  const perfilSeleccionado = useSelector((state: RootState) => state.perfil.perfilSeleccionado);

  const [perfiles, setPerfiles] = useState<perfilDatosAmpleosInterface[]>([]);
  const [perfilesOriginales, setPerfilesOriginales] = useState<perfilDatosAmpleosInterface[]>([]);
  const [urlFotoPerfil, setUrlFotoPerfil] = useState<string>("");

  const [loading, setLoading] = useState(true);

  const abrirFormularioAgregar = () => {
    dispatch(activarOverleyFormularioAgregarPerfiles());
  };

  const perfilesServices = useRef(new PerfilesServices());
  // Removed duplicate declaration of cerrarFormularioAgregarCriterio

  useEffect(() => {
    traerDatosTabla();
  }, []);

  useEffect(() => {
    if (refrescadorDataPerfiles) {
      traerDatosTabla();
      dispatch(desactivarRefrescarDataPerfiles());
    }
  }, [refrescadorDataPerfiles]);

  async function traerDatosTabla() {
   
    try {
      const perfilActivo: perfilDatosAmpleosInterface = await perfilesServices.current.getUsuarioLogiado();

      const perfilesData: perfilDatosAmpleosInterface[] = await perfilesServices.current.getDatosAmpleos( 
        perfilActivo.idForaneaFederacion || "",
        perfilActivo.roles?.nombreRol || ""
      );

      setPerfiles(perfilesData);
      setPerfilesOriginales(perfilesData);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error al obtener las Rubricas:", error);
      setLoading(false);
    } finally {
    }
  }

  const cerrarFormularioAgregarPerfil = () => {
    dispatch(desactivarOverleyFormularioAgregarPerfiles());
  };
  const cerrarInformacionPerfil = () => {
    dispatch(desactivarOverleyInformacionPerfiles());
  };
  const cerrarFormularioEditarPerfil = () => {
    dispatch(desactivarOverleyFormularioEditarPerfiles());
  };
  const onDobleClickAbrirInformacion = (perfil: perfilDatosAmpleosInterface) => {
    dispatch(activarOverleyInformacionPerfiles());
    dispatch(setPerfilSeleccionado(perfil));
  
  };

  const filtrarBuscador = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const texto = evento.target.value.toLowerCase();
    if (!texto) {
      setPerfiles(perfilesOriginales || []);
      return;
    }
    if (perfiles && perfilesOriginales) {
      const perfilesFiltrados = perfilesOriginales.filter((perfil: perfilDatosAmpleosInterface) =>
        perfil.nombre.toLowerCase().includes(texto)
      );
      setPerfiles(perfilesFiltrados);
    }
  };

  const [rolesList, searchRolesList] = useState<rolInterface[]>();
  useEffect(() => {
    const inicializar = async () => {
      const rolesServices = new RolesServices();
      await rolesServices.initPerfil(); // Inicializar perfil explícitamente
      rolesServices
        .get()
        .then((roles) => {
          searchRolesList(roles);
        })
        .catch((error) => {
          console.error("Error al obtener roles:", error);
        });
    };
    inicializar();
  }, []);

  return (
    <div className=" w-full">
      <OverleyModal open={activadorOverleyInformacionPerfiles} onClose={cerrarInformacionPerfil}>
        {perfilSeleccionado && (
          <InformacionUsuarioComponent perfil={perfilSeleccionado!} />
        )}
      </OverleyModal>
      <OverleyModalFormulario open={activadorOverleyFormularioAgregarPerfiles} onClose={cerrarFormularioAgregarPerfil}>
        <FormularioAgregarUsuario onClose={cerrarFormularioAgregarPerfil} />
      </OverleyModalFormulario>

      <OverleyModalFormulario open={activadorOverleyFormularioEditarEPerfiles} onClose={cerrarFormularioEditarPerfil}>
        <FormularioEditarUsuario
          perfilAEditar={perfilSeleccionado!}
          urlFotoPerfil={urlFotoPerfil}
          onClose={cerrarFormularioEditarPerfil}
          openModalExito={() => {}}
        />
      </OverleyModalFormulario>

      <div>
        <div>
          <div className="flex w-full flex-col gap-4  mb-4">
            <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

            <search>
              <input
                type="text"
                placeholder="Buscar..."
                className=" mt-4 lg:mt-0  w-full h-12 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={filtrarBuscador}
              />
            </search>
            <div className="flex items-center">
              <button className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-300 cursor-pointer flex   gap-2" onClick={abrirFormularioAgregar}>
                <PlusIcon className="w-5 h-5   rounded-2xl" />
                Agregar
              </button>
            </div>
          </div>
        </div>
      </div>
      {loading ? (
        <SkeletonTabla />
      ) : (
        <>
          <div className="flex flex-col  gap-4 w-full  ">
            {perfiles.map((perfil) => {
              return (
                <div
                  onDoubleClick={() => onDobleClickAbrirInformacion(perfil)}
                  key={perfil.idPerfil}
                  className="h-25 p-4 flex flex-wrap justify-between w-full bg-slate-700 cursor-pointer hover:bg-slate-600 transition-colors duration-300 rounded-lg shadow-md"
                >
                  <div>
                    <h2 className="text-xl">{perfil.nombre}</h2>
                    <p className="">{rolesList?.find((rol) => rol.idRol === perfil.roles?.idRol)?.nombreRol}</p>
                  </div>
                  <div>
                    <EllipsisVerticalIcon
                      onClick={() => onDobleClickAbrirInformacion(perfil)}
                      className="h-6 w-6 text-gray-300 cursor-pointer hover:text-gray-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
