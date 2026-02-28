'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Building2, UserCheck, Mail, Loader2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface InvitationPreview {
  orgId: number;
  orgName: string;
  roleName: string;
  inviterName: string;
  email: string;
  expiresAt: string;
}

type PageState = 'loading' | 'preview' | 'accepting' | 'success' | 'error' | 'invalid';

// ── Inner component (needs useSearchParams inside Suspense) ───────────────────

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [state, setState] = useState<PageState>('loading');
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const accessToken =
      typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    setIsAuthenticated(!!accessToken);

    if (!token) {
      setState('invalid');
      return;
    }

    apiClient
      .get<ApiResponse<InvitationPreview>>('/invitations/preview', { token })
      .then((res) => {
        setPreview(res.data);
        setState('preview');
      })
      .catch((err: { message?: string }) => {
        setErrorMessage(err?.message ?? 'Invitación inválida o expirada');
        setState('error');
      });
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setState('accepting');
    try {
      await apiClient.post<ApiResponse<{ message: string }>>('/invitations/accept', { token });
      setState('success');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setErrorMessage(apiErr?.message ?? 'No se pudo aceptar la invitación');
      setState('error');
    }
  };

  const redirectParam = encodeURIComponent(`/accept-invitation?token=${token ?? ''}`);
  const loginUrl = `/login?redirect=${redirectParam}`;
  const registerUrl = `/register?redirect=${redirectParam}`;

  // ── Loading ────────────────────────────────────────────────────────────────

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando invitación...</span>
        </div>
      </div>
    );
  }

  // ── Invalid token ──────────────────────────────────────────────────────────

  if (state === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="pb-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Enlace inválido</CardTitle>
            <CardDescription>Este enlace de invitación no contiene un token válido.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/">Ir al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="pb-4">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Invitación no válida</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/">Ir al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────

  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="pb-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle>¡Bienvenido a {preview?.orgName}!</CardTitle>
            <CardDescription>
              Te has unido exitosamente como{' '}
              <span className="font-medium text-foreground">{preview?.roleName}</span>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>Ir al dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Preview / Accepting ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Logo / brand */}
        <div className="flex justify-center mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-3">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl">Has sido invitado</CardTitle>
            <CardDescription>
              <span className="font-medium text-foreground">{preview?.inviterName}</span> te ha
              invitado a unirte a{' '}
              <span className="font-medium text-foreground">{preview?.orgName}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Invitation details */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Organización:</span>
                <span className="font-medium">{preview?.orgName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <UserCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Rol:</span>
                <Badge variant="secondary">{preview?.roleName}</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Para:</span>
                <span className="font-medium">{preview?.email}</span>
              </div>
            </div>

            {/* Action area */}
            {isAuthenticated ? (
              <Button
                className="w-full"
                onClick={handleAccept}
                disabled={state === 'accepting'}
              >
                {state === 'accepting' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aceptando...
                  </>
                ) : (
                  'Aceptar invitación'
                )}
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-center text-muted-foreground">
                  Debes iniciar sesión para aceptar esta invitación
                </p>
                <Button className="w-full" asChild>
                  <Link href={loginUrl}>Iniciar sesión</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={registerUrl}>Crear cuenta nueva</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Page export (Suspense boundary for useSearchParams) ───────────────────────

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando...</span>
          </div>
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}
