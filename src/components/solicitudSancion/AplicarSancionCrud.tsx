"use client";

import SolicitudSancionLista from "@/components/solicitudSancion/SolicitudSancionLista";

export default function AplicarSancionCrud() {
  return (
    <SolicitudSancionLista
      titulo="Solicitudes de sanción"
      permitirResponder
    />
  );
}
