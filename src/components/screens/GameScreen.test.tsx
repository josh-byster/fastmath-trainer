import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GameScreen } from './GameScreen';
import { SettingsProvider } from '../../services/SettingsContext';

// Mock AudioManager
jest.mock('../../utils/audioManager', () => ({
  AudioManager: jest.fn().mockImplementation(() => ({
    playSound: jest.fn(),
    triggerHaptic: jest.fn(),
    cleanup: jest.fn(),
  })),
}));

describe('GameScreen', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderGameScreen = () => {
    return render(
      <SettingsProvider>
        <GameScreen onNavigate={mockOnNavigate} />
      </SettingsProvider>
    );
  };

  it('renders the game screen', () => {
    renderGameScreen();
    
    expect(screen.getByTestId('game-screen')).toBeInTheDocument();
  });

  it('shows game state element', () => {
    renderGameScreen();
    
    expect(screen.getByTestId('game-state')).toBeInTheDocument();
  });

  it('displays current number element', () => {
    renderGameScreen();
    
    expect(screen.getByTestId('current-number')).toBeInTheDocument();
  });

  it('shows progress indicator', () => {
    renderGameScreen();
    
    expect(screen.getByTestId('sequence-progress')).toBeInTheDocument();
  });

  it('displays timer element', () => {
    renderGameScreen();
    
    expect(screen.getByTestId('game-timer')).toBeInTheDocument();
  });
});