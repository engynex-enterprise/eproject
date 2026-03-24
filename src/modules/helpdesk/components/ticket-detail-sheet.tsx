'use client';

import {
  Ticket,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  CircleDot,
  Circle,
  XCircle,
  Calendar,
  Hash,
  Tag,
  MessageSquare,
  Paperclip,
  ExternalLink,
} from 'lucide-react';
import type { Issue } from '@/shared/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TicketDetailSheetProps {
  ticket: Issue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityColors: Record<string, string> = {
  highest: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  lowest: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

const priorityLabels: Record<string, string> = {
  highest: 'Crítica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
  lowest: 'Muy baja',
};

const statusGroupColors: Record<string, string> = {
  todo: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const statusGroupIcons: Record<string, React.ReactNode> = {
  todo: <Circle className="size-3.5" />,
  in_progress: <CircleDot className="size-3.5" />,
  done: <CheckCircle2 className="size-3.5" />,
  cancelled: <XCircle className="size-3.5" />,
};

const statusGroupBorderColors: Record<string, string> = {
  todo: '#94a3b8',
  in_progress: '#3b82f6',
  done: '#22c55e',
  cancelled: '#ef4444',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
  return `Hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
}

function MetaRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex w-28 shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}

export function TicketDetailSheet({ ticket, open, onOpenChange }: TicketDetailSheetProps) {
  if (!ticket) return null;

  const statusGroupType = ticket.status?.statusGroup?.type ?? 'todo';
  const borderColor = statusGroupBorderColors[statusGroupType];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 gap-0">
        {/* Header con color del estado */}
        <div
          className="border-b px-6 py-5"
          style={{ borderLeft: `4px solid ${borderColor}` }}
        >
          <SheetHeader className="p-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className="font-mono text-xs text-white"
                style={{ backgroundColor: borderColor }}
              >
                {ticket.issueKey}
              </Badge>
              <Badge
                variant="secondary"
                className={cn('gap-1 text-xs', statusGroupColors[statusGroupType])}
              >
                {statusGroupIcons[statusGroupType]}
                {ticket.status?.name ?? 'Sin estado'}
              </Badge>
              {ticket.priority && (
                <Badge
                  variant="secondary"
                  className={cn('text-xs', priorityColors[ticket.priority.level])}
                >
                  {priorityLabels[ticket.priority.level]}
                </Badge>
              )}
            </div>
            <SheetTitle className="text-base font-semibold leading-snug pr-8">
              {ticket.title}
            </SheetTitle>
            <SheetDescription className="text-xs mt-1">
              Creado {formatRelativeDate(ticket.createdAt)} · Actualizado {formatRelativeDate(ticket.updatedAt)}
            </SheetDescription>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 h-[calc(100vh-200px)]">
          <div className="px-6 py-4 space-y-1">

            {/* Metadata */}
            <div className="rounded-lg border bg-muted/30 px-4 divide-y">
              <MetaRow icon={<User className="size-3.5" />} label="Asignado a">
                {ticket.assignee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarImage src={ticket.assignee.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-[9px] text-primary">
                        {ticket.assignee.firstName?.[0]}{ticket.assignee.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {ticket.assignee.firstName} {ticket.assignee.lastName}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Sin asignar</span>
                )}
              </MetaRow>

              <MetaRow icon={<AlertCircle className="size-3.5" />} label="Reportado por">
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={ticket.reporter?.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-[9px] text-primary">
                      {ticket.reporter?.firstName?.[0]}{ticket.reporter?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {ticket.reporter?.firstName} {ticket.reporter?.lastName}
                  </span>
                </div>
              </MetaRow>

              <MetaRow icon={<Calendar className="size-3.5" />} label="Creado">
                <span className="text-muted-foreground">{formatDate(ticket.createdAt)}</span>
              </MetaRow>

              <MetaRow icon={<Clock className="size-3.5" />} label="Actualizado">
                <span className="text-muted-foreground">{formatDate(ticket.updatedAt)}</span>
              </MetaRow>

              {ticket.dueDate && (
                <MetaRow icon={<Calendar className="size-3.5" />} label="Vencimiento">
                  <span className="font-medium">{formatDate(ticket.dueDate)}</span>
                </MetaRow>
              )}

              <MetaRow icon={<Hash className="size-3.5" />} label="ID interno">
                <span className="font-mono text-muted-foreground">#{ticket.id}</span>
              </MetaRow>

              {ticket.tags && ticket.tags.length > 0 && (
                <MetaRow icon={<Tag className="size-3.5" />} label="Etiquetas">
                  <div className="flex flex-wrap gap-1">
                    {ticket.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="text-[10px]"
                        style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </MetaRow>
              )}
            </div>

            <Separator />

            {/* Descripción */}
            <div className="py-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Descripción
              </h4>
              {ticket.description ? (
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Sin descripción.
                </p>
              )}
            </div>

            <Separator />

            {/* Actividad (placeholder) */}
            <div className="py-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Actividad
              </h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MessageSquare className="size-3.5 mt-0.5 shrink-0" />
                  <span>No hay comentarios aún.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Paperclip className="size-3.5 mt-0.5 shrink-0" />
                  <span>No hay archivos adjuntos.</span>
                </div>
              </div>
            </div>

          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="border-t px-6 py-3 flex items-center justify-between">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <ExternalLink className="size-3.5" />
            Ver ticket completo
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            <MessageSquare className="size-3.5" />
            Comentar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
