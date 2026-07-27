import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function ResponsableEventosLayout({ children }: LayoutProps) {
  return <div className="px-4 pb-16 lg:px-32">{children}</div>;
}
