'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Play,
  CheckCircle2,
  Clock,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';
import type { Sprint } from '@/shared/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const statusConfig = {
  planning: {
    label: 'Planificado',
    icon: Clock,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  active: {
    label: 'Activo',
    icon: Play,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  completed: {
    label: 'Completado',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-200',
  },
};

interface SprintListProps {
  sprints: Sprint[];
  onStartSprint: (sprintId: number) => void;
  onCompleteSprint: (sprintId: number) => void;
  onEditSprint: (sprint: Sprint) => void;
  onDeleteSprint: (sprintId: number) => void;
}

export function SprintList({
  sprints,
  onStartSprint,
  onCompleteSprint,
  onEditSprint,
  onDeleteSprint,
}: SprintListProps) {
  if (sprints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Clock className="size-10 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No hay sprints creados aun.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sprints.map((sprint) => {
        const config = statusConfig[sprint.status];
        const StatusIcon = config.icon;

        return (
          <Card key={sprint.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">{sprint.name}</CardTitle>
                <Badge variant="outline" className={cn('text-xs', config.color)}>
                  <StatusIcon className="size-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {sprint.status === 'planning' && (
                  <Button size="sm" onClick={() => onStartSprint(sprint.id)}>
                    <Play className="size-3.5" />
                    Iniciar
                  </Button>
                )}
                {sprint.status === 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCompleteSprint(sprint.id)}
                  >
                    <CheckCircle2 className="size-3.5" />
                    Completar
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditSprint(sprint)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDeleteSprint(sprint.id)}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {sprint.goal && (
                <p className="text-sm text-muted-foreground">{sprint.goal}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {sprint.startDate && (
                  <span>
                    Inicio:{' '}
                    {format(new Date(sprint.startDate), 'd MMM yyyy', {
                      locale: es,
                    })}
                  </span>
                )}
                {sprint.endDate && (
                  <span>
                    Fin:{' '}
                    {format(new Date(sprint.endDate), 'd MMM yyyy', {
                      locale: es,
                    })}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
