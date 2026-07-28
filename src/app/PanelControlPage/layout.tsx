"use client";

import BuscadorGeneralComponent from "@/components/buscador/BuscadorGeneralComponent";
import { AtajosProvider } from "@/providers/AtajosProvider";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <AtajosProvider seccion="panel">
      <div className="px-4 pb-16 lg:px-32">{children}</div>
      <BuscadorGeneralComponent />
    </AtajosProvider>
  );
};

export default Layout;
