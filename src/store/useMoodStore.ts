/**
 * Mood Store with Local Storage Persistence
 * 
 * Stores mood entries keyed by date in YYYY-MM-DD format
 */

const STORAGE_KEY = 'moodTracker_data';

// Type definitions
export type MoodValue = string | number;

export interface MoodData {
  [date: string]: MoodValue; // date format: YYYY-MM-DD
}

/**
 * Get the current date in YYYY-MM-DD format
 */
function getDateKey(date?: Date | string): string {
  if (typeof date === 'string') {
    // Validate and return if already in correct format
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Try to parse the string as a date
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new Error('Invalid date string');
    }
    date = parsed;
  }
  
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Load mood data from local storage
 */
function loadFromStorage(): MoodData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {};
    }
    const parsed = JSON.parse(stored);
    // Validate that it's an object
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return {};
  }
}

/**
 * Save mood data to local storage
 */
function saveToStorage(data: MoodData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Validate mood value
 */
function validateMood(mood: MoodValue): boolean {
  // Allow strings and numbers, but not null, undefined, or empty strings
  return mood !== null && mood !== undefined && mood !== '';
}

/**
 * Mood Store Hook
 * 
 * Provides functions to manage mood entries with local storage persistence
 */
export function useMoodStore() {
  /**
   * Set a mood for a specific date
   * @param mood - The mood value to store
   * @param date - Optional date (defaults to today). Can be Date object or YYYY-MM-DD string
   * @returns true if successful, false otherwise
   */
  const setMood = (mood: MoodValue, date?: Date | string): boolean => {
    if (!validateMood(mood)) {
      console.warn('Invalid mood value:', mood);
      return false;
    }

    try {
      const dateKey = getDateKey(date);
      const data = loadFromStorage();
      data[dateKey] = mood;
      saveToStorage(data);
      return true;
    } catch (error) {
      console.error('Error setting mood:', error);
      return false;
    }
  };

  /**
   * Get mood for a specific date
   * @param date - Optional date (defaults to today). Can be Date object or YYYY-MM-DD string
   * @returns The mood value or null if not found
   */
  const getMood = (date?: Date | string): MoodValue | null => {
    try {
      const dateKey = getDateKey(date);
      const data = loadFromStorage();
      return data[dateKey] ?? null;
    } catch (error) {
      console.error('Error getting mood:', error);
      return null;
    }
  };

  /**
   * Get all mood entries
   * @returns Object with all mood entries keyed by date (YYYY-MM-DD)
   */
  const getAllMoods = (): MoodData => {
    try {
      return loadFromStorage();
    } catch (error) {
      console.error('Error getting all moods:', error);
      return {};
    }
  };

  /**
   * Clear all mood entries
   * @returns true if successful, false otherwise
   */
  const clearMoods = (): boolean => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing moods:', error);
      return false;
    }
  };

  /**
   * Import mood data from a JSON object
   * @param data - Mood data object to import
   * @param merge - If true, merge with existing data. If false, replace all data.
   * @returns true if successful, false otherwise
   */
  const importMoods = (data: MoodData, merge: boolean = false): boolean => {
    try {
      // Validate data structure
      if (typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Invalid data format: must be an object');
      }

      // Validate date keys and mood values
      for (const [dateKey, moodValue] of Object.entries(data)) {
        // Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
          throw new Error(`Invalid date format: ${dateKey}`);
        }
        
        // Validate date is actually valid
        const date = new Date(dateKey);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date: ${dateKey}`);
        }

        // Validate mood value
        if (!validateMood(moodValue)) {
          throw new Error(`Invalid mood value for ${dateKey}: ${moodValue}`);
        }
      }

      if (merge) {
        // Merge with existing data
        const existing = loadFromStorage();
        const merged = { ...existing, ...data };
        saveToStorage(merged);
      } else {
        // Replace all data
        saveToStorage(data);
      }

      return true;
    } catch (error) {
      console.error('Error importing moods:', error);
      throw error; // Re-throw to allow error handling in UI
    }
  };

  return {
    setMood,
    getMood,
    getAllMoods,
    clearMoods,
    importMoods,
  };
}
