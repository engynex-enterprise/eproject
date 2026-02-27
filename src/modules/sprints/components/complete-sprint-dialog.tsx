'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { Issue, Sprint } from '@/shared/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CompleteSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprintName: string;
  incompleteIssues: Issue[];
  availableSprints: Sprint[];
  onConfirm: (data: {
    moveToBacklog: boolean;
    moveToSprintId?: number;
  }) => Promise<void>;
  isPending?: boolean;
}

export function CompleteSprintDialog({
  open,
  onOpenChange,
  sprintName,
  incompleteIssues,
  availableSprints,
  onConfirm,
  isPending,
}: CompleteSprintDialogProps) {
  const [action, setAction] = useState<'backlog' | 'sprint'>('backlog');
  const [targetSprintId, setTargetSprintId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      moveToBacklog: action === 'backlog',
      moveToSprintId:
        action === 'sprint' ? parseInt(targetSprintId, 10) : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Completar sprint</DialogTitle>
            <DialogDescription>
              Completar el sprint &quot;{sprintName}&quot;.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {incompleteIssues.length > 0 && (
              <Alert>
                <AlertTriangle className="size-4" />
                <AlertDescription>
                  Hay {incompleteIssues.length} incidencia(s) sin completar en
                  este sprint. Elige que hacer con ellas.
                </AlertDescription>
              </Alert>
            )}

            {incompleteIssues.length > 0 && (
              <div className="space-y-3">
                <Label>Incidencias incompletas</Label>
                <div className="max-h-40 overflow-auto rounded border divide-y">
                  {incompleteIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm"
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {issue.issueKey}
                      </span>
                      <span className="truncate">{issue.title}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Mover incidencias incompletas a:</Label>
                  <Select
                    value={action}
                    onValueChange={(v) =>
                      setAction(v as 'backlog' | 'sprint')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="sprint">
                        Otro sprint
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {action === 'sprint' && (
                  <div className="space-y-2">
                    <Label>Sprint destino</Label>
                    <Select
                      value={targetSprintId}
                      onValueChange={setTargetSprintId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar sprint" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSprints.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
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
                isPending ||
                (action === 'sprint' && !targetSprintId && incompleteIssues.length > 0)
              }
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Completar sprint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
