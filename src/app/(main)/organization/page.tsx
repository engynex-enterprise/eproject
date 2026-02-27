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
import { Card, CardContent } from '@/components/ui/card';
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

export const sidebarNav = sidebarNavGroups.flatMap((g) => g.items);

// ─── Page ────────────────────────────────────────────────────────────────────

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
    updateOrg.mutate({ name, description: description || null, website: website || null });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 pb-24">
        <div className="border-b pb-6 space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        Error al cargar la configuracion de la organizacion. Intenta de nuevo mas tarde.
      </div>
    );
  }

  return (
    <div className="space-y-0 pb-24">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="border-b pb-6 mb-8">
        <h2 className="text-xl font-semibold tracking-tight">Configuracion general</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Administra la informacion basica de tu organizacion.
        </p>
      </div>

      <form id="org-general-form" onSubmit={handleSubmit} className="space-y-10">
        {/* ── Sección: Identidad ───────────────────────────────────────── */}
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-[220px_1fr]">
          {/* Left: section description */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold">Identidad</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El nombre y descripcion que representan tu organizacion en toda la plataforma.
            </p>
          </div>

          {/* Right: form card */}
          <Card className="shadow-sm bg-white dark:bg-card">
            <CardContent className="pt-6 space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="org-name" className="text-sm font-medium">
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

              {/* Slug */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Slug</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={org?.slug ?? ''}
                    disabled
                    className="font-mono bg-muted max-w-xs"
                  />
                  <Badge variant="secondary" className="shrink-0">Solo lectura</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Identificador unico generado automaticamente. No se puede modificar.
                </p>
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="org-description" className="text-sm font-medium">
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
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* ── Sección: Contacto ────────────────────────────────────────── */}
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-[220px_1fr]">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold">Contacto</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Informacion de contacto publica de la organizacion.
            </p>
          </div>

          <Card className="shadow-sm bg-white dark:bg-card">
            <CardContent className="pt-6 space-y-5">
              {/* Website */}
              <div className="space-y-1.5">
                <Label htmlFor="org-website" className="text-sm font-medium">
                  Sitio web
                </Label>
                <Input
                  id="org-website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://ejemplo.com"
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  URL publica de tu organizacion. Se mostrara en el perfil.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* ── Fixed save bar ──────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 right-0 z-20 border-t bg-background/80 backdrop-blur-sm"
        style={{ left: 'var(--sidebar-width)' }}
      >
        <div className="flex items-center justify-between px-6 py-3">
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
