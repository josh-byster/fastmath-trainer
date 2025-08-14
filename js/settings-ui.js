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
        alert('Preview functionality will be available in Epic 3 when the game engine is implemented.');
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