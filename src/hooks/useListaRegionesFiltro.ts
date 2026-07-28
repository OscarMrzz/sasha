import { regionesInterface } from '@/models';
import { useRegionesStore } from '@/store/listRegionesStore';
import React, { useEffect } from 'react'

export default function useListaRegionesFiltro() {
      const { listRegionesStore } = useRegionesStore();
        const [listaRegiones, setListaRegiones] = React.useState<regionesInterface[]>([]);
        const [regionSeleccionada, setRegionSeleccionada] = React.useState<regionesInterface | null>(null);

    
      useEffect(() => {
        if (listRegionesStore.length > 0) {
          setListaRegiones(listRegionesStore);
        }
      }, [listRegionesStore]);





  return { listaRegiones, regionSeleccionada, setRegionSeleccionada };
}


