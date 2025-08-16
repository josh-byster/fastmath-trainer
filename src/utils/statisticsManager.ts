import { GameSettings } from '../types/game.types';
import { ScoreResult, GameResultExtended } from './scoringSystem';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt?: string;
  condition?: () => boolean;
}

export interface GameRecord {
  timestamp: Date;
  settings: GameSettings;
  sequence: number[];
  userAnswer: number;
  correctSum: number;
  isCorrect: boolean;
  responseTime: number;
  score: number;
  breakdown: {
    accuracy: number;
    difficulty: number;
    speed: number;
    total: number;
  };
}

export interface DayStats {
  games: number;
  correct: number;
  totalScore: number;
  bestScore: number;
  totalTime: number;
}

export interface Statistics {
  totalGames: number;
  correctGames: number;
  totalScore: number;
  bestScore: number;
  currentStreak: number;
  bestStreak: number;
  averageResponseTime: number;
  gameHistory: GameRecord[];
  dailyStats: { [dateKey: string]: DayStats };
  achievements: Achievement[];
  createdAt: string;
}

export interface StatsSummary {
  totalGames: number;
  accuracy: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  bestStreak: number;
  averageResponseTime: number;
  achievements: number;
}

export interface RecentGame {
  timestamp: Date;
  score: number;
  isCorrect: boolean;
  responseTime: number;
  difficulty: string;
}

export interface PerformanceTrend {
  date: string;
  averageScore: number;
  accuracy: number;
  games: number;
}

export interface ExportData {
  summary: StatsSummary;
  recentGames: RecentGame[];
  trends: PerformanceTrend[];
  achievements: Achievement[];
  exportedAt: string;
}

export class StatisticsManager {
  private stats: Statistics = {
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

  private achievementCallbacks: ((achievement: Achievement) => void)[] = [];

  constructor() {
    this.load();
  }

  load(): void {
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

  save(): void {
    try {
      localStorage.setItem('fastmath-statistics', JSON.stringify(this.stats));
    } catch (error) {
      console.error('Failed to save statistics:', error);
    }
  }

  recordGame(gameResult: GameResultExtended, scoreData: ScoreResult): void {
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
    const gameRecord: GameRecord = {
      timestamp,
      settings: { ...gameResult.settings },
      sequence: [...gameResult.sequence],
      userAnswer: gameResult.userAnswer,
      correctSum: gameResult.correctAnswer,
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

  private checkAchievements(gameRecord: GameRecord): void {
    const achievements: Achievement[] = [
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
      if (!this.hasAchievement(achievement.id) && achievement.condition && achievement.condition()) {
        this.unlockAchievement(achievement);
      }
    });
  }

  hasAchievement(achievementId: string): boolean {
    return this.stats.achievements.some(a => a.id === achievementId);
  }

  private unlockAchievement(achievement: Achievement): void {
    const unlockedAchievement: Achievement = {
      ...achievement,
      unlockedAt: new Date().toISOString()
    };

    this.stats.achievements.push(unlockedAchievement);

    // Notify listeners
    this.achievementCallbacks.forEach(callback => callback(unlockedAchievement));
  }

  onAchievementUnlocked(callback: (achievement: Achievement) => void): void {
    this.achievementCallbacks.push(callback);
  }

  getStatsSummary(): StatsSummary {
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

  getRecentGames(count = 10): RecentGame[] {
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

  getPerformanceTrends(): PerformanceTrend[] {
    const last30Days = this.stats.gameHistory
      .filter(game => {
        const daysDiff = (Date.now() - game.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 30;
      });

    // Group by day
    const dailyPerformance: { [key: string]: { games: number; totalScore: number; correct: number } } = {};
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
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  exportData(): void {
    const exportData: ExportData = {
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

  reset(): boolean {
    if (window.confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
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

  getAllAchievements(): Achievement[] {
    return this.stats.achievements;
  }
}