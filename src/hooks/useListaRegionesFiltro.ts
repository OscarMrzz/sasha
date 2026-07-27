import { regionesInterface } from '@/interfaces/interfaces';
import { useRegionesStore } from '@/Store/listRegionesStore';
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


