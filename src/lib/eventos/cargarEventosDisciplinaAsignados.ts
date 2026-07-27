import type {
  registroEquipoEvaluadorDatosAmpleosInterface,
  registroEventoDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import RegistroEquipoEvaluadorServices from "@/lib/services/registroEquipoEvaluadorServices";
import RegistroEventossServices from "@/lib/services/registroEventosServices";
import PerfilesServices from "@/lib/services/perfilesServices";
import { normalizarFechaEvento } from "@/component/diciplina/checkoutUtils";

const ROL_DISCIPLINA = "comite de disciplina";

function esAsignacionDelComite(
  asignacion: registroEquipoEvaluadorDatosAmpleosInterface,
  rolUsuarioLogueado?: string | null,
): boolean {
  const rolEnAsignacion = asignacion.perfiles?.roles?.nombreRol;
  if (rolEnAsignacion === ROL_DISCIPLINA) return true;
  // Si el perfil activo es comité de disciplina, toda asignación con su id es válida
  if (rolUsuarioLogueado === ROL_DISCIPLINA) return true;
  return false;
}

export async function cargarEventosDisciplinaAsignados(): Promise<
  registroEventoDatosAmpleosInterface[]
> {
  const perfilesSvc = new PerfilesServices();
  let idPerfil: string | null = null;
  let rolUsuario: string | null = null;

  try {
    const perfilAuth = await perfilesSvc.getUsuarioLogiado();
    idPerfil = perfilAuth.idPerfil ?? null;
    rolUsuario = perfilAuth.roles?.nombreRol ?? null;
  } catch {
    const reg = new RegistroEventossServices();
    await reg.initPerfil();
    idPerfil = reg.perfil?.idPerfil ?? null;
    rolUsuario = reg.perfil?.roles?.nombreRol ?? null;
  }

  if (!idPerfil) return [];

  const equipoSvc = new RegistroEquipoEvaluadorServices();
  const asignaciones = await equipoSvc.getporPerfil(idPerfil);

  const asignacionesDisciplina = asignaciones.filter((a) =>
    esAsignacionDelComite(a, rolUsuario),
  );

  const idsEvento = new Set(
    asignacionesDisciplina.map((a) => a.idForaneaEvento).filter(Boolean),
  );

  if (idsEvento.size === 0) return [];

  const regEventos = new RegistroEventossServices();
  await regEventos.initPerfil();
  const listaCompleta = await regEventos.getDatosAmpleos();

  const porId = new Map(
    listaCompleta.map((e) => [e.idEvento, e] as const),
  );

  const desdeLista = [...idsEvento]
    .map((id) => porId.get(id))
    .filter((e): e is registroEventoDatosAmpleosInterface => Boolean(e));

  if (desdeLista.length === idsEvento.size) {
    return desdeLista.sort((a, b) =>
      normalizarFechaEvento(b.fechaEvento).localeCompare(
        normalizarFechaEvento(a.fechaEvento),
      ),
    );
  }

  // Respaldo: datos embebidos en la asignación si registroEventos no devolvió filas (RLS parcial)
  const desdeAsignacion = asignacionesDisciplina
    .map((a) => a.registroEventos)
    .filter((ev): ev is registroEventoDatosAmpleosInterface => Boolean(ev?.idEvento))
    .filter((ev, i, arr) => arr.findIndex((x) => x.idEvento === ev.idEvento) === i);

  return desdeAsignacion.sort((a, b) =>
    normalizarFechaEvento(b.fechaEvento).localeCompare(
      normalizarFechaEvento(a.fechaEvento),
    ),
  );
}
