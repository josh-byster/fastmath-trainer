# Epic 1: Core UI Foundation

## Overview
Build the foundational HTML structure and responsive CSS framework for the FastMath app, optimized for iPhone Safari with mobile-first design principles.

## Goals
- Create semantic HTML5 structure
- Implement mobile-first responsive CSS
- Establish design system and UI components
- Ensure iPhone Safari compatibility

## User Stories
- As a user, I want the app to load quickly and look professional on my iPhone
- As a user, I want all interface elements to be easily tappable with my finger
- As a user, I want the app to work well in both portrait and landscape orientations

## Technical Requirements

### HTML Structure (`index.html`)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="FastMath">
    <title>FastMath - Mental Math Training</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/animations.css">
    <link rel="manifest" href="manifest.json">
</head>
<body>
    <!-- App Shell Structure -->
    <div id="app">
        <!-- Header with navigation -->
        <header class="app-header">
            <h1 class="app-title">FastMath</h1>
            <button class="settings-btn" aria-label="Settings">⚙️</button>
        </header>

        <!-- Main content area -->
        <main class="app-main">
            <!-- Home Screen -->
            <section id="home-screen" class="screen active">
                <div class="welcome-content">
                    <h2>Mental Math Training</h2>
                    <p>Train your mental arithmetic skills</p>
                    <button class="btn btn-primary btn-large">Start Game</button>
                    <button class="btn btn-secondary">View Statistics</button>
                </div>
            </section>

            <!-- Settings Screen -->
            <section id="settings-screen" class="screen">
                <h2>Game Settings</h2>
                <!-- Settings form will be added in Epic 2 -->
                <div class="settings-placeholder">
                    Settings panel coming soon...
                </div>
            </section>

            <!-- Game Screen -->
            <section id="game-screen" class="screen">
                <div class="game-container">
                    <div class="game-number-display">
                        <span id="current-number">--</span>
                    </div>
                    <div class="game-controls">
                        <!-- Game controls will be added in Epic 3 -->
                    </div>
                </div>
            </section>

            <!-- Results Screen -->
            <section id="results-screen" class="screen">
                <h2>Results</h2>
                <div class="results-content">
                    <!-- Results will be added in Epic 4 -->
                </div>
            </section>
        </main>

        <!-- Footer -->
        <footer class="app-footer">
            <nav class="bottom-nav">
                <button class="nav-btn active" data-screen="home">Home</button>
                <button class="nav-btn" data-screen="settings">Settings</button>
                <button class="nav-btn" data-screen="stats">Stats</button>
            </nav>
        </footer>
    </div>

    <script src="js/app.js" type="module"></script>
</body>
</html>
```

### CSS Framework (`css/styles.css`)

#### 1. CSS Custom Properties (Design System)
```css
:root {
    /* Colors */
    --primary-color: #007AFF;
    --secondary-color: #5856D6;
    --success-color: #34C759;
    --warning-color: #FF9500;
    --error-color: #FF3B30;
    --background-color: #F2F2F7;
    --surface-color: #FFFFFF;
    --text-primary: #000000;
    --text-secondary: #8E8E93;
    --border-color: #C6C6C8;

    /* Typography */
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-size-xs: 0.75rem;   /* 12px */
    --font-size-sm: 0.875rem;  /* 14px */
    --font-size-base: 1rem;    /* 16px */
    --font-size-lg: 1.125rem;  /* 18px */
    --font-size-xl: 1.25rem;   /* 20px */
    --font-size-2xl: 1.5rem;   /* 24px */
    --font-size-3xl: 2rem;     /* 32px */
    --font-size-4xl: 3rem;     /* 48px */

    /* Spacing */
    --spacing-xs: 0.25rem;     /* 4px */
    --spacing-sm: 0.5rem;      /* 8px */
    --spacing-base: 1rem;      /* 16px */
    --spacing-lg: 1.5rem;      /* 24px */
    --spacing-xl: 2rem;        /* 32px */
    --spacing-2xl: 3rem;       /* 48px */

    /* Layout */
    --border-radius: 8px;
    --border-radius-lg: 12px;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);

    /* Touch targets */
    --touch-target-min: 44px;
}
```

#### 2. Base Styles and Reset
```css
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: 1.5;
    color: var(--text-primary);
    background-color: var(--background-color);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    user-select: none; /* Prevent text selection on mobile */
    -webkit-touch-callout: none; /* Disable callout on iOS */
}

