import { SoundType, HapticIntensity } from '../types/game.types';

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Partial<SoundType> = {};
  private isInitialized = false;

  constructor() {
    // Initialize audio context on first user interaction
    document.addEventListener('click', this.initializeAudio, { once: true });
    document.addEventListener('touchstart', this.initializeAudio, {
      once: true,
    });
  }

  private initializeAudio = () => {
    if (!this.isInitialized) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      this.generateSounds();
      this.isInitialized = true;
    }
  };

  private generateSounds() {
    if (!this.audioContext) return;

    this.sounds = {
      number: this.createTone(800, 0.1),
      keypress: this.createTone(600, 0.05),
      clear: this.createTone(400, 0.1),
      correct: this.createTone(1000, 0.3),
      incorrect: this.createTone(300, 0.5),
    };
  }

  private createTone(frequency: number, duration: number) {
    return () => {
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      );

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }

  playSound(type: keyof SoundType, enabled: boolean = true) {
    if (!enabled || !this.sounds[type]) return;
    this.sounds[type]!();
  }

  triggerHaptic(intensity: HapticIntensity, enabled: boolean = true) {
    if (!enabled || !('vibrate' in navigator)) return;

    const patterns = {
      light: [10],
      medium: [20],
      success: [10, 50, 10],
      error: [100, 50, 100],
    };

    navigator.vibrate(patterns[intensity] || patterns.light);
  }

  cleanup() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
