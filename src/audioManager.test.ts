import { AudioManager } from './utils/audioManager';

// Mock navigator.vibrate
const mockVibrate = jest.fn();
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  configurable: true,
  value: mockVibrate,
});

describe('AudioManager', () => {
  let audioManager: AudioManager;

  beforeEach(() => {
    jest.clearAllMocks();
    audioManager = new AudioManager();
  });

  afterEach(() => {
    if (audioManager && typeof audioManager.cleanup === 'function') {
      audioManager.cleanup();
    }
  });

  describe('triggerHaptic', () => {
    it('should not vibrate when disabled', () => {
      audioManager.triggerHaptic('light', false);
      expect(mockVibrate).not.toHaveBeenCalled();
    });

    it('should vibrate when enabled', () => {
      audioManager.triggerHaptic('light', true);
      expect(mockVibrate).toHaveBeenCalledWith([10]);
    });

    it('should use different patterns for different intensities', () => {
      audioManager.triggerHaptic('medium', true);
      expect(mockVibrate).toHaveBeenCalledWith([20]);

      audioManager.triggerHaptic('success', true);
      expect(mockVibrate).toHaveBeenCalledWith([10, 50, 10]);

      audioManager.triggerHaptic('error', true);
      expect(mockVibrate).toHaveBeenCalledWith([100, 50, 100]);
    });

    it('should fallback to light pattern for unknown intensity', () => {
      audioManager.triggerHaptic('unknown' as any, true);
      expect(mockVibrate).toHaveBeenCalledWith([10]);
    });
  });

  describe('playSound', () => {
    it('should not throw when audio context is not available', () => {
      expect(() => {
        audioManager.playSound('number', true);
      }).not.toThrow();
    });

    it('should not throw when disabled', () => {
      expect(() => {
        audioManager.playSound('number', false);
      }).not.toThrow();
    });

    it('should handle different sound types without errors', () => {
      expect(() => {
        audioManager.playSound('keypress', true);
        audioManager.playSound('correct', true);
        audioManager.playSound('incorrect', true);
        audioManager.playSound('clear', true);
      }).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should not throw when called', () => {
      expect(() => {
        audioManager.cleanup();
      }).not.toThrow();
    });

    it('should be callable multiple times', () => {
      expect(() => {
        audioManager.cleanup();
        audioManager.cleanup();
      }).not.toThrow();
    });
  });
});