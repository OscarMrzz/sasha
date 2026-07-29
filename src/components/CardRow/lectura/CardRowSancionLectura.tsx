import { sancionInterface } from "@/models";

type Props = {
  sancion: sancionInterface;
};

function fmtFecha(val: string | Date | null | undefined): string {
  if (!val) return "";
  if (typeof val === "string") return val.slice(0, 10);
  return val.toISOString().slice(0, 10);
}

export default function CardRowSancionLectura({ sancion }: Props) {
  const fecha = fmtFecha(sancion.fecha_creacion_sancion);

  return (
    <div className="flex min-h-[10rem] w-full flex-col rounded-lg card-row-bg p-4 shadow-md">
          <section className="flex items-start justify-between gap-3">
            
          <span className="mt-1 p-2 rounded-lg text-sm text-slate-400">
        {sancion.version ? `Versión ${sancion.version}` : "Sin versión"}
        {fecha ? ` · ${fecha}` : ""}
      </span>
        <span className="shrink-0 text-sm font-light text-red-300">
          -{sancion.puntos_sancion} pts
        </span>
          </section>
      <div className="flex items-start justify-between gap-3 h-full">
        <p className="min-w-0 flex-1 text-sm font-light text-slate-300">
          {sancion.detalles_sancion}
        </p>
   
      </div>
  
    </div>
  );
}
