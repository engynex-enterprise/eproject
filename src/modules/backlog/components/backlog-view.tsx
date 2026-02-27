'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Settings,
} from 'lucide-react';
import type { Issue } from '@/shared/types';
import type { BacklogData } from '../services/backlog.service';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SprintSection } from './sprint-section';
import { BacklogItem } from './backlog-item';
import { InlineCreateIssue } from './inline-create-issue';

interface BacklogViewProps {
  data: BacklogData;
  onIssueClick: (issue: Issue) => void;
  onStartSprint?: (sprintId: number) => void;
  onCompleteSprint?: (sprintId: number) => void;
  onCreateSprint?: () => void;
  onCreateIssue?: (title: string, issueTypeId: number, sprintId?: number) => void;
  isCreatingIssue?: boolean;
}

export function BacklogView({
  data,
  onIssueClick,
  onStartSprint,
  onCompleteSprint,
  onCreateSprint,
  onCreateIssue,
  isCreatingIssue,
}: BacklogViewProps) {
  const [selectedIssues, setSelectedIssues] = useState<Set<number>>(
    new Set(),
  );
  const [backlogOpen, setBacklogOpen] = useState(true);

  const toggleSelect = (issueId: number, selected: boolean) => {
    setSelectedIssues((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(issueId);
      } else {
        next.delete(issueId);
      }
      return next;
    });
  };

  const toggleSelectAll = (sprintId: number, selected: boolean) => {
    const sprint = data.sprints.find((s) => s.id === sprintId);
    if (!sprint) return;
    setSelectedIssues((prev) => {
      const next = new Set(prev);
      for (const issue of sprint.issues) {
        if (selected) {
          next.add(issue.id);
        } else {
          next.delete(issue.id);
        }
      }
      return next;
    });
  };

  const toggleSelectAllBacklog = (selected: boolean) => {
    setSelectedIssues((prev) => {
      const next = new Set(prev);
      for (const issue of data.backlogIssues) {
        if (selected) {
          next.add(issue.id);
        } else {
          next.delete(issue.id);
        }
      }
      return next;
    });
  };

  const backlogPointsTotal = data.backlogIssues.reduce(
    (sum, i) => sum + (i.storyPoints ?? 0),
    0,
  );

  const allBacklogSelected =
    data.backlogIssues.length > 0 &&
    data.backlogIssues.every((i) => selectedIssues.has(i.id));

  return (
    <div className="flex flex-col gap-2 p-4">
      {/* Sprint Sections */}
      {data.sprints.map((sprint) => (
        <SprintSection
          key={sprint.id}
          sprint={sprint}
          selectedIssues={selectedIssues}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onIssueClick={onIssueClick}
          onStartSprint={() => onStartSprint?.(sprint.id)}
          onCompleteSprint={() => onCompleteSprint?.(sprint.id)}
          onCreateIssue={(title, issueTypeId, sprintId) => onCreateIssue?.(title, issueTypeId, sprintId)}
          isCreating={isCreatingIssue}
          issueTypes={data.issueTypes}
        />
      ))}

      {/* Backlog Section */}
      <div className="rounded-lg border bg-card">
        {/* Backlog Header */}
        <div className="flex items-center gap-2 px-3 py-2">
          {/* Select all checkbox */}
          <Checkbox
            checked={allBacklogSelected}
            onCheckedChange={(checked) => toggleSelectAllBacklog(!!checked)}
            className="size-3.5"
          />

          {/* Collapse toggle */}
          <button
            onClick={() => setBacklogOpen(!backlogOpen)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            {backlogOpen ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>

          {/* Backlog label */}
          <button
            onClick={() => setBacklogOpen(!backlogOpen)}
            className="font-semibold text-sm hover:underline"
          >
            Backlog
          </button>

          {/* Issue count */}
          <span className="text-xs text-muted-foreground">
            ({data.backlogIssues.length} actividades)
          </span>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Points total */}
          {backlogPointsTotal > 0 && (
            <span className="text-xs text-muted-foreground">
              {backlogPointsTotal}p
            </span>
          )}

          {/* Settings icon */}
          <Button variant="ghost" size="icon" className="size-7">
            <Settings className="size-3.5" />
          </Button>

          {/* Create sprint button */}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={onCreateSprint}
          >
            Crear sprint
          </Button>
        </div>

        {/* Backlog issues */}
        {backlogOpen && (
          <div className="border-t">
            {data.backlogIssues.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                El backlog esta vacio.
              </div>
            ) : (
              data.backlogIssues.map((issue) => (
                <BacklogItem
                  key={issue.id}
                  issue={issue}
                  selected={selectedIssues.has(issue.id)}
                  onSelect={(checked) => toggleSelect(issue.id, checked)}
                  onClick={() => onIssueClick(issue)}
                />
              ))
            )}

            {/* Inline create issue */}
            <InlineCreateIssue
              onCreateIssue={(title, issueTypeId) => onCreateIssue?.(title, issueTypeId)}
              isPending={isCreatingIssue}
              issueTypes={data.issueTypes}
            />
          </div>
        )}
      </div>
    </div>
  );
}
