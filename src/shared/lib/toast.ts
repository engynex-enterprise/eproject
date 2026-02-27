/**
 * Unified toast abstraction.
 * Routes to Sileo or Sonner depending on the active alertProvider in the store.
 */
import { sileo } from 'sileo';
import { toast as sonner } from 'sonner';
import { useSileoConfigStore } from '@/shared/stores/sileo-config.store';

interface ToastOptions {
  title: string;
  description?: string;
}

function provider() {
  return useSileoConfigStore.getState().config.alertProvider;
}

export const toast = {
  success: (opts: ToastOptions) => {
    if (provider() === 'shadcn') {
      sonner.success(opts.title, { description: opts.description });
    } else {
      sileo.success(opts);
    }
  },

  error: (opts: ToastOptions) => {
    if (provider() === 'shadcn') {
      sonner.error(opts.title, { description: opts.description });
    } else {
      sileo.error(opts);
    }
  },

  warning: (opts: ToastOptions) => {
    if (provider() === 'shadcn') {
      sonner.warning(opts.title, { description: opts.description });
    } else {
      sileo.warning(opts);
    }
  },

  info: (opts: ToastOptions) => {
    if (provider() === 'shadcn') {
      sonner.info(opts.title, { description: opts.description });
    } else {
      sileo.info(opts);
    }
  },
};
