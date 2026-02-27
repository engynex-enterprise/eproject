'use client';

import { useState, useCallback } from 'react';
import { sileo } from 'sileo';
import {
  Bell,
  Check,
  CheckCheck,
  MessageSquare,
  AlertCircle,
  Users,
  GitBranch,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
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

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const { data: notificationsResponse } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => getNotifications({ limit: 10 }),
    enabled: open,
  });

  const notifications = notificationsResponse?.data ?? [];

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
    },
  });

  const handleMarkAsRead = useCallback(
    (id: number) => {
      markAsReadMutation.mutate(id);
    },
    [markAsReadMutation],
  );

  const handleMarkAllAsRead = useCallback(() => {
    sileo.promise(markAllAsReadMutation.mutateAsync(), {
      loading: { title: 'Marcando como leidas...' },
      success: {
        title: 'Notificaciones leidas',
        description: (
          <span className="text-xs!">
            Todas las notificaciones han sido marcadas como leidas.
          </span>
        ),
      },
      error: {
        title: 'Error',
        description: (
          <span className="text-xs!">
            No se pudieron marcar las notificaciones.
          </span>
        ),
      },
    });
  }, [markAllAsReadMutation]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="size-3" />
              Marcar todo como leido
            </Button>
          )}
        </div>

        {/* Notification List */}
        <ScrollArea className="max-h-96">
          {notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 border-b last:border-b-0 transition-colors hover:bg-muted/50 cursor-pointer',
                      !notification.isRead && 'bg-primary/5',
                    )}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full mt-0.5',
                        notification.isRead
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/10 text-primary',
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm leading-tight',
                          !notification.isRead && 'font-medium',
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {timeAgo(notification.createdAt)}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <div className="size-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="size-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No tienes notificaciones
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
                asChild
              >
                <a href="/notifications">
                  Ver todas
                  <ExternalLink className="size-3" />
                </a>
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
