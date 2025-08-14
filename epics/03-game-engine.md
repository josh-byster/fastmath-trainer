# Epic 3: Game Engine

## Overview
Build the core game engine that generates number sequences, manages timing, displays numbers with smooth animations, and handles user input for mental math calculations.

## Goals
- Generate random numbers based on settings (2-digit or 3-digit)
- Display number sequences with precise timing control
- Create smooth, engaging animations for number transitions
- Handle user input and validation
- Manage game state and flow
- Provide audio and haptic feedback

## User Stories
- As a user, I want to see numbers flash on screen at my configured timing
- As a user, I want smooth animations that don't distract from the math
- As a user, I want to enter my answer using a numeric keypad
- As a user, I want immediate feedback on whether my answer is correct
- As a user, I want audio cues to help me focus during the sequence
- As a user, I want the game to feel responsive and engaging

## Technical Requirements

### Game Engine Core (js/game.js)
```javascript
class GameEngine {
    constructor(settingsManager, uiController) {
        this.settings = settingsManager;
        this.ui = uiController;
        this.currentSequence = [];
        this.currentIndex = 0;
        this.gameState = 'idle'; // idle, playing, input, finished
        this.startTime = null;
        this.endTime = null;
        this.userAnswer = '';
        this.correctSum = 0;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAudioContext();
    }

    bindEvents() {
        // Start game button
        document.querySelector('.btn-primary').addEventListener('click', () => {
            this.startGame();
        });

        // Number input events
        document.querySelectorAll('.number-key').forEach(key => {
            key.addEventListener('click', (e) => {
                this.handleNumberInput(e.target.dataset.number);
            });
        });

        // Clear and submit buttons
        document.querySelector('.clear-btn').addEventListener('click', () => {
            this.clearInput();
        });

        document.querySelector('.submit-btn').addEventListener('click', () => {
            this.submitAnswer();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    generateSequence() {
        const { digitCount, sequenceLength } = this.settings.getAll();
        this.currentSequence = [];
        
        for (let i = 0; i < sequenceLength; i++) {
            let number;
            if (digitCount === 2) {
                number = Math.floor(Math.random() * 90) + 10; // 10-99
            } else {
                number = Math.floor(Math.random() * 900) + 100; // 100-999
            }
            this.currentSequence.push(number);
        }

        this.correctSum = this.currentSequence.reduce((sum, num) => sum + num, 0);
        console.log('Generated sequence:', this.currentSequence, 'Sum:', this.correctSum);
    }

    async startGame() {
        if (this.gameState !== 'idle') return;

        this.gameState = 'playing';
        this.currentIndex = 0;
        this.userAnswer = '';
        this.startTime = Date.now();

        // Generate new sequence
        this.generateSequence();

        // Switch to game screen
        this.ui.showScreen('game');
        
        // Show get ready message
        await this.showMessage('Get Ready...', 1500);
        await this.delay(500);

        // Play sequence
        await this.playSequence();

        // Switch to input mode
        this.gameState = 'input';
        this.showInputInterface();
    }

    async playSequence() {
        const { timeOnScreen, timeBetween } = this.settings.getAll();

        for (let i = 0; i < this.currentSequence.length; i++) {
            this.currentIndex = i;
            
            // Play sound cue
            this.playSound('number');
            
            // Show number with animation
            await this.displayNumber(this.currentSequence[i], timeOnScreen);
            
            // Pause between numbers (except after last number)
            if (i < this.currentSequence.length - 1) {
                await this.hideNumber();
                await this.delay(timeBetween);
            }
        }

        // Hide last number
        await this.hideNumber();
    }

    async displayNumber(number, duration) {
        const display = document.getElementById('current-number');
        const container = display.parentElement;

        // Update number
        display.textContent = number;

        // Animate in
        container.classList.add('number-showing');
        display.classList.add('number-enter');

        // Haptic feedback
        this.triggerHaptic('light');

        // Wait for display duration
        await this.delay(duration);
    }

    async hideNumber() {
        const display = document.getElementById('current-number');
        const container = display.parentElement;

        // Animate out
        display.classList.remove('number-enter');
        display.classList.add('number-exit');

        await this.delay(200); // Animation duration

        // Clean up
        container.classList.remove('number-showing');
        display.classList.remove('number-exit');
        display.textContent = '--';
    }

    async showMessage(text, duration = 2000) {
        const display = document.getElementById('current-number');
        const container = display.parentElement;

        display.textContent = text;
        container.classList.add('message-showing');

        await this.delay(duration);

        container.classList.remove('message-showing');
    }

    showInputInterface() {
        // Show input UI
        document.querySelector('.game-input').classList.add('active');
        document.getElementById('answer-display').textContent = '';
        document.querySelector('.submit-btn').disabled = true;

        // Update instruction
        this.showMessage('Enter the sum:', 1500);
    }

    handleNumberInput(digit) {
        if (this.gameState !== 'input') return;

        // Prevent overly long answers
        if (this.userAnswer.length >= 6) return;

        this.userAnswer += digit;
        this.updateAnswerDisplay();
        this.playSound('keypress');
        this.triggerHaptic('light');

        // Enable submit button when answer exists
        document.querySelector('.submit-btn').disabled = this.userAnswer.length === 0;
    }

    clearInput() {
        if (this.gameState !== 'input') return;

        this.userAnswer = '';
        this.updateAnswerDisplay();
        this.playSound('clear');
        this.triggerHaptic('medium');

        document.querySelector('.submit-btn').disabled = true;
    }

    updateAnswerDisplay() {
        const display = document.getElementById('answer-display');
        display.textContent = this.userAnswer || '0';

        // Add animation for feedback
        display.classList.remove('pulse');
        setTimeout(() => display.classList.add('pulse'), 10);
    }

    submitAnswer() {
        if (this.gameState !== 'input' || !this.userAnswer) return;

        this.endTime = Date.now();
        const responseTime = this.endTime - this.startTime;
        const userSum = parseInt(this.userAnswer);
        const isCorrect = userSum === this.correctSum;

        // Play feedback sound
        this.playSound(isCorrect ? 'correct' : 'incorrect');
        this.triggerHaptic(isCorrect ? 'success' : 'error');

        // Hide input interface
        document.querySelector('.game-input').classList.remove('active');

        // Show result and transition to results screen
        this.showResult(isCorrect, userSum, responseTime);
    }

    showResult(isCorrect, userAnswer, responseTime) {
        this.gameState = 'finished';

        // Calculate score (will be enhanced in Epic 4)
        const score = this.calculateBasicScore(isCorrect, responseTime);

        // Update results screen
        this.updateResultsScreen(isCorrect, userAnswer, score, responseTime);

        // Switch to results screen
        setTimeout(() => {
            this.ui.showScreen('results');
        }, 1000);
    }

    calculateBasicScore(isCorrect, responseTime) {
        if (!isCorrect) return 0;

        const baseScore = 100;
        const timeBonus = Math.max(0, 10000 - responseTime) / 100;
        return Math.round(baseScore + timeBonus);
    }

    updateResultsScreen(isCorrect, userAnswer, score, responseTime) {
        // Update results display
        document.querySelector('.result-status').textContent = 
            isCorrect ? 'Correct!' : 'Incorrect';
        document.querySelector('.result-status').className = 
            `result-status ${isCorrect ? 'correct' : 'incorrect'}`;

        document.querySelector('.user-answer').textContent = userAnswer;
        document.querySelector('.correct-answer').textContent = this.correctSum;
        document.querySelector('.response-time').textContent = 
            `${(responseTime / 1000).toFixed(1)}s`;
        document.querySelector('.score-display').textContent = score;

        // Show sequence for review
        document.querySelector('.sequence-review').textContent = 
            this.currentSequence.join(' + ') + ' = ' + this.correctSum;
    }

    handleKeyboard(event) {
        if (this.gameState !== 'input') return;

        const key = event.key;

        if (key >= '0' && key <= '9') {
            event.preventDefault();
            this.handleNumberInput(key);
        } else if (key === 'Backspace' || key === 'Delete') {
            event.preventDefault();
            if (this.userAnswer.length > 0) {
                this.userAnswer = this.userAnswer.slice(0, -1);
                this.updateAnswerDisplay();
                document.querySelector('.submit-btn').disabled = this.userAnswer.length === 0;
            }
        } else if (key === 'Enter') {
            event.preventDefault();
            if (this.userAnswer.length > 0) {
                this.submitAnswer();
            }
        } else if (key === 'Escape') {
            event.preventDefault();
            this.clearInput();
        }
    }

    setupAudioContext() {
        this.audioContext = null;
        this.sounds = {};

        // Initialize audio context on first user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.generateSounds();
            }
        }, { once: true });
    }

    generateSounds() {
        // Generate simple beep sounds for feedback
        this.sounds = {
            number: this.createTone(800, 0.1),
            keypress: this.createTone(600, 0.05),
            clear: this.createTone(400, 0.1),
            correct: this.createTone(1000, 0.3),
            incorrect: this.createTone(300, 0.5)
        };
    }

    createTone(frequency, duration) {
        return () => {
            if (!this.audioContext || !this.settings.get('soundEnabled')) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    playSound(type) {
        if (this.sounds[type]) {
            this.sounds[type]();
        }
    }

    triggerHaptic(intensity) {
        if (!this.settings.get('hapticEnabled')) return;

        // Use Vibration API where available
        if ('vibrate' in navigator) {
            const patterns = {
                light: [10],
                medium: [20],
                success: [10, 50, 10],
                error: [100, 50, 100]
            };
            navigator.vibrate(patterns[intensity] || patterns.light);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reset() {
        this.gameState = 'idle';
        this.currentSequence = [];
        this.currentIndex = 0;
        this.userAnswer = '';
        this.correctSum = 0;

        // Reset UI
        document.querySelector('.game-input').classList.remove('active');
        document.getElementById('current-number').textContent = '--';
        document.getElementById('answer-display').textContent = '';
    }
}
```

