# Epic 5: PWA Implementation

## Overview
Transform the FastMath app into a Progressive Web App (PWA) that can be installed on iPhone home screen, works offline, and provides a native-like experience with proper caching and background sync.

## Goals
- Create installable PWA with proper manifest
- Implement service worker for offline functionality
- Add "Add to Home Screen" prompt
- Optimize for iOS Safari PWA features
- Implement background sync for statistics
- Ensure fast loading with caching strategies
- Add proper splash screens and icons

## User Stories
- As a user, I want to install FastMath on my iPhone home screen like a native app
- As a user, I want the app to work even when I'm offline
- As a user, I want the app to load instantly after installation
- As a user, I want my statistics to sync when I come back online
- As a user, I want proper app icons and splash screens
- As a user, I want the app to feel indistinguishable from a native app

## Technical Requirements

### PWA Manifest (manifest.json)
```json
{
    "name": "FastMath - Mental Math Training",
    "short_name": "FastMath",
    "description": "Train your mental arithmetic skills with customizable number sequences",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#F2F2F7",
    "theme_color": "#007AFF",
    "orientation": "portrait-primary",
    "scope": "/",
    "lang": "en-US",
    "categories": ["education", "games", "productivity"],
    "screenshots": [
        {
            "src": "icons/screenshot-mobile.png",
            "sizes": "375x812",
            "type": "image/png",
            "platform": "mobile",
            "label": "FastMath game screen"
        },
        {
            "src": "icons/screenshot-wide.png",
            "sizes": "1024x768",
            "type": "image/png",
            "platform": "wide",
            "label": "FastMath settings screen"
        }
    ],
    "icons": [
        {
            "src": "icons/icon-72x72.png",
            "sizes": "72x72",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "icons/icon-96x96.png",
            "sizes": "96x96",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "icons/icon-128x128.png",
            "sizes": "128x128",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "icons/icon-144x144.png",
            "sizes": "144x144",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "icons/icon-152x152.png",
            "sizes": "152x152",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "icons/icon-384x384.png",
            "sizes": "384x384",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "icons/icon-192x192-maskable.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
        },
        {
            "src": "icons/icon-512x512-maskable.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
        }
    ],
    "shortcuts": [
        {
            "name": "Quick Game",
            "short_name": "Play",
            "description": "Start a game with default settings",
            "url": "/?action=quick-game",
            "icons": [
                {
                    "src": "icons/shortcut-play.png",
                    "sizes": "96x96"
                }
            ]
        },
        {
            "name": "Statistics",
            "short_name": "Stats",
            "description": "View your performance statistics",
            "url": "/?action=stats",
            "icons": [
                {
                    "src": "icons/shortcut-stats.png",
                    "sizes": "96x96"
                }
            ]
        }
    ]
}
```

### Service Worker (sw.js)
```javascript
const CACHE_NAME = 'fastmath-v1.0.0';
const STATIC_CACHE = 'fastmath-static-v1.0.0';
const DYNAMIC_CACHE = 'fastmath-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/animations.css',
    '/js/app.js',
    '/js/game.js',
    '/js/settings.js',
    '/js/scoring.js',
    '/js/statistics.js',
    '/js/storage.js',
    '/js/ui.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            return cacheName.startsWith('fastmath-') && 
                                   cacheName !== STATIC_CACHE && 
                                   cacheName !== DYNAMIC_CACHE;
                        })
                        .map(cacheName => {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
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
        cacheFirst(request)
            .catch(() => networkFirst(request))
            .catch(() => fallbackResponse(request))
    );
});

// Cache first strategy for static assets
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Network first strategy for dynamic content
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Fallback response for offline scenarios
function fallbackResponse(request) {
    if (request.destination === 'document') {
        return caches.match('/index.html');
    }
    
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
            'Content-Type': 'text/plain'
        })
    });
}

// Background sync for statistics
self.addEventListener('sync', event => {
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
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Time for your daily math practice!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'fastmath-reminder',
        renotify: true,
        actions: [
            {
                action: 'play',
                title: 'Start Game',
                icon: '/icons/action-play.png'
            },
            {
                action: 'dismiss',
                title: 'Later',
                icon: '/icons/action-dismiss.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('FastMath', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
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

// Helper functions for IndexedDB operations
async function getPendingStatistics() {
    // Implementation would use IndexedDB
    return [];
}

async function sendStatistics(stats) {
    // Implementation would send to analytics endpoint
    console.log('Would send statistics:', stats);
}

async function clearPendingStatistics() {
    // Implementation would clear IndexedDB
    console.log('Cleared pending statistics');
}
```

