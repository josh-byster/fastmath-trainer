import React from 'react';
import { Screen } from '../../types/game.types';

interface StatsScreenProps {
  onNavigate: (screen: Screen) => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ onNavigate }) => {
  // TODO: Implement actual statistics tracking

  return (
    <section className="screen active">
      <h2>Statistics</h2>
      <div className="stats-content">
        <div className="stats-placeholder">
          <p>Statistics feature coming soon!</p>
          <p>Play some games to see your progress here.</p>
        </div>
        
        <div className="stats-actions">
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('home')}
          >
            Return Home
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate('game')}
          >
            Start Game
          </button>
        </div>
      </div>
    </section>
  );
};