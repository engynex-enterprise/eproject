'use client';

import { useState } from 'react';
import {
  Bug,
  BookOpen,
  CheckSquare,
  Zap,
  Loader2,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCreateIssue } from '../hooks/use-issues';
import type { IssueType, Priority, Status, Sprint, Space, User } from '@/shared/types';

interface CreateIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  projectKey: string;
  issueTypes?: IssueType[];
  statuses?: Status[];
  priorities?: Priority[];
  sprints?: Sprint[];
  spaces?: Space[];
  members?: User[];
  defaultStatusId?: number;
}

const issueTypeIcons: Record<string, React.ElementType> = {
  Epic: Zap,
  Story: BookOpen,
  Task: CheckSquare,
  Bug: Bug,
};

const issueTypeColors: Record<string, string> = {
  Epic: 'text-purple-500',
  Story: 'text-green-500',
  Task: 'text-blue-500',
  Bug: 'text-red-500',
};

export function CreateIssueDialog({
  open,
  onOpenChange,
  projectId,
  projectKey,
  issueTypes = [],
  statuses = [],
  priorities = [],
  sprints = [],
  spaces = [],
  members = [],
  defaultStatusId,
}: CreateIssueDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueTypeId, setIssueTypeId] = useState<string>('');
  const [statusId, setStatusId] = useState<string>(
    defaultStatusId?.toString() ?? '',
  );
  const [priorityId, setPriorityId] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [sprintId, setSprintId] = useState<string>('');
  const [spaceId, setSpaceId] = useState<string>('');
  const [storyPoints, setStoryPoints] = useState<string>('');

  const createIssue = useCreateIssue(projectKey);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIssueTypeId('');
    setStatusId(defaultStatusId?.toString() ?? '');
    setPriorityId('');
    setAssigneeId('');
    setSprintId('');
    setSpaceId('');
    setStoryPoints('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !issueTypeId) return;

    try {
      await createIssue.mutateAsync({
        projectId,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          issueTypeId: parseInt(issueTypeId, 10),
          statusId: statusId ? parseInt(statusId, 10) : undefined,
          priorityId: priorityId ? parseInt(priorityId, 10) : undefined,
          assigneeId: assigneeId ? parseInt(assigneeId, 10) : undefined,
          sprintId: sprintId ? parseInt(sprintId, 10) : undefined,
          spaceId: spaceId ? parseInt(spaceId, 10) : undefined,
          storyPoints: storyPoints ? parseInt(storyPoints, 10) : undefined,
        },
      });
      onOpenChange(false);
      resetForm();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear incidencia</DialogTitle>
            <DialogDescription>
              Crea una nueva incidencia en el proyecto {projectKey}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Issue Type */}
            <div className="space-y-2">
              <Label>Tipo de incidencia</Label>
              <Select value={issueTypeId} onValueChange={setIssueTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((type) => {
                    const Icon = issueTypeIcons[type.name] ?? CheckSquare;
                    return (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Icon
                            className={cn(
                              'size-4',
                              issueTypeColors[type.name] ?? 'text-gray-500',
                            )}
                          />
                          {type.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="issue-title">Titulo</Label>
              <Input
                id="issue-title"
                placeholder="Resumen de la incidencia"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>
                Descripcion{' '}
                <span className="text-muted-foreground">(opcional)</span>
              </Label>
              <Textarea
                placeholder="Describe la incidencia..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              {statuses.length > 0 && (
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={statusId} onValueChange={setStatusId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: s.color }}
                            />
                            {s.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Priority */}
              {priorities.length > 0 && (
                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <Select value={priorityId} onValueChange={setPriorityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Assignee */}
              {members.length > 0 && (
                <div className="space-y-2">
                  <Label>Asignado</Label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.firstName} {m.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Sprint */}
              {sprints.length > 0 && (
                <div className="space-y-2">
                  <Label>Sprint</Label>
                  <Select value={sprintId} onValueChange={setSprintId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sin sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      {sprints.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Story Points */}
              <div className="space-y-2">
                <Label>
                  Puntos{' '}
                  <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                />
              </div>

              {/* Space */}
              {spaces.length > 0 && (
                <div className="space-y-2">
                  <Label>
                    Espacio{' '}
                    <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <Select value={spaceId} onValueChange={setSpaceId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ninguno" />
                    </SelectTrigger>
                    <SelectContent>
                      {spaces.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                !title.trim() || !issueTypeId || createIssue.isPending
              }
            >
              {createIssue.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Crear incidencia
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
