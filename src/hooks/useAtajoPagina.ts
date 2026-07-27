"use client";

import { useLayoutEffect, useRef } from "react";
import type { AccionPaginaId } from "@/lib/atajos/config";
import {
  desregistrarAccionPagina,
  registrarAccionPagina,
} from "@/lib/atajos/accionesRegistry";
import "@/lib/atajos/installAtajosListener";

export default function useAtajoPagina(accion: AccionPaginaId, callback: () => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useLayoutEffect(() => {
    const handler = () => {
      callbackRef.current();
    };
    registrarAccionPagina(accion, handler);
    return () => desregistrarAccionPagina(accion);
  }, [accion]);
}
