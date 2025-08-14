# Epic 2: Settings System

## Overview
Implement a comprehensive settings system that allows users to configure game parameters including timing, difficulty, and sequence length. Settings should be persistent across sessions and provide immediate visual feedback.

## Goals
- Create intuitive settings interface with sliders and toggles
- Implement settings persistence using Local Storage
- Provide real-time preview of settings changes
- Ensure settings validation and error handling

## User Stories
- As a user, I want to customize how long numbers appear on screen (500ms - 3000ms)
- As a user, I want to control the delay between numbers (100ms - 1000ms)
- As a user, I want to choose between 2-digit and 3-digit numbers
- As a user, I want to set how many numbers appear in a sequence (3-10)
- As a user, I want my settings to be remembered between app sessions
- As a user, I want to see a preview of how my settings will affect the game

## Technical Requirements

### Settings Data Model
```javascript
// js/settings.js
class SettingsManager {
    constructor() {
        this.settings = {
            timeOnScreen: 1000,        // milliseconds (500-3000)
            timeBetween: 300,          // milliseconds (100-1000)
            digitCount: 2,             // 2 or 3 digits
            sequenceLength: 5,         // numbers in sequence (3-10)
            difficulty: 'medium',      // calculated field
            soundEnabled: true,        // audio feedback
            hapticEnabled: true        // vibration feedback
        };
        
        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem('fastmath-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
        this.validate();
    }

    save() {
        try {
            localStorage.setItem('fastmath-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    validate() {
        // Ensure values are within valid ranges
        this.settings.timeOnScreen = Math.max(500, Math.min(3000, this.settings.timeOnScreen));
        this.settings.timeBetween = Math.max(100, Math.min(1000, this.settings.timeBetween));
        this.settings.digitCount = [2, 3].includes(this.settings.digitCount) ? this.settings.digitCount : 2;
        this.settings.sequenceLength = Math.max(3, Math.min(10, this.settings.sequenceLength));
    }

    get(key) {
        return this.settings[key];
    }

    set(key, value) {
        this.settings[key] = value;
        this.validate();
        this.save();
        this.calculateDifficulty();
    }

    calculateDifficulty() {
        // Calculate difficulty based on current settings
        const timeScore = (3000 - this.settings.timeOnScreen) / 2500; // 0-1
        const digitScore = this.settings.digitCount === 3 ? 0.5 : 0;
        const lengthScore = (this.settings.sequenceLength - 3) / 7; // 0-1
        
        const difficultyScore = (timeScore + digitScore + lengthScore) / 2.5;
        
        if (difficultyScore < 0.3) this.settings.difficulty = 'easy';
        else if (difficultyScore < 0.7) this.settings.difficulty = 'medium';
        else this.settings.difficulty = 'hard';
    }

    getAll() {
        return { ...this.settings };
    }
}
```

### Settings UI Components

#### HTML Structure (add to settings screen)
```html
<!-- Replace settings-placeholder in index.html -->
<div class="settings-container">
    <div class="settings-section">
        <h3>Timing Settings</h3>
        
        <div class="setting-item">
            <label for="time-on-screen">Time on Screen</label>
            <div class="slider-container">
                <input type="range" id="time-on-screen" 
                       min="500" max="3000" step="100" value="1000">
                <span class="slider-value">1000ms</span>
            </div>
            <div class="setting-description">
                How long each number is displayed
            </div>
        </div>

        <div class="setting-item">
            <label for="time-between">Time Between Numbers</label>
            <div class="slider-container">
                <input type="range" id="time-between" 
                       min="100" max="1000" step="50" value="300">
                <span class="slider-value">300ms</span>
            </div>
            <div class="setting-description">
                Pause between each number
            </div>
        </div>
    </div>

    <div class="settings-section">
        <h3>Difficulty Settings</h3>
        
        <div class="setting-item">
            <label for="digit-count">Number Type</label>
            <div class="toggle-group">
                <button class="toggle-btn active" data-value="2">2-Digit</button>
                <button class="toggle-btn" data-value="3">3-Digit</button>
            </div>
            <div class="setting-description">
                Choose between 2-digit (10-99) or 3-digit (100-999) numbers
            </div>
        </div>

        <div class="setting-item">
            <label for="sequence-length">Sequence Length</label>
            <div class="number-input-container">
                <button class="number-btn" data-action="decrease">−</button>
                <input type="number" id="sequence-length" 
                       min="3" max="10" value="5" readonly>
                <button class="number-btn" data-action="increase">+</button>
            </div>
            <div class="setting-description">
                How many numbers to show in each round
            </div>
        </div>
    </div>

    <div class="settings-section">
        <h3>Audio & Feedback</h3>
        
        <div class="setting-item">
            <label>Sound Effects</label>
            <div class="switch-container">
                <input type="checkbox" id="sound-enabled" checked>
                <label for="sound-enabled" class="switch"></label>
            </div>
        </div>

        <div class="setting-item">
            <label>Haptic Feedback</label>
            <div class="switch-container">
                <input type="checkbox" id="haptic-enabled" checked>
                <label for="haptic-enabled" class="switch"></label>
            </div>
        </div>
    </div>

    <div class="settings-section">
        <h3>Preview</h3>
        <div class="difficulty-indicator">
            <span class="difficulty-label">Current Difficulty:</span>
            <span class="difficulty-badge medium">Medium</span>
        </div>
        
        <button class="btn btn-secondary preview-btn">
            Preview Settings
        </button>
    </div>

    <div class="settings-actions">
        <button class="btn btn-secondary reset-btn">Reset to Defaults</button>
        <button class="btn btn-primary save-btn">Save & Start Game</button>
    </div>
</div>
```

