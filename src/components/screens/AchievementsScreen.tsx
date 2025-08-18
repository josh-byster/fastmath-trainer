import React, { useState, useEffect } from 'react';
import { Screen } from '../../types/game.types';
import { useStatistics } from '../../contexts/StatisticsContext';
import { Achievement } from '../../utils/statisticsManager';

interface AchievementsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  onNavigate,
}) => {
  const { statisticsManager } = useStatistics();
  const [achievements, setAchievements] = useState<
    (Achievement & { isUnlocked: boolean })[]
  >([]);

  useEffect(() => {
    const allAchievements =
      statisticsManager.getAllAvailableAchievementsWithStatus();
    setAchievements(allAchievements);
  }, [statisticsManager]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const completionPercentage =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen overflow-y-auto py-8 px-4">
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gradient">Achievements</h2>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-700 dark:text-slate-200">
              {unlockedCount}/{totalCount}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {completionPercentage}% Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="glass rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">
              Overall Progress
            </h3>
            <span className="text-2xl">🏆</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 mb-4">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Keep playing to unlock more achievements!</span>
            <span>{completionPercentage}%</span>
          </div>
        </div>

        {/* Achievement Categories */}
        {totalCount > 0 ? (
          <div className="space-y-6">
            {/* Unlocked Achievements */}
            {unlockedCount > 0 && (
              <div className="glass rounded-lg p-6">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🎉</span>
                  Unlocked ({unlockedCount})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements
                    .filter((achievement) => achievement.isUnlocked)
                    .map((achievement) => (
                      <div
                        key={achievement.id}
                        className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 transition-all duration-200"
                      >
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
                                Unlocked:{' '}
                                {new Date(
                                  achievement.unlockedAt
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {totalCount > unlockedCount && (
              <div className="glass rounded-lg p-6">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
                  <span className="text-2xl mr-2">🔒</span>
                  Locked ({totalCount - unlockedCount})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements
                    .filter((achievement) => !achievement.isUnlocked)
                    .map((achievement) => (
                      <div
                        key={achievement.id}
                        className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border border-slate-200 dark:border-slate-600 opacity-60 rounded-lg p-4 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">🔒</div>
                          <div>
                            <div className="font-bold text-slate-600 dark:text-slate-400">
                              {achievement.name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-500">
                              {achievement.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* No Achievements State */
          <div className="glass rounded-lg p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-3">
              No Achievements Yet
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-lg mb-6">
              Play some games to start unlocking achievements!
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-4 pt-6">
          <button
            className="btn-secondary-modern flex-1"
            onClick={() => onNavigate('stats')}
          >
            View Stats
          </button>
          <button
            className="btn-primary-modern flex-1"
            onClick={() => onNavigate('game')}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};
