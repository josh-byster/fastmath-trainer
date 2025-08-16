import { GameSettings, GameResult } from '../types/game.types';

export interface ScoreBreakdown {
  accuracy: number;
  difficulty: number;
  speed: number;
  total: number;
}

export interface ScoreMultipliers {
  difficulty: number;
  accuracy: number;
  speed: number;
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  multipliers: ScoreMultipliers;
}

export interface GameResultExtended extends GameResult {
  settings: GameSettings;
  mistakes?: number;
}

export interface DifficultyWeights {
  timeOnScreen: { min: number; max: number; weight: number };
  timeBetween: { min: number; max: number; weight: number };
  digitCount: { [key: number]: number; weight: number };
  sequenceLength: { min: number; max: number; weight: number };
  speedBonus: { weight: number };
}

export interface Rank {
  min: number;
  max: number;
  name: string;
  color: string;
}

export class ScoringSystem {
  private difficultyWeights: DifficultyWeights = {
    timeOnScreen: { min: 500, max: 3000, weight: 0.3 },
    timeBetween: { min: 100, max: 1000, weight: 0.1 },
    digitCount: { 2: 1.0, 3: 1.8, weight: 0.25 },
    sequenceLength: { min: 3, max: 10, weight: 0.25 },
    speedBonus: { weight: 0.1 }
  };

  calculateScore(gameResult: GameResultExtended): ScoreResult {
    const {
      isCorrect,
      responseTime,
      sequence,
      settings,
      mistakes = 0
    } = gameResult;

    if (!isCorrect) {
      const difficulty = this.calculateDifficulty(settings);
      return {
        score: 0,
        breakdown: {
          accuracy: 0,
          difficulty: Math.round(difficulty * 100),
          speed: 0,
          total: 0
        },
        multipliers: {
          difficulty,
          accuracy: 0,
          speed: 0
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

  calculateDifficulty(settings: GameSettings): number {
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

  calculateAccuracy(mistakes: number, totalNumbers: number): number {
    if (mistakes === 0) return 1.0;
    const errorRate = mistakes / totalNumbers;
    return Math.max(0.1, 1 - errorRate * 0.5);
  }

  calculateSpeedBonus(responseTime: number, settings: GameSettings): number {
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

  normalize(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  normalizeInverse(value: number, min: number, max: number): number {
    return 1 - this.normalize(value, min, max);
  }

  getRankForScore(score: number): Rank {
    const ranks: Rank[] = [
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