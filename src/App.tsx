import React, { useState } from 'react';
import { Screen, GameResult } from './types/game.types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeScreen } from './components/screens/HomeScreen';
import { GameScreen } from './components/screens/GameScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';
import { StatsScreen } from './components/screens/StatsScreen';
import { SettingsProvider } from './services/SettingsContext';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [gameResult, setGameResult] = useState<GameResult | undefined>();

  const navigateToScreen = (screen: Screen, result?: GameResult) => {
    if (result) {
      setGameResult(result);
    }
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onStartGame={() => navigateToScreen('game')} />;
      case 'game':
        return <GameScreen onNavigate={navigateToScreen} />;
      case 'settings':
        return <SettingsScreen onNavigate={navigateToScreen} />;
      case 'results':
        return <ResultsScreen onNavigate={navigateToScreen} result={gameResult} />;
      case 'stats':
        return <StatsScreen onNavigate={navigateToScreen} />;
      default:
        return <HomeScreen onStartGame={() => navigateToScreen('game')} />;
    }
  };

  return (
    <SettingsProvider>
      <div id="app">
        <Header onSettingsClick={() => navigateToScreen('settings')} />
        <main className="app-main">
          {renderScreen()}
        </main>
        <Navigation 
          currentScreen={currentScreen} 
          onNavigate={navigateToScreen} 
        />
        <div aria-live="polite" aria-atomic="true" className="sr-only" id="announcements">
          Game state updates will be announced here
        </div>
      </div>
    </SettingsProvider>
  );
};

export default App;