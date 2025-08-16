import React from 'react';
import { Screen } from '../../types/game.types';

interface StatsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ onNavigate }) => {
  // TODO: Implement actual statistics tracking

  return (
    <div className="screen-modern pb-24">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gradient mb-2">Statistics</h2>
        </div>
        
        <div className="result-card text-center">
          <div className="space-y-6">
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto mb-4 glass rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-3">
                Statistics feature coming soon!
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Play some games to see your progress here.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="glass rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-400 dark:text-slate-500">--</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Games Played</div>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-400 dark:text-slate-500">--</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Accuracy</div>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-400 dark:text-slate-500">--</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Best Score</div>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="text-2xl font-bold text-slate-400 dark:text-slate-500">--</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Avg Time</div>
              </div>
            </div>
          </div>
          
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
          </div>
        </div>
      </div>
    </div>
  );
};