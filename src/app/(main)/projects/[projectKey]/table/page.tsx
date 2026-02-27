'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowUpDown, Search } from 'lucide-react';
import { useIssues } from '@/modules/issues/hooks/use-issues';
import { IssueRow } from '@/modules/issues/components/issue-row';
import type { IssueFilters } from '@/modules/issues/services/issues.service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function TablePage() {
  const params = useParams<{ projectKey: string }>();
  const router = useRouter();
  const [filters, setFilters] = useState<IssueFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useIssues(params.projectKey, {
    ...filters,
    search: search || undefined,
  });

  const toggleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortHeader = ({
    field,
    label,
    className,
  }: {
    field: string;
    label: string;
    className?: string;
  }) => (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-medium hover:bg-transparent"
        onClick={() => toggleSort(field)}
      >
        {label}
        <ArrowUpDown className="ml-1 size-3" />
      </Button>
    </TableHead>
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        <Skeleton className="h-9 w-72" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <p className="text-sm text-destructive">
          Error al cargar las incidencias. Intenta de nuevo.
        </p>
      </div>
    );
  }

  const issues = data?.data ?? [];

  return (
    <div className="flex flex-1 flex-col">
      {/* Search */}
      <div className="flex items-center gap-3 border-b px-4 py-2">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar incidencias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {issues.length} incidencias
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader field="issueKey" label="Clave" className="w-24" />
              <TableHead className="w-8">Tipo</TableHead>
              <SortHeader field="title" label="Titulo" />
              <SortHeader field="status" label="Estado" />
              <SortHeader field="priority" label="Prioridad" />
              <TableHead>Asignado</TableHead>
              <TableHead>Sprint</TableHead>
              <SortHeader
                field="storyPoints"
                label="Puntos"
                className="text-center"
              />
              <SortHeader field="createdAt" label="Creado" />
              <SortHeader field="updatedAt" label="Actualizado" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.length === 0 ? (
              <TableRow>
                <td
                  colSpan={10}
                  className="py-16 text-center text-sm text-muted-foreground"
                >
                  No hay incidencias
                </td>
              </TableRow>
            ) : (
              issues.map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  onClick={() =>
                    router.push(
                      `/projects/${params.projectKey}/table?issue=${issue.issueKey}`,
                    )
                  }
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