### Game UI Components

#### HTML Updates (add to game screen in index.html)
```html
<!-- Replace game-controls placeholder -->
<div class="game-controls">
    <div class="game-display-container">
        <div class="sequence-indicator">
            <span class="current-position">1</span> of <span class="total-numbers">5</span>
        </div>
    </div>
</div>

<!-- Add after game-container -->
<div class="game-input">
    <div class="answer-section">
        <label for="answer-display">Your Answer:</label>
        <div id="answer-display" class="answer-display">0</div>
    </div>

    <div class="number-pad">
        <button class="number-key" data-number="7">7</button>
        <button class="number-key" data-number="8">8</button>
        <button class="number-key" data-number="9">9</button>
        
        <button class="number-key" data-number="4">4</button>
        <button class="number-key" data-number="5">5</button>
        <button class="number-key" data-number="6">6</button>
        
        <button class="number-key" data-number="1">1</button>
        <button class="number-key" data-number="2">2</button>
        <button class="number-key" data-number="3">3</button>
        
        <button class="clear-btn">Clear</button>
        <button class="number-key" data-number="0">0</button>
        <button class="submit-btn" disabled>✓</button>
    </div>
</div>
```

#### HTML Updates (add to results screen)
```html
<!-- Replace results-content placeholder -->
<div class="results-content">
    <div class="result-header">
        <h2 class="result-status correct">Correct!</h2>
        <div class="score-container">
            <span class="score-label">Score:</span>
            <span class="score-display">150</span>
        </div>
    </div>

    <div class="result-details">
        <div class="answer-comparison">
            <div class="answer-item">
                <label>Your Answer:</label>
                <span class="user-answer">245</span>
            </div>
            <div class="answer-item">
                <label>Correct Answer:</label>
                <span class="correct-answer">245</span>
            </div>
        </div>

        <div class="performance-stats">
            <div class="stat-item">
                <label>Response Time:</label>
                <span class="response-time">3.2s</span>
            </div>
            <div class="stat-item">
                <label>Sequence:</label>
                <span class="sequence-review">45 + 67 + 89 + 44 = 245</span>
            </div>
        </div>
    </div>

    <div class="result-actions">
        <button class="btn btn-primary play-again-btn">Play Again</button>
        <button class="btn btn-secondary view-stats-btn">View Statistics</button>
    </div>
</div>
```