#### CSS Styles (add to styles.css)
```css
/* Settings Container */
.settings-container {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--spacing-base);
}

.settings-section {
    background: var(--surface-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-base);
    box-shadow: var(--shadow);
}

.settings-section h3 {
    margin: 0 0 var(--spacing-lg) 0;
    color: var(--text-primary);
    font-size: var(--font-size-lg);
    font-weight: 600;
}

/* Setting Items */
.setting-item {
    margin-bottom: var(--spacing-lg);
}

.setting-item:last-child {
    margin-bottom: 0;
}

.setting-item label {
    display: block;
    margin-bottom: var(--spacing-sm);
    font-weight: 600;
    color: var(--text-primary);
}

.setting-description {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-top: var(--spacing-xs);
}

/* Sliders */
.slider-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-base);
}

.slider-container input[type="range"] {
    flex: 1;
    height: 6px;
    border-radius: 3px;
    background: var(--border-color);
    outline: none;
    -webkit-appearance: none;
}

.slider-container input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-container input[type="range"]::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--primary-color);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider-value {
    min-width: 80px;
    text-align: right;
    font-weight: 600;
    color: var(--primary-color);
}

/* Toggle Buttons */
.toggle-group {
    display: flex;
    border-radius: var(--border-radius);
    overflow: hidden;
    border: 1px solid var(--border-color);
}

.toggle-btn {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-base);
    border: none;
    background: var(--surface-color);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: var(--touch-target-min);
}

.toggle-btn.active {
    background: var(--primary-color);
    color: white;
}

.toggle-btn + .toggle-btn {
    border-left: 1px solid var(--border-color);
}

/* Number Input */
.number-input-container {
    display: flex;
    align-items: center;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
    width: fit-content;
}

.number-btn {
    width: var(--touch-target-min);
    height: var(--touch-target-min);
    border: none;
    background: var(--surface-color);
    color: var(--primary-color);
    font-size: var(--font-size-xl);
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.number-btn:hover {
    background: var(--background-color);
}

.number-btn:active {
    background: var(--primary-color);
    color: white;
}

#sequence-length {
    width: 60px;
    height: var(--touch-target-min);
    border: none;
    text-align: center;
    font-size: var(--font-size-lg);
    font-weight: 600;
    background: var(--surface-color);
}

/* Switches */
.switch-container {
    display: flex;
    align-items: center;
}

.switch-container input[type="checkbox"] {
    display: none;
}

.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
    background-color: var(--border-color);
    border-radius: 34px;
    transition: background-color 0.2s ease;
    cursor: pointer;
}

.switch::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 30px;
    height: 30px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.2s ease;
}

.switch-container input[type="checkbox"]:checked + .switch {
    background-color: var(--primary-color);
}

.switch-container input[type="checkbox"]:checked + .switch::before {
    transform: translateX(26px);
}

/* Difficulty Indicator */
.difficulty-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-base);
}

.difficulty-badge {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius);
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-transform: uppercase;
}

.difficulty-badge.easy {
    background: var(--success-color);
    color: white;
}

.difficulty-badge.medium {
    background: var(--warning-color);
    color: white;
}

.difficulty-badge.hard {
    background: var(--error-color);
    color: white;
}

/* Settings Actions */
.settings-actions {
    display: flex;
    gap: var(--spacing-base);
    margin-top: var(--spacing-xl);
}

.settings-actions .btn {
    flex: 1;
}

/* Preview Button */
.preview-btn {
    width: 100%;
    margin-bottom: var(--spacing-base);
}
```

