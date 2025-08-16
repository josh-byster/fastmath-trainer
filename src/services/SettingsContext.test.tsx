import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsProvider, useSettings } from './SettingsContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Test component to use the context
const TestComponent: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();

  return (
    <div>
      <div data-testid="digit-count">{settings.digitCount}</div>
      <div data-testid="sequence-length">{settings.sequenceLength}</div>
      <div data-testid="time-on-screen">{settings.timeOnScreen}</div>
      <div data-testid="time-between">{settings.timeBetween}</div>
      <div data-testid="sound-enabled">{settings.soundEnabled.toString()}</div>
      <div data-testid="haptic-enabled">
        {settings.hapticEnabled.toString()}
      </div>

      <button
        data-testid="update-settings"
        onClick={() => updateSettings({ digitCount: 3, soundEnabled: false })}
      >
        Update Settings
      </button>

      <button data-testid="reset-settings" onClick={resetSettings}>
        Reset Settings
      </button>
    </div>
  );
};

describe('SettingsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('provides default settings when no saved settings exist', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(screen.getByTestId('digit-count')).toHaveTextContent('2');
    expect(screen.getByTestId('sequence-length')).toHaveTextContent('5');
    expect(screen.getByTestId('time-on-screen')).toHaveTextContent('1000');
    expect(screen.getByTestId('time-between')).toHaveTextContent('300');
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('true');
    expect(screen.getByTestId('haptic-enabled')).toHaveTextContent('true');
  });

  it('loads saved settings from localStorage', () => {
    const savedSettings = {
      digitCount: 3,
      sequenceLength: 7,
      soundEnabled: false,
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedSettings));

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    expect(screen.getByTestId('digit-count')).toHaveTextContent('3');
    expect(screen.getByTestId('sequence-length')).toHaveTextContent('7');
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false');
    // Default values should still be present for unspecified settings
    expect(screen.getByTestId('time-on-screen')).toHaveTextContent('1000');
    expect(screen.getByTestId('haptic-enabled')).toHaveTextContent('true');
  });

  it('handles invalid JSON in localStorage gracefully', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    localStorageMock.getItem.mockReturnValue('invalid json');

    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    // Should fall back to default settings
    expect(screen.getByTestId('digit-count')).toHaveTextContent('2');
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to parse saved settings:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('updates settings and saves to localStorage', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    fireEvent.click(screen.getByTestId('update-settings'));

    expect(screen.getByTestId('digit-count')).toHaveTextContent('3');
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('false');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'fastmath-settings',
      JSON.stringify({
        digitCount: 3,
        sequenceLength: 5,
        timeOnScreen: 1000,
        timeBetween: 300,
        soundEnabled: false,
        hapticEnabled: true,
      })
    );
  });

  it('resets settings to defaults and saves to localStorage', () => {
    // First update settings
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );

    fireEvent.click(screen.getByTestId('update-settings'));

    expect(screen.getByTestId('digit-count')).toHaveTextContent('3');

    // Then reset
    fireEvent.click(screen.getByTestId('reset-settings'));

    expect(screen.getByTestId('digit-count')).toHaveTextContent('2');
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('true');
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
      'fastmath-settings',
      JSON.stringify({
        digitCount: 2,
        sequenceLength: 5,
        timeOnScreen: 1000,
        timeBetween: 300,
        soundEnabled: true,
        hapticEnabled: true,
      })
    );
  });

  it('throws error when useSettings is used outside provider', () => {
    const TestComponentWithoutProvider = () => {
      useSettings();
      return <div>Test</div>;
    };

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useSettings must be used within a SettingsProvider');

    consoleSpy.mockRestore();
  });

  it('partially updates settings without affecting other values', () => {
    const PartialUpdateTestComponent: React.FC = () => {
      const { settings, updateSettings } = useSettings();

      return (
        <div>
          <div data-testid="digit-count">{settings.digitCount}</div>
          <div data-testid="sequence-length">{settings.sequenceLength}</div>
          <div data-testid="sound-enabled">
            {settings.soundEnabled.toString()}
          </div>

          <button
            data-testid="partial-update"
            onClick={() => updateSettings({ digitCount: 3 })}
          >
            Update Digit Count
          </button>
        </div>
      );
    };

    render(
      <SettingsProvider>
        <PartialUpdateTestComponent />
      </SettingsProvider>
    );

    fireEvent.click(screen.getByTestId('partial-update'));

    expect(screen.getByTestId('digit-count')).toHaveTextContent('3');
    // Other settings should remain unchanged
    expect(screen.getByTestId('sequence-length')).toHaveTextContent('5');
    expect(screen.getByTestId('sound-enabled')).toHaveTextContent('true');
  });
});
