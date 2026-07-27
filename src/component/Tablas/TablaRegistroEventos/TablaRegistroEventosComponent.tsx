import React from "react";
import { useDispatch } from "react-redux";
import { registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
import { setEventoSelecionado } from "@/feacture/Eventos/eventosSlice";
import { activarOverleyInformacionEventos } from "@/feacture/Eventos/overleysEventosSlice";

type Props = {
  registroEventos: registroEventoDatosAmpleosInterface[];
};
export default function TablaRegistroEventossComponent({
  registroEventos,
}: Props) {
    
  const dispatch = useDispatch();

  const seleccionarFila = (evento: registroEventoDatosAmpleosInterface) => {
    dispatch(setEventoSelecionado(evento));
    dispatch(activarOverleyInformacionEventos());
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
                Fecha
              </th>
              <th className="px-4 py-2 border text-left" scope="col">
                Region
              </th>
              <th className="px-4 py-2 border text-left" scope="col">
                Lugar
              </th>
            </tr>
          </thead>
          <tbody>
            {registroEventos.map((evento: registroEventoDatosAmpleosInterface, index: number) => (
              <tr
                key={evento.idEvento}
                onDoubleClick={() => seleccionarFila(evento)}
                className="hover:bg-[#035a98] cursor-pointer"
              >
                <td className="px-4 py-2 border">{index + 1}</td>
                <td className="px-4 py-2 border">{evento.fechaEvento}</td>
                <td className="px-4 py-2 border">{evento.regiones?.nombreRegion}</td>
                <td className="px-4 py-2 border">{evento.LugarEvento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
