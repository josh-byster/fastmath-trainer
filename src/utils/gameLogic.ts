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

  static calculateScore(isCorrect: boolean, responseTime: number): number {
    if (!isCorrect) return 0;

    const baseScore = 100;
    const timeBonus = Math.max(0, 10000 - responseTime) / 100;
    return Math.round(baseScore + timeBonus);
  }

  static validateAnswer(userAnswer: string, correctSum: number): boolean {
    const userSum = parseInt(userAnswer, 10);
    return !isNaN(userSum) && userSum === correctSum;
  }

  static getDifficultyLevel(settings: GameSettings): 'easy' | 'medium' | 'hard' {
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