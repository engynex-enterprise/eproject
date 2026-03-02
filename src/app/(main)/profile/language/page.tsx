"use client";

import { useState } from "react";
import { Loader2, Save, CheckCircle2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import type { User as UserType } from "@/shared/types";

const timezones = [
  { label: "(UTC-06:00) Ciudad de Mexico", value: "America/Mexico_City" },
  { label: "(UTC-05:00) Bogota, Lima",     value: "America/Bogota" },
  { label: "(UTC-04:00) Santiago",          value: "America/Santiago" },
  { label: "(UTC-03:00) Buenos Aires",      value: "America/Argentina/Buenos_Aires" },
  { label: "(UTC+00:00) Londres",           value: "Europe/London" },
  { label: "(UTC+01:00) Madrid, Paris",     value: "Europe/Madrid" },
  { label: "(UTC+02:00) Berlin",            value: "Europe/Berlin" },
];

const languages = [
  { value: "es", label: "Espanol", flag: "🇲🇽" },
  { value: "en", label: "English", flag: "🇺🇸" },
];

function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<UserType>>("/users/me");
      return res.data;
    },
  });
}

function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiClient.patch<ApiResponse<UserType>>("/users/me", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export default function ProfileLanguagePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [saved, setSaved] = useState(false);

  const [editedTimezone, setEditedTimezone] = useState<string | null>(null);
  const [editedLocale,   setEditedLocale]   = useState<string | null>(null);

  const timezone = editedTimezone ?? profile?.timezone ?? "America/Mexico_City";
  const locale   = editedLocale   ?? profile?.language  ?? "es";

  const handleSave = () => {
    setSaved(false);
    updateProfile.mutate(
      { timezone, language: locale },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); } },
    );
  };

  const selectedTz   = timezones.find((t) => t.value === timezone);
  const selectedLang = languages.find((l) => l.value === locale);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-20">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Idioma y region</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajusta el idioma y la zona horaria de tu cuenta.
        </p>
      </div>

      {/* ── Summary cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border bg-card px-5 py-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Idioma actual</p>
          <p className="text-base font-bold mt-1 truncate">
            {selectedLang?.flag} {selectedLang?.label ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono uppercase">{locale}</p>
        </div>
        <div className="rounded-2xl border bg-card px-5 py-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Zona horaria</p>
          <p className="text-base font-bold mt-1 truncate">
            {selectedTz?.label.replace(/^\(UTC[^)]+\)\s*/, "") ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {selectedTz?.label.match(/\(UTC[^)]+\)/)?.[0] ?? ""}
          </p>
        </div>
      </div>

      {/* ── Edit form ───────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Globe className="size-4" />
            Preferencias regionales
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Estos ajustes afectan el idioma y el formato de fechas y horas.
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Idioma de la interfaz
              </Label>
              <Select value={locale} onValueChange={setEditedLocale}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.flag} {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Zona horaria
              </Label>
              <Select value={timezone} onValueChange={setEditedTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Fixed save bar ──────────────────────────────────────── */}
      <div
        className="fixed bottom-0 right-0 z-20 border-t bg-background/90 backdrop-blur-sm"
        style={{ left: "var(--sidebar-width, 16rem)" }}
      >
        <div className="flex items-center justify-between px-6 py-3">
          {saved ? (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="size-4" /> Cambios guardados
            </span>
          ) : (
            <p className="text-xs text-muted-foreground">Los cambios no se guardan automaticamente.</p>
          )}
          <Button onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
