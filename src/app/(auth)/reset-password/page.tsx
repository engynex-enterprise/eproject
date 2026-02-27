"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Field,
  FieldGroup,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { resetPassword } from "@/modules/auth/services/auth.service";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = "La contrasena es obligatoria";
    } else if (password.length < 8) {
      newErrors.password = "La contrasena debe tener al menos 8 caracteres";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contrasena";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contrasenas no coinciden";
    }

    if (!token) {
      newErrors.general =
        "Token de recuperacion invalido. Solicita un nuevo enlace.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ||
        "Error al restablecer la contrasena";
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl font-bold">Contrasena restablecida</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Tu contrasena ha sido restablecida exitosamente. Seras redirigido al
          inicio de sesion en unos segundos.
        </p>
        <Link href="/login">
          <Button
            variant="outline"
            className="mt-2"
          >
            Ir al inicio de sesion
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Restablece tu contrasena</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Ingresa tu nueva contrasena
          </p>
        </div>

        {errors.general && <FieldError>{errors.general}</FieldError>}

        <Field data-invalid={!!errors.password || undefined}>
          <Label htmlFor="reset-password">Nueva contrasena</Label>
          <Input
            id="reset-password"
            type="password"
            placeholder="Minimo 8 caracteres"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            autoComplete="new-password"
          />
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.confirmPassword || undefined}>
          <Label htmlFor="reset-confirm-password">Confirmar contrasena</Label>
          <Input
            id="reset-confirm-password"
            type="password"
            placeholder="Repite tu contrasena"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword: undefined,
                }));
            }}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <FieldError>{errors.confirmPassword}</FieldError>
          )}
        </Field>

        <Field>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Restableciendo..." : "Restablecer contrasena"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver al inicio de sesion
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
