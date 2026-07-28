"use client";

import SolicitudSancionLista from "@/components/solicitudSancion/SolicitudSancionLista";

export default function SolicitudSancionCrud() {
  return (
    <SolicitudSancionLista
      titulo="Solicitar sanción administrativa"
      mostrarAgregar
    />
  );
}
