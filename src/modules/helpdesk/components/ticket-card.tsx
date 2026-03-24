'use client';

import {
  Ticket,
  MoreHorizontal,
  Clock,
  Hash,
  User,
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Circle,
  XCircle,
} from 'lucide-react';
import type { Issue } from '@/shared/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  ticket: Issue;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
  onClick?: (ticket: Issue) => void;
}

const priorityColors: Record<string, string> = {
  highest: '#FF5630',
  high: '#FF991F',
  medium: '#FFAB00',
  low: '#4C9AFF',
  lowest: '#8993A4',
};

const priorityLabels: Record<string, string> = {
  highest: 'Critica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
  lowest: 'Muy baja',
};

const statusGroupIcons: Record<string, React.ReactNode> = {
  todo: <Circle className="size-3" />,
  in_progress: <CircleDot className="size-3" />,
  done: <CheckCircle2 className="size-3" />,
  cancelled: <XCircle className="size-3" />,
};

const statusGroupColors: Record<string, string> = {
  todo: 'text-zinc-500',
  in_progress: 'text-blue-500',
  done: 'text-green-500',
  cancelled: 'text-red-500',
};

const statusGroupBorderColors: Record<string, string> = {
  todo: '#71717a',
  in_progress: '#3b82f6',
  done: '#22c55e',
  cancelled: '#ef4444',
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} dias`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
  return `Hace ${Math.floor(diffDays / 30)}m`;
}

export function TicketCard({ ticket, isSelected, onToggleSelect, onClick }: TicketCardProps) {
  const statusGroupType = ticket.status?.statusGroup?.type ?? 'todo';
  const borderColor = statusGroupBorderColors[statusGroupType] ?? '#71717a';

  return (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary/50 bg-primary/5',
      )}
      style={{ borderLeft: `4px solid ${borderColor}` }}
      onClick={() => onClick?.(ticket)}
    >
      {/* Checkbox de selección */}
      <div
        className={cn(
          'absolute left-3 top-3 z-10 transition-opacity',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleSelect?.(ticket.id);
        }}
      >
        <Checkbox
          checked={isSelected ?? false}
          className="size-4 bg-background shadow-sm"
          aria-label={`Seleccionar ${ticket.title}`}
        />
      </div>
      <div className="space-y-3 p-4">
        {/* Row 1: Icon + Title + Key badge */}
        <div className="flex items-start gap-2">
          <div
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: borderColor }}
          >
            <Ticket className="size-4" />
          </div>
          <h3 className="min-w-0 flex-1 text-base font-bold leading-tight">
            {ticket.title}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge
              className="text-[10px] font-semibold text-white"
              style={{ backgroundColor: borderColor }}
            >
              {ticket.issueKey}
            </Badge>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-6 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Row 2: Metadata - ID | Status | Priority | Updated */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Hash className="size-3" />
            {ticket.id}
          </span>
          <span className="text-muted-foreground/30">|</span>
          <span className={cn('flex items-center gap-1', statusGroupColors[statusGroupType])}>
            {statusGroupIcons[statusGroupType]}
            {ticket.status?.name ?? 'Sin estado'}
          </span>
          {ticket.priority && (
            <>
              <span className="text-muted-foreground/30">|</span>
              <span className="flex items-center gap-1" style={{ color: priorityColors[ticket.priority.level] }}>
                <AlertCircle className="size-3" />
                {priorityLabels[ticket.priority.level] ?? ticket.priority.name}
              </span>
            </>
          )}
          <span className="text-muted-foreground/30">|</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {formatRelativeDate(ticket.updatedAt)}
          </span>
        </div>

        {/* Row 3: Assignee & Reporter */}
        <div className="flex items-center gap-4 text-xs">
          {ticket.assignee ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <User className="size-3 text-muted-foreground" />
                    <span className="font-medium">Asignado:</span>
                    <Avatar className="size-5 border border-card">
                      <AvatarImage src={ticket.assignee.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-[7px] text-primary">
                        {ticket.assignee.firstName?.[0]}
                        {ticket.assignee.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground">
                      {ticket.assignee.firstName} {ticket.assignee.lastName}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Asignado a {ticket.assignee.firstName} {ticket.assignee.lastName}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <User className="size-3" />
              <span className="font-medium">Asignado:</span>
              Sin asignar
            </span>
          )}
        </div>

        {/* Row 4: Reporter */}
        {ticket.reporter && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertCircle className="size-3" />
            <span className="font-medium">Reportado por:</span>
            <Avatar className="size-5 border border-card">
              <AvatarImage src={ticket.reporter.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-[7px] text-primary">
                {ticket.reporter.firstName?.[0]}
                {ticket.reporter.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span>
              {ticket.reporter.firstName} {ticket.reporter.lastName}
            </span>
          </div>
        )}

        {/* Row 5: Tags */}
        {ticket.tags && ticket.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ticket.tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-[10px] font-normal"
                style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
              >
                {tag.name}
              </Badge>
            ))}
            {ticket.tags.length > 4 && (
              <Badge variant="outline" className="text-[10px] font-normal">
                +{ticket.tags.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
