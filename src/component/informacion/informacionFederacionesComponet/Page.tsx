import { federacionInterface } from '@/interfaces/interfaces'
import FederacionesService from '@/lib/services/federacionesServices';
import React from 'react'

type Props = {
    federacion: federacionInterface;
    onClose?: () => void; // Función para cerrar el modal
    onRefresh?: () => void; // Función para refrescar los datos
    openFormEditar?: () => void; // Función para abrir el formulario de edición
}

const InformacionFederacionesComponent = ({ federacion, onClose, onRefresh, openFormEditar }: Props) => {
    const eliminarFederacion = () => {
        const federacionesServices = new FederacionesService();
        federacionesServices.delete(federacion.idFederacion)
            .then(() => {
            
                onRefresh?.(); // Refrescar los datos
                onClose?.(); // Cerrar el modal después de eliminar
            })
            .catch((error: unknown) => {
                console.error("❌ Error al eliminar la federación:", error);
            });
    }

    const onclickEditar = () => {
        openFormEditar?.();
        onClose?.();
    }

    return (
        <div>
            <div className='flex p-8 justify-between'>
                <div>
                    <h2>{federacion.nombreFederacion}</h2>
                    <p>ID: {federacion.idFederacion}</p>
                    <p>Creado: {new Date(federacion.created_at).toLocaleDateString()}</p>
                </div>
                <div className='flex flex-col gap-2'>
                    <button className='border-2 border-white w-20 p-1 hover:bg-blue-400 cursor-pointer' onClick={eliminarFederacion}>Eliminar</button>
                    <button className='border-2 border-white w-20 p-1 hover:bg-blue-400 cursor-pointer' onClick={onclickEditar}>Editar</button>
                </div>
            </div>
        </div>
    )
}

export default InformacionFederacionesComponent
