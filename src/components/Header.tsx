import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header 
      className="header-modern sticky top-0 z-50 px-6 py-4"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold text-gradient"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          FastMath
        </motion.h1>
        
        <div className="flex items-center gap-3">
          <motion.button
            className="dark-toggle"
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-slate-600" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-400" />
            )}
          </motion.button>
          
          <motion.button 
            className="glass rounded-full p-3 text-slate-600 dark:text-slate-300 hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-300"
            onClick={onSettingsClick}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};