export interface vistaAsistenBandasModel {
  idForaneaEvento: string;
  created_at: string; // timestamp with time zone
  idForaneaCategoria: string;
  idForaneaRegion: string;
  idForaneaFederacion: string;
    fechaFundacionBanda: string | null; // formato 'YYYY-MM-DD'
    fechaInscripcionAFederacion: string | null; // formato 'YYYY-MM-DD'
  idBanda: string;
  LugarEvento: string;
  urlLogoBanda: string;
  ubicacionSedeBanda: string;
  nombreBanda: string;
  AliasBanda: string;
  ciudadBanda: string;
}
