export type OpcionesGeneradorPdf = {
  margin?: number | number[];
  image?: { type?: string; quality?: number };
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    allowTaint?: boolean;
    backgroundColor?: string | null;
  };
  jsPDF?: {
    unit?: string;
    format?: string | string[];
    orientation?: "portrait" | "landscape";
  };
};

const opcionesPorDefecto: OpcionesGeneradorPdf = {
  margin: 0,
  image: { type: "jpeg", quality: 1 },
  html2canvas: {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
  },
  jsPDF: { unit: "mm", format: "letter", orientation: "portrait" },
};

/**
 * Renderiza un nodo del DOM como PDF y lo descarga.
 * @param elemento — Contenedor HTML a capturar (p. ej. el `ref.current` del reporte).
 * @param nombreArchivo — Nombre del archivo, idealmente terminado en `.pdf`.
 * @param opciones — Opciones parciales de html2pdf (se fusionan con las por defecto).
 */
export async function generarPdfDesdeElemento(
  elemento: HTMLElement,
  nombreArchivo: string,
  opciones?: OpcionesGeneradorPdf
): Promise<void> {
  const html2pdf = (await import("html2pdf-pro")).default;
  const opt = {
    margin: opciones?.margin ?? opcionesPorDefecto.margin,
    filename: nombreArchivo.endsWith(".pdf")
      ? nombreArchivo
      : `${nombreArchivo}.pdf`,
    image: { ...opcionesPorDefecto.image, ...opciones?.image },
    html2canvas: {
      ...opcionesPorDefecto.html2canvas,
      ...opciones?.html2canvas,
    },
    jsPDF: { ...opcionesPorDefecto.jsPDF, ...opciones?.jsPDF },
  };
  await html2pdf().set(opt).from(elemento).save();
}
