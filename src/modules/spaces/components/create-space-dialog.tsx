'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createSpace,
  type CreateSpaceData,
} from '@/modules/spaces/services/spaces.service';
import { cn } from '@/lib/utils';

interface CreateSpaceDialogProps {
  projectId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const colorOptions = [
  { value: '#3b82f6', class: 'bg-blue-500' },
  { value: '#22c55e', class: 'bg-green-500' },
  { value: '#eab308', class: 'bg-yellow-500' },
  { value: '#f97316', class: 'bg-orange-500' },
  { value: '#a855f7', class: 'bg-purple-500' },
  { value: '#ef4444', class: 'bg-red-500' },
  { value: '#ec4899', class: 'bg-pink-500' },
  { value: '#14b8a6', class: 'bg-teal-500' },
  { value: '#6366f1', class: 'bg-indigo-500' },
  { value: '#6b7280', class: 'bg-gray-500' },
];

function generateKey(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 5);
}

export function CreateSpaceDialog({
  projectId,
  open,
  onOpenChange,
}: CreateSpaceDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: CreateSpaceData) => createSpace(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces', projectId] });
      onOpenChange(false);
      resetForm();
    },
  });

  useEffect(() => {
    if (!keyManuallyEdited && name) {
      setKey(generateKey(name));
    }
  }, [name, keyManuallyEdited]);

  const resetForm = () => {
    setName('');
    setKey('');
    setDescription('');
    setColor('#3b82f6');
    setKeyManuallyEdited(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate({
      name: name.trim(),
      key: key || undefined,
      description: description.trim() || null,
      color,
    });
  };

  const handleKeyChange = (value: string) => {
    setKey(value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
    setKeyManuallyEdited(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear espacio</DialogTitle>
            <DialogDescription>
              Crea un nuevo espacio para organizar las incidencias de tu
              proyecto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="space-name">Nombre del espacio</Label>
              <Input
                id="space-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Frontend, Backend, Diseno..."
                required
                autoFocus
              />
            </div>

            {/* Key */}
            <div className="space-y-2">
              <Label htmlFor="space-key">Clave</Label>
              <Input
                id="space-key"
                value={key}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="AUTO"
                maxLength={5}
              />
              <p className="text-xs text-muted-foreground">
                Se genera automaticamente a partir del nombre. Max 5
                caracteres.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="space-description">Descripcion</Label>
              <Textarea
                id="space-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el proposito de este espacio..."
                rows={3}
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    className={cn(
                      'size-8 rounded-full transition-all',
                      opt.class,
                      color === opt.value
                        ? 'ring-2 ring-offset-2 ring-foreground'
                        : 'hover:scale-110',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Crear espacio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
