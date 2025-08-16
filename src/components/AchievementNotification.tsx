import React, { useEffect, useState } from 'react';
import { Achievement } from '../utils/statisticsManager';

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementNotification: React.FC<
  AchievementNotificationProps
> = ({ achievement, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setShow(true), 100);

    // Auto-hide after 3 seconds
    const hideTimer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, 3000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  return (
    <div className={`achievement-popup ${show ? 'show' : ''}`}>
      <div className="achievement-content">
        <div className="achievement-icon">🏆</div>
        <div className="achievement-text">
          <h4>Achievement Unlocked!</h4>
          <h3>{achievement.name}</h3>
          <p>{achievement.description}</p>
        </div>
      </div>
    </div>
  );
};
