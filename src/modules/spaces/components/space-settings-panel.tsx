'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  Settings,
  Columns3,
  LayoutGrid,
  Paintbrush,
  Filter,
  GripVertical,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSpaceSettings,
  updateSpaceSettings,
  getSpaceBoardConfig,
  updateSpaceBoardConfig,
  type SpaceSettings,
  type SpaceBoardConfig,
  type BoardColumnConfig,
  type SwimLaneConfig,
} from '@/modules/spaces/services/spaces.service';
import { cn } from '@/lib/utils';

interface SpaceSettingsPanelProps {
  spaceId: number;
  onClose?: () => void;
}

const dayLabels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

const cardDisplayFieldOptions = [
  { id: 'assignee', label: 'Asignado' },
  { id: 'priority', label: 'Prioridad' },
  { id: 'type', label: 'Tipo' },
  { id: 'story_points', label: 'Puntos de historia' },
  { id: 'due_date', label: 'Fecha limite' },
  { id: 'tags', label: 'Etiquetas' },
  { id: 'sprint', label: 'Sprint' },
  { id: 'version', label: 'Version' },
];

const quickFilterOptions = [
  { id: 'assignee', label: 'Asignado' },
  { id: 'priority', label: 'Prioridad' },
  { id: 'type', label: 'Tipo de incidencia' },
  { id: 'sprint', label: 'Sprint' },
  { id: 'tag', label: 'Etiqueta' },
  { id: 'version', label: 'Version' },
];

