import React, { useState, useEffect } from 'react';
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
import { StatisticsProvider } from './contexts/StatisticsContext';
import { ScoreResult } from './utils/scoringSystem';
import { PWAInstallManager } from './utils/pwaInstallManager';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [gameResult, setGameResult] = useState<GameResult | undefined>();
  const [scoreResult, setScoreResult] = useState<ScoreResult | undefined>();
  const [pwaManager, setPwaManager] = useState<PWAInstallManager | null>(null);

  // Initialize PWA Install Manager
  useEffect(() => {
    const manager = new PWAInstallManager();
    setPwaManager(manager);

    // Handle PWA shortcuts
    const handlePWAShortcut = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { action } = customEvent.detail;

      if (action === 'quick-game') {
        navigateToScreen('game');
      } else if (action === 'stats') {
        navigateToScreen('stats');
      }
    };

    window.addEventListener('pwa-shortcut', handlePWAShortcut);

    // Enhanced service worker registration with update handling
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // Show update available notification
                manager.showUpdateAvailable();
              }
            });
          }
        });
      });

      // Listen for service worker controller changes (after update)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Show success notification
        manager.showUpdateNotification();
        // Reload the page to get the latest version
        window.location.reload();
      });
    }

    // Cleanup
    return () => {
      window.removeEventListener('pwa-shortcut', handlePWAShortcut);
      manager.destroy();
    };
  }, []);

  const navigateToScreen = (
    screen: Screen,
    result?: GameResult,
    score?: ScoreResult
  ) => {
    if (result) {
      setGameResult(result);
    }
    if (score) {
      setScoreResult(score);
    }
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    const screenComponents = {
      home: (
        <HomeScreen
          onStartGame={() => navigateToScreen('game')}
          onNavigate={(screen) => navigateToScreen(screen)}
          pwaManager={pwaManager || undefined}
        />
      ),
      game: <GameScreen onNavigate={navigateToScreen} />,
      settings: <SettingsScreen onNavigate={navigateToScreen} />,
      results: (
        <ResultsScreen
          onNavigate={navigateToScreen}
          result={gameResult}
          scoreResult={scoreResult}
        />
      ),
      stats: <StatsScreen onNavigate={navigateToScreen} />,
    };

    return screenComponents[currentScreen] || screenComponents.home;
  };

  const pageVariants = {
    initial: {
      opacity: 0,
      transform: 'translate3d(100%, 0, 0)',
    },
    in: {
      opacity: 1,
      transform: 'translate3d(0, 0, 0)',
    },
    out: {
      opacity: 0,
      transform: 'translate3d(-100%, 0, 0)',
    },
  };

  const pageTransition = {
    type: 'tween' as const,
    ease: [0.25, 0.46, 0.45, 0.94] as const,
    duration: 0.3,
  };

  return (
    <ThemeProvider>
      <SettingsProvider>
        <StatisticsProvider>
          <div className="app">
            {/* Background Elements */}
            <div className="fixed inset-0 -z-10">
              <div
                className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"
                style={{ animationDuration: '8s' }}
              />
              <div
                className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float"
                style={{ animationDelay: '2s', animationDuration: '10s' }}
              />
              <div
                className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float"
                style={{ animationDelay: '4s', animationDuration: '12s' }}
              />
            </div>

            <header className="app__header">
              <Header onSettingsClick={() => navigateToScreen('settings')} />
            </header>

            <main className="app__main">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentScreen}
                  className="screen-container"
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={{
                    willChange: 'transform, opacity',
                    backfaceVisibility: 'hidden',
                    perspective: 1000,
                  }}
                >
                  {renderScreen()}
                </motion.div>
              </AnimatePresence>
            </main>

            <nav className="app__navigation">
              <Navigation
                currentScreen={currentScreen}
                onNavigate={navigateToScreen}
              />
            </nav>

            <div
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
              id="announcements"
            >
              Game state updates will be announced here
            </div>
          </div>
        </StatisticsProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
