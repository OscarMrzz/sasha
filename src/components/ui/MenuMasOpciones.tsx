import * as React from 'react'
import { EyeIcon, PencilIcon, Trash2Icon, MoreVerticalIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface ActionsDropdownProps {
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  iconColor?: string
  iconSize?: number
}

export default function MenuMasOpciones({ 
  onView, 
  onEdit, 
  onDelete,
  iconColor = 'currentColor',
  iconSize = 24
}: ActionsDropdownProps): React.ReactElement {
  const [portalHost, setPortalHost] = React.useState<HTMLDivElement | null>(null)

  return (
    <div ref={setPortalHost} className="inline-flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant='ghost' 
            size='icon'
            className='rounded-full hover:bg-muted/25 transition-colors duration-200'
          >
            <MoreVerticalIcon 
              style={{ color: iconColor, width: iconSize, height: iconSize }} 
            />
            <span className='sr-only'>Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-36' container={portalHost ?? undefined}>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={onView} data-testid="menu-mas-opciones-ver">
              <EyeIcon />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} data-testid="menu-mas-opciones-editar">
              <PencilIcon />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant='destructive' onClick={onDelete} data-testid="menu-mas-opciones-eliminar">
              <Trash2Icon />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


