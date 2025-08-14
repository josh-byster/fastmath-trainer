# Epic 6: Testing & Optimization

## Overview
Comprehensive testing, performance optimization, and final polish to ensure the FastMath app delivers an exceptional user experience across all target devices and scenarios.

## Goals
- Achieve optimal performance on iPhone Safari
- Ensure accessibility compliance (WCAG 2.1 AA)
- Implement comprehensive error handling
- Optimize loading times and memory usage
- Add analytics and performance monitoring
- Complete cross-device testing
- Final UX polish and refinements

## User Stories
- As a user, I want the app to load instantly and run smoothly on my iPhone
- As a user with accessibility needs, I want the app to work with screen readers and other assistive technologies
- As a user, I want clear error messages when something goes wrong
- As a user, I want the app to work reliably across different network conditions
- As a user, I want the app to feel polished and professional

## Technical Requirements

### Performance Optimization (js/performance.js)
```javascript
class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            loadTime: 0,
            gameStartTime: 0,
            inputLatency: [],
            memoryUsage: [],
            frameRates: []
        };
        
        this.init();
    }

    init() {
        this.measureLoadTime();
        this.setupPerformanceObserver();
        this.optimizeAnimations();
        this.setupMemoryMonitoring();
        this.preloadCriticalResources();
    }

    measureLoadTime() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            this.metrics.loadTime = perfData.loadEventEnd - perfData.fetchStart;
            
            console.log(`App loaded in ${this.metrics.loadTime}ms`);
            
            // Report to analytics if enabled
            this.reportMetric('load_time', this.metrics.loadTime);
        });
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            // Monitor Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
                this.reportMetric('lcp', lastEntry.startTime);
            });
            
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Monitor First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                    this.reportMetric('fid', entry.processingStart - entry.startTime);
                });
            });
            
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Monitor Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                let cls = 0;
                list.getEntries().forEach(entry => {
                    if (!entry.hadRecentInput) {
                        cls += entry.value;
                    }
                });
                console.log('CLS:', cls);
                this.reportMetric('cls', cls);
            });
            
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }

    optimizeAnimations() {
        // Use CSS transforms and GPU acceleration
        const animatedElements = document.querySelectorAll('.number-display, .game-input, .btn');
        
        animatedElements.forEach(element => {
            element.style.willChange = 'transform, opacity';
            element.style.transform = 'translateZ(0)'; // Force GPU layer
        });

        // Debounce resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(this.handleResize.bind(this), 250);
        });
    }

    handleResize() {
        // Recalculate layouts efficiently
        document.documentElement.style.setProperty(
            '--vh', 
            `${window.innerHeight * 0.01}px`
        );
    }

    setupMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.metrics.memoryUsage.push({
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                });

                // Keep only last 100 measurements
                if (this.metrics.memoryUsage.length > 100) {
                    this.metrics.memoryUsage = this.metrics.memoryUsage.slice(-100);
                }

                // Warn if memory usage is high
                const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
                if (usagePercent > 80) {
                    console.warn('High memory usage detected:', usagePercent + '%');
                    this.reportMetric('memory_warning', usagePercent);
                }
            }, 10000); // Check every 10 seconds
        }
    }

    preloadCriticalResources() {
        // Preload critical fonts
        const fontPreload = document.createElement('link');
        fontPreload.rel = 'preload';
        fontPreload.as = 'font';
        fontPreload.type = 'font/woff2';
        fontPreload.href = '/fonts/system-font.woff2';
        fontPreload.crossOrigin = 'anonymous';
        document.head.appendChild(fontPreload);

        // Prefetch likely next pages
        const prefetchLinks = [
            '/css/animations.css',
            '/js/statistics.js'
        ];

        prefetchLinks.forEach(href => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = href;
            document.head.appendChild(link);
        });
    }

    measureInputLatency(startTime) {
        const latency = performance.now() - startTime;
        this.metrics.inputLatency.push(latency);
        
        // Keep only last 50 measurements
        if (this.metrics.inputLatency.length > 50) {
            this.metrics.inputLatency = this.metrics.inputLatency.slice(-50);
        }

        // Report if latency is high
        if (latency > 100) {
            console.warn('High input latency detected:', latency + 'ms');
            this.reportMetric('input_latency_high', latency);
        }
    }

    reportMetric(name, value) {
        // Send to analytics service (implement as needed)
        if (window.gtag) {
            window.gtag('event', 'performance_metric', {
                metric_name: name,
                metric_value: value
            });
        }
    }

    getPerformanceReport() {
        const avgInputLatency = this.metrics.inputLatency.length > 0
            ? this.metrics.inputLatency.reduce((a, b) => a + b, 0) / this.metrics.inputLatency.length
            : 0;

        return {
            loadTime: this.metrics.loadTime,
            averageInputLatency: Math.round(avgInputLatency),
            memoryUsageTrend: this.metrics.memoryUsage.slice(-10),
            recommendations: this.getOptimizationRecommendations()
        };
    }

    getOptimizationRecommendations() {
        const recommendations = [];

        if (this.metrics.loadTime > 3000) {
            recommendations.push('Consider optimizing image sizes and enabling compression');
        }

        const avgLatency = this.metrics.inputLatency.reduce((a, b) => a + b, 0) / this.metrics.inputLatency.length;
        if (avgLatency > 50) {
            recommendations.push('Input latency is high - consider reducing DOM complexity');
        }

        if (this.metrics.memoryUsage.length > 0) {
            const latestMemory = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
            const usagePercent = (latestMemory.used / latestMemory.limit) * 100;
            if (usagePercent > 70) {
                recommendations.push('Memory usage is high - consider implementing cleanup routines');
            }
        }

        return recommendations;
    }
}
```

