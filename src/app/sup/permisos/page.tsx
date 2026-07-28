"use client";
import Switches from "@/components/UI/toggle switches/Switches";
import { rolInterface } from "@/models";
import RolesServices from "@/services/rolServices";
import { div } from "framer-motion/client";
import React, { useEffect, useRef, useState } from "react";

export default function PermisosPage() {
  /* useState */
  const [rolesList, setRolesList] = useState<rolInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [rolSeleccionado, setRolSeleccionado] = useState<rolInterface>();
  /* UseRef */
  const rolesServices = useRef(new RolesServices());

  /* useEffect */
  useEffect(() => {
    const inicializar = async () => {
      setLoading(true);
      await rolesServices.current.initPerfil(); // Inicializar perfil explícitamente
      rolesServices.current
        .get()
        .then((roles) => {
          setRolesList(roles);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error al obtener roles:", error);
          setLoading(false);
        });
    };
    inicializar();
  }, []);

  const cambiarEstadoRol = (rol: rolInterface) => {
    const rolActual = rol;
    const estadoActual = rol.estadoRol;
    const nuevoEstado = !estadoActual;
    const RolActualisado: rolInterface = {
      ...rolActual,
      estadoRol: nuevoEstado,
    };

    rolesServices.current
      .update(rolActual.idRol, RolActualisado)
      .then(() => {
        refrescarRoles();
      })
      .catch((error) => {
        console.error("Error al actualizar rol:", error);
      });
  };

  const refrescarRoles = () => {
    setLoading(true);
    rolesServices.current
      .get()
      .then((roles) => {
        setRolesList(roles);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener roles:", error);
        setLoading(false);
      });
  };

  if (!rolesList.length) {
    return (
      <div className="flex flex-col gap-4 ">
        <h1 className="text-2xl font-bold">Permisos</h1>

        <div className="flex flex-col fl gap-4">
          <p>No hay roles disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 justify-center items-center w-full ">
      <h1 className="text-3xl font-bold w-full justify-start">Permisos</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full ">
        {rolesList.map((rol: rolInterface) => (
          <Switches key={rol.idRol} rol={rol} cambioEstado={() => cambiarEstadoRol(rol)} />
        ))}
      </div>

     
    </div>
  );
}
