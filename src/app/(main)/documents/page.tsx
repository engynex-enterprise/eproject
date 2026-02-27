'use client';

import { FileText, FolderOpen } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="size-6" />
          Documentacion
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Documentos y paginas wiki de tus proyectos.
        </p>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-24 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-muted/50 mb-6">
          <FolderOpen className="size-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Aun no hay documentos
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Los documentos de tus proyectos apareceran aqui. Crea documentacion
          desde la vista de un proyecto para comenzar.
        </p>
      </div>
    </div>
  );
}