### PWA Installation Manager (js/pwa-install.js)
```javascript
class PWAInstallManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isStandalone = false;
        this.init();
    }

    init() {
        this.checkInstallStatus();
        this.registerServiceWorker();
        this.bindInstallEvents();
        this.handleShortcuts();
    }

    checkInstallStatus() {
        // Check if running in standalone mode
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone ||
                          document.referrer.includes('android-app://');

        // Check if app is already installed
        this.isInstalled = this.isStandalone;

        // Update UI based on install status
        this.updateInstallUI();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);

                // Check for updates
                registration.addEventListener('updatefound', () => {
                    this.handleServiceWorkerUpdate(registration);
                });

                // Listen for successful activation
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('New service worker activated');
                    this.showUpdateNotification();
                });

            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    handleServiceWorkerUpdate(registration) {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateAvailable(newWorker);
            }
        });
    }

    showUpdateAvailable(newWorker) {
        const updateBar = document.createElement('div');
        updateBar.className = 'update-notification';
        updateBar.innerHTML = `
            <div class="update-content">
                <span>A new version is available!</span>
                <button class="update-btn">Update</button>
                <button class="dismiss-btn">×</button>
            </div>
        `;

        document.body.appendChild(updateBar);

        updateBar.querySelector('.update-btn').addEventListener('click', () => {
            newWorker.postMessage({ action: 'SKIP_WAITING' });
            document.body.removeChild(updateBar);
        });

        updateBar.querySelector('.dismiss-btn').addEventListener('click', () => {
            document.body.removeChild(updateBar);
        });

        setTimeout(() => updateBar.classList.add('show'), 100);
    }

    showUpdateNotification() {
        // Simple notification that app has been updated
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.textContent = 'App updated successfully!';
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    bindInstallEvents() {
        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.updateInstallUI();
        });

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            this.isInstalled = true;
            this.deferredPrompt = null;
            this.updateInstallUI();
            this.showInstallSuccess();
        });

        // Create install button
        this.createInstallButton();
    }

    createInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.className = 'install-btn btn btn-primary';
        installBtn.innerHTML = '📱 Install App';
        installBtn.style.display = 'none';

        installBtn.addEventListener('click', () => {
            this.promptInstall();
        });

        // Add to header or appropriate location
        const header = document.querySelector('.app-header');
        if (header) {
            header.appendChild(installBtn);
        }

        this.installButton = installBtn;
    }

    updateInstallUI() {
        if (this.installButton) {
            if (this.deferredPrompt && !this.isInstalled) {
                this.installButton.style.display = 'inline-flex';
            } else {
                this.installButton.style.display = 'none';
            }
        }

        // Update any install prompts or banners
        this.updateInstallBanner();
    }

    updateInstallBanner() {
        // iOS-specific install instructions
        if (this.isIOSSafari() && !this.isInstalled) {
            this.showIOSInstallBanner();
        }
    }

    isIOSSafari() {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent) && 
               /safari/.test(userAgent) && 
               !/crios|fxios/.test(userAgent);
    }

    showIOSInstallBanner() {
        // Only show once per session
        if (sessionStorage.getItem('ios-install-shown')) {
            return;
        }

        const banner = document.createElement('div');
        banner.className = 'ios-install-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-text">
                    <strong>Install FastMath</strong>
                    <p>Tap <span class="share-icon">⎋</span> then "Add to Home Screen"</p>
                </div>
                <button class="banner-close">×</button>
            </div>
        `;

        document.body.appendChild(banner);

        banner.querySelector('.banner-close').addEventListener('click', () => {
            document.body.removeChild(banner);
            sessionStorage.setItem('ios-install-shown', 'true');
        });

        setTimeout(() => banner.classList.add('show'), 100);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (banner.parentNode) {
                banner.classList.remove('show');
                setTimeout(() => {
                    if (banner.parentNode) {
                        document.body.removeChild(banner);
                    }
                }, 300);
            }
        }, 10000);
    }

    async promptInstall() {
        if (!this.deferredPrompt) {
            return;
        }

        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log('Install prompt outcome:', outcome);
            
            if (outcome === 'accepted') {
                console.log('User accepted install prompt');
            } else {
                console.log('User dismissed install prompt');
            }
            
            this.deferredPrompt = null;
            this.updateInstallUI();
            
        } catch (error) {
            console.error('Install prompt failed:', error);
        }
    }

    showInstallSuccess() {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <strong>🎉 App Installed!</strong><br>
            FastMath is now available on your home screen
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 5000);
    }

    handleShortcuts() {
        // Handle app shortcuts from manifest
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');

        if (action === 'quick-game') {
            // Start a game with default settings
            setTimeout(() => {
                if (window.app && window.app.gameEngine) {
                    window.app.gameEngine.startGame();
                }
            }, 1000);
        } else if (action === 'stats') {
            // Show statistics
            setTimeout(() => {
                if (window.app) {
                    window.app.showScreen('stats');
                }
            }, 500);
        }
    }
}
```

### CSS for PWA Elements (add to styles.css)
```css
/* Install Button */
.install-btn {
    font-size: var(--font-size-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    min-height: auto;
}

/* iOS Install Banner */
.ios-install-banner {
    position: fixed;
    bottom: -100px;
    left: 0;
    right: 0;
    background: var(--primary-color);
    color: white;
    padding: var(--spacing-base);
    z-index: 1000;
    transition: bottom 0.3s ease;
}

.ios-install-banner.show {
    bottom: 0;
}

.banner-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
}

