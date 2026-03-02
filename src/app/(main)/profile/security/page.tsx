"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, CheckCircle2, ShieldCheck, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api-client";

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      await apiClient.post("/users/me/change-password", data);
    },
  });
}

function getStrength(pw: string): { level: number; label: string; color: string } {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8)        score++;
  if (/[A-Z]/.test(pw))     score++;
  if (/[0-9]/.test(pw))     score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { level: 1, label: "Muy debil",  color: "bg-red-500"     },
    { level: 2, label: "Debil",      color: "bg-orange-500"  },
    { level: 3, label: "Buena",      color: "bg-yellow-500"  },
    { level: 4, label: "Excelente",  color: "bg-emerald-500" },
  ];
  return map[Math.min(score, 4) - 1] ?? { level: 0, label: "", color: "" };
}

function PasswordInput({
  id, value, onChange, placeholder, required, minLength,
}: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; required?: boolean; minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export default function ProfileSecurityPage() {
  const changePassword = useChangePassword();
  const [current, setCurrent] = useState("");
  const [newPw,   setNewPw]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const strength = getStrength(newPw);
  const match    = newPw && confirm ? newPw === confirm : null;

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (newPw !== confirm) { setError("Las contrasenas no coinciden."); return; }
    if (newPw.length < 8)  { setError("Minimo 8 caracteres."); return; }
    changePassword.mutate(
      { currentPassword: current, newPassword: newPw, confirmPassword: confirm },
      {
        onSuccess: () => {
          setCurrent(""); setNewPw(""); setConfirm(""); setSuccess(true);
          setTimeout(() => setSuccess(false), 4000);
        },
        onError: (err) =>
          setError(err instanceof Error ? err.message : "Error al cambiar la contrasena."),
      },
    );
  };

  return (
    <div className="flex flex-1 flex-col gap-6 pb-20">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Seguridad</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra tu contrasena y ajustes de acceso.
        </p>
      </div>

      {/* ── Info banner ─────────────────────────────────────────── */}
      <div className="flex items-start gap-4 rounded-2xl border border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/30 px-5 py-4">
        <ShieldCheck className="mt-0.5 size-5 text-blue-600 dark:text-blue-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Contrasena segura</p>
          <p className="text-xs text-blue-700/80 dark:text-blue-400/80 mt-0.5">
            Usa al menos 8 caracteres combinando mayusculas, numeros y simbolos especiales.
          </p>
        </div>
      </div>

      {/* ── Password form ────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border bg-card shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Lock className="size-4" />
            Cambiar contrasena
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Actualiza tu contrasena de acceso a la plataforma.
          </p>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Current password */}
          <div className="space-y-1.5 max-w-sm">
            <Label htmlFor="current" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Contrasena actual
            </Label>
            <PasswordInput
              id="current"
              value={current}
              onChange={setCurrent}
              placeholder="Tu contrasena actual"
              required
            />
          </div>

          <div className="h-px bg-border" />

          {/* New passwords */}
          <div className="grid gap-5 sm:grid-cols-2 max-w-lg">
            <div className="space-y-1.5">
              <Label htmlFor="new-pw" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Nueva contrasena
              </Label>
              <PasswordInput
                id="new-pw"
                value={newPw}
                onChange={setNewPw}
                placeholder="Nueva contrasena"
                required
                minLength={8}
              />
              {newPw && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all",
                          i <= strength.level ? strength.color : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{strength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Confirmar contrasena
              </Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repetir contrasena"
                  required
                  className={cn(
                    confirm && (match
                      ? "border-emerald-500 focus-visible:ring-emerald-500"
                      : "border-red-400 focus-visible:ring-red-400"),
                  )}
                />
                {match === true && (
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}
        </div>

        {/* Footer with save */}
        <div className="px-6 py-4 bg-muted/30 border-t flex items-center justify-between">
          {success ? (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="size-4" /> Contrasena actualizada
            </span>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Actualizar contrasena
          </Button>
        </div>
      </form>
    </div>
  );
}
