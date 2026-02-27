'use client';

import { useState } from 'react';
import { format, addWeeks } from 'date-fns';
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

interface StartSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprintName: string;
  onConfirm: (data: {
    name: string;
    startDate: string;
    endDate: string;
    goal: string;
  }) => Promise<void>;
  isPending?: boolean;
}

export function StartSprintDialog({
  open,
  onOpenChange,
  sprintName,
  onConfirm,
  isPending,
}: StartSprintDialogProps) {
  const today = new Date();
  const twoWeeksLater = addWeeks(today, 2);

  const [name, setName] = useState(sprintName);
  const [startDate, setStartDate] = useState(format(today, 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(
    format(twoWeeksLater, 'yyyy-MM-dd'),
  );
  const [goal, setGoal] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      name,
      startDate,
      endDate,
      goal,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Iniciar sprint</DialogTitle>
            <DialogDescription>
              Configura las fechas y objetivo del sprint.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sprint-name">Nombre del sprint</Label>
              <Input
                id="sprint-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Fecha de inicio</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Fecha de fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sprint-goal">
                Objetivo{' '}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                id="sprint-goal"
                placeholder="Que quieres lograr en este sprint?"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Iniciar sprint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
