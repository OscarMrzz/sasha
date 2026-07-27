import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex w-full items-center justify-center px-2 lg:px-60">{children}</div>
  );
};

export default Layout;
