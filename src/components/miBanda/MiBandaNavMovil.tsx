import { getMiBandaNavLinks } from "@/config/navegacion/miBandaLinks";
import Link from "next/link";

type Props = {
  id: string;
  isPodium?: boolean;
};

export default function MiBandaNavMovil({ id, isPodium = false }: Props) {
  const iconClass = isPodium
    ? "h-5 w-5 shrink-0 text-amber-600"
    : "h-5 w-5 shrink-0 text-[var(--brand)]";
  const links = getMiBandaNavLinks(id, { includeInicio: false });

  return (
    <section className="flex w-full flex-col gap-2.5 lg:hidden" aria-label="Navegación de mi banda">
      {links.map(({ id: linkId, label, href, Icon }) => (
        <Link
          key={linkId}
          href={href}
          className="card-row-bg flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium text-[var(--app-fg)] shadow-sm transition hover:border-[var(--vz-border-strong)] hover:bg-[#fafafa] active:scale-[0.99]"
        >
          <span
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              isPodium ? "bg-amber-50" : "bg-[#e8f8fb]",
            ].join(" ")}
          >
            <Icon className={iconClass} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 capitalize">{label}</span>
          <span className="text-[var(--app-fg-muted)]" aria-hidden>
            →
          </span>
        </Link>
      ))}
    </section>
  );
}
