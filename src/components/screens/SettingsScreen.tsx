import React, { useState, useEffect } from 'react';
import { Screen } from '../../types/game.types';
import { useSettings } from '../../services/SettingsContext';
import { GameLogic } from '../../utils/gameLogic';
import { AudioManager } from '../../utils/audioManager';

interface SettingsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onNavigate,
}) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [audioManager] = useState(() => new AudioManager());

  const handleTimeOnScreenChange = (value: string): void => {
    updateSettings({ timeOnScreen: parseInt(value) });
  };

  const handleTimeBetweenChange = (value: string): void => {
    updateSettings({ timeBetween: parseInt(value) });
  };

  const handleDigitCountChange = (digitCount: 2 | 3 | 4 | 5): void => {
    updateSettings({ digitCount });
  };

  const handleSequenceLengthChange = (change: number): void => {
    const newLength = Math.max(
      3,
      Math.min(50, settings.sequenceLength + change)
    );
    updateSettings({ sequenceLength: newLength });
  };

  const handleSoundToggle = (): void => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleHapticToggle = (): void => {
    updateSettings({ hapticEnabled: !settings.hapticEnabled });
  };

  const handleVoiceToggle = (): void => {
    updateSettings({ voiceEnabled: !settings.voiceEnabled });
  };

  const handleSpeechRateChange = (value: string): void => {
    updateSettings({ speechRate: parseFloat(value) });
  };

  const handleVoiceChange = (voiceURI: string): void => {
    updateSettings({ voiceURI });
  };

  const handleTestVoice = async (): Promise<void> => {
    if (settings.voiceEnabled) {
      await audioManager.speakNumber(
        1234,
        true,
        settings.speechRate,
        settings.voiceURI
      );
    }
  };

  useEffect(() => {
    // Load available voices
    audioManager.loadVoices().then(setAvailableVoices);
  }, [audioManager]);

  const handleReset = (): void => {
    resetSettings();
  };

  const handleSaveAndStart = (): void => {
    onNavigate('game');
  };

  const difficultyLevel = GameLogic.getDifficultyLevel(settings);

  return (
    <div
      className="min-h-screen overflow-y-auto py-8 px-4"
      data-testid="settings-screen"
    >
      <div className="w-full max-w-2xl mx-auto space-y-6 pb-24">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-2">
            Game Settings
          </h2>
        </div>

        {/* Timing Settings */}
        <div className="settings-section">
          <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
            Timing Settings
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="time-on-screen"
                className="block text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Time on Screen
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="time-on-screen"
                  data-testid="time-on-screen-slider"
                  min="50"
                  max="3000"
                  step="50"
                  value={settings.timeOnScreen}
                  onChange={(e) => handleTimeOnScreenChange(e.target.value)}
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 min-w-[60px]">
                  {settings.timeOnScreen}ms
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How long each number is displayed
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="time-between"
                className="block text-sm font-medium text-slate-600 dark:text-slate-300"
              >
                Time Between Numbers
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  id="time-between"
                  data-testid="time-between-slider"
                  min="100"
                  max="1000"
                  step="50"
                  value={settings.timeBetween}
                  onChange={(e) => handleTimeBetweenChange(e.target.value)}
                  className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 min-w-[60px]">
                  {settings.timeBetween}ms
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pause between each number
              </p>
            </div>
          </div>
        </div>

        {/* Difficulty Settings */}
        <div className="settings-section">
          <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
            Difficulty Settings
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                Number Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    settings.digitCount === 2
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'glass text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-white/10'
                  }`}
                  data-testid="digit-count-2"
                  onClick={() => handleDigitCountChange(2)}
                >
                  2-Digit
                </button>
                <button
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    settings.digitCount === 3
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'glass text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-white/10'
                  }`}
                  data-testid="digit-count-3"
                  onClick={() => handleDigitCountChange(3)}
                >
                  3-Digit
                </button>
                <button
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    settings.digitCount === 4
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'glass text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-white/10'
                  }`}
                  data-testid="digit-count-4"
                  onClick={() => handleDigitCountChange(4)}
                >
                  4-Digit
                </button>
                <button
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                    settings.digitCount === 5
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'glass text-slate-700 dark:text-slate-200 hover:bg-white/30 dark:hover:bg-white/10'
                  }`}
                  data-testid="digit-count-5"
                  onClick={() => handleDigitCountChange(5)}
                >
                  5-Digit
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                2-digit (10-99), 3-digit (100-999), 4-digit (1000-9999), or
                5-digit (10000-99999)
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                Sequence Length
              </label>
              <div className="flex items-center space-x-2">
                <button
                  className="w-8 h-8 glass rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="sequence-length-minus"
                  onClick={() => handleSequenceLengthChange(-1)}
                  disabled={settings.sequenceLength <= 3}
                >
                  −
                </button>
                <input
                  type="number"
                  id="sequence-length"
                  data-testid="sequence-length-input"
                  min="3"
                  max="50"
                  value={settings.sequenceLength}
                  readOnly
                  className="w-16 h-8 text-center bg-transparent border border-white/20 dark:border-white/10 rounded-lg text-slate-700 dark:text-slate-200 font-medium"
                />
                <button
                  className="w-8 h-8 glass rounded-lg flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="sequence-length-plus"
                  onClick={() => handleSequenceLengthChange(1)}
                  disabled={settings.sequenceLength >= 50}
                >
                  +
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How many numbers to show in each round
              </p>
            </div>
          </div>
        </div>

        {/* Audio & Feedback */}
        <div className="settings-section">
          <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
            Audio & Feedback
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Sound Effects
              </label>
              <div className="relative">
                <input
                  type="checkbox"
                  id="sound-enabled"
                  data-testid="sound-toggle"
                  checked={settings.soundEnabled}
                  onChange={handleSoundToggle}
                  className="sr-only"
                />
                <label
                  htmlFor="sound-enabled"
                  className={`flex items-center cursor-pointer w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                    settings.soundEnabled
                      ? 'bg-blue-600'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Haptic Feedback
              </label>
              <div className="relative">
                <input
                  type="checkbox"
                  id="haptic-enabled"
                  data-testid="haptic-toggle"
                  checked={settings.hapticEnabled}
                  onChange={handleHapticToggle}
                  className="sr-only"
                />
                <label
                  htmlFor="haptic-enabled"
                  className={`flex items-center cursor-pointer w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                    settings.hapticEnabled
                      ? 'bg-blue-600'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      settings.hapticEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Settings */}
        <div className="settings-section">
          <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
            Voice Narration
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Voice Enabled
              </label>
              <div className="relative">
                <input
                  type="checkbox"
                  id="voice-enabled"
                  data-testid="voice-toggle"
                  checked={settings.voiceEnabled}
                  onChange={handleVoiceToggle}
                  className="sr-only"
                />
                <label
                  htmlFor="voice-enabled"
                  className={`flex items-center cursor-pointer w-12 h-6 rounded-full p-1 transition-colors duration-200 ${
                    settings.voiceEnabled
                      ? 'bg-blue-600'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 ${
                      settings.voiceEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </label>
              </div>
            </div>

            {settings.voiceEnabled && (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="speech-rate"
                    className="block text-sm font-medium text-slate-600 dark:text-slate-300"
                  >
                    Speech Rate
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      id="speech-rate"
                      data-testid="speech-rate-slider"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={settings.speechRate}
                      onChange={(e) => handleSpeechRateChange(e.target.value)}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 min-w-[40px]">
                      {settings.speechRate.toFixed(1)}x
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How fast the numbers are spoken
                  </p>
                </div>

                {availableVoices.length > 0 && (
                  <div className="space-y-2">
                    <label
                      htmlFor="voice-select"
                      className="block text-sm font-medium text-slate-600 dark:text-slate-300"
                    >
                      Voice
                    </label>
                    <select
                      id="voice-select"
                      data-testid="voice-select"
                      value={settings.voiceURI}
                      onChange={(e) => handleVoiceChange(e.target.value)}
                      className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      <option value="">Default Voice</option>
                      {availableVoices.map((voice) => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    className="btn-secondary-modern text-sm px-4 py-2"
                    onClick={handleTestVoice}
                    disabled={!settings.voiceEnabled}
                  >
                    Test Voice
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="settings-section">
          <h3 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
            Preview
          </h3>
          <div
            className="flex items-center space-x-3"
            data-testid="difficulty-indicator"
          >
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Current Difficulty:
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                difficultyLevel === 'easy'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : difficultyLevel === 'medium'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {difficultyLevel.charAt(0).toUpperCase() +
                difficultyLevel.slice(1)}
            </span>
          </div>
        </div>

        <div className="flex space-x-4 pt-6">
          <button
            className="btn-secondary-modern flex-1"
            data-testid="reset-settings-btn"
            onClick={handleReset}
          >
            Reset to Defaults
          </button>
          <button
            className="btn-primary-modern flex-1"
            onClick={handleSaveAndStart}
          >
            Save & Start Game
          </button>
        </div>
      </div>
    </div>
  );
};
