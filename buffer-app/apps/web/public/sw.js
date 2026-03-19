/**
 * Buffer Service Worker — stale-while-revalidate strategy
 *
 * Cache strategy:
 * - Static assets (JS/CSS/fonts): Cache-first (immutable, CDN-hashed)
 * - API calls: Network-only (financial data must be fresh, no caching)
 * - App shell (HTML): Stale-while-revalidate
 * - Offline fallback: /offline page for navigation requests
 */

const CACHE_VERSION = 'buffer-v1';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const SHELL_CACHE   = `${CACHE_VERSION}-shell`;

const STATIC_ASSETS = [
  '/_next/static/',
  '/icons/',
  '/fonts/',
];

const NEVER_CACHE = [
  '/api/',
  'plaid',
  'vopay',
  'equifax',
  'transunion',
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache =>
      cache.addAll(['/offline', '/manifest.json'])
    ).catch(() => {/* offline page may not exist yet */})
  );
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== SHELL_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache API or financial data
  if (NEVER_CACHE.some(p => url.pathname.includes(p) || url.hostname.includes(p))) {
    return; // fall through to network
  }

  // Static assets — cache-first
  if (STATIC_ASSETS.some(p => url.pathname.startsWith(p))) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(cache =>
        cache.match(request).then(cached => {
          if (cached) return cached;
          return fetch(request).then(response => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Navigation requests — stale-while-revalidate
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async cache => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then(response => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        }).catch(async () => {
          // Network failed — serve offline fallback
          const offline = await cache.match('/offline');
          return offline ?? new Response('Offline', { status: 503 });
        });
        return cached ?? fetchPromise;
      })
    );
  }
});

// ─── Push notifications ───────────────────────────────────────────────────────

self.addEventListener('push', event => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Buffer', body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'Buffer', {
      body:    payload.body,
      icon:    '/icons/icon-192.png',
      badge:   '/icons/icon-192.png',
      tag:     payload.tag ?? 'buffer-default',
      data:    payload.data,
      actions: payload.actions ?? [],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      const existing = windowClients.find(c => c.url.includes(url) && 'focus' in c);
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
