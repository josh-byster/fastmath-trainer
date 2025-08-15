import React from 'react';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="app-header">
      <h1 className="app-title">FastMath</h1>
      <button 
        className="settings-btn" 
        aria-label="Settings"
        onClick={onSettingsClick}
      >
        ⚙️
      </button>
    </header>
  );
};