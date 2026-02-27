'use client';

import { Calendar } from 'lucide-react';

export default function SpaceTimelinePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Calendar className="mb-4 size-12 text-muted-foreground/40" />
      <h3 className="text-base font-semibold">Cronograma</h3>
      <p className="mt-1 text-sm text-muted-foreground">Proximamente</p>
    </div>
  );
}
