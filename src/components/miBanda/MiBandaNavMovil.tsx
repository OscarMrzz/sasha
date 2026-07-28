import { getMiBandaNavLinks } from "@/config/navegacion/miBandaLinks";
import Link from "next/link";

type Props = {
  id: string;
  isPodium?: boolean;
};

const navItemClass =
  "flex w-full items-center gap-3 border border-slate-600 bg-slate-700/70 py-3 px-4 text-left text-sm font-medium text-slate-100 rounded-xl shadow-sm transition hover:border-slate-500 hover:bg-slate-700 active:scale-[0.99]";

export default function MiBandaNavMovil({ id, isPodium = false }: Props) {
  const navIconClass = `h-6 w-6 shrink-0 ${isPodium ? "text-amber-400" : "text-sky-400"}`;
  const links = getMiBandaNavLinks(id, { includeInicio: false });

  return (
    <section className="flex w-full flex-col gap-3 lg:hidden">
      {links.map(({ id: linkId, label, href, Icon }) => (
        <Link key={linkId} href={href} className={navItemClass}>
          <Icon className={navIconClass} aria-hidden="true" />
          <span className="min-w-0 flex-1">{label}</span>
        </Link>
      ))}
    </section>
  );
}
