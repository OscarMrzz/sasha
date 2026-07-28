"use client";

import { useLayoutEffect, useRef } from "react";
import type { AccionPaginaId } from "@/config/atajos/config";
import {
  desregistrarAccionPagina,
  registrarAccionPagina,
} from "@/config/atajos/accionesRegistry";
import "@/config/atajos/installAtajosListener";

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
