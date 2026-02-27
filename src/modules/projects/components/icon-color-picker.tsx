'use client';

import { createElement } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  FolderKanban,
  Folder,
  Layers,
  Inbox,
  ClipboardList,
  CalendarDays,
  Bookmark,
  Flag,
  Target,
  Star,
  Code2,
  Terminal,
  Bug,
  GitBranch,
  Database,
  Server,
  Cpu,
  ShieldCheck,
  Lock,
  Zap,
  Briefcase,
  BarChart3,
  TrendingUp,
  Coins,
  Building2,
  Handshake,
  Receipt,
  PieChart,
  Megaphone,
  MessageSquare,
  Mail,
  Phone,
  Video,
  Share2,
  Radio,
  Rss,
  Palette,
  PenTool,
  Image as ImageIcon,
  Figma,
  LayoutDashboard,
  Paintbrush,
  Camera,
  Eye,
  Microscope,
  FlaskConical,
  Atom,
  Brain,
  Dna,
  Stethoscope,
  HeartPulse,
  Pill,
  Rocket,
  Globe,
  GraduationCap,
  Trophy,
  Music,
  Gamepad2,
  Ship,
  Plane,
  Home,
  Mountain,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// ── Color presets ──────────────────────────────────────────────

export const PROJECT_COLORS = [
  { name: 'Azul', value: '#0052CC' },
  { name: 'Azul cielo', value: '#4C9AFF' },
  { name: 'Cian', value: '#00B8D9' },
  { name: 'Teal', value: '#36B37E' },
  { name: 'Verde', value: '#00875A' },
  { name: 'Lima', value: '#6AD01F' },
  { name: 'Amarillo', value: '#FFAB00' },
  { name: 'Naranja', value: '#FF991F' },
  { name: 'Rojo', value: '#FF5630' },
  { name: 'Rosa', value: '#E91E8C' },
  { name: 'Morado', value: '#6554C0' },
  { name: 'Lavanda', value: '#8777D9' },
  { name: 'Indigo', value: '#403294' },
  { name: 'Grafito', value: '#505F79' },
  { name: 'Gris', value: '#6B778C' },
  { name: 'Carbon', value: '#253858' },
] as const;

// ── Icon categories ────────────────────────────────────────────

interface IconEntry {
  name: string;
  icon: LucideIcon;
  label: string;
}

