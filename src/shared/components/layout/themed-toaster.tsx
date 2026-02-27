'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sileo';
import { useSileoConfigStore } from '@/shared/stores/sileo-config.store';

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const { config } = useSileoConfigStore();

  // Resolve the actual theme to apply
  const isDark =
    config.theme === 'system'
      ? resolvedTheme === 'dark'
      : config.theme === 'dark';

  return (
    <Toaster
      position={config.position}
      theme={config.theme === 'system' ? (resolvedTheme as 'light' | 'dark') : config.theme}
      offset={{
        top: config.offsetTop,
        right: config.offsetRight,
        bottom: config.offsetBottom,
        left: config.offsetLeft,
      }}
      options={{
        duration: config.duration,
        roundness: config.roundness,
        fill: isDark ? '#FFFFFF' : '#171717',
        styles: {
          title: isDark ? 'text-neutral-900!' : 'text-white!',
          description: isDark ? 'text-neutral-500!' : 'text-neutral-400!',
        },
      }}
    />
  );
}
