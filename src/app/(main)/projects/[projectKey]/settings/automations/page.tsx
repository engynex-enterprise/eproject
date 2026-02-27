'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  MoreHorizontal,
  Loader2,
  Zap,
  Power,
  PowerOff,
} from 'lucide-react';
import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AutomationRule {
  id: number;
  name: string;
  description: string | null;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  actionType: string;
  actionConfig: Record<string, unknown>;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

const triggerTypes = [
  { value: 'issue_created', label: 'Incidencia creada' },
  { value: 'issue_updated', label: 'Incidencia actualizada' },
  { value: 'issue_moved', label: 'Incidencia movida de estado' },
  { value: 'sprint_started', label: 'Sprint iniciado' },
  { value: 'sprint_completed', label: 'Sprint completado' },
];

const actionTypes = [
  { value: 'assign_user', label: 'Asignar usuario' },
  { value: 'change_status', label: 'Cambiar estado' },
  { value: 'add_label', label: 'Agregar etiqueta' },
  { value: 'send_notification', label: 'Enviar notificacion' },
  { value: 'move_to_sprint', label: 'Mover a sprint' },
];

export default function AutomationsPage() {
  const params = useParams<{ projectKey: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['automations', params.projectKey],
    queryFn: () =>
      apiClient.get<ApiResponse<AutomationRule[]>>(
        `/projects/key/${params.projectKey}/automations`,
      ),
    enabled: !!params.projectKey,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [triggerType, setTriggerType] = useState('');
  const [actionType, setActionType] = useState('');

  const createRule = useMutation({
    mutationFn: () =>
      apiClient.post(
        `/projects/key/${params.projectKey}/automations`,
        {
          name: ruleName.trim(),
          description: ruleDescription.trim() || undefined,
          triggerType,
          triggerConfig: {},
          actionType,
          actionConfig: {},
          isEnabled: true,
        },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['automations', params.projectKey],
      });
      setCreateOpen(false);
      setRuleName('');
      setRuleDescription('');
      setTriggerType('');
      setActionType('');
    },
  });

  const toggleRule = useMutation({
    mutationFn: ({
      ruleId,
      isEnabled,
    }: {
      ruleId: number;
      isEnabled: boolean;
    }) =>
      apiClient.patch(`/automations/${ruleId}`, { isEnabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['automations', params.projectKey],
      });
    },
  });

  const deleteRule = useMutation({
    mutationFn: (ruleId: number) =>
      apiClient.delete(`/automations/${ruleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['automations', params.projectKey],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const rules = data?.data ?? [];

  return (
    <div className="max-w-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Automatizaciones</h2>
          <p className="text-sm text-muted-foreground">
            Crea reglas para automatizar acciones en tu proyecto.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Crear regla
        </Button>
      </div>

      <Separator />

      {rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Zap className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium mb-1">
            No hay automatizaciones
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Las automatizaciones te ayudan a ejecutar acciones automaticas
            basadas en eventos del proyecto.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  {rule.isEnabled ? (
                    <Power className="size-4 text-green-500" />
                  ) : (
                    <PowerOff className="size-4 text-muted-foreground" />
                  )}
                  <CardTitle className="text-base">{rule.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      rule.isEnabled
                        ? 'bg-green-100 text-green-700 text-[10px]'
                        : 'bg-gray-100 text-gray-500 text-[10px]'
                    }
                  >
                    {rule.isEnabled ? 'Activa' : 'Desactivada'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.isEnabled}
                    onCheckedChange={(v) =>
                      toggleRule.mutate({
                        ruleId: rule.id,
                        isEnabled: v,
                      })
                    }
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => deleteRule.mutate(rule.id)}
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {rule.description && (
                  <p className="text-sm text-muted-foreground">
                    {rule.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary" className="text-[10px]">
                    Cuando:{' '}
                    {triggerTypes.find((t) => t.value === rule.triggerType)
                      ?.label ?? rule.triggerType}
                  </Badge>
                  <span className="text-muted-foreground">entonces</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {actionTypes.find((a) => a.value === rule.actionType)
                      ?.label ?? rule.actionType}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Rule Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createRule.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle>Crear automatizacion</DialogTitle>
              <DialogDescription>
                Define una regla de automatizacion para el proyecto.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Nombre de la regla</Label>
                <Input
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="Auto-asignar incidencias"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Descripcion{' '}
                  <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Textarea
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  placeholder="Describe que hace esta regla..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Cuando (trigger)</Label>
                <Select value={triggerType} onValueChange={setTriggerType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Entonces (accion)</Label>
                <Select value={actionType} onValueChange={setActionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar accion" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  !ruleName.trim() ||
                  !triggerType ||
                  !actionType ||
                  createRule.isPending
                }
              >
                {createRule.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Crear regla
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
