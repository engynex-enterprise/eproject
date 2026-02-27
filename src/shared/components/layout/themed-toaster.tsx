'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sileo';

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Toaster
      position="top-right"
      options={{
        fill: isDark ? '#FFFFFF' : '#171717',
        styles: {
          title: isDark ? 'text-neutral-900!' : 'text-white!',
          description: isDark ? 'text-neutral-500!' : 'text-neutral-400!',
        },
      }}
    />
  );
}
