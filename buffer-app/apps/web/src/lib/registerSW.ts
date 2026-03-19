/**
 * Service worker registration — called once from root layout client component.
 * Only registers in production (not during Next.js dev server HMR).
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator))  return;
  if (process.env.NODE_ENV !== 'production') return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(reg => {
        // Check for updates every hour
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch(err => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[SW] Registration failed:', err);
        }
      });
  });
}
