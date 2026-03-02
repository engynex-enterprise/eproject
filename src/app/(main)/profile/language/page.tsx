"use client";

import { useState } from "react";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
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
  { value: "es", label: "Espanol" },
  { value: "en", label: "English" },
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
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [saved, setSaved] = useState(false);

  const [editedTimezone, setEditedTimezone] = useState<string | null>(null);
  const [editedLocale,   setEditedLocale]   = useState<string | null>(null);

  const timezone = editedTimezone ?? profile?.timezone ?? "America/Mexico_City";
  const locale   = editedLocale   ?? profile?.language ?? "es";

  const handleSave = () => {
    setSaved(false);
    updateProfile.mutate(
      { timezone, language: locale },
      { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); } },
    );
  };

  const selectedTz = timezones.find((t) => t.value === timezone);
  const selectedLang = languages.find((l) => l.value === locale);

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Preview card */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            title: "Idioma actual",
            value: selectedLang?.label ?? "—",
            sub:   locale.toUpperCase(),
          },
          {
            title: "Zona horaria",
            value: selectedTz?.label.replace(/^\(UTC[^)]+\)\s*/, "") ?? "—",
            sub:   selectedTz?.label.match(/\(UTC[^)]+\)/)?.[0] ?? "",
          },
        ].map(({ title, value, sub }) => (
          <div key={title} className="rounded-2xl border bg-card px-5 py-4 shadow-sm">
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-base font-semibold mt-1 truncate">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Edit card */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <p className="text-sm font-semibold">Preferencias regionales</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Estos ajustes afectan el idioma y el formato de fechas y horas.
          </p>
        </div>

        <div className="px-6 py-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
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
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
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

        <div className="px-6 py-4 bg-muted/30 border-t flex items-center justify-between">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="size-4" /> Cambios guardados
            </span>
          )}
          <div className="ml-auto">
            <Button onClick={handleSave} size="sm" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
