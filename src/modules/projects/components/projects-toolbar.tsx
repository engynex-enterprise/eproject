'use client';

import { Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';

interface ProjectsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: 'recent' | 'name' | 'progress';
  onSortByChange: (value: 'recent' | 'name' | 'progress') => void;
  statusFilter: 'all' | 'active' | 'archived';
  onStatusFilterChange: (value: 'all' | 'active' | 'archived') => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (value: 'cards' | 'table') => void;
}

export function ProjectsToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
}: ProjectsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar proyectos..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Sort */}
      <Select
        value={sortBy}
        onValueChange={(v) => onSortByChange(v as 'recent' | 'name' | 'progress')}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Más recientes</SelectItem>
          <SelectItem value="name">Nombre</SelectItem>
          <SelectItem value="progress">Progreso</SelectItem>
        </SelectContent>
      </Select>

      {/* Status filter */}
      <Select
        value={statusFilter}
        onValueChange={(v) => onStatusFilterChange(v as 'all' | 'active' | 'archived')}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Activos</SelectItem>
          <SelectItem value="archived">Archivados</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1" />

      {/* View mode toggle */}
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(v) => {
          if (v) onViewModeChange(v as 'cards' | 'table');
        }}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="cards" aria-label="Vista de tarjetas">
          <LayoutGrid className="size-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="table" aria-label="Vista de tabla">
          <List className="size-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
