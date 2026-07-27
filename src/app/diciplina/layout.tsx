import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return <div className="px-4 pb-16 lg:px-8 xl:px-16">{children}</div>;
}
