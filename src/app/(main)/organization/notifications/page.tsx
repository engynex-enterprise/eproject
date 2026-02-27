'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Smartphone, MessageSquare, Bell, Eye, EyeOff, ChevronDown, ChevronUp, Sparkles, RotateCcw } from 'lucide-react';
import { sileo } from 'sileo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useNotificationConfig, useUpdateNotificationConfig } from '@/modules/organization/hooks/use-organization';
import { useSileoConfigStore, type SileoPosition, type SileoTheme } from '@/shared/stores/sileo-config.store';
import type { EmailTemplate } from '@/modules/organization/services/organization.service';

// ─── Provider definitions ─────────────────────────────────────────────────────

type EmailProvider = 'smtp' | 'sendgrid' | 'aws_ses' | 'gmail';

const PROVIDERS: { id: EmailProvider; name: string; description: string; badge?: string; icon: React.ReactNode }[] = [
  {
    id: 'smtp',
    name: 'SMTP',
    description: 'Cualquier servidor de correo compatible con SMTP',
    icon: (
      <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Plataforma de entrega de correo de Twilio',
    badge: 'Popular',
    icon: (
      <svg viewBox="0 0 32 32" className="size-7" fill="currentColor">
        <path d="M0 10.667h10.667v10.667H0zm10.667 10.666h10.666v10.667H10.667zM10.667 0h10.666v10.667H10.667zm10.666 10.667H32v10.666H21.333z" />
      </svg>
    ),
  },
  {
    id: 'aws_ses',
    name: 'Amazon SES',
    description: 'Simple Email Service de Amazon Web Services',
    icon: (
      <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: 'gmail',
    name: 'Gmail / Google',
    description: 'Gmail o Google Workspace via OAuth2',
    icon: (
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor">
        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
      </svg>
    ),
  },
];

// ─── Template definitions ─────────────────────────────────────────────────────

const TEMPLATE_DEFS = [
  { key: 'login_report',       label: 'Reporte de inicio de sesion',     description: 'Se envia cuando un usuario inicia sesion',           variables: ['{{name}}', '{{date}}', '{{device}}', '{{ip}}', '{{orgName}}'] },
  { key: 'account_activation', label: 'Activacion de cuenta',             description: 'Enlace para activar una cuenta nueva',               variables: ['{{name}}', '{{link}}', '{{orgName}}'] },
  { key: 'password_recovery',  label: 'Recuperacion de contrasena',       description: 'Enlace para restablecer la contrasena',               variables: ['{{name}}', '{{link}}', '{{orgName}}'] },
  { key: 'two_factor',         label: 'Codigo de doble factor (2FA)',     description: 'Codigo OTP para autenticacion de dos factores',       variables: ['{{name}}', '{{code}}', '{{orgName}}'] },
  { key: 'invitation',         label: 'Invitacion / creacion de cuenta',  description: 'Enlace de invitacion o credenciales de cuenta nueva', variables: ['{{name}}', '{{inviterName}}', '{{role}}', '{{link}}', '{{orgName}}'] },
  { key: 'report',             label: 'Informes periodicos',               description: 'Correo de resumen o informe de actividad',            variables: ['{{name}}', '{{reportContent}}', '{{orgName}}'] },
  { key: 'custom',             label: 'Plantilla personalizada',           description: 'Plantilla libre para usos adicionales',               variables: ['{{name}}', '{{message}}', '{{orgName}}'] },
] as const;

// ─── Sileo config section ─────────────────────────────────────────────────────

const POSITIONS: { id: SileoPosition; label: string; row: number; col: number }[] = [
  { id: 'top-left',      label: 'Arriba izq.',    row: 0, col: 0 },
  { id: 'top-center',    label: 'Arriba centro',  row: 0, col: 1 },
  { id: 'top-right',     label: 'Arriba der.',    row: 0, col: 2 },
  { id: 'bottom-left',   label: 'Abajo izq.',     row: 1, col: 0 },
  { id: 'bottom-center', label: 'Abajo centro',   row: 1, col: 1 },
  { id: 'bottom-right',  label: 'Abajo der.',     row: 1, col: 2 },
];

const THEMES: { id: SileoTheme; label: string; description: string }[] = [
  { id: 'system', label: 'Sistema',  description: 'Sigue el tema de la plataforma' },
  { id: 'light',  label: 'Claro',    description: 'Siempre fondo oscuro (contraste)' },
  { id: 'dark',   label: 'Oscuro',   description: 'Siempre fondo claro' },
];

const ALERT_PROVIDERS: { id: 'sileo' | 'shadcn'; name: string; description: string; badge?: string }[] = [
  {
    id: 'sileo',
    name: 'Sileo',
    description: 'Toasts animados y personalizables con soporte completo de temas.',
    badge: 'Recomendado',
  },
  {
    id: 'shadcn',
    name: 'Shadcn / Sonner',
    description: 'Toasts nativos de Sonner integrados con el sistema de diseño de la app.',
  },
];

function SileoConfigSection() {
  const { config, updateConfig, resetConfig } = useSileoConfigStore();
  const isSileo = config.alertProvider === 'sileo';

  const durationLabel =
    config.duration === null
      ? 'Nunca'
      : config.duration < 1000
      ? `${config.duration} ms`
      : `${(config.duration / 1000).toFixed(1).replace('.0', '')} s`;

  const firePreview = () => {
    sileo.success({
      title: 'Notificacion de prueba (Sileo)',
      description: `Posicion: ${config.position} · Duracion: ${durationLabel}`,
    });
  };

  return (
    <div className="grid gap-x-10 gap-y-6 md:grid-cols-[220px_1fr]">
      {/* Left label */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold">Alertas visuales</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Elige el sistema de notificaciones emergentes y personaliza su apariencia. Se guarda en la base de datos al pulsar "Guardar cambios".
        </p>
        {isSileo && (
          <Button variant="ghost" size="sm" className="mt-2 gap-1.5 text-muted-foreground" onClick={resetConfig}>
            <RotateCcw className="size-3.5" />
            Restablecer
          </Button>
        )}
      </div>

      {/* Right: cards */}
      <div className="space-y-6">

        {/* ── Provider picker ───────────────────────────────────── */}
        <Card className="shadow-sm bg-white dark:bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Proveedor de alertas</CardTitle>
            <CardDescription>Selecciona la libreria que mostrara las notificaciones en pantalla.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {ALERT_PROVIDERS.map((p) => {
                const active = config.alertProvider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateConfig({ alertProvider: p.id })}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                      active
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-white dark:bg-card hover:border-muted-foreground/30 hover:bg-muted/20'
                    }`}
                  >
                    <div className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${active ? 'border-primary' : 'border-muted-foreground/40'}`}>
                      {active && <span className="size-2 rounded-full bg-primary block" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{p.name}</span>
                        {p.badge && <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{p.badge}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ── Sileo-only config ─────────────────────────────────── */}
        {isSileo && (
          <>
            {/* Position */}
            <Card className="shadow-sm bg-white dark:bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Posicion</CardTitle>
                <CardDescription>Esquina de la pantalla donde apareceran las alertas.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mx-auto w-full max-w-xs aspect-video rounded-lg border-2 border-dashed border-border bg-muted/30 p-2">
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest select-none">
                    Pantalla
                  </span>
                  {POSITIONS.map((p) => {
                    const active = config.position === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        title={p.label}
                        onClick={() => updateConfig({ position: p.id })}
                        style={{
                          position: 'absolute',
                          top:    p.row === 0 ? '6px'  : undefined,
                          bottom: p.row === 1 ? '6px'  : undefined,
                          left:   p.col === 0 ? '6px'  : p.col === 1 ? '50%' : undefined,
                          right:  p.col === 2 ? '6px'  : undefined,
                          transform: p.col === 1 ? 'translateX(-50%)' : undefined,
                        }}
                        className={`w-14 rounded px-1.5 py-1 text-[9px] font-semibold leading-tight transition-all ${
                          active
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'bg-background/80 text-muted-foreground border border-border hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Theme */}
            <Card className="shadow-sm bg-white dark:bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Tema de las alertas</CardTitle>
                <CardDescription>Color de fondo de los toasts independiente del tema de la app.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {THEMES.map((t) => {
                    const active = config.theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => updateConfig({ theme: t.id })}
                        className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-left transition-all ${
                          active
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border bg-white dark:bg-card hover:border-muted-foreground/30 hover:bg-muted/20'
                        }`}
                      >
                        <div className={`mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${active ? 'border-primary' : 'border-muted-foreground/40'}`}>
                          {active && <span className="size-1.5 rounded-full bg-primary block" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-tight">{t.label}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{t.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Duration + Roundness */}
            <Card className="shadow-sm bg-white dark:bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Comportamiento</CardTitle>
                <CardDescription>Tiempo en pantalla y radio de los bordes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Duracion</Label>
                    <span className="text-sm font-semibold tabular-nums text-primary min-w-[3rem] text-right">{durationLabel}</span>
                  </div>
                  <Slider
                    min={0} max={16} step={1}
                    value={[config.duration === null ? 16 : Math.round(config.duration / 1000)]}
                    onValueChange={([v]) => updateConfig({ duration: v === 16 ? null : v * 1000 })}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>0 s</span><span>8 s</span><span>Nunca</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Redondez</Label>
                    <span className="text-sm font-semibold tabular-nums text-primary min-w-[3rem] text-right">{config.roundness} px</span>
                  </div>
                  <Slider
                    min={0} max={24} step={1}
                    value={[config.roundness]}
                    onValueChange={([v]) => updateConfig({ roundness: v })}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Cuadrado</span><span>Redondeado</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Offset */}
            <Card className="shadow-sm bg-white dark:bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Desplazamiento</CardTitle>
                <CardDescription>Distancia en pixeles desde cada borde de la pantalla.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {(
                    [
                      { key: 'offsetTop',    label: 'Arriba' },
                      { key: 'offsetRight',  label: 'Derecha' },
                      { key: 'offsetBottom', label: 'Abajo' },
                      { key: 'offsetLeft',   label: 'Izquierda' },
                    ] as const
                  ).map(({ key, label }) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="text-xs text-muted-foreground">{label}</Label>
                      <div className="relative">
                        <Input
                          id={key} type="number" min={0} max={200}
                          value={config[key]}
                          onChange={(e) => updateConfig({ [key]: Math.max(0, Number(e.target.value)) })}
                          className="pr-7 text-sm"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">px</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <div className="flex justify-end">
              <Button variant="outline" onClick={firePreview} className="gap-2">
                <Sparkles className="size-4" />
                Probar notificacion
              </Button>
            </div>
          </>
        )}

        {/* ── Shadcn info ───────────────────────────────────────── */}
        {!isSileo && (
          <Card className="shadow-sm bg-white dark:bg-card border-dashed">
            <CardContent className="pt-5 pb-4">
              <p className="text-sm text-muted-foreground">
                Sonner usa la posicion, tema y redondez configurados arriba cuando estes disponibles.
                Para opciones avanzadas de Sonner visita su documentacion oficial.
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrgNotificationsPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const { data: config, isLoading, isError } = useNotificationConfig(orgId);
  const updateConfig = useUpdateNotificationConfig(orgId);
  const { config: sileoStore, updateConfig: updateSileoConfig } = useSileoConfigStore();

  // Email general
  const [emailEnabled,     setEmailEnabled]     = useState(false);
  const [emailProvider,    setEmailProvider]    = useState<EmailProvider>('smtp');
  const [emailFromName,    setEmailFromName]    = useState('');
  const [emailFromAddress, setEmailFromAddress] = useState('');

  // SMTP
  const [smtpHost,     setSmtpHost]     = useState('');
  const [smtpPort,     setSmtpPort]     = useState('587');
  const [smtpUser,     setSmtpUser]     = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpSecure,   setSmtpSecure]   = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  // SendGrid
  const [sendgridApiKey, setSendgridApiKey] = useState('');
  const [showSgKey,      setShowSgKey]      = useState(false);

  // AWS SES
  const [awsAccessKeyId,     setAwsAccessKeyId]     = useState('');
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState('');
  const [awsRegion,          setAwsRegion]          = useState('us-east-1');
  const [showAwsSecret,      setShowAwsSecret]      = useState(false);

  // Gmail OAuth2
  const [gmailClientId,     setGmailClientId]     = useState('');
  const [gmailClientSecret, setGmailClientSecret] = useState('');
  const [gmailRefreshToken, setGmailRefreshToken] = useState('');
  const [showGmailSecret,   setShowGmailSecret]   = useState(false);

  // SMS / WhatsApp / Internal
  const [smsEnabled,      setSmsEnabled]      = useState(false);
  const [smsProvider,     setSmsProvider]     = useState('twilio');
  const [smsApiKey,       setSmsApiKey]       = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappApiKey,  setWhatsappApiKey]  = useState('');
  const [internalEnabled, setInternalEnabled] = useState(true);

  // Templates
  const [templates,     setTemplates]     = useState<Record<string, EmailTemplate>>({});
  const [openTemplate,  setOpenTemplate]  = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;
    setEmailEnabled(config.emailEnabled);
    setEmailProvider((config.emailProvider as EmailProvider) ?? 'smtp');
    setEmailFromName(config.emailFromName ?? '');
    setEmailFromAddress(config.emailFromAddress ?? '');
    setSmtpHost(config.smtpHost ?? '');
    setSmtpPort(String(config.smtpPort ?? 587));
    setSmtpUser(config.smtpUser ?? '');
    setSmtpPassword(config.smtpPassword ?? '');
    setSmtpSecure(config.smtpSecure ?? false);
    setSendgridApiKey(config.sendgridApiKey ?? '');
    setAwsAccessKeyId(config.awsAccessKeyId ?? '');
    setAwsSecretAccessKey(config.awsSecretAccessKey ?? '');
    setAwsRegion(config.awsRegion ?? 'us-east-1');
    setGmailClientId(config.gmailClientId ?? '');
    setGmailClientSecret(config.gmailClientSecret ?? '');
    setGmailRefreshToken(config.gmailRefreshToken ?? '');
    setSmsEnabled(config.smsEnabled);
    setSmsProvider(config.smsProvider ?? 'twilio');
    setSmsApiKey(config.smsApiKey ?? '');
    setWhatsappEnabled(config.whatsappEnabled);
    setWhatsappApiKey(config.whatsappApiKey ?? '');
    setInternalEnabled(config.internalEnabled);
    if (config.emailTemplates) {
      setTemplates(config.emailTemplates as unknown as Record<string, EmailTemplate>);
    }
    // Sync Sileo config from DB into the local store
    const patch: Record<string, any> = {
      alertProvider: (config.uiAlertProvider ?? 'sileo') as 'sileo' | 'shadcn',
    };
    if (config.sileoConfig && typeof config.sileoConfig === 'object') {
      Object.assign(patch, config.sileoConfig);
    }
    updateSileoConfig(patch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const updateTemplate = (key: string, field: keyof EmailTemplate, value: string | boolean) => {
    setTemplates((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { enabled: true, subject: '', body: '' }), [field]: value } }));
  };

  const handleSave = () => {
    updateConfig.mutate({
      emailEnabled,
      emailProvider,
      emailFromName:    emailFromName    || null,
      emailFromAddress: emailFromAddress || null,
      smtpHost:         smtpHost         || null,
      smtpPort:         smtpPort ? Number(smtpPort) : null,
      smtpUser:         smtpUser         || null,
      smtpPassword:     smtpPassword     || null,
      smtpSecure,
      sendgridApiKey:      sendgridApiKey      || null,
      awsAccessKeyId:      awsAccessKeyId      || null,
      awsSecretAccessKey:  awsSecretAccessKey  || null,
      awsRegion:           awsRegion           || null,
      gmailClientId:       gmailClientId       || null,
      gmailClientSecret:   gmailClientSecret   || null,
      gmailRefreshToken:   gmailRefreshToken   || null,
      smsEnabled,
      smsProvider:    smsProvider    || null,
      smsApiKey:      smsApiKey      || null,
      whatsappEnabled,
      whatsappApiKey: whatsappApiKey || null,
      internalEnabled,
      emailTemplates: templates as never,
      // Sileo / UI alert config
      uiAlertProvider: sileoStore.alertProvider,
      sileoConfig: {
        position:     sileoStore.position,
        theme:        sileoStore.theme,
        duration:     sileoStore.duration,
        roundness:    sileoStore.roundness,
        offsetTop:    sileoStore.offsetTop,
        offsetRight:  sileoStore.offsetRight,
        offsetBottom: sileoStore.offsetBottom,
        offsetLeft:   sileoStore.offsetLeft,
      },
    });
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 pb-24">
        <div className="border-b pb-6 space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Error al cargar la configuracion de notificaciones. Intenta de nuevo mas tarde.
      </div>
    );
  }

  return (
    <div className="space-y-0 pb-24">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="border-b pb-6 mb-8">
        <h2 className="text-xl font-semibold tracking-tight">Canales de notificacion</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configura los proveedores de correo, SMS y las plantillas de mensajes.
        </p>
      </div>

      <div className="space-y-10">

        {/* ═══════════════════════════════════════════════════════════
            CORREO ELECTRÓNICO
        ═══════════════════════════════════════════════════════════ */}
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-[220px_1fr]">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold">Correo electronico</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Selecciona y configura el proveedor para el envio de correos transaccionales.
            </p>
          </div>

          <div className="space-y-5">
            {/* Activation toggle */}
            <Card className="shadow-sm bg-white dark:bg-card">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Activar envio de correos</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Habilita el envio de correos transaccionales a los miembros de la organizacion.
                    </p>
                  </div>
                  <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                </div>
              </CardContent>
            </Card>

            {/* Provider cards */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Proveedor de correo</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                {PROVIDERS.map((p) => {
                  const active = emailProvider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setEmailProvider(p.id)}
                      className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                        active
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-white dark:bg-card hover:border-muted-foreground/30 hover:bg-muted/20'
                      }`}
                    >
                      {/* Radio dot */}
                      <div className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${active ? 'border-primary' : 'border-muted-foreground/40'}`}>
                        {active && <span className="size-2 rounded-full bg-primary block" />}
                      </div>
                      {/* Icon */}
                      <div className={`shrink-0 mt-0.5 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                        {p.icon}
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold">{p.name}</span>
                          {p.badge && <Badge variant="secondary" className="text-[10px] py-0 px-1.5">{p.badge}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{p.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── SMTP config ───────────────────────────────────────────── */}
            {emailProvider === 'smtp' && (
              <Card className="shadow-sm bg-white dark:bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Configuracion SMTP</CardTitle>
                  <CardDescription>Parametros de conexion con tu servidor de correo saliente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-host">Servidor SMTP</Label>
                      <Input id="smtp-host" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-port">Puerto</Label>
                      <Input id="smtp-port" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" type="number" min={1} max={65535} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="smtp-user">Usuario SMTP</Label>
                      <Input id="smtp-user" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="tu@correo.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtp-password">Contrasena</Label>
                      <div className="relative">
                        <Input id="smtp-password" type={showSmtpPass ? 'text' : 'password'} value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} placeholder="Contrasena SMTP" />
                        <Button type="button" variant="ghost" size="icon-xs" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowSmtpPass(!showSmtpPass)}>
                          {showSmtpPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch id="smtp-secure" checked={smtpSecure} onCheckedChange={setSmtpSecure} />
                    <Label htmlFor="smtp-secure" className="cursor-pointer">Usar TLS/SSL (recomendado para puerto 465)</Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── SendGrid config ───────────────────────────────────────── */}
            {emailProvider === 'sendgrid' && (
              <Card className="shadow-sm bg-white dark:bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Configuracion SendGrid</CardTitle>
                  <CardDescription>
                    Obtén tu API key en <span className="font-mono text-xs bg-muted px-1 rounded">app.sendgrid.com → Settings → API Keys</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sg-key">API Key de SendGrid</Label>
                    <div className="relative">
                      <Input id="sg-key" type={showSgKey ? 'text' : 'password'} value={sendgridApiKey} onChange={(e) => setSendgridApiKey(e.target.value)} placeholder="SG.xxxxxxxxxxxxxxxxxx" className="font-mono pr-10" />
                      <Button type="button" variant="ghost" size="icon-xs" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowSgKey(!showSgKey)}>
                        {showSgKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── AWS SES config ────────────────────────────────────────── */}
            {emailProvider === 'aws_ses' && (
              <Card className="shadow-sm bg-white dark:bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Configuracion Amazon SES</CardTitle>
                  <CardDescription>
                    Crea un usuario IAM con el permiso <span className="font-mono text-xs bg-muted px-1 rounded">ses:SendEmail</span> y verifica tu dominio remitente en SES.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aws-key-id">Access Key ID</Label>
                    <Input id="aws-key-id" value={awsAccessKeyId} onChange={(e) => setAwsAccessKeyId(e.target.value)} placeholder="AKIAIOSFODNN7EXAMPLE" className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aws-secret">Secret Access Key</Label>
                    <div className="relative">
                      <Input id="aws-secret" type={showAwsSecret ? 'text' : 'password'} value={awsSecretAccessKey} onChange={(e) => setAwsSecretAccessKey(e.target.value)} placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" className="font-mono pr-10" />
                      <Button type="button" variant="ghost" size="icon-xs" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowAwsSecret(!showAwsSecret)}>
                        {showAwsSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aws-region">Region</Label>
                    <Select value={awsRegion} onValueChange={setAwsRegion}>
                      <SelectTrigger id="aws-region"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['us-east-1','us-east-2','us-west-1','us-west-2','eu-west-1','eu-west-2','eu-central-1','ap-southeast-1','ap-southeast-2','ap-northeast-1','sa-east-1'].map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Gmail / Google OAuth2 config ──────────────────────────── */}
            {emailProvider === 'gmail' && (
              <Card className="shadow-sm bg-white dark:bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Configuracion Gmail / Google Workspace</CardTitle>
                  <CardDescription>
                    Crea credenciales OAuth2 en <span className="font-mono text-xs bg-muted px-1 rounded">console.cloud.google.com</span> → APIs & Services → Credentials → OAuth 2.0 Client (tipo Web application).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gmail-client-id">Client ID</Label>
                    <Input id="gmail-client-id" value={gmailClientId} onChange={(e) => setGmailClientId(e.target.value)} placeholder="xxxxxxxxxx.apps.googleusercontent.com" className="font-mono text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gmail-secret">Client Secret</Label>
                    <div className="relative">
                      <Input id="gmail-secret" type={showGmailSecret ? 'text' : 'password'} value={gmailClientSecret} onChange={(e) => setGmailClientSecret(e.target.value)} placeholder="GOCSPX-xxxxxxxxxxxxxxx" className="font-mono text-xs pr-10" />
                      <Button type="button" variant="ghost" size="icon-xs" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowGmailSecret(!showGmailSecret)}>
                        {showGmailSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gmail-refresh">Refresh Token</Label>
                    <Input id="gmail-refresh" value={gmailRefreshToken} onChange={(e) => setGmailRefreshToken(e.target.value)} placeholder="1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="font-mono text-xs" />
                    <p className="text-xs text-muted-foreground">
                      Genera el refresh token con el scope <span className="font-mono bg-muted px-1 rounded">https://mail.google.com/</span> usando el Playground de OAuth2.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sender info — common to all providers */}
            <Card className="shadow-sm bg-white dark:bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Datos del remitente</CardTitle>
                <CardDescription>Nombre y correo que veran los destinatarios en cada mensaje.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="from-name">Nombre del remitente</Label>
                    <Input id="from-name" value={emailFromName} onChange={(e) => setEmailFromName(e.target.value)} placeholder="Mi Organizacion" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-address">Correo remitente</Label>
                    <Input id="from-address" type="email" value={emailFromAddress} onChange={(e) => setEmailFromAddress(e.target.value)} placeholder="noreply@miempresa.com" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator />

        {/* ═══════════════════════════════════════════════════════════
            PLANTILLAS DE CORREO
        ═══════════════════════════════════════════════════════════ */}
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-[220px_1fr]">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold">Plantillas de correo</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Personaliza el asunto y cuerpo de cada tipo de correo. Usa las variables indicadas para contenido dinamico.
            </p>
          </div>

          <div className="space-y-3">
            {TEMPLATE_DEFS.map((def) => {
              const tpl: EmailTemplate = templates[def.key] ?? { enabled: true, subject: '', body: '' };
              const isOpen = openTemplate === def.key;
              return (
                <Card key={def.key} className="shadow-sm bg-white dark:bg-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenTemplate(isOpen ? null : def.key)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Switch
                        checked={tpl.enabled}
                        onCheckedChange={(v) => updateTemplate(def.key, 'enabled', v)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{def.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{def.description}</p>
                      </div>
                    </div>
                    {isOpen
                      ? <ChevronUp className="size-4 text-muted-foreground shrink-0" />
                      : <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                    }
                  </button>

                  {isOpen && (
                    <div className="border-t px-5 py-5 space-y-4 bg-muted/20">
                      {/* Variables */}
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground font-medium">Variables:</span>
                        {def.variables.map((v) => (
                          <code key={v} className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigator.clipboard.writeText(v)} title="Clic para copiar">
                            {v}
                          </code>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`subject-${def.key}`}>Asunto</Label>
                        <Input
                          id={`subject-${def.key}`}
                          value={tpl.subject}
                          onChange={(e) => updateTemplate(def.key, 'subject', e.target.value)}
                          placeholder="Asunto del correo..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`body-${def.key}`}>Cuerpo del mensaje</Label>
                        <Textarea
                          id={`body-${def.key}`}
                          value={tpl.body}
                          onChange={(e) => updateTemplate(def.key, 'body', e.target.value)}
                          rows={9}
                          placeholder="Escribe el cuerpo del correo. Puedes usar saltos de linea para separar parrafos."
                          className="font-mono text-xs resize-y"
                        />
                        <p className="text-xs text-muted-foreground">
                          Texto plano con saltos de linea. Clic en una variable para copiarla.
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* ═══════════════════════════════════════════════════════════
            SMS
        ═══════════════════════════════════════════════════════════ */}
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-[220px_1fr]">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold">SMS</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Configura el proveedor de mensajes SMS para notificaciones de texto.
            </p>
          </div>

          <Card className="shadow-sm bg-white dark:bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
                    <Smartphone className="size-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">SMS</CardTitle>
                    <CardDescription>Mensajes de texto a telefonos moviles.</CardDescription>
                  </div>
                </div>
                <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
              </div>
            </CardHeader>
            {smsEnabled && (
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <Select value={smsProvider} onValueChange={setSmsProvider}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="vonage">Vonage</SelectItem>
                      <SelectItem value="messagebird">MessageBird</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input type="password" value={smsApiKey} onChange={(e) => setSmsApiKey(e.target.value)} placeholder="Tu API Key" />
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <Separator />

        {/* ═══════════════════════════════════════════════════════════
            WHATSAPP
        ═══════════════════════════════════════════════════════════ */}
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-[220px_1fr]">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold">WhatsApp</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Notificaciones via WhatsApp Business API.
            </p>
          </div>

          <Card className="shadow-sm bg-white dark:bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
                    <MessageSquare className="size-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">WhatsApp</CardTitle>
                    <CardDescription>Notificaciones por WhatsApp Business.</CardDescription>
                  </div>
                </div>
                <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
              </div>
            </CardHeader>
            {whatsappEnabled && (
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <Label>WhatsApp Business API Key</Label>
                  <Input type="password" value={whatsappApiKey} onChange={(e) => setWhatsappApiKey(e.target.value)} placeholder="Tu WhatsApp Business API Key" />
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <Separator />

        {/* ═══════════════════════════════════════════════════════════
            NOTIFICACIONES INTERNAS
        ═══════════════════════════════════════════════════════════ */}
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-[220px_1fr]">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold">Notificaciones internas</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Notificaciones en tiempo real dentro de la plataforma.
            </p>
          </div>

          <Card className="shadow-sm bg-white dark:bg-card">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950">
                    <Bell className="size-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Notificaciones en plataforma</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Alertas y avisos dentro de la aplicacion. Recomendado mantener activo.</p>
                  </div>
                </div>
                <Switch checked={internalEnabled} onCheckedChange={setInternalEnabled} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* ═══════════════════════════════════════════════════════════
            ALERTAS VISUALES (SILEO)
        ═══════════════════════════════════════════════════════════ */}
        <SileoConfigSection />

      </div>

      {/* ── Fixed save bar ─────────────────────────────────────────────── */}
      <div className="fixed bottom-0 right-0 z-20 border-t bg-background/80 backdrop-blur-sm" style={{ left: 'var(--sidebar-width)' }}>
        <div className="flex items-center justify-between px-6 py-3">
          <p className="text-xs text-muted-foreground">Los cambios no se guardan automaticamente.</p>
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
