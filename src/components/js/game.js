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

        // Number input events
        document.querySelectorAll('.number-key').forEach(key => {
            key.addEventListener('click', (e) => {
                this.handleNumberInput(e.target.dataset.number);
            });
        });

        // Clear and submit buttons
        const clearBtn = document.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearInput();
            });
        }

        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitAnswer();
            });
        }

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // Play again button
        const playAgainBtn = document.querySelector('.play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.reset();
                this.ui.showScreen('home');
            });
        }
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
            
            // Update sequence indicator
            this.updateSequenceIndicator(i + 1, this.currentSequence.length);
            
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

    updateSequenceIndicator(current, total) {
        const currentPos = document.querySelector('.current-position');
        const totalNums = document.querySelector('.total-numbers');
        
        if (currentPos) currentPos.textContent = current;
        if (totalNums) totalNums.textContent = total;
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
        const gameInput = document.querySelector('.game-input');
        if (gameInput) {
            gameInput.classList.add('active');
        }
        
        const answerDisplay = document.getElementById('answer-display');
        if (answerDisplay) {
            answerDisplay.textContent = '';
        }
        
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
        }

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
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = this.userAnswer.length === 0;
        }
    }

    clearInput() {
        if (this.gameState !== 'input') return;

        this.userAnswer = '';
        this.updateAnswerDisplay();
        this.playSound('clear');
        this.triggerHaptic('medium');

        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
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
        const gameInput = document.querySelector('.game-input');
        if (gameInput) {
            gameInput.classList.remove('active');
        }

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
        const resultStatus = document.querySelector('.result-status');
        if (resultStatus) {
            resultStatus.textContent = isCorrect ? 'Correct!' : 'Incorrect';
            resultStatus.className = `result-status ${isCorrect ? 'correct' : 'incorrect'}`;
        }

        const userAnswerEl = document.querySelector('.user-answer');
        if (userAnswerEl) {
            userAnswerEl.textContent = userAnswer;
        }
        
        const correctAnswerEl = document.querySelector('.correct-answer');
        if (correctAnswerEl) {
            correctAnswerEl.textContent = this.correctSum;
        }
        
        const responseTimeEl = document.querySelector('.response-time');
        if (responseTimeEl) {
            responseTimeEl.textContent = `${(responseTime / 1000).toFixed(1)}s`;
        }
        
        const scoreDisplayEl = document.querySelector('.score-display');
        if (scoreDisplayEl) {
            scoreDisplayEl.textContent = score;
        }

        // Show sequence for review
        const sequenceReviewEl = document.querySelector('.sequence-review');
        if (sequenceReviewEl) {
            sequenceReviewEl.textContent = this.currentSequence.join(' + ') + ' = ' + this.correctSum;
        }
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
        const gameInput = document.querySelector('.game-input');
        if (gameInput) {
            gameInput.classList.remove('active');
        }
        
        const currentNumber = document.getElementById('current-number');
        if (currentNumber) {
            currentNumber.textContent = '--';
        }
        
        const answerDisplay = document.getElementById('answer-display');
        if (answerDisplay) {
            answerDisplay.textContent = '';
        }
    }
}