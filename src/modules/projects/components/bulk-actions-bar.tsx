'use client';

import { useState } from 'react';
import { Archive, Star, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const BULK_DELETE_KEYWORD = 'BORRAR';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkFavorite: () => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onBulkFavorite,
  onBulkArchive,
  onBulkDelete,
}: BulkActionsBarProps) {
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-4 z-10 mx-auto flex w-fit items-center gap-2 rounded-lg border bg-card px-4 py-2 shadow-lg">
      <span className="text-sm font-medium">
        {selectedCount} {selectedCount === 1 ? 'proyecto seleccionado' : 'proyectos seleccionados'}
      </span>

      <div className="mx-2 h-4 w-px bg-border" />

      <Button variant="ghost" size="sm" className="gap-1.5" onClick={onBulkFavorite}>
        <Star className="size-3.5" />
        Marcar
      </Button>

      <Button variant="ghost" size="sm" className="gap-1.5" onClick={onBulkArchive}>
        <Archive className="size-3.5" />
        Archivar
      </Button>

      <AlertDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setDeleteConfirm('');
        }}
      >
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="size-3.5" />
            Borrar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Borrar {selectedCount} {selectedCount === 1 ? 'proyecto' : 'proyectos'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer y se eliminaran todas las
              incidencias, sprints y datos asociados de {selectedCount}{' '}
              {selectedCount === 1 ? 'proyecto' : 'proyectos'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="delete-confirm-bulk">
              Escribe <strong className="font-mono text-destructive">{BULK_DELETE_KEYWORD}</strong> para confirmar
            </Label>
            <Input
              id="delete-confirm-bulk"
              placeholder={BULK_DELETE_KEYWORD}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
              autoComplete="off"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== BULK_DELETE_KEYWORD}
              onClick={() => {
                onBulkDelete();
                setDialogOpen(false);
                setDeleteConfirm('');
              }}
            >
              <Trash2 className="size-4" />
              Borrar {selectedCount} {selectedCount === 1 ? 'proyecto' : 'proyectos'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-2 h-4 w-px bg-border" />

      <Button variant="ghost" size="icon-xs" className="size-6" onClick={onClearSelection}>
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
