import React, { useState, useEffect } from 'react';
import { Screen } from '../../types/game.types';
import { useStatistics } from '../../contexts/StatisticsContext';
import { StatsSummary, Achievement, RecentGame } from '../../utils/statisticsManager';

interface StatsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ onNavigate }) => {
  const { statisticsManager } = useStatistics();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const summary = statisticsManager.getStatsSummary();
    const recent = statisticsManager.getRecentGames(10);
    const allAchievements = statisticsManager.getAllAchievements();
    
    setStats(summary);
    setRecentGames(recent);
    setAchievements(allAchievements);
  }, [statisticsManager]);

  const handleExport = () => {
    statisticsManager.exportData();
  };

  const handleReset = () => {
    if (statisticsManager.reset()) {
      // Refresh data after reset
      const summary = statisticsManager.getStatsSummary();
      const recent = statisticsManager.getRecentGames(10);
      const allAchievements = statisticsManager.getAllAchievements();
      
      setStats(summary);
      setRecentGames(recent);
      setAchievements(allAchievements);
    }
  };

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="screen-modern pb-24">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gradient">Your Progress</h2>
          <button 
            className="btn-secondary-modern text-sm"
            onClick={handleExport}
          >
            Export Data
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.totalGames}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Games Played</div>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.accuracy}%
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Accuracy</div>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.bestScore}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Best Score</div>
          </div>
          <div className="glass rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.bestStreak}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Best Streak</div>
          </div>
        </div>

        {/* Current Streak */}
        {stats.currentStreak > 0 && (
          <div className="glass rounded-lg p-4 text-center mb-6">
            <div className="text-xl font-bold text-gradient mb-2">
              🔥 Current Streak: {stats.currentStreak}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Keep going to beat your record!
            </div>
          </div>
        )}

        {/* Recent Games */}
        {recentGames.length > 0 && (
          <div className="glass rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">
              Recent Games
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentGames.map((game, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${
                      game.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-200">
                        Score: {game.score}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {game.difficulty} • {(game.responseTime / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {game.timestamp.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="glass rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">
              Achievements ({achievements.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <div className="font-bold text-yellow-800 dark:text-yellow-200">
                        {achievement.name}
                      </div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-300">
                        {achievement.description}
                      </div>
                      {achievement.unlockedAt && (
                        <div className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Data State */}
        {stats.totalGames === 0 && (
          <div className="glass rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-3">
              No Statistics Yet
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-lg mb-6">
              Play some games to see your progress here.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-4 pt-6">
          <button 
            className="btn-secondary-modern flex-1"
            onClick={() => onNavigate('home')}
          >
            Return Home
          </button>
          <button 
            className="btn-primary-modern flex-1"
            onClick={() => onNavigate('game')}
          >
            Start Game
          </button>
          {stats.totalGames > 0 && (
            <button 
              className="btn-secondary-modern px-4"
              onClick={handleReset}
              title="Reset all statistics"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};