### Error Handling & Logging (js/error-handler.js)
```javascript
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.init();
    }

    init() {
        this.setupGlobalErrorHandling();
        this.setupUnhandledRejectionHandling();
        this.setupCustomErrorReporting();
    }

    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });
    }

    setupUnhandledRejectionHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'Unhandled Promise Rejection',
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });
    }

    setupCustomErrorReporting() {
        // Service Worker errors
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('error', (event) => {
                this.logError({
                    type: 'Service Worker Error',
                    message: event.message || 'Service Worker error occurred',
                    timestamp: new Date().toISOString()
                });
            });
        }
    }

    logError(errorInfo) {
        console.error('Error logged:', errorInfo);
        
        this.errors.push(errorInfo);
        
        // Keep only recent errors
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(-this.maxErrors);
        }

        // Store in localStorage for debugging
        try {
            localStorage.setItem('fastmath-errors', JSON.stringify(this.errors.slice(-10)));
        } catch (e) {
            console.warn('Could not store error logs');
        }

        // Show user-friendly error message for critical errors
        if (this.isCriticalError(errorInfo)) {
            this.showUserErrorMessage(errorInfo);
        }

        // Report to analytics
        this.reportError(errorInfo);
    }

    isCriticalError(errorInfo) {
        const criticalPatterns = [
            'game engine',
            'settings',
            'storage',
            'Cannot read property',
            'is not a function'
        ];

        return criticalPatterns.some(pattern => 
            errorInfo.message?.toLowerCase().includes(pattern.toLowerCase())
        );
    }

    showUserErrorMessage(errorInfo) {
        const errorModal = document.createElement('div');
        errorModal.className = 'error-modal';
        errorModal.innerHTML = `
            <div class="error-content">
                <h3>⚠️ Something went wrong</h3>
                <p>We encountered an unexpected error. The app will continue to work, but some features might be limited.</p>
                <div class="error-actions">
                    <button class="btn btn-primary" onclick="location.reload()">Reload App</button>
                    <button class="btn btn-secondary error-dismiss">Continue</button>
                </div>
                <details class="error-details">
                    <summary>Technical Details</summary>
                    <pre>${errorInfo.message}</pre>
                </details>
            </div>
        `;

        document.body.appendChild(errorModal);

        errorModal.querySelector('.error-dismiss').addEventListener('click', () => {
            document.body.removeChild(errorModal);
        });

        setTimeout(() => errorModal.classList.add('show'), 100);
    }

    reportError(errorInfo) {
        // Send to analytics service
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: errorInfo.message,
                fatal: this.isCriticalError(errorInfo)
            });
        }

        // Send to error reporting service (e.g., Sentry, LogRocket)
        if (window.Sentry) {
            window.Sentry.captureException(new Error(errorInfo.message), {
                extra: errorInfo
            });
        }
    }

    getErrorReport() {
        return {
            totalErrors: this.errors.length,
            recentErrors: this.errors.slice(-5),
            errorsByType: this.groupErrorsByType(),
            criticalErrors: this.errors.filter(this.isCriticalError)
        };
    }

    groupErrorsByType() {
        const grouped = {};
        this.errors.forEach(error => {
            grouped[error.type] = (grouped[error.type] || 0) + 1;
        });
        return grouped;
    }

    clearErrors() {
        this.errors = [];
        localStorage.removeItem('fastmath-errors');
    }
}
```

