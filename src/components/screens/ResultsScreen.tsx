import React from 'react';
import { Screen, GameResult } from '../../types/game.types';
import { GameLogic } from '../../utils/gameLogic';
import { ScoreResult } from '../../utils/scoringSystem';
import { ScoringSystem } from '../../utils/scoringSystem';

interface ResultsScreenProps {
  onNavigate: (screen: Screen) => void;
  result?: GameResult;
  scoreResult?: ScoreResult;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  onNavigate,
  result,
  scoreResult,
}) => {
  if (!result) {
    return (
      <div className="min-h-screen overflow-y-auto py-8 px-4">
        <div className="w-full max-w-2xl mx-auto text-center pb-4">
          <h2 className="text-3xl font-bold text-gradient mb-8">Results</h2>
          <div className="result-card">
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              No results to display
            </p>
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

  const scoringSystem = new ScoringSystem();
  const rank = scoringSystem.getRankForScore(result.score);

  return (
    <div
      className="min-h-screen overflow-y-auto py-8 px-4"
      data-testid="results-screen"
    >
      <div className="w-full max-w-2xl mx-auto space-y-6 pb-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-2">Results</h2>
        </div>

        <div className="result-card text-center">
          <div className="mb-6">
            <h3
              className={`text-4xl font-bold mb-4 ${
                result.isCorrect
                  ? 'text-gradient-success'
                  : 'text-gradient-error'
              }`}
            >
              {result.isCorrect ? 'Correct!' : 'Incorrect'}
            </h3>
            <div className="flex items-center justify-center space-x-2 mb-4">
              <span className="text-lg font-medium text-slate-600 dark:text-slate-300">
                Score:
              </span>
              <span
                className={`text-2xl font-bold ${
                  result.isCorrect
                    ? 'score-display'
                    : 'bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent'
                }`}
                data-testid="score"
              >
                {result.score}
              </span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Rank:
              </span>
              <span
                className="px-3 py-1 rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: rank.color }}
              >
                {rank.name}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-3">
              Score Breakdown
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="glass rounded-lg p-3 text-center">
                <div
                  className={`text-2xl font-bold ${
                    result.isCorrect
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {Math.round(
                    result.difficultyMultiplier *
                      100 *
                      (result.accuracyPercentage / 100)
                  )}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Accuracy Points
                </div>
              </div>
              <div className="glass rounded-lg p-3 text-center">
                <div
                  className={`text-2xl font-bold ${
                    result.speedBonus > 0
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {result.speedBonus}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Speed Bonus
                </div>
              </div>
            </div>
            <div className="glass rounded-lg p-3 text-center bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                {Math.round(
                  result.difficultyMultiplier *
                    100 *
                    (result.accuracyPercentage / 100)
                )}{' '}
                + {result.speedBonus} =
              </div>
              <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                {result.score} Points
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-lg p-4">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Your Answer:
                </div>
                <div className="text-xl font-bold text-slate-700 dark:text-slate-200">
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
                <div className="text-lg font-semibold text-slate-700 dark:text-slate-200 font-mono break-all">
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
