'use client';

import { useCallback, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Issue } from '@/shared/types';
import type { BoardColumnWithIssues } from '../services/board.service';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';

interface KanbanBoardProps {
  columns: BoardColumnWithIssues[];
  onMoveIssue: (issueId: number, statusId: number, position: number) => void;
  onIssueClick?: (issue: Issue) => void;
  onAddIssue?: (statusId: number) => void;
}

export function KanbanBoard({
  columns,
  onMoveIssue,
  onIssueClick,
  onAddIssue,
}: KanbanBoardProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findColumnByIssueId = useCallback(
    (issueId: string) => {
      const numId = parseInt(issueId.replace('issue-', ''), 10);
      return columns.find((col) => col.issues.some((i) => i.id === numId));
    },
    [columns],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = active.data.current?.issue as Issue | undefined;
    if (issue) {
      setActiveIssue(issue);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback handled by useDroppable isOver state
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Determine target column
    let targetStatusId: number;
    let position = 0;

    if (overId.startsWith('column-')) {
      targetStatusId = parseInt(overId.replace('column-', ''), 10);
      const targetCol = columns.find((c) => c.statusId === targetStatusId);
      position = targetCol ? targetCol.issues.length : 0;
    } else if (overId.startsWith('issue-')) {
      const targetCol = findColumnByIssueId(overId);
      if (!targetCol) return;
      targetStatusId = targetCol.statusId;
      const targetIssueIdx = targetCol.issues.findIndex(
        (i) => `issue-${i.id}` === overId,
      );
      position = targetIssueIdx >= 0 ? targetIssueIdx : targetCol.issues.length;
    } else {
      return;
    }

    const issueId = parseInt(activeId.replace('issue-', ''), 10);
    const sourceCol = findColumnByIssueId(activeId);

    // If dropped in same column at same position, skip
    if (sourceCol?.statusId === targetStatusId) {
      const currentIdx = sourceCol.issues.findIndex((i) => i.id === issueId);
      if (currentIdx === position) return;
    }

    onMoveIssue(issueId, targetStatusId, position);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className="w-full">
        <div className="flex gap-4 p-4">
          {columns
            .sort((a, b) => a.order - b.order)
            .map((column) => (
              <KanbanColumn
                key={column.id}
                status={column.status}
                issues={column.issues}
                wipLimit={column.wipLimit}
                onIssueClick={onIssueClick}
                onAddIssue={onAddIssue}
              />
            ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DragOverlay>
        {activeIssue ? (
          <KanbanCard issue={activeIssue} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
