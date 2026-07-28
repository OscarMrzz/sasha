/* eslint-disable react-hooks/rules-of-hooks */
import { bandaInterface } from "@/models";
import BandasServices from "@/services/bandasServices";

import { useEffect, useState } from "react";



 export function uselistaBandasEventoCategoriaFiltro() {
  const [bandasList, setBandasList] = useState<bandaInterface[]>([]);
  const [bandasListSinFiltro, setBandasListSinFiltro] = useState<bandaInterface[]>([]);
  const [idEventoSeleccionadoFiltrarBanda, setIdEventoSeleccionadoFiltrarBanda] = useState<string>("");
  const [idCategoriaSeleccionadaFiltrarBanda, setIdCategoriaSeleccionadaFiltrarBanda] = useState<string>("");
  const [bandaSelecionada, setBandaSeleccionada] = useState<bandaInterface >();

  useEffect(() => {
    let cancelled = false;

    const fetchTodasLasBandasFederacion = async () => {
      try {
        const bandasServices = new BandasServices();
        await bandasServices.initPerfil();
        const bandas = await bandasServices.get();
        if (!cancelled) {
          setBandasListSinFiltro((bandas ?? []) as bandaInterface[]);
        }
      } catch (error) {
        console.error("Error obteniendo todas las bandas de la federación:", error);
        if (!cancelled) {
          setBandasListSinFiltro([]);
          setBandasList([]);
        }
      }
    };

    void fetchTodasLasBandasFederacion();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (bandasListSinFiltro.length === 0) {
      setBandasList([]);
      return;
    }
    const idCategoriaFiltro = idCategoriaSeleccionadaFiltrarBanda;
    if (!idCategoriaFiltro) {
      setBandasList(bandasListSinFiltro);
      return;
    }

    const bandasFiltradas = bandasListSinFiltro.filter((banda) => {
      return banda.idForaneaCategoria === idCategoriaFiltro;
    });

    setBandasList(bandasFiltradas);
  }, [idCategoriaSeleccionadaFiltrarBanda, bandasListSinFiltro]);

  

    return {
        bandasList,
        /** Todas las bandas de la federación (panel admin; no limita por asistencia al evento). */
        bandasDelEvento: bandasListSinFiltro,
        setIdEventoSeleccionadoFiltrarBanda,
        setIdCategoriaSeleccionadaFiltrarBanda,
        bandaSelecionada,
        setBandaSeleccionada
    };
}