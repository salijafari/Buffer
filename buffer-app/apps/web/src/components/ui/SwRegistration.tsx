'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '../../lib/registerSW';

/** Thin client component that triggers SW registration after hydration. */
export function SwRegistration() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}
