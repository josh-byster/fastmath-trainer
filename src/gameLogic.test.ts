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
      sequence.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(10);
        expect(num).toBeLessThanOrEqual(99);
      });
    });

    it('should generate 3-digit numbers (100-999)', () => {
      const sequence = GameLogic.generateSequence(3, 10);
      sequence.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(100);
        expect(num).toBeLessThanOrEqual(999);
      });
    });

    it('should generate 4-digit numbers (1000-9999)', () => {
      const sequence = GameLogic.generateSequence(4, 10);
      sequence.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1000);
        expect(num).toBeLessThanOrEqual(9999);
      });
    });

    it('should generate 5-digit numbers (10000-99999)', () => {
      const sequence = GameLogic.generateSequence(5, 10);
      sequence.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(10000);
        expect(num).toBeLessThanOrEqual(99999);
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
    const easySettings: GameSettings = {
      digitCount: 2,
      sequenceLength: 3,
      timeOnScreen: 2000,
      timeBetween: 500,
      soundEnabled: true,
      hapticEnabled: true,
      voiceEnabled: false,
      speechRate: 1.0,
      voiceURI: '',
    };

    const hardSettings: GameSettings = {
      digitCount: 3,
      sequenceLength: 8,
      timeOnScreen: 700,
      timeBetween: 200,
      soundEnabled: true,
      hapticEnabled: true,
      voiceEnabled: false,
      speechRate: 1.0,
      voiceURI: '',
    };

    it('should give perfect score for correct answer', () => {
      const result = GameLogic.calculateScore(100, 100, 5000, easySettings);
      expect(result.score).toBeGreaterThan(0);
      expect(result.accuracyPercentage).toBe(100);
    });

    it('should give partial credit for close answer', () => {
      const result = GameLogic.calculateScore(95, 100, 5000, easySettings);
      expect(result.score).toBeGreaterThan(0);
      expect(result.accuracyPercentage).toBe(95);
    });

    it('should give zero score for very wrong answer', () => {
      const result = GameLogic.calculateScore(50, 100, 5000, easySettings);
      expect(result.score).toBe(0);
      expect(result.accuracyPercentage).toBe(0);
    });

    it('should increase score for higher difficulty', () => {
      const easyResult = GameLogic.calculateScore(100, 100, 5000, easySettings);
      const hardResult = GameLogic.calculateScore(100, 100, 5000, hardSettings);
      expect(hardResult.score).toBeGreaterThan(easyResult.score);
      expect(hardResult.difficultyMultiplier).toBe(2.0);
      expect(easyResult.difficultyMultiplier).toBe(1.0);
    });

    it('should add speed bonus for fast responses', () => {
      const slowResult = GameLogic.calculateScore(
        100,
        100,
        15000,
        easySettings
      );
      const fastResult = GameLogic.calculateScore(100, 100, 2000, easySettings);
      expect(fastResult.speedBonus).toBeGreaterThan(slowResult.speedBonus);
    });

    it('should calculate accuracy multiplier correctly', () => {
      expect(GameLogic.calculateAccuracyMultiplier(100, 100)).toBe(1.0);
      expect(GameLogic.calculateAccuracyMultiplier(95, 100)).toBe(0.95);
      expect(GameLogic.calculateAccuracyMultiplier(80, 100)).toBe(0.8);
      expect(GameLogic.calculateAccuracyMultiplier(75, 100)).toBe(0.75); // Exactly 25% error = 75% accuracy
      expect(GameLogic.calculateAccuracyMultiplier(50, 100)).toBe(0); // Beyond 25% threshold
    });

    it('should calculate speed bonus correctly', () => {
      expect(GameLogic.calculateSpeedBonus(1000)).toBeCloseTo(30, 0);
      expect(GameLogic.calculateSpeedBonus(5000)).toBe(0); // Updated to 5s max
      expect(GameLogic.calculateSpeedBonus(500)).toBeCloseTo(39, 0);
    });

    it('should get difficulty multiplier correctly', () => {
      expect(GameLogic.getDifficultyMultiplier(easySettings)).toBe(1.0);
      expect(GameLogic.getDifficultyMultiplier(hardSettings)).toBe(2.0);
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
        voiceEnabled: false,
        speechRate: 1.0,
        voiceURI: '',
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
        voiceEnabled: false,
        speechRate: 1.0,
        voiceURI: '',
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
        voiceEnabled: false,
        speechRate: 1.0,
        voiceURI: '',
      };
      const difficulty = GameLogic.getDifficultyLevel(settings);
      expect(difficulty).toBe('medium');
    });
  });

  describe('formatTime', () => {
    it('should format milliseconds correctly', () => {
      expect(GameLogic.formatTime(500)).toBe('500ms');
      expect(GameLogic.formatTime(1000)).toBe('1.000s');
      expect(GameLogic.formatTime(1500)).toBe('1.500s');
      expect(GameLogic.formatTime(2345)).toBe('2.345s');
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
