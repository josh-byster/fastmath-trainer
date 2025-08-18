export interface GameSettings {
  digitCount: 2 | 3 | 4 | 5;
  sequenceLength: number;
  timeOnScreen: number;
  timeBetween: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  voiceEnabled: boolean;
  audioOnlyMode: boolean;
  speechRate: number;
  voiceURI: string;
  voiceRecognitionEnabled: boolean;
  voiceConfidenceThreshold: number;
  voiceLanguage: string;
  voiceAutoStart: boolean;
}

export interface GameState {
  state:
    | 'idle'
    | 'playing'
    | 'input'
    | 'voiceListening'
    | 'voiceProcessing'
    | 'finished';
  currentSequence: number[];
  currentIndex: number;
  userAnswer: string;
  correctSum: number;
  startTime: number | null;
  inputStartTime: number | null;
  endTime: number | null;
  isVoiceMode: boolean;
}

export interface GameResult {
  isCorrect: boolean;
  userAnswer: number;
  correctAnswer: number;
  responseTime: number;
  score: number;
  sequence: number[];
  accuracyPercentage: number;
  difficultyMultiplier: number;
  speedBonus: number;
}

export interface PerformanceStats {
  totalGames: number;
  correctAnswers: number;
  averageResponseTime: number;
  bestScore: number;
  accuracy: number;
}

export interface SoundType {
  number: () => void;
  keypress: () => void;
  clear: () => void;
  correct: () => void;
  incorrect: () => void;
}

export type HapticIntensity = 'light' | 'medium' | 'success' | 'error';

export type Screen =
  | 'home'
  | 'game'
  | 'settings'
  | 'results'
  | 'stats'
  | 'achievements';
