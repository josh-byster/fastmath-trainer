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