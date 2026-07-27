import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function MiBandaIdLayout({ children }: LayoutProps) {
  return <div className="w-full">{children}</div>;
}
