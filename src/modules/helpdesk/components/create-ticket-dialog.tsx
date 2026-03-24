'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { sileo } from 'sileo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

const PRIORITY_OPTIONS = [
  { value: 'highest', label: 'Crítica', color: '#ef4444' },
  { value: 'high', label: 'Alta', color: '#f97316' },
  { value: 'medium', label: 'Media', color: '#eab308' },
  { value: 'low', label: 'Baja', color: '#3b82f6' },
  { value: 'lowest', label: 'Muy baja', color: '#94a3b8' },
];

export function CreateTicketDialog({ open, onOpenChange, onCreated }: CreateTicketDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      // TODO: llamar a la API cuando el backend esté listo
      // await apiClient.post('/helpdesk/tickets', { title, description, priority });
      await new Promise((r) => setTimeout(r, 600)); // simulación

      sileo.success({
        title: 'Ticket creado',
        description: <span className="text-xs!">{title}</span>,
        icon: <Plus className="size-4" />,
      });

      setTitle('');
      setDescription('');
      setPriority('medium');
      onOpenChange(false);
      onCreated?.();
    } catch {
      sileo.error({
        title: 'Error al crear ticket',
        description: <span className="text-xs!">Inténtalo de nuevo.</span>,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Crear nuevo ticket</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ticket-title" className="text-sm font-medium">
              Título <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ticket-title"
              placeholder="Describe brevemente el problema o solicitud..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              autoFocus
              required
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ticket-desc" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="ticket-desc"
              placeholder="Proporciona más detalles, pasos para reproducir, contexto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Prioridad */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Prioridad</Label>
            <Select value={priority} onValueChange={setPriority} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: opt.color }}
                      />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!title.trim() || isLoading} className="gap-2">
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Crear ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
