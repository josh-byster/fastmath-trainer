/**
 * Performance optimization utilities for animations and mobile responsiveness
 */

// Force hardware acceleration for critical elements
export const getHardwareAcceleration = () => ({
  willChange: 'transform',
  backfaceVisibility: 'hidden' as const,
  perspective: 1000,
  transformStyle: 'preserve-3d' as const,
});

// Optimized motion config for 60fps animations
export const getOptimizedMotionConfig = () => ({
  type: 'spring' as const,
  stiffness: 500,
  damping: 25,
  mass: 0.5,
});

// High performance scale transforms using transform3d
export const getScaleTransform = (scale: number) =>
  `scale3d(${scale}, ${scale}, 1)`;

// Combined transform for scale and rotate
export const getScaleRotateTransform = (scale: number, rotate: number) =>
  `scale3d(${scale}, ${scale}, 1) rotateZ(${rotate}deg)`;

// Mobile-optimized animation config with reduced complexity
export const getMobileOptimizedConfig = () => ({
  type: 'tween' as const,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
  duration: 0.2,
});

// Check if device prefers reduced motion
export const shouldReduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Get optimal animation config based on device capabilities
export const getAdaptiveAnimationConfig = () => {
  if (shouldReduceMotion()) {
    return { duration: 0 };
  }

  // Check for mobile/low-power devices
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  return isMobile ? getMobileOptimizedConfig() : getOptimizedMotionConfig();
};

// Force GPU layer creation for smooth animations
export const createGpuLayer = () => ({
  transform: 'translateZ(0)',
  willChange: 'transform',
});
