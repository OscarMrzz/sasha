import { perfilDatosAmpleosInterface, perfilInterface } from '@/models';
import React from 'react';
import MenuMasOpciones from '@/components/ui/MenuMasOpciones';

type Props = {
  index?: number;
  perfil: perfilDatosAmpleosInterface;
  abrirInformacion: (perfil: perfilDatosAmpleosInterface) => void;
  abrirEditar: (perfil: perfilDatosAmpleosInterface) => void;
  abrirEliminar: (perfil: perfilDatosAmpleosInterface) => void;
  ultimoUsuario: perfilInterface | null;
  mostrarAnimacion: boolean;
};

export default function CardRow({
  index,
  perfil,
  abrirInformacion,
  abrirEditar,
  abrirEliminar,
  ultimoUsuario,
  mostrarAnimacion,
}: Props) {
  const isNuevo = perfil.codigo === ultimoUsuario?.codigo && mostrarAnimacion;

  const indexBadge =
    index != null ? (
      <p className="card-row-index text-lg">
        {index}
      </p>
    ) : null;

  if (isNuevo) {
    return (
      <div
        data-testid="card-row-nuevo"
        data-codigo={perfil.codigo}
        onDoubleClick={() => abrirInformacion(perfil)}
        className="animate-pulse"
      >
        <div className="bg-slate-400 text-slate-700 rounded-lg flex h-25 w-full flex-wrap items-center justify-between p-4">
          <div className="flex min-w-0 items-center gap-4">
            {indexBadge}
            <div>
              <h2 className="text-xl">{perfil.nombre}</h2>
            </div>
          </div>
          <div data-testid="menu-mas-opciones" >
            <MenuMasOpciones
              onView={() => abrirInformacion(perfil)}
              onEdit={() => abrirEditar(perfil)}
              onDelete={() => abrirEliminar(perfil)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="card-row"
      data-codigo={perfil.codigo}
      onDoubleClick={() => abrirInformacion(perfil)}
      className="flex h-25 w-full flex-wrap items-center justify-between rounded-lg card-row-bg p-4 shadow-md cursor-pointer"
    >
      <div className="flex min-w-0 items-center gap-4">
        {indexBadge}
        <div>
          <h2 className="text-xl">{perfil.nombre}</h2>
        </div>
      </div>
      <div data-testid="menu-mas-opciones">
        <MenuMasOpciones
          onView={() => abrirInformacion(perfil)}
          onEdit={() => abrirEditar(perfil)}
          onDelete={() => abrirEliminar(perfil)}
        />
      </div>
    </div>
  );
}
