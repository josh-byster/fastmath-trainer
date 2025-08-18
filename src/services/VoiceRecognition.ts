interface VoiceConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  confidenceThreshold?: number;
}

interface VoiceResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export class VoiceRecognition {
  private recognition: any;
  private isListening: boolean = false;
  private config: VoiceConfig;
  private isSupported: boolean = false;

  constructor(config: VoiceConfig = {}) {
    this.config = {
      language: 'en-US',
      continuous: false,
      interimResults: false,
      maxAlternatives: 1,
      confidenceThreshold: 0.7,
      ...config,
    };

    this.initializeRecognition();
  }

  private initializeRecognition(): void {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      this.isSupported = false;
      return;
    }

    this.isSupported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.maxAlternatives = this.config.maxAlternatives;
  }

  public isVoiceRecognitionSupported(): boolean {
    return this.isSupported;
  }

  public startListening(): Promise<VoiceResult> {
    if (!this.isSupported) {
      return Promise.reject(new Error('Speech recognition not supported'));
    }

    if (this.isListening) {
      return Promise.reject(new Error('Already listening'));
    }

    return new Promise((resolve, reject) => {
      let hasResolved = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('Voice recognition started');
      };

      this.recognition.onresult = (event: any) => {
        if (hasResolved) return;

        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript.trim();
        const confidence = result[0].confidence || 0;
        const isFinal = result.isFinal;

        console.log('Voice recognition result:', {
          transcript,
          confidence,
          isFinal,
        });

        if (isFinal && confidence >= (this.config.confidenceThreshold || 0.7)) {
          hasResolved = true;
          resolve({
            transcript,
            confidence,
            isFinal,
          });
        }
      };

      this.recognition.onerror = (event: any) => {
        if (hasResolved) return;
        hasResolved = true;
        this.isListening = false;
        console.error('Voice recognition error:', event.error);

        let errorMessage = 'Speech recognition failed';
        switch (event.error) {
          case 'network':
            errorMessage =
              'Network error - please check your internet connection';
            break;
          case 'not-allowed':
            errorMessage =
              'Microphone access denied - please allow microphone permissions';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected - please try speaking louder';
            break;
          case 'audio-capture':
            errorMessage =
              'Microphone not found - please check your microphone';
            break;
          case 'service-not-allowed':
            errorMessage =
              'Speech service not available - please try again later';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }

        reject(new Error(errorMessage));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Voice recognition ended');
        if (!hasResolved) {
          hasResolved = true;
          reject(new Error('Speech recognition ended without result'));
        }
      };

      try {
        this.recognition.start();
      } catch (error) {
        hasResolved = true;
        reject(error);
      }

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true;
          this.stopListening();
          reject(new Error('Speech recognition timeout'));
        }
      }, 10000);
    });
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public updateConfig(newConfig: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.recognition) {
      this.recognition.lang = this.config.language;
      this.recognition.continuous = this.config.continuous;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.maxAlternatives = this.config.maxAlternatives;
    }
  }

  public cleanup(): void {
    this.stopListening();
    if (this.recognition) {
      this.recognition.onstart = null;
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
    }
  }
}
