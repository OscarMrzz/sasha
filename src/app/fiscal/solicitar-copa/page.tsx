"use client";

import GestorSolicitudesCopaFiscal from "@/components/solicitudCopa/GestorSolicitudesCopaFiscal";
import { useEventosFiscalDelDia } from "@/hooks/fiscal/useEventosFiscalDelDia";

export default function SolicitarCopaPage() {
  const { eventosValidos, isPending } = useEventosFiscalDelDia();

  return (
    <GestorSolicitudesCopaFiscal
      eventosFuente={eventosValidos}
      cargandoEventos={isPending}
      titulo="Solicitar copa"
    />
  );
}
