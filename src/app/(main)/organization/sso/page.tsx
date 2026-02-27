'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
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
import { useAuthStore } from '@/shared/stores/auth.store';
import {
  useSsoConfig,
  useUpdateSsoConfig,
} from '@/modules/organization/hooks/use-organization';
import { OrgSettingsSidebar } from '@/app/(main)/organization/page';

export default function SsoPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const { data: ssoConfig, isLoading, isError } = useSsoConfig(orgId);
  const updateSso = useUpdateSsoConfig(orgId);

  // Google state
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);

  // GitHub state
  const [githubEnabled, setGithubEnabled] = useState(false);
  const [githubClientId, setGithubClientId] = useState('');
  const [githubClientSecret, setGithubClientSecret] = useState('');
  const [showGithubSecret, setShowGithubSecret] = useState(false);

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

  const handleSaveGoogle = () => {
    updateSso.mutate({
      google: {
        enabled: googleEnabled,
        clientId: googleClientId,
        clientSecret: googleClientSecret,
      },
    });
  };

  const handleSaveGithub = () => {
    updateSso.mutate({
      github: {
        enabled: githubEnabled,
        clientId: githubClientId,
        clientSecret: githubClientSecret,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 p-6">
        <OrgSettingsSidebar />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 p-6">
        <OrgSettingsSidebar />
        <div className="flex-1">
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive text-sm">
                Error al cargar la configuracion de SSO.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6">
      <OrgSettingsSidebar />
      <div className="flex-1 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Inicio de sesion unico (SSO)
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configura proveedores de autenticacion externos para tu
            organizacion.
          </p>
        </div>

        <div className="space-y-6">
          {/* Google Authentication */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950">
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Google Authentication
                    </CardTitle>
                    <CardDescription>
                      Permite a los miembros iniciar sesion con Google.
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={googleEnabled}
                  onCheckedChange={setGoogleEnabled}
                />
              </div>
            </CardHeader>
            {googleEnabled && (
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="google-client-id">Client ID</Label>
                  <Input
                    id="google-client-id"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="Tu Google Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-client-secret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="google-client-secret"
                      type={showGoogleSecret ? 'text' : 'password'}
                      value={googleClientSecret}
                      onChange={(e) =>
                        setGoogleClientSecret(e.target.value)
                      }
                      placeholder="Tu Google Client Secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                    >
                      {showGoogleSecret ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleSaveGoogle}
                    disabled={updateSso.isPending}
                  >
                    {updateSso.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Guardar Google
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* GitHub Authentication */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      GitHub Authentication
                    </CardTitle>
                    <CardDescription>
                      Permite a los miembros iniciar sesion con GitHub.
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={githubEnabled}
                  onCheckedChange={setGithubEnabled}
                />
              </div>
            </CardHeader>
            {githubEnabled && (
              <CardContent className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="github-client-id">Client ID</Label>
                  <Input
                    id="github-client-id"
                    value={githubClientId}
                    onChange={(e) => setGithubClientId(e.target.value)}
                    placeholder="Tu GitHub Client ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github-client-secret">Client Secret</Label>
                  <div className="relative">
                    <Input
                      id="github-client-secret"
                      type={showGithubSecret ? 'text' : 'password'}
                      value={githubClientSecret}
                      onChange={(e) =>
                        setGithubClientSecret(e.target.value)
                      }
                      placeholder="Tu GitHub Client Secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowGithubSecret(!showGithubSecret)}
                    >
                      {showGithubSecret ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleSaveGithub}
                    disabled={updateSso.isPending}
                  >
                    {updateSso.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Guardar GitHub
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
