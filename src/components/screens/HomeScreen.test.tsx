import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HomeScreen } from './HomeScreen';

describe('HomeScreen', () => {
  const mockOnStartGame = jest.fn();

  beforeEach(() => {
    mockOnStartGame.mockClear();
  });

  it('renders the welcome content correctly', () => {
    render(<HomeScreen onStartGame={mockOnStartGame} />);
    
    expect(screen.getByText('Mental Math Training')).toBeInTheDocument();
    expect(screen.getByText(/Enhance your mental arithmetic skills/)).toBeInTheDocument();
  });

  it('renders the start game button', () => {
    render(<HomeScreen onStartGame={mockOnStartGame} />);
    
    const startButton = screen.getByTestId('start-game-btn');
    expect(startButton).toBeInTheDocument();
    expect(startButton).toHaveTextContent('Start Training');
  });

  it('renders the view statistics button', () => {
    render(<HomeScreen onStartGame={mockOnStartGame} />);
    
    const statsButton = screen.getByText('View Statistics');
    expect(statsButton).toBeInTheDocument();
  });

  it('calls onStartGame when start game button is clicked', () => {
    render(<HomeScreen onStartGame={mockOnStartGame} />);
    
    const startButton = screen.getByTestId('start-game-btn');
    fireEvent.click(startButton);
    
    expect(mockOnStartGame).toHaveBeenCalledTimes(1);
  });

  it('logs message when view statistics button is clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<HomeScreen onStartGame={mockOnStartGame} />);
    
    const statsButton = screen.getByText('View Statistics');
    fireEvent.click(statsButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('View statistics clicked');
    
    consoleSpy.mockRestore();
  });

  it('has correct CSS classes applied', () => {
    const { container } = render(<HomeScreen onStartGame={mockOnStartGame} />);
    
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('screen-modern', 'flex', 'items-center', 'justify-center');
  });
});