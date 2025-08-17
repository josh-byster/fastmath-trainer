import { SoundType, HapticIntensity } from '../types/game.types';

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Partial<SoundType> = {};
  private isInitialized = false;
  private currentVoice: SpeechSynthesisVoice | null = null;

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

  speakNumber(
    number: number,
    enabled: boolean = true,
    speechRate: number = 1.0,
    voiceURI: string = ''
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      console.log(
        `[TTS] Starting speech for number: ${number} at ${startTime.toFixed(
          2
        )}ms`
      );

      if (!enabled || !('speechSynthesis' in window)) {
        console.log(
          `[TTS] TTS disabled or not supported for number: ${number}`
        );
        resolve();
        return;
      }

      // Cancel any ongoing speech to prevent overlap
      speechSynthesis.cancel();
      console.log(`[TTS] Cancelled any previous speech for number: ${number}`);

      // Small delay to ensure cancel has taken effect
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(number.toString());
        utterance.rate = Math.max(0.1, Math.min(2.0, speechRate));
        utterance.volume = 0.8;
        utterance.pitch = 1.0;

        // Set voice if specified
        if (voiceURI) {
          const voices = speechSynthesis.getVoices();
          const selectedVoice = voices.find(
            (voice) => voice.voiceURI === voiceURI
          );
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(
              `[TTS] Using voice: ${selectedVoice.name} for number: ${number}`
            );
          }
        }

        utterance.onstart = () => {
          const actualStartTime = performance.now();
          console.log(
            `[TTS] Speech actually started for number: ${number} at ${actualStartTime.toFixed(
              2
            )}ms (delay: ${(actualStartTime - startTime).toFixed(2)}ms)`
          );
        };

        utterance.onend = () => {
          const endTime = performance.now();
          console.log(
            `[TTS] Speech finished for number: ${number} at ${endTime.toFixed(
              2
            )}ms (total duration: ${(endTime - startTime).toFixed(2)}ms)`
          );
          resolve();
        };

        utterance.onerror = (event) => {
          const errorTime = performance.now();
          console.error(
            `[TTS] Speech error for number: ${number} at ${errorTime.toFixed(
              2
            )}ms:`,
            event.error
          );
          resolve();
        };

        console.log(
          `[TTS] Queuing speech for number: ${number} with rate: ${utterance.rate}`
        );
        speechSynthesis.speak(utterance);

        // Reasonable timeout based on speech rate and number length
        const estimatedDuration = Math.max(
          500,
          (number.toString().length * 300) / speechRate
        );
        setTimeout(() => {
          const timeoutTime = performance.now();
          console.log(
            `[TTS] Timeout reached for number: ${number} at ${timeoutTime.toFixed(
              2
            )}ms (estimated duration was: ${estimatedDuration}ms)`
          );
          resolve();
        }, estimatedDuration + 500);
      }, 50); // Reduced delay for better synchronization
    });
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) return [];
    return speechSynthesis.getVoices();
  }

  loadVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve([]);
        return;
      }

      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      // Wait for voices to load
      const handleVoicesChanged = () => {
        speechSynthesis.removeEventListener(
          'voiceschanged',
          handleVoicesChanged
        );
        resolve(speechSynthesis.getVoices());
      };

      speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

      // Fallback timeout
      setTimeout(() => {
        speechSynthesis.removeEventListener(
          'voiceschanged',
          handleVoicesChanged
        );
        resolve(speechSynthesis.getVoices());
      }, 1000);
    });
  }

  cleanup() {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
