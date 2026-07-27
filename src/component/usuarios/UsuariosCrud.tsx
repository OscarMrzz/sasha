"use client";

import { useEffect, useRef, useState } from "react";
import React from "react";
import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import OverleyModalFormulario from "@/component/modales/OverleyModalFormulario/Page";
import { PlusIcon } from "@heroicons/react/16/solid";
import { perfilDatosAmpleosInterface } from "@/interfaces/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import OverleyModal from "@/component/modales/OverleyModal/Page";
import {
  activarOverleyFormularioAgregarPerfiles,
  activarOverleyFormularioEditarPerfiles,
  activarOverleyInformacionPerfiles,
  desactivarOverleyFormularioAgregarPerfiles,
  desactivarOverleyFormularioEditarPerfiles,
  desactivarOverleyInformacionPerfiles,
} from "@/feacture/Perfil/overleyPerfil";
import { desactivarRefrescarDataPerfiles } from "@/feacture/Perfil/refrescadorPerfiles";
import PerfilesServices from "@/lib/services/perfilesServices";
import InformacionUsuarioComponent from "@/component/informacion/informacionUsuarioComponent/InformacionUsuarioComponent";
import FormularioAgregarUsuario from "@/component/formularios/Perfil/Agregar/FormularioAgregarUsuario";
import FormularioEditarUsuario from "@/component/formularios/Perfil/editar/FormularioEditarUsuario";
import { setPerfilSeleccionado } from "@/feacture/Perfil/PerfilSlice";
import useAtajoPagina from "@/hooks/useAtajoPagina";
import ErrorMessage from "@/component/Message/ErrorMessage";
import ApprovateMessage from "@/component/Message/ApprovateMessage";
import { useUsuarioAgregadoStore } from "@/Store/PerfilStore/usuarioAgregadoStore";
import CardRowUsuarios from "@/component/CardRow/CardRowUsuarios";
import ConfirmDeleteModal from "@/component/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import BuscadorRow from "@/component/buscadores/BuscadorRow";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { esRolRestringido } from "@/lib/usuarios/rolesUsuarios";

const QUERY_KEY_USUARIOS = ["perfilesDatosAmpleos"] as const;
const SIN_ROLES_EXCLUIDOS: readonly string[] = [];

type UsuariosCrudProps = {
  titulo?: string;
  queryKey?: readonly unknown[];
  rolesExcluidos?: readonly string[];
};

