"use client";

import SolicitudSancionLista from "@/component/solicitudSancion/SolicitudSancionLista";

export default function AplicarSancionCrud() {
  return (
    <SolicitudSancionLista
      titulo="Solicitudes de sanción"
      permitirResponder
    />
  );
}
