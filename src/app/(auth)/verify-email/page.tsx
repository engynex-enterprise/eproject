"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { verifyEmail } from "@/modules/auth/services/auth.service";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type VerificationStatus = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Token de verificacion invalido o faltante.");
      return;
    }

    async function verify() {
      try {
        await verifyEmail(token);
        setStatus("success");
        setTimeout(() => {
          router.push("/login");
        }, 4000);
      } catch (err: unknown) {
        setStatus("error");
        const message =
          (err as { message?: string })?.message ||
          "Error al verificar el correo electronico";
        setErrorMessage(message);
      }
    }

    verify();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {status === "loading" && (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Verificando correo electronico</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Por favor espera mientras verificamos tu correo electronico...
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold">Correo verificado</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Tu correo electronico ha sido verificado exitosamente. Seras
            redirigido al inicio de sesion en unos segundos.
          </p>
          <Link href="/login">
            <Button
              variant="outline"
              className="mt-2"
            >
              Ir al inicio de sesion
            </Button>
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Error de verificacion</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {errorMessage}
          </p>
          <Link href="/login">
            <Button
              variant="outline"
              className="mt-2"
            >
              Ir al inicio de sesion
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
