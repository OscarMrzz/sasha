"use client";

import BuscadorGeneralComponent from "@/component/buscador/BuscadorGeneralComponent";
import { AtajosProvider } from "@/providers/AtajosProvider";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AtajosProvider seccion="secretaria">
      <div className="px-4 pb-16 lg:px-32">{children}</div>
      <BuscadorGeneralComponent />
    </AtajosProvider>
  );
}
