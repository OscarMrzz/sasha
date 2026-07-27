import {
  registroEquipoEvaluadorDatosAmpleosInterface,
  rubricaDatosAmpleosInterface,
} from "@/interfaces/interfaces";

function esJurado(registro: registroEquipoEvaluadorDatosAmpleosInterface): boolean {
  return registro.perfiles?.roles?.nombreRol === "jurado";
}

export function rubricasDisponiblesParaJurado(
  rubricas: rubricaDatosAmpleosInterface[],
  equipoEvaluador: registroEquipoEvaluadorDatosAmpleosInterface[],
  idRegistroActual?: string,
): rubricaDatosAmpleosInterface[] {
  const rubricaActual =
    idRegistroActual != null
      ? equipoEvaluador.find((j) => j.idRegistroEvaluador === idRegistroActual)?.id_foranea_rubrica
      : undefined;

  const rubricasOcupadas = new Set(
    equipoEvaluador
      .filter(esJurado)
      .filter((j) => j.idRegistroEvaluador !== idRegistroActual)
      .map((j) => j.id_foranea_rubrica)
      .filter((id): id is string => Boolean(id)),
  );

  return rubricas.filter(
    (r) => !rubricasOcupadas.has(r.idRubrica) || r.idRubrica === rubricaActual,
  );
}
