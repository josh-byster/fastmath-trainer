import React, { useState, useRef } from 'react';
import { GameResult } from '../types/game.types';

interface ScoreTooltipProps {
  result: GameResult;
  type: 'accuracy' | 'speed';
  children: React.ReactNode;
}

export const ScoreTooltip: React.FC<ScoreTooltipProps> = ({
  result,
  type,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const getTooltipContent = () => {
    if (type === 'accuracy') {
      const basePoints = Math.round(result.difficultyMultiplier * 100);
      const accuracyPoints = Math.round(
        result.difficultyMultiplier * 100 * (result.accuracyPercentage / 100)
      );

      return (
        <div className="space-y-2">
          <div className="font-semibold text-sm">
            Accuracy Points Calculation:
          </div>
          <div className="text-xs space-y-1">
            <div>Base Points: {basePoints}</div>
            <div>Accuracy: {result.accuracyPercentage}%</div>
            <div>Difficulty Multiplier: {result.difficultyMultiplier}x</div>
            <div className="border-t border-white/20 pt-1 font-medium">
              {basePoints} × {result.accuracyPercentage}% = {accuracyPoints}{' '}
              points
            </div>
          </div>
        </div>
      );
    } else {
      const timeInSeconds = (result.responseTime / 1000).toFixed(3);
      const maxBonus = 50;
      const cutoffTime = 5;

      return (
        <div className="space-y-2">
          <div className="font-semibold text-sm">Speed Bonus Calculation:</div>
          <div className="text-xs space-y-1">
            <div>Response Time: {timeInSeconds}s</div>
            <div>Max Bonus: {maxBonus} points (at 1s)</div>
            <div>Cutoff Time: {cutoffTime}s (no bonus after)</div>
            {result.speedBonus > 0 ? (
              <div className="border-t border-white/20 pt-1 font-medium">
                Exponential decay formula applied: {result.speedBonus} points
              </div>
            ) : (
              <div className="border-t border-white/20 pt-1 font-medium text-slate-400">
                {result.responseTime >= 5000
                  ? 'Too slow for bonus'
                  : 'No bonus (incorrect answer)'}
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  const getTooltipPosition = () => {
    if (!triggerRef.current) return 'center';

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const tooltipWidth = 256; // w-64 = 16rem = 256px

    // Check if tooltip would overflow on the right
    if (rect.right + tooltipWidth / 2 > viewportWidth - 16) {
      return 'right';
    }

    // Check if tooltip would overflow on the left
    if (rect.left - tooltipWidth / 2 < 16) {
      return 'left';
    }

    return 'center';
  };

  const position = isVisible ? getTooltipPosition() : 'center';

  return (
    <div className="relative" ref={triggerRef}>
      <div
        className="cursor-pointer"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute bottom-full mb-2 z-50 ${
            position === 'left'
              ? 'left-0'
              : position === 'right'
              ? 'right-0'
              : 'left-1/2 transform -translate-x-1/2'
          }`}
        >
          <div className="bg-slate-800 dark:bg-slate-700 text-white rounded-lg p-3 shadow-lg border border-slate-600 w-64 relative">
            <div
              className={`absolute top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800 dark:border-t-slate-700 ${
                position === 'left'
                  ? 'left-6'
                  : position === 'right'
                  ? 'right-6'
                  : 'left-1/2 transform -translate-x-1/2'
              }`}
            ></div>
            {getTooltipContent()}
          </div>
        </div>
      )}
    </div>
  );
};
