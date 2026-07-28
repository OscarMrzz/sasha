"use client";

import {
  AuditoriaBadge,
  AuditoriaEmpty,
  AuditoriaErrorBanner,
  AuditoriaPageHeader,
  AuditoriaPageShell,
  AuditoriaPanel,
  AuditoriaRefreshButton,
  AuditoriaSection,
} from "@/components/auditoria/AuditoriaUi";
import type {
  AccesoCategoriaVista,
  BandaEnCanchaVista,
  DesbloqueoCategoriaCard,
  EventoEnCursoVista,
  HistorialParticipacionEvento,
} from "@/models";
import {
  formatearHoraLocal,
  getAccesosPorEventoCategoria,
  getBandasEnCancha,
  getCardsDesbloqueoCategoria,
  getEventosEnCurso,
  getHistorialParticipacionHoy,
  mensajeErrorSupabase,
} from "@/services/auditoriaServices";
import { useCallback, useEffect, useState } from "react";

const POLL_MS = 30_000;

export default function AuditoriaEventosHoyPage() {
  const [eventos, setEventos] = useState<EventoEnCursoVista[]>([]);
  const [bandasCancha, setBandasCancha] = useState<BandaEnCanchaVista[]>([]);
  const [historial, setHistorial] = useState<HistorialParticipacionEvento[]>([]);
  const [accesos, setAccesos] = useState<AccesoCategoriaVista[]>([]);
  const [cards, setCards] = useState<DesbloqueoCategoriaCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarOperativo = useCallback(async () => {
    setError(null);
    try {
      const settled = await Promise.allSettled([
        getEventosEnCurso(),
        getBandasEnCancha(),
        getHistorialParticipacionHoy(),
        getAccesosPorEventoCategoria(),
        getCardsDesbloqueoCategoria(),
      ]);

      const [ev, bc, hist, acc, card] = settled;
      const fallos: string[] = [];

      if (ev.status === "fulfilled") setEventos(ev.value);
      else {
        setEventos([]);
        fallos.push(`Eventos: ${mensajeErrorSupabase(ev.reason)}`);
      }
      if (bc.status === "fulfilled") setBandasCancha(bc.value);
      else {
        setBandasCancha([]);
        fallos.push(`Cancha: ${mensajeErrorSupabase(bc.reason)}`);
      }
      if (hist.status === "fulfilled") setHistorial(hist.value);
      else {
        setHistorial([]);
        fallos.push(`Historial: ${mensajeErrorSupabase(hist.reason)}`);
      }
      if (acc.status === "fulfilled") setAccesos(acc.value);
      else {
        setAccesos([]);
        fallos.push(`Accesos: ${mensajeErrorSupabase(acc.reason)}`);
      }
      if (card.status === "fulfilled") setCards(card.value);
      else {
        setCards([]);
        fallos.push(`Desbloqueo: ${mensajeErrorSupabase(card.reason)}`);
      }

      if (fallos.length) {
        console.error("[auditoria operativa]", fallos.join(" | "));
        setError(fallos.join(" · "));
      }
    } catch (e) {
      console.error("[auditoria operativa]", mensajeErrorSupabase(e), e);
      setError(mensajeErrorSupabase(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarOperativo();
    const id = window.setInterval(() => {
      void cargarOperativo();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [cargarOperativo]);

  const bandasPorEvento = bandasCancha.reduce<Record<string, BandaEnCanchaVista[]>>(
    (acc, b) => {
      (acc[b.idEvento] ??= []).push(b);
      return acc;
    },
    {},
  );

  return (
    <AuditoriaPageShell>
      <AuditoriaPageHeader
        title="Auditoría de eventos"
        subtitle="Monitoreo en vivo del día: eventos iniciados, cancha, participación y accesos. Solo lectura. Se actualiza cada 30 s."
        action={
          <AuditoriaRefreshButton
            loading={loading}
            onClick={() => {
              setLoading(true);
              void cargarOperativo();
            }}
          />
        }
      />

      {error ? <AuditoriaErrorBanner message={error} /> : null}

      <AuditoriaSection
        title="Eventos en curso"
        description="Eventos con estado iniciado (aún no finalizados)."
      >
        {loading && eventos.length === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-slate-700/50 bg-slate-800/40"
              />
            ))}
          </div>
        ) : eventos.length === 0 ? (
          <AuditoriaEmpty
            title="No hay eventos en curso"
            description="Cuando un admin inicie un evento, aparecerá aquí."
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {eventos.map((e) => (
              <li key={e.idEvento}>
                <AuditoriaPanel className="p-4 transition hover:border-slate-600/80">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-slate-100">{e.lugarEvento}</h3>
                    <AuditoriaBadge tone="green">En curso</AuditoriaBadge>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    {e.fechaEvento}
                    {e.nombreRegion ? ` · ${e.nombreRegion}` : ""}
                    {e.tipoEvento ? ` · ${e.tipoEvento}` : ""}
                  </p>
                </AuditoriaPanel>
              </li>
            ))}
          </ul>
        )}
      </AuditoriaSection>

      <AuditoriaSection
        title="Banda en cancha"
        description="Quién colocó la banda actual y a qué hora, por evento en curso."
      >
        {eventos.length === 0 ? (
          <AuditoriaEmpty title="Sin eventos en curso" />
        ) : (
          <div className="space-y-4">
            {eventos.map((ev) => {
              const list = bandasPorEvento[ev.idEvento] ?? [];
              return (
                <AuditoriaPanel key={ev.idEvento} className="overflow-hidden">
                  <div className="border-b border-slate-700/50 px-4 py-3">
                    <h3 className="font-medium text-slate-100">{ev.lugarEvento}</h3>
                  </div>
                  {list.length === 0 ? (
                    <p className="px-4 py-5 text-sm text-slate-400">Nadie en cancha ahora.</p>
                  ) : (
                    <ul className="divide-y divide-slate-700/40">
                      {list.map((b) => (
                        <li
                          key={b.idConfirmacion}
                          className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-slate-100">{b.nombreBanda}</span>
                            {b.accionOrigen === "cancha_reponer" ? (
                              <AuditoriaBadge tone="amber">Reposición</AuditoriaBadge>
                            ) : (
                              <AuditoriaBadge tone="cyan">En cancha</AuditoriaBadge>
                            )}
                          </div>
                          <span className="text-sm text-slate-400">
                            {b.quienPusoNombre} · {formatearHoraLocal(b.horaPuesta)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </AuditoriaPanel>
              );
            })}
          </div>
        )}
      </AuditoriaSection>

      <AuditoriaSection
        title="Historial de participación"
        description="Eventos de hoy: en cancha primero, luego finalizadas (más reciente primero), luego pendientes."
      >
        {historial.length === 0 ? (
          <AuditoriaEmpty
            title="Sin historial del día"
            description="No hay eventos de hoy con bandas confirmadas."
          />
        ) : (
          <div className="space-y-4">
            {historial.map((h) => (
              <AuditoriaPanel key={h.idEvento} className="overflow-hidden">
                <div className="border-b border-slate-700/50 bg-slate-900/30 px-4 py-3">
                  <h3 className="font-medium text-slate-100">{h.lugarEvento}</h3>
                  <p className="text-xs text-slate-500">{h.fechaEvento}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-2.5 font-medium">Banda</th>
                        <th className="px-4 py-2.5 font-medium">Estado</th>
                        <th className="px-4 py-2.5 font-medium">Inicio</th>
                        <th className="px-4 py-2.5 font-medium">Fin</th>
                        <th className="px-4 py-2.5 font-medium">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h.participaciones.map((p) => (
                        <tr
                          key={p.idBanda}
                          className="border-t border-slate-700/40 text-slate-300"
                        >
                          <td className="px-4 py-2.5 font-medium text-slate-100">
                            {p.nombreBanda}
                          </td>
                          <td className="px-4 py-2.5">
                            {p.estado === "en_cancha" && (
                              <AuditoriaBadge tone="green">En cancha</AuditoriaBadge>
                            )}
                            {p.estado === "finalizada" && (
                              <AuditoriaBadge tone="slate">Finalizada</AuditoriaBadge>
                            )}
                            {p.estado === "pendiente" && (
                              <AuditoriaBadge tone="amber">Sin participar</AuditoriaBadge>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5">
                            {formatearHoraLocal(p.horaInicio)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2.5">
                            {formatearHoraLocal(p.horaFin)}
                          </td>
                          <td className="px-4 py-2.5 text-[var(--color-primario)]">
                            {p.duracionTexto ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AuditoriaPanel>
            ))}
          </div>
        )}
      </AuditoriaSection>

      <AuditoriaSection
        title="Accesos por categoría"
        description="Horas de bloqueo y desbloqueo registradas hoy."
      >
        {accesos.length === 0 ? (
          <AuditoriaEmpty title="Sin movimientos de acceso hoy" />
        ) : (
          <AuditoriaPanel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-2.5 font-medium">Evento</th>
                    <th className="px-4 py-2.5 font-medium">Categoría</th>
                    <th className="px-4 py-2.5 font-medium">Bloqueo</th>
                    <th className="px-4 py-2.5 font-medium">Desbloqueo</th>
                  </tr>
                </thead>
                <tbody>
                  {accesos.map((a) => (
                    <tr
                      key={`${a.idEvento}-${a.idCategoria}`}
                      className="border-t border-slate-700/40 text-slate-300"
                    >
                      <td className="px-4 py-2.5">{a.lugarEvento}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-100">
                        {a.nombreCategoria}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        {formatearHoraLocal(a.horaBloqueo)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        {formatearHoraLocal(a.horaDesbloqueo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AuditoriaPanel>
        )}
      </AuditoriaSection>

      <AuditoriaSection
        title="Tiempo a desbloqueo"
        description="Desde la última banda finalizada de la categoría hasta el desbloqueo de accesos."
      >
        {cards.length === 0 ? (
          <AuditoriaEmpty title="Sin datos para cards de desbloqueo" />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <li key={`${c.idEvento}-${c.idCategoria}`}>
                <AuditoriaPanel className="flex h-full flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-100">{c.nombreCategoria}</h3>
                    {c.pendienteDesbloqueo ? (
                      <AuditoriaBadge tone="amber">Pendiente</AuditoriaBadge>
                    ) : c.horaDesbloqueo ? (
                      <AuditoriaBadge tone="green">Desbloqueado</AuditoriaBadge>
                    ) : (
                      <AuditoriaBadge tone="slate">Sin datos</AuditoriaBadge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{c.lugarEvento}</p>
                  <dl className="mt-auto space-y-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Última banda</dt>
                      <dd className="text-right font-medium text-slate-200">
                        {c.nombreUltimaBanda ?? "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Fin participación</dt>
                      <dd className="text-right text-slate-300">
                        {formatearHoraLocal(c.horaUltimaFinalizacion)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Desbloqueo</dt>
                      <dd className="text-right text-slate-300">
                        {formatearHoraLocal(c.horaDesbloqueo)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2 border-t border-slate-700/50 pt-3">
                      <dt className="font-medium text-slate-200">Tiempo</dt>
                      <dd className="text-right text-base font-semibold text-[var(--color-primario)]">
                        {c.duracionTexto ?? "—"}
                      </dd>
                    </div>
                  </dl>
                </AuditoriaPanel>
              </li>
            ))}
          </ul>
        )}
      </AuditoriaSection>
    </AuditoriaPageShell>
  );
}
