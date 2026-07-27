import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Interface para el estado
interface EvaluacionItem {
    idCriterio: string;
    idCumplimiento: string;
    valor: number;
}

interface EvaluarState {
    evaluaciones: Record<string, EvaluacionItem>;
}

// Estado inicial
const initialState: EvaluarState = {
    evaluaciones: {},
};

const evaluarSlice = createSlice({
    name: "criterioEvaluar",
    initialState,
    reducers: {
        // Agregar o actualizar una evaluación
        agregarCriterioEvaluar: (state, action: PayloadAction<{ idCriterio: string; idCumplimiento: string; valor: number }>) => {
            const { idCriterio, idCumplimiento, valor } = action.payload;
            // Usamos idCriterio como clave única
            state.evaluaciones[idCriterio] = {
                idCriterio,
                idCumplimiento,
                valor
            };
        },



        // Eliminar una evaluación por clave
        eliminarCriterioEvaluado: (state, action: PayloadAction<string>) => {
            delete state.evaluaciones[action.payload];
        },

        // Limpiar todas las evaluaciones
        recetiarCriteriosEvaluados: (state) => {
            state.evaluaciones = {};
        },

        // Actualizar el valor de una evaluación específica
        updateCriterioEvaluado: (state, action: PayloadAction<{ idCriterio: string; idCumplimiento: string; valor: number }>) => {
            const { idCriterio, idCumplimiento, valor } = action.payload;
            
            if (state.evaluaciones[idCriterio]) {
                state.evaluaciones[idCriterio].idCumplimiento = idCumplimiento;
                state.evaluaciones[idCriterio].valor = valor;
            } else {
                // Si no existe, lo crea
                state.evaluaciones[idCriterio] = {
                    idCriterio,
                    idCumplimiento,
                    valor
                };
            }
        },

    },
});

// Exportar las acciones
export const {
    agregarCriterioEvaluar,
    eliminarCriterioEvaluado,
    recetiarCriteriosEvaluados,
    updateCriterioEvaluado,
} = evaluarSlice.actions;


export default evaluarSlice.reducer;



