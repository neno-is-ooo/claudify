/**
 * Web implementation of React Native's Appearance API
 */

import { ColorSchemeName } from '@/types/theme';

/**
 * Detects the user's preferred color scheme using the prefers-color-scheme media query
 */
export const Appearance = {
  /**
   * Get the current color scheme preference
   */
  getColorScheme: (): ColorSchemeName => {
    // Check if window and matchMedia are available (browser environment)
    if (typeof window !== 'undefined' && window.matchMedia) {
      // Check if the user prefers dark mode
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      // Check if the user prefers light mode
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    // Default to light if no preference detected or not in browser environment
    return 'light';
  },

  /**
   * Add an event listener for color scheme changes
   * @param type - The event type ('change')
   * @param listener - The callback function
   */
  addChangeListener: (listener: (preferences: { colorScheme: ColorSchemeName }) => void) => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      // Define the handler function
      const handleChange = (e: MediaQueryListEvent) => {
        const colorScheme: ColorSchemeName = e.matches ? 'dark' : 'light';
        listener({ colorScheme });
      };
      
      // Add the event listener
      if (darkModeMediaQuery.addEventListener) {
        darkModeMediaQuery.addEventListener('change', handleChange);
      } else if (darkModeMediaQuery.addListener) {
        // For older browsers
        darkModeMediaQuery.addListener(handleChange);
      }
      
      // Return a function to remove the listener
      return {
        remove: () => {
          if (darkModeMediaQuery.removeEventListener) {
            darkModeMediaQuery.removeEventListener('change', handleChange);
          } else if (darkModeMediaQuery.removeListener) {
            // For older browsers
            darkModeMediaQuery.removeListener(handleChange);
          }
        }
      };
    }
    
    // Return a no-op function if not in browser environment
    return { remove: () => {} };
  }
};