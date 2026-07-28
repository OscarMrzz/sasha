"use client";

import AuditoriaDetalleModal from "@/components/auditoria/AuditoriaDetalleModal";
import {
  AuditoriaEmpty,
  AuditoriaErrorBanner,
  AuditoriaFieldLabel,
  AuditoriaPanel,
  AuditoriaRefreshButton,
  auditoriaInputClass,
} from "@/components/auditoria/AuditoriaUi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AuditoriaDetalleEnriquecido,
  AuditoriaFiltros,
  PerfilUsuarioFiltro,
} from "@/models";
import {
  AUDITORIA_ACCIONES_FILTRO,
  AUDITORIA_TABLAS_FILTRO,
  formatearHoraLocal,
  getAuditoriaPaginada,
  listarUsuariosConAuditoria,
  mensajeErrorSupabase,
} from "@/services/auditoriaServices";
import { useCallback, useEffect, useState } from "react";

const PAGE_SIZE = 25;

export default function AuditoriaGeneralTabla() {
  const [filtros, setFiltros] = useState<AuditoriaFiltros>({
    textoUsuario: "",
    fechaDesde: null,
    fechaHasta: null,
    accion: null,
    tabla: null,
    idForaneaUser: null,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [rows, setRows] = useState<AuditoriaDetalleEnriquecido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usuarios, setUsuarios] = useState<PerfilUsuarioFiltro[]>([]);
  const [detalle, setDetalle] = useState<AuditoriaDetalleEnriquecido | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    void listarUsuariosConAuditoria()
      .then(setUsuarios)
      .catch(() => setUsuarios([]));
  }, []);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAuditoriaPaginada(filtros, page, PAGE_SIZE);
      setRows(res.rows);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
      setError(mensajeErrorSupabase(e) || "No se pudo cargar la auditoría.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filtros, page]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const aplicarFiltros = (next: Partial<AuditoriaFiltros>) => {
    setPage(1);
    setFiltros((prev) => ({ ...prev, ...next }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">Registros</h2>
          <p className="text-sm text-slate-400">
            Bitácora paginada. Usa filtros para acotar.
          </p>
        </div>
        <AuditoriaRefreshButton
          loading={loading}
          onClick={() => void cargar()}
          label="Actualizar"
        />
      </div>

      <AuditoriaPanel className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <AuditoriaFieldLabel>
            Usuario
            <select
              className={auditoriaInputClass}
              value={filtros.idForaneaUser ?? ""}
              onChange={(e) =>
                aplicarFiltros({
                  idForaneaUser: e.target.value || null,
                  textoUsuario: "",
                })
              }
            >
              <option value="">Todos</option>
              {usuarios.map((u) => (
                <option key={u.idForaneaUser} value={u.idForaneaUser}>
                  {u.nombreCompleto}
                </option>
              ))}
            </select>
          </AuditoriaFieldLabel>

          <AuditoriaFieldLabel>
            Buscar nombre
            <input
              type="search"
              className={auditoriaInputClass}
              placeholder="Nombre o apellido"
              value={filtros.textoUsuario ?? ""}
              onChange={(e) =>
                aplicarFiltros({
                  textoUsuario: e.target.value,
                  idForaneaUser: null,
                })
              }
            />
          </AuditoriaFieldLabel>

          <AuditoriaFieldLabel>
            Desde
            <input
              type="date"
              className={auditoriaInputClass}
              value={filtros.fechaDesde ?? ""}
              onChange={(e) => aplicarFiltros({ fechaDesde: e.target.value || null })}
            />
          </AuditoriaFieldLabel>

          <AuditoriaFieldLabel>
            Hasta
            <input
              type="date"
              className={auditoriaInputClass}
              value={filtros.fechaHasta ?? ""}
              onChange={(e) => aplicarFiltros({ fechaHasta: e.target.value || null })}
            />
          </AuditoriaFieldLabel>

          <AuditoriaFieldLabel>
            Acción
            <select
              className={auditoriaInputClass}
              value={filtros.accion ?? ""}
              onChange={(e) => aplicarFiltros({ accion: e.target.value || null })}
            >
              <option value="">Todas</option>
              {AUDITORIA_ACCIONES_FILTRO.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </AuditoriaFieldLabel>

          <AuditoriaFieldLabel>
            Tabla
            <select
              className={auditoriaInputClass}
              value={filtros.tabla ?? ""}
              onChange={(e) => aplicarFiltros({ tabla: e.target.value || null })}
            >
              <option value="">Todas</option>
              {AUDITORIA_TABLAS_FILTRO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </AuditoriaFieldLabel>
        </div>
      </AuditoriaPanel>

      {error ? <AuditoriaErrorBanner message={error} /> : null}

      <AuditoriaPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700/50 hover:bg-transparent">
                <TableHead className="text-slate-400">Fecha</TableHead>
                <TableHead className="text-slate-400">Usuario</TableHead>
                <TableHead className="text-slate-400">Acción</TableHead>
                <TableHead className="text-slate-400">Tabla</TableHead>
                <TableHead className="text-slate-400">Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-700/40 hover:bg-transparent">
                  <TableCell colSpan={5} className="py-10 text-center text-slate-400">
                    Cargando…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow className="border-slate-700/40 hover:bg-transparent">
                  <TableCell colSpan={5} className="p-0">
                    <AuditoriaEmpty
                      title="Sin registros"
                      description="Prueba ampliando el rango de fechas o quitando filtros."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow
                    key={r.row.id_auditoria}
                    className="border-slate-700/40 hover:bg-slate-800/60"
                  >
                    <TableCell className="whitespace-nowrap text-xs text-slate-300">
                      {formatearHoraLocal(r.row.fecha)}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-sm text-slate-200">
                      {r.nombreUsuario}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[var(--color-primario)]">
                      {r.row.accion}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">
                      {r.row.tabla}
                    </TableCell>
                    <TableCell className="max-w-[240px]">
                      <span className="block truncate text-sm text-slate-300">
                        {r.preview}
                        <span className="text-slate-500">…</span>
                      </span>
                      <button
                        type="button"
                        className="mt-0.5 text-xs font-semibold text-[var(--color-primario)] hover:underline"
                        onClick={() => {
                          setDetalle(r);
                          setModalOpen(true);
                        }}
                      >
                        Ver más
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </AuditoriaPanel>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
        <span>
          {total} registro{total === 1 ? "" : "s"} · página {totalPages === 0 ? 0 : page} de{" "}
          {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-slate-600/70 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500 disabled:pointer-events-none disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loading || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl border border-slate-600/70 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-200 transition hover:border-slate-500 disabled:pointer-events-none disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>

      <AuditoriaDetalleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        detalle={detalle}
      />
    </div>
  );
}
