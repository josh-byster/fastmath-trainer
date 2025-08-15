import React from 'react';

interface HomeScreenProps {
  onStartGame: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  const handleViewStats = (): void => {
    // TODO: Navigate to stats screen
    console.log('View statistics clicked');
  };

  return (
    <section className="screen active">
      <div className="welcome-content">
        <h2>Mental Math Training</h2>
        <p>Train your mental arithmetic skills</p>
        <button 
          className="btn btn-primary btn-large"
          onClick={onStartGame}
        >
          Start Game
        </button>
        <button 
          className="btn btn-secondary"
          onClick={handleViewStats}
        >
          View Statistics
        </button>
      </div>
    </section>
  );
};