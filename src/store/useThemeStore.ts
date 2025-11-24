import { useState, useEffect } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'moodTracker_theme'

/**
 * Get the initial theme from localStorage or system preference
 */
function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
  } catch (error) {
    console.error('Error reading theme from localStorage:', error)
  }
  
  // Check system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  }
  
  return 'light'
}

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  
  // Also apply to body for additional styling
  document.body.classList.remove('light', 'dark')
  document.body.classList.add(theme)
}

/**
 * Theme Store Hook
 * 
 * Provides theme management with localStorage persistence
 */
export function useThemeStore() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = getInitialTheme()
    setThemeState(initialTheme)
    applyTheme(initialTheme)
    setIsInitialized(true)
  }, [])

  // Apply theme whenever it changes
  useEffect(() => {
    if (isInitialized) {
      applyTheme(theme)
      try {
        localStorage.setItem(STORAGE_KEY, theme)
      } catch (error) {
        console.error('Error saving theme to localStorage:', error)
      }
    }
  }, [theme, isInitialized])

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light')
  }

  /**
   * Set a specific theme
   */
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return {
    theme,
    toggleTheme,
    setTheme,
    isInitialized,
  }
}

