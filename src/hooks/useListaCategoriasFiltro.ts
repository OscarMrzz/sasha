import { categoriaInterface } from "@/interfaces/interfaces";
import CategoriasServices from "@/lib/services/categoriaServices";
import { useCategoriasStore } from "@/Store/CategoriasStore/listCategoriaStore";
import { useCallback, useEffect, useRef, useState } from "react";

export function useListaCategoriaFiltro() {
  const { listCategoriasStore, setCategoriasStore } = useCategoriasStore();
  const categoriasServicesRef = useRef(new CategoriasServices());

  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  const [categoriasList, setCategoriasList] = useState<categoriaInterface[]>([]);
  const [categoriaSelecionada, setcategoriaSelecionada] = useState<categoriaInterface>();

  const recargarCategorias = useCallback(async () => {
    setCargandoCategorias(true);
    try {
      if (listCategoriasStore.length > 0) {
        setCategoriasList(listCategoriasStore);
        return;
      }

      const svc = categoriasServicesRef.current;
      await svc.initPerfil();
      const data = await svc.get();
      setCategoriasList(data);
      setCategoriasStore(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setCategoriasList([]);
    } finally {
      setCargandoCategorias(false);
    }
  }, [listCategoriasStore, setCategoriasStore]);

  useEffect(() => {
    if (listCategoriasStore.length > 0) {
      setCategoriasList(listCategoriasStore);
      return;
    }

    void recargarCategorias();
  }, [listCategoriasStore, recargarCategorias]);

  return {
    categoriasList,
    cargandoCategorias,
    categoriaSelecionada,
    setcategoriaSelecionada,
    recargarCategorias,
  };
}