/* App layout */
#app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-width: 768px;
    margin: 0 auto;
}

.app-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-base);
    background-color: var(--surface-color);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 100;
}

.app-main {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.app-footer {
    background-color: var(--surface-color);
    border-top: 1px solid var(--border-color);
    padding: var(--spacing-sm) 0;
}
```

#### 3. Button Components
```css
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--touch-target-min);
    padding: var(--spacing-sm) var(--spacing-base);
    border: none;
    border-radius: var(--border-radius);
    font-family: inherit;
    font-size: var(--font-size-base);
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
}

.btn:active {
    transform: scale(0.98);
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: #0056CC;
}

.btn-secondary {
    background-color: var(--surface-color);
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
}

.btn-large {
    min-height: 56px;
    font-size: var(--font-size-lg);
    padding: var(--spacing-base) var(--spacing-xl);
}
```

#### 4. Screen Management
```css
.screen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: var(--spacing-base);
    opacity: 0;
    visibility: hidden;
    transform: translateX(100%);
    transition: all 0.3s ease;
}

.screen.active {
    opacity: 1;
    visibility: visible;
    transform: translateX(0);
}

.screen.exiting {
    transform: translateX(-100%);
}
```

#### 5. Navigation
```css
.bottom-nav {
    display: flex;
    justify-content: space-around;
    padding: 0 var(--spacing-base);
}

.nav-btn {
    flex: 1;
    background: none;
    border: none;
    padding: var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    min-height: var(--touch-target-min);
    transition: color 0.2s ease;
}

.nav-btn.active {
    color: var(--primary-color);
    font-weight: 600;
}
```

### Animation Framework (`css/animations.css`)
```css
/* Number display animations */
@keyframes numberFadeIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes numberFadeOut {
    from {
        opacity: 1;
        transform: scale(1);
    }
    to {
        opacity: 0;
        transform: scale(1.2);
    }
}

.number-enter {
    animation: numberFadeIn 0.2s ease-out;
}

.number-exit {
    animation: numberFadeOut 0.2s ease-in;
}

/* Loading animations */
@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.loading {
    animation: pulse 1.5s ease-in-out infinite;
}

/* Touch feedback */
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.ripple {
    position: relative;
    overflow: hidden;
}

.ripple::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.ripple:active::before {
    width: 300px;
    height: 300px;
}
```

### Basic JavaScript Module (`js/app.js`)
```javascript
// Basic app initialization and navigation
class App {
    constructor() {
        this.currentScreen = 'home';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showScreen('home');
    }

    setupEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.target.dataset.screen;
                this.showScreen(screen);
            });
        });

        // Settings button
        document.querySelector('.settings-btn').addEventListener('click', () => {
            this.showScreen('settings');
        });
    }

    showScreen(screenName) {
        // Hide current screen
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show new screen
        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }

        // Update active nav button
        const activeNavBtn = document.querySelector(`[data-screen="${screenName}"]`);
        if (activeNavBtn) {
            activeNavBtn.classList.add('active');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
```

## Acceptance Criteria
- [ ] HTML validates as HTML5
- [ ] Responsive design works on screens 320px-768px wide
- [ ] All touch targets are minimum 44px
- [ ] Navigation between screens works smoothly
- [ ] CSS follows mobile-first approach
- [ ] No horizontal scrolling on mobile devices
- [ ] App looks native-like on iPhone Safari
- [ ] Animations are smooth (60fps)
- [ ] Proper semantic HTML structure
- [ ] Accessible markup with ARIA labels

## Testing Checklist
- [ ] Test on iPhone Safari (primary)
- [ ] Test on Chrome mobile emulation
- [ ] Test portrait and landscape orientations
- [ ] Verify touch interactions work properly
- [ ] Check that text is readable without zooming
- [ ] Validate HTML and CSS
- [ ] Test with different font sizes
- [ ] Verify no layout breaking at different screen sizes

## Time Estimate
**8-12 hours**
- HTML structure: 2-3 hours
- CSS framework and components: 4-6 hours
- Basic JavaScript navigation: 1-2 hours
- Testing and refinements: 1-2 hours

## Dependencies
None - This is the foundation epic

## Next Epic
[Epic 2: Settings System](./02-settings-system.md) - Build upon this UI foundation to add configurable game settings.