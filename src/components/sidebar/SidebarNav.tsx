"use client";

import { esRutaActiva, type NavLinkItem } from "@/config/navegacion/navigationConfig";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SidebarNavProps = {
  links: NavLinkItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export default function SidebarNav({ links, collapsed = false, onNavigate, className = "" }: SidebarNavProps) {
  const pathname = usePathname();

  if (links.length === 0) {
    return null;
  }

  return (
    <nav className={`flex flex-col  font-bold ${className}`}>
      {links.map(({ id, label, href, Icon, exact }) => {
        const isActive = esRutaActiva(pathname, href, { exact });
        return (
          <Link key={id} href={href} onClick={onNavigate} title={collapsed ? label : undefined}>
            <button
              type="button"
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`sidebar-link flex w-full cursor-pointer items-center py-3 text-left font-bold ${
                collapsed ? "justify-center px-2" : "px-3"
              } ${isActive ? "sidebar-link-active" : ""}`}
            >
              <Icon className={`h-6 w-6 shrink-0 ${collapsed ? "" : "ml-1"}`} aria-hidden="true" />
              {!collapsed && <span className="ml-3 truncate font-light">{label}</span>}
            </button>
          </Link>
        );
      })}
    </nav>
  );
}
