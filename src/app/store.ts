import { configureStore } from "@reduxjs/toolkit";
// Make sure the path and filename are correct; for example, if the folder is named 'overlays' and the file is 'overlaySlice.ts':
import overleyReducer from "@/features/overleys/overleySlice";
import rubricaReducer from "@/features/Rubrica/rubricaSlice";
import refrescadorData from "@/features/RefrescadorData/refrescadorDataSlice";
import criteriosReducer from "@/features/Criterios/CriteriosSlice";
import cumplimientosReducer from "@/features/cumplimientos/cumplimientosSlice";
import perfilActivo from "@/features/Perfil/PerfilSlice";
import overleyPerfileSlice from "@/features/Perfil/overleyPerfil";
import refrescadorDataPerfiles from "@/features/Perfil/refrescadorPerfiles";
import refrescadorDataEventos from "@/features/Eventos/refrescadorDataEventos";
import OverleyEventos from "@/features/Eventos/overleysEventosSlice"
import EventosReducer from "@/features/Eventos/eventosSlice";
import  PerfilSlice from "@/features/Perfil/PerfilSlice";
import registrosEquipoEvaliadorSlice from "@/features/EquipoEvaluador/EquipoEvaluadorSlice";
import refrescadorDataRegistroEquipoEvaluador from "@/features/EquipoEvaluador/RefrescadorEquipoRegistroEvaluador";
import OverleyRegsitroEquipoEvaluador from "@/features/EquipoEvaluador/OverleyEquipoEvaluador"
import evaluarCriterioSlice from "@/features/evaluar/evaluarSlice";
import resultadosGeneralesReducer from "@/features/resultadosGenerales/ResultadosGeneralesSlice";
import overletResultados from "@/features/resultadosGenerales/overlayResultados";




const store = configureStore({
    reducer: {
        overley: overleyReducer,
        rubrica: rubricaReducer,
        refrescadorData: refrescadorData,
        criterio: criteriosReducer,
        cumplimiento: cumplimientosReducer,
        perfilUsuarioActivo: perfilActivo,
        overleyPerfiles: overleyPerfileSlice,
        refrescadorDataPerfiles: refrescadorDataPerfiles,
        refrescadorDataEventos: refrescadorDataEventos,
        overleyEventos: OverleyEventos,
        eventos: EventosReducer,
        perfil: PerfilSlice,
        registrosEquipoEvaliador: registrosEquipoEvaliadorSlice,
        refrescadorDataRegistroEquipoEvaluador: refrescadorDataRegistroEquipoEvaluador,
        overleyRegistroEquipoEvaluador: OverleyRegsitroEquipoEvaluador,
        evaluarCriterio: evaluarCriterioSlice,
        resultadosGeneralesReducer: resultadosGeneralesReducer,
        overletResultados: overletResultados

    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;