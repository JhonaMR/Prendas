// Service Worker para Plow - PWA
const CACHE_NAME = 'plow-v4';
const RUNTIME_CACHE = 'plow-runtime-v4';
const API_CACHE = 'plow-api-v4';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Instalar el service worker
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activar el service worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de caché mejorada
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // No cachear requests POST, PUT, DELETE
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // API requests: Network only, never cache dynamic data
  if (url.pathname.includes('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Static assets: Cache first, fallback to network
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) return cached;
          return fetch(request)
            .then(response => {
              if (response.ok) {
                const cache = caches.open(RUNTIME_CACHE);
                cache.then(c => c.put(request, response.clone()));
              }
              return response;
            });
        })
        .catch(() => {
          if (request.destination === 'image') {
            return caches.match('/placeholder.png');
          }
        })
    );
    return;
  }

  // HTML pages: Network first, fallback to cache
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then(c => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Default: Network first
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const cache = caches.open(RUNTIME_CACHE);
          cache.then(c => c.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Manejo de mensajes desde el cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
