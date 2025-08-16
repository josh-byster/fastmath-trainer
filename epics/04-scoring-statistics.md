# Epic 4: Scoring & Statistics ✅ **COMPLETED**

## Overview
Implement a sophisticated scoring system based on difficulty factors and comprehensive statistics tracking to help users monitor their mental math progress over time.

**Status:** ✅ **COMPLETED** - All features implemented and integrated successfully.

## Goals
- Calculate scores based on multiple difficulty factors
- Track detailed performance statistics
- Provide meaningful progress visualization
- Implement achievement system for motivation
- Store historical data for trend analysis
- Export statistics for external analysis

## User Stories
- As a user, I want my score to reflect the actual difficulty of my game settings
- As a user, I want to see my improvement over time with charts and statistics
- As a user, I want to earn achievements for reaching milestones
- As a user, I want to compare my performance across different difficulty levels
- As a user, I want to see my best streaks and personal records
- As a user, I want to export my data to track progress externally

## Technical Requirements

### Scoring System (js/scoring.js)
```javascript
class ScoringSystem {
    constructor(settingsManager) {
        this.settings = settingsManager;
        this.difficultyWeights = {
            timeOnScreen: { min: 500, max: 3000, weight: 0.3 },
            timeBetween: { min: 100, max: 1000, weight: 0.1 },
            digitCount: { 2: 1.0, 3: 1.8, weight: 0.25 },
            sequenceLength: { min: 3, max: 10, weight: 0.25 },
            speedBonus: { weight: 0.1 }
        };
    }

    calculateScore(gameResult) {
        const {
            isCorrect,
            responseTime,
            sequence,
            settings,
            mistakes = 0
        } = gameResult;

        if (!isCorrect) {
            return {
                score: 0,
                breakdown: {
                    accuracy: 0,
                    difficulty: this.calculateDifficulty(settings),
                    speed: 0,
                    total: 0
                }
            };
        }

        const difficulty = this.calculateDifficulty(settings);
        const accuracy = this.calculateAccuracy(mistakes, sequence.length);
        const speed = this.calculateSpeedBonus(responseTime, settings);

        const baseScore = 1000;
        const totalScore = Math.round(baseScore * difficulty * accuracy * speed);

        return {
            score: totalScore,
            breakdown: {
                accuracy: Math.round(accuracy * 100),
                difficulty: Math.round(difficulty * 100),
                speed: Math.round(speed * 100),
                total: totalScore
            },
            multipliers: {
                difficulty,
                accuracy,
                speed
            }
        };
    }

    calculateDifficulty(settings) {
        const weights = this.difficultyWeights;
        
        // Time pressure (shorter = harder)
        const timeScore = this.normalizeInverse(
            settings.timeOnScreen,
            weights.timeOnScreen.min,
            weights.timeOnScreen.max
        ) * weights.timeOnScreen.weight;

        // Gap pressure (shorter = harder)
        const gapScore = this.normalizeInverse(
            settings.timeBetween,
            weights.timeBetween.min,
            weights.timeBetween.max
        ) * weights.timeBetween.weight;

        // Digit complexity
        const digitScore = (weights.digitCount[settings.digitCount] - 1) * weights.digitCount.weight;

        // Sequence length (more numbers = harder)
        const lengthScore = this.normalize(
            settings.sequenceLength,
            weights.sequenceLength.min,
            weights.sequenceLength.max
        ) * weights.sequenceLength.weight;

        return Math.max(0.1, 1 + timeScore + gapScore + digitScore + lengthScore);
    }

    calculateAccuracy(mistakes, totalNumbers) {
        if (mistakes === 0) return 1.0;
        const errorRate = mistakes / totalNumbers;
        return Math.max(0.1, 1 - errorRate * 0.5);
    }

    calculateSpeedBonus(responseTime, settings) {
        // Expected time based on sequence length and display time
        const sequenceTime = settings.sequenceLength * (settings.timeOnScreen + settings.timeBetween);
        const expectedThinkTime = Math.max(2000, sequenceTime * 0.5);
        const maxResponseTime = expectedThinkTime + 10000; // 10 second grace period

        if (responseTime > maxResponseTime) return 0.5;
        if (responseTime <= expectedThinkTime) return 1.2;

        // Linear scaling between expected time and max time
        const ratio = (maxResponseTime - responseTime) / (maxResponseTime - expectedThinkTime);
        return 0.5 + (0.7 * ratio);
    }

    normalize(value, min, max) {
        return Math.max(0, Math.min(1, (value - min) / (max - min)));
    }

    normalizeInverse(value, min, max) {
        return 1 - this.normalize(value, min, max);
    }

    getRankForScore(score) {
        const ranks = [
            { min: 0, max: 200, name: 'Beginner', color: '#8E8E93' },
            { min: 201, max: 500, name: 'Learning', color: '#007AFF' },
            { min: 501, max: 800, name: 'Improving', color: '#5856D6' },
            { min: 801, max: 1200, name: 'Skilled', color: '#FF9500' },
            { min: 1201, max: 1600, name: 'Expert', color: '#FF3B30' },
            { min: 1601, max: 2000, name: 'Master', color: '#34C759' },
            { min: 2001, max: Infinity, name: 'Grandmaster', color: '#FFD700' }
        ];

        return ranks.find(rank => score >= rank.min && score <= rank.max) || ranks[0];
    }
}
```

