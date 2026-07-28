export interface DesbloqueoCategoriaCard {
  idEvento: string;
  lugarEvento: string;
  idCategoria: string;
  nombreCategoria: string;
  idUltimaBanda: string | null;
  nombreUltimaBanda: string | null;
  horaUltimaFinalizacion: string | null;
  horaDesbloqueo: string | null;
  duracionMs: number | null;
  duracionTexto: string | null;
  pendienteDesbloqueo: boolean;
}
