'use client';

import { useState } from 'react';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Send,
  Ticket,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface PublicTicketFormProps {
  orgId: string;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', color: '#4C9AFF' },
  { value: 'medium', label: 'Media', color: '#FFAB00' },
  { value: 'high', label: 'Alta', color: '#FF991F' },
  { value: 'critical', label: 'Critica', color: '#FF5630' },
];

export function PublicTicketForm({ orgId }: PublicTicketFormProps) {
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  // Validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const errors = {
    fullName: !fullName.trim() ? 'El nombre es requerido' : '',
    email: !email.trim()
      ? 'El email es requerido'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? 'Ingresa un email valido'
        : '',
    subject: !subject.trim()
      ? 'El asunto es requerido'
      : subject.length > 500
        ? 'El asunto no puede exceder 500 caracteres'
        : '',
  };

  const isValid = !errors.fullName && !errors.email && !errors.subject;

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setSubject('');
    setDescription('');
    setPriority('medium');
    setTouched({});
    setFormState('idle');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched to show errors
    setTouched({ fullName: true, email: true, subject: true });

    if (!isValid) return;

    setFormState('submitting');
    setErrorMessage('');

    try {
      const res = await fetch(
        `${API_URL}/organizations/${orgId}/helpdesk/tickets`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: subject.trim(),
            description: description.trim() || undefined,
            priority,
            type: 'external',
            // Contact info sent as part of the ticket
            contactName: fullName.trim(),
            contactEmail: email.trim(),
          }),
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Error al enviar el ticket');
      }

      setFormState('success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al enviar el ticket';
      setErrorMessage(message);
      setFormState('error');
    }
  };

  // ── Success state ──────────────────────────────────────────────────────
  if (formState === 'success') {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold">Ticket enviado correctamente</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Hemos recibido tu solicitud. Te contactaremos al email{' '}
            <span className="font-medium text-foreground">{email}</span> con
            actualizaciones.
          </p>
          <Button onClick={resetForm} variant="outline" className="mt-6">
            Enviar otro ticket
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (formState === 'error') {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <XCircle className="size-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold">Error al enviar el ticket</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            {errorMessage}
          </p>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => setFormState('idle')} variant="outline">
              Intentar de nuevo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-3">
          <Ticket className="size-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Enviar un ticket</CardTitle>
        <CardDescription>
          Completa el formulario y nos pondremos en contacto contigo lo antes
          posible.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name & Email - side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pub-fullname">
                Nombre completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pub-fullname"
                placeholder="Tu nombre"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => markTouched('fullName')}
                aria-invalid={touched.fullName && !!errors.fullName}
              />
              {touched.fullName && errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pub-email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pub-email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => markTouched('email')}
                aria-invalid={touched.email && !!errors.email}
              />
              {touched.email && errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="pub-subject">
              Asunto <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pub-subject"
              placeholder="Resumen breve de tu solicitud"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onBlur={() => markTouched('subject')}
              maxLength={500}
              aria-invalid={touched.subject && !!errors.subject}
            />
            <div className="flex items-center justify-between">
              {touched.subject && errors.subject ? (
                <p className="text-xs text-destructive">{errors.subject}</p>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-muted-foreground">
                {subject.length}/500
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="pub-description">
              Descripcion{' '}
              <span className="text-muted-foreground font-normal">
                (opcional)
              </span>
            </Label>
            <Textarea
              id="pub-description"
              placeholder="Describe tu problema o solicitud con el mayor detalle posible..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Prioridad</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: opt.color }}
                      />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info box */}
          <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-3">
            <AlertTriangle className="size-4 shrink-0 text-muted-foreground mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Tu ticket sera revisado por nuestro equipo de soporte. Recibiras
              actualizaciones en el email proporcionado.
            </p>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={formState === 'submitting'}
          >
            {formState === 'submitting' ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="size-4" />
                Enviar ticket
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
