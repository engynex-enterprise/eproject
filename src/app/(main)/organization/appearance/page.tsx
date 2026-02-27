'use client';

import { useState, useEffect } from 'react';
import {
  Upload,
  Save,
  Loader2,
  Sun,
  Moon,
  Paintbrush,
  Type,
  Image,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/shared/stores/auth.store';
import {
  useAppearance,
  useUpdateAppearance,
} from '@/modules/organization/hooks/use-organization';
import { OrgSettingsSidebar } from '@/app/(main)/organization/page';
import { cn } from '@/lib/utils';

const accentColors = [
  { name: 'Azul', value: '#3b82f6', class: 'bg-blue-500' },
  { name: 'Verde', value: '#22c55e', class: 'bg-green-500' },
  { name: 'Amarillo', value: '#eab308', class: 'bg-yellow-500' },
  { name: 'Naranja', value: '#f97316', class: 'bg-orange-500' },
  { name: 'Morado', value: '#a855f7', class: 'bg-purple-500' },
  { name: 'Rojo', value: '#ef4444', class: 'bg-red-500' },
];

const fontFamilies = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Geist Sans', value: 'Geist Sans' },
  { label: 'System UI', value: 'system-ui' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Nunito', value: 'Nunito' },
];

export default function AppearancePage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const { data: appearance, isLoading, isError } = useAppearance(orgId);
  const updateAppearance = useUpdateAppearance(orgId);

  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [customColor, setCustomColor] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [darkMode, setDarkMode] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);

  useEffect(() => {
    if (appearance) {
      setAccentColor(appearance.accentColor);
      setFontFamily(appearance.fontFamily);
      setDarkMode(appearance.darkMode);
      const isPreset = accentColors.some(
        (c) => c.value === appearance.accentColor,
      );
      if (!isPreset) {
        setIsCustomColor(true);
        setCustomColor(appearance.accentColor);
      }
    }
  }, [appearance]);

  const handleSelectColor = (color: string) => {
    setAccentColor(color);
    setIsCustomColor(false);
  };

  const handleCustomColor = (value: string) => {
    setCustomColor(value);
    setAccentColor(value);
    setIsCustomColor(true);
  };

  const handleSave = () => {
    updateAppearance.mutate({
      accentColor,
      fontFamily,
      darkMode,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 p-6">
        <OrgSettingsSidebar />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-64 w-full" />
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
                Error al cargar la configuracion de apariencia.
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
      <div className="flex-1 max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Apariencia</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Personaliza la apariencia de tu organizacion.
          </p>
        </div>

        <div className="space-y-6">
          {/* Logo & Favicon */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <div className="flex items-center gap-2">
                  <Image className="size-4" />
                  Imagenes de marca
                </div>
              </CardTitle>
              <CardDescription>
                Sube el logo y favicon de tu organizacion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="flex size-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                    {appearance?.logoUrl ? (
                      <img
                        src={appearance.logoUrl}
                        alt="Logo"
                        className="size-20 rounded-lg object-cover"
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
                      PNG, JPG o SVG. Recomendado 256x256px. Max 2MB.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Favicon */}
              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                    {appearance?.faviconUrl ? (
                      <img
                        src={appearance.faviconUrl}
                        alt="Favicon"
                        className="size-12 rounded-md object-cover"
                      />
                    ) : (
                      <Upload className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="size-4" />
                      Subir favicon
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      ICO, PNG o SVG. Recomendado 32x32px.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accent Color */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <div className="flex items-center gap-2">
                  <Paintbrush className="size-4" />
                  Color de enfasis
                </div>
              </CardTitle>
              <CardDescription>
                Selecciona el color principal de la interfaz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleSelectColor(color.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all',
                      accentColor === color.value && !isCustomColor
                        ? 'border-foreground shadow-sm'
                        : 'border-transparent hover:border-muted-foreground/25',
                    )}
                    title={color.name}
                  >
                    <div
                      className={cn('size-8 rounded-full', color.class)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {color.name}
                    </span>
                  </button>
                ))}

                {/* Custom color */}
                <button
                  onClick={() => setIsCustomColor(true)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all',
                    isCustomColor
                      ? 'border-foreground shadow-sm'
                      : 'border-transparent hover:border-muted-foreground/25',
                  )}
                >
                  <div
                    className="size-8 rounded-full border-2 border-dashed border-muted-foreground/50"
                    style={
                      isCustomColor && customColor
                        ? { backgroundColor: customColor, borderStyle: 'solid' }
                        : undefined
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    Custom
                  </span>
                </button>
              </div>

              {isCustomColor && (
                <div className="flex items-center gap-3 pt-2">
                  <Label htmlFor="custom-color" className="shrink-0">
                    Color personalizado
                  </Label>
                  <Input
                    id="custom-color"
                    type="color"
                    value={customColor || '#3b82f6'}
                    onChange={(e) => handleCustomColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={customColor}
                    onChange={(e) => handleCustomColor(e.target.value)}
                    placeholder="#3b82f6"
                    className="w-32"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Font Family */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <div className="flex items-center gap-2">
                  <Type className="size-4" />
                  Tipografia
                </div>
              </CardTitle>
              <CardDescription>
                Selecciona la familia tipografica de la interfaz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>
                        {font.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Dark Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <div className="flex items-center gap-2">
                  {darkMode ? (
                    <Moon className="size-4" />
                  ) : (
                    <Sun className="size-4" />
                  )}
                  Modo oscuro
                </div>
              </CardTitle>
              <CardDescription>
                Activa el modo oscuro como predeterminado para la organizacion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <Label>
                  {darkMode ? 'Modo oscuro activado' : 'Modo claro activado'}
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vista previa</CardTitle>
              <CardDescription>
                Asi se vera la interfaz con la configuracion actual.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  'rounded-lg border overflow-hidden',
                  darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900',
                )}
                style={{ fontFamily }}
              >
                {/* Mock sidebar */}
                <div className="flex">
                  <div
                    className={cn(
                      'w-48 p-4 space-y-2 border-r',
                      darkMode
                        ? 'bg-zinc-800/50 border-zinc-700'
                        : 'bg-zinc-50 border-zinc-200',
                    )}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="size-6 rounded"
                        style={{ backgroundColor: accentColor }}
                      />
                      <span className="text-xs font-semibold">
                        Mi Proyecto
                      </span>
                    </div>
                    {['Tablero', 'Backlog', 'Sprints'].map((item) => (
                      <div
                        key={item}
                        className={cn(
                          'text-xs px-2 py-1.5 rounded',
                          item === 'Tablero'
                            ? 'font-medium'
                            : darkMode
                              ? 'text-zinc-400'
                              : 'text-zinc-500',
                        )}
                        style={
                          item === 'Tablero'
                            ? {
                                backgroundColor: `${accentColor}20`,
                                color: accentColor,
                              }
                            : undefined
                        }
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  {/* Mock content */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="text-sm font-semibold">Tablero</div>
                    <div className="flex gap-2">
                      <button
                        className="text-xs px-3 py-1.5 rounded-md text-white font-medium"
                        style={{ backgroundColor: accentColor }}
                      >
                        Boton primario
                      </button>
                      <button
                        className={cn(
                          'text-xs px-3 py-1.5 rounded-md border font-medium',
                          darkMode
                            ? 'border-zinc-600 text-zinc-300'
                            : 'border-zinc-300 text-zinc-700',
                        )}
                      >
                        Boton secundario
                      </button>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {['Por hacer', 'En progreso', 'Hecho'].map(
                        (col) => (
                          <div
                            key={col}
                            className={cn(
                              'flex-1 rounded-md border p-2',
                              darkMode
                                ? 'border-zinc-700 bg-zinc-800'
                                : 'border-zinc-200 bg-zinc-50',
                            )}
                          >
                            <div className="text-xs font-medium mb-2">
                              {col}
                            </div>
                            <div
                              className={cn(
                                'rounded border p-2',
                                darkMode
                                  ? 'border-zinc-600 bg-zinc-700'
                                  : 'border-zinc-200 bg-white',
                              )}
                            >
                              <div className="text-xs">Tarea ejemplo</div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateAppearance.isPending}
            >
              {updateAppearance.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Guardar cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
