'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  List,
  Calendar,
  Table2,
  IterationCcw,
  Tags,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpace } from '@/modules/spaces/hooks/use-spaces';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface NavTab {
  label: string;
  href: string;
  icon: React.ElementType;
  isSettings?: boolean;
}

export default function SpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ projectKey: string; spaceId: string }>();
  const pathname = usePathname();
  const router = useRouter();

  const { data: space, isLoading } = useSpace(Number(params.spaceId));

  const basePath = `/projects/${params.projectKey}/spaces/${params.spaceId}`;
  const settingsPath = `/projects/${params.projectKey}/settings`;

  const tabs: NavTab[] = [
    { label: 'Tablero', href: `${basePath}/board`, icon: LayoutGrid },
    { label: 'Backlog', href: `${basePath}/backlog`, icon: List },
    { label: 'Cronograma', href: `${basePath}/timeline`, icon: Calendar },
    { label: 'Tabla', href: `${basePath}/table`, icon: Table2 },
    { label: 'Sprints', href: `${basePath}/sprints`, icon: IterationCcw },
    { label: 'Versiones', href: `${basePath}/versions`, icon: Tags },
    { label: 'Reportes', href: `${basePath}/reports`, icon: BarChart3 },
    {
      label: 'Configuracion',
      href: settingsPath,
      icon: Settings,
      isSettings: true,
    },
  ];

  const isActive = (href: string) => {
    if (href.endsWith('/settings')) return pathname.startsWith(href);
    return pathname === href;
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Space Header */}
      <div className="border-b bg-background">
        <div className="flex items-center gap-3 px-6 pt-4 pb-0">
          {isLoading ? (
            <Skeleton className="h-6 w-40" />
          ) : (
            <>
              {space?.color && (
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: space.color }}
                />
              )}
              <h1 className="text-lg font-semibold">{space?.name}</h1>
              <Badge variant="secondary" className="text-xs">
                {params.projectKey}
              </Badge>
            </>
          )}
        </div>

        {/* Tab Navigation */}
        <ScrollArea className="w-full">
          <nav className="flex items-center gap-0 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = isActive(tab.href);

              return (
                <Button
                  key={tab.href}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'relative rounded-none border-b-2 border-transparent px-3 py-2 h-10 text-muted-foreground hover:text-foreground hover:bg-transparent',
                    active && 'border-primary text-foreground font-medium',
                    tab.isSettings && 'ml-auto',
                  )}
                  onClick={() => router.push(tab.href)}
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Button>
              );
            })}
          </nav>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