### CSS Styles (add to styles.css)
```css
/* Game Screen Styles */
.game-number-display {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    margin: var(--spacing-xl) 0;
    border-radius: var(--border-radius-lg);
    background: var(--surface-color);
    box-shadow: var(--shadow-lg);
    position: relative;
    overflow: hidden;
}

#current-number {
    font-size: var(--font-size-4xl);
    font-weight: bold;
    color: var(--primary-color);
    transition: all 0.3s ease;
}

.number-showing #current-number {
    font-size: 4rem;
}

.message-showing #current-number {
    font-size: var(--font-size-2xl);
    color: var(--text-secondary);
}

.sequence-indicator {
    position: absolute;
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.9);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius);
}

/* Game Input Interface */
.game-input {
    position: fixed;
    bottom: -100%;
    left: 0;
    right: 0;
    background: var(--surface-color);
    border-top: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    padding: var(--spacing-lg);
    transition: bottom 0.3s ease;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
    z-index: 1000;
}

.game-input.active {
    bottom: 0;
}

.answer-section {
    text-align: center;
    margin-bottom: var(--spacing-lg);
}

.answer-section label {
    display: block;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
}

.answer-display {
    font-size: var(--font-size-3xl);
    font-weight: bold;
    color: var(--primary-color);
    min-height: 1.2em;
    padding: var(--spacing-sm);
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    background: var(--background-color);
    transition: all 0.2s ease;
}

.answer-display.pulse {
    transform: scale(1.05);
    border-color: var(--primary-color);
}

/* Number Pad */
.number-pad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
    max-width: 300px;
    margin: 0 auto;
}

.number-key, .clear-btn, .submit-btn {
    height: 56px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    background: var(--surface-color);
    font-size: var(--font-size-xl);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
}

.number-key:active {
    background: var(--primary-color);
    color: white;
    transform: scale(0.95);
}

.clear-btn {
    background: var(--error-color);
    color: white;
    font-size: var(--font-size-base);
}

.clear-btn:active {
    background: #CC2E24;
}

.submit-btn {
    background: var(--success-color);
    color: white;
    font-size: var(--font-size-2xl);
}

.submit-btn:disabled {
    background: var(--border-color);
    color: var(--text-secondary);
    cursor: not-allowed;
}

.submit-btn:not(:disabled):active {
    background: #2CA94A;
}

/* Results Screen */
.result-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
}

.result-status {
    font-size: var(--font-size-3xl);
    font-weight: bold;
    margin-bottom: var(--spacing-base);
}

.result-status.correct {
    color: var(--success-color);
}

.result-status.incorrect {
    color: var(--error-color);
}

.score-container {
    font-size: var(--font-size-xl);
}

.score-display {
    font-weight: bold;
    color: var(--primary-color);
}

.result-details {
    background: var(--surface-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

.answer-comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
}

.answer-item {
    text-align: center;
}

.answer-item label {
    display: block;
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
}

.answer-item span {
    font-size: var(--font-size-xl);
    font-weight: bold;
}

.user-answer {
    color: var(--primary-color);
}

.correct-answer {
    color: var(--success-color);
}

.performance-stats .stat-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
}

.performance-stats .stat-item:last-child {
    margin-bottom: 0;
}

.sequence-review {
    font-family: monospace;
    font-size: var(--font-size-sm);
}

.result-actions {
    display: flex;
    gap: var(--spacing-base);
}

.result-actions .btn {
    flex: 1;
}
```

