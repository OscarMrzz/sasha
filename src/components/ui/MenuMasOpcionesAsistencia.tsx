import * as React from "react";
import { CheckIcon, MoreVerticalIcon, XIcon } from "lucide-react";

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
  onConfirmar: () => void;
  onDenegar: () => void;
  iconColor?: string;
  iconSize?: number;
}

export default function MenuMasOpcionesAsistencia({
  onConfirmar,
  onDenegar,
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
            <span className="sr-only">Abrir menú de asistencia</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44" container={portalHost ?? undefined}>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onConfirmar} data-testid="menu-asistencia-confirmar">
              <CheckIcon />
              Confirmar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDenegar} data-testid="menu-asistencia-denegar">
              <XIcon />
              Denegar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
