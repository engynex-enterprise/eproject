'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, XCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicTicketForm } from '@/modules/helpdesk/components/public-ticket-form';

function SubmitTicketContent() {
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');

  if (!orgId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="pb-4">
            <XCircle className="size-12 text-destructive mx-auto mb-2" />
            <CardTitle>Enlace invalido</CardTitle>
            <CardDescription>
              Este formulario no tiene una organizacion asociada. Verifica el
              enlace e intenta de nuevo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.history.back()}>
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg space-y-4">
        {/* Logo / brand */}
        <div className="flex justify-center mb-2">
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

        <PublicTicketForm orgId={orgId} />

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground">
          Powered by <span className="font-semibold">eProject</span>
        </p>
      </div>
    </div>
  );
}

export default function SubmitTicketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span>Cargando formulario...</span>
          </div>
        </div>
      }
    >
      <SubmitTicketContent />
    </Suspense>
  );
}
