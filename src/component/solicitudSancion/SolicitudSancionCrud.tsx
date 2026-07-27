"use client";

import SolicitudSancionLista from "@/component/solicitudSancion/SolicitudSancionLista";

export default function SolicitudSancionCrud() {
  return (
    <SolicitudSancionLista
      titulo="Solicitar sanción administrativa"
      mostrarAgregar
    />
  );
}
