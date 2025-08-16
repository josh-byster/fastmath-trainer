import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { StatisticsManager, Achievement } from '../utils/statisticsManager';
import {
  ScoringSystem,
  GameResultExtended,
  ScoreResult,
} from '../utils/scoringSystem';
import { GameLogic } from '../utils/gameLogic';
import { AchievementNotification } from '../components/AchievementNotification';

interface StatisticsContextType {
  statisticsManager: StatisticsManager;
  scoringSystem: ScoringSystem;
  recordGame: (gameResult: GameResultExtended) => ScoreResult;
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(
  undefined
);

export const StatisticsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const statisticsManagerRef = useRef<StatisticsManager | null>(null);
  const scoringSystemRef = useRef<ScoringSystem | null>(null);
  const [activeAchievement, setActiveAchievement] =
    useState<Achievement | null>(null);

  // Initialize managers only once
  if (!statisticsManagerRef.current) {
    statisticsManagerRef.current = new StatisticsManager();
  }

  if (!scoringSystemRef.current) {
    scoringSystemRef.current = new ScoringSystem();
  }

  useEffect(() => {
    // Set up achievement notification handler
    if (statisticsManagerRef.current) {
      statisticsManagerRef.current.onAchievementUnlocked((achievement) => {
        setActiveAchievement(achievement);
      });
    }
  }, []);

  const recordGame = (gameResult: GameResultExtended): ScoreResult => {
    if (!scoringSystemRef.current || !statisticsManagerRef.current) {
      throw new Error('Managers not initialized');
    }

    // Use new GameLogic scoring instead of old ScoringSystem
    const scoringData = GameLogic.calculateScore(
      gameResult.userAnswer,
      gameResult.correctAnswer,
      gameResult.responseTime,
      gameResult.settings
    );

    // Create ScoreResult in the format expected by StatisticsManager
    const scoreResult: ScoreResult = {
      score: scoringData.score,
      breakdown: {
        accuracy: scoringData.accuracyPercentage,
        difficulty: scoringData.difficultyMultiplier * 100,
        speed: scoringData.speedBonus,
        total: scoringData.score,
      },
      multipliers: {
        difficulty: scoringData.difficultyMultiplier,
        accuracy: scoringData.accuracyPercentage / 100,
        speed:
          scoringData.speedBonus / (scoringData.difficultyMultiplier * 100),
      },
    };

    statisticsManagerRef.current.recordGame(gameResult, scoreResult);

    return scoreResult;
  };

  const closeAchievementNotification = () => {
    setActiveAchievement(null);
  };

  return (
    <StatisticsContext.Provider
      value={{
        statisticsManager: statisticsManagerRef.current,
        scoringSystem: scoringSystemRef.current,
        recordGame,
      }}
    >
      {children}
      {activeAchievement && (
        <AchievementNotification
          achievement={activeAchievement}
          onClose={closeAchievementNotification}
        />
      )}
    </StatisticsContext.Provider>
  );
};

export const useStatistics = (): StatisticsContextType => {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
};
