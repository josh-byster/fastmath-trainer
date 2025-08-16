import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatsScreen } from './StatsScreen';
import { StatisticsProvider } from '../../contexts/StatisticsContext';

describe('StatsScreen', () => {
  const mockOnNavigate = jest.fn();

  const renderStatsScreen = () => {
    return render(
      <StatisticsProvider>
        <StatsScreen onNavigate={mockOnNavigate} />
      </StatisticsProvider>
    );
  };

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  it('renders the statistics title', () => {
    renderStatsScreen();
    
    expect(screen.getByText('Your Progress')).toBeInTheDocument();
  });

  it('displays placeholder content when no data', () => {
    renderStatsScreen();
    
    expect(screen.getByText('No Statistics Yet')).toBeInTheDocument();
    expect(screen.getByText('Play some games to see your progress here.')).toBeInTheDocument();
  });

  it('renders return home button', () => {
    renderStatsScreen();
    
    const homeButton = screen.getByText('Return Home');
    expect(homeButton).toBeInTheDocument();
  });

  it('renders start game button', () => {
    renderStatsScreen();
    
    const gameButton = screen.getByText('Start Game');
    expect(gameButton).toBeInTheDocument();
  });

  it('navigates to home when return home button is clicked', () => {
    renderStatsScreen();
    
    const homeButton = screen.getByText('Return Home');
    fireEvent.click(homeButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('home');
  });

  it('navigates to game when start game button is clicked', () => {
    renderStatsScreen();
    
    const gameButton = screen.getByText('Start Game');
    fireEvent.click(gameButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('game');
  });

  it('renders export data button', () => {
    renderStatsScreen();
    
    expect(screen.getByText('Export Data')).toBeInTheDocument();
  });
});