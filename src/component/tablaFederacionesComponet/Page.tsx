import { federacionInterface } from '@/interfaces/interfaces';
import React from 'react'
import OverleyModal from '../modales/OverleyModal/Page';
import InformacionFederacionesComponent from '../informacion/informacionFederacionesComponet/Page';
import OverleyModalFormulario from '../modales/OverleyModalFormulario/Page';
import FormularioEditarFederacionComponent from '../formularios/formulariosFederaciones/FormularioEditarFederacionComponent/Page';

type Props = {
    federaciones: federacionInterface[];
    onRefresh?: () => void; // Función para refrescar los datos
}


const TablaFederaciones = ({federaciones, onRefresh }:Props) => {
  const [open, setOpen] = React.useState(false);
  const [openFormEditar, setOpenFormEditar] = React.useState(false);
  const [selectedFederacion, setSelectedFederacion] = React.useState<federacionInterface | null>(null);

  const seleccionarFila = (federacion: federacionInterface) => {
    setSelectedFederacion(federacion);
    setOpen(true);
  }
  const cerrarModal = () => {
    setOpen(false);
  }
  const abrirModalEditar = () => {
    setOpenFormEditar(true);
  };

  const cerrarModalEditar = () => {
    setOpenFormEditar(false);
  };

  
    return (
      <div>
    <OverleyModal open={open} onClose={cerrarModal}>
      {selectedFederacion && (
        <InformacionFederacionesComponent 
          federacion={selectedFederacion} 
          onClose={cerrarModal}
          onRefresh={onRefresh}
          openFormEditar={abrirModalEditar}
        />
      )}
    </OverleyModal>
    <OverleyModalFormulario open={openFormEditar} onClose={cerrarModalEditar}>
      {selectedFederacion && (
        <FormularioEditarFederacionComponent 
          federacionAEditar={selectedFederacion}
          refresacar={onRefresh ?? (() => {})}
          onClose={cerrarModalEditar}
        />
      )}
    </OverleyModalFormulario>
    

    
    <div className="">
   
      <table className="min-w-full  border ">
        <thead>
          <tr>
            <th className="px-4 py-2 border w-1">N°</th>
            <th className="px-4 py-2 border flex justify-start items-start">Nombre</th>
           
          </tr>
        </thead>
        <tbody>
          {federaciones.map((federacion, index) => (
            <tr key={federacion.idFederacion} onDoubleClick={() => seleccionarFila(federacion)} className="hover:bg-[#035a98] cursor-pointer">
              <td className="px-4 py-2 border">{index + 1}</td>
              <td className="px-4 py-2 border">{federacion.nombreFederacion}</td>
             
            </tr>
          ))}
        </tbody>
      </table>
     
    </div>
      </div>
  )
}

export default TablaFederaciones
