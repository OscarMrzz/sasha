import * as React from "react";
import {
  EyeIcon,
  GavelIcon,
  LayoutGridIcon,
  MoreVerticalIcon,
  PencilIcon,
  ScaleIcon,
  ShieldAlertIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuMasOpcionesEventosProps {
  onView: () => void;
  onJurados: () => void;
  onFiscal: () => void;
  onDisciplina?: () => void;
  onMesa?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  mostrarDisciplina?: boolean;
  mostrarMesa?: boolean;
  mostrarEditar?: boolean;
  mostrarEliminar?: boolean;
  iconColor?: string;
  iconSize?: number;
}

export default function MenuMasOpcionesEventos({
  onView,
  onJurados,
  onFiscal,
  onDisciplina,
  onMesa,
  onEdit,
  onDelete,
  mostrarDisciplina = true,
  mostrarMesa = true,
  mostrarEditar = true,
  mostrarEliminar = true,
  iconColor = "currentColor",
  iconSize = 24,
}: MenuMasOpcionesEventosProps): React.ReactElement {
  const [portalHost, setPortalHost] = React.useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortalHost} className="inline-flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-muted/25 transition-colors duration-200"
          >
            <MoreVerticalIcon style={{ color: iconColor, width: iconSize, height: iconSize }} />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40" container={portalHost ?? undefined}>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onView} data-testid="menu-mas-opciones-ver">
              <EyeIcon />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onJurados} data-testid="menu-mas-opciones-jurados">
              <GavelIcon />
              Jurados
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onFiscal} data-testid="menu-mas-opciones-fiscal">
              <ScaleIcon />
              Fiscal
            </DropdownMenuItem>
            {mostrarDisciplina && onDisciplina ? (
              <DropdownMenuItem onClick={onDisciplina} data-testid="menu-mas-opciones-disciplina">
                <ShieldAlertIcon />
                Disciplina
              </DropdownMenuItem>
            ) : null}
            {mostrarMesa && onMesa ? (
              <DropdownMenuItem onClick={onMesa} data-testid="menu-mas-opciones-mesa">
                <LayoutGridIcon />
                Mesa
              </DropdownMenuItem>
            ) : null}
            {mostrarEditar || mostrarEliminar ? <DropdownMenuSeparator /> : null}
            {mostrarEditar && onEdit ? (
              <DropdownMenuItem onClick={onEdit} data-testid="menu-mas-opciones-editar">
                <PencilIcon />
                Editar
              </DropdownMenuItem>
            ) : null}
            {mostrarEliminar && onDelete ? (
              <DropdownMenuItem variant="destructive" onClick={onDelete} data-testid="menu-mas-opciones-eliminar">
                <Trash2Icon />
                Eliminar
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
