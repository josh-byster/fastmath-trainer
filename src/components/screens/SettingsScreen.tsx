import React from 'react';
import { Screen } from '../../types/game.types';
import { useSettings } from '../../services/SettingsContext';
import { GameLogic } from '../../utils/gameLogic';

interface SettingsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleTimeOnScreenChange = (value: string): void => {
    updateSettings({ timeOnScreen: parseInt(value) });
  };

  const handleTimeBetweenChange = (value: string): void => {
    updateSettings({ timeBetween: parseInt(value) });
  };

  const handleDigitCountChange = (digitCount: 2 | 3): void => {
    updateSettings({ digitCount });
  };

  const handleSequenceLengthChange = (change: number): void => {
    const newLength = Math.max(3, Math.min(10, settings.sequenceLength + change));
    updateSettings({ sequenceLength: newLength });
  };

  const handleSoundToggle = (): void => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  const handleHapticToggle = (): void => {
    updateSettings({ hapticEnabled: !settings.hapticEnabled });
  };

  const handleReset = (): void => {
    resetSettings();
  };

  const handleSaveAndStart = (): void => {
    onNavigate('game');
  };

  const difficultyLevel = GameLogic.getDifficultyLevel(settings);

  return (
    <section className="screen active">
      <h2>Game Settings</h2>
      <div className="settings-container">
        
        {/* Timing Settings */}
        <div className="settings-section">
          <h3>Timing Settings</h3>
          
          <div className="setting-item">
            <label htmlFor="time-on-screen">Time on Screen</label>
            <div className="slider-container">
              <input
                type="range"
                id="time-on-screen"
                data-testid="time-on-screen-slider"
                min="500"
                max="3000"
                step="100"
                value={settings.timeOnScreen}
                onChange={(e) => handleTimeOnScreenChange(e.target.value)}
              />
              <span className="slider-value">{settings.timeOnScreen}ms</span>
            </div>
            <div className="setting-description">
              How long each number is displayed
            </div>
          </div>

          <div className="setting-item">
            <label htmlFor="time-between">Time Between Numbers</label>
            <div className="slider-container">
              <input
                type="range"
                id="time-between"
                data-testid="time-between-slider"
                min="100"
                max="1000"
                step="50"
                value={settings.timeBetween}
                onChange={(e) => handleTimeBetweenChange(e.target.value)}
              />
              <span className="slider-value">{settings.timeBetween}ms</span>
            </div>
            <div className="setting-description">
              Pause between each number
            </div>
          </div>
        </div>

        {/* Difficulty Settings */}
        <div className="settings-section">
          <h3>Difficulty Settings</h3>
          
          <div className="setting-item">
            <label>Number Type</label>
            <div className="toggle-group">
              <button
                className={`toggle-btn ${settings.digitCount === 2 ? 'active' : ''}`}
                data-testid="digit-count-2"
                onClick={() => handleDigitCountChange(2)}
              >
                2-Digit
              </button>
              <button
                className={`toggle-btn ${settings.digitCount === 3 ? 'active' : ''}`}
                data-testid="digit-count-3"
                onClick={() => handleDigitCountChange(3)}
              >
                3-Digit
              </button>
            </div>
            <div className="setting-description">
              Choose between 2-digit (10-99) or 3-digit (100-999) numbers
            </div>
          </div>

          <div className="setting-item">
            <label>Sequence Length</label>
            <div className="number-input-container">
              <button
                className="number-btn"
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
                max="10"
                value={settings.sequenceLength}
                readOnly
              />
              <button
                className="number-btn"
                data-testid="sequence-length-plus"
                onClick={() => handleSequenceLengthChange(1)}
                disabled={settings.sequenceLength >= 10}
              >
                +
              </button>
            </div>
            <div className="setting-description">
              How many numbers to show in each round
            </div>
          </div>
        </div>

        {/* Audio & Feedback */}
        <div className="settings-section">
          <h3>Audio & Feedback</h3>
          
          <div className="setting-item">
            <label>Sound Effects</label>
            <div className="switch-container">
              <input
                type="checkbox"
                id="sound-enabled"
                data-testid="sound-toggle"
                checked={settings.soundEnabled}
                onChange={handleSoundToggle}
              />
              <label htmlFor="sound-enabled" className="switch"></label>
            </div>
          </div>

          <div className="setting-item">
            <label>Haptic Feedback</label>
            <div className="switch-container">
              <input
                type="checkbox"
                id="haptic-enabled"
                data-testid="haptic-toggle"
                checked={settings.hapticEnabled}
                onChange={handleHapticToggle}
              />
              <label htmlFor="haptic-enabled" className="switch"></label>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="settings-section">
          <h3>Preview</h3>
          <div className="difficulty-indicator" data-testid="difficulty-indicator">
            <span className="difficulty-label">Current Difficulty:</span>
            <span className={`difficulty-badge ${difficultyLevel}`}>
              {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
            </span>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn btn-secondary reset-btn" data-testid="reset-settings-btn" onClick={handleReset}>
            Reset to Defaults
          </button>
          <button className="btn btn-primary save-btn" onClick={handleSaveAndStart}>
            Save & Start Game
          </button>
        </div>
      </div>
    </section>
  );
};