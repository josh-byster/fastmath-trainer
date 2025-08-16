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
      <div className="screen-modern pb-24">
        <div className="w-full max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gradient mb-8">Results</h2>
          <div className="result-card">
            <p className="text-slate-600 dark:text-slate-300 mb-6">No results to display</p>
            <button 
              className="btn-primary-modern"
              onClick={() => onNavigate('home')}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePlayAgain = (): void => {
    onNavigate('game');
  };


  return (
    <div className="screen-modern pb-24" data-testid="results-screen">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-2">Results</h2>
        </div>

        <div className="result-card text-center">
          <div className="mb-6">
            <h3 className={`text-4xl font-bold mb-4 ${
              result.isCorrect 
                ? 'text-gradient-success' 
                : 'text-gradient-error'
            }`}>
              {result.isCorrect ? 'Correct!' : 'Incorrect'}
            </h3>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg font-medium text-slate-600 dark:text-slate-300">Score:</span>
              <span className="score-display text-2xl font-bold" data-testid="score">
                {result.score}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-lg p-4">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Your Answer:
                </div>
                <div className={`text-xl font-bold ${
                  result.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {result.userAnswer}
                </div>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Correct Answer:
                </div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {result.correctAnswer}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-lg p-4">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Response Time:
                </div>
                <div className="text-lg font-semibold text-slate-700 dark:text-slate-200">
                  {GameLogic.formatTime(result.responseTime)}
                </div>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Sequence:
                </div>
                <div className="text-lg font-semibold text-slate-700 dark:text-slate-200 font-mono">
                  {GameLogic.formatSequence(result.sequence)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 pt-6">
            <button 
              className="btn-primary-modern flex-1"
              data-testid="play-again-btn"
              onClick={handlePlayAgain}
            >
              Play Again
            </button>
            <button 
              className="btn-secondary-modern flex-1"
              data-testid="home-btn"
              onClick={() => onNavigate('home')}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};