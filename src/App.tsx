import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Screen, GameResult } from './types/game.types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeScreen } from './components/screens/HomeScreen';
import { GameScreen } from './components/screens/GameScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';
import { StatsScreen } from './components/screens/StatsScreen';
import { SettingsProvider } from './services/SettingsContext';
import { ThemeProvider } from './contexts/ThemeContext';

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
    const screenComponents = {
      home: <HomeScreen onStartGame={() => navigateToScreen('game')} />,
      game: <GameScreen onNavigate={navigateToScreen} />,
      settings: <SettingsScreen onNavigate={navigateToScreen} />,
      results: <ResultsScreen onNavigate={navigateToScreen} result={gameResult} />,
      stats: <StatsScreen onNavigate={navigateToScreen} />
    };

    return screenComponents[currentScreen] || screenComponents.home;
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      x: 300,
      scale: 0.8
    },
    in: {
      opacity: 1,
      x: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      x: -300,
      scale: 0.8
    }
  };

  const pageTransition = {
    type: "tween" as const,
    ease: [0.25, 0.1, 0.25, 1] as const,
    duration: 0.5
  };

  return (
    <ThemeProvider>
      <SettingsProvider>
        <div className="min-h-screen relative overflow-hidden">
          {/* Background Elements */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
          </div>

          <Header onSettingsClick={() => navigateToScreen('settings')} />
          
          <main className="relative z-10 pb-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScreen}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
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
    </ThemeProvider>
  );
};

export default App;