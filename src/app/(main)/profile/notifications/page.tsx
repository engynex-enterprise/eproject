"use client";

import { Mail, Smartphone, AppWindow } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import type { ApiResponse, NotificationPreference } from "@/shared/types";

const notificationEvents = [
  { key: "issueAssigned",    label: "Incidencia asignada",        desc: "Cuando se te asigna una incidencia" },
  { key: "issueUpdated",     label: "Incidencia actualizada",     desc: "Cambios en estado, prioridad o campos" },
  { key: "issueCommented",   label: "Comentario en incidencia",   desc: "Nuevos comentarios en tus incidencias" },
  { key: "sprintStarted",    label: "Sprint iniciado",            desc: "Cuando comienza un nuevo sprint" },
  { key: "sprintCompleted",  label: "Sprint completado",          desc: "Cuando finaliza un sprint" },
  { key: "mentionedInComment", label: "Mencionado en comentario", desc: "Alguien te menciona con @usuario" },
] as const;

const channels = [
  { key: "emailEnabled",  label: "Correo",     icon: Mail },
  { key: "pushEnabled",   label: "Push",        icon: Smartphone },
  { key: "inAppEnabled",  label: "En la app",  icon: AppWindow },
] as const;

function useNotifPrefs() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<NotificationPreference>>(
        "/users/me/notification-preferences",
      );
      return res.data;
    },
  });
}

function useUpdateNotifPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<NotificationPreference>) => {
      const res = await apiClient.patch<ApiResponse<NotificationPreference>>(
        "/users/me/notification-preferences",
        data,
      );
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-preferences"] }),
  });
}

export default function ProfileNotificationsPage() {
  const { data: prefs } = useNotifPrefs();
  const update = useUpdateNotifPrefs();

  const toggle = (key: keyof NotificationPreference, value: boolean) => {
    update.mutate({ [key]: value });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Channel toggles */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <p className="text-sm font-semibold">Canales activos</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Activa o desactiva cada canal de notificacion globalmente.
          </p>
        </div>
        <div className="divide-y">
          {channels.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
              <Switch
                checked={!!(prefs?.[key as keyof NotificationPreference] as boolean)}
                onCheckedChange={(v) => toggle(key as keyof NotificationPreference, v)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Event matrix */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <p className="text-sm font-semibold">Eventos</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Controla que eventos generan notificaciones por cada canal.
          </p>
        </div>

        {/* Header */}
        <div className="grid grid-cols-[1fr_repeat(3,5rem)] gap-0 px-6 py-3 bg-muted/40 border-b text-xs font-medium text-muted-foreground">
          <span>Evento</span>
          {channels.map(({ label }) => (
            <span key={label} className="text-center">{label}</span>
          ))}
        </div>

        <div className="divide-y">
          {notificationEvents.map((event) => (
            <div
              key={event.key}
              className="grid grid-cols-[1fr_repeat(3,5rem)] gap-0 items-center px-6 py-4"
            >
              <div>
                <p className="text-sm font-medium">{event.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{event.desc}</p>
              </div>
              {channels.map(({ key: chKey }) => (
                <div key={chKey} className="flex justify-center">
                  <Switch
                    checked={
                      !!(
                        (prefs?.[chKey as keyof NotificationPreference] as boolean) &&
                        (prefs?.[event.key as keyof NotificationPreference] as boolean)
                      )
                    }
                    onCheckedChange={(v) =>
                      toggle(event.key as keyof NotificationPreference, v)
                    }
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
