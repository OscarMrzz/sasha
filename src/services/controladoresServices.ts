import {
  categoriaInterface,
  vistaUsuariosPorBandaEnEventoInterface,
} from "@/models";
import { dataBaseSupabase } from "@/lib/supabase";

export async function getUsuariosPorEventoCategoria(
    idEvento: string,
    idCategoria: string,
  ): Promise<vistaUsuariosPorBandaEnEventoInterface[]> {
    if (!idEvento?.trim()) {
      throw new Error("idEvento es obligatorio.");
    }
    const { data, error } = await dataBaseSupabase
      .from("vista_usuarios_por_banda_en_evento")
      .select("*")
      .eq("id_foranea_evento", idEvento)
      .eq("id_foranea_categoria", idCategoria);

    if (error) throw error;
    return (data ?? []) as vistaUsuariosPorBandaEnEventoInterface[];
  }


export async function activarAccesoPorEventoCategoria(idEvento: string, idCategoria: string) {
    const { error } = await dataBaseSupabase.rpc("fn_cambiar_acceso_evento_categoria", {
      p_id_evento: idEvento,
      p_id_categoria: idCategoria,
      p_activar: true,
    });
    if (error) throw error;
    return true;
}

export async function desactivarAccesoPorEventoCategoria(idEvento: string, idCategoria: string) {
    const { error } = await dataBaseSupabase.rpc("fn_cambiar_acceso_evento_categoria", {
      p_id_evento: idEvento,
      p_id_categoria: idCategoria,
      p_activar: false,
    });
    if (error) throw error;
    return true;
}

export async function estaActivadoAccesoPorEventoCategoria(idEvento: string, idCategoria: string) {
    const usuarios = await getUsuariosPorEventoCategoria(idEvento, idCategoria);
    if (usuarios.length === 0) return false;

    for (const usuario of usuarios) {
        const { data, error } = await dataBaseSupabase
        .from("perfiles")
        .select("permisos")
        .eq("idPerfil", usuario.id_fonranea_perfil)
        .single();
        if (error) throw error;
        if (data.permisos === true) return true;
    }
    return false;
}


export async function cambiarAccesoPorEventoCategoria(idEvento: string, idCategoria: string) {

    const estadoActual = await estaActivadoAccesoPorEventoCategoria(idEvento, idCategoria);
    if (estadoActual) {
        await desactivarAccesoPorEventoCategoria(idEvento, idCategoria);
        return false;
    } else {
        await activarAccesoPorEventoCategoria(idEvento, idCategoria);
        return true;
    }
 
}

export async function getCategoriasPorEvento(
  idEvento: string,
): Promise<categoriaInterface[]> {
  if (!idEvento?.trim()) {
    throw new Error("idEvento es obligatorio.");
  }

  const { data, error } = await dataBaseSupabase
    .from("confirmacion_asistencia")
    .select(`
      bandas(
        idForaneaCategoria,
        categorias(*)
      )
    `)
    .eq("id_foranea_evento", idEvento)
    .eq("estado_asistencia", true);

  if (error) throw error;

  const categoriasPorId = new Map<string, categoriaInterface>();
  for (const row of data ?? []) {
    const banda = row.bandas as {
      categorias?: categoriaInterface | null;
    } | null;
    const categoria = banda?.categorias;
    if (categoria?.idCategoria) {
      categoriasPorId.set(categoria.idCategoria, categoria);
    }
  }

  return Array.from(categoriasPorId.values()).sort((a, b) =>
    (a.nombreCategoria ?? "").localeCompare(b.nombreCategoria ?? ""),
  );
}