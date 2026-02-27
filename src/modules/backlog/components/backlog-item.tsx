'use client';

import {
  Bug,
  BookOpen,
  CheckSquare,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronsUp,
  ChevronsDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Issue } from '@/shared/types';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const typeIcons: Record<string, React.ElementType> = {
  Epic: Zap,
  Story: BookOpen,
  Task: CheckSquare,
  Bug: Bug,
  'Sub-task': CheckSquare,
};

const typeColors: Record<string, string> = {
  Epic: 'text-purple-500',
  Story: 'text-green-500',
  Task: 'text-blue-500',
  Bug: 'text-red-500',
  'Sub-task': 'text-gray-500',
};

const priorityIcons: Record<string, React.ElementType> = {
  urgent: ChevronsUp,
  high: ArrowUp,
  medium: Minus,
  low: ArrowDown,
  none: ChevronsDown,
};

const priorityColors: Record<string, string> = {
  urgent: 'text-red-600',
  high: 'text-red-400',
  medium: 'text-orange-400',
  low: 'text-blue-400',
  none: 'text-gray-300',
};

function getDueDateInfo(dueDate: string | null) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const today = new Date();
  const daysUntil = differenceInDays(date, today);

  if (isPast(date) && !isToday(date)) {
    return { color: 'bg-red-100 text-red-700 border-red-200', icon: true, label: format(date, 'd MMM', { locale: es }) };
  }
  if (isToday(date)) {
    return { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: true, label: 'Hoy' };
  }
  if (daysUntil <= 3) {
    return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: true, label: format(date, 'd MMM', { locale: es }) };
  }
  return { color: 'bg-muted text-muted-foreground', icon: false, label: format(date, 'd MMM', { locale: es }) };
}

interface BacklogItemProps {
  issue: Issue;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onClick?: () => void;
  isDragging?: boolean;
}

export function BacklogItem({
  issue,
  selected,
  onSelect,
  onClick,
  isDragging,
}: BacklogItemProps) {
  const TypeIcon = typeIcons[issue.issueType?.name] ?? CheckSquare;
  const typeColor = typeColors[issue.issueType?.name] ?? 'text-gray-500';
  const priorityLevel = issue.priority?.level ?? issue.priority?.name?.toLowerCase() ?? '';
  const PriorityIcon = priorityIcons[priorityLevel] ?? null;
  const priorityColor = priorityColors[priorityLevel] ?? 'text-gray-400';
  const dueDateInfo = getDueDateInfo(issue.dueDate);

  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 border-b border-border/50 px-3 py-1.5 text-sm transition-colors hover:bg-muted/40 cursor-pointer',
        selected && 'bg-primary/5',
        isDragging && 'opacity-50',
      )}
      onClick={onClick}
    >
      {/* Expand arrow */}
      <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />

      {/* Checkbox */}
      <Checkbox
        checked={selected}
        onCheckedChange={(checked) => onSelect?.(!!checked)}
        onClick={(e) => e.stopPropagation()}
        className="size-3.5"
      />

      {/* Issue type icon */}
      <TypeIcon className={cn('size-4 shrink-0', typeColor)} />

      {/* Issue key */}
      <span className="shrink-0 text-xs font-medium text-muted-foreground min-w-[5rem]">
        {issue.issueKey}
      </span>

      {/* Title */}
      <span className="min-w-0 flex-1 truncate text-sm">{issue.title}</span>

      {/* Tags/Labels as colored badges */}
      {issue.tags && issue.tags.length > 0 && (
        <div className="flex shrink-0 items-center gap-1">
          {issue.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag.id}
              className="h-5 rounded-sm px-1.5 text-[10px] font-medium uppercase tracking-wide"
              style={{
                backgroundColor: tag.color + '20',
                color: tag.color,
                borderColor: tag.color + '40',
              }}
            >
              {tag.name.length > 16 ? tag.name.substring(0, 16) + '...' : tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Status badge */}
      <Badge
        variant="outline"
        className="shrink-0 h-5 rounded-sm px-1.5 text-[10px] font-medium uppercase tracking-wide"
        style={{
          borderColor: issue.status?.color ?? undefined,
          color: issue.status?.color ?? undefined,
        }}
      >
        {issue.status?.name}
      </Badge>

      {/* Due date with warning */}
      {dueDateInfo && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  'flex shrink-0 items-center gap-0.5 rounded-sm border px-1.5 py-0.5 text-[10px] font-medium',
                  dueDateInfo.color,
                )}
              >
                {dueDateInfo.icon && <AlertTriangle className="size-2.5" />}
                {dueDateInfo.label}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fecha limite: {format(new Date(issue.dueDate!), 'PPP', { locale: es })}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Story points */}
      {issue.storyPoints != null && (
        <span className="shrink-0 text-[11px] text-muted-foreground w-8 text-right">
          {issue.storyPoints}p
        </span>
      )}

      {/* Priority icon */}
      {PriorityIcon && (
        <PriorityIcon className={cn('size-3.5 shrink-0', priorityColor)} />
      )}

      {/* Assignee avatar */}
      {issue.assignee ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="size-6 shrink-0">
                <AvatarImage src={issue.assignee.avatarUrl ?? undefined} />
                <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                  {issue.assignee.firstName?.[0]}
                  {issue.assignee.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{issue.assignee.firstName} {issue.assignee.lastName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="size-6 shrink-0" />
      )}
    </div>
  );
}
