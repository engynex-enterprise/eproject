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
  Palette,
  Shield,
  Globe,
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
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/shared/stores/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import type { ApiResponse, NotificationPreference } from '@/shared/types';
import type { User as UserType } from '@/shared/types';

// ── Hooks ──────────────────────────────────────────────────────────

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
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiClient.patch<ApiResponse<UserType>>('/users/me', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
      await apiClient.post('/users/me/change-password', data);
    },
  });
}

// ── Constants ──────────────────────────────────────────────────────

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'appearance', label: 'Apariencia', icon: Palette },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'security', label: 'Seguridad', icon: Shield },
  { id: 'language', label: 'Idioma y region', icon: Globe },
] as const;

type TabId = (typeof tabs)[number]['id'];

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

const accentColors = [
  { name: 'Azul', value: '#0052CC', class: 'bg-[#0052CC]' },
  { name: 'Verde', value: '#36B37E', class: 'bg-[#36B37E]' },
  { name: 'Morado', value: '#6554C0', class: 'bg-[#6554C0]' },
  { name: 'Naranja', value: '#FF5630', class: 'bg-[#FF5630]' },
  { name: 'Amarillo', value: '#FF991F', class: 'bg-[#FF991F]' },
  { name: 'Rojo', value: '#DE350B', class: 'bg-[#DE350B]' },
];

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

// ── Tab Components ─────────────────────────────────────────────────

function ProfileTab() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName);
      setLastName(profile.lastName);
    }
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ firstName, lastName, phone: phone || null });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informacion personal</CardTitle>
          <CardDescription>Tu perfil publico dentro de la organizacion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              <AvatarFallback className="text-lg">
                {profile ? getInitials(profile.firstName, profile.lastName) : '??'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm">
                <Upload className="size-4" />
                Cambiar avatar
              </Button>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG o GIF. Max 1MB.</p>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first-name">Nombre</Label>
              <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Apellido</Label>
              <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electronico</Label>
              <Input id="email" value={profile?.email ?? ''} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">El correo no se puede cambiar.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 55 1234 5678" type="tel" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Guardar perfil
        </Button>
      </div>
    </form>
  );
}

function AppearanceTab() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [accent, setAccent] = useState('#0052CC');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tema</CardTitle>
          <CardDescription>Selecciona tu modo de apariencia preferido.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
                  theme === mode ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/25',
                )}
              >
                <div className={cn(
                  'size-12 rounded-lg border',
                  mode === 'light' && 'bg-white border-gray-200',
                  mode === 'dark' && 'bg-zinc-900 border-zinc-700',
                  mode === 'system' && 'bg-gradient-to-br from-white to-zinc-900 border-gray-300',
                )} />
                <span className="text-sm font-medium capitalize">
                  {mode === 'light' ? 'Claro' : mode === 'dark' ? 'Oscuro' : 'Sistema'}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Color de enfasis</CardTitle>
          <CardDescription>Elige el color principal de la interfaz.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccent(color.value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-colors',
                  accent === color.value ? 'border-primary' : 'border-transparent hover:border-muted',
                )}
              >
                <div className={cn('size-8 rounded-full', color.class)} />
                <span className="text-xs">{color.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preferencias de notificacion</CardTitle>
        <CardDescription>Configura como quieres recibir las notificaciones.</CardDescription>
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
                  <div className="flex justify-center"><Switch defaultChecked /></div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center"><Switch defaultChecked /></div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center"><Switch defaultChecked /></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SecurityTab() {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

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
          setPasswordError(error instanceof Error ? error.message : 'Error al cambiar la contrasena.');
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          <div className="flex items-center gap-2">
            <Lock className="size-4" />
            Cambiar contrasena
          </div>
        </CardTitle>
        <CardDescription>Actualiza tu contrasena de acceso.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2 max-w-md">
            <Label htmlFor="current-password">Contrasena actual</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Tu contrasena actual"
                required
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nueva contrasena</Label>
              <div className="relative">
                <Input id="new-password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nueva contrasena" required minLength={8} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar contrasena</Label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repetir contrasena" required />
            </div>
          </div>
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          <Button type="submit" variant="outline" disabled={changePassword.isPending}>
            {changePassword.isPending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
            Cambiar contrasena
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function LanguageTab() {
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [timezone, setTimezone] = useState('America/Mexico_City');
  const [locale, setLocale] = useState('es');

  useEffect(() => {
    if (profile) {
      setTimezone(profile.timezone || 'America/Mexico_City');
      setLocale(profile.language || 'es');
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate({ timezone, locale });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Idioma y zona horaria</CardTitle>
        <CardDescription>Configura tu idioma preferido y zona horaria.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Espanol</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Zona horaria</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Guardar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Configuracion</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Administra tu cuenta, apariencia y preferencias.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar navigation */}
        <nav className="md:w-56 shrink-0">
          <ul className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4" />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'appearance' && <AppearanceTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'language' && <LanguageTab />}
        </div>
      </div>
    </div>
  );
}
