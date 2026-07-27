import { categoriaInterface } from '@/interfaces/interfaces';
import React from 'react'
import OverleyModal from '../modales/OverleyModal/Page';
import InformacionCategoriasComponet from '../informacion/informacionCategoriasComponet/Page';
import OverleyModalFormulario from '../modales/OverleyModalFormulario/Page';
import FormularioEditarCategoriaComponent from '../formularios/FormulariosCategorias/FormularioEditarCategoriaComponet/Page';

type Props = {
    categorias: categoriaInterface[];
    onRefresh?: () => void; // Función para refrescar los datos
}


const TablaCategoriasComponent = ({categorias, onRefresh }:Props) => {
  const [open, setOpen] = React.useState(false);
  const [openFormularioEditar, setOpenFormularioEditar] = React.useState(false);
  const [selectedRegion, setSelectedRegion] = React.useState<categoriaInterface | null>(null);
  const [selectedCategoria, setSelectedCategoria] = React.useState<categoriaInterface | null>(null);

  const seleccionarFila = (categoria: categoriaInterface) => {
    setSelectedCategoria(categoria);
    setOpen(true);
  }
  const cerrarModal = () => {
    setOpen(false);
  }
  const abrirFormularioEditar = () => {
    setOpenFormularioEditar(true);
    setOpen(false);
  }

  const cerrarFormularioEditar = () => {
    setOpenFormularioEditar(false);
    setSelectedRegion(null);
  }

  
    return (
      <div>
    <OverleyModal open={open} onClose={cerrarModal}>
      {selectedCategoria && (
        <InformacionCategoriasComponet 
           categoria={selectedCategoria} 

          onClose={cerrarModal}
          onRefresh={onRefresh}
          openFormEditar={abrirFormularioEditar}
        />
      )}
    </OverleyModal>

     <OverleyModalFormulario open={openFormularioEditar} onClose={cerrarFormularioEditar}>
     <FormularioEditarCategoriaComponent
      CategoriaAEditar={selectedCategoria!}
      onClose={cerrarFormularioEditar}
      refresacar={() => {
        onRefresh?.();
        cerrarFormularioEditar();
      }}
     />
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
          {categorias.map((categoria, index) => (
            <tr key={categoria.idCategoria} onDoubleClick={() => seleccionarFila(categoria)} className="hover:bg-[#035a98] cursor-pointer">
              <td className="px-4 py-2 border">{index + 1}</td>
              <td className="px-4 py-2 border">{categoria.nombreCategoria}</td>
             
            </tr>
          ))}
        </tbody>
      </table>
     
    </div>
      </div>
  )
}

export default TablaCategoriasComponent
