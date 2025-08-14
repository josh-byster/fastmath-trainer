// Basic app initialization and navigation
class App {
    constructor() {
        this.currentScreen = 'home';
        this.isTransitioning = false;
        this.settingsManager = new SettingsManager();
        this.settingsUI = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('home');
        this.addRippleEffects();
        console.log('FastMath app initialized');
    }

    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const screen = e.target.dataset.screen;
                if (screen && screen !== this.currentScreen && !this.isTransitioning) {
                    this.showScreen(screen);
                }
            });
        });

        // Settings button
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.isTransitioning) {
                    this.showScreen('settings');
                }
            });
        }

        // Start Game button
        const startGameBtn = document.querySelector('.btn-primary');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.isTransitioning) {
                    this.showScreen('game');
                }
            });
        }

        // View Statistics button
        const statsBtn = document.querySelector('.btn-secondary');
        if (statsBtn) {
            statsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!this.isTransitioning) {
                    this.showScreen('stats');
                }
            });
        }

        // Prevent double-tap zoom on iOS
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Handle back button on Android/PWA
        window.addEventListener('popstate', (e) => {
            if (this.currentScreen !== 'home') {
                e.preventDefault();
                this.showScreen('home');
            }
        });
    }

    showScreen(screenName) {
        if (this.isTransitioning || screenName === this.currentScreen) {
            return;
        }

        this.isTransitioning = true;

        // Hide current screen
        const currentScreenEl = document.getElementById(`${this.currentScreen}-screen`);
        const targetScreenEl = document.getElementById(`${screenName}-screen`);

        if (!targetScreenEl) {
            console.warn(`Screen not found: ${screenName}`);
            this.isTransitioning = false;
            return;
        }

        // Update navigation state
        this.updateNavigation(screenName);

        // Perform screen transition
        if (currentScreenEl) {
            currentScreenEl.classList.add('exiting');
            currentScreenEl.classList.remove('active');
        }

        // Show new screen after a brief delay for smooth transition
        setTimeout(() => {
            if (currentScreenEl) {
                currentScreenEl.classList.remove('exiting');
            }
            
            targetScreenEl.classList.add('active');
            this.currentScreen = screenName;
            
            // Update browser history for PWA
            if (screenName !== 'home') {
                history.pushState({ screen: screenName }, '', `#${screenName}`);
            } else {
                history.pushState({ screen: 'home' }, '', '/');
            }

            // Screen-specific initialization
            this.initializeScreen(screenName);

            setTimeout(() => {
                this.isTransitioning = false;
            }, 300);
        }, 50);
    }

    updateNavigation(screenName) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Map screen names to nav button data-screen values
        let navScreen = screenName;
        if (screenName === 'results') navScreen = 'stats';
        if (screenName === 'game') navScreen = 'home'; // Game doesn't have nav button

        const activeNavBtn = document.querySelector(`[data-screen="${navScreen}"]`);
        if (activeNavBtn) {
            activeNavBtn.classList.add('active');
        }
    }

    initializeScreen(screenName) {
        // Screen-specific initialization logic
        switch (screenName) {
            case 'home':
                this.initializeHomeScreen();
                break;
            case 'settings':
                this.initializeSettingsScreen();
                break;
            case 'game':
                this.initializeGameScreen();
                break;
            case 'stats':
            case 'results':
                this.initializeStatsScreen();
                break;
        }
    }

    initializeHomeScreen() {
        // Animate welcome content
        const welcomeContent = document.querySelector('.welcome-content');
        if (welcomeContent) {
            welcomeContent.style.animation = 'fadeIn 0.5s ease-out';
        }
    }

    initializeSettingsScreen() {
        // Initialize settings UI when showing settings screen
        if (!this.settingsUI) {
            this.settingsUI = new SettingsUI(this.settingsManager);
        }
        console.log('Settings screen initialized');
    }

    initializeGameScreen() {
        // Game screen initialization (placeholder for Epic 3)
        console.log('Game screen initialized');
        
        // Demo: animate the number display
        const numberDisplay = document.getElementById('current-number');
        if (numberDisplay) {
            numberDisplay.classList.add('number-pop');
            setTimeout(() => {
                numberDisplay.classList.remove('number-pop');
            }, 300);
        }
    }

    initializeStatsScreen() {
        // Stats screen initialization (placeholder for Epic 4)
        console.log('Stats screen initialized');
    }

    addRippleEffects() {
        // Add ripple effect to buttons
        document.querySelectorAll('.btn, .nav-btn, .settings-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                // Add button press animation
                button.classList.add('btn-animate');
                setTimeout(() => {
                    button.classList.remove('btn-animate');
                }, 100);
            });

            // Add ripple effect on touch
            button.addEventListener('touchstart', (e) => {
                this.createRipple(e, button);
            });
        });
    }

    createRipple(event, element) {
        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;

        const rect = element.getBoundingClientRect();
        const x = event.touches ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
        const y = event.touches ? event.touches[0].clientY - rect.top : event.clientY - rect.top;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${x - radius}px`;
        circle.style.top = `${y - radius}px`;
        circle.classList.add('ripple-effect');

        // CSS for ripple effect
        circle.style.position = 'absolute';
        circle.style.borderRadius = '50%';
        circle.style.background = 'rgba(255, 255, 255, 0.6)';
        circle.style.transform = 'scale(0)';
        circle.style.animation = 'ripple 0.6s linear';
        circle.style.pointerEvents = 'none';

        // Ensure button is positioned relative
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        element.style.overflow = 'hidden';

        const existingRipple = element.querySelector('.ripple-effect');
        if (existingRipple) {
            existingRipple.remove();
        }

        element.appendChild(circle);

        // Remove ripple after animation
        setTimeout(() => {
            circle.remove();
        }, 600);
    }

    // Utility method to check if device is iOS
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    // Utility method to check if app is running as PWA
    isPWA() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }

    // Method to handle app installation prompt (for future PWA implementation)
    handleInstallPrompt() {
        // Will be implemented in Epic 5 (PWA)
        console.log('Install prompt handling ready for PWA implementation');
    }
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('FastMath Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('FastMath Unhandled Promise Rejection:', e.reason);
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new App();
        window.fastMathApp = window.app; // Keep backwards compatibility
    } catch (error) {
        console.error('Failed to initialize FastMath app:', error);
        
        // Fallback: show basic functionality
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                <h1>FastMath</h1>
                <p>Sorry, the app failed to initialize. Please refresh the page.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; background: #007AFF; color: white; border: none; border-radius: 8px;">
                    Refresh
                </button>
            </div>
        `;
    }
});

// App is available globally as window.fastMathApp