import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsScreen } from './SettingsScreen';
import { SettingsProvider } from '../../services/SettingsContext';

const renderSettingsScreen = (onNavigate = jest.fn()) => {
  return render(
    <SettingsProvider>
      <SettingsScreen onNavigate={onNavigate} />
    </SettingsProvider>
  );
};

describe('SettingsScreen', () => {
  let mockOnNavigate: jest.Mock;

  beforeEach(() => {
    mockOnNavigate = jest.fn();
  });

  it('renders the settings title', () => {
    renderSettingsScreen(mockOnNavigate);
    
    expect(screen.getByText('Game Settings')).toBeInTheDocument();
  });

  it('renders digit count toggle buttons', () => {
    renderSettingsScreen(mockOnNavigate);
    
    expect(screen.getByTestId('digit-count-2')).toBeInTheDocument();
    expect(screen.getByTestId('digit-count-3')).toBeInTheDocument();
    expect(screen.getByText('2-Digit')).toBeInTheDocument();
    expect(screen.getByText('3-Digit')).toBeInTheDocument();
  });

  it('renders sequence length controls', () => {
    renderSettingsScreen(mockOnNavigate);
    
    expect(screen.getByTestId('sequence-length-input')).toBeInTheDocument();
    expect(screen.getByTestId('sequence-length-minus')).toBeInTheDocument();
    expect(screen.getByTestId('sequence-length-plus')).toBeInTheDocument();
  });

  it('renders timing controls', () => {
    renderSettingsScreen(mockOnNavigate);
    
    expect(screen.getByLabelText(/Time on Screen/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time Between Numbers/)).toBeInTheDocument();
  });

  it('renders toggle switches for sound and haptic', () => {
    renderSettingsScreen(mockOnNavigate);
    
    expect(screen.getByTestId('sound-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('haptic-toggle')).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    renderSettingsScreen(mockOnNavigate);
    
    expect(screen.getByText('Reset to Defaults')).toBeInTheDocument();
    expect(screen.getByText('Save & Start Game')).toBeInTheDocument();
  });

  it('navigates to game when save and start button is clicked', () => {
    renderSettingsScreen(mockOnNavigate);
    
    const startButton = screen.getByText('Save & Start Game');
    fireEvent.click(startButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('game');
  });

  it('renders difficulty information', () => {
    renderSettingsScreen(mockOnNavigate);
    
    expect(screen.getByText(/Current Difficulty:/)).toBeInTheDocument();
  });


  it('has correct CSS classes applied', () => {
    renderSettingsScreen(mockOnNavigate);
    
    const section = document.querySelector('.screen.active');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('screen', 'active');
  });
});