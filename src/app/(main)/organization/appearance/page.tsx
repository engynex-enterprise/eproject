'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Save,
  Loader2,
  Sun,
  Moon,
  Paintbrush,
  Type,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCENT_PRESETS = [
  { name: 'Azul',    value: '#3b82f6', tw: 'bg-blue-500'   },
  { name: 'Indigo',  value: '#6366f1', tw: 'bg-indigo-500' },
  { name: 'Verde',   value: '#22c55e', tw: 'bg-green-500'  },
  { name: 'Amarillo',value: '#eab308', tw: 'bg-yellow-500' },
  { name: 'Naranja', value: '#f97316', tw: 'bg-orange-500' },
  { name: 'Morado',  value: '#a855f7', tw: 'bg-purple-500' },
  { name: 'Rosa',    value: '#ec4899', tw: 'bg-pink-500'   },
  { name: 'Rojo',    value: '#ef4444', tw: 'bg-red-500'    },
];

const FONT_FAMILIES = [
  { label: 'Inter',       value: 'Inter'      },
  { label: 'Geist Sans',  value: 'Geist Sans' },
  { label: 'System UI',   value: 'system-ui'  },
  { label: 'Roboto',      value: 'Roboto'     },
  { label: 'Open Sans',   value: 'Open Sans'  },
  { label: 'Nunito',      value: 'Nunito'     },
];

type DarkMode = 'light' | 'dark';

// ─── Logo upload helper ───────────────────────────────────────────────────────

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── LogoUploadZone ───────────────────────────────────────────────────────────

function LogoUploadZone({
  label,
  hint,
  value,
  onChange,
  dark = false,
}: {
  label: string;
  hint: string;
  value: string | null;
  onChange: (url: string | null) => void;
  dark?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const dataUrl = await readFileAsDataUrl(file);
    onChange(dataUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div
          className={cn(
            'flex size-20 shrink-0 items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer',
            dark
              ? 'bg-zinc-900 border-zinc-600 hover:bg-zinc-800'
              : 'bg-white border-muted-foreground/25 hover:bg-zinc-50',
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {value ? (
            <img
              src={value}
              alt={label}
              className="size-16 rounded-lg object-contain"
            />
          ) : (
            <Upload className={cn('size-5', dark ? 'text-zinc-500' : 'text-muted-foreground')} />
          )}
        </div>
        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-3.5" />
            {value ? 'Cambiar imagen' : 'Subir imagen'}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onChange(null)}
            >
              <Trash2 className="size-3.5" />
              Eliminar
            </Button>
          )}
          <p className="text-[11px] text-muted-foreground leading-tight">
            PNG, JPG, SVG o WebP. Max 2 MB.
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppearancePage() {
  const { currentOrgId } = useAuthStore();
  const orgId = currentOrgId ?? 0;

  const { data: appearance, isLoading, isError } = useAppearance(orgId);
  const updateAppearance = useUpdateAppearance(orgId);

  // ── Local form state ───────────────────────────────────────────────────────
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [isCustomColor, setIsCustomColor]   = useState(false);
  const [customColor, setCustomColor]       = useState('');
  const [fontFamily, setFontFamily]         = useState('Inter');
  const [darkMode, setDarkMode]             = useState<DarkMode>('light');
  const [logoUrl, setLogoUrl]               = useState<string | null>(null);
  const [logoDarkUrl, setLogoDarkUrl]       = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl]         = useState<string | null>(null);

  // ── Sync from fetched data ─────────────────────────────────────────────────
  useEffect(() => {
    if (!appearance) return;
    const color = appearance.accentColor ?? appearance.primaryColor ?? '#3b82f6';
    setAccentColor(color);
    setFontFamily(appearance.fontFamily ?? 'Inter');
    setDarkMode(appearance.darkMode ? 'dark' : 'light');
    setLogoUrl(appearance.logoUrl ?? null);
    setLogoDarkUrl(appearance.logoDarkUrl ?? null);
    setFaviconUrl(appearance.faviconUrl ?? null);
    const isPreset = ACCENT_PRESETS.some((p) => p.value === color);
    if (!isPreset) { setIsCustomColor(true); setCustomColor(color); }
  }, [appearance]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectPreset = (color: string) => {
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
      darkMode: darkMode === 'dark',
      logoUrl,
      logoDarkUrl,
      faviconUrl,
    });
  };

  // ── Loading / error ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <Skeleton className="h-9 w-56" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          Error al cargar la configuracion de apariencia.
        </div>
      </div>
    );
  }

  const activePreset = ACCENT_PRESETS.find((p) => p.value === accentColor);

  return (
    <div className="flex flex-1 flex-col gap-6 pb-20">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Apariencia</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personaliza la apariencia de la organizacion. Los cambios se aplican
            en tiempo real para todos los miembros.
          </p>
        </div>
        {appearance && (
          <Badge variant="secondary" className="text-xs gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            {activePreset?.name ?? 'Personalizado'}
          </Badge>
        )}
      </div>

      {/* ── Brand images ────────────────────────────────────────────── */}
      <Card className="shadow-sm bg-white dark:bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="size-4" />
            Imagenes de marca
          </CardTitle>
          <CardDescription>
            El logo correcto se muestra segun el tema activo (claro u oscuro).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 mb-1">
            <Sun className="size-3.5 text-amber-500" />
            <span className="text-sm font-medium">Logo — Modo claro</span>
          </div>
          <LogoUploadZone
            label=""
            hint="Usa colores oscuros para que se vea bien sobre fondo blanco. Recomendado 256×64px."
            value={logoUrl}
            onChange={setLogoUrl}
            dark={false}
          />

          <Separator />

          <div className="flex items-center gap-2 mb-1">
            <Moon className="size-3.5 text-indigo-400" />
            <span className="text-sm font-medium">Logo — Modo oscuro</span>
          </div>
          <LogoUploadZone
            label=""
            hint="Usa colores claros o blancos para que se vea bien sobre fondo oscuro. Recomendado 256×64px."
            value={logoDarkUrl}
            onChange={setLogoDarkUrl}
            dark={true}
          />

          <Separator />

          <div>
            <p className="text-sm font-medium mb-1">Favicon</p>
            <LogoUploadZone
              label=""
              hint="ICO, PNG o SVG. Recomendado 32×32px."
              value={faviconUrl}
              onChange={setFaviconUrl}
              dark={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Dark / light mode ───────────────────────────────────────── */}
      <Card className="shadow-sm bg-white dark:bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {darkMode === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />}
            Tema de la interfaz
          </CardTitle>
          <CardDescription>
            Tema predeterminado para todos los miembros de la organizacion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {([
              { id: 'light' as const, label: 'Claro',  Icon: Sun,  bg: 'bg-white border-gray-200'   },
              { id: 'dark'  as const, label: 'Oscuro', Icon: Moon, bg: 'bg-zinc-900 border-zinc-700' },
            ] as const).map(({ id, label, Icon, bg }) => (
              <button
                key={id}
                onClick={() => setDarkMode(id)}
                className={cn(
                  'relative flex flex-col gap-3 rounded-xl border-2 p-4 text-left transition-all',
                  darkMode === id
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30',
                )}
              >
                {darkMode === id && (
                  <CheckCircle2 className="absolute right-2.5 top-2.5 size-4 text-primary" />
                )}
                <div className={cn('h-14 rounded-lg border-2', bg)} />
                <div className="flex items-center gap-1.5">
                  <Icon className={cn('size-3.5', darkMode === id ? 'text-primary' : 'text-muted-foreground')} />
                  <span className={cn('text-sm font-medium', darkMode === id ? 'text-primary' : 'text-foreground')}>
                    {label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Accent color ────────────────────────────────────────────── */}
      <Card className="shadow-sm bg-white dark:bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Paintbrush className="size-4" />
            Color de enfasis
          </CardTitle>
          <CardDescription>
            Color principal de botones, enlaces y elementos interactivos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map((color) => (
              <button
                key={color.value}
                onClick={() => handleSelectPreset(color.value)}
                title={color.name}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-2.5 transition-all',
                  accentColor === color.value && !isCustomColor
                    ? 'border-foreground shadow-sm scale-105'
                    : 'border-transparent hover:border-muted-foreground/25',
                )}
              >
                <div className={cn('size-7 rounded-full', color.tw)} />
                <span className="text-[11px] text-muted-foreground">{color.name}</span>
              </button>
            ))}
            {/* Custom color swatch */}
            <button
              onClick={() => setIsCustomColor(true)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-2.5 transition-all',
                isCustomColor
                  ? 'border-foreground shadow-sm scale-105'
                  : 'border-transparent hover:border-muted-foreground/25',
              )}
            >
              <div
                className="size-7 rounded-full border-2 border-dashed border-muted-foreground/40"
                style={isCustomColor && customColor ? { backgroundColor: customColor, borderStyle: 'solid' } : undefined}
              />
              <span className="text-[11px] text-muted-foreground">Custom</span>
            </button>
          </div>

          {isCustomColor && (
            <div className="flex items-center gap-3 pt-1">
              <Input
                type="color"
                value={customColor || '#3b82f6'}
                onChange={(e) => handleCustomColor(e.target.value)}
                className="w-12 h-9 p-1 cursor-pointer"
              />
              <Input
                value={customColor}
                onChange={(e) => handleCustomColor(e.target.value)}
                placeholder="#3b82f6"
                className="w-36 font-mono text-sm"
              />
              <Label className="text-sm text-muted-foreground">Color hex personalizado</Label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Font family ─────────────────────────────────────────────── */}
      <Card className="shadow-sm bg-white dark:bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="size-4" />
            Tipografia
          </CardTitle>
          <CardDescription>
            Familia tipografica de la interfaz para todos los miembros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground" style={{ fontFamily }}>
              El texto se vera asi.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Preview ─────────────────────────────────────────────────── */}
      <Card className="shadow-sm bg-white dark:bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="size-4" />
            Vista previa
          </CardTitle>
          <CardDescription>
            Asi se vera la interfaz con la configuracion actual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'rounded-xl border overflow-hidden',
              darkMode === 'dark' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900',
            )}
            style={{ fontFamily }}
          >
            <div className="flex">
              {/* Mock sidebar */}
              <div
                className={cn(
                  'w-44 p-4 space-y-1.5 border-r shrink-0',
                  darkMode === 'dark' ? 'bg-zinc-800/60 border-zinc-700' : 'bg-zinc-50 border-zinc-200',
                )}
              >
                <div className="flex items-center gap-2 mb-4">
                  {(darkMode === 'dark' ? logoDarkUrl : logoUrl) ? (
                    <img
                      src={(darkMode === 'dark' ? logoDarkUrl : logoUrl)!}
                      alt="Logo"
                      className="h-6 object-contain"
                    />
                  ) : (
                    <>
                      <div className="size-5 rounded" style={{ backgroundColor: accentColor }} />
                      <span className="text-xs font-semibold">Mi Org</span>
                    </>
                  )}
                </div>
                {['Tablero', 'Backlog', 'Sprints', 'Miembros'].map((item) => (
                  <div
                    key={item}
                    className={cn(
                      'text-xs px-2 py-1.5 rounded-md transition-colors',
                      item === 'Tablero'
                        ? 'font-semibold'
                        : darkMode === 'dark' ? 'text-zinc-400' : 'text-zinc-500',
                    )}
                    style={
                      item === 'Tablero'
                        ? { backgroundColor: `${accentColor}22`, color: accentColor }
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
                      darkMode === 'dark' ? 'border-zinc-600 text-zinc-300' : 'border-zinc-300 text-zinc-700',
                    )}
                  >
                    Secundario
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  {['Por hacer', 'En progreso', 'Hecho'].map((col) => (
                    <div
                      key={col}
                      className={cn(
                        'flex-1 rounded-lg border p-2',
                        darkMode === 'dark' ? 'border-zinc-700 bg-zinc-800' : 'border-zinc-200 bg-zinc-50',
                      )}
                    >
                      <div className="text-xs font-medium mb-2">{col}</div>
                      <div
                        className={cn(
                          'rounded border p-2',
                          darkMode === 'dark' ? 'border-zinc-600 bg-zinc-700' : 'border-zinc-200 bg-white',
                        )}
                      >
                        <div className="text-xs">Tarea ejemplo</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Fixed save bar ──────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 right-0 z-20 border-t bg-background/90 backdrop-blur-sm"
        style={{ left: 'var(--sidebar-width, 16rem)' }}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Los cambios se aplican para todos los miembros al guardar.
          </p>
          <Button onClick={handleSave} disabled={updateAppearance.isPending}>
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
  );
}
