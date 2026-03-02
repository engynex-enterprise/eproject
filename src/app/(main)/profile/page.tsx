"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Camera, Loader2, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";
import type { ApiResponse } from "@/shared/types";
import type { User as UserType } from "@/shared/types";

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone?: string | null;
}

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await apiClient.patch<ApiResponse<UserType>>("/users/me", data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [phone,     setPhone]     = useState("");
  const [saved,     setSaved]     = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const handleSave = (e: { preventDefault(): void }) => {
    e.preventDefault();
    updateProfile.mutate(
      { firstName, lastName, phone: phone || null },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "—";

  return (
    <div className="flex flex-1 flex-col gap-6 pb-20">

      {/* ── Hero card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="px-6 pb-6 -mt-12 flex items-end gap-5">
          <div className="relative shrink-0">
            <Avatar className="size-20 ring-4 ring-background shadow-lg">
              <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                {profile ? getInitials(profile.firstName, profile.lastName) : "?"}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow ring-2 ring-background hover:bg-primary/90 transition-colors"
            >
              <Camera className="size-3" />
            </button>
          </div>
          <div className="pb-1 min-w-0">
            <p className="font-bold text-lg leading-tight truncate">{fullName}</p>
            <p className="text-sm text-muted-foreground truncate">{profile?.email ?? ""}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {(profile as (UserType & { role?: string }) | undefined)?.role ?? "Miembro"}
              </Badge>
              {profile?.isEmailVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <CheckCircle2 className="size-3" />
                  Verificado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Personal info ────────────────────────────────────────── */}
      <form onSubmit={handleSave} className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b">
          <p className="text-sm font-semibold">Informacion personal</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tu perfil publico dentro de la organizacion.
          </p>
        </div>

        <div className="px-6 py-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="first-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Nombre
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Apellido
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  required
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Correo electronico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={profile?.email ?? ""}
                  disabled
                  className="pl-9 bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">El correo no se puede cambiar.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Telefono
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 55 1234 5678"
                  type="tel"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ── Fixed save bar ──────────────────────────────────────── */}
      <div
        className="fixed bottom-0 right-0 z-20 border-t bg-background/90 backdrop-blur-sm"
        style={{ left: 'var(--sidebar-width, 16rem)' }}
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