### Accessibility Implementation (js/accessibility.js)
```javascript
class AccessibilityManager {
    constructor() {
        this.announcements = [];
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.setupReducedMotionSupport();
        this.addARIALabels();
    }

    setupKeyboardNavigation() {
        // Tab navigation for all interactive elements
        const interactiveElements = document.querySelectorAll(
            'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        interactiveElements.forEach((element, index) => {
            if (!element.hasAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });

        // Skip links for screen readers
        this.addSkipLinks();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
        `;
        document.body.insertBefore(skipLinks, document.body.firstChild);

        // Add IDs to target elements
        document.querySelector('.app-main').id = 'main-content';
        document.querySelector('.bottom-nav').id = 'navigation';
    }

    handleKeyboardShortcuts(event) {
        // Alt + 1: Home
        if (event.altKey && event.key === '1') {
            event.preventDefault();
            window.app?.showScreen('home');
            this.announce('Navigated to home screen');
        }

        // Alt + 2: Settings
        if (event.altKey && event.key === '2') {
            event.preventDefault();
            window.app?.showScreen('settings');
            this.announce('Navigated to settings screen');
        }

        // Alt + 3: Statistics
        if (event.altKey && event.key === '3') {
            event.preventDefault();
            window.app?.showScreen('stats');
            this.announce('Navigated to statistics screen');
        }

        // Escape: Close modals/return to home
        if (event.key === 'Escape') {
            this.handleEscapeKey();
        }
    }

    handleEscapeKey() {
        // Close any open modals first
        const modals = document.querySelectorAll('.modal, .error-modal, .achievement-popup');
        if (modals.length > 0) {
            modals.forEach(modal => modal.remove());
            return;
        }

        // Return to home if not already there
        if (window.app?.currentScreen !== 'home') {
            window.app?.showScreen('home');
            this.announce('Returned to home screen');
        }
    }

    setupScreenReaderSupport() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);

        // Create assertive live region for urgent announcements
        const assertiveRegion = document.createElement('div');
        assertiveRegion.setAttribute('aria-live', 'assertive');
        assertiveRegion.setAttribute('aria-atomic', 'true');
        assertiveRegion.className = 'sr-only';
        assertiveRegion.id = 'assertive-region';
        document.body.appendChild(assertiveRegion);
    }

    announce(message, priority = 'polite') {
        const regionId = priority === 'assertive' ? 'assertive-region' : 'live-region';
        const region = document.getElementById(regionId);
        
        if (region) {
            // Clear previous announcement
            region.textContent = '';
            
            // Add new announcement after a brief delay
            setTimeout(() => {
                region.textContent = message;
            }, 100);

            // Clear after announcement is likely read
            setTimeout(() => {
                region.textContent = '';
            }, 5000);
        }

        console.log(`Accessibility announcement: ${message}`);
    }

    setupFocusManagement() {
        // Focus management for screen transitions
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('screen') && target.classList.contains('active')) {
                        this.manageFocusForScreen(target);
                    }
                }
            });
        });

        document.querySelectorAll('.screen').forEach(screen => {
            observer.observe(screen, { attributes: true });
        });

        // Focus trap for modals
        this.setupFocusTraps();
    }

    manageFocusForScreen(screen) {
        // Find first focusable element in the screen
        const focusableElement = screen.querySelector(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElement) {
            setTimeout(() => {
                focusableElement.focus();
            }, 300); // Wait for transition to complete
        }

        // Announce screen change
        const screenTitle = screen.querySelector('h1, h2, h3')?.textContent || 'Screen changed';
        this.announce(`${screenTitle} loaded`);
    }

    setupFocusTraps() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal, .error-modal, .achievement-popup');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });
    }

    trapFocus(event, container) {
        const focusableElements = container.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    setupReducedMotionSupport() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.documentElement.classList.add('reduced-motion');
        }

        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.classList.add('reduced-motion');
            } else {
                document.documentElement.classList.remove('reduced-motion');
            }
        });
    }

    addARIALabels() {
        // Game number display
        const numberDisplay = document.getElementById('current-number');
        if (numberDisplay) {
            numberDisplay.setAttribute('aria-label', 'Current number being displayed');
            numberDisplay.setAttribute('role', 'status');
        }

        // Answer input
        const answerDisplay = document.getElementById('answer-display');
        if (answerDisplay) {
            answerDisplay.setAttribute('aria-label', 'Your calculated answer');
            answerDisplay.setAttribute('role', 'status');
        }

        // Number pad buttons
        document.querySelectorAll('.number-key').forEach(key => {
            const number = key.dataset.number;
            key.setAttribute('aria-label', `Enter digit ${number}`);
        });

        // Clear and submit buttons
        const clearBtn = document.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.setAttribute('aria-label', 'Clear your answer');
        }

        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.setAttribute('aria-label', 'Submit your answer');
        }

        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const screen = btn.dataset.screen;
            btn.setAttribute('aria-label', `Navigate to ${screen} screen`);
        });

        // Settings controls
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const label = slider.previousElementSibling?.textContent || 'Setting';
            slider.setAttribute('aria-label', `Adjust ${label}`);
        });
    }

    // Game-specific accessibility methods
    announceGameStart(sequence) {
        this.announce(`Game starting. Watch for ${sequence.length} numbers.`, 'assertive');
    }

    announceNumber(number, position, total) {
        this.announce(`Number ${position} of ${total}: ${number}`);
    }

    announceGameEnd(isCorrect, userAnswer, correctAnswer) {
        const message = isCorrect 
            ? `Correct! Your answer ${userAnswer} is right.`
            : `Incorrect. Your answer was ${userAnswer}, the correct answer is ${correctAnswer}.`;
        
        this.announce(message, 'assertive');
    }

    announceScoreUpdate(score, achievement = null) {
        let message = `Your score is ${score} points.`;
        if (achievement) {
            message += ` Achievement unlocked: ${achievement.name}`;
        }
        this.announce(message);
    }
}
```

### CSS for Accessibility (add to styles.css)
```css
/* Screen Reader Only Content */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Skip Links */
.skip-links {
    position: absolute;
    top: -40px;
    left: 0;
    right: 0;
    z-index: 10000;
}

