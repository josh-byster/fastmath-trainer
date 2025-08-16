import React from 'react';
import { motion } from 'framer-motion';
import { Home, Settings, BarChart3 } from 'lucide-react';
import { Screen } from '../types/game.types';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentScreen, 
  onNavigate 
}) => {
  const navItems: { screen: Screen; label: string; icon: React.ComponentType<any> }[] = [
    { screen: 'home', label: 'Home', icon: Home },
    { screen: 'settings', label: 'Settings', icon: Settings },
    { screen: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <motion.footer 
      className="fixed bottom-0 left-0 right-0 z-40"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
    >
      <nav className="nav-modern">
        <div className="flex items-center justify-around p-2">
          {navItems.map(({ screen, label, icon: Icon }) => {
            const isActive = currentScreen === screen;
            
            return (
              <motion.button
                key={screen}
                className={`relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                data-testid={`nav-${screen}`}
                onClick={() => onNavigate(screen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-xl"
                    layoutId="activeTab"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                )}
                
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </motion.footer>
  );
};