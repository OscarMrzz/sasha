import * as React from "react";
import { EyeIcon, Trash2Icon, MoreVerticalIcon, ClipboardListIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuJuradoProps {
  onView: () => void;
  onDelete: () => void;
  onRubrica: () => void;
  iconColor?: string;
  iconSize?: number;
}

export default function MenuMasOpcionesVerEliminarRubrica({
  onView,
  onDelete,
  onRubrica,
  iconColor = "currentColor",
  iconSize = 24,
}: MenuJuradoProps): React.ReactElement {
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
            <DropdownMenuItem onClick={onRubrica} data-testid="menu-mas-opciones-rubrica">
              <ClipboardListIcon />
              Rúbrica
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete} data-testid="menu-mas-opciones-eliminar">
              <Trash2Icon />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
