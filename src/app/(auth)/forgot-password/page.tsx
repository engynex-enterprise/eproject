"use client";

import { useState, type FormEvent } from "react";
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
import { forgotPassword } from "@/modules/auth/services/auth.service";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("El correo electronico es obligatorio");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Ingresa un correo electronico valido");
      return;
    }

    setIsLoading(true);
    try {
      await forgotPassword(email);
      setIsSent(true);
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ||
        "Error al enviar el enlace de recuperacion";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isSent) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Revisa tu correo</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Hemos enviado un enlace de recuperacion a{" "}
          <span className="font-medium text-foreground">{email}</span>. Revisa
          tu bandeja de entrada y sigue las instrucciones.
        </p>
        <Link href="/login">
          <Button variant="outline" className="mt-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesion
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Recupera tu contrasena</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Ingresa tu correo electronico y te enviaremos un enlace para
            restablecer tu contrasena
          </p>
        </div>

        <Field data-invalid={!!error || undefined}>
          <Label htmlFor="forgot-email">Correo electronico</Label>
          <Input
            id="forgot-email"
            type="email"
            placeholder="nombre@empresa.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            autoComplete="email"
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>

        <Field>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Enviando..." : "Enviar enlace de recuperacion"}
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