export default function UsuariosCrud({
  titulo = "Usuarios",
  queryKey = QUERY_KEY_USUARIOS,
  rolesExcluidos = SIN_ROLES_EXCLUIDOS,
}: UsuariosCrudProps) {
  const dispatch = useDispatch();

  const refrescadorDataPerfiles = useSelector((state: RootState) => state.refrescadorDataPerfiles);
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
  const [openModalError, setOpenModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const [openModalExito, setOpenModalExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const { ultimoUsuario, quitarUltimoUsuario } = useUsuarioAgregadoStore();
  const [mostrarAnimacion, setMostrarAnimacion] = useState(false);
  const [openConfirmEliminar, setOpenConfirmEliminar] = useState(false);
  const [perfilParaEliminar, setPerfilParaEliminar] = useState<perfilDatosAmpleosInterface | null>(null);

  const perfilesServices = useRef(new PerfilesServices());
  const queryClient = useQueryClient();

  const abrirFormularioAgregar = () => {
    dispatch(activarOverleyFormularioAgregarPerfiles());
  };

  useAtajoPagina("agregar", abrirFormularioAgregar);

  const { data, isPending, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const svc = perfilesServices.current;
      const perfilActivo = await svc.getUsuarioLogiado();
      return await svc.getDatosAmpleosExcluyendoRoles(
        perfilActivo.idForaneaFederacion || "",
        perfilActivo.roles?.nombreRol || "",
        rolesExcluidos
      );
    },
  });

  useEffect(() => {
    if (data !== undefined) {
      setPerfilesOriginales(data);
      setPerfiles(data);
    }
  }, [data]);

  useEffect(() => {
    if (ultimoUsuario) {
      setMostrarAnimacion(true);

      setTimeout(
        () => {
          setMostrarAnimacion(false);
        },
        60 * 1000 * 0.1
      );

      setTimeout(
        () => {
          quitarUltimoUsuario();
        },
        60 * 1000 * 5
      );
    }
  }, [ultimoUsuario, quitarUltimoUsuario]);

  useEffect(() => {
    if (refrescadorDataPerfiles.RefrescadorDataPerfiles) {
      void queryClient.invalidateQueries({ queryKey });
      dispatch(desactivarRefrescarDataPerfiles());
    }
  }, [refrescadorDataPerfiles, queryClient, dispatch, queryKey]);

  useEffect(() => {
    if (isError) {
      console.error("❌ Error al obtener perfiles:", error);
    }
  }, [isError, error]);

  const cerrarFormularioAgregarPerfil = () => {
    dispatch(desactivarOverleyFormularioAgregarPerfiles());
  };
  const cerrarInformacionPerfil = () => {
    dispatch(desactivarOverleyInformacionPerfiles());
  };
  const cerrarFormularioEditarPerfil = () => {
    dispatch(desactivarOverleyFormularioEditarPerfiles());
  };

  const perfilEstaRestringido = (perfil: perfilDatosAmpleosInterface) =>
    esRolRestringido(perfil.roles?.nombreRol, rolesExcluidos);

  const abrirEditarPerfil = async (perfil: perfilDatosAmpleosInterface) => {
    if (perfilEstaRestringido(perfil)) {
      abrirModalError("No puedes editar usuarios con roles protegidos.");
      return;
    }

    dispatch(setPerfilSeleccionado(perfil));
    dispatch(activarOverleyFormularioEditarPerfiles());
    try {
      const urlFoto = await perfilesServices.current.obtenerUrlFotoPerfil(perfil.urlFotoPerfil || "");
      setUrlFotoPerfil(urlFoto || "");
    } catch (error) {
      console.error("❌ Error al obtener la URL de la foto de perfil:", error);
      setUrlFotoPerfil("");
    }
  };

  const abrirEliminarPerfil = (perfil: perfilDatosAmpleosInterface) => {
    if (perfilEstaRestringido(perfil)) {
      abrirModalError("No puedes eliminar usuarios con roles protegidos.");
      return;
    }
    setPerfilParaEliminar(perfil);
    setOpenConfirmEliminar(true);
  };

  const cerrarConfirmEliminar = () => {
    setOpenConfirmEliminar(false);
    setPerfilParaEliminar(null);
  };

  const ejecutarEliminarPerfil = async () => {
    try {
      const svc = perfilesServices.current;
      if (!perfilParaEliminar) return;

      if (rolesExcluidos.length > 0) {
        await svc.deleteRestringido(perfilParaEliminar.idPerfil, rolesExcluidos);
      } else {
        await svc.delete(perfilParaEliminar.idForaneaUser || "");
      }
    } catch (error) {
      console.error("❌ Error al eliminar el perfil:", error);
      abrirModalError(error instanceof Error ? error.message : "Error al eliminar el perfil");
      cerrarConfirmEliminar();
      return;
    }
    void queryClient.invalidateQueries({ queryKey });
    cerrarConfirmEliminar();
    abrirModalExito("Perfil eliminado correctamente");
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

  const cerrarModalError = () => {
    setOpenModalError(false);
    setMensajeError("");
  };

  const abrirModalError = (mensaje: string) => {
    setOpenModalError(true);
    setMensajeError(mensaje);
  };
  const abrirModalExito = (mensaje: string) => {
    setOpenModalExito(true);
    setMensajeExito(mensaje);
  };
  const cerrarModalExito = () => {
    setOpenModalExito(false);
    setMensajeExito("");
  };

  return (
    <div>
      <section id="modales-ocultos">
        <ConfirmDeleteModal
          open={openConfirmEliminar}
          onClose={cerrarConfirmEliminar}
          onConfirm={ejecutarEliminarPerfil}
          nombreElemento={perfilParaEliminar?.nombre ?? ""}
        />
        <ErrorMessage titulo="Error" open={openModalError} onClose={cerrarModalError} texto={mensajeError} />
        <ApprovateMessage titulo="Éxito" open={openModalExito} onClose={cerrarModalExito} texto={mensajeExito} />
        <OverleyModal open={activadorOverleyInformacionPerfiles} onClose={cerrarInformacionPerfil}>
          {perfilSeleccionado && <InformacionUsuarioComponent perfil={perfilSeleccionado} />}
        </OverleyModal>

        <FormularioAgregarUsuario
          onClose={cerrarFormularioAgregarPerfil}
          openErrorModal={abrirModalError}
          openModalExito={abrirModalExito}
          openModal={activadorOverleyFormularioAgregarPerfiles}
          onCloseModal={cerrarFormularioAgregarPerfil}
          rolesExcluidos={rolesExcluidos}
        />

        <OverleyModalFormulario open={activadorOverleyFormularioEditarEPerfiles} onClose={cerrarFormularioEditarPerfil}>
          <FormularioEditarUsuario
            perfilAEditar={perfilSeleccionado}
            urlFotoPerfil={urlFotoPerfil}
            onClose={cerrarFormularioEditarPerfil}
            openModalExito={abrirModalExito}
            rolesExcluidos={rolesExcluidos}
          />
        </OverleyModalFormulario>
      </section>

      <section className="mb-4 flex w-full flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{titulo}</h1>
          <span className="text-sm text-slate-400">{perfiles.length}</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <BuscadorRow filtrarBuscador={filtrarBuscador} />
          <div className="flex items-center">
            <button
              className="flex cursor-pointer gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-300"
              onClick={abrirFormularioAgregar}
            >
              <PlusIcon className="h-5 w-5 rounded-2xl" />
              Agregar
            </button>
          </div>
        </div>
      </section>

      {isPending ? (
        <SkeletonTabla />
      ) : (
        <div className="flex w-full flex-col gap-4">
          {perfiles.map((perfil, index) => (
            <CardRowUsuarios
              key={perfil.idPerfil}
              index={index + 1}
              perfil={perfil}
              abrirInformacion={onDobleClickAbrirInformacion}
              abrirEditar={abrirEditarPerfil}
              abrirEliminar={abrirEliminarPerfil}
              ultimoUsuario={ultimoUsuario}
              mostrarAnimacion={mostrarAnimacion}
            />
          ))}
        </div>
      )}
    </div>
  );
}
