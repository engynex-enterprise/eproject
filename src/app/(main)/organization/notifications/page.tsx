'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  Mail,
  MessageSquare,
  Smartphone,
  Bell,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/shared/stores/auth.store';
import {
  useNotificationConfig,
  useUpdateNotificationConfig,
} from '@/modules/organization/hooks/use-organization';

export default function OrgNotificationsPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const { data: config, isLoading, isError } = useNotificationConfig(orgId);
  const updateConfig = useUpdateNotificationConfig(orgId);

  // Email state
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromAddress, setFromAddress] = useState('');
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // SMS state
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [smsProvider, setSmsProvider] = useState('twilio');
  const [smsApiKey, setSmsApiKey] = useState('');

  // WhatsApp state
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappApiKey, setWhatsappApiKey] = useState('');

  // Internal state
  const [internalEnabled, setInternalEnabled] = useState(true);

  useEffect(() => {
    if (config) {
      setEmailEnabled(config.email.enabled);
      setSmtpHost(config.email.smtpHost);
      setSmtpPort(String(config.email.smtpPort));
      setSmtpUser(config.email.smtpUser);
      setSmtpPassword(config.email.smtpPassword);
      setFromName(config.email.fromName);
      setFromAddress(config.email.fromAddress);
      setSmsEnabled(config.sms.enabled);
      setSmsProvider(config.sms.provider);
      setSmsApiKey(config.sms.apiKey);
      setWhatsappEnabled(config.whatsapp.enabled);
      setWhatsappApiKey(config.whatsapp.apiKey);
      setInternalEnabled(config.internal.enabled);
    }
  }, [config]);

  const handleSave = () => {
    updateConfig.mutate({
      email: {
        enabled: emailEnabled,
        smtpHost,
        smtpPort: Number(smtpPort),
        smtpUser,
        smtpPassword,
        fromName,
        fromAddress,
      },
      sms: {
        enabled: smsEnabled,
        provider: smsProvider,
        apiKey: smsApiKey,
      },
      whatsapp: {
        enabled: whatsappEnabled,
        apiKey: whatsappApiKey,
      },
      internal: {
        enabled: internalEnabled,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">
              Error al cargar la configuracion de notificaciones.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Canales de notificacion
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configura los canales de notificacion disponibles para tu
            organizacion.
          </p>
        </div>

        <div className="space-y-6">
          {/* Email */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
                    <Mail className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Correo electronico
                    </CardTitle>
                    <CardDescription>
                      Configuracion del servidor SMTP para envio de correos.
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>
            </CardHeader>
            {emailEnabled && (
              <CardContent className="space-y-4">
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">Servidor SMTP</Label>
                    <Input
                      id="smtp-host"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Puerto</Label>
                    <Input
                      id="smtp-port"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="587"
                      type="number"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-user">Usuario SMTP</Label>
                    <Input
                      id="smtp-user"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="usuario@ejemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Contrasena SMTP</Label>
                    <div className="relative">
                      <Input
                        id="smtp-password"
                        type={showSmtpPassword ? 'text' : 'password'}
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        placeholder="Contrasena"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() =>
                          setShowSmtpPassword(!showSmtpPassword)
                        }
                      >
                        {showSmtpPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="from-name">Nombre del remitente</Label>
                    <Input
                      id="from-name"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      placeholder="Mi Organizacion"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from-address">
                      Correo del remitente
                    </Label>
                    <Input
                      id="from-address"
                      value={fromAddress}
                      onChange={(e) => setFromAddress(e.target.value)}
                      placeholder="noreply@ejemplo.com"
                      type="email"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* SMS */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
                    <Smartphone className="size-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">SMS</CardTitle>
                    <CardDescription>
                      Configura el proveedor de mensajes SMS.
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={smsEnabled}
                  onCheckedChange={setSmsEnabled}
                />
              </div>
            </CardHeader>
            {smsEnabled && (
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="sms-provider">Proveedor</Label>
                  <Select value={smsProvider} onValueChange={setSmsProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="vonage">Vonage</SelectItem>
                      <SelectItem value="messagebird">
                        MessageBird
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sms-api-key">API Key</Label>
                  <Input
                    id="sms-api-key"
                    value={smsApiKey}
                    onChange={(e) => setSmsApiKey(e.target.value)}
                    placeholder="Tu API Key"
                    type="password"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* WhatsApp */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950">
                    <MessageSquare className="size-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">WhatsApp</CardTitle>
                    <CardDescription>
                      Configura las notificaciones por WhatsApp.
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={whatsappEnabled}
                  onCheckedChange={setWhatsappEnabled}
                />
              </div>
            </CardHeader>
            {whatsappEnabled && (
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-api-key">API Key</Label>
                  <Input
                    id="whatsapp-api-key"
                    value={whatsappApiKey}
                    onChange={(e) => setWhatsappApiKey(e.target.value)}
                    placeholder="Tu WhatsApp Business API Key"
                    type="password"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Internal Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950">
                    <Bell className="size-5 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Notificaciones internas
                    </CardTitle>
                    <CardDescription>
                      Notificaciones dentro de la plataforma. Activadas por
                      defecto.
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={internalEnabled}
                  onCheckedChange={setInternalEnabled}
                />
              </div>
            </CardHeader>
          </Card>

        </div>

        {/* ── Fixed save bar ──────────────────────────────────────── */}
        <div
          className="fixed bottom-0 right-0 z-20 border-t bg-white/80 backdrop-blur-sm dark:bg-card/80"
          style={{ left: 'var(--sidebar-width)' }}
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Los cambios no se guardan automaticamente.
            </p>
            <Button
              onClick={handleSave}
              disabled={updateConfig.isPending}
            >
              {updateConfig.isPending ? (
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
