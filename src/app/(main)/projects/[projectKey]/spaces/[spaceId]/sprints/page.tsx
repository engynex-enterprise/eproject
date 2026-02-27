'use client';

import { IterationCcw } from 'lucide-react';

export default function SpaceSprintsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <IterationCcw className="mb-4 size-12 text-muted-foreground/40" />
      <h3 className="text-base font-semibold">Sprints</h3>
      <p className="mt-1 text-sm text-muted-foreground">Proximamente</p>
    </div>
  );
}
