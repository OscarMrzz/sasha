import * as React from "react";
import { CheckIcon, MoreVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  onResolver: () => void;
  deshabilitado?: boolean;
  iconColor?: string;
  iconSize?: number;
};

export default function MenuMasOpcionesResolver({
  onResolver,
  deshabilitado = false,
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
            disabled={deshabilitado}
            className="rounded-full hover:bg-muted/25 transition-colors duration-200"
          >
            <MoreVerticalIcon style={{ color: iconColor, width: iconSize, height: iconSize }} />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40" container={portalHost ?? undefined}>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={onResolver}
              disabled={deshabilitado}
              data-testid="menu-mas-opciones-resolver"
            >
              <CheckIcon />
              Resolver
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
