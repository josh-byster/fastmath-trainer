import React from 'react';
import { Screen } from '../types/game.types';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentScreen, 
  onNavigate 
}) => {
  const navItems: { screen: Screen; label: string }[] = [
    { screen: 'home', label: 'Home' },
    { screen: 'settings', label: 'Settings' },
    { screen: 'stats', label: 'Stats' },
  ];

  return (
    <footer className="app-footer">
      <nav className="bottom-nav">
        {navItems.map(({ screen, label }) => (
          <button
            key={screen}
            className={`nav-btn ${currentScreen === screen ? 'active' : ''}`}
            onClick={() => onNavigate(screen)}
          >
            {label}
          </button>
        ))}
      </nav>
    </footer>
  );
};