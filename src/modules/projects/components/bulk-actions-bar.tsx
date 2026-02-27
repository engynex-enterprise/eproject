'use client';

import { Archive, Star, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="size-3.5" />
            Borrar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Borrar {selectedCount} proyectos</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas borrar {selectedCount}{' '}
              {selectedCount === 1 ? 'proyecto' : 'proyectos'}? Esta acción no se puede
              deshacer y se eliminarán todas las incidencias, sprints y datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onBulkDelete}
            >
              Borrar {selectedCount} proyectos
            </AlertDialogAction>
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