### Statistics Manager (js/statistics.js)
```javascript
class StatisticsManager {
    constructor() {
        this.stats = {
            totalGames: 0,
            correctGames: 0,
            totalScore: 0,
            bestScore: 0,
            currentStreak: 0,
            bestStreak: 0,
            averageResponseTime: 0,
            gameHistory: [],
            dailyStats: {},
            achievements: [],
            createdAt: new Date().toISOString()
        };
        
        this.load();
    }

    load() {
        try {
            const saved = localStorage.getItem('fastmath-statistics');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.stats = { ...this.stats, ...parsed };
                
                // Convert date strings back to Date objects
                this.stats.gameHistory = this.stats.gameHistory.map(game => ({
                    ...game,
                    timestamp: new Date(game.timestamp)
                }));
            }
        } catch (error) {
            console.warn('Failed to load statistics:', error);
        }
    }

    save() {
        try {
            localStorage.setItem('fastmath-statistics', JSON.stringify(this.stats));
        } catch (error) {
            console.error('Failed to save statistics:', error);
        }
    }

    recordGame(gameResult, scoreData) {
        const timestamp = new Date();
        const dateKey = timestamp.toISOString().split('T')[0];

        // Update basic stats
        this.stats.totalGames++;
        this.stats.totalScore += scoreData.score;

        if (gameResult.isCorrect) {
            this.stats.correctGames++;
            this.stats.currentStreak++;
            this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.currentStreak);
        } else {
            this.stats.currentStreak = 0;
        }

        if (scoreData.score > this.stats.bestScore) {
            this.stats.bestScore = scoreData.score;
        }

        // Update average response time
        const totalTime = this.stats.averageResponseTime * (this.stats.totalGames - 1) + gameResult.responseTime;
        this.stats.averageResponseTime = totalTime / this.stats.totalGames;

        // Add to game history
        const gameRecord = {
            timestamp,
            settings: { ...gameResult.settings },
            sequence: [...gameResult.sequence],
            userAnswer: gameResult.userAnswer,
            correctSum: gameResult.correctSum,
            isCorrect: gameResult.isCorrect,
            responseTime: gameResult.responseTime,
            score: scoreData.score,
            breakdown: { ...scoreData.breakdown }
        };

        this.stats.gameHistory.push(gameRecord);

        // Keep only last 1000 games
        if (this.stats.gameHistory.length > 1000) {
            this.stats.gameHistory = this.stats.gameHistory.slice(-1000);
        }

        // Update daily stats
        if (!this.stats.dailyStats[dateKey]) {
            this.stats.dailyStats[dateKey] = {
                games: 0,
                correct: 0,
                totalScore: 0,
                bestScore: 0,
                totalTime: 0
            };
        }

        const dayStats = this.stats.dailyStats[dateKey];
        dayStats.games++;
        dayStats.totalScore += scoreData.score;
        dayStats.totalTime += gameResult.responseTime;
        
        if (gameResult.isCorrect) {
            dayStats.correct++;
        }

        if (scoreData.score > dayStats.bestScore) {
            dayStats.bestScore = scoreData.score;
        }

        // Check for achievements
        this.checkAchievements(gameRecord);

        this.save();
    }

    checkAchievements(gameRecord) {
        const achievements = [
            {
                id: 'first_game',
                name: 'First Steps',
                description: 'Complete your first game',
                condition: () => this.stats.totalGames === 1
            },
            {
                id: 'perfect_score',
                name: 'Perfect!',
                description: 'Get a perfect accuracy score',
                condition: () => gameRecord.breakdown.accuracy === 100
            },
            {
                id: 'speed_demon',
                name: 'Speed Demon',
                description: 'Complete a game in under 2 seconds',
                condition: () => gameRecord.responseTime < 2000
            },
            {
                id: 'streak_5',
                name: 'On Fire',
                description: 'Get 5 correct answers in a row',
                condition: () => this.stats.currentStreak === 5
            },
            {
                id: 'streak_10',
                name: 'Unstoppable',
                description: 'Get 10 correct answers in a row',
                condition: () => this.stats.currentStreak === 10
            },
            {
                id: 'high_scorer',
                name: 'High Scorer',
                description: 'Score over 1500 points',
                condition: () => gameRecord.score >= 1500
            },
            {
                id: 'century',
                name: 'Centurion',
                description: 'Play 100 games',
                condition: () => this.stats.totalGames === 100
            }
        ];

        achievements.forEach(achievement => {
            if (!this.hasAchievement(achievement.id) && achievement.condition()) {
                this.unlockAchievement(achievement);
            }
        });
    }

    hasAchievement(achievementId) {
        return this.stats.achievements.some(a => a.id === achievementId);
    }

    unlockAchievement(achievement) {
        this.stats.achievements.push({
            ...achievement,
            unlockedAt: new Date().toISOString()
        });

        // Show achievement notification
        this.showAchievementNotification(achievement);
    }

    showAchievementNotification(achievement) {
        // Create achievement popup
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">🏆</div>
                <div class="achievement-text">
                    <h4>Achievement Unlocked!</h4>
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // Animate in
        setTimeout(() => popup.classList.add('show'), 100);

        // Remove after 3 seconds
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => document.body.removeChild(popup), 300);
        }, 3000);
    }

    getStatsSummary() {
        const accuracy = this.stats.totalGames > 0 
            ? (this.stats.correctGames / this.stats.totalGames) * 100 
            : 0;

        const averageScore = this.stats.totalGames > 0
            ? this.stats.totalScore / this.stats.totalGames
            : 0;

        return {
            totalGames: this.stats.totalGames,
            accuracy: Math.round(accuracy * 10) / 10,
            averageScore: Math.round(averageScore),
            bestScore: this.stats.bestScore,
            currentStreak: this.stats.currentStreak,
            bestStreak: this.stats.bestStreak,
            averageResponseTime: Math.round(this.stats.averageResponseTime),
            achievements: this.stats.achievements.length
        };
    }

    getRecentGames(count = 10) {
        return this.stats.gameHistory
            .slice(-count)
            .reverse()
            .map(game => ({
                timestamp: game.timestamp,
                score: game.score,
                isCorrect: game.isCorrect,
                responseTime: game.responseTime,
                difficulty: game.settings.digitCount === 3 ? 'Hard' : 'Medium'
            }));
    }

    getPerformanceTrends() {
        const last30Days = this.stats.gameHistory
            .filter(game => {
                const daysDiff = (Date.now() - game.timestamp.getTime()) / (1000 * 60 * 60 * 24);
                return daysDiff <= 30;
            });

        // Group by day
        const dailyPerformance = {};
        last30Days.forEach(game => {
            const dateKey = game.timestamp.toISOString().split('T')[0];
            if (!dailyPerformance[dateKey]) {
                dailyPerformance[dateKey] = {
                    games: 0,
                    totalScore: 0,
                    correct: 0
                };
            }
            
            dailyPerformance[dateKey].games++;
            dailyPerformance[dateKey].totalScore += game.score;
            if (game.isCorrect) dailyPerformance[dateKey].correct++;
        });

        return Object.entries(dailyPerformance)
            .map(([date, stats]) => ({
                date,
                averageScore: Math.round(stats.totalScore / stats.games),
                accuracy: Math.round((stats.correct / stats.games) * 100),
                games: stats.games
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    exportData() {
        const exportData = {
            summary: this.getStatsSummary(),
            recentGames: this.getRecentGames(50),
            trends: this.getPerformanceTrends(),
            achievements: this.stats.achievements,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fastmath-stats-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    reset() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            this.stats = {
                totalGames: 0,
                correctGames: 0,
                totalScore: 0,
                bestScore: 0,
                currentStreak: 0,
                bestStreak: 0,
                averageResponseTime: 0,
                gameHistory: [],
                dailyStats: {},
                achievements: [],
                createdAt: new Date().toISOString()
            };
            this.save();
            return true;
        }
        return false;
    }
}
```

