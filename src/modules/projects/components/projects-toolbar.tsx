'use client';

import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  CircleDot,
  Archive,
  Zap,
  Download,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export type SortBy = 'recent' | 'name' | 'progress' | 'issues' | 'members';
export type StatusFilter = 'all' | 'active' | 'archived';
export type HealthFilter = 'all' | 'healthy' | 'at-risk' | 'critical' | 'no-issues';
export type ViewMode = 'cards' | 'table';

interface ProjectsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: SortBy;
  onSortByChange: (value: SortBy) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  healthFilter: HealthFilter;
  onHealthFilterChange: (value: HealthFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  totalCount: number;
  filteredCount: number;
  onExport?: () => void;
}

const SORT_LABELS: Record<SortBy, string> = {
  recent: 'Más recientes',
  name: 'Nombre',
  progress: 'Progreso',
  issues: 'Incidencias',
  members: 'Miembros',
};

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'Todos',
  active: 'Activos',
  archived: 'Archivados',
};

const HEALTH_OPTIONS: { value: HealthFilter; label: string; color: string }[] = [
  { value: 'all', label: 'Todas', color: '' },
  { value: 'healthy', label: 'Saludable (>70%)', color: '#36B37E' },
  { value: 'at-risk', label: 'En riesgo (30-70%)', color: '#FF991F' },
  { value: 'critical', label: 'Critico (<30%)', color: '#FF5630' },
  { value: 'no-issues', label: 'Sin incidencias', color: '#4C9AFF' },
];

export function ProjectsToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  statusFilter,
  onStatusFilterChange,
  healthFilter,
  onHealthFilterChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  onExport,
}: ProjectsToolbarProps) {
  const hasActiveFilters = statusFilter !== 'all' || healthFilter !== 'all' || search.length > 0;
  const activeFilterCount =
    (statusFilter !== 'all' ? 1 : 0) +
    (healthFilter !== 'all' ? 1 : 0);

  const clearAllFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onHealthFilterChange('all');
  };

  return (
    <div className="space-y-3">
      {/* Main toolbar row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o clave..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Sort */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Select
                  value={sortBy}
                  onValueChange={(v) => onSortByChange(v as SortBy)}
                >
                  <SelectTrigger className="w-40 gap-2">
                    <ArrowUpDown className="size-3.5 shrink-0 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SORT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TooltipTrigger>
            <TooltipContent>Ordenar por</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Status filter pills */}
        <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
          {(Object.entries(STATUS_LABELS) as [StatusFilter, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => onStatusFilterChange(value)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                statusFilter === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Health filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'gap-2',
                healthFilter !== 'all' && 'border-primary/50 bg-primary/5',
              )}
            >
              <CircleDot className="size-3.5" />
              Salud
              {healthFilter !== 'all' && (
                <Badge
                  variant="secondary"
                  className="ml-0.5 size-4 justify-center rounded-full p-0 text-[9px]"
                >
                  1
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel className="text-xs">Filtrar por salud</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {HEALTH_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={healthFilter === option.value}
                onCheckedChange={() => onHealthFilterChange(option.value)}
                className="gap-2"
              >
                {option.color && (
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        {/* Results count */}
        <span className="text-xs text-muted-foreground">
          {filteredCount === totalCount
            ? `${totalCount} proyectos`
            : `${filteredCount} de ${totalCount}`}
        </span>

        <Separator orientation="vertical" className="h-6" />

        {/* Export */}
        {onExport && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon-xs" className="size-8" onClick={onExport}>
                  <Download className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar lista</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* View mode toggle */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(v) => {
            if (v) onViewModeChange(v as ViewMode);
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

      {/* Active filters chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="size-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Filtros:</span>

          {search && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              Búsqueda: &quot;{search}&quot;
              <button
                onClick={() => onSearchChange('')}
                className="ml-0.5 rounded-sm hover:bg-muted"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              Estado: {STATUS_LABELS[statusFilter]}
              <button
                onClick={() => onStatusFilterChange('all')}
                className="ml-0.5 rounded-sm hover:bg-muted"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {healthFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor: HEALTH_OPTIONS.find((o) => o.value === healthFilter)?.color,
                }}
              />
              Salud: {HEALTH_OPTIONS.find((o) => o.value === healthFilter)?.label}
              <button
                onClick={() => onHealthFilterChange('all')}
                className="ml-0.5 rounded-sm hover:bg-muted"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}
