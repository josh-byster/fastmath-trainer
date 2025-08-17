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
    createdAt: new Date().toISOString(),
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
        this.stats.gameHistory = this.stats.gameHistory.map((game) => ({
          ...game,
          timestamp: new Date(game.timestamp),
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
      this.stats.bestStreak = Math.max(
        this.stats.bestStreak,
        this.stats.currentStreak
      );
    } else {
      this.stats.currentStreak = 0;
    }

    if (scoreData.score > this.stats.bestScore) {
      this.stats.bestScore = scoreData.score;
    }

    // Update average response time
    const totalTime =
      this.stats.averageResponseTime * (this.stats.totalGames - 1) +
      gameResult.responseTime;
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
      breakdown: { ...scoreData.breakdown },
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
        totalTime: 0,
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

  private getAllAvailableAchievements(gameRecord?: GameRecord): Achievement[] {
    return [
      // Getting Started Achievements
      {
        id: 'first_game',
        name: 'First Steps',
        description: 'Complete your first game',
        condition: () => this.stats.totalGames >= 1,
      },
      {
        id: 'rookie',
        name: 'Rookie',
        description: 'Play 10 games',
        condition: () => this.stats.totalGames >= 10,
      },
      {
        id: 'veteran',
        name: 'Veteran',
        description: 'Play 50 games',
        condition: () => this.stats.totalGames >= 50,
      },
      {
        id: 'century',
        name: 'Centurion',
        description: 'Play 100 games',
        condition: () => this.stats.totalGames >= 100,
      },
      {
        id: 'marathon',
        name: 'Marathon Master',
        description: 'Play 500 games',
        condition: () => this.stats.totalGames >= 500,
      },
      {
        id: 'legend',
        name: 'Legend',
        description: 'Play 1000 games',
        condition: () => this.stats.totalGames >= 1000,
      },

      // Accuracy Achievements
      {
        id: 'perfect_score',
        name: 'Perfect!',
        description: 'Get a perfect accuracy score',
        condition: () =>
          gameRecord ? gameRecord.breakdown.accuracy === 100 : false,
      },
      {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Get 3 perfect scores in a row',
        condition: () => {
          const recent = this.stats.gameHistory.slice(-3);
          return (
            recent.length === 3 &&
            recent.every((g) => g.breakdown.accuracy === 100)
          );
        },
      },
      {
        id: 'sharp_shooter',
        name: 'Sharp Shooter',
        description: 'Maintain 90% accuracy over 20 games',
        condition: () => {
          const recent = this.stats.gameHistory.slice(-20);
          if (recent.length < 20) return false;
          const correct = recent.filter((g) => g.isCorrect).length;
          return correct / 20 >= 0.9;
        },
      },
      {
        id: 'sniper',
        name: 'Sniper',
        description: 'Maintain 95% accuracy over 50 games',
        condition: () => {
          const recent = this.stats.gameHistory.slice(-50);
          if (recent.length < 50) return false;
          const correct = recent.filter((g) => g.isCorrect).length;
          return correct / 50 >= 0.95;
        },
      },

      // Speed Achievements
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a game in under 2 seconds',
        condition: () => (gameRecord ? gameRecord.responseTime < 2000 : false),
      },
      {
        id: 'lightning',
        name: 'Lightning Fast',
        description: 'Complete a game in under 1 second',
        condition: () => (gameRecord ? gameRecord.responseTime < 1000 : false),
      },
      {
        id: 'consistent_speed',
        name: 'Consistent Speed',
        description: 'Complete 5 games in a row under 3 seconds',
        condition: () => {
          const recent = this.stats.gameHistory.slice(-5);
          return (
            recent.length === 5 && recent.every((g) => g.responseTime < 3000)
          );
        },
      },
      {
        id: 'speed_machine',
        name: 'Speed Machine',
        description: 'Average under 2.5 seconds over 10 games',
        condition: () => {
          const recent = this.stats.gameHistory.slice(-10);
          if (recent.length < 10) return false;
          const avgTime =
            recent.reduce((sum, g) => sum + g.responseTime, 0) / 10;
          return avgTime < 2500;
        },
      },

      // Streak Achievements
      {
        id: 'streak_5',
        name: 'On Fire',
        description: 'Get 5 correct answers in a row',
        condition: () => this.stats.currentStreak >= 5,
      },
      {
        id: 'streak_10',
        name: 'Unstoppable',
        description: 'Get 10 correct answers in a row',
        condition: () => this.stats.currentStreak >= 10,
      },
      {
        id: 'streak_25',
        name: 'Dominator',
        description: 'Get 25 correct answers in a row',
        condition: () => this.stats.currentStreak >= 25,
      },
      {
        id: 'streak_50',
        name: 'Untouchable',
        description: 'Get 50 correct answers in a row',
        condition: () => this.stats.currentStreak >= 50,
      },
      {
        id: 'streak_100',
        name: 'Godlike',
        description: 'Get 100 correct answers in a row',
        condition: () => this.stats.currentStreak >= 100,
      },

      // Score Achievements
      {
        id: 'high_scorer',
        name: 'High Scorer',
        description: 'Score over 1500 points',
        condition: () => (gameRecord ? gameRecord.score >= 1500 : false),
      },
      {
        id: 'elite_scorer',
        name: 'Elite Scorer',
        description: 'Score over 2000 points',
        condition: () => (gameRecord ? gameRecord.score >= 2000 : false),
      },
      {
        id: 'master_scorer',
        name: 'Master Scorer',
        description: 'Score over 2500 points',
        condition: () => (gameRecord ? gameRecord.score >= 2500 : false),
      },
      {
        id: 'score_collector',
        name: 'Score Collector',
        description: 'Accumulate 50,000 total points',
        condition: () => this.stats.totalScore >= 50000,
      },
      {
        id: 'point_millionaire',
        name: 'Point Millionaire',
        description: 'Accumulate 100,000 total points',
        condition: () => this.stats.totalScore >= 100000,
      },

      // Difficulty-Based Achievements
      {
        id: 'hard_mode_hero',
        name: 'Hard Mode Hero',
        description: 'Complete 10 games on hard difficulty',
        condition: () => {
          const hardGames = this.stats.gameHistory.filter(
            (g) => g.settings.digitCount >= 3 || g.settings.sequenceLength >= 8
          );
          return hardGames.length >= 10;
        },
      },
      {
        id: 'extreme_challenger',
        name: 'Extreme Challenger',
        description: 'Complete 5 games on extreme difficulty',
        condition: () => {
          const extremeGames = this.stats.gameHistory.filter(
            (g) => g.settings.digitCount >= 4 || g.settings.sequenceLength >= 15
          );
          return extremeGames.length >= 5;
        },
      },
      {
        id: 'elite_warrior',
        name: 'Elite Warrior',
        description: 'Complete a game on elite difficulty',
        condition: () => {
          const eliteGames = this.stats.gameHistory.filter(
            (g) =>
              g.settings.digitCount === 5 || g.settings.sequenceLength >= 30
          );
          return eliteGames.length >= 1;
        },
      },

      // Special Achievements
      {
        id: 'comeback_kid',
        name: 'Comeback Kid',
        description: 'Get a correct answer after 3 wrong answers',
        condition: () => {
          const recent = this.stats.gameHistory.slice(-4);
          if (recent.length < 4) return false;
          const lastThree = recent.slice(0, 3);
          const current = recent[3];
          return lastThree.every((g) => !g.isCorrect) && current.isCorrect;
        },
      },
      {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Play a game between midnight and 6 AM',
        condition: () => {
          if (!gameRecord) return false;
          const hour = gameRecord.timestamp.getHours();
          return hour >= 0 && hour < 6;
        },
      },
      {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Play a game between 5 AM and 8 AM',
        condition: () => {
          if (!gameRecord) return false;
          const hour = gameRecord.timestamp.getHours();
          return hour >= 5 && hour < 8;
        },
      },
      {
        id: 'daily_grind',
        name: 'Daily Grind',
        description: 'Play games on 7 consecutive days',
        condition: () => {
          const today = new Date();
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
          });

          return last7Days.every(
            (date) =>
              this.stats.dailyStats[date] &&
              this.stats.dailyStats[date].games > 0
          );
        },
      },
      {
        id: 'weekend_warrior',
        name: 'Weekend Warrior',
        description: 'Play 20 games on weekends',
        condition: () => {
          const weekendGames = this.stats.gameHistory.filter((g) => {
            const day = g.timestamp.getDay();
            return day === 0 || day === 6; // Sunday or Saturday
          });
          return weekendGames.length >= 20;
        },
      },
      {
        id: 'power_session',
        name: 'Power Session',
        description: 'Play 20 games in one day',
        condition: () => {
          const today = new Date().toISOString().split('T')[0];
          const todayStats = this.stats.dailyStats[today];
          return todayStats && todayStats.games >= 20;
        },
      },
      {
        id: 'precision_master',
        name: 'Precision Master',
        description: 'Get 10 answers within 1% of correct value',
        condition: () => {
          const preciseGames = this.stats.gameHistory.filter((g) => {
            if (g.isCorrect) return true;
            const error = Math.abs(g.userAnswer - g.correctSum);
            const errorPercent = error / g.correctSum;
            return errorPercent <= 0.01;
          });
          return preciseGames.length >= 10;
        },
      },
    ];
  }

  private checkAchievements(gameRecord: GameRecord): void {
    const achievements = this.getAllAvailableAchievements(gameRecord);

    achievements.forEach((achievement) => {
      if (
        !this.hasAchievement(achievement.id) &&
        achievement.condition &&
        achievement.condition()
      ) {
        this.unlockAchievement(achievement);
      }
    });
  }

  hasAchievement(achievementId: string): boolean {
    return this.stats.achievements.some((a) => a.id === achievementId);
  }

  private unlockAchievement(achievement: Achievement): void {
    const unlockedAchievement: Achievement = {
      ...achievement,
      unlockedAt: new Date().toISOString(),
    };

    this.stats.achievements.push(unlockedAchievement);

    // Notify listeners
    this.achievementCallbacks.forEach((callback) =>
      callback(unlockedAchievement)
    );
  }

  onAchievementUnlocked(callback: (achievement: Achievement) => void): void {
    this.achievementCallbacks.push(callback);
  }

  getStatsSummary(): StatsSummary {
    const accuracy =
      this.stats.totalGames > 0
        ? (this.stats.correctGames / this.stats.totalGames) * 100
        : 0;

    const averageScore =
      this.stats.totalGames > 0
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
      achievements: this.stats.achievements.length,
    };
  }

  getRecentGames(count = 10): RecentGame[] {
    return this.stats.gameHistory
      .slice(-count)
      .reverse()
      .map((game) => ({
        timestamp: game.timestamp,
        score: game.score,
        isCorrect: game.isCorrect,
        responseTime: game.responseTime,
        difficulty: game.settings.digitCount === 3 ? 'Hard' : 'Medium',
      }));
  }

  getPerformanceTrends(): PerformanceTrend[] {
    const last30Days = this.stats.gameHistory.filter((game) => {
      const daysDiff =
        (Date.now() - game.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    // Group by day
    const dailyPerformance: {
      [key: string]: { games: number; totalScore: number; correct: number };
    } = {};
    last30Days.forEach((game) => {
      const dateKey = game.timestamp.toISOString().split('T')[0];
      if (!dailyPerformance[dateKey]) {
        dailyPerformance[dateKey] = {
          games: 0,
          totalScore: 0,
          correct: 0,
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
        games: stats.games,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  exportData(): void {
    const exportData: ExportData = {
      summary: this.getStatsSummary(),
      recentGames: this.getRecentGames(50),
      trends: this.getPerformanceTrends(),
      achievements: this.stats.achievements,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fastmath-stats-${
      new Date().toISOString().split('T')[0]
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  reset(): boolean {
    if (
      window.confirm(
        'Are you sure you want to reset all statistics? This cannot be undone.'
      )
    ) {
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
        createdAt: new Date().toISOString(),
      };
      this.save();
      return true;
    }
    return false;
  }

  getAllAchievements(): Achievement[] {
    return this.stats.achievements;
  }

  getAllAvailableAchievementsWithStatus(): (Achievement & {
    isUnlocked: boolean;
  })[] {
    const availableAchievements = this.getAllAvailableAchievements();
    return availableAchievements.map((achievement) => ({
      ...achievement,
      isUnlocked: this.hasAchievement(achievement.id),
      unlockedAt: this.stats.achievements.find((a) => a.id === achievement.id)
        ?.unlockedAt,
    }));
  }
}
