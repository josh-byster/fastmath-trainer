export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export class PWAInstallManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private isStandalone = false;

  constructor() {
    this.init();
  }

  private init() {
    this.checkInstallStatus();
    this.bindInstallEvents();
    this.handleShortcuts();
  }

  private checkInstallStatus() {
    // Check if running in standalone mode
    // Guard against environments where matchMedia is not available (like Jest)
    let isStandaloneFromMatchMedia = false;
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        isStandaloneFromMatchMedia = mediaQuery && mediaQuery.matches;
      } catch (error) {
        // Ignore errors in test environments
        isStandaloneFromMatchMedia = false;
      }
    }

    this.isStandalone =
      isStandaloneFromMatchMedia ||
      (typeof window !== 'undefined' && (window.navigator as any).standalone) ||
      (typeof document !== 'undefined' &&
        document.referrer.includes('android-app://'));

    // Check if app is already installed
    this.isInstalled = this.isStandalone;

    // Update UI based on install status
    this.updateInstallUI();
  }

  private bindInstallEvents() {
    // Guard against environments where these events are not available
    if (typeof window === 'undefined') return;

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
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

    // No longer auto-create install button - will be handled by HomeScreen
  }

  private updateInstallUI() {
    // Update any install prompts or banners
    this.updateInstallBanner();
  }

  private updateInstallBanner() {
    // iOS-specific install instructions
    if (this.isIOSSafari() && !this.isInstalled) {
      this.showIOSInstallBanner();
    }
  }

  private isIOSSafari(): boolean {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return (
      /iphone|ipad|ipod/.test(userAgent) &&
      /safari/.test(userAgent) &&
      !/crios|fxios/.test(userAgent)
    );
  }

  private showIOSInstallBanner() {
    // Only show once per session
    if (sessionStorage.getItem('ios-install-shown')) {
      return;
    }

    const banner = document.createElement('div');
    banner.className = 'ios-install-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'ios-install-title');
    banner.innerHTML = `
      <div class="banner-content">
        <div class="banner-text">
          <strong id="ios-install-title">Install FastMath</strong>
          <p>Tap <span class="share-icon" aria-label="share button">⎋</span> then "Add to Home Screen"</p>
        </div>
        <button class="banner-close" aria-label="Close install banner">×</button>
      </div>
    `;

    document.body.appendChild(banner);

    banner.querySelector('.banner-close')?.addEventListener('click', () => {
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
      console.log(
        'Install prompt not available. Showing manual install instructions.'
      );
      this.showManualInstallInstructions();
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

  private showManualInstallInstructions() {
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';

    if (/chrome|chromium|crios/.test(userAgent)) {
      instructions =
        'To install this app:\n1. Click the menu (⋮) in Chrome\n2. Select "Install FastMath"\n3. Click "Install" in the dialog';
    } else if (/firefox|fxios/.test(userAgent)) {
      instructions =
        'To install this app:\n1. Click the menu (☰) in Firefox\n2. Select "Install this site as an app"\n3. Follow the prompts';
    } else if (/safari/.test(userAgent)) {
      instructions =
        'To add to home screen:\n1. Tap the Share button (⬆️)\n2. Select "Add to Home Screen"\n3. Tap "Add"';
    } else {
      instructions =
        'To install this app, look for an "Install" or "Add to Home Screen" option in your browser menu.';
    }

    alert(instructions);
  }

  private showInstallSuccess() {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
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

  private handleShortcuts() {
    // Guard against environments where window is not available
    if (typeof window === 'undefined') return;

    // Handle app shortcuts from manifest
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    if (action === 'quick-game') {
      // Start a game with default settings
      setTimeout(() => {
        const event = new CustomEvent('pwa-shortcut', {
          detail: { action: 'quick-game' },
        });
        window.dispatchEvent(event);
      }, 1000);
    } else if (action === 'stats') {
      // Show statistics
      setTimeout(() => {
        const event = new CustomEvent('pwa-shortcut', {
          detail: { action: 'stats' },
        });
        window.dispatchEvent(event);
      }, 500);
    }
  }

  // Public methods for service worker integration
  showUpdateAvailable() {
    // Guard against environments where document is not available
    if (typeof document === 'undefined') return;

    const updateBar = document.createElement('div');
    updateBar.className = 'update-notification';
    updateBar.setAttribute('role', 'banner');
    updateBar.setAttribute('aria-labelledby', 'update-title');
    updateBar.innerHTML = `
      <div class="update-content">
        <span id="update-title">A new version is available!</span>
        <button class="update-btn" aria-label="Update the app">Update</button>
        <button class="dismiss-btn" aria-label="Dismiss update notification">×</button>
      </div>
    `;

    document.body.appendChild(updateBar);

    updateBar.querySelector('.update-btn')?.addEventListener('click', () => {
      // Tell service worker to skip waiting
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          action: 'SKIP_WAITING',
        });
      }
      document.body.removeChild(updateBar);
    });

    updateBar.querySelector('.dismiss-btn')?.addEventListener('click', () => {
      document.body.removeChild(updateBar);
    });

    setTimeout(() => updateBar.classList.add('show'), 100);
  }

  showUpdateNotification() {
    // Guard against environments where document is not available
    if (typeof document === 'undefined') return;

    // Simple notification that app has been updated
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');
    notification.textContent = 'App updated successfully!';
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  // Utility methods
  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  isRunningStandalone(): boolean {
    return this.isStandalone;
  }

  canInstall(): boolean {
    // Allow installation if not already installed, even without deferred prompt
    const canInstall = !this.isInstalled && !this.isStandalone;
    console.log('PWA canInstall check:', {
      deferredPrompt: !!this.deferredPrompt,
      isInstalled: this.isInstalled,
      isStandalone: this.isStandalone,
      canInstall,
    });
    return canInstall;
  }

  destroy() {
    // Clean up DOM elements
    // Remove any banners
    const banners = document.querySelectorAll(
      '.ios-install-banner, .update-notification'
    );
    banners.forEach((banner) => {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    });
  }
}
