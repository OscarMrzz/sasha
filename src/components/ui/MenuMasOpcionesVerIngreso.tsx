import * as React from "react";
import { DoorOpenIcon, EyeIcon, MoreVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  onView: () => void;
  onIngreso?: () => void;
  iconColor?: string;
  iconSize?: number;
}

export default function MenuMasOpcionesVerIngreso({
  onView,
  onIngreso,
  iconColor = "currentColor",
  iconSize = 24,
}: Props): React.ReactElement {
  const [portalHost, setPortalHost] = React.useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortalHost} className="inline-flex shrink-0">
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
            {onIngreso ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onIngreso} data-testid="menu-mas-opciones-ingreso">
                  <DoorOpenIcon />
                  Ingreso
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
