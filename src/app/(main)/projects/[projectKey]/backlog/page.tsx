'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  LayoutGrid,
  SlidersHorizontal,
} from 'lucide-react';
import type { Issue } from '@/shared/types';
import { backlogService } from '@/modules/backlog/services/backlog.service';
import { BacklogView } from '@/modules/backlog/components/backlog-view';
import { useCreateIssue } from '@/modules/issues/hooks/use-issues';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function BacklogPage() {
  const params = useParams<{ projectKey: string }>();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<Set<number>>(
    new Set(),
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ['backlog', params.projectKey],
    queryFn: () => backlogService.getBacklog(params.projectKey),
    enabled: !!params.projectKey,
  });

  const createIssue = useCreateIssue(params.projectKey);

  const handleIssueClick = (issue: Issue) => {
    router.push(
      `/projects/${params.projectKey}/backlog?issue=${issue.issueKey}`,
    );
  };

  const handleCreateIssue = (title: string, issueTypeId: number, sprintId?: number) => {
    if (!data?.data?.projectId) return;
    createIssue.mutate({
      projectId: data.data.projectId,
      data: {
        title,
        issueTypeId,
        sprintId,
      },
    });
  };

  // Get unique assignees across all issues for the filter bar
  const allAssignees = useMemo(() => {
    if (!data?.data) return [];
    const allIssues = [
      ...(data.data.sprints.flatMap((s) => s.issues) ?? []),
      ...(data.data.backlogIssues ?? []),
    ];
    const map = new Map<number, Issue['assignee']>();
    for (const issue of allIssues) {
      if (issue.assignee && !map.has(issue.assignee.id)) {
        map.set(issue.assignee.id, issue.assignee);
      }
    }
    return Array.from(map.values());
  }, [data]);

  const toggleAssignee = (id: number) => {
    setSelectedAssignees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-sm text-destructive">
          Error al cargar el backlog. Intenta de nuevo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Top Filter Bar */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        {/* Search */}
        {searchOpen ? (
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar en el backlog"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="h-8 pl-8 text-sm"
              autoFocus
              onBlur={() => {
                if (!searchText) setSearchOpen(false);
              }}
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-3.5" />
            Buscar en el backlog
          </Button>
        )}

        {/* Assignee avatars */}
        {allAssignees.length > 0 && (
          <div className="flex -space-x-1">
            {allAssignees.slice(0, 6).map(
              (assignee) =>
                assignee && (
                  <button
                    key={assignee.id}
                    onClick={() => toggleAssignee(assignee.id)}
                    className={cn(
                      'rounded-full border-2 border-background transition-all hover:scale-110',
                      selectedAssignees.has(assignee.id) &&
                        'ring-2 ring-primary ring-offset-1',
                    )}
                  >
                    <Avatar className="size-7">
                      <AvatarImage
                        src={assignee.avatarUrl ?? undefined}
                      />
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                        {assignee.firstName?.[0]}
                        {assignee.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ),
            )}
          </div>
        )}

        {/* Filter dropdowns */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              Epic
              <ChevronIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Todas las epicas</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              Tipo
              <ChevronIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Todos los tipos</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              Filtros rapidos
              <ChevronIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Solo mis incidencias</DropdownMenuItem>
            <DropdownMenuItem>Actualizadas recientemente</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Spacer */}
        <div className="flex-1" />

        {/* View options */}
        <Button variant="ghost" size="icon" className="size-8">
          <LayoutGrid className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8">
          <SlidersHorizontal className="size-4" />
        </Button>
      </div>

      {/* Backlog Content */}
      <ScrollArea className="flex-1">
        {data?.data && (
          <BacklogView
            data={data.data}
            onIssueClick={handleIssueClick}
            onCreateIssue={handleCreateIssue}
            isCreatingIssue={createIssue.isPending}
          />
        )}
      </ScrollArea>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="ml-0.5 size-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
    </svg>
  );
}