export function SpaceSettingsPanel({
  spaceId,
  onClose,
}: SpaceSettingsPanelProps) {
  const queryClient = useQueryClient();

  // ── Settings query ────────────────────────────────────────────────
  const {
    data: settings,
    isLoading: settingsLoading,
  } = useQuery({
    queryKey: ['space-settings', spaceId],
    queryFn: () => getSpaceSettings(spaceId),
    enabled: !!spaceId,
  });

  // ── Board config query ────────────────────────────────────────────
  const {
    data: boardConfig,
    isLoading: boardLoading,
  } = useQuery({
    queryKey: ['space-board-config', spaceId],
    queryFn: () => getSpaceBoardConfig(spaceId),
    enabled: !!spaceId,
  });

  // ── Settings state ────────────────────────────────────────────────
  const [inheritFromProject, setInheritFromProject] = useState(true);
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [estimationType, setEstimationType] = useState<
    'story_points' | 'hours' | 'none'
  >('story_points');
  const [defaultSprintDuration, setDefaultSprintDuration] = useState(14);

  // ── Board state ───────────────────────────────────────────────────
  const [columns, setColumns] = useState<BoardColumnConfig[]>([]);
  const [swimlanes, setSwimlanes] = useState<SwimLaneConfig>({
    enabled: false,
    field: 'none',
  });
  const [cardColorField, setCardColorField] = useState<string>('priority');
  const [cardDisplayFields, setCardDisplayFields] = useState<string[]>([
    'assignee',
    'priority',
  ]);
  const [quickFilters, setQuickFilters] = useState<string[]>([
    'assignee',
    'priority',
  ]);
  const [newColumnName, setNewColumnName] = useState('');

  useEffect(() => {
    if (settings) {
      setInheritFromProject(settings.inheritFromProject);
      setWorkingDays(settings.workingDays);
      setEstimationType(settings.estimationType);
      setDefaultSprintDuration(settings.defaultSprintDuration);
    }
  }, [settings]);

  useEffect(() => {
    if (boardConfig) {
      setColumns(boardConfig.columns);
      setSwimlanes(boardConfig.swimlanes);
      setCardColorField(boardConfig.cardColorField);
      setCardDisplayFields(boardConfig.cardDisplayFields);
      setQuickFilters(boardConfig.quickFilters);
    }
  }, [boardConfig]);

  // ── Mutations ─────────────────────────────────────────────────────
  const updateSettingsMut = useMutation({
    mutationFn: (data: Partial<SpaceSettings>) =>
      updateSpaceSettings(spaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['space-settings', spaceId],
      });
    },
  });

  const updateBoardMut = useMutation({
    mutationFn: (data: Partial<SpaceBoardConfig>) =>
      updateSpaceBoardConfig(spaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['space-board-config', spaceId],
      });
    },
  });

  const handleToggleDay = (day: number) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleToggleDisplayField = (field: string) => {
    setCardDisplayFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field],
    );
  };

  const handleToggleQuickFilter = (filter: string) => {
    setQuickFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  };

  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    const newCol: BoardColumnConfig = {
      id: `col-${Date.now()}`,
      name: newColumnName.trim(),
      statusId: 0,
      status: {} as BoardColumnConfig['status'],
      order: columns.length,
      wipLimit: null,
    };
    setColumns([...columns, newCol]);
    setNewColumnName('');
  };

  const handleRemoveColumn = (colId: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== colId));
  };

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    const newColumns = [...columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newColumns.length) return;
    [newColumns[index], newColumns[targetIndex]] = [
      newColumns[targetIndex],
      newColumns[index],
    ];
    setColumns(
      newColumns.map((col, i) => ({ ...col, order: i })),
    );
  };

  const handleSaveSettings = () => {
    updateSettingsMut.mutate({
      inheritFromProject,
      workingDays,
      estimationType,
      defaultSprintDuration,
    });
  };

  const handleSaveBoardConfig = () => {
    updateBoardMut.mutate({
      columns,
      swimlanes,
      cardColorField: cardColorField as SpaceBoardConfig['cardColorField'],
      cardDisplayFields,
      quickFilters,
    });
  };

  const isLoading = settingsLoading || boardLoading;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="size-5" />
          <h2 className="text-lg font-semibold">Configuracion del espacio</h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon-xs" onClick={onClose}>
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Inherit Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Herencia de proyecto</CardTitle>
          <CardDescription>
            Usa la configuracion del proyecto padre en lugar de una
            configuracion personalizada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch
              checked={inheritFromProject}
              onCheckedChange={setInheritFromProject}
            />
            <Label>
              {inheritFromProject
                ? 'Heredando del proyecto'
                : 'Configuracion personalizada'}
            </Label>
          </div>
        </CardContent>
      </Card>

      {!inheritFromProject && (
        <>
          {/* Working Days & Estimation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Dias laborales y estimacion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Working Days */}
              <div className="space-y-2">
                <Label>Dias laborales</Label>
                <div className="flex gap-2">
                  {dayLabels.map((label, index) => {
                    const dayNum = index + 1;
                    const isActive = workingDays.includes(dayNum);
                    return (
                      <button
                        key={dayNum}
                        type="button"
                        onClick={() => handleToggleDay(dayNum)}
                        className={cn(
                          'flex size-10 items-center justify-center rounded-md text-xs font-medium transition-colors border',
                          isActive
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-muted-foreground border-muted hover:bg-muted',
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Estimation */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de estimacion</Label>
                  <Select
                    value={estimationType}
                    onValueChange={(val) =>
                      setEstimationType(
                        val as 'story_points' | 'hours' | 'none',
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story_points">
                        Puntos de historia
                      </SelectItem>
                      <SelectItem value="hours">Horas</SelectItem>
                      <SelectItem value="none">Sin estimacion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duracion de sprint (dias)</Label>
                  <Input
                    type="number"
                    value={defaultSprintDuration}
                    onChange={(e) =>
                      setDefaultSprintDuration(Number(e.target.value))
                    }
                    min={1}
                    max={60}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveSettings}
                  disabled={updateSettingsMut.isPending}
                >
                  {updateSettingsMut.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Board Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <div className="flex items-center gap-2">
                  <Columns3 className="size-4" />
                  Configuracion del tablero
                </div>
              </CardTitle>
              <CardDescription>
                Administra las columnas, swimlanes y campos visibles del
                tablero.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Columns */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Columnas</Label>
                <div className="space-y-2">
                  {columns.map((col, index) => (
                    <div
                      key={col.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2"
                    >
                      <GripVertical className="size-4 text-muted-foreground cursor-grab" />
                      <span className="text-sm font-medium flex-1">
                        {col.name}
                      </span>
                      {col.status?.name && (
                        <Badge variant="secondary" className="text-xs">
                          {col.status.name}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleMoveColumn(index, 'up')}
                          disabled={index === 0}
                          title="Mover arriba"
                        >
                          <span className="text-xs">&#8593;</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleMoveColumn(index, 'down')}
                          disabled={index === columns.length - 1}
                          title="Mover abajo"
                        >
                          <span className="text-xs">&#8595;</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRemoveColumn(col.id)}
                          title="Eliminar columna"
                        >
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Nombre de la columna"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColumn();
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddColumn}
                    disabled={!newColumnName.trim()}
                  >
                    <Plus className="size-4" />
                    Agregar
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Swimlanes */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="size-4" />
                    Swimlanes
                  </div>
                </Label>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={swimlanes.enabled}
                    onCheckedChange={(checked) =>
                      setSwimlanes((prev) => ({
                        ...prev,
                        enabled: checked,
                      }))
                    }
                  />
                  <Label>
                    {swimlanes.enabled
                      ? 'Swimlanes activados'
                      : 'Swimlanes desactivados'}
                  </Label>
                </div>
                {swimlanes.enabled && (
                  <Select
                    value={swimlanes.field}
                    onValueChange={(val) =>
                      setSwimlanes((prev) => ({
                        ...prev,
                        field: val as SwimLaneConfig['field'],
                      }))
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Agrupar por..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignee">Asignado</SelectItem>
                      <SelectItem value="priority">Prioridad</SelectItem>
                      <SelectItem value="type">
                        Tipo de incidencia
                      </SelectItem>
                      <SelectItem value="none">Sin agrupar</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Separator />

              {/* Card Color Field */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="size-4" />
                    Color de las tarjetas
                  </div>
                </Label>
                <Select
                  value={cardColorField}
                  onValueChange={setCardColorField}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Prioridad</SelectItem>
                    <SelectItem value="type">
                      Tipo de incidencia
                    </SelectItem>
                    <SelectItem value="status">Estado</SelectItem>
                    <SelectItem value="none">Sin color</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Card Display Fields */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Campos visibles en tarjetas
                </Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {cardDisplayFieldOptions.map((field) => (
                    <label
                      key={field.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={cardDisplayFields.includes(field.id)}
                        onCheckedChange={() =>
                          handleToggleDisplayField(field.id)
                        }
                      />
                      {field.label}
                    </label>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Quick Filters */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Filter className="size-4" />
                    Filtros rapidos
                  </div>
                </Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {quickFilterOptions.map((filter) => (
                    <label
                      key={filter.id}
                      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={quickFilters.includes(filter.id)}
                        onCheckedChange={() =>
                          handleToggleQuickFilter(filter.id)
                        }
                      />
                      {filter.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveBoardConfig}
                  disabled={updateBoardMut.isPending}
                >
                  {updateBoardMut.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Guardar tablero
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
