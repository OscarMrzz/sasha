export interface vistaBandasConfirmadasParaEventoInterface {
  idBanda:                     string;
  created_at:                  string; // Podrías usar Date si planeas transformarlo
  nombreBanda:                 string;
  AliasBanda:                  string | null;
  idForaneaCategoria:          string;
  idForaneaRegion:             string;
  idForaneaFederacion:         string;
  ciudadBanda:                 string | null;
  urlLogoBanda:                string | null;
  fechaFundacionBanda:         string | null;
  fechaInscripcionAFederacion: string | null;
  ubicacionSedeBanda:          string | null;
  id_foranea_banda:            string;
}
