'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Issue } from '@/shared/types';
import type { SprintWithIssues } from '../services/backlog.service';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BacklogItem } from './backlog-item';
import { InlineCreateIssue } from './inline-create-issue';
import type { BacklogIssueType } from '../services/backlog.service';

interface SprintSectionProps {
  sprint: SprintWithIssues;
  selectedIssues: Set<number>;
  onToggleSelect: (issueId: number, selected: boolean) => void;
  onToggleSelectAll: (sprintId: number, selected: boolean) => void;
  onIssueClick: (issue: Issue) => void;
  onStartSprint?: () => void;
  onCompleteSprint?: () => void;
  onCreateIssue?: (title: string, issueTypeId: number, sprintId: number) => void;
  isCreating?: boolean;
  issueTypes: BacklogIssueType[];
}

export function SprintSection({
  sprint,
  selectedIssues,
  onToggleSelect,
  onToggleSelectAll,
  onIssueClick,
  onStartSprint,
  onCompleteSprint,
  onCreateIssue,
  isCreating,
  issueTypes,
}: SprintSectionProps) {
  const [open, setOpen] = useState(true);

  const allSelected =
    sprint.issues.length > 0 &&
    sprint.issues.every((i) => selectedIssues.has(i.id));

  // Compute point totals by status group
  const totalPoints = sprint.totalPoints;

  // Get unique assignees
  const assignees = Array.from(
    new Map(
      sprint.issues
        .filter((i) => i.assignee)
        .map((i) => [i.assignee!.id, i.assignee!]),
    ).values(),
  );

  const dateRange =
    sprint.startDate && sprint.endDate
      ? `${format(new Date(sprint.startDate), 'd MMM', { locale: es })} – ${format(new Date(sprint.endDate), 'd MMM', { locale: es })}`
      : '';

  return (
    <div className="rounded-lg border bg-card">
      {/* Sprint Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Select all checkbox */}
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) =>
            onToggleSelectAll(sprint.id, !!checked)
          }
          className="size-3.5"
        />

        {/* Collapse toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          {open ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>

        {/* Sprint name */}
        <button
          onClick={() => setOpen(!open)}
          className="font-semibold text-sm hover:underline"
        >
          {sprint.name}
        </button>

        {/* Date range */}
        {dateRange && (
          <span className="text-xs text-muted-foreground">{dateRange}</span>
        )}

        {/* Issue count */}
        <span className="text-xs text-muted-foreground">
          ({sprint.issues.length} actividades)
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Point breakdown on the right */}
        {totalPoints > 0 && (
          <span className="text-xs text-muted-foreground">
            {totalPoints}p
          </span>
        )}

        {/* Sprint actions */}
        {sprint.status.toLowerCase() === 'planned' && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={onStartSprint}
          >
            Iniciar sprint
          </Button>
        )}

        {sprint.status.toLowerCase() === 'active' && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={onCompleteSprint}
          >
            Completar sprint
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Editar sprint</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              Eliminar sprint
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Sprint goal + assignee avatars */}
      {(sprint.goal || assignees.length > 0) && (
        <div className="flex items-center gap-2 px-3 pb-2">
          {sprint.goal && (
            <p className="text-xs text-muted-foreground italic truncate max-w-md">
              {sprint.goal}
            </p>
          )}
          {assignees.length > 0 && (
            <div className="flex -space-x-1.5 ml-auto">
              {assignees.slice(0, 5).map((a) => (
                <Avatar key={a.id} className="size-6 border-2 border-background">
                  <AvatarImage src={a.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                    {a.firstName?.[0]}
                    {a.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              ))}
              {assignees.length > 5 && (
                <div className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[8px] font-medium">
                  +{assignees.length - 5}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Issues list */}
      {open && (
        <div className="border-t">
          {sprint.issues.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Arrastra incidencias aqui para planificar el sprint.
            </div>
          ) : (
            sprint.issues.map((issue) => (
              <BacklogItem
                key={issue.id}
                issue={issue}
                selected={selectedIssues.has(issue.id)}
                onSelect={(checked) => onToggleSelect(issue.id, checked)}
                onClick={() => onIssueClick(issue)}
              />
            ))
          )}

          {/* Inline create issue */}
          <InlineCreateIssue
            onCreateIssue={(title, issueTypeId) => onCreateIssue?.(title, issueTypeId, sprint.id)}
            isPending={isCreating}
            issueTypes={issueTypes}
          />
        </div>
      )}
    </div>
  );
}
