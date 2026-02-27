'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Shield,
  Palette,
  Bell,
  HardDrive,
  Save,
  Loader2,
  Activity,
  Lock,
  Wrench,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/shared/stores/auth.store';
import {
  useOrganization,
  useUpdateOrganization,
} from '@/modules/organization/hooks/use-organization';

// ─── Sidebar Navigation ─────────────────────────────────────────────────────

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export const sidebarNavGroups: NavGroup[] = [
  {
    label: 'Organización',
    items: [
      { title: 'General', href: '/organization', icon: Building2 },
    ],
  },
  {
    label: 'IAM',
    items: [
      { title: 'Personas', href: '/organization/members', icon: Users },
      { title: 'Roles y permisos', href: '/organization/roles', icon: Shield },
      { title: 'Auditoría', href: '/organization/audit', icon: Activity },
    ],
  },
  {
    label: 'Personalización',
    items: [
      { title: 'Apariencia', href: '/organization/appearance', icon: Palette },
    ],
  },
  {
    label: 'Seguridad',
    items: [
      { title: 'Seguridad', href: '/organization/security', icon: Lock },
    ],
  },
  {
    label: 'Comunicación',
    items: [
      { title: 'Notificaciones', href: '/organization/notifications', icon: Bell },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { title: 'Avanzado', href: '/organization/advanced', icon: Wrench },
      { title: 'Almacenamiento', href: '/organization/storage', icon: HardDrive },
      { title: 'Plataforma', href: '/organization/platform', icon: Info },
    ],
  },
];

// Keep for backwards compatibility
export const sidebarNav = sidebarNavGroups.flatMap((g) => g.items);

export default function OrganizationGeneralPage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const { data: org, isLoading, isError } = useOrganization(orgId);
  const updateOrg = useUpdateOrganization(orgId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (org) {
      setName(org.name);
      setDescription(org.description ?? '');
      setWebsite('');
    }
  }, [org]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrg.mutate({
      name,
      description: description || null,
      website: website || null,
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pb-24">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">
              Error al cargar la configuracion de la organizacion. Intenta de nuevo mas tarde.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-24">
      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Configuracion general</h2>
        <p className="text-sm text-muted-foreground">
          Administra la informacion basica de tu organizacion.
        </p>
      </div>

      <form id="org-general-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card className="bg-white shadow-sm dark:bg-card">
          <CardHeader>
            <CardTitle className="text-sm">Informacion de la organizacion</CardTitle>
            <CardDescription>
              Los datos basicos que identifican tu organizacion en la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Name */}
            <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
              <Label htmlFor="org-name" className="text-sm text-muted-foreground">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mi organizacion"
                required
              />
            </div>

            <Separator />

            {/* Slug (read-only) */}
            <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-start">
              <Label className="text-sm text-muted-foreground pt-2.5">Slug</Label>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Input
                    value={org?.slug ?? ''}
                    disabled
                    className="font-mono bg-muted max-w-xs"
                  />
                  <Badge variant="secondary" className="shrink-0">
                    Solo lectura
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Identificador unico generado automaticamente. No se puede modificar.
                </p>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-start">
              <Label htmlFor="org-description" className="text-sm text-muted-foreground pt-2.5">
                Descripcion
              </Label>
              <Textarea
                id="org-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente tu organizacion..."
                rows={3}
                className="resize-none"
              />
            </div>

            <Separator />

            {/* Website */}
            <div className="grid gap-2 sm:grid-cols-[160px_1fr] sm:items-center">
              <Label htmlFor="org-website" className="text-sm text-muted-foreground">
                Sitio web
              </Label>
              <Input
                id="org-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://ejemplo.com"
                type="url"
              />
            </div>
          </CardContent>
        </Card>
      </form>

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
            type="submit"
            form="org-general-form"
            disabled={updateOrg.isPending || !name.trim()}
          >
            {updateOrg.isPending ? (
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
