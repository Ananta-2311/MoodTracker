import { type MoodOption } from '../components/MoodPicker';

/**
 * Color map for mood values
 * Maps each mood to its corresponding background color classes
 * Improved palette with better contrast and visual distinction
 */
export const moodColorMap: Record<MoodOption, string> = {
  great: 'bg-emerald-600 dark:bg-emerald-500',
  good: 'bg-blue-500 dark:bg-blue-400',
  neutral: 'bg-slate-400 dark:bg-slate-500',
  bad: 'bg-amber-500 dark:bg-amber-400',
  terrible: 'bg-rose-600 dark:bg-rose-500',
};

/**
 * Hover color map for mood values
 * Maps each mood to its corresponding hover background color classes
 */
export const moodHoverColorMap: Record<MoodOption, string> = {
  great: 'hover:bg-emerald-700 dark:hover:bg-emerald-600',
  good: 'hover:bg-blue-600 dark:hover:bg-blue-500',
  neutral: 'hover:bg-slate-500 dark:hover:bg-slate-600',
  bad: 'hover:bg-amber-600 dark:hover:bg-amber-500',
  terrible: 'hover:bg-rose-700 dark:hover:bg-rose-600',
};

/**
 * Get the background color class for a mood value
 * @param mood - The mood value (can be string or MoodOption)
 * @returns The background color class, or default gray if mood is invalid
 */
export function getMoodColor(mood: string | MoodOption | null | undefined): string {
  if (!mood) {
    return 'bg-gray-200 dark:bg-gray-700';
  }
  
  // Type guard to check if mood is a valid MoodOption
  if (mood in moodColorMap) {
    return moodColorMap[mood as MoodOption];
  }
  
  return 'bg-gray-200 dark:bg-gray-700';
}

/**
 * Get the hover color class for a mood value
 * @param mood - The mood value (can be string or MoodOption)
 * @returns The hover color class, or default gray if mood is invalid
 */
export function getMoodHoverColor(mood: string | MoodOption | null | undefined): string {
  if (!mood) {
    return 'hover:bg-gray-300 dark:hover:bg-gray-600';
  }
  
  // Type guard to check if mood is a valid MoodOption
  if (mood in moodHoverColorMap) {
    return moodHoverColorMap[mood as MoodOption];
  }
  
  return 'hover:bg-gray-300 dark:hover:bg-gray-600';
}

