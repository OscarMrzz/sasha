import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function MiBandaLayout({ children }: LayoutProps) {
  return <div className="w-full px-4 pb-24">{children}</div>;
}