### Game Animations (add to animations.css)
```css
/* Number display animations */
@keyframes numberPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

.number-showing #current-number {
    animation: numberPulse 0.3s ease-out;
}

/* Input slide animations */
@keyframes slideUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes slideDown {
    from {
        transform: translateY(0);
        opacity: 1;
    }
    to {
        transform: translateY(100%);
        opacity: 0;
    }
}

.game-input.active {
    animation: slideUp 0.3s ease-out;
}

/* Button press feedback */
.number-key:active,
.clear-btn:active,
.submit-btn:not(:disabled):active {
    animation: buttonPress 0.1s ease-out;
}

@keyframes buttonPress {
    0% { transform: scale(1); }
    50% { transform: scale(0.95); }
    100% { transform: scale(1); }
}

/* Success/Error feedback */
@keyframes successFlash {
    0%, 100% { background-color: var(--success-color); }
    50% { background-color: #2CA94A; }
}

@keyframes errorFlash {
    0%, 100% { background-color: var(--error-color); }
    50% { background-color: #CC2E24; }
}

.success-feedback {
    animation: successFlash 0.5s ease-in-out;
}

.error-feedback {
    animation: errorFlash 0.5s ease-in-out;
}
```

## Acceptance Criteria
- [ ] Numbers generate correctly based on digit settings
- [ ] Timing controls work precisely (within 50ms tolerance)
- [ ] Animations are smooth and don't interfere with readability
- [ ] Number pad works on both touch and keyboard input
- [ ] Audio feedback plays appropriately when enabled
- [ ] Haptic feedback works on supported devices
- [ ] Game state management prevents invalid interactions
- [ ] Results screen shows accurate information
- [ ] Game can be played multiple times without issues
- [ ] Error handling prevents crashes during gameplay

## Testing Checklist
- [ ] Test with different timing settings (500ms - 3000ms)
- [ ] Verify 2-digit and 3-digit number generation
- [ ] Test sequence lengths from 3-10 numbers
- [ ] Check number pad responsiveness
- [ ] Test keyboard input functionality
- [ ] Verify audio on/off toggle
- [ ] Test haptic feedback on/off toggle
- [ ] Check answer validation edge cases
- [ ] Test rapid button presses
- [ ] Verify performance on slower devices

## Time Estimate
**10-14 hours**
- Game engine logic: 4-5 hours
- UI components and styling: 3-4 hours
- Animation system: 2-3 hours
- Audio and haptic feedback: 1-2 hours
- Testing and refinements: 2-3 hours

## Dependencies
- Epic 1: Core UI Foundation
- Epic 2: Settings System

## Next Epic
[Epic 4: Scoring & Statistics](./04-scoring-statistics.md) - Enhance the basic scoring with difficulty-based calculations and comprehensive statistics tracking.