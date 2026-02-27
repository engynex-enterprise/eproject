'use client';

import { useState, useEffect } from 'react';
import {
  Save,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  KeyRound,
  UserX,
  Globe,
  Timer,
  Smartphone,
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/shared/stores/auth.store';
import {
  useSsoConfig,
  useUpdateSsoConfig,
  useSecurityConfig,
  useUpdateSecurityConfig,
} from '@/modules/organization/hooks/use-organization';

export default function SecurityPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  // SSO (real backend)
  const { data: ssoConfig, isLoading: ssoLoading } = useSsoConfig(orgId);
  const updateSso = useUpdateSsoConfig(orgId);

  // Security config (stub)
  const { data: security, isLoading: secLoading } = useSecurityConfig(orgId);
  const updateSecurity = useUpdateSecurityConfig(orgId);

  // ── Social providers state ────────────────────────────────────────────────
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [githubEnabled, setGithubEnabled] = useState(false);
  const [githubClientId, setGithubClientId] = useState('');
  const [githubClientSecret, setGithubClientSecret] = useState('');
  const [showGithubSecret, setShowGithubSecret] = useState(false);

  // ── Password policy state ─────────────────────────────────────────────────
  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(false);
  const [requireNumber, setRequireNumber] = useState(false);
  const [requireSymbol, setRequireSymbol] = useState(false);
  const [expirationDays, setExpirationDays] = useState('');

  // ── 2FA state ────────────────────────────────────────────────────────────
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [twoFaRequired, setTwoFaRequired] = useState(false);

  // ── Account lockout state ─────────────────────────────────────────────────
  const [lockoutEnabled, setLockoutEnabled] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState('5');
  const [lockoutMinutes, setLockoutMinutes] = useState('30');

  // ── IP whitelist state ────────────────────────────────────────────────────
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);
  const [ipAddresses, setIpAddresses] = useState('');

  // ── Session state ─────────────────────────────────────────────────────────
  const [sessionTimeout, setSessionTimeout] = useState('0');

  useEffect(() => {
    if (ssoConfig) {
      setGoogleEnabled(ssoConfig.google.enabled);
      setGoogleClientId(ssoConfig.google.clientId);
      setGoogleClientSecret(ssoConfig.google.clientSecret);
      setGithubEnabled(ssoConfig.github.enabled);
      setGithubClientId(ssoConfig.github.clientId);
      setGithubClientSecret(ssoConfig.github.clientSecret);
    }
  }, [ssoConfig]);

  useEffect(() => {
    if (security) {
      setMinLength(security.passwordPolicy.minLength);
      setRequireUppercase(security.passwordPolicy.requireUppercase);
      setRequireNumber(security.passwordPolicy.requireNumber);
      setRequireSymbol(security.passwordPolicy.requireSymbol);
      setExpirationDays(security.passwordPolicy.expirationDays?.toString() ?? '');
      setTwoFaEnabled(security.twoFactorAuth.enabled);
      setTwoFaRequired(security.twoFactorAuth.required);
      setLockoutEnabled(security.accountLockout.enabled);
      setMaxAttempts(security.accountLockout.maxAttempts.toString());
      setLockoutMinutes(security.accountLockout.lockoutMinutes.toString());
      setIpWhitelistEnabled(security.ipWhitelist.enabled);
      setIpAddresses(security.ipWhitelist.addresses.join('\n'));
      setSessionTimeout(security.sessionTimeout?.toString() ?? '0');
    }
  }, [security]);

  const handleSaveGoogle = () => {
    updateSso.mutate({
      google: { enabled: googleEnabled, clientId: googleClientId, clientSecret: googleClientSecret },
    });
  };

  const handleSaveGithub = () => {
    updateSso.mutate({
      github: { enabled: githubEnabled, clientId: githubClientId, clientSecret: githubClientSecret },
    });
  };

  const handleSavePasswordPolicy = () => {
    updateSecurity.mutate({
      passwordPolicy: {
        minLength,
        requireUppercase,
        requireNumber,
        requireSymbol,
        expirationDays: expirationDays ? parseInt(expirationDays) : null,
      },
    });
  };

  const handleSaveTwoFa = () => {
    updateSecurity.mutate({ twoFactorAuth: { enabled: twoFaEnabled, required: twoFaRequired } });
  };

  const handleSaveLockout = () => {
    updateSecurity.mutate({
      accountLockout: {
        enabled: lockoutEnabled,
        maxAttempts: parseInt(maxAttempts),
        lockoutMinutes: parseInt(lockoutMinutes),
      },
    });
  };

  const handleSaveIpWhitelist = () => {
    const addresses = ipAddresses
      .split('\n')
      .map((ip) => ip.trim())
      .filter(Boolean);
    updateSecurity.mutate({ ipWhitelist: { enabled: ipWhitelistEnabled, addresses } });
  };

  const handleSaveSession = () => {
    updateSecurity.mutate({ sessionTimeout: parseInt(sessionTimeout) || null });
  };

  const ipCount = ipAddresses.split('\n').filter((ip) => ip.trim()).length;

  const isLoading = ssoLoading || secLoading;

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Seguridad</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configura las politicas de seguridad, acceso y autenticacion de tu organizacion.
          </p>
        </div>

        <div className="space-y-6">

          {/* ── 1. Acceso social (SSO) ─────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <KeyRound className="size-4" />
                Acceso social
              </CardTitle>
              <CardDescription>
                Permite a los miembros iniciar sesion con proveedores externos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded bg-red-50 dark:bg-red-950">
                      <svg className="size-4" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Google</p>
                      <p className="text-xs text-muted-foreground">OAuth 2.0</p>
                    </div>
                  </div>
                  <Switch checked={googleEnabled} onCheckedChange={setGoogleEnabled} />
                </div>
                {googleEnabled && (
                  <div className="ml-11 space-y-3 border-l-2 border-muted pl-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="g-client-id" className="text-xs">Client ID</Label>
                      <Input id="g-client-id" value={googleClientId} onChange={(e) => setGoogleClientId(e.target.value)} placeholder="123456789-xxxxx.apps.googleusercontent.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="g-client-secret" className="text-xs">Client Secret</Label>
                      <div className="relative">
                        <Input id="g-client-secret" type={showGoogleSecret ? 'text' : 'password'} value={googleClientSecret} onChange={(e) => setGoogleClientSecret(e.target.value)} placeholder="GOCSPX-..." className="pr-10" />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 size-7" onClick={() => setShowGoogleSecret(!showGoogleSecret)}>
                          {showGoogleSecret ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </Button>
                      </div>
                    </div>
                    <Button size="sm" onClick={handleSaveGoogle} disabled={updateSso.isPending}>
                      {updateSso.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Guardar Google
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* GitHub */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800">
                      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">GitHub</p>
                      <p className="text-xs text-muted-foreground">OAuth App</p>
                    </div>
                  </div>
                  <Switch checked={githubEnabled} onCheckedChange={setGithubEnabled} />
                </div>
                {githubEnabled && (
                  <div className="ml-11 space-y-3 border-l-2 border-muted pl-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="gh-client-id" className="text-xs">Client ID</Label>
                      <Input id="gh-client-id" value={githubClientId} onChange={(e) => setGithubClientId(e.target.value)} placeholder="Iv1.xxxxxxxxxxxxxxxx" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="gh-client-secret" className="text-xs">Client Secret</Label>
                      <div className="relative">
                        <Input id="gh-client-secret" type={showGithubSecret ? 'text' : 'password'} value={githubClientSecret} onChange={(e) => setGithubClientSecret(e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className="pr-10" />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 size-7" onClick={() => setShowGithubSecret(!showGithubSecret)}>
                          {showGithubSecret ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </Button>
                      </div>
                    </div>
                    <Button size="sm" onClick={handleSaveGithub} disabled={updateSso.isPending}>
                      {updateSso.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                      Guardar GitHub
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── 2. Política de contraseñas ────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="size-4" />
                Politica de contraseñas
              </CardTitle>
              <CardDescription>
                Define los requisitos minimos para las contraseñas de los miembros.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="min-length">Longitud minima</Label>
                  <Input
                    id="min-length"
                    type="number"
                    min={4}
                    max={32}
                    value={minLength}
                    onChange={(e) => setMinLength(parseInt(e.target.value) || 8)}
                  />
                  <p className="text-xs text-muted-foreground">Entre 4 y 32 caracteres.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="expiration">Vencimiento (dias)</Label>
                  <Input
                    id="expiration"
                    type="number"
                    min={0}
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value)}
                    placeholder="Sin vencimiento"
                  />
                  <p className="text-xs text-muted-foreground">0 o vacio = sin vencimiento.</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm">Requisitos adicionales</Label>
                <div className="space-y-2">
                  {[
                    { id: 'uppercase', label: 'Al menos una letra mayuscula', value: requireUppercase, onChange: setRequireUppercase },
                    { id: 'number', label: 'Al menos un numero', value: requireNumber, onChange: setRequireNumber },
                    { id: 'symbol', label: 'Al menos un simbolo especial (!@#$...)', value: requireSymbol, onChange: setRequireSymbol },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        id={item.id}
                        checked={item.value}
                        onCheckedChange={(c) => item.onChange(!!c)}
                      />
                      <Label htmlFor={item.id} className="font-normal cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSavePasswordPolicy} disabled={updateSecurity.isPending}>
                  {updateSecurity.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Guardar politica
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── 3. Autenticación de dos factores ─────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Smartphone className="size-4" />
                Autenticacion de dos factores (2FA)
              </CardTitle>
              <CardDescription>
                Añade una capa adicional de seguridad al proceso de inicio de sesion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Habilitar 2FA</p>
                  <p className="text-xs text-muted-foreground">
                    Permite que los miembros configuren 2FA en su cuenta.
                  </p>
                </div>
                <Switch checked={twoFaEnabled} onCheckedChange={setTwoFaEnabled} />
              </div>
              {twoFaEnabled && (
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                  <div>
                    <p className="text-sm font-medium">Requerir 2FA para todos</p>
                    <p className="text-xs text-muted-foreground">
                      Todos los miembros deberan configurar 2FA para acceder.
                    </p>
                  </div>
                  <Switch checked={twoFaRequired} onCheckedChange={setTwoFaRequired} />
                </div>
              )}
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSaveTwoFa} disabled={updateSecurity.isPending}>
                  {updateSecurity.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Guardar 2FA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── 4. Bloqueo de cuenta ──────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserX className="size-4" />
                Bloqueo de cuenta
              </CardTitle>
              <CardDescription>
                Bloquea cuentas automaticamente tras multiples intentos fallidos de inicio de sesion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Activar bloqueo automatico</p>
                  <p className="text-xs text-muted-foreground">
                    Bloquea la cuenta despues de X intentos fallidos.
                  </p>
                </div>
                <Switch checked={lockoutEnabled} onCheckedChange={setLockoutEnabled} />
              </div>
              {lockoutEnabled && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="max-attempts">Max. intentos fallidos</Label>
                      <Input
                        id="max-attempts"
                        type="number"
                        min={1}
                        max={20}
                        value={maxAttempts}
                        onChange={(e) => setMaxAttempts(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lockout-duration">Duracion del bloqueo</Label>
                      <Select value={lockoutMinutes} onValueChange={setLockoutMinutes}>
                        <SelectTrigger id="lockout-duration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutos</SelectItem>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="1440">24 horas</SelectItem>
                          <SelectItem value="0">Indefinido (manual)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSaveLockout} disabled={updateSecurity.isPending}>
                  {updateSecurity.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Guardar bloqueo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── 5. Lista blanca de IPs ────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="size-4" />
                Lista blanca de IPs
              </CardTitle>
              <CardDescription>
                Restringe el acceso solo a las direcciones IP que especifiques.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Activar restriccion por IP</p>
                  <p className="text-xs text-muted-foreground">
                    Solo las IPs de la lista podran acceder a la plataforma.
                  </p>
                </div>
                <Switch checked={ipWhitelistEnabled} onCheckedChange={setIpWhitelistEnabled} />
              </div>
              {ipWhitelistEnabled && (
                <>
                  <Separator />
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="ip-list">Direcciones IP permitidas</Label>
                      {ipCount > 0 && (
                        <Badge variant="secondary">{ipCount} IP{ipCount !== 1 ? 's' : ''}</Badge>
                      )}
                    </div>
                    <Textarea
                      id="ip-list"
                      value={ipAddresses}
                      onChange={(e) => setIpAddresses(e.target.value)}
                      placeholder={"192.168.1.0/24\n10.0.0.1\n2001:db8::1"}
                      rows={5}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Una direccion IP o rango CIDR por linea. Soporta IPv4 e IPv6.
                    </p>
                  </div>
                </>
              )}
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSaveIpWhitelist} disabled={updateSecurity.isPending}>
                  {updateSecurity.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Guardar lista blanca
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── 6. Sesiones ───────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Timer className="size-4" />
                Sesiones
              </CardTitle>
              <CardDescription>
                Controla el tiempo de vida de las sesiones activas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="session-timeout">Tiempo de expiracion de sesion (minutos)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min={0}
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  placeholder="0"
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  0 = sin expiracion. La sesion se cerrara automaticamente tras este periodo de inactividad.
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Cerrar todas las sesiones activas</p>
                  <p className="text-xs text-muted-foreground">
                    Fuerza el cierre de sesion de todos los miembros inmediatamente.
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => {}}>
                  Cerrar todas las sesiones
                </Button>
              </div>
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSaveSession} disabled={updateSecurity.isPending}>
                  {updateSecurity.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Guardar sesiones
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
    </div>
  );
}
