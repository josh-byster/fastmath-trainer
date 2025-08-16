import { GameSettings } from '../types/game.types';

export class GameLogic {
  static generateSequence(digitCount: 2 | 3, sequenceLength: number): number[] {
    const sequence: number[] = [];

    for (let i = 0; i < sequenceLength; i++) {
      let number: number;
      if (digitCount === 2) {
        number = Math.floor(Math.random() * 90) + 10; // 10-99
      } else {
        number = Math.floor(Math.random() * 900) + 100; // 100-999
      }
      sequence.push(number);
    }

    return sequence;
  }

  static calculateSum(sequence: number[]): number {
    return sequence.reduce((sum, num) => sum + num, 0);
  }

  static calculateAccuracyMultiplier(
    userAnswer: number,
    correctAnswer: number
  ): number {
    if (userAnswer === correctAnswer) return 1.0;

    const error = Math.abs(userAnswer - correctAnswer);
    const percentageError = error / correctAnswer;

    // Partial credit: max(0, 1 - percentageError), minimum 10% for answers within 50%
    const accuracy = Math.max(0, 1 - percentageError);
    return percentageError <= 0.5 ? Math.max(0.1, accuracy) : 0;
  }

  static calculateSpeedMultiplier(responseTime: number): number {
    // Exponential decay: max bonus at 2s (0.5x), zero bonus after 20s
    const timeInSeconds = responseTime / 1000;
    if (timeInSeconds >= 20) return 0;

    return Math.max(0, 0.5 * Math.exp(-timeInSeconds / 8));
  }

  static getDifficultyMultiplier(settings: GameSettings): number {
    const difficulty = this.getDifficultyLevel(settings);
    switch (difficulty) {
      case 'easy':
        return 1.0;
      case 'medium':
        return 1.5;
      case 'hard':
        return 2.0;
      default:
        return 1.0;
    }
  }

  static calculateScore(
    userAnswer: number,
    correctAnswer: number,
    responseTime: number,
    settings: GameSettings
  ): {
    score: number;
    accuracyPercentage: number;
    difficultyMultiplier: number;
    speedBonus: number;
  } {
    const accuracyMultiplier = this.calculateAccuracyMultiplier(
      userAnswer,
      correctAnswer
    );
    const speedMultiplier = this.calculateSpeedMultiplier(responseTime);
    const difficultyMultiplier = this.getDifficultyMultiplier(settings);

    const baseScore = difficultyMultiplier * 100;
    const accuracyScore = baseScore * accuracyMultiplier;
    const speedBonus = baseScore * speedMultiplier;

    const finalScore = Math.round(accuracyScore + speedBonus);

    return {
      score: finalScore,
      accuracyPercentage: Math.round(accuracyMultiplier * 100),
      difficultyMultiplier,
      speedBonus: Math.round(speedBonus),
    };
  }

  static validateAnswer(userAnswer: string, correctSum: number): boolean {
    const userSum = parseInt(userAnswer, 10);
    return !isNaN(userSum) && userSum === correctSum;
  }

  static getDifficultyLevel(
    settings: GameSettings
  ): 'easy' | 'medium' | 'hard' {
    const { digitCount, sequenceLength, timeOnScreen } = settings;

    if (digitCount === 2 && sequenceLength <= 4 && timeOnScreen >= 1500) {
      return 'easy';
    }

    if (digitCount === 3 || sequenceLength >= 8 || timeOnScreen <= 800) {
      return 'hard';
    }

    return 'medium';
  }

  static formatTime(milliseconds: number): string {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  }

  static formatSequence(sequence: number[]): string {
    return `${sequence.join(' + ')} = ${this.calculateSum(sequence)}`;
  }
}
