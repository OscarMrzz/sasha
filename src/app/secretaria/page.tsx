import Link from "next/link";
import {
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  TableCellsIcon,
} from "@heroicons/react/24/solid";

export default function SecretariaPageBienvenida() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-12">
      <div className="panel-outline w-full max-w-lg p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#00b4d8]">
          Panel de secretaría
        </p>
        <h1 className="mt-3 text-3xl font-bold">Bienvenido</h1>
        <p className="mt-4 text-[var(--app-fg-muted)]">
         
        </p>

      </div>
    </div>
  );
}
