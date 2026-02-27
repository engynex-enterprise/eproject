'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
} from 'lucide-react';
import type { Issue } from '@/shared/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const typeIcons: Record<string, React.ElementType> = {
  Epic: Zap,
  Story: BookOpen,
  Task: CheckSquare,
  Bug: Bug,
};

const typeColors: Record<string, string> = {
  Epic: 'text-purple-500',
  Story: 'text-green-500',
  Task: 'text-blue-500',
  Bug: 'text-red-500',
};

const priorityIcons: Record<string, React.ElementType> = {
  highest: ChevronsUp,
  high: ArrowUp,
  medium: Minus,
  low: ArrowDown,
  lowest: ChevronsDown,
};

const priorityColors: Record<string, string> = {
  highest: 'text-red-600',
  high: 'text-red-400',
  medium: 'text-orange-400',
  low: 'text-blue-400',
  lowest: 'text-blue-300',
};

interface KanbanCardProps {
  issue: Issue;
  onClick?: () => void;
  isDragOverlay?: boolean;
}

export function KanbanCard({ issue, onClick, isDragOverlay }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `issue-${issue.id}`,
    data: {
      type: 'issue',
      issue,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const TypeIcon = typeIcons[issue.issueType?.name] ?? CheckSquare;
  const typeColor = typeColors[issue.issueType?.name] ?? 'text-gray-500';
  const PriorityIcon = issue.priority
    ? priorityIcons[issue.priority.level] ?? Minus
    : null;
  const priorityColor = issue.priority
    ? priorityColors[issue.priority.level] ?? 'text-gray-400'
    : '';

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...(isDragOverlay ? {} : attributes)}
      {...(isDragOverlay ? {} : listeners)}
      className={cn(
        'cursor-grab rounded-md border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
        isDragging && 'opacity-40',
        isDragOverlay && 'rotate-2 shadow-lg',
      )}
      onClick={onClick}
    >
      {/* Issue key + type icon */}
      <div className="mb-1.5 flex items-center gap-1.5">
        <TypeIcon className={cn('size-3.5', typeColor)} />
        <span className="text-xs font-medium text-muted-foreground">
          {issue.issueKey}
        </span>
      </div>

      {/* Title */}
      <p className="mb-2 text-sm font-medium leading-snug line-clamp-2">
        {issue.title}
      </p>

      {/* Tags */}
      {issue.tags && issue.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {issue.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="size-2 rounded-full"
              style={{ backgroundColor: tag.color }}
              title={tag.name}
            />
          ))}
          {issue.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{issue.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer: priority + story points + assignee */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {PriorityIcon && (
            <PriorityIcon className={cn('size-3.5', priorityColor)} />
          )}
          {issue.storyPoints !== null && issue.storyPoints !== undefined && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {issue.storyPoints}
            </Badge>
          )}
        </div>
        {issue.assignee && (
          <Avatar size="sm">
            <AvatarImage src={issue.assignee.avatarUrl ?? undefined} />
            <AvatarFallback className="text-[9px]">
              {issue.assignee.firstName[0]}
              {issue.assignee.lastName[0]}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
