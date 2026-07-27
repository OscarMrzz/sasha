import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function FiscalAppLayout({ children }: Props) {
  return <div className="px-4 pb-60 lg:px-16 xl:px-24">{children}</div>;
}
