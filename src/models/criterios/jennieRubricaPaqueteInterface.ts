/** Rúbrica en paquete Jennie; idForaneaCategoria es el nombre de categoría, no UUID */
export interface jennieRubricaPaqueteInterface {
  idRubrica: string;
  created_at: string;
  nombreRubrica: string;
  datalleRubrica: string;
  puntosRubrica: number;
  idForaneaCategoria: string;
  idForaneaFederacion: string;
  versionRubrica: string;
}
