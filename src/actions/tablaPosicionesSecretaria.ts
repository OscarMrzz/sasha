"use server";

import { getTablaPosicionesPorFederacionRegionCategoria } from "@/services/servidor/resultadosServices";

export async function fetchTablaPosicionesSecretaria(
  idFederacion: string,
  idRegion: string,
  idCategoria: string,
) {
  return getTablaPosicionesPorFederacionRegionCategoria(
    idFederacion,
    idRegion,
    idCategoria,
  );
}
