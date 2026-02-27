'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Loader2, Save } from 'lucide-react';
import type { ApiResponse, NotificationPreference } from '@/shared/types';
import { apiClient } from '@/shared/lib/api-client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
}

const notificationSettings: NotificationSetting[] = [
  {
    key: 'issueAssigned',
    label: 'Incidencia asignada',
    description: 'Cuando te asignan una incidencia',
  },
  {
    key: 'issueUpdated',
    label: 'Incidencia actualizada',
    description: 'Cuando se actualiza una incidencia que sigues',
  },
  {
    key: 'issueCommented',
    label: 'Nuevo comentario',
    description: 'Cuando alguien comenta en una incidencia que sigues',
  },
  {
    key: 'sprintStarted',
    label: 'Sprint iniciado',
    description: 'Cuando se inicia un sprint',
  },
  {
    key: 'sprintCompleted',
    label: 'Sprint completado',
    description: 'Cuando se completa un sprint',
  },
  {
    key: 'mentionedInComment',
    label: 'Mencion en comentario',
    description: 'Cuando te mencionan en un comentario',
  },
];

export default function NotificationsPage() {
  const params = useParams<{ projectKey: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notification-prefs', params.projectKey],
    queryFn: () =>
      apiClient.get<ApiResponse<NotificationPreference>>(
        `/projects/key/${params.projectKey}/notification-preferences`,
      ),
    enabled: !!params.projectKey,
  });

  const updatePref = useMutation({
    mutationFn: (updates: Partial<NotificationPreference>) =>
      apiClient.patch(
        `/projects/key/${params.projectKey}/notification-preferences`,
        updates,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notification-prefs', params.projectKey],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  const prefs = data?.data;

  const handleToggle = (key: string, value: boolean) => {
    updatePref.mutate({ [key]: value });
  };

  return (
    <div className="max-w-2xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Notificaciones</h2>
        <p className="text-sm text-muted-foreground">
          Configura cuando y como recibir notificaciones del proyecto.
        </p>
      </div>

      <Separator />

      {/* Global toggles */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Canales de notificacion</h3>
        <div className="grid gap-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Email</Label>
              <p className="text-xs text-muted-foreground">
                Recibir notificaciones por correo electronico
              </p>
            </div>
            <Switch
              checked={prefs?.emailEnabled ?? true}
              onCheckedChange={(v) => handleToggle('emailEnabled', v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Push</Label>
              <p className="text-xs text-muted-foreground">
                Recibir notificaciones push en el navegador
              </p>
            </div>
            <Switch
              checked={prefs?.pushEnabled ?? false}
              onCheckedChange={(v) => handleToggle('pushEnabled', v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>En la aplicacion</Label>
              <p className="text-xs text-muted-foreground">
                Mostrar notificaciones dentro de la aplicacion
              </p>
            </div>
            <Switch
              checked={prefs?.inAppEnabled ?? true}
              onCheckedChange={(v) => handleToggle('inAppEnabled', v)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Per-event toggles */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Eventos</h3>
        <div className="grid gap-3">
          {notificationSettings.map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-0.5">
                <Label>{setting.label}</Label>
                <p className="text-xs text-muted-foreground">
                  {setting.description}
                </p>
              </div>
              <Switch
                checked={
                  (prefs as unknown as Record<string, unknown>)?.[setting.key] as
                    | boolean
                    | undefined ?? true
                }
                onCheckedChange={(v) => handleToggle(setting.key, v)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
