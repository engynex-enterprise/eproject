"use client";

import { useState, useEffect } from "react";
import { Monitor, Moon, Sun, CheckCircle2, Paintbrush, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import type { User as UserType } from "@/shared/types";

// ─── Presets ─────────────────────────────────────────────────────────────────

const ACCENT_PRESETS = [
  { name: "Azul",    value: "blue",    hex: "#3b82f6", tw: "bg-blue-500"   },
  { name: "Indigo",  value: "indigo",  hex: "#6366f1", tw: "bg-indigo-500" },
  { name: "Verde",   value: "green",   hex: "#22c55e", tw: "bg-green-500"  },
  { name: "Naranja", value: "orange",  hex: "#f97316", tw: "bg-orange-500" },
  { name: "Morado",  value: "purple",  hex: "#a855f7", tw: "bg-purple-500" },
  { name: "Rosa",    value: "pink",    hex: "#ec4899", tw: "bg-pink-500"   },
];

// ─── Hooks ───────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfileAppearancePage() {
  const { theme, setTheme } = useTheme();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark" | "system">("system");
  const [accent, setAccent] = useState("blue");
  const [saved, setSaved] = useState(false);

  // Sync from profile + next-themes on mount
  useEffect(() => {
    if (theme) setSelectedTheme(theme as "light" | "dark" | "system");
  }, [theme]);

  useEffect(() => {
    if (profile?.accentColor) setAccent(profile.accentColor);
  }, [profile?.accentColor]);

  const handleThemeChange = (t: "light" | "dark" | "system") => {
    setSelectedTheme(t);
    setTheme(t);
  };

  const handleSave = () => {
    updateProfile.mutate(
      { theme: selectedTheme, accentColor: accent },
      {
        onSuccess: () => {
          // Persist accent to localStorage so AccentColorProvider picks it up
          localStorage.setItem("accent_color", accent);
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      },
    );
  };

  const themes = [
    { id: "light"  as const, label: "Claro",   Icon: Sun,     bg: "bg-white border-gray-200" },
    { id: "dark"   as const, label: "Oscuro",  Icon: Moon,    bg: "bg-zinc-900 border-zinc-700" },
    { id: "system" as const, label: "Sistema", Icon: Monitor, bg: "bg-gradient-to-br from-white to-zinc-900 border-gray-300" },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-52 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 pb-20">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Apariencia</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personaliza el aspecto visual de tu cuenta personal.
        </p>
      </div>

      {/* ── Theme ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <p className="text-sm font-semibold">Tema de la interfaz</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selecciona el modo de apariencia que prefieres.
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-3 gap-4 max-w-lg">
            {themes.map(({ id, label, Icon, bg }) => {
              const isActive = selectedTheme === id;
              return (
                <button
                  key={id}
                  onClick={() => handleThemeChange(id)}
                  className={cn(
                    "relative flex flex-col gap-3 rounded-xl border-2 p-4 text-left transition-all",
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-muted-foreground/40 hover:bg-muted/30",
                  )}
                >
                  {isActive && (
                    <CheckCircle2 className="absolute right-2.5 top-2.5 size-4 text-primary" />
                  )}
                  <div className={cn("h-14 rounded-lg border-2", bg)} />
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("size-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("text-sm font-medium", isActive ? "text-primary" : "text-foreground")}>
                      {label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Accent color ────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Paintbrush className="size-4" />
            Color de acento
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define el color principal de botones y elementos interactivos en tu cuenta personal.
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="flex flex-wrap gap-3">
            {ACCENT_PRESETS.map((color) => {
              const isActive = accent === color.value;
              return (
                <button
                  key={color.value}
                  onClick={() => setAccent(color.value)}
                  title={color.name}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-3 transition-all",
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm scale-105"
                      : "border-transparent hover:border-muted-foreground/30 hover:bg-muted/30",
                  )}
                >
                  <div className={cn("size-8 rounded-full shadow-sm", color.tw)} />
                  <span className="text-xs font-medium text-muted-foreground">{color.name}</span>
                </button>
              );
            })}
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
