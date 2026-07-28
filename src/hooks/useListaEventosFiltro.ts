/* eslint-disable react-hooks/rules-of-hooks */
import { RegistroEventoInterface } from "@/models";
import RegistroEventossServices from "@/services/registroEventosServices";
import { useEventosStore } from "@/store/EventosStore/listEventosStore";
import { useEffect, useState } from "react";

/**
 * Todos los eventos de la federación del perfil (API directa).
 * Usar en paneles admin: el store global suele traer solo eventos asignados al equipo evaluador.
 */
export function useListaEventosFederacionAdmin() {
  const [cargandoEventos, setCargandoEventos] = useState(true);
  const [eventosList, setEventosList] = useState<RegistroEventoInterface[]>([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<RegistroEventoInterface>();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setCargandoEventos(true);
      try {
        const svc = new RegistroEventossServices();
        await svc.initPerfil();
        const data = await svc.get();
        const list = [...((data ?? []) as RegistroEventoInterface[])].sort((a, b) => {
          const ta = new Date(a.fechaEvento).getTime();
          const tb = new Date(b.fechaEvento).getTime();
          if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
          return tb - ta;
        });
        if (!cancelled) {
          setEventosList(list);
        }
      } catch (error) {
        console.error("Error cargando eventos de la federación (admin):", error);
        if (!cancelled) {
          setEventosList([]);
        }
      } finally {
        if (!cancelled) {
          setCargandoEventos(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    eventosList,
    cargandoEventos,
    eventoSeleccionado,
    setEventoSeleccionado,
  };
}

 export function uselistaEventosFiltro() {
  const { listEventosStore } = useEventosStore();
  const [cargandoEventos, setCargandoEventos] = useState(false);
    const [eventosList, setEventosList] = useState<RegistroEventoInterface[]>([]);

      const [eventoSeleccionado, setEventoSeleccionado] = useState<RegistroEventoInterface>();

  useEffect(() => {
    if (listEventosStore.length > 0) {
      setCargandoEventos(true);
    
      setEventosList(listEventosStore);
      setCargandoEventos(false);
    }
    }, [listEventosStore]);

    
  




    return { eventosList, cargandoEventos, eventoSeleccionado, setEventoSeleccionado };
}