.banner-text strong {
    display: block;
    margin-bottom: var(--spacing-xs);
}

.banner-text p {
    margin: 0;
    font-size: var(--font-size-sm);
    opacity: 0.9;
}

.share-icon {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
}

.banner-close {
    background: none;
    border: none;
    color: white;
    font-size: var(--font-size-xl);
    cursor: pointer;
    padding: var(--spacing-xs);
    line-height: 1;
}

/* Update Notification */
.update-notification {
    position: fixed;
    top: -100px;
    left: 0;
    right: 0;
    background: var(--warning-color);
    color: white;
    padding: var(--spacing-base);
    z-index: 1000;
    transition: top 0.3s ease;
}

.update-notification.show {
    top: 0;
}

.update-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 600px;
    margin: 0 auto;
}

.update-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: var(--font-size-sm);
}

.dismiss-btn {
    background: none;
    border: none;
    color: white;
    font-size: var(--font-size-xl);
    cursor: pointer;
    padding: var(--spacing-xs);
    margin-left: var(--spacing-sm);
}

/* General Notifications */
.notification {
    position: fixed;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-base);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    transition: top 0.3s ease;
    text-align: center;
    min-width: 200px;
}

.notification.show {
    top: var(--spacing-lg);
}

.notification.success {
    border-color: var(--success-color);
    background: rgba(52, 199, 89, 0.1);
}

/* Standalone mode adjustments */
@media (display-mode: standalone) {
    .app-header {
        padding-top: env(safe-area-inset-top, var(--spacing-base));
    }
    
    .app-footer {
        padding-bottom: env(safe-area-inset-bottom, var(--spacing-sm));
    }
}
```

### HTML Updates (add to index.html head)
```html
<!-- PWA Meta Tags -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="FastMath">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-touch-fullscreen" content="yes">

<!-- Theme Colors -->
<meta name="theme-color" content="#007AFF">
<meta name="msapplication-TileColor" content="#007AFF">
<meta name="msapplication-navbutton-color" content="#007AFF">

<!-- Apple Touch Icons -->
<link rel="apple-touch-icon" sizes="152x152" href="icons/icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="icons/icon-180x180.png">

<!-- Splash Screens for iOS -->
<link rel="apple-touch-startup-image" href="icons/splash-2048x2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="icons/splash-1668x2224.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="icons/splash-1536x2048.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="icons/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="icons/splash-1242x2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="icons/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="icons/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
```

### Integration with Main App (update js/app.js)
```javascript
// Add to App class constructor
constructor() {
    this.currentScreen = 'home';
    this.settingsManager = new SettingsManager();
    this.settingsUI = null;
    this.pwaInstall = new PWAInstallManager(); // Add this line
    this.init();
}
```

## Acceptance Criteria
- [ ] App can be installed on iPhone home screen
- [ ] Works completely offline after initial load
- [ ] Service worker caches all necessary assets
- [ ] Install prompt appears appropriately
- [ ] iOS-specific install instructions shown on Safari
- [ ] App icons display correctly on home screen
- [ ] Splash screens work on iOS
- [ ] Updates are handled gracefully
- [ ] Shortcuts work from home screen
- [ ] Standalone mode styling is proper

## Testing Checklist
- [ ] Test installation on iPhone Safari
- [ ] Verify offline functionality
- [ ] Test service worker caching
- [ ] Check install prompt behavior
- [ ] Test iOS install banner
- [ ] Verify app icons and splash screens
- [ ] Test app shortcuts functionality
- [ ] Check update mechanism
- [ ] Test in airplane mode
- [ ] Verify standalone mode appearance

## Time Estimate
**6-8 hours**
- Manifest and icon creation: 2 hours
- Service worker implementation: 3-4 hours
- PWA install manager: 2 hours
- Testing and optimization: 1-2 hours

## Dependencies
- Epic 1: Core UI Foundation
- Epic 2: Settings System
- Epic 3: Game Engine
- Epic 4: Scoring & Statistics

## Next Epic
[Epic 6: Testing & Optimization](./06-testing-optimization.md) - Comprehensive testing, performance optimization, and final polish.