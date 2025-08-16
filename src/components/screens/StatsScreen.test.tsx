import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatsScreen } from './StatsScreen';

describe('StatsScreen', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  it('renders the statistics title', () => {
    render(<StatsScreen onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Statistics')).toBeInTheDocument();
  });

  it('displays placeholder content', () => {
    render(<StatsScreen onNavigate={mockOnNavigate} />);
    
    expect(screen.getByText('Statistics feature coming soon!')).toBeInTheDocument();
    expect(screen.getByText('Play some games to see your progress here.')).toBeInTheDocument();
  });

  it('renders return home button', () => {
    render(<StatsScreen onNavigate={mockOnNavigate} />);
    
    const homeButton = screen.getByText('Return Home');
    expect(homeButton).toBeInTheDocument();
  });

  it('renders start game button', () => {
    render(<StatsScreen onNavigate={mockOnNavigate} />);
    
    const gameButton = screen.getByText('Start Game');
    expect(gameButton).toBeInTheDocument();
  });

  it('navigates to home when return home button is clicked', () => {
    render(<StatsScreen onNavigate={mockOnNavigate} />);
    
    const homeButton = screen.getByText('Return Home');
    fireEvent.click(homeButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('home');
  });

  it('navigates to game when start game button is clicked', () => {
    render(<StatsScreen onNavigate={mockOnNavigate} />);
    
    const gameButton = screen.getByText('Start Game');
    fireEvent.click(gameButton);
    
    expect(mockOnNavigate).toHaveBeenCalledWith('game');
  });

  it('has correct CSS classes applied', () => {
    render(<StatsScreen onNavigate={mockOnNavigate} />);
    
    const section = document.querySelector('.screen.active');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('screen', 'active');
  });
});