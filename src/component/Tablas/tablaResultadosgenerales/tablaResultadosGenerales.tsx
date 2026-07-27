import React from "react";

import { resultadosGeneralesInterface } from "@/interfaces/interfaces";

import { setfilaResultadoItemSeleccionado } from "@/feacture/resultadosGenerales/ResultadosGeneralesSlice";

import { useDispatch } from "react-redux";
import { activarOverleyInformacionResultados } from "@/feacture/resultadosGenerales/overlayResultados";

type Props = {
  resutadosGenerales: resultadosGeneralesInterface[];
  onRefresh?: () => void; // Función para refrescar los datos
};

export default function TablaResultadosGeneralesComponent({ resutadosGenerales, onRefresh }: Props) {
  const dispatch = useDispatch();

  const [open, setOpen] = React.useState(false);

  const [selectBanda, setSelectBanda] = React.useState<resultadosGeneralesInterface | null>(null);

  const seleccionarFila = (filaResultado: resultadosGeneralesInterface) => {
    dispatch(
      setfilaResultadoItemSeleccionado({
        idBanda: filaResultado.banda.idBanda,
        idEvento: filaResultado.evento.idEvento,
      })
    );
    dispatch(activarOverleyInformacionResultados());
  };
  const cerrarModal = () => {
    setOpen(false);
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
                Banda
              </th>
              <th className="px-4 py-2 border text-left flex justify-center items-center" scope="col">
                Puntos 
              </th>
            </tr>
          </thead>
          <tbody>
            {resutadosGenerales.map((filaResultado, index) => (
              <tr
                key={filaResultado.evento.idEvento+filaResultado.banda.idBanda}
                onDoubleClick={() => seleccionarFila(filaResultado)}
                className="hover:bg-[#035a98] cursor-pointer"
              >
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border">{filaResultado.banda.nombreBanda}</td>
                <td className="px-4 py-2 border flex justify-center items-center">{filaResultado.totalPuntos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
