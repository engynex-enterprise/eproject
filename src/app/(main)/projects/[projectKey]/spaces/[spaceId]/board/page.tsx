'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, User, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBoardData, useMoveIssue } from '@/modules/board/hooks/use-board';
import { KanbanBoard } from '@/modules/board/components/kanban-board';
import type { BoardFilters } from '@/modules/board/services/board.service';
import type { Issue } from '@/shared/types';

export default function SpaceBoardPage() {
  const params = useParams<{ projectKey: string; spaceId: string }>();
  const router = useRouter();
  const spaceId = Number(params.spaceId);

  const [filters, setFilters] = useState<BoardFilters>({ spaceId });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const { data, isLoading, isError } = useBoardData(params.projectKey, filters);
  const moveIssue = useMoveIssue(params.projectKey, filters);

  const handleMoveIssue = (issueId: number, statusId: number, position: number) => {
    moveIssue.mutate({ issueId, statusId, position });
  };

  const handleIssueClick = (issue: Issue) => {
    router.push(
      `/projects/${params.projectKey}/spaces/${params.spaceId}/board?issue=${issue.issueKey}`,
    );
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    setFilters((prev) => ({ ...prev, search: text || undefined }));
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-72 shrink-0 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-sm text-destructive">
          Error al cargar el tablero. Intenta de nuevo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Filters Bar */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        {searchOpen ? (
          <div className="relative w-60">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar incidencias..."
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
              autoFocus
              onBlur={() => {
                if (!searchText) setSearchOpen(false);
              }}
            />
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)}>
            <Search className="size-4" />
            Buscar
          </Button>
        )}
        <Button
          variant={filters.assigneeId ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              assigneeId: prev.assigneeId ? undefined : -1,
            }))
          }
        >
          <User className="size-4" />
          Solo mis incidencias
        </Button>
        <Button variant="ghost" size="sm">
          <Layers className="size-4" />
          Tipo
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          columns={data?.data.columns ?? []}
          onMoveIssue={handleMoveIssue}
          onIssueClick={handleIssueClick}
        />
      </div>
    </div>
  );
}
