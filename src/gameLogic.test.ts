import { GameLogic } from './utils/gameLogic';
import { GameSettings } from './types/game.types';

describe('GameLogic', () => {
  describe('generateSequence', () => {
    it('should generate sequence with correct length', () => {
      const sequence = GameLogic.generateSequence(2, 5);
      expect(sequence).toHaveLength(5);
    });

    it('should generate 2-digit numbers (10-99)', () => {
      const sequence = GameLogic.generateSequence(2, 10);
      sequence.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(10);
        expect(num).toBeLessThanOrEqual(99);
      });
    });

    it('should generate 3-digit numbers (100-999)', () => {
      const sequence = GameLogic.generateSequence(3, 10);
      sequence.forEach(num => {
        expect(num).toBeGreaterThanOrEqual(100);
        expect(num).toBeLessThanOrEqual(999);
      });
    });
  });

  describe('calculateSum', () => {
    it('should correctly calculate sum of sequence', () => {
      const sequence = [10, 20, 30, 40];
      const sum = GameLogic.calculateSum(sequence);
      expect(sum).toBe(100);
    });

    it('should handle empty sequence', () => {
      const sum = GameLogic.calculateSum([]);
      expect(sum).toBe(0);
    });

    it('should handle single number', () => {
      const sum = GameLogic.calculateSum([42]);
      expect(sum).toBe(42);
    });
  });

  describe('calculateScore', () => {
    it('should return 0 for incorrect answer', () => {
      const score = GameLogic.calculateScore(false, 5000);
      expect(score).toBe(0);
    });

    it('should return base score for slow correct answer', () => {
      const score = GameLogic.calculateScore(true, 15000);
      expect(score).toBe(100);
    });

    it('should add time bonus for fast correct answer', () => {
      const score = GameLogic.calculateScore(true, 2000);
      expect(score).toBeGreaterThan(100);
    });

    it('should calculate score correctly for very fast answer', () => {
      const score = GameLogic.calculateScore(true, 1000);
      expect(score).toBe(190); // 100 + (10000 - 1000) / 100
    });
  });

  describe('validateAnswer', () => {
    it('should validate correct numeric answer', () => {
      const isValid = GameLogic.validateAnswer('123', 123);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect numeric answer', () => {
      const isValid = GameLogic.validateAnswer('123', 124);
      expect(isValid).toBe(false);
    });

    it('should reject non-numeric answer', () => {
      const isValid = GameLogic.validateAnswer('abc', 123);
      expect(isValid).toBe(false);
    });

    it('should reject empty answer', () => {
      const isValid = GameLogic.validateAnswer('', 123);
      expect(isValid).toBe(false);
    });

    it('should handle leading zeros', () => {
      const isValid = GameLogic.validateAnswer('0123', 123);
      expect(isValid).toBe(true);
    });
  });

  describe('getDifficultyLevel', () => {
    it('should return easy for simple settings', () => {
      const settings: GameSettings = {
        digitCount: 2,
        sequenceLength: 3,
        timeOnScreen: 2000,
        timeBetween: 500,
        soundEnabled: true,
        hapticEnabled: true,
      };
      const difficulty = GameLogic.getDifficultyLevel(settings);
      expect(difficulty).toBe('easy');
    });

    it('should return hard for difficult settings', () => {
      const settings: GameSettings = {
        digitCount: 3,
        sequenceLength: 8,
        timeOnScreen: 700,
        timeBetween: 200,
        soundEnabled: true,
        hapticEnabled: true,
      };
      const difficulty = GameLogic.getDifficultyLevel(settings);
      expect(difficulty).toBe('hard');
    });

    it('should return medium for moderate settings', () => {
      const settings: GameSettings = {
        digitCount: 2,
        sequenceLength: 5,
        timeOnScreen: 1000,
        timeBetween: 300,
        soundEnabled: true,
        hapticEnabled: true,
      };
      const difficulty = GameLogic.getDifficultyLevel(settings);
      expect(difficulty).toBe('medium');
    });
  });

  describe('formatTime', () => {
    it('should format milliseconds to seconds with one decimal', () => {
      expect(GameLogic.formatTime(1000)).toBe('1.0s');
      expect(GameLogic.formatTime(1500)).toBe('1.5s');
      expect(GameLogic.formatTime(2345)).toBe('2.3s');
    });
  });

  describe('formatSequence', () => {
    it('should format sequence as equation', () => {
      const sequence = [10, 20, 30];
      const formatted = GameLogic.formatSequence(sequence);
      expect(formatted).toBe('10 + 20 + 30 = 60');
    });

    it('should handle single number', () => {
      const sequence = [42];
      const formatted = GameLogic.formatSequence(sequence);
      expect(formatted).toBe('42 = 42');
    });
  });
});