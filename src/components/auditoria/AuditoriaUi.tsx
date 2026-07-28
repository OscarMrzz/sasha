import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

export function AuditoriaPageShell({ children }: { children: ReactNode }) {
  return <div className="w-full space-y-10 pb-16">{children}</div>;
}

export function AuditoriaPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
        <p className="max-w-2xl text-sm text-slate-400">{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

export function AuditoriaRefreshButton({
  loading,
  onClick,
  label = "Actualizar",
}: {
  loading: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[var(--color-primario)] px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-[var(--color-primario)]/25 transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-50 sm:self-auto"
    >
      <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {label}
    </button>
  );
}

export function AuditoriaSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        {description ? <p className="text-sm text-slate-400">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function AuditoriaPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-700/50 bg-slate-800/40 ${className}`}
    >
      {children}
    </div>
  );
}

export function AuditoriaEmpty({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-600/60 bg-slate-900/30 px-6 py-12 text-center">
      <p className="text-base font-medium text-slate-200">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}

export function AuditoriaBadge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "slate" | "cyan";
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
      : tone === "amber"
        ? "bg-amber-500/15 text-amber-200 ring-amber-500/30"
        : tone === "cyan"
          ? "bg-[var(--color-primario)]/15 text-[var(--color-primario)] ring-[var(--color-primario)]/30"
          : "bg-slate-500/20 text-slate-300 ring-slate-500/30";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {children}
    </span>
  );
}

export function AuditoriaErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {message}
    </div>
  );
}

export function AuditoriaFieldLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-xs font-medium text-slate-400 ${className}`}>
      {children}
    </label>
  );
}

export const auditoriaInputClass =
  "rounded-xl border border-slate-600/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-[var(--color-primario)]/60 focus:ring-2 focus:ring-[var(--color-primario)]/20";
