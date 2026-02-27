'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Issue, Status } from '@/shared/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KanbanCard } from './kanban-card';

interface KanbanColumnProps {
  status: Status;
  issues: Issue[];
  wipLimit: number | null;
  onIssueClick?: (issue: Issue) => void;
  onAddIssue?: (statusId: number) => void;
}

export function KanbanColumn({
  status,
  issues,
  wipLimit,
  onIssueClick,
  onAddIssue,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status.id}`,
    data: {
      type: 'column',
      statusId: status.id,
    },
  });

  const isOverWip = wipLimit !== null && issues.length >= wipLimit;

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg bg-muted/50">
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {status.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {issues.length}
          </span>
        </div>
        {wipLimit !== null && (
          <span
            className={cn(
              'text-[10px] font-medium',
              isOverWip ? 'text-destructive' : 'text-muted-foreground',
            )}
          >
            MAX {wipLimit}
          </span>
        )}
      </div>

      {/* Issues List */}
      <ScrollArea className="flex-1 px-2">
        <SortableContext
          items={issues.map((i) => `issue-${i.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className={cn(
              'flex min-h-[60px] flex-col gap-2 rounded-md p-1 transition-colors',
              isOver && 'bg-primary/5 ring-2 ring-primary/20',
            )}
          >
            {issues.map((issue) => (
              <KanbanCard
                key={issue.id}
                issue={issue}
                onClick={() => onIssueClick?.(issue)}
              />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>

      {/* Add Issue Button */}
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => onAddIssue?.(status.id)}
        >
          <Plus className="size-4" />
          Crear incidencia
        </Button>
      </div>
    </div>
  );
}
