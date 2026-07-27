import { vistaAplicacionSancionInterface } from "@/interfaces/interfaces";
import CardRowAplicacionSancion from "@/component/CardRow/CardRowAplicacionSancion";

type Props = {
  filas: vistaAplicacionSancionInterface[];
  titulo?: string;
};

export default function TablaAplicacionSanciones({
  filas,
  titulo = "Sanciones aplicadas",
}: Props) {
  return (
    <div className="w-full">
      <h1 className="mb-6 text-2xl font-bold text-white">{titulo}</h1>
      {filas.length === 0 ? (
        <p className="rounded-xl border border-slate-600/40 bg-slate-800/40 px-4 py-8 text-center text-slate-400">
          No hay sanciones aplicadas registradas.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filas.map((registro) => (
            <CardRowAplicacionSancion
              key={registro.id_registro_sanciones ?? `${registro.idBanda}-${registro.id_sancion}`}
              registro={registro}
            />
          ))}
        </div>
      )}
    </div>
  );
}
