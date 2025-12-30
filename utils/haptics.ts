
export const triggerHapticFeedback = (style: 'light' | 'medium' | 'success' = 'light') => {
  if (window.navigator && window.navigator.vibrate) {
    switch (style) {
      case 'light':
        // A light, crisp tap
        window.navigator.vibrate(10);
        break;
      case 'medium':
        // A more noticeable tap
        window.navigator.vibrate(40);
        break;
      case 'success':
        // A short, double-tap to indicate success
        window.navigator.vibrate([50, 50, 50]);
        break;
      default:
        window.navigator.vibrate(10);
    }
  }
};
