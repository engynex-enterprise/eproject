'use client';

import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  CircleDot,
  Download,
  User,
  AlertCircle,
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

export type TicketSortBy = 'recent' | 'priority' | 'status' | 'title';
export type TicketFilter = 'all' | 'assigned_to_me' | 'reported_by_me';
export type PriorityFilter = 'all' | 'highest' | 'high' | 'medium' | 'low' | 'lowest';
export type ViewMode = 'cards' | 'table';

interface HelpdeskToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: TicketSortBy;
  onSortByChange: (value: TicketSortBy) => void;
  ticketFilter: TicketFilter;
  onTicketFilterChange: (value: TicketFilter) => void;
  priorityFilter: PriorityFilter;
  onPriorityFilterChange: (value: PriorityFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  totalCount: number;
  filteredCount: number;
  onExport?: () => void;
  showTicketFilter?: boolean;
}

const SORT_LABELS: Record<TicketSortBy, string> = {
  recent: 'Mas recientes',
  priority: 'Prioridad',
  status: 'Estado',
  title: 'Titulo',
};

const FILTER_LABELS: Record<TicketFilter, string> = {
  all: 'Todos',
  assigned_to_me: 'Asignados a mi',
  reported_by_me: 'Reportados por mi',
};

const PRIORITY_OPTIONS: { value: PriorityFilter; label: string; color: string }[] = [
  { value: 'all', label: 'Todas', color: '' },
  { value: 'highest', label: 'Critica', color: '#FF5630' },
  { value: 'high', label: 'Alta', color: '#FF991F' },
  { value: 'medium', label: 'Media', color: '#FFAB00' },
  { value: 'low', label: 'Baja', color: '#4C9AFF' },
  { value: 'lowest', label: 'Muy baja', color: '#8993A4' },
];

export function HelpdeskToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  ticketFilter,
  onTicketFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  onExport,
  showTicketFilter = true,
}: HelpdeskToolbarProps) {
  const hasActiveFilters = (showTicketFilter && ticketFilter !== 'all') || priorityFilter !== 'all' || search.length > 0;

  const clearAllFilters = () => {
    onSearchChange('');
    onTicketFilterChange('all');
    onPriorityFilterChange('all');
  };

  return (
    <div className="space-y-3">
      {/* Main toolbar row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por titulo o clave..."
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
                  onValueChange={(v) => onSortByChange(v as TicketSortBy)}
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

        {/* Ticket filter pills */}
        {showTicketFilter && (
          <div className="flex items-center rounded-lg border bg-muted/40 p-0.5">
            {(Object.entries(FILTER_LABELS) as [TicketFilter, string][]).map(([value, label]) => (
              <button
                key={value}
                onClick={() => onTicketFilterChange(value)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  ticketFilter === value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Priority filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'gap-2',
                priorityFilter !== 'all' && 'border-primary/50 bg-primary/5',
              )}
            >
              <CircleDot className="size-3.5" />
              Prioridad
              {priorityFilter !== 'all' && (
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
            <DropdownMenuLabel className="text-xs">Filtrar por prioridad</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {PRIORITY_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={priorityFilter === option.value}
                onCheckedChange={() => onPriorityFilterChange(option.value)}
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
            ? `${totalCount} tickets`
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
              Busqueda: &quot;{search}&quot;
              <button
                onClick={() => onSearchChange('')}
                className="ml-0.5 rounded-sm hover:bg-muted"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {showTicketFilter && ticketFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              {FILTER_LABELS[ticketFilter]}
              <button
                onClick={() => onTicketFilterChange('all')}
                className="ml-0.5 rounded-sm hover:bg-muted"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {priorityFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1 pr-1 text-xs font-normal">
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor: PRIORITY_OPTIONS.find((o) => o.value === priorityFilter)?.color,
                }}
              />
              Prioridad: {PRIORITY_OPTIONS.find((o) => o.value === priorityFilter)?.label}
              <button
                onClick={() => onPriorityFilterChange('all')}
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
