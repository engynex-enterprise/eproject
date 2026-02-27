'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  addDays,
  addWeeks,
  addMonths,
  differenceInDays,
  format,
  startOfWeek,
  startOfMonth,
  isToday,
  isSameDay,
  eachWeekOfInterval,
  eachMonthOfInterval,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Bug,
  BookOpen,
  CheckSquare,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { TimelineIssue } from '../services/timeline.service';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type ZoomLevel = 'week' | 'month';

const typeIcons: Record<string, React.ElementType> = {
  Epic: Zap,
  Story: BookOpen,
  Task: CheckSquare,
  Bug: Bug,
};

const typeColors: Record<string, string> = {
  Epic: '#8b5cf6',
  Story: '#22c55e',
  Task: '#3b82f6',
  Bug: '#ef4444',
};

interface GanttChartProps {
  issues: TimelineIssue[];
  startDate: string;
  endDate: string;
}

const ROW_HEIGHT = 40;
const LEFT_PANEL_WIDTH = 360;
const DAY_WIDTH_WEEK = 40;
const DAY_WIDTH_MONTH = 14;

export function GanttChart({ issues, startDate, endDate }: GanttChartProps) {
  const [zoom, setZoom] = useState<ZoomLevel>('week');
  const scrollRef = useRef<HTMLDivElement>(null);

  const timelineStart = useMemo(
    () => startOfWeek(new Date(startDate), { weekStartsOn: 1 }),
    [startDate],
  );
  const timelineEnd = useMemo(
    () => addDays(new Date(endDate), 14),
    [endDate],
  );

  const dayWidth = zoom === 'week' ? DAY_WIDTH_WEEK : DAY_WIDTH_MONTH;
  const totalDays = differenceInDays(timelineEnd, timelineStart);
  const totalWidth = totalDays * dayWidth;

  const getX = useCallback(
    (date: Date) => differenceInDays(date, timelineStart) * dayWidth,
    [timelineStart, dayWidth],
  );

  // Time scale headers
  const timeHeaders = useMemo(() => {
    if (zoom === 'week') {
      return eachWeekOfInterval(
        { start: timelineStart, end: timelineEnd },
        { weekStartsOn: 1 },
      ).map((weekStart) => ({
        date: weekStart,
        label: format(weekStart, 'd MMM', { locale: es }),
        width: 7 * dayWidth,
      }));
    }
    return eachMonthOfInterval({
      start: timelineStart,
      end: timelineEnd,
    }).map((monthStart) => {
      const nextMonth = addMonths(monthStart, 1);
      const days = differenceInDays(nextMonth, monthStart);
      return {
        date: monthStart,
        label: format(monthStart, 'MMMM yyyy', { locale: es }),
        width: days * dayWidth,
      };
    });
  }, [zoom, timelineStart, timelineEnd, dayWidth]);

  // Today marker position
  const todayX = getX(new Date());
  const showToday = todayX >= 0 && todayX <= totalWidth;

  return (
    <div className="flex flex-col h-full">
      {/* Zoom Controls */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Button
          variant={zoom === 'week' ? 'secondary' : 'ghost'}
          size="xs"
          onClick={() => setZoom('week')}
        >
          <ZoomIn className="size-3" />
          Semanas
        </Button>
        <Button
          variant={zoom === 'month' ? 'secondary' : 'ghost'}
          size="xs"
          onClick={() => setZoom('month')}
        >
          <ZoomOut className="size-3" />
          Meses
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Issue List */}
        <div
          className="shrink-0 border-r overflow-y-auto"
          style={{ width: LEFT_PANEL_WIDTH }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center h-10 border-b bg-muted/50 px-3 text-xs font-semibold text-muted-foreground">
            Incidencia
          </div>
          {/* Issue rows */}
          {issues.map((issue) => {
            const TypeIcon =
              typeIcons[issue.issueType?.name] ?? CheckSquare;
            return (
              <div
                key={issue.id}
                className="flex items-center gap-2 border-b px-3 hover:bg-muted/30"
                style={{ height: ROW_HEIGHT }}
              >
                <TypeIcon
                  className="size-3.5 shrink-0"
                  style={{
                    color: typeColors[issue.issueType?.name] ?? '#6b7280',
                  }}
                />
                <span className="text-xs font-medium text-muted-foreground shrink-0 w-16">
                  {issue.issueKey}
                </span>
                <span className="text-sm truncate flex-1">{issue.title}</span>
                {issue.assignee && (
                  <Avatar size="sm">
                    <AvatarImage
                      src={issue.assignee.avatarUrl ?? undefined}
                    />
                    <AvatarFallback className="text-[9px]">
                      {issue.assignee.firstName[0]}
                      {issue.assignee.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Panel - Timeline */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div style={{ width: totalWidth, minHeight: '100%' }}>
            {/* Time Scale Header */}
            <div className="sticky top-0 z-10 flex h-10 border-b bg-muted/50">
              {timeHeaders.map((header, i) => (
                <div
                  key={i}
                  className="shrink-0 border-r px-2 flex items-center text-xs text-muted-foreground capitalize"
                  style={{ width: header.width }}
                >
                  {header.label}
                </div>
              ))}
            </div>

            {/* Grid + Bars */}
            <div className="relative">
              {/* Vertical grid lines */}
              {timeHeaders.map((header, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-r border-dashed border-muted"
                  style={{ left: getX(header.date) }}
                />
              ))}

              {/* Today marker */}
              {showToday && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                  style={{ left: todayX }}
                />
              )}

              {/* Issue bars */}
              {issues.map((issue, rowIdx) => {
                const issueStart = issue.startDate
                  ? new Date(issue.startDate)
                  : new Date(issue.createdAt);
                const issueEnd = issue.dueDate
                  ? new Date(issue.dueDate)
                  : addDays(issueStart, 7);
                const x = getX(issueStart);
                const width = Math.max(
                  differenceInDays(issueEnd, issueStart) * dayWidth,
                  dayWidth,
                );
                const barColor =
                  typeColors[issue.issueType?.name] ?? '#6b7280';

                return (
                  <div
                    key={issue.id}
                    className="absolute flex items-center"
                    style={{
                      top: rowIdx * ROW_HEIGHT + 8,
                      left: x,
                      width,
                      height: ROW_HEIGHT - 16,
                    }}
                  >
                    <div
                      className="h-full w-full rounded-md opacity-80 hover:opacity-100 cursor-pointer transition-opacity"
                      style={{ backgroundColor: barColor }}
                      title={`${issue.issueKey}: ${issue.title}`}
                    />
                  </div>
                );
              })}

              {/* Spacer to ensure full height */}
              <div style={{ height: issues.length * ROW_HEIGHT }} />
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}
