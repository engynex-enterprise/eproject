'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Building2,
  Users,
  Shield,
  Palette,
  Bell,
  HardDrive,
  Save,
  Upload,
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
import { useAuthStore } from '@/shared/stores/auth.store';
import {
  useOrganization,
  useUpdateOrganization,
} from '@/modules/organization/hooks/use-organization';
import { cn } from '@/lib/utils';

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

export function OrgSettingsSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="flex flex-col gap-0.5 w-full lg:w-56 shrink-0">
      {sidebarNavGroups.map((group, gi) => (
        <div key={group.label} className={cn('flex flex-col gap-0.5', gi > 0 && 'mt-4')}>
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            {group.label}
          </p>
          {group.items.map((item) => {
            const isActive =
              item.href === '/organization'
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <item.icon className="size-4" />
                {item.title}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

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
      <div className="flex flex-col lg:flex-row gap-8 p-6">
        <OrgSettingsSidebar />
        <div className="flex-1 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
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
                Error al cargar la configuracion de la organizacion. Intenta de nuevo mas tarde.
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
          <h1 className="text-2xl font-bold tracking-tight">Configuracion general</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Administra la informacion basica de tu organizacion.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informacion de la organizacion</CardTitle>
              <CardDescription>
                Estos datos se mostraran en toda la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
                    {org?.logoUrl ? (
                      <img
                        src={org.logoUrl}
                        alt="Logo"
                        className="size-16 rounded-lg object-cover"
                      />
                    ) : (
                      <Upload className="size-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="size-4" />
                      Subir logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG o SVG. Max 2MB.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="org-name">Nombre de la organizacion</Label>
                <Input
                  id="org-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mi organizacion"
                />
              </div>

              {/* Slug (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="org-slug">Slug</Label>
                <Input
                  id="org-slug"
                  value={org?.slug ?? ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El slug se genera automaticamente y no se puede cambiar.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="org-description">Descripcion</Label>
                <Textarea
                  id="org-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe tu organizacion..."
                  rows={3}
                />
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="org-website">Sitio web</Label>
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

          <div className="flex justify-end">
            <Button type="submit" disabled={updateOrg.isPending}>
              {updateOrg.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