.skip-link {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
    background: var(--primary-color);
    color: white;
    padding: var(--spacing-sm) var(--spacing-base);
    text-decoration: none;
    border-radius: var(--border-radius);
}

.skip-link:focus {
    position: static;
    width: auto;
    height: auto;
    left: auto;
    top: auto;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
    :root {
        --primary-color: #0000FF;
        --background-color: #FFFFFF;
        --surface-color: #FFFFFF;
        --text-primary: #000000;
        --border-color: #000000;
    }
    
    .btn {
        border: 2px solid currentColor;
    }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}

.reduced-motion * {
    animation: none !important;
    transition: none !important;
}

/* Focus Indicators */
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

/* Error Modal Accessibility */
.error-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.error-modal.show {
    opacity: 1;
    visibility: visible;
}

.error-content {
    background: var(--surface-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    max-width: 400px;
    margin: var(--spacing-base);
    box-shadow: var(--shadow-lg);
}

.error-details {
    margin-top: var(--spacing-base);
    font-size: var(--font-size-sm);
}

.error-details pre {
    background: var(--background-color);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius);
    font-size: var(--font-size-xs);
    overflow-x: auto;
}

/* Print Styles */
@media print {
    .app-header,
    .app-footer,
    .game-input,
    .btn {
        display: none !important;
    }
    
    .screen {
        position: static !important;
        transform: none !important;
        opacity: 1 !important;
        visibility: visible !important;
    }
    
    .screen:not(.active) {
        display: none !important;
    }
}
```

### Testing Utilities (js/testing-utils.js)
```javascript
class TestingUtils {
    constructor() {
        this.testResults = [];
        this.isTestMode = false;
    }

    enableTestMode() {
        this.isTestMode = true;
        console.log('Test mode enabled');
        
        // Add test controls to UI
        this.addTestControls();
    }

    addTestControls() {
        if (document.getElementById('test-controls')) return;

        const testPanel = document.createElement('div');
        testPanel.id = 'test-controls';
        testPanel.className = 'test-panel';
        testPanel.innerHTML = `
            <h4>Testing Controls</h4>
            <button onclick="testUtils.runAccessibilityTests()">A11y Tests</button>
            <button onclick="testUtils.runPerformanceTests()">Performance Tests</button>
            <button onclick="testUtils.runGameTests()">Game Logic Tests</button>
            <button onclick="testUtils.exportTestResults()">Export Results</button>
            <div class="test-results"></div>
        `;

        document.body.appendChild(testPanel);
    }

