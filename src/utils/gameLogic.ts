import { GameSettings } from '../types/game.types';

export class GameLogic {
  static generateSequence(
    digitCount: 2 | 3 | 4 | 5,
    sequenceLength: number
  ): number[] {
    const sequence: number[] = [];

    for (let i = 0; i < sequenceLength; i++) {
      let number: number;
      if (digitCount === 2) {
        number = Math.floor(Math.random() * 90) + 10; // 10-99
      } else if (digitCount === 3) {
        number = Math.floor(Math.random() * 900) + 100; // 100-999
      } else if (digitCount === 4) {
        number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
      } else {
        number = Math.floor(Math.random() * 90000) + 10000; // 10000-99999
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

    // Partial credit: max(0, 1 - percentageError), minimum 5% for answers within 25%
    const accuracy = Math.max(0, 1 - percentageError);
    return percentageError <= 0.25 ? Math.max(0.05, accuracy) : 0;
  }

  static calculateSpeedBonus(responseTime: number): number {
    // Elite speed bonus: max 50 points at 1s, zero bonus after 5s
    const timeInSeconds = responseTime / 1000;
    if (timeInSeconds >= 5) return 0;

    const maxBonus = 50;
    const multiplier = Math.max(0, Math.exp(-timeInSeconds / 2));
    return Math.round(maxBonus * multiplier);
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
      case 'extreme':
        return 3.0;
      case 'elite':
        return 4.0;
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
    const difficultyMultiplier = this.getDifficultyMultiplier(settings);

    const baseScore = difficultyMultiplier * 100;
    const accuracyScore = baseScore * accuracyMultiplier;

    // Only award speed bonus if there are accuracy points (no speed bonus for wrong answers)
    const speedBonus =
      accuracyScore > 0 ? this.calculateSpeedBonus(responseTime) : 0;

    const finalScore = Math.round(accuracyScore + speedBonus);

    return {
      score: finalScore,
      accuracyPercentage: Math.round(accuracyMultiplier * 100),
      difficultyMultiplier,
      speedBonus,
    };
  }

  static validateAnswer(userAnswer: string, correctSum: number): boolean {
    const userSum = parseInt(userAnswer, 10);
    return !isNaN(userSum) && userSum === correctSum;
  }

  static getDifficultyLevel(
    settings: GameSettings
  ): 'easy' | 'medium' | 'hard' | 'extreme' | 'elite' {
    const { digitCount, sequenceLength, timeOnScreen } = settings;

    // Elite level: 5-digit numbers or extreme sequences
    if (digitCount === 5 || sequenceLength >= 30 || timeOnScreen <= 100) {
      return 'elite';
    }

    // Extreme level: 4-digit numbers or very long sequences
    if (digitCount === 4 || sequenceLength >= 15 || timeOnScreen <= 300) {
      return 'extreme';
    }

    // Hard level: 3-digit numbers or long sequences
    if (digitCount === 3 || sequenceLength >= 8 || timeOnScreen <= 800) {
      return 'hard';
    }

    // Easy level: 2-digit with short sequences and long display time
    if (digitCount === 2 && sequenceLength <= 4 && timeOnScreen >= 1500) {
      return 'easy';
    }

    // Default to medium
    return 'medium';
  }

  static formatTime(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${Math.round(milliseconds)}ms`;
    }
    return `${(milliseconds / 1000).toFixed(3)}s`;
  }

  static formatSequence(sequence: number[]): string {
    return `${sequence.join(' + ')} = ${this.calculateSum(sequence)}`;
  }
}
