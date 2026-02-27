'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProject } from '../hooks/use-projects';

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

export function CreateProjectDialog({
  open,
  onOpenChange,
  orgId,
}: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [keyTouched, setKeyTouched] = useState(false);
  const [description, setDescription] = useState('');

  const createProject = useCreateProject(orgId);

  const keyError =
    key.length > 0 && (key.length < 2 || key.length > 10 || !/^[A-Z0-9]+$/.test(key))
      ? 'La clave debe tener entre 2 y 10 caracteres alfanumericos en mayusculas'
      : '';

  useEffect(() => {
    if (!keyTouched && name) {
      setKey(generateKey(name));
    }
  }, [name, keyTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim() || keyError) return;

    try {
      await createProject.mutateAsync({ name: name.trim(), key, description: description.trim() || undefined });
      onOpenChange(false);
      setName('');
      setKey('');
      setKeyTouched(false);
      setDescription('');
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear proyecto</DialogTitle>
            <DialogDescription>
              Crea un nuevo proyecto para tu equipo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Nombre</Label>
              <Input
                id="project-name"
                placeholder="Mi proyecto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-key">Clave</Label>
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
              {keyError && (
                <p className="text-xs text-destructive">{keyError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Identificador unico del proyecto (ej: PROJ). Se usara como prefijo de las incidencias.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">
                Descripcion <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="project-description"
                placeholder="Describe el proyecto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                !name.trim() || !key.trim() || !!keyError || createProject.isPending
              }
            >
              {createProject.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Crear proyecto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
