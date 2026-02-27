'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TableCell, TableRow } from '@/components/ui/table';

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

interface IssueRowProps {
  issue: Issue;
  onClick?: () => void;
}

export function IssueRow({ issue, onClick }: IssueRowProps) {
  const TypeIcon = typeIcons[issue.issueType?.name] ?? CheckSquare;
  const typeColor = typeColors[issue.issueType?.name] ?? 'text-gray-500';
  const PriorityIcon = issue.priority
    ? priorityIcons[issue.priority.level] ?? Minus
    : null;
  const priorityColor = issue.priority
    ? priorityColors[issue.priority.level] ?? 'text-gray-400'
    : '';

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onClick={onClick}
    >
      <TableCell className="w-24">
        <span className="text-xs font-medium text-muted-foreground">
          {issue.issueKey}
        </span>
      </TableCell>
      <TableCell className="w-8">
        <TypeIcon className={cn('size-4', typeColor)} />
      </TableCell>
      <TableCell className="max-w-[300px]">
        <span className="truncate text-sm">{issue.title}</span>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="text-[10px]"
          style={{
            borderColor: issue.status?.color,
            color: issue.status?.color,
          }}
        >
          {issue.status?.name}
        </Badge>
      </TableCell>
      <TableCell>
        {PriorityIcon ? (
          <div className="flex items-center gap-1.5">
            <PriorityIcon className={cn('size-3.5', priorityColor)} />
            <span className="text-xs">{issue.priority?.name}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        {issue.assignee ? (
          <div className="flex items-center gap-1.5">
            <Avatar size="sm">
              <AvatarImage src={issue.assignee.avatarUrl ?? undefined} />
              <AvatarFallback className="text-[9px]">
                {issue.assignee.firstName[0]}
                {issue.assignee.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">
              {issue.assignee.firstName}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Sin asignar</span>
        )}
      </TableCell>
      <TableCell>
        <span className="text-xs">
          {issue.sprint?.name ?? (
            <span className="text-muted-foreground">-</span>
          )}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <span className="text-xs">
          {issue.storyPoints ?? (
            <span className="text-muted-foreground">-</span>
          )}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-xs text-muted-foreground">
          {format(new Date(issue.createdAt), 'd MMM yy', { locale: es })}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-xs text-muted-foreground">
          {format(new Date(issue.updatedAt), 'd MMM yy', { locale: es })}
        </span>
      </TableCell>
    </TableRow>
  );
}