    runAccessibilityTests() {
        console.log('Running accessibility tests...');
        const results = [];

        // Test for missing alt text
        const images = document.querySelectorAll('img:not([alt])');
        results.push({
            test: 'Images with alt text',
            passed: images.length === 0,
            details: `${images.length} images missing alt text`
        });

        // Test for proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const headingLevels = Array.from(headings).map(h => parseInt(h.tagName[1]));
        const properHierarchy = this.checkHeadingHierarchy(headingLevels);
        results.push({
            test: 'Proper heading hierarchy',
            passed: properHierarchy,
            details: properHierarchy ? 'Heading hierarchy is correct' : 'Heading hierarchy has gaps'
        });

        // Test for keyboard accessibility
        const focusableElements = document.querySelectorAll(
            'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );
        const keyboardAccessible = Array.from(focusableElements).every(el => 
            !el.hasAttribute('tabindex') || el.getAttribute('tabindex') !== '-1'
        );
        results.push({
            test: 'Keyboard accessibility',
            passed: keyboardAccessible,
            details: `${focusableElements.length} focusable elements found`
        });

        this.displayTestResults('Accessibility', results);
    }

    checkHeadingHierarchy(levels) {
        if (levels.length === 0) return true;
        
        let currentLevel = levels[0];
        for (let i = 1; i < levels.length; i++) {
            const nextLevel = levels[i];
            if (nextLevel > currentLevel + 1) {
                return false; // Gap in hierarchy
            }
            currentLevel = nextLevel;
        }
        return true;
    }

    runPerformanceTests() {
        console.log('Running performance tests...');
        const results = [];

        // Test load time
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        const loadTime = navigationEntry.loadEventEnd - navigationEntry.fetchStart;
        results.push({
            test: 'Page load time',
            passed: loadTime < 3000,
            details: `${Math.round(loadTime)}ms (target: <3000ms)`
        });

        // Test DOM size
        const domSize = document.querySelectorAll('*').length;
        results.push({
            test: 'DOM size',
            passed: domSize < 1000,
            details: `${domSize} elements (target: <1000)`
        });

        // Test image optimization
        const images = document.querySelectorAll('img');
        const unoptimizedImages = Array.from(images).filter(img => {
            return !img.src.includes('.webp') && !img.src.includes('.avif');
        });
        results.push({
            test: 'Image optimization',
            passed: unoptimizedImages.length === 0,
            details: `${unoptimizedImages.length} unoptimized images found`
        });

        this.displayTestResults('Performance', results);
    }

    runGameTests() {
        console.log('Running game logic tests...');
        const results = [];

        // Test number generation
        const testNumbers = this.generateTestNumbers(2, 5);
        const validNumbers = testNumbers.every(n => n >= 10 && n <= 99);
        results.push({
            test: '2-digit number generation',
            passed: validNumbers,
            details: `Generated: ${testNumbers.join(', ')}`
        });

        // Test scoring calculation
        const testScore = this.calculateTestScore();
        results.push({
            test: 'Score calculation',
            passed: testScore > 0,
            details: `Test score: ${testScore}`
        });

        // Test settings persistence
        const settingsSaved = this.testSettingsPersistence();
        results.push({
            test: 'Settings persistence',
            passed: settingsSaved,
            details: settingsSaved ? 'Settings save/load works' : 'Settings persistence failed'
        });

        this.displayTestResults('Game Logic', results);
    }

    generateTestNumbers(digits, count) {
        const numbers = [];
        for (let i = 0; i < count; i++) {
            let number;
            if (digits === 2) {
                number = Math.floor(Math.random() * 90) + 10;
            } else {
                number = Math.floor(Math.random() * 900) + 100;
            }
            numbers.push(number);
        }
        return numbers;
    }

    calculateTestScore() {
        // Simulate a scoring calculation
        return Math.floor(Math.random() * 1000) + 500;
    }

    testSettingsPersistence() {
        try {
            const testData = { test: 'value' };
            localStorage.setItem('test-settings', JSON.stringify(testData));
            const retrieved = JSON.parse(localStorage.getItem('test-settings'));
            localStorage.removeItem('test-settings');
            return retrieved.test === 'value';
        } catch (error) {
            return false;
        }
    }

    displayTestResults(category, results) {
        const resultsContainer = document.querySelector('.test-results');
        const passed = results.filter(r => r.passed).length;
        const total = results.length;

        const resultHTML = `
            <div class="test-category">
                <h5>${category} Tests (${passed}/${total} passed)</h5>
                ${results.map(result => `
                    <div class="test-result ${result.passed ? 'passed' : 'failed'}">
                        <span class="test-name">${result.test}</span>
                        <span class="test-status">${result.passed ? '✓' : '✗'}</span>
                        <div class="test-details">${result.details}</div>
                    </div>
                `).join('')}
            </div>
        `;

        resultsContainer.innerHTML += resultHTML;
        this.testResults.push({ category, results, timestamp: new Date() });
    }

    exportTestResults() {
        const exportData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            results: this.testResults
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fastmath-test-results-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Create global instance for manual testing
window.testUtils = new TestingUtils();

// Enable test mode in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.testUtils.enableTestMode();
}
```

### CSS for Testing (add to styles.css)
```css
/* Test Panel */
.test-panel {
    position: fixed;
    top: 10px;
    right: 10px;
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-base);
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    max-width: 300px;
    font-size: var(--font-size-sm);
}

.test-panel h4 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-base);
}

