import React from "react";
import { useDispatch } from "react-redux";
import { registroEquipoEvaluadorDatosAmpleosInterface } from "@/interfaces/interfaces";
import { setregistrosEquipoEvaliadorSeleccionado } from "@/feacture/EquipoEvaluador/EquipoEvaluadorSlice";
import { activarOverleyInformacionRegistroEquipoEvaluador } from "@/feacture/EquipoEvaluador/OverleyEquipoEvaluador";

type Props = {
  registrosEquipoEvaluador: registroEquipoEvaluadorDatosAmpleosInterface[];
  onRefresh?: () => void; // Función para refrescar los datos
};

export default function TablaRegistroEquipoEvaluadorComponent({ registrosEquipoEvaluador, onRefresh }: Props) {
  const dispatch = useDispatch();

  const seleccionarFila = (registro: registroEquipoEvaluadorDatosAmpleosInterface) => {
    dispatch(setregistrosEquipoEvaliadorSeleccionado(registro));
    dispatch(activarOverleyInformacionRegistroEquipoEvaluador());
  };

  return (
    <div>
      <div className="">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="px-4 py-2 border w-1" scope="col">
                N°
              </th>
              <th className="px-4 py-2 border text-left" scope="col">
                Nombre
              </th>
              <th className="px-4 py-2 border text-left" scope="col">
                Rol
              </th>
            </tr>
          </thead>
          <tbody>
            {registrosEquipoEvaluador.map((registro, index) => (
              <tr
                key={registro.idRegistroEvaluador}
                onDoubleClick={() => seleccionarFila(registro)}
                className="hover:bg-[#035a98] cursor-pointer"
              >
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border">{registro.perfiles.nombre}</td>
                <td className="px-4 py-2 border">{registro.perfiles.roles?.nombreRol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
