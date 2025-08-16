import React from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Brain, Download } from 'lucide-react';
import { PWAInstallManager } from '../../utils/pwaInstallManager';
import { Screen } from '../../types/game.types';

interface HomeScreenProps {
  onStartGame: () => void;
  onNavigate?: (screen: Screen) => void;
  pwaManager?: PWAInstallManager;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartGame,
  onNavigate,
  pwaManager,
}) => {
  // Debug PWA manager status
  React.useEffect(() => {
    console.log('HomeScreen PWA Manager:', pwaManager);
    if (pwaManager) {
      console.log('PWA Manager canInstall:', pwaManager.canInstall());
    }
  }, [pwaManager]);

  const handleViewStats = (): void => {
    if (onNavigate) {
      onNavigate('stats');
    }
  };

  const handleInstallApp = (): void => {
    if (pwaManager) {
      console.log('Install button clicked');
      pwaManager.promptInstall();
    } else {
      console.log('No PWA manager available');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <section className="screen-modern flex items-center justify-center">
      <motion.div
        className="text-center max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div className="mb-8" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center justify-center w-24 h-24 glass rounded-3xl mb-6"
            whileHover={{ transform: 'scale3d(1.1, 1.1, 1) rotateZ(360deg)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ willChange: 'transform' }}
          >
            <Brain className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold text-gradient mb-4 leading-tight py-2">
            Mental Math Training
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Enhance your mental arithmetic skills with our interactive training
            platform. Challenge yourself and track your progress.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          variants={itemVariants}
        >
          <motion.button
            className="btn-primary-modern flex items-center justify-center gap-3"
            onClick={onStartGame}
            data-testid="start-game-btn"
            whileHover={{ transform: 'scale3d(1.05, 1.05, 1)' }}
            whileTap={{ transform: 'scale3d(0.95, 0.95, 1)' }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 25,
              mass: 0.5,
            }}
            style={{ willChange: 'transform' }}
          >
            <Play className="w-5 h-5" />
            Start Training
          </motion.button>

          <motion.button
            className="btn-secondary-modern flex items-center justify-center gap-3"
            onClick={handleViewStats}
            whileHover={{ transform: 'scale3d(1.05, 1.05, 1)' }}
            whileTap={{ transform: 'scale3d(0.95, 0.95, 1)' }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 25,
              mass: 0.5,
            }}
            style={{ willChange: 'transform' }}
          >
            <TrendingUp className="w-5 h-5" />
            View Statistics
          </motion.button>

          {pwaManager && (
            <motion.button
              className={`btn-secondary-modern flex items-center justify-center gap-3 ${
                !pwaManager.canInstall() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleInstallApp}
              disabled={!pwaManager.canInstall()}
              whileHover={
                pwaManager.canInstall()
                  ? { transform: 'scale3d(1.05, 1.05, 1)' }
                  : {}
              }
              whileTap={
                pwaManager.canInstall()
                  ? { transform: 'scale3d(0.95, 0.95, 1)' }
                  : {}
              }
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 25,
                mass: 0.5,
              }}
              style={{ willChange: 'transform' }}
              title={
                !pwaManager.canInstall()
                  ? 'App install not available'
                  : 'Install FastMath as an app'
              }
            >
              <Download className="w-5 h-5" />
              Install App
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};
