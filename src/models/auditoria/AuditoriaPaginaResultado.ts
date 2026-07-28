import type { AuditoriaDetalleEnriquecido } from "./AuditoriaDetalleEnriquecido";

export interface AuditoriaPaginaResultado {
  rows: AuditoriaDetalleEnriquecido[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
