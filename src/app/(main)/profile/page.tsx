'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Upload,
  Save,
  Loader2,
  Lock,
  Bell,
  Eye,
  EyeOff,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse, NotificationPreference } from '@/shared/types';
import type { User as UserType } from '@/shared/types';

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone?: string | null;
  timezone: string;
  language: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<UserType>>('/users/me');
      return res.data;
    },
  });
}

function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await apiClient.patch<ApiResponse<UserType>>(
        '/users/me',
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      await apiClient.post('/users/me/change-password', data);
    },
  });
}

function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<NotificationPreference>>(
        '/users/me/notification-preferences',
      );
      return res.data;
    },
  });
}

function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<NotificationPreference>) => {
      const res = await apiClient.patch<ApiResponse<NotificationPreference>>(
        '/users/me/notification-preferences',
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notification-preferences'],
      });
    },
  });
}

const timezones = [
  { label: '(UTC-06:00) Ciudad de Mexico', value: 'America/Mexico_City' },
  { label: '(UTC-05:00) Bogota, Lima', value: 'America/Bogota' },
  { label: '(UTC-04:00) Santiago', value: 'America/Santiago' },
  { label: '(UTC-03:00) Buenos Aires', value: 'America/Argentina/Buenos_Aires' },
  { label: '(UTC+00:00) Londres', value: 'Europe/London' },
  { label: '(UTC+01:00) Madrid, Paris', value: 'Europe/Madrid' },
  { label: '(UTC+02:00) Berlin', value: 'Europe/Berlin' },
];

const notificationEvents = [
  { key: 'issueAssigned', label: 'Incidencia asignada' },
  { key: 'issueUpdated', label: 'Incidencia actualizada' },
  { key: 'issueCommented', label: 'Comentario en incidencia' },
  { key: 'sprintStarted', label: 'Sprint iniciado' },
  { key: 'sprintCompleted', label: 'Sprint completado' },
  { key: 'mentionedInComment', label: 'Mencion en comentario' },
] as const;

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const { data: notifPrefs } = useNotificationPreferences();
  const updateNotifPrefs = useUpdateNotificationPreferences();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [timezone, setTimezone] = useState('America/Mexico_City');
  const [locale, setLocale] = useState('es');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
      setTimezone(profile.timezone || 'America/Mexico_City');
      setLocale(profile.language || 'es');
    }
  }, [profile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      firstName,
      lastName,
      phone: phone || null,
      timezone,
      language: locale,
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contrasenas no coinciden.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('La contrasena debe tener al menos 8 caracteres.');
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (error) => {
          setPasswordError(
            error instanceof Error
              ? error.message
              : 'Error al cambiar la contrasena.',
          );
        },
      },
    );
  };

  const handleToggleNotifPref = (
    key: keyof NotificationPreference,
    value: boolean,
  ) => {
    updateNotifPrefs.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <User className="size-6" />
          Mi perfil
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Administra tu informacion personal y preferencias.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Avatar & Name */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informacion personal</CardTitle>
            <CardDescription>
              Tu perfil publico dentro de la organizacion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <Avatar className="size-20">
                <AvatarFallback className="text-lg">
                  {profile
                    ? getInitials(profile.firstName, profile.lastName)
                    : '??'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="size-4" />
                  Cambiar avatar
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG o GIF. Max 1MB.
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first-name">Nombre</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Apellido</Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Tu apellido"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  value={profile?.email ?? ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El correo no se puede cambiar.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 55 1234 5678"
                  type="tel"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona horaria</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="locale">Idioma</Label>
                <Select value={locale} onValueChange={setLocale}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Espanol</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <div className="flex items-center gap-2">
                <Bell className="size-4" />
                Preferencias de notificacion
              </div>
            </CardTitle>
            <CardDescription>
              Configura como quieres recibir las notificaciones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead className="text-center w-24">Correo</TableHead>
                  <TableHead className="text-center w-24">Push</TableHead>
                  <TableHead className="text-center w-24">App</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationEvents.map((event) => (
                  <TableRow key={event.key}>
                    <TableCell className="text-sm">{event.label}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={
                            notifPrefs?.emailEnabled &&
                            (notifPrefs?.[
                              event.key as keyof NotificationPreference
                            ] as boolean)
                          }
                          onCheckedChange={(checked) =>
                            handleToggleNotifPref(
                              event.key as keyof NotificationPreference,
                              checked,
                            )
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={
                            notifPrefs?.pushEnabled &&
                            (notifPrefs?.[
                              event.key as keyof NotificationPreference
                            ] as boolean)
                          }
                          onCheckedChange={(checked) =>
                            handleToggleNotifPref(
                              event.key as keyof NotificationPreference,
                              checked,
                            )
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={
                            notifPrefs?.inAppEnabled &&
                            (notifPrefs?.[
                              event.key as keyof NotificationPreference
                            ] as boolean)
                          }
                          onCheckedChange={(checked) =>
                            handleToggleNotifPref(
                              event.key as keyof NotificationPreference,
                              checked,
                            )
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Guardar perfil
          </Button>
        </div>
      </form>

      {/* Change Password */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">
            <div className="flex items-center gap-2">
              <Lock className="size-4" />
              Cambiar contrasena
            </div>
          </CardTitle>
          <CardDescription>
            Actualiza tu contrasena de acceso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Contrasena actual</Label>
              <div className="relative max-w-md">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Tu contrasena actual"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() =>
                    setShowCurrentPassword(!showCurrentPassword)
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contrasena</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva contrasena"
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">
                  Confirmar contrasena
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir contrasena"
                  required
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}

            <Button
              type="submit"
              variant="outline"
              disabled={changePassword.isPending}
            >
              {changePassword.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Lock className="size-4" />
              )}
              Cambiar contrasena
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