### Statistics UI (add to index.html stats screen)
```html
<!-- Replace the stats screen content -->
<section id="stats-screen" class="screen">
    <div class="stats-container">
        <div class="stats-header">
            <h2>Your Progress</h2>
            <button class="export-btn btn btn-secondary">Export Data</button>
        </div>

        <div class="stats-summary">
            <div class="stat-card">
                <div class="stat-number">0</div>
                <div class="stat-label">Games Played</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">0%</div>
                <div class="stat-label">Accuracy</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">0</div>
                <div class="stat-label">Best Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">0</div>
                <div class="stat-label">Best Streak</div>
            </div>
        </div>

        <div class="performance-chart">
            <h3>Recent Performance</h3>
            <canvas id="performance-canvas" width="300" height="150"></canvas>
        </div>

        <div class="recent-games">
            <h3>Recent Games</h3>
            <div class="games-list">
                <!-- Games will be populated by JavaScript -->
            </div>
        </div>

        <div class="achievements-section">
            <h3>Achievements <span class="achievement-count">(0)</span></h3>
            <div class="achievements-grid">
                <!-- Achievements will be populated by JavaScript -->
            </div>
        </div>

        <div class="stats-actions">
            <button class="reset-stats-btn btn btn-secondary">Reset Statistics</button>
        </div>
    </div>
</section>
```

