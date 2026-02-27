'use client';

import { useEffect, useState, useDeferredValue } from 'react';
import {
  Loader2,
  FolderKanban,
  Search,
  Briefcase,
  Code2,
  Megaphone,
  GraduationCap,
  Rocket,
  Bug,
  Palette,
  BarChart3,
  HeartPulse,
  Globe,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAccentColor } from '@/shared/providers/accent-color-provider';
import { useCreateProject, useSearchUsers } from '../hooks/use-projects';
import type { UserSearchResult } from '../services/projects.service';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: number;
}

function generateKey(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 5)
    .toUpperCase();
}

const PROJECT_ICONS = [
  { name: 'folder-kanban', icon: FolderKanban, label: 'Kanban' },
  { name: 'briefcase', icon: Briefcase, label: 'Negocio' },
  { name: 'code', icon: Code2, label: 'Código' },
  { name: 'megaphone', icon: Megaphone, label: 'Marketing' },
  { name: 'graduation', icon: GraduationCap, label: 'Educación' },
  { name: 'rocket', icon: Rocket, label: 'Startup' },
  { name: 'bug', icon: Bug, label: 'QA' },
  { name: 'palette', icon: Palette, label: 'Diseño' },
  { name: 'chart', icon: BarChart3, label: 'Analítica' },
  { name: 'health', icon: HeartPulse, label: 'Salud' },
  { name: 'globe', icon: Globe, label: 'Web' },
  { name: 'shield', icon: ShieldCheck, label: 'Seguridad' },
] as const;

const PROJECT_CATEGORIES = [
  { value: 'software', label: 'Software' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'design', label: 'Diseño' },
  { value: 'business', label: 'Negocio' },
  { value: 'operations', label: 'Operaciones' },
  { value: 'support', label: 'Soporte' },
  { value: 'hr', label: 'Recursos Humanos' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'other', label: 'Otro' },
];

export function CreateProjectDialog({
  open,
  onOpenChange,
  orgId,
}: CreateProjectDialogProps) {
  const { colors } = useAccentColor();

  // Form fields
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [keyTouched, setKeyTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('folder-kanban');
  const [category, setCategory] = useState('');
  const [leadQuery, setLeadQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<UserSearchResult | null>(null);

  const createProject = useCreateProject(orgId);

  // Lead search
  const deferredLeadQuery = useDeferredValue(leadQuery);
  const { data: leadResults, isLoading: isSearchingLead } = useSearchUsers(orgId, deferredLeadQuery);
  const leadUsers = leadResults?.data ?? [];

  const keyError =
    key.length > 0 && (key.length < 2 || key.length > 10 || !/^[A-Z0-9]+$/.test(key))
      ? 'La clave debe tener entre 2 y 10 caracteres alfanuméricos en mayúsculas'
      : '';

  useEffect(() => {
    if (!keyTouched && name) {
      setKey(generateKey(name));
    }
  }, [name, keyTouched]);

  const handleReset = () => {
    setName('');
    setKey('');
    setKeyTouched(false);
    setDescription('');
    setSelectedIcon('folder-kanban');
    setCategory('');
    setLeadQuery('');
    setSelectedLead(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim() || keyError) return;

    try {
      await createProject.mutateAsync({
        name: name.trim(),
        key,
        description: description.trim() || undefined,
        leadId: selectedLead?.id,
        iconUrl: selectedIcon !== 'folder-kanban' ? selectedIcon : undefined,
        category: category || undefined,
      });
      onOpenChange(false);
      handleReset();
    } catch {
      // Error handled by mutation
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) handleReset();
    onOpenChange(isOpen);
  };

  const SelectedIconComponent =
    PROJECT_ICONS.find((i) => i.name === selectedIcon)?.icon ?? FolderKanban;

  const showLeadResults = leadQuery.length >= 2 && !selectedLead;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg" showCloseButton>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: colors.base }}
            >
              <SelectedIconComponent className="size-5" />
            </div>
            Crear proyecto
          </SheetTitle>
          <SheetDescription>
            Configura los detalles de tu nuevo proyecto.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
          <div className="space-y-6 px-4">
            {/* Icon selector */}
            <div className="space-y-2">
              <Label>Icono</Label>
              <div className="grid grid-cols-6 gap-2">
                {PROJECT_ICONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedIcon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedIcon(item.name)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-lg border p-2 transition-all hover:bg-muted',
                        isSelected && 'border-2 bg-muted',
                      )}
                      style={isSelected ? { borderColor: colors.base } : undefined}
                    >
                      <Icon
                        className="size-5"
                        style={isSelected ? { color: colors.base } : undefined}
                      />
                      <span className="text-[9px] text-muted-foreground">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="project-name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-name"
                placeholder="Mi proyecto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Key */}
            <div className="space-y-2">
              <Label htmlFor="project-key">
                Clave del proyecto <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-key"
                placeholder="PROJ"
                value={key}
                onChange={(e) => {
                  setKeyTouched(true);
                  setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10));
                }}
                required
                aria-invalid={!!keyError}
              />
              {keyError ? (
                <p className="text-xs text-destructive">{keyError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Identificador único del proyecto. Se usa como prefijo de las incidencias (ej: {key || 'PROJ'}-1).
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="project-category">
                Categoría <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="project-category">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Lead / Owner */}
            <div className="space-y-2">
              <Label htmlFor="project-lead">
                Propietario del proyecto <span className="text-muted-foreground">(opcional)</span>
              </Label>

              {selectedLead ? (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                  <Avatar className="size-8">
                    <AvatarImage src={selectedLead.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {selectedLead.firstName?.[0]}
                      {selectedLead.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {selectedLead.firstName} {selectedLead.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedLead.email}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedLead(null);
                      setLeadQuery('');
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="project-lead"
                      placeholder="Buscar por correo..."
                      value={leadQuery}
                      onChange={(e) => setLeadQuery(e.target.value)}
                      className="pl-9"
                    />
                    {isSearchingLead && (
                      <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {showLeadResults && leadUsers.length > 0 && (
                    <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border p-1">
                      {leadUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted"
                          onClick={() => {
                            setSelectedLead(user);
                            setLeadQuery(user.email);
                          }}
                        >
                          <Avatar className="size-7">
                            <AvatarImage src={user.avatarUrl ?? undefined} />
                            <AvatarFallback className="bg-primary/10 text-[9px] text-primary">
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              <p className="text-xs text-muted-foreground">
                El propietario será responsable del proyecto y aparecerá como líder.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="project-description">
                Descripción <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="project-description"
                placeholder="Describe el objetivo y alcance del proyecto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <SheetFooter className="px-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || !key.trim() || !!keyError || createProject.isPending}
            >
              {createProject.isPending && <Loader2 className="size-4 animate-spin" />}
              Crear proyecto
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