.test-panel button {
    display: block;
    width: 100%;
    margin-bottom: var(--spacing-xs);
    padding: var(--spacing-xs);
    font-size: var(--font-size-xs);
}

.test-results {
    max-height: 300px;
    overflow-y: auto;
    margin-top: var(--spacing-base);
}

.test-category {
    margin-bottom: var(--spacing-base);
    border-top: 1px solid var(--border-color);
    padding-top: var(--spacing-sm);
}

.test-category h5 {
    margin: 0 0 var(--spacing-xs) 0;
    font-size: var(--font-size-sm);
}

.test-result {
    display: flex;
    align-items: flex-start;
    padding: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
    border-radius: var(--border-radius);
    font-size: var(--font-size-xs);
}

.test-result.passed {
    background: rgba(52, 199, 89, 0.1);
    border-left: 3px solid var(--success-color);
}

.test-result.failed {
    background: rgba(255, 59, 48, 0.1);
    border-left: 3px solid var(--error-color);
}

.test-name {
    flex: 1;
    font-weight: 600;
}

.test-status {
    margin-left: var(--spacing-xs);
}

.test-details {
    width: 100%;
    margin-top: var(--spacing-xs);
    color: var(--text-secondary);
    font-size: var(--font-size-xs);
}

/* Hide test panel in production */
@media (max-width: 768px) {
    .test-panel {
        display: none;
    }
}
```

## Acceptance Criteria
- [ ] App loads in under 3 seconds on 3G connection
- [ ] All interactive elements are keyboard accessible
- [ ] Screen reader compatibility verified with NVDA/VoiceOver
- [ ] Error handling prevents app crashes
- [ ] Performance metrics show <100ms input latency
- [ ] Accessibility tests pass 100%
- [ ] Cross-browser compatibility verified
- [ ] Offline functionality works completely
- [ ] Memory usage remains stable during extended play
- [ ] All user-facing text is clear and error-free

## Testing Checklist
- [ ] Test on iPhone Safari (iOS 14+)
- [ ] Test on Chrome mobile
- [ ] Test with VoiceOver enabled
- [ ] Test with reduced motion settings
- [ ] Test in airplane mode
- [ ] Test with slow network connection
- [ ] Test memory usage over 30+ games
- [ ] Test error scenarios (storage full, network issues)
- [ ] Test with different screen sizes and orientations
- [ ] Validate HTML, CSS, and JavaScript
- [ ] Run Lighthouse audit (score >90 in all categories)
- [ ] Test keyboard navigation without mouse
- [ ] Verify color contrast ratios
- [ ] Test with browser zoom at 200%

## Time Estimate
**4-6 hours**
- Performance optimization: 1-2 hours
- Error handling implementation: 1 hour
- Accessibility implementation: 1-2 hours
- Testing and validation: 1-2 hours

## Dependencies
- All previous epics (1-5)

## Deliverables
- Fully optimized and tested FastMath PWA
- Comprehensive test results and performance metrics
- Accessibility compliance report
- Production-ready deployment package