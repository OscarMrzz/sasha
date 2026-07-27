"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ATAJOS } from "@/lib/atajos/config";
import "@/lib/atajos/installAtajosListener";
import { debeIgnorarAtajo, matchShortcut } from "@/lib/atajos/matchShortcut";
import {
  filtrarPaginasPorRol,
  obtenerPaginasPorSeccion,
  obtenerRolDesdeCookie,
  type PaginaNavegable,
  type SeccionAtajos,
} from "@/lib/atajos/navPorSeccion";

interface AtajosContextValue {
  paginasFiltradas: PaginaNavegable[];
  abrirBuscador: () => void;
  cerrarBuscador: () => void;
  buscadorAbierto: boolean;
  idBuscador: string;
  modalRef: React.RefObject<HTMLDialogElement | null>;
}

const AtajosContext = createContext<AtajosContextValue | null>(null);

interface AtajosProviderProps {
  seccion: SeccionAtajos;
  children: ReactNode;
}

export function AtajosProvider({ seccion, children }: AtajosProviderProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const idBuscador = useRef("miBuscador");
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [nombreRol, setNombreRol] = useState<string | undefined>(undefined);

  useEffect(() => {
    setNombreRol(obtenerRolDesdeCookie());
  }, []);

  const paginasFiltradas = useMemo(() => {
    const paginas = obtenerPaginasPorSeccion(seccion);
    return filtrarPaginasPorRol(paginas, nombreRol);
  }, [seccion, nombreRol]);

  const abrirBuscador = useCallback(() => {
    if (modalRef.current) {
      modalRef.current.showModal();
      setBuscadorAbierto(true);
      requestAnimationFrame(() => {
        const input = document.getElementById(idBuscador.current);
        if (input instanceof HTMLInputElement) {
          input.focus();
        }
      });
    }
  }, []);

  const cerrarBuscador = useCallback(() => {
    modalRef.current?.close();
    setBuscadorAbierto(false);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (debeIgnorarAtajo(event)) return;
      if (!ATAJOS.buscador.activado || !matchShortcut(event, ATAJOS.buscador)) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      abrirBuscador();
    };

    document.addEventListener("keydown", handler, { capture: true });
    return () => document.removeEventListener("keydown", handler, { capture: true });
  }, [abrirBuscador]);

  const value = useMemo<AtajosContextValue>(
    () => ({
      paginasFiltradas,
      abrirBuscador,
      cerrarBuscador,
      buscadorAbierto,
      idBuscador: idBuscador.current,
      modalRef,
    }),
    [paginasFiltradas, abrirBuscador, cerrarBuscador, buscadorAbierto],
  );

  return <AtajosContext.Provider value={value}>{children}</AtajosContext.Provider>;
}

export function useAtajosContext(): AtajosContextValue {
  const context = useContext(AtajosContext);
  if (!context) {
    throw new Error("useAtajosContext debe usarse dentro de AtajosProvider");
  }
  return context;
}
