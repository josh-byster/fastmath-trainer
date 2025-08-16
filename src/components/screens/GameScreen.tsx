import React, { useState, useEffect, useRef } from 'react';
import { Screen, GameState, GameResult } from '../../types/game.types';
import { useSettings } from '../../services/SettingsContext';
import { GameLogic } from '../../utils/gameLogic';
import { AudioManager } from '../../utils/audioManager';
import { NumberPad } from '../game/NumberPad';

interface GameScreenProps {
  onNavigate: (screen: Screen, result?: GameResult) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onNavigate }) => {
  const { settings } = useSettings();
  const audioManagerRef = useRef<AudioManager | null>(null);

  // Initialize AudioManager only once
  if (!audioManagerRef.current) {
    audioManagerRef.current = new AudioManager();
  }
  
  const [gameState, setGameState] = useState<GameState>({
    state: 'idle',
    currentSequence: [],
    currentIndex: 0,
    userAnswer: '',
    correctSum: 0,
    startTime: null,
    endTime: null,
  });

  const [currentNumber, setCurrentNumber] = useState<string>('--');
  const [sequencePosition, setSequencePosition] = useState({ current: 1, total: 5 });
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (gameState.state === 'idle') {
      startGame();
    }
    
    return () => {
      try {
        audioManagerRef.current?.cleanup();
      } catch (error) {
        // Silently handle cleanup errors in tests
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startGame = async (): Promise<void> => {
    const sequence = GameLogic.generateSequence(
      settings.digitCount, 
      settings.sequenceLength
    );
    const correctSum = GameLogic.calculateSum(sequence);

    setGameState({
      state: 'playing',
      currentSequence: sequence,
      currentIndex: 0,
      userAnswer: '',
      correctSum,
      startTime: Date.now(),
      endTime: null,
    });

    setSequencePosition({ current: 1, total: sequence.length });

    // Show get ready message
    await showMessage('Get Ready...', 1500);
    await delay(500);

    // Play sequence
    await playSequence(sequence);

    // Switch to input mode
    setGameState(prev => ({ ...prev, state: 'input' }));
    setShowInput(true);
    setCurrentNumber('--');
    await showMessage('Enter the sum:', 1500);
  };

  const playSequence = async (sequence: number[]): Promise<void> => {
    const { timeOnScreen, timeBetween } = settings;

    for (let i = 0; i < sequence.length; i++) {
      setSequencePosition({ current: i + 1, total: sequence.length });
      
      audioManagerRef.current?.playSound('number', settings.soundEnabled);
      audioManagerRef.current?.triggerHaptic('light', settings.hapticEnabled);
      
      await displayNumber(sequence[i], timeOnScreen);
      
      if (i < sequence.length - 1) {
        setCurrentNumber('--');
        await delay(timeBetween);
      }
    }
    
    setCurrentNumber('--');
  };

  const displayNumber = async (number: number, duration: number): Promise<void> => {
    setCurrentNumber(number.toString());
    await delay(duration);
  };

  const showMessage = async (text: string, duration: number = 2000): Promise<void> => {
    setCurrentNumber(text);
    await delay(duration);
  };

  const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const handleNumberInput = (digit: string): void => {
    if (gameState.state !== 'input' || gameState.userAnswer.length >= 6) return;

    const newAnswer = gameState.userAnswer + digit;
    setGameState(prev => ({ ...prev, userAnswer: newAnswer }));
    
    audioManagerRef.current?.playSound('keypress', settings.soundEnabled);
    audioManagerRef.current?.triggerHaptic('light', settings.hapticEnabled);
  };

  const handleClearInput = (): void => {
    if (gameState.state !== 'input') return;

    setGameState(prev => ({ ...prev, userAnswer: '' }));
    audioManagerRef.current?.playSound('clear', settings.soundEnabled);
    audioManagerRef.current?.triggerHaptic('medium', settings.hapticEnabled);
  };

  const handleSubmitAnswer = (): void => {
    if (gameState.state !== 'input' || !gameState.userAnswer) return;

    const endTime = Date.now();
    const responseTime = endTime - (gameState.startTime || 0);
    const userSum = parseInt(gameState.userAnswer);
    const isCorrect = userSum === gameState.correctSum;

    audioManagerRef.current?.playSound(
      isCorrect ? 'correct' : 'incorrect', 
      settings.soundEnabled
    );
    audioManagerRef.current?.triggerHaptic(
      isCorrect ? 'success' : 'error', 
      settings.hapticEnabled
    );

    const result: GameResult = {
      isCorrect,
      userAnswer: userSum,
      correctAnswer: gameState.correctSum,
      responseTime,
      score: GameLogic.calculateScore(isCorrect, responseTime),
      sequence: gameState.currentSequence,
    };

    setGameState(prev => ({ ...prev, state: 'finished', endTime }));
    setShowInput(false);

    // Navigate to results after brief delay
    setTimeout(() => {
      onNavigate('results', result);
    }, 1000);
  };

  return (
    <section className="screen-modern flex flex-col items-center justify-center" data-testid="game-screen">
      <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
        <div className="number-display">
          <span 
            id="current-number"
            data-testid="current-number"
            className={`${currentNumber.includes('Get Ready') || currentNumber.includes('Enter') ? 'text-2xl font-medium' : 'text-6xl font-bold'} transition-all duration-300`}
          >
            {currentNumber}
          </span>
        </div>
        
        <div className="glass-card text-center" data-testid="sequence-progress">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{sequencePosition.current}</span> of{' '}
            <span className="font-semibold">{sequencePosition.total}</span>
          </p>
        </div>

        <div data-testid="game-state" data-state={gameState.state} className="hidden"></div>
        <div data-testid="game-timer" className="hidden"></div>
      </div>

      {showInput && (
        <div className="game-input-panel fixed bottom-0 left-0 right-0">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <label htmlFor="answer-display" className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                Your Answer:
              </label>
              <div 
                id="answer-display" 
                className="glass-card mx-auto w-48 h-16 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400" 
                data-testid="user-input"
              >
                {gameState.userAnswer || '0'}
              </div>
            </div>

            <NumberPad
              onNumberClick={handleNumberInput}
              onClear={handleClearInput}
              onSubmit={handleSubmitAnswer}
              canSubmit={gameState.userAnswer.length > 0}
            />
          </div>
        </div>
      )}
    </section>
  );
};