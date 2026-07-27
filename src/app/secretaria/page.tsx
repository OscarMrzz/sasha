import Link from "next/link";
import {
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  TableCellsIcon,
} from "@heroicons/react/24/solid";

export default function SecretariaPageBienvenida() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-600/40 bg-slate-900/50 p-8 text-center shadow-xl shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
          Panel de secretaría
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">Bienvenido</h1>
        <p className="mt-4 text-slate-300">
         
        </p>

      </div>
    </div>
  );
}
