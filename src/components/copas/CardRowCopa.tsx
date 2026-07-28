import MenuMasOpciones from "@/components/ui/MenuMasOpciones";
import type { copaInterface } from "@/models";

export type CopaFilaDisplay = copaInterface & {
  nombreBanda: string;
  nombreCategoria: string;
  idCategoriaBanda: string;
};

type Props = {
  copa: CopaFilaDisplay;
  abrirInformacion: (copa: CopaFilaDisplay) => void;
  abrirEditar: (copa: CopaFilaDisplay) => void;
  abrirEliminar: (copa: CopaFilaDisplay) => void;
};

function etiquetaLugar(lugar: number) {
  if (lugar === 1) return "1º lugar";
  if (lugar === 2) return "2º lugar";
  if (lugar === 3) return "3º lugar";
  return `${lugar}º lugar`;
}

export default function CardRowCopa({
  copa,
  abrirInformacion,
  abrirEditar,
  abrirEliminar,
}: Props) {
  return (
    <div
      data-testid="card-row-copa"
      data-codigo={copa.id_copas}
      onDoubleClick={() => abrirInformacion(copa)}
      className="flex w-full min-h-25 cursor-pointer flex-row justify-between rounded-lg bg-slate-700 p-4 shadow-md hover:bg-slate-600"
    >
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-white">
          {etiquetaLugar(Number(copa.lugar))}
        </h2>
        <p className="text-slate-200">{copa.nombreBanda}</p>
        <p className="text-slate-200">Categoría: {copa.nombreCategoria}</p>
        <p className="text-slate-200">
          Tipo: {copa.tipo === "desempate" ? "Desempate" : "Directo"}
        </p>
      </div>
      <div
        data-testid="menu-mas-opciones"
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <MenuMasOpciones
          onView={() => abrirInformacion(copa)}
          onEdit={() => abrirEditar(copa)}
          onDelete={() => abrirEliminar(copa)}
        />
      </div>
    </div>
  );
}