### CSS Styles for Statistics (add to styles.css)
```css
/* Statistics Screen */
.stats-container {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--spacing-base);
}

.stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);
}

.stats-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: var(--spacing-base);
    margin-bottom: var(--spacing-xl);
}

.stat-card {
    background: var(--surface-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    text-align: center;
    box-shadow: var(--shadow);
}

.stat-number {
    font-size: var(--font-size-2xl);
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
}

.stat-label {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

/* Performance Chart */
.performance-chart {
    background: var(--surface-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow);
}

.performance-chart h3 {
    margin: 0 0 var(--spacing-base) 0;
}

#performance-canvas {
    width: 100%;
    height: 150px;
}

/* Recent Games */
.recent-games {
    background: var(--surface-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow);
}

.games-list {
    max-height: 300px;
    overflow-y: auto;
}

.game-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) 0;
    border-bottom: 1px solid var(--border-color);
}

.game-item:last-child {
    border-bottom: none;
}

.game-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.game-status {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: white;
    font-weight: bold;
}

.game-status.correct {
    background: var(--success-color);
}

.game-status.incorrect {
    background: var(--error-color);
}

.game-details {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}

.game-score {
    font-weight: bold;
    color: var(--primary-color);
}

/* Achievements */
.achievements-section {
    background: var(--surface-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow);
}

.achievement-count {
    color: var(--text-secondary);
    font-weight: normal;
}

.achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: var(--spacing-base);
    margin-top: var(--spacing-base);
}

.achievement-item {
    background: var(--background-color);
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: var(--spacing-base);
    text-align: center;
    transition: all 0.2s ease;
}

.achievement-item.unlocked {
    border-color: var(--success-color);
    background: rgba(52, 199, 89, 0.1);
}

.achievement-icon {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-xs);
}

.achievement-name {
    font-size: var(--font-size-sm);
    font-weight: 600;
    margin-bottom: var(--spacing-xs);
}

.achievement-desc {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
}

/* Achievement Popup */
.achievement-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.8);
    background: var(--surface-color);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
    z-index: 2000;
    opacity: 0;
    transition: all 0.3s ease;
}

.achievement-popup.show {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
}

.achievement-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-base);
}

.achievement-popup .achievement-icon {
    font-size: 3rem;
}

.achievement-text h4 {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.achievement-text h3 {
    margin: var(--spacing-xs) 0;
    color: var(--primary-color);
}

.achievement-text p {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}
```

## Acceptance Criteria
- ✅ Scoring accurately reflects game difficulty
- ✅ Statistics persist between sessions
- ✅ Performance trends show meaningful data
- ✅ Achievements unlock correctly
- ✅ Export functionality works properly
- ✅ Statistics display is clear and informative
- ✅ Achievement notifications appear correctly
- ✅ Data validation prevents corruption
- ✅ Performance charts render properly (visual display implemented)
- ✅ Reset functionality works safely

## Testing Checklist
- [ ] Test scoring with various difficulty combinations
- [ ] Verify statistics accuracy after multiple games
- [ ] Test achievement unlock conditions
- [ ] Check export file format and content
- [ ] Verify statistics persistence
- [ ] Test performance with large datasets
- [ ] Check achievement popup animations
- [ ] Test statistics reset functionality
- [ ] Verify chart rendering on different screen sizes
- [ ] Test edge cases (very fast/slow responses)

## Time Estimate
**8-10 hours**
- Scoring algorithm: 2-3 hours
- Statistics tracking: 2-3 hours
- Achievement system: 2 hours
- UI components and charts: 2-3 hours
- Testing and refinements: 1-2 hours

## Dependencies
- Epic 1: Core UI Foundation
- Epic 2: Settings System
- Epic 3: Game Engine

## Next Epic
[Epic 5: PWA Implementation](./05-pwa-implementation.md) - Make the app installable and work offline with service worker implementation.