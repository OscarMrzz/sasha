import { vistaAplicacionSancionInterface } from "@/models";

type Props = {
  registro: vistaAplicacionSancionInterface;
};

function fmtFecha(val: string | Date | null | undefined): string {
  if (!val) return "—";
  if (typeof val === "string") return val.slice(0, 10);
  return val.toISOString().slice(0, 10);
}

function nombreSancionador(registro: vistaAplicacionSancionInterface): string | null {
  const nombre = registro.nombre_sancionador?.trim();
  const apellido = registro.apellido_sancionador?.trim();
  if (!nombre && !apellido) return null;
  return [nombre, apellido].filter(Boolean).join(" ");
}

export default function CardRowAplicacionSancionLectura({ registro }: Props) {
  const sancionador = nombreSancionador(registro);

  return (
    <div className="flex min-h-[15rem] w-full flex-col rounded-lg border border-slate-500 shadow-md hover:bg-slate-600">
      <div className="flex items-start justify-between gap-3 p-4 bg-slate-700 rounded-t-lg">
        <h2 className="min-w-0 flex-1 text-lg font-semibold text-white">
          {registro.nombreBanda ?? "—"}
        </h2>
        <span className="shrink-0 text-sm font-medium text-red-300">
          -{registro.puntos_sancion ?? 0} pts
        </span>
      </div>
      <p className=" text-sm text-slate-200 line-clamp-2 p-4 bg-slate-700">
        {registro.detalles_sancion ?? "—"}
      </p>
      <section className="flex flex-1 flex-col bg-slate-900 p-4 rounded-b-lg">

      {registro.justificacion ? (
        <p className="mt-2 text-xs italic line-clamp-2 text-slate-400">
          &ldquo;{registro.justificacion}&rdquo;
        </p>
      ) : null}
      </section>
    </div>
  );
}
