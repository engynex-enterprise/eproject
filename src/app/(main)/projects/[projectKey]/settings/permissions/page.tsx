'use client';

import { Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function PermissionsPage() {
  return (
    <div className="max-w-3xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Permisos</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona los permisos y roles del proyecto.
        </p>
      </div>
      <Separator />
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <Shield className="size-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Proximamente</p>
        <p className="text-xs text-muted-foreground mt-1">
          Esta seccion esta en desarrollo.
        </p>
      </div>
    </div>
  );
}
