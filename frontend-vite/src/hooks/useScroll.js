import { useState, useEffect } from 'react';

/**
 * Hook to track scroll position and determine if the page is scrolled.
 * @param {number} threshold - The scrollY value to trigger the 'scrolled' state.
 * @returns {boolean} - True if window.scrollY is greater than the threshold.
 */
export const useScroll = (threshold = 10) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Call handler once on mount to set initial state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return scrolled;
};