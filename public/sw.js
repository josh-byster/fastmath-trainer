import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

const CACHE_NAME = 'fastmath-v1.0.0';
const STATIC_CACHE = 'fastmath-static-v1.0.0';
const DYNAMIC_CACHE = 'fastmath-dynamic-v1.0.0';

// Precache all build assets
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old caches
cleanupOutdatedCaches();

// Cache the Google Fonts stylesheets
registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache the underlying font files
registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache images
registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Cache API responses with stale-while-revalidate strategy
registerRoute(
  /^https:\/\/api\./,
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
    ],
  })
);

// Cache JavaScript and CSS files
registerRoute(
  /\.(?:js|css)$/,
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Network first strategy for HTML documents
registerRoute(
  /\.(?:html)$/,
  new NetworkFirst({
    cacheName: 'html-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24, // 1 day
      }),
    ],
  })
);

// Install event - enhanced with better error handling
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Skip waiting to activate immediately
      self.skipWaiting(),
      // Initialize caches
      caches.open(STATIC_CACHE),
      caches.open(DYNAMIC_CACHE)
    ]).then(() => {
      console.log('Service Worker installed successfully');
    }).catch((error) => {
      console.error('Service Worker installation failed:', error);
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('fastmath-') && 
                     cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE;
            })
            .map((cacheName) => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker activated successfully');
    }).catch((error) => {
      console.error('Service Worker activation failed:', error);
    })
  );
});

// Enhanced fetch event with offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Try to serve from cache when network fails
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Fallback for HTML requests
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
          
          // Generic offline response
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Background sync for statistics
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'statistics-sync') {
    event.waitUntil(syncStatistics());
  }
});

async function syncStatistics() {
  try {
    // Get pending statistics from IndexedDB
    const pendingStats = await getPendingStatistics();
    
    if (pendingStats.length > 0) {
      // Send to analytics service (if implemented)
      await sendStatistics(pendingStats);
      
      // Clear pending statistics
      await clearPendingStatistics();
      
      console.log('Statistics synced successfully');
    }
  } catch (error) {
    console.error('Failed to sync statistics:', error);
  }
}

// Push notifications (for future enhancement)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time for your daily math practice!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'fastmath-reminder',
    renotify: true,
    actions: [
      {
        action: 'play',
        title: 'Start Game',
        icon: '/icons/shortcut-play.png'
      },
      {
        action: 'dismiss',
        title: 'Later',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('FastMath', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'play') {
    event.waitUntil(
      clients.openWindow('/?action=quick-game')
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Enhanced message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: self.__WB_MANIFEST || 'unknown',
    });
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      cacheUrls(event.data.payload || [])
    );
  }
});

// Helper function to cache specific URLs
async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  return Promise.all(
    urls.map(url => {
      return fetch(url).then(response => {
        if (response.status === 200) {
          return cache.put(url, response);
        }
      }).catch(err => console.log('Failed to cache', url, err));
    })
  );
}

// Helper functions for IndexedDB operations (placeholder implementations)
async function getPendingStatistics() {
  // Implementation would use IndexedDB to get pending statistics
  // For now, return empty array
  return [];
}

async function sendStatistics(stats) {
  // Implementation would send to analytics endpoint
  console.log('Would send statistics:', stats);
  return Promise.resolve();
}

async function clearPendingStatistics() {
  // Implementation would clear IndexedDB
  console.log('Cleared pending statistics');
  return Promise.resolve();
}