### Settings Controller (js/settings-ui.js)
```javascript
// Settings UI controller
class SettingsUI {
    constructor(settingsManager) {
        this.settings = settingsManager;
        this.previewActive = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // Sliders
        document.getElementById('time-on-screen').addEventListener('input', (e) => {
            this.updateSetting('timeOnScreen', parseInt(e.target.value));
            this.updateSliderValue(e.target, e.target.value + 'ms');
        });

        document.getElementById('time-between').addEventListener('input', (e) => {
            this.updateSetting('timeBetween', parseInt(e.target.value));
            this.updateSliderValue(e.target, e.target.value + 'ms');
        });

        // Toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleToggle(e.target);
            });
        });

        // Number input buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleNumberButton(e.target);
            });
        });

        // Switches
        document.getElementById('sound-enabled').addEventListener('change', (e) => {
            this.updateSetting('soundEnabled', e.target.checked);
        });

        document.getElementById('haptic-enabled').addEventListener('change', (e) => {
            this.updateSetting('hapticEnabled', e.target.checked);
        });

        // Action buttons
        document.querySelector('.preview-btn').addEventListener('click', () => {
            this.showPreview();
        });

        document.querySelector('.reset-btn').addEventListener('click', () => {
            this.resetToDefaults();
        });

        document.querySelector('.save-btn').addEventListener('click', () => {
            this.saveAndStartGame();
        });
    }

    updateSetting(key, value) {
        this.settings.set(key, value);
        this.updateDifficultyIndicator();
    }

    updateSliderValue(slider, text) {
        const valueSpan = slider.parentNode.querySelector('.slider-value');
        if (valueSpan) {
            valueSpan.textContent = text;
        }
    }

    handleToggle(button) {
        const group = button.parentNode;
        const value = parseInt(button.dataset.value);
        
        // Update UI
        group.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Update setting
        this.updateSetting('digitCount', value);
    }

    handleNumberButton(button) {
        const action = button.dataset.action;
        const input = document.getElementById('sequence-length');
        let value = parseInt(input.value);

        if (action === 'increase' && value < 10) {
            value++;
        } else if (action === 'decrease' && value > 3) {
            value--;
        }

        input.value = value;
        this.updateSetting('sequenceLength', value);
    }

    updateUI() {
        const settings = this.settings.getAll();

        // Update sliders
        document.getElementById('time-on-screen').value = settings.timeOnScreen;
        this.updateSliderValue(
            document.getElementById('time-on-screen'), 
            settings.timeOnScreen + 'ms'
        );

        document.getElementById('time-between').value = settings.timeBetween;
        this.updateSliderValue(
            document.getElementById('time-between'), 
            settings.timeBetween + 'ms'
        );

        // Update toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.toggle('active', 
                parseInt(btn.dataset.value) === settings.digitCount);
        });

        // Update number input
        document.getElementById('sequence-length').value = settings.sequenceLength;

        // Update switches
        document.getElementById('sound-enabled').checked = settings.soundEnabled;
        document.getElementById('haptic-enabled').checked = settings.hapticEnabled;

        this.updateDifficultyIndicator();
    }

    updateDifficultyIndicator() {
        const difficulty = this.settings.get('difficulty');
        const badge = document.querySelector('.difficulty-badge');
        
        badge.className = `difficulty-badge ${difficulty}`;
        badge.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }

    showPreview() {
        // Implementation for preview functionality
        // This will be enhanced in Epic 3 when game engine is ready
        console.log('Preview with settings:', this.settings.getAll());
    }

    resetToDefaults() {
        if (confirm('Reset all settings to defaults?')) {
            this.settings.settings = {
                timeOnScreen: 1000,
                timeBetween: 300,
                digitCount: 2,
                sequenceLength: 5,
                difficulty: 'medium',
                soundEnabled: true,
                hapticEnabled: true
            };
            this.settings.save();
            this.updateUI();
        }
    }

    saveAndStartGame() {
        // Navigate to game screen
        if (window.app) {
            window.app.showScreen('home');
        }
    }
}
```

### Integration with Main App (update js/app.js)
```javascript
// Add to App class constructor
constructor() {
    this.currentScreen = 'home';
    this.settingsManager = new SettingsManager();
    this.settingsUI = null;
    this.init();
}

// Update showScreen method
showScreen(screenName) {
    // ... existing code ...

    // Initialize settings UI when showing settings screen
    if (screenName === 'settings' && !this.settingsUI) {
        this.settingsUI = new SettingsUI(this.settingsManager);
    }
}
```

## Acceptance Criteria
- [ ] All settings persist between app sessions
- [ ] Slider interactions feel smooth and responsive
- [ ] Toggle buttons provide clear visual feedback
- [ ] Number inputs prevent invalid values
- [ ] Switches work properly on touch devices
- [ ] Difficulty indicator updates in real-time
- [ ] Reset functionality works correctly
- [ ] Settings validation prevents invalid values
- [ ] UI is accessible with proper ARIA labels
- [ ] Touch targets meet 44px minimum requirement

## Testing Checklist
- [ ] Test settings persistence (close/reopen app)
- [ ] Verify all sliders work across their full range
- [ ] Test toggle and switch interactions
- [ ] Check number input boundaries (3-10)
- [ ] Verify difficulty calculation is correct
- [ ] Test reset functionality
- [ ] Validate on different screen sizes
- [ ] Test with accessibility features enabled
- [ ] Verify localStorage error handling
- [ ] Test settings export/import (if needed)

## Time Estimate
**6-8 hours**
- Settings data model: 1-2 hours
- UI components and styling: 3-4 hours
- Event handling and validation: 1-2 hours
- Testing and refinements: 1 hour

## Dependencies
- Epic 1: Core UI Foundation (for base styles and navigation)

## Next Epic
[Epic 3: Game Engine](./03-game-engine.md) - Use these settings to control game behavior and number display timing.