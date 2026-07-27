

import { categoriaInterface } from '@/interfaces/interfaces';
import { useCategoriasStore } from '@/Store/CategoriasStore/listCategoriaStore';
import  { useEffect, useState } from 'react'


export function useListaCategoriaFiltroConMemoria() {
  const { listCategoriasStore } = useCategoriasStore();

  const [cargandoCategoriasConMemoria, setCargandoCategoriasConMemoria] = useState(false);
  const [categoriasListConMemoria, setCategoriasListConMemoria] = useState<categoriaInterface[]>();
  const [categoriaSelecionadaConMemoria, setCategoriaSelecionadaConMemoria] = useState<categoriaInterface>();

  useEffect(() => {
    if (listCategoriasStore.length > 0) {
      setCargandoCategoriasConMemoria(true);
      setCategoriasListConMemoria(listCategoriasStore);
      setCargandoCategoriasConMemoria(false);
    }
  }, [listCategoriasStore]);


  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    const categoriaLocalStorage = localStorage.getItem("CategoriaSelecionada");
    if (categoriaLocalStorage && categoriaLocalStorage !== "undefined") {
      setCategoriaSelecionadaConMemoria(JSON.parse(categoriaLocalStorage));
    }
  }, []);


  return { categoriasListConMemoria, cargandoCategoriasConMemoria, categoriaSelecionadaConMemoria, setCategoriaSelecionadaConMemoria };

}
