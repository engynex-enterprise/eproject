"use client";

import { Mail, Smartphone, AppWindow, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import type { ApiResponse, NotificationPreference } from "@/shared/types";

const notificationEvents = [
  { key: "issueAssigned",     label: "Incidencia asignada",      desc: "Cuando se te asigna una incidencia" },
  { key: "issueUpdated",      label: "Incidencia actualizada",   desc: "Cambios en estado, prioridad o campos" },
  { key: "issueCommented",    label: "Comentario en incidencia", desc: "Nuevos comentarios en tus incidencias" },
  { key: "sprintStarted",     label: "Sprint iniciado",          desc: "Cuando comienza un nuevo sprint" },
  { key: "sprintCompleted",   label: "Sprint completado",        desc: "Cuando finaliza un sprint" },
  { key: "mentionedInComment",label: "Mencionado",               desc: "Alguien te menciona con @usuario" },
] as const;

const channels = [
  { key: "emailEnabled", label: "Correo",    icon: Mail,       desc: "Notificaciones por correo electronico" },
  { key: "pushEnabled",  label: "Push",      icon: Smartphone, desc: "Notificaciones en dispositivos moviles" },
  { key: "inAppEnabled", label: "En la app", icon: AppWindow,  desc: "Notificaciones dentro de la plataforma" },
] as const;

function useNotifPrefs() {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<NotificationPreference>>("/users/me/notification-preferences");
      return res.data;
    },
  });
}

function useUpdateNotifPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<NotificationPreference>) => {
      const res = await apiClient.patch<ApiResponse<NotificationPreference>>("/users/me/notification-preferences", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-preferences"] }),
  });
}

export default function ProfileNotificationsPage() {
  const { data: prefs, isLoading } = useNotifPrefs();
  const update = useUpdateNotifPrefs();

  const toggle = (key: keyof NotificationPreference, value: boolean) => {
    update.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Notificaciones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Controla como y cuando recibes notificaciones.
        </p>
      </div>

      {/* ── Channel toggles ─────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Bell className="size-4" />
            Canales activos
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Activa o desactiva cada canal de notificacion globalmente.
          </p>
        </div>
        <div className="divide-y">
          {channels.map(({ key, label, icon: Icon, desc }) => (
            <div key={key} className="flex items-center justify-between px-6 py-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
              <Switch
                checked={!!(prefs?.[key as keyof NotificationPreference] as boolean)}
                onCheckedChange={(v) => toggle(key as keyof NotificationPreference, v)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Event matrix ────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <p className="text-sm font-semibold">Eventos y canales</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Controla que eventos generan notificaciones por cada canal.
          </p>
        </div>
        <div className="grid grid-cols-[1fr_repeat(3,5rem)] px-6 py-3 bg-muted/40 border-b text-xs font-medium text-muted-foreground">
          <span>Evento</span>
          {channels.map(({ label }) => (
            <span key={label} className="text-center">{label}</span>
          ))}
        </div>
        <div className="divide-y">
          {notificationEvents.map((event) => (
            <div key={event.key} className="grid grid-cols-[1fr_repeat(3,5rem)] items-center px-6 py-4">
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
                    onCheckedChange={(v) => toggle(event.key as keyof NotificationPreference, v)}
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
