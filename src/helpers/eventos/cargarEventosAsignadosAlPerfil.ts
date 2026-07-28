import type { registroEventoDatosAmpleosInterface } from "@/models";
import RegistroEquipoEvaluadorServices from "@/services/registroEquipoEvaluadorServices";
import RegistroEventossServices from "@/services/registroEventosServices";

export async function cargarEventosAsignadosAlPerfil(): Promise<
  registroEventoDatosAmpleosInterface[]
> {
  const reg = new RegistroEventossServices();
  await reg.initPerfil();
  const listaCompleta = await reg.getDatosAmpleos();

  const equipoSvc = new RegistroEquipoEvaluadorServices();
  await equipoSvc.initPerfil();
  const idPerfil = reg.perfil?.idPerfil;
  if (!idPerfil) return [];

  const asignaciones = await equipoSvc.getporPerfil(idPerfil);
  const ids = new Set(asignaciones.map((a) => a.idForaneaEvento));
  return listaCompleta.filter((e) => ids.has(e.idEvento));
}

export async function obtenerIdPerfilActivo(): Promise<string | null> {
  const reg = new RegistroEventossServices();
  await reg.initPerfil();
  return reg.perfil?.idPerfil ?? null;
}
