"use client";

import AuditoriaGeneralTabla from "@/components/auditoria/AuditoriaGeneralTabla";
import {
  AuditoriaPageHeader,
  AuditoriaPageShell,
} from "@/components/auditoria/AuditoriaUi";

export default function AuditoriaGeneralPage() {
  return (
    <AuditoriaPageShell>
      <AuditoriaPageHeader
        title="Auditoría general"
        subtitle="Historial de acciones del sistema. Filtra por usuario, fechas, acción o tabla. Solo lectura."
      />
      <AuditoriaGeneralTabla />
    </AuditoriaPageShell>
  );
}
