'use client';

import {
  Info,
  ExternalLink,
  Server,
  Layers,
  Users,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlatformInfo } from '@/modules/organization/hooks/use-organization';
import { OrgSettingsSidebar } from '@/app/(main)/organization/page';

// ─── Tech Stack ──────────────────────────────────────────────────────────────

const TECH_STACK = [
  { icon: '▲', name: 'Next.js', version: '15', category: 'Frontend' },
  { icon: '⚛', name: 'React', version: '19', category: 'Frontend' },
  { icon: '🔷', name: 'TypeScript', version: '5', category: 'Lenguaje' },
  { icon: '🐱', name: 'NestJS', version: '10', category: 'Backend' },
  { icon: '🐘', name: 'PostgreSQL', version: '16', category: 'Base de datos' },
  { icon: '◆', name: 'Prisma', version: '5', category: 'ORM' },
  { icon: '🔄', name: 'TanStack Query', version: '5', category: 'Estado' },
  { icon: '🎨', name: 'Tailwind CSS', version: '4', category: 'Estilos' },
];

const RESOURCES = [
  { label: 'Documentacion', href: '#', description: 'Guias y referencia de la plataforma' },
  { label: 'Changelog', href: '#', description: 'Historial de cambios y novedades' },
  { label: 'API Reference', href: '#', description: 'Endpoints REST y autenticacion' },
  { label: 'Soporte', href: '#', description: 'Reporta problemas o solicita ayuda' },
];

function formatUptime(seconds: number): string {
  if (seconds === 0) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return parts.join(' ') || '< 1m';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlatformPage() {
  const { data: platform, isLoading } = usePlatformInfo();

  const isApiHealthy = !!platform && platform.apiVersion !== '';

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6">
      <OrgSettingsSidebar />
      <div className="flex-1 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Informacion de la plataforma</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Version, tecnologias y estado del sistema.
          </p>
        </div>

        <div className="space-y-6">

          {/* ── Versión ────────────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="size-4" />
                Version y entorno
              </CardTitle>
              <CardDescription>
                Informacion sobre la version actual de la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (
                <div className="divide-y">
                  {[
                    { label: 'Version frontend', value: platform?.appVersion ?? '1.0.0' },
                    { label: 'Version API', value: platform?.apiVersion ?? '1.0.0' },
                    { label: 'Entorno', value: platform?.environment ?? process.env.NODE_ENV ?? 'development' },
                    { label: 'Base de datos', value: platform?.database ?? 'PostgreSQL' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <Badge variant="secondary" className="font-mono text-xs">{value}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Stack tecnológico ─────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="size-4" />
                Stack tecnologico
              </CardTitle>
              <CardDescription>
                Tecnologias y frameworks que componen la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TECH_STACK.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2.5"
                  >
                    <span className="text-lg leading-none" aria-hidden>{tech.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.category}</p>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                      v{tech.version}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Estado del sistema ────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="size-4" />
                Estado del sistema
              </CardTitle>
              <CardDescription>
                Salud actual de los servicios de la plataforma.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* API Health */}
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      {isApiHealthy ? (
                        <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="size-5 text-red-500 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium">API Backend</p>
                        <p className="text-xs text-muted-foreground">Servicio REST principal</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={isApiHealthy
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                    >
                      {isApiHealthy ? 'Operativo' : 'Sin conexion'}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border p-3 text-center">
                      <Clock className="size-5 text-muted-foreground mx-auto mb-1" />
                      <p className="text-lg font-bold">{formatUptime(platform?.uptime ?? 0)}</p>
                      <p className="text-xs text-muted-foreground">Tiempo activo</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <Users className="size-5 text-muted-foreground mx-auto mb-1" />
                      <p className="text-lg font-bold">{platform?.totalUsers ?? 0}</p>
                      <p className="text-xs text-muted-foreground">Usuarios</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <Building2 className="size-5 text-muted-foreground mx-auto mb-1" />
                      <p className="text-lg font-bold">{platform?.totalOrgs ?? 0}</p>
                      <p className="text-xs text-muted-foreground">Organizaciones</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Soporte y recursos ────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink className="size-4" />
                Soporte y recursos
              </CardTitle>
              <CardDescription>
                Accede a la documentacion y canales de soporte.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {RESOURCES.map((res) => (
                  <div key={res.label} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{res.label}</p>
                      <p className="text-xs text-muted-foreground">{res.description}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={res.href} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-3.5" />
                        Abrir
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
