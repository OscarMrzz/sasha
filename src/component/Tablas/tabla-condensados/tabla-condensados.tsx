"use client";

import BuscadorRow from "@/component/buscadores/BuscadorRow";
import { Button } from "@/components/ui/button";
import type { rubricaDatosAmpleosInterface } from "@/interfaces/interfaces";
import type { FilaCondensadoTabla } from "@/lib/condensado/pivotCondensado";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  FileSpreadsheetIcon,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

type Props = {
  filas: FilaCondensadoTabla[];
  rubricas: rubricaDatosAmpleosInterface[];
  busqueda: string;
  onBusquedaChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  cargando?: boolean;
  nombreArchivoBase?: string;
};

type SortDirection = "asc" | "desc";

function formatearTotal(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}

function totalFila(
  fila: FilaCondensadoTabla,
  rubricas: rubricaDatosAmpleosInterface[],
): number {
  return rubricas.reduce(
    (acc, rubrica) =>
      acc + (fila.totalesPorRubrica[rubrica.idRubrica] ?? 0),
    0,
  );
}

function SortIcon({
  activo,
  direction,
}: {
  activo: boolean;
  direction: SortDirection;
}) {
  if (!activo) return <ArrowUpDown className="ml-1 size-3.5 opacity-50" />;
  if (direction === "asc") return <ArrowUp className="ml-1 size-3.5" />;
  return <ArrowDown className="ml-1 size-3.5" />;
}

export default function TablaCondensados({
  filas,
  rubricas,
  busqueda,
  onBusquedaChange,
  cargando = false,
  nombreArchivoBase = "condensado-por-rubrica",
}: Props) {
  const [sortKey, setSortKey] = useState("banda");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");

  const rubricasKey = rubricas.map((r) => r.idRubrica).join(",");

  useEffect(() => {
    setSortKey("banda");
    setSortDir("asc");
  }, [rubricasKey]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filasOrdenadas = useMemo(() => {
    const copy = [...filas];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "banda") {
        cmp = a.nombreBanda.localeCompare(b.nombreBanda, "es", {
          sensitivity: "base",
        });
      } else if (sortKey === "total") {
        cmp = totalFila(a, rubricas) - totalFila(b, rubricas);
      } else {
        const va = a.totalesPorRubrica[sortKey] ?? 0;
        const vb = b.totalesPorRubrica[sortKey] ?? 0;
        cmp = va - vb;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filas, rubricas, sortKey, sortDir]);

  const exportToExcel = () => {
    const dataToExport = filasOrdenadas.map((fila, index) => {
      const row: Record<string, string | number> = {
        "No.": index + 1,
        Banda: fila.nombreBanda,
      };
      for (const rubrica of rubricas) {
        row[rubrica.nombreRubrica] =
          fila.totalesPorRubrica[rubrica.idRubrica] ?? 0;
      }
      row.Total = totalFila(fila, rubricas);
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Condensado");

    const cols = [
      { wch: 6 },
      { wch: 28 },
      ...rubricas.map(() => ({ wch: 14 })),
      { wch: 12 },
    ];
    worksheet["!cols"] = cols;

    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `${nombreArchivoBase}-${fecha}.xlsx`);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BuscadorRow
          filtrarBuscador={onBusquedaChange}
          placeholder="Buscar banda…"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={exportToExcel}
          disabled={cargando || !filasOrdenadas.length}
          className="shrink-0 border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
        >
          <FileSpreadsheetIcon className="mr-2 size-4" />
          Exportar Excel
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700/50">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-700/60 bg-slate-900/60 text-left text-slate-300">
              <th className="sticky left-0 z-10 min-w-[3rem] bg-slate-900/95 px-3 py-3 font-medium">
                No.
              </th>
              <th className="sticky left-[3rem] z-10 min-w-[160px] bg-slate-900/95 px-2 py-2 font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("banda")}
                  className="-ml-1 h-8 px-2 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                >
                  Banda
                  <SortIcon activo={sortKey === "banda"} direction={sortDir} />
                </Button>
              </th>
              {rubricas.map((rubrica) => (
                <th
                  key={rubrica.idRubrica}
                  className="min-w-[100px] whitespace-nowrap px-2 py-2 font-medium"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort(rubrica.idRubrica)}
                    className="-ml-1 h-8 px-2 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  >
                    {rubrica.nombreRubrica}
                    <SortIcon
                      activo={sortKey === rubrica.idRubrica}
                      direction={sortDir}
                    />
                  </Button>
                </th>
              ))}
              <th className="min-w-[80px] whitespace-nowrap px-2 py-2 font-medium">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("total")}
                  className="-ml-1 h-8 px-2 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                >
                  Total
                  <SortIcon activo={sortKey === "total"} direction={sortDir} />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td
                  colSpan={3 + rubricas.length}
                  className="h-24 px-4 text-center text-slate-400"
                >
                  Cargando…
                </td>
              </tr>
            ) : !filasOrdenadas.length ? (
              <tr>
                <td
                  colSpan={3 + rubricas.length}
                  className="h-24 px-4 text-center text-slate-400"
                >
                  {busqueda.trim()
                    ? "Ninguna banda coincide con la búsqueda."
                    : "No hay bandas para mostrar con los filtros seleccionados."}
                </td>
              </tr>
            ) : (
              filasOrdenadas.map((fila, index) => (
                <tr
                  key={fila.idBanda}
                  className={`border-b border-slate-800/80 ${
                    index % 2 === 0 ? "bg-slate-900/30" : "bg-slate-900/10"
                  }`}
                >
                  <td className="sticky left-0 z-[1] bg-inherit px-3 py-3 font-mono tabular-nums text-slate-400">
                    {index + 1}
                  </td>
                  <td className="sticky left-[3rem] z-[1] bg-inherit px-4 py-3 text-slate-100">
                    {fila.nombreBanda}
                  </td>
                  {rubricas.map((rubrica) => (
                    <td
                      key={rubrica.idRubrica}
                      className="px-4 py-3 text-right font-mono tabular-nums text-slate-200"
                    >
                      {formatearTotal(
                        fila.totalesPorRubrica[rubrica.idRubrica] ?? 0,
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-slate-100">
                    {formatearTotal(totalFila(fila, rubricas))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
