import React from 'react';
import { Screen, GameResult } from '../../types/game.types';
import { GameLogic } from '../../utils/gameLogic';

interface ResultsScreenProps {
  onNavigate: (screen: Screen) => void;
  result?: GameResult;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ 
  onNavigate, 
  result 
}) => {
  if (!result) {
    return (
      <section className="screen active">
        <h2>Results</h2>
        <div className="results-content">
          <p>No results to display</p>
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('home')}
          >
            Return Home
          </button>
        </div>
      </section>
    );
  }

  const handlePlayAgain = (): void => {
    onNavigate('game');
  };


  return (
    <section className="screen active" data-testid="results-screen">
      <h2>Results</h2>
      <div className="results-content">
        <div className="result-header">
          <h2 className={`result-status ${result.isCorrect ? 'correct' : 'incorrect'}`}>
            {result.isCorrect ? 'Correct!' : 'Incorrect'}
          </h2>
          <div className="score-container">
            <span className="score-label">Score: </span>
            <span className="score-display" data-testid="score">{result.score}</span>
          </div>
        </div>

        <div className="result-details">
          <div className="answer-comparison">
            <div className="answer-item">
              <label>Your Answer:</label>
              <span className="user-answer">{result.userAnswer}</span>
            </div>
            <div className="answer-item">
              <label>Correct Answer:</label>
              <span className="correct-answer">{result.correctAnswer}</span>
            </div>
          </div>

          <div className="performance-stats">
            <div className="stat-item">
              <label>Response Time:</label>
              <span className="response-time">
                {GameLogic.formatTime(result.responseTime)}
              </span>
            </div>
            <div className="stat-item">
              <label>Sequence:</label>
              <span className="sequence-review">
                {GameLogic.formatSequence(result.sequence)}
              </span>
            </div>
          </div>
        </div>

        <div className="result-actions">
          <button 
            className="btn btn-primary play-again-btn"
            data-testid="play-again-btn"
            onClick={handlePlayAgain}
          >
            Play Again
          </button>
          <button 
            className="btn btn-secondary view-stats-btn"
            data-testid="home-btn"
            onClick={() => onNavigate('home')}
          >
            Return Home
          </button>
        </div>
      </div>
    </section>
  );
};