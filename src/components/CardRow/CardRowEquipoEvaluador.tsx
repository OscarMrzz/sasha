import React from "react";
import { registroEquipoEvaluadorDatosAmpleosInterface } from "@/models";
import MenuMasOpcionesVerEliminar from "@/components/ui/MenuMasOpcionesVerEliminar";
import PerfilesServices from "@/services/perfilesServices";
import { useQuery } from "@tanstack/react-query";

type Props = {
  registro: registroEquipoEvaluadorDatosAmpleosInterface;
  abrirInformacion: (registro: registroEquipoEvaluadorDatosAmpleosInterface) => void;
  abrirEliminar: (registro: registroEquipoEvaluadorDatosAmpleosInterface) => void;
};

export default function CardRowEquipoEvaluador({ registro, abrirInformacion, abrirEliminar }: Props) {
  const { data: perfil } = useQuery({
    queryKey: ["perfil", registro.idForaneaPerfil],
    queryFn: async () => {
      const svc = new PerfilesServices();
      return await svc.getOneDatosAmpleos(registro.idForaneaPerfil);
    },
    enabled: Boolean(registro?.idForaneaPerfil),
  });

  const nombre = perfil?.nombre ?? registro.perfiles?.nombre ?? "—";
  const rol = perfil?.roles?.nombreRol ?? registro.perfiles?.roles?.nombreRol ?? "—";

  return (
    <div
      data-testid="card-row"
      data-codigo={registro.idRegistroEvaluador ?? registro.idForaneaPerfil}
      onDoubleClick={() => abrirInformacion(registro)}
      className="w-full min-h-25 card-row-bg flex flex-row justify-between p-4 cursor-pointer rounded-lg shadow-md"
    >
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-white">{nombre}</h2>
        <p className="text-slate-200">Rol: {rol}</p>
      </div>
      <div data-testid="menu-mas-opciones" onDoubleClick={(e) => e.stopPropagation()}>
        <MenuMasOpcionesVerEliminar
          onView={() => abrirInformacion(registro)}
          onDelete={() => abrirEliminar(registro)}
        />
      </div>
    </div>
  );
}

