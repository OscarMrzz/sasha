import type {
  bandaInterface,
  categoriaInterface,
  federacionInterface,
  RegistroEventoInterface,
  registroComentariosDatosAmpleosInterface,
  rubricaInterface,
  vistaResultadosModel,
} from "@/interfaces/interfaces";

export type ResultadosEventoReporteProps = {
  perfil: { federaciones?: federacionInterface | null };
  evento: RegistroEventoInterface;
  banda: bandaInterface;
  categoria?: categoriaInterface;
  totalGeneral: number;
  rubricasList: rubricaInterface[];
  puntosRubricas: Record<string, number>;
  resultados: vistaResultadosModel[];
  comentariosList: registroComentariosDatosAmpleosInterface[];
};
