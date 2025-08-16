import React from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Brain } from 'lucide-react';

interface HomeScreenProps {
  onStartGame: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame }) => {
  const handleViewStats = (): void => {
    // TODO: Navigate to stats screen
    console.log('View statistics clicked');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
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
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-24 h-24 glass rounded-3xl mb-6"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Brain className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-gradient mb-4 leading-tight py-2">
            Mental Math Training
          </h2>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Enhance your mental arithmetic skills with our interactive training platform. 
            Challenge yourself and track your progress.
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Play className="w-5 h-5" />
            Start Training
          </motion.button>
          
          <motion.button 
            className="btn-secondary-modern flex items-center justify-center gap-3"
            onClick={handleViewStats}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <TrendingUp className="w-5 h-5" />
            View Statistics
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};