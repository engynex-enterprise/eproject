'use client';

import { useTheme } from 'next-themes';
import { Toaster as SileoToaster } from 'sileo';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { useSileoConfigStore } from '@/shared/stores/sileo-config.store';

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  const { config } = useSileoConfigStore();

  const resolvedThemeValue =
    config.theme === 'system'
      ? (resolvedTheme as 'light' | 'dark')
      : config.theme;

  const isDark = resolvedThemeValue === 'dark';

  if (config.alertProvider === 'shadcn') {
    return (
      <SonnerToaster
        position={config.position}
        theme={resolvedThemeValue}
        richColors
        toastOptions={{
          style: { borderRadius: `${config.roundness}px` },
        }}
      />
    );
  }

  return (
    <SileoToaster
      position={config.position}
      theme={resolvedThemeValue}
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
