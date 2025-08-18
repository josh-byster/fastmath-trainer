import React, { useState, useEffect, useRef } from 'react';
import { Screen, GameState, GameResult } from '../../types/game.types';
import { useSettings } from '../../services/SettingsContext';
import { useStatistics } from '../../contexts/StatisticsContext';
import { GameLogic } from '../../utils/gameLogic';
import { AudioManager } from '../../utils/audioManager';
import { NumberPad } from '../game/NumberPad';
import { VoiceIndicator } from '../game/VoiceIndicator';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { GameResultExtended, ScoreResult } from '../../utils/scoringSystem';

interface GameScreenProps {
  onNavigate: (
    screen: Screen,
    result?: GameResult,
    scoreResult?: ScoreResult
  ) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onNavigate }) => {
  console.log('[COMPONENT] GameScreen component rendering/re-rendering');

  const { settings } = useSettings();
  const { recordGame } = useStatistics();
  const audioManagerRef = useRef<AudioManager | null>(null);
  const gameStartingRef = useRef<boolean>(false);
  const componentIdRef = useRef<string>(
    Math.random().toString(36).substr(2, 9)
  );
  const gameInitializedRef = useRef<boolean>(false);

  console.log(`[COMPONENT] GameScreen instance ID: ${componentIdRef.current}`);

  // Initialize AudioManager only once
  if (!audioManagerRef.current) {
    console.log(
      `[COMPONENT] Creating new AudioManager for instance ${componentIdRef.current}`
    );
    audioManagerRef.current = new AudioManager();
  }

  const [gameState, setGameState] = useState<GameState>({
    state: 'idle',
    currentSequence: [],
    currentIndex: 0,
    userAnswer: '',
    correctSum: 0,
    startTime: null,
    inputStartTime: null,
    endTime: null,
    isVoiceMode: false,
  });

  const [currentNumber, setCurrentNumber] = useState<string>('');
  const [sequencePosition, setSequencePosition] = useState({
    current: 1,
    total: 5,
  });
  const [showInput, setShowInput] = useState(false);
  const [voiceRetryCount, setVoiceRetryCount] = useState(0);

  // Voice recognition hook
  const voiceRecognition = useVoiceRecognition({
    language: settings.voiceLanguage,
    confidenceThreshold: settings.voiceConfidenceThreshold,
    autoStart: settings.voiceAutoStart,
  });

  console.log('[VOICE] Voice recognition hook state:', {
    isSupported: voiceRecognition.isSupported,
    state: voiceRecognition.state,
  });

  const startGame = async (): Promise<void> => {
    console.log(
      `[GAME] startGame called for instance ${componentIdRef.current}`
    );
    console.log(
      `[GAME] Current state check - gameState.state: ${gameState.state}, currentSequence.length: ${gameState.currentSequence.length}, gameStartingRef.current: ${gameStartingRef.current}`
    );

    if (
      gameState.state !== 'idle' ||
      gameState.currentSequence.length > 0 ||
      gameStartingRef.current
    ) {
      console.log(
        `[GAME] Skipping startGame for instance ${componentIdRef.current} - game already in progress or starting`
      );
      return;
    }

    gameStartingRef.current = true;
    console.log(
      `[GAME] Starting new game for instance ${componentIdRef.current}`
    );

    try {
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
        inputStartTime: null,
        endTime: null,
        isVoiceMode: false,
      });

      setSequencePosition({ current: 1, total: sequence.length });

      // Show get ready message
      await showMessage('Get Ready...', 1500);
      await delay(500);

      // Play sequence
      await playSequence(sequence);

      // Switch to input mode and start timing user input
      const inputStartTime = Date.now();

      // Add a small delay to ensure voice recognition is properly initialized
      await delay(100);

      // Check speech recognition support directly
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const directSupport = !!SpeechRecognition;

      // Determine if we should use voice recognition
      const shouldUseVoice =
        settings.voiceRecognitionEnabled &&
        directSupport &&
        settings.voiceAutoStart;

      console.log('[VOICE] Voice auto-start decision (after delay):', {
        voiceRecognitionEnabled: settings.voiceRecognitionEnabled,
        isSupported: voiceRecognition.isSupported,
        directSupport: directSupport,
        voiceAutoStart: settings.voiceAutoStart,
        shouldUseVoice: shouldUseVoice,
      });

      if (shouldUseVoice) {
        console.log('[VOICE] Starting voice recognition auto-start...');
        setGameState((prev) => ({
          ...prev,
          state: 'voiceListening',
          inputStartTime,
          isVoiceMode: true,
        }));
        setVoiceRetryCount(0);
        startVoiceRecognition();
      } else {
        console.log(
          '[VOICE] Falling back to keyboard input - voice auto-start not enabled'
        );
        setGameState((prev) => ({
          ...prev,
          state: 'input',
          inputStartTime,
          isVoiceMode: false,
        }));
        setShowInput(true);
      }

      setCurrentNumber('');
    } catch (error) {
      console.error('[GAME] Error during game start:', error);
    } finally {
      gameStartingRef.current = false;
    }
  };

  useEffect(() => {
    const componentId = componentIdRef.current; // Capture ref value for cleanup
    console.log(`[USEEFFECT] useEffect triggered for instance ${componentId}`);
    console.log(
      `[USEEFFECT] gameInitializedRef.current: ${gameInitializedRef.current}`
    );

    if (!gameInitializedRef.current) {
      gameInitializedRef.current = true;
      console.log(
        `[USEEFFECT] About to call startGame from useEffect for instance ${componentId}`
      );
      startGame();
    } else {
      console.log(
        `[USEEFFECT] Skipping startGame - already initialized for instance ${componentId}`
      );
    }

    return () => {
      console.log(
        `[CLEANUP] Cleanup function called for instance ${componentId}`
      );
      try {
        audioManagerRef.current?.cleanup();
        // Only reset gameStartingRef, but keep gameInitializedRef to prevent double-initialization in StrictMode
        gameStartingRef.current = false;
        // DO NOT reset gameInitializedRef.current here - it should persist across StrictMode cleanup/re-run
      } catch (error) {
        // Silently handle cleanup errors in tests
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount, startGame is intentionally excluded to prevent re-execution

  const playSequence = async (sequence: number[]): Promise<void> => {
    const { timeOnScreen, timeBetween } = settings;
    const sequenceStartTime = performance.now();
    console.log(
      `[SEQUENCE] Starting sequence playback at ${sequenceStartTime.toFixed(
        2
      )}ms:`,
      sequence
    );
    console.log(
      `[SEQUENCE] Settings - timeOnScreen: ${timeOnScreen}ms, timeBetween: ${timeBetween}ms`
    );

    for (let i = 0; i < sequence.length; i++) {
      const numberStartTime = performance.now();
      console.log(
        `[SEQUENCE] Starting number ${i + 1}/${sequence.length} (${
          sequence[i]
        }) at ${numberStartTime.toFixed(2)}ms`
      );

      setSequencePosition({ current: i + 1, total: sequence.length });

      // Play sound effect (if enabled)
      audioManagerRef.current?.playSound('number', settings.soundEnabled);
      audioManagerRef.current?.triggerHaptic('light', settings.hapticEnabled);

      // Display the number and wait for it to completely finish (both visual and audio)
      await displayNumber(sequence[i], timeOnScreen);

      // Clear the display and pause between numbers
      if (i < sequence.length - 1) {
        const clearTime = performance.now();
        console.log(
          `[SEQUENCE] Clearing display for number ${
            sequence[i]
          } at ${clearTime.toFixed(2)}ms`
        );
        // Only clear visual display if not in audio-only mode
        if (!settings.audioOnlyMode || !settings.voiceEnabled) {
          setCurrentNumber('');
        }
        console.log(
          `[SEQUENCE] Starting pause of ${timeBetween}ms between numbers at ${performance
            .now()
            .toFixed(2)}ms`
        );
        await delay(timeBetween);
        console.log(
          `[SEQUENCE] Pause finished at ${performance.now().toFixed(2)}ms`
        );
      }

      const numberEndTime = performance.now();
      console.log(
        `[SEQUENCE] Finished number ${i + 1}/${sequence.length} (${
          sequence[i]
        }) at ${numberEndTime.toFixed(2)}ms (total time: ${(
          numberEndTime - numberStartTime
        ).toFixed(2)}ms)`
      );
    }

    const sequenceEndTime = performance.now();
    // Only clear visual display if not in audio-only mode
    if (!settings.audioOnlyMode || !settings.voiceEnabled) {
      setCurrentNumber('');
    }
    console.log(
      `[SEQUENCE] Sequence playback completed at ${sequenceEndTime.toFixed(
        2
      )}ms (total duration: ${(sequenceEndTime - sequenceStartTime).toFixed(
        2
      )}ms)`
    );
  };

  const displayNumber = async (
    number: number,
    duration: number
  ): Promise<void> => {
    const displayStartTime = performance.now();
    console.log(
      `[DISPLAY] Starting display for number: ${number} at ${displayStartTime.toFixed(
        2
      )}ms (duration: ${duration}ms)`
    );

    // Set the visual number only if not in audio-only mode
    if (!settings.audioOnlyMode || !settings.voiceEnabled) {
      setCurrentNumber(number.toString());
      console.log(
        `[DISPLAY] Visual number set to: ${number} at ${performance
          .now()
          .toFixed(2)}ms`
      );
    } else {
      console.log(
        `[DISPLAY] Audio-only mode enabled, skipping visual display for number: ${number}`
      );
    }

    if (settings.voiceEnabled) {
      // Start TTS and wait for it to complete OR the visual duration, whichever is longer
      console.log(
        `[DISPLAY] Starting TTS for number: ${number} at ${performance
          .now()
          .toFixed(2)}ms`
      );
      const ttsPromise =
        audioManagerRef.current?.speakNumber(
          number,
          settings.voiceEnabled,
          settings.speechRate,
          settings.voiceURI
        ) || Promise.resolve();

      // Wait for either the display duration OR TTS completion, whichever takes longer
      // This ensures we don't cut off speech but also don't wait too long
      const [ttsResult, delayResult] = await Promise.allSettled([
        ttsPromise,
        delay(duration),
      ]);

      console.log(
        `[DISPLAY] TTS result: ${ttsResult.status}, Delay result: ${delayResult.status} for number: ${number}`
      );
    } else {
      console.log(`[DISPLAY] TTS disabled for number: ${number}`);
      // No TTS, just wait for visual duration
      await delay(duration);
    }

    const displayEndTime = performance.now();
    console.log(
      `[DISPLAY] Display finished for number: ${number} at ${displayEndTime.toFixed(
        2
      )}ms (actual duration: ${(displayEndTime - displayStartTime).toFixed(
        2
      )}ms)`
    );
  };

  const showMessage = async (
    text: string,
    duration: number = 2000
  ): Promise<void> => {
    setCurrentNumber(text);
    await delay(duration);
  };

  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const startVoiceRecognition = async (): Promise<void> => {
    console.log('[VOICE] startVoiceRecognition called');
    try {
      console.log('[VOICE] Setting state to voiceListening');
      setGameState((prev) => ({ ...prev, state: 'voiceListening' }));
      console.log('[VOICE] Calling voiceRecognition.startListening()');
      const recognizedNumber = await voiceRecognition.startListening();
      console.log('[VOICE] Voice recognition result:', recognizedNumber);

      if (recognizedNumber !== null) {
        // Voice recognition successful
        setGameState((prev) => ({
          ...prev,
          state: 'voiceProcessing',
          userAnswer: recognizedNumber.toString(),
        }));

        // Auto-submit the recognized answer
        setTimeout(() => {
          handleAnswerSubmission(recognizedNumber);
        }, 500); // Small delay to show processing state
      } else {
        // Voice recognition failed, handle retry or fallback
        console.log(
          '[VOICE] Voice recognition returned null, handling failure'
        );
        handleVoiceRecognitionFailure();
      }
    } catch (error) {
      console.error('[VOICE] Voice recognition error:', error);
      handleVoiceRecognitionFailure();
    }
  };

  const handleVoiceRecognitionFailure = (): void => {
    setVoiceRetryCount((prev) => prev + 1);

    if (voiceRetryCount < 2) {
      // Allow up to 3 attempts
      setTimeout(() => {
        startVoiceRecognition();
      }, 1000);
    } else {
      // Fallback to keyboard input after 3 failed attempts
      fallbackToKeyboard();
    }
  };

  const fallbackToKeyboard = (): void => {
    setGameState((prev) => ({
      ...prev,
      state: 'input',
      isVoiceMode: false,
    }));
    setShowInput(true);
    voiceRecognition.clearError();
  };

  const retryVoiceRecognition = (): void => {
    voiceRecognition.clearError();
    setVoiceRetryCount(0);
    startVoiceRecognition();
  };

  const handleAnswerSubmission = (answer: number): void => {
    if (gameState.state === 'input' || gameState.state === 'voiceProcessing') {
      const endTime = Date.now();
      const responseTime = endTime - (gameState.inputStartTime || 0);
      const isCorrect = answer === gameState.correctSum;

      audioManagerRef.current?.playSound(
        isCorrect ? 'correct' : 'incorrect',
        settings.soundEnabled
      );
      audioManagerRef.current?.triggerHaptic(
        isCorrect ? 'success' : 'error',
        settings.hapticEnabled
      );

      // Calculate new scoring metrics
      const scoringData = GameLogic.calculateScore(
        answer,
        gameState.correctSum,
        responseTime,
        settings
      );

      // Create extended game result for statistics
      const gameResultExtended: GameResultExtended = {
        isCorrect,
        userAnswer: answer,
        correctAnswer: gameState.correctSum,
        responseTime,
        score: scoringData.score,
        sequence: gameState.currentSequence,
        accuracyPercentage: scoringData.accuracyPercentage,
        difficultyMultiplier: scoringData.difficultyMultiplier,
        speedBonus: scoringData.speedBonus,
        settings,
        mistakes: 0,
      };

      // Calculate score and record statistics
      const scoreResult = recordGame(gameResultExtended);

      // Create basic result for navigation
      const result: GameResult = {
        isCorrect,
        userAnswer: answer,
        correctAnswer: gameState.correctSum,
        responseTime,
        score: scoringData.score,
        sequence: gameState.currentSequence,
        accuracyPercentage: scoringData.accuracyPercentage,
        difficultyMultiplier: scoringData.difficultyMultiplier,
        speedBonus: scoringData.speedBonus,
      };

      setGameState((prev) => ({ ...prev, state: 'finished', endTime }));
      setShowInput(false);

      // Navigate to results immediately
      onNavigate('results', result, scoreResult);
    }
  };

  const handleNumberInput = (digit: string): void => {
    if (gameState.state !== 'input' || gameState.userAnswer.length >= 6) return;

    const newAnswer = gameState.userAnswer + digit;
    setGameState((prev) => ({ ...prev, userAnswer: newAnswer }));

    audioManagerRef.current?.playSound('keypress', settings.soundEnabled);
    audioManagerRef.current?.triggerHaptic('light', settings.hapticEnabled);
  };

  const handleClearInput = (): void => {
    if (gameState.state !== 'input') return;

    setGameState((prev) => ({ ...prev, userAnswer: '' }));
    audioManagerRef.current?.playSound('clear', settings.soundEnabled);
    audioManagerRef.current?.triggerHaptic('medium', settings.hapticEnabled);
  };

  const handleSubmitAnswer = (): void => {
    if (gameState.state !== 'input' || !gameState.userAnswer) return;

    const userSum = parseInt(gameState.userAnswer);
    handleAnswerSubmission(userSum);
  };

  return (
    <section className="game-screen-container" data-testid="game-screen">
      {/* Main Game Content */}
      <div className="game-main-content">
        <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
          {!showInput && (
            <div className="number-display">
              <span
                id="current-number"
                data-testid="current-number"
                className={`${
                  currentNumber.includes('Get Ready') ||
                  currentNumber.includes('Enter') ||
                  (settings.audioOnlyMode &&
                    settings.voiceEnabled &&
                    gameState.state === 'playing')
                    ? 'text-2xl font-medium'
                    : 'text-6xl font-bold'
                }`}
              >
                {settings.audioOnlyMode &&
                settings.voiceEnabled &&
                gameState.state === 'playing' &&
                !currentNumber.includes('Get Ready')
                  ? 'Listen...'
                  : currentNumber}
              </span>
            </div>
          )}

          {!showInput && (
            <div
              className="glass-card text-center"
              data-testid="sequence-progress"
            >
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {sequencePosition.current}
                </span>{' '}
                of{' '}
                <span className="font-semibold">{sequencePosition.total}</span>
              </p>
            </div>
          )}

          <div
            data-testid="game-state"
            data-state={gameState.state}
            className="hidden"
          ></div>
          <div data-testid="game-timer" className="hidden"></div>
        </div>
      </div>

      {/* Input Panel Overlay */}
      {showInput && (
        <>
          <div
            className="game-input-backdrop"
            onClick={(e) => e.stopPropagation()}
          ></div>
          <div className="game-input-panel-new" data-testid="new-input-panel">
            <div className="game-input-content">
              <div className="text-center space-y-4">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="answer-display"
                    className="text-lg font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Your Answer:
                  </label>
                  {settings.voiceRecognitionEnabled &&
                    voiceRecognition.isSupported && (
                      <button
                        onClick={() => {
                          setGameState((prev) => ({
                            ...prev,
                            state: 'voiceListening',
                            isVoiceMode: true,
                          }));
                          setShowInput(false);
                          setVoiceRetryCount(0);
                          startVoiceRecognition();
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        title="Use voice input"
                      >
                        🎤 Voice
                      </button>
                    )}
                </div>
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
        </>
      )}

      {/* Voice Recognition Indicator */}
      {gameState.isVoiceMode && (
        <VoiceIndicator
          isListening={voiceRecognition.state.isListening}
          isProcessing={
            voiceRecognition.state.isProcessing ||
            gameState.state === 'voiceProcessing'
          }
          error={voiceRecognition.state.error}
          transcript={voiceRecognition.state.transcript}
          onRetry={retryVoiceRecognition}
          onCancel={fallbackToKeyboard}
        />
      )}
    </section>
  );
};
