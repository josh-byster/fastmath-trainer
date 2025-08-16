import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResultsScreen } from './ResultsScreen';
import { GameResult } from '../../types/game.types';

describe('ResultsScreen', () => {
  const mockOnNavigate = jest.fn();

  const mockCorrectResult: GameResult = {
    isCorrect: true,
    userAnswer: 25,
    correctAnswer: 25,
    responseTime: 1500,
    score: 100,
    sequence: [10, 5, 7, 3],
    accuracyPercentage: 100,
    difficultyMultiplier: 1.0,
    speedBonus: 20,
  };

  const mockIncorrectResult: GameResult = {
    isCorrect: false,
    userAnswer: 20,
    correctAnswer: 25,
    responseTime: 2000,
    score: 0,
    sequence: [10, 5, 7, 3],
    accuracyPercentage: 80,
    difficultyMultiplier: 1.0,
    speedBonus: 0,
  };

  beforeEach(() => {
    mockOnNavigate.mockClear();
  });

  describe('when no result is provided', () => {
    it('displays no results message', () => {
      render(<ResultsScreen onNavigate={mockOnNavigate} />);

      expect(screen.getByText('No results to display')).toBeInTheDocument();
    });

    it('renders return home button', () => {
      render(<ResultsScreen onNavigate={mockOnNavigate} />);

      const homeButton = screen.getByText('Return Home');
      expect(homeButton).toBeInTheDocument();
    });

    it('navigates to home when button is clicked', () => {
      render(<ResultsScreen onNavigate={mockOnNavigate} />);

      const homeButton = screen.getByText('Return Home');
      fireEvent.click(homeButton);

      expect(mockOnNavigate).toHaveBeenCalledWith('home');
    });
  });

  describe('when correct result is provided', () => {
    it('displays correct status', () => {
      render(
        <ResultsScreen onNavigate={mockOnNavigate} result={mockCorrectResult} />
      );

      expect(screen.getByText('Correct!')).toBeInTheDocument();
    });

    it('displays the score', () => {
      render(
        <ResultsScreen onNavigate={mockOnNavigate} result={mockCorrectResult} />
      );

      expect(screen.getByTestId('score')).toHaveTextContent('100');
    });

    it('displays user and correct answers', () => {
      render(
        <ResultsScreen onNavigate={mockOnNavigate} result={mockCorrectResult} />
      );

      expect(screen.getByText('Your Answer:')).toBeInTheDocument();
      expect(screen.getByText('Correct Answer:')).toBeInTheDocument();
      // Check for the answers themselves (they appear multiple times, so we just check if they exist)
      const answerElements = screen.getAllByText('25');
      expect(answerElements.length).toBeGreaterThanOrEqual(2);
    });

    it('has correct CSS class for correct result', () => {
      render(
        <ResultsScreen onNavigate={mockOnNavigate} result={mockCorrectResult} />
      );

      const status = screen.getByText('Correct!');
      expect(status).toHaveClass('text-gradient-success');
    });
  });

  describe('when incorrect result is provided', () => {
    it('displays incorrect status', () => {
      render(
        <ResultsScreen
          onNavigate={mockOnNavigate}
          result={mockIncorrectResult}
        />
      );

      expect(screen.getByText('Incorrect')).toBeInTheDocument();
    });

    it('displays the score', () => {
      render(
        <ResultsScreen
          onNavigate={mockOnNavigate}
          result={mockIncorrectResult}
        />
      );

      expect(screen.getByTestId('score')).toHaveTextContent('0');
    });

    it('displays different user and correct answers', () => {
      render(
        <ResultsScreen
          onNavigate={mockOnNavigate}
          result={mockIncorrectResult}
        />
      );

      expect(screen.getByText('Your Answer:')).toBeInTheDocument();
      expect(screen.getByText('Correct Answer:')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument(); // user answer
      expect(screen.getByText('25')).toBeInTheDocument(); // correct answer
    });

    it('has correct CSS class for incorrect result', () => {
      render(
        <ResultsScreen
          onNavigate={mockOnNavigate}
          result={mockIncorrectResult}
        />
      );

      const status = screen.getByText('Incorrect');
      expect(status).toHaveClass('text-gradient-error');
    });
  });

  describe('navigation buttons', () => {
    it('renders play again button', () => {
      render(
        <ResultsScreen onNavigate={mockOnNavigate} result={mockCorrectResult} />
      );

      const playAgainButton = screen.getByTestId('play-again-btn');
      expect(playAgainButton).toHaveTextContent('Play Again');
    });

    it('renders return home button', () => {
      render(
        <ResultsScreen onNavigate={mockOnNavigate} result={mockCorrectResult} />
      );

      const homeButton = screen.getByTestId('home-btn');
      expect(homeButton).toHaveTextContent('Return Home');
    });

    it('navigates to game when play again is clicked', () => {
      render(
        <ResultsScreen onNavigate={mockOnNavigate} result={mockCorrectResult} />
      );

      const playAgainButton = screen.getByTestId('play-again-btn');
      fireEvent.click(playAgainButton);

      expect(mockOnNavigate).toHaveBeenCalledWith('game');
    });

    it('navigates to home when return home is clicked', () => {
      render(
        <ResultsScreen onNavigate={mockOnNavigate} result={mockCorrectResult} />
      );

      const homeButton = screen.getByTestId('home-btn');
      fireEvent.click(homeButton);

      expect(mockOnNavigate).toHaveBeenCalledWith('home');
    });
  });

  it('displays performance statistics', () => {
    render(
      <ResultsScreen onNavigate={mockOnNavigate} result={mockCorrectResult} />
    );

    expect(screen.getByText('Response Time:')).toBeInTheDocument();
    expect(screen.getByText('Sequence:')).toBeInTheDocument();
  });
});
