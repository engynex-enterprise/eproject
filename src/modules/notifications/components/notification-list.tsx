'use client';

import { useState } from 'react';
import { sileo } from 'sileo';
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  AlertCircle,
  Users,
  GitBranch,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type GetNotificationsParams,
} from '@/modules/notifications/services/notifications.service';
import type { Notification } from '@/shared/types';
import { cn } from '@/lib/utils';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'issue_assigned':
    case 'issue_updated':
      return AlertCircle;
    case 'issue_commented':
    case 'mentioned_in_comment':
      return MessageSquare;
    case 'sprint_started':
    case 'sprint_completed':
      return GitBranch;
    case 'member_invited':
    case 'member_joined':
      return Users;
    default:
      return Bell;
  }
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const notificationTypeLabels: Record<string, string> = {
  issue_assigned: 'Incidencia asignada',
  issue_updated: 'Incidencia actualizada',
  issue_commented: 'Comentario',
  mentioned_in_comment: 'Mencion',
  sprint_started: 'Sprint iniciado',
  sprint_completed: 'Sprint completado',
  member_invited: 'Miembro invitado',
  member_joined: 'Miembro unido',
};

type FilterType = 'all' | 'unread' | string;

export function NotificationList() {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const queryClient = useQueryClient();

  const params: GetNotificationsParams = {
    page,
    limit: 20,
  };
  if (filterType === 'unread') {
    params.isRead = false;
  } else if (filterType !== 'all') {
    params.type = filterType;
  }

  const { data: response, isLoading } = useQuery({
    queryKey: ['notifications', 'list', page, filterType],
    queryFn: () => getNotifications(params),
  });

  const notifications = response?.data ?? [];
  const meta = response?.meta;

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      sileo.info({ title: 'Notificaciones marcadas como leídas' });
    },
  });

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select
            value={filterType}
            onValueChange={(val) => {
              setFilterType(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              <Filter className="size-4" />
              <SelectValue placeholder="Filtrar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">No leidas</SelectItem>
              <SelectItem value="issue_assigned">
                Incidencia asignada
              </SelectItem>
              <SelectItem value="issue_updated">
                Incidencia actualizada
              </SelectItem>
              <SelectItem value="issue_commented">Comentarios</SelectItem>
              <SelectItem value="mentioned_in_comment">Menciones</SelectItem>
              <SelectItem value="sprint_started">Sprint iniciado</SelectItem>
              <SelectItem value="sprint_completed">
                Sprint completado
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => markAllAsReadMutation.mutate()}
          disabled={markAllAsReadMutation.isPending}
        >
          <CheckCheck className="size-4" />
          Marcar todo como leido
        </Button>
      </div>

      {/* Notification Items */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 py-2">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-4 border-b last:border-b-0 transition-colors',
                      !notification.isRead && 'bg-primary/5',
                    )}
                  >
                    <div
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-full mt-0.5',
                        notification.isRead
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/10 text-primary',
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            'text-sm',
                            !notification.isRead && 'font-semibold',
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="size-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {notificationTypeLabels[notification.type] ??
                            notification.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() =>
                          markAsReadMutation.mutate(notification.id)
                        }
                        disabled={markAsReadMutation.isPending}
                        title="Marcar como leida"
                      >
                        <Check className="size-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="size-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground">
                No hay notificaciones
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {filterType === 'unread'
                  ? 'Todas las notificaciones estan leidas.'
                  : 'Aun no tienes notificaciones.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Pagina {meta.page} de {meta.totalPages} ({meta.total}{' '}
            notificaciones)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