interface IconCategory {
  name: string;
  icons: IconEntry[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  {
    name: 'General',
    icons: [
      { name: 'folder-kanban', icon: FolderKanban, label: 'Kanban' },
      { name: 'folder', icon: Folder, label: 'Carpeta' },
      { name: 'layers', icon: Layers, label: 'Capas' },
      { name: 'inbox', icon: Inbox, label: 'Bandeja' },
      { name: 'clipboard', icon: ClipboardList, label: 'Lista' },
      { name: 'calendar', icon: CalendarDays, label: 'Calendario' },
      { name: 'bookmark', icon: Bookmark, label: 'Marcador' },
      { name: 'flag', icon: Flag, label: 'Bandera' },
      { name: 'target', icon: Target, label: 'Objetivo' },
      { name: 'star', icon: Star, label: 'Estrella' },
    ],
  },
  {
    name: 'Desarrollo',
    icons: [
      { name: 'code', icon: Code2, label: 'Codigo' },
      { name: 'terminal', icon: Terminal, label: 'Terminal' },
      { name: 'bug', icon: Bug, label: 'Bug' },
      { name: 'git-branch', icon: GitBranch, label: 'Branch' },
      { name: 'database', icon: Database, label: 'Base datos' },
      { name: 'server', icon: Server, label: 'Servidor' },
      { name: 'cpu', icon: Cpu, label: 'CPU' },
      { name: 'shield', icon: ShieldCheck, label: 'Seguridad' },
      { name: 'lock', icon: Lock, label: 'Candado' },
      { name: 'zap', icon: Zap, label: 'Zap' },
    ],
  },
  {
    name: 'Negocio',
    icons: [
      { name: 'briefcase', icon: Briefcase, label: 'Maletin' },
      { name: 'chart', icon: BarChart3, label: 'Grafico' },
      { name: 'trending-up', icon: TrendingUp, label: 'Tendencia' },
      { name: 'coins', icon: Coins, label: 'Monedas' },
      { name: 'building', icon: Building2, label: 'Edificio' },
      { name: 'handshake', icon: Handshake, label: 'Acuerdo' },
      { name: 'receipt', icon: Receipt, label: 'Recibo' },
      { name: 'pie-chart', icon: PieChart, label: 'Pastel' },
    ],
  },
  {
    name: 'Comunicacion',
    icons: [
      { name: 'megaphone', icon: Megaphone, label: 'Marketing' },
      { name: 'message', icon: MessageSquare, label: 'Mensaje' },
      { name: 'mail', icon: Mail, label: 'Correo' },
      { name: 'phone', icon: Phone, label: 'Telefono' },
      { name: 'video', icon: Video, label: 'Video' },
      { name: 'share', icon: Share2, label: 'Compartir' },
      { name: 'radio', icon: Radio, label: 'Radio' },
      { name: 'rss', icon: Rss, label: 'RSS' },
    ],
  },
  {
    name: 'Diseno',
    icons: [
      { name: 'palette', icon: Palette, label: 'Paleta' },
      { name: 'pen', icon: PenTool, label: 'Pluma' },
      { name: 'image', icon: ImageIcon, label: 'Imagen' },
      { name: 'figma', icon: Figma, label: 'Figma' },
      { name: 'layout', icon: LayoutDashboard, label: 'Layout' },
      { name: 'brush', icon: Paintbrush, label: 'Pincel' },
      { name: 'camera', icon: Camera, label: 'Camara' },
      { name: 'eye', icon: Eye, label: 'Ojo' },
    ],
  },
  {
    name: 'Ciencia',
    icons: [
      { name: 'microscope', icon: Microscope, label: 'Microscopio' },
      { name: 'flask', icon: FlaskConical, label: 'Matraz' },
      { name: 'atom', icon: Atom, label: 'Atomo' },
      { name: 'brain', icon: Brain, label: 'Cerebro' },
      { name: 'dna', icon: Dna, label: 'ADN' },
      { name: 'stethoscope', icon: Stethoscope, label: 'Estetoscopio' },
      { name: 'health', icon: HeartPulse, label: 'Salud' },
      { name: 'pill', icon: Pill, label: 'Pastilla' },
    ],
  },
  {
    name: 'Otros',
    icons: [
      { name: 'rocket', icon: Rocket, label: 'Cohete' },
      { name: 'globe', icon: Globe, label: 'Globo' },
      { name: 'graduation', icon: GraduationCap, label: 'Educacion' },
      { name: 'trophy', icon: Trophy, label: 'Trofeo' },
      { name: 'music', icon: Music, label: 'Musica' },
      { name: 'gamepad', icon: Gamepad2, label: 'Juegos' },
      { name: 'ship', icon: Ship, label: 'Barco' },
      { name: 'plane', icon: Plane, label: 'Avion' },
      { name: 'home', icon: Home, label: 'Casa' },
      { name: 'mountain', icon: Mountain, label: 'Montana' },
    ],
  },
];

// ── Flat lookup for icon resolution ────────────────────────────

const ICON_MAP = new Map<string, LucideIcon>(
  ICON_CATEGORIES.flatMap((cat) => cat.icons.map((i) => [i.name, i.icon] as const)),
);

export function getProjectIcon(iconName: string | null): LucideIcon {
  if (!iconName) return FolderKanban;
  return ICON_MAP.get(iconName) ?? FolderKanban;
}

// ── IconColorPicker component ──────────────────────────────────

interface IconColorPickerProps {
  selectedIcon: string;
  selectedColor: string;
  onIconChange: (iconName: string) => void;
  onColorChange: (color: string) => void;
}

export function IconColorPicker({
  selectedIcon,
  selectedColor,
  onIconChange,
  onColorChange,
}: IconColorPickerProps) {
  const SelectedIconComponent = getProjectIcon(selectedIcon);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex size-12 items-center justify-center rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: selectedColor }}
        >
          <SelectedIconComponent className="size-6" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" sideOffset={8}>
        {/* Color picker */}
        <div className="border-b p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Color</p>
          <div className="grid grid-cols-8 gap-1.5">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onColorChange(color.value)}
                className={cn(
                  'size-7 rounded-full transition-all hover:scale-110',
                  selectedColor === color.value && 'ring-2 ring-foreground ring-offset-2',
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Icon picker with category tabs */}
        <Tabs defaultValue="General">
          <div className="overflow-x-auto border-b">
            <TabsList variant="line" className="w-full justify-start px-3 pt-1">
              {ICON_CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.name}
                  value={cat.name}
                  className="px-2 py-1 text-[11px]"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {ICON_CATEGORIES.map((cat) => (
            <TabsContent key={cat.name} value={cat.name} className="mt-0 px-3 pb-3 pt-2">
              <ScrollArea className="max-h-48">
                <div className="grid grid-cols-6 gap-1">
                  {cat.icons.map((item) => {
                    const isSelected = selectedIcon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => onIconChange(item.name)}
                        className={cn(
                          'flex flex-col items-center gap-0.5 rounded-md p-1.5 transition-colors hover:bg-muted',
                          isSelected && 'bg-muted ring-1 ring-foreground/20',
                        )}
                        title={item.label}
                      >
                        {createElement(item.icon, {
                          className: 'size-5',
                          style: isSelected ? { color: selectedColor } : undefined,
                        })}
                        <span className="text-[8px] leading-none text-muted-foreground">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
