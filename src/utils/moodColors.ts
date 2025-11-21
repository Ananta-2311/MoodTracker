import { type MoodOption } from '../components/MoodPicker';

/**
 * Color map for mood values
 * Maps each mood to its corresponding background color classes
 */
export const moodColorMap: Record<MoodOption, string> = {
  great: 'bg-emerald-500',
  good: 'bg-blue-500',
  neutral: 'bg-gray-400',
  bad: 'bg-orange-500',
  terrible: 'bg-red-500',
};

/**
 * Hover color map for mood values
 * Maps each mood to its corresponding hover background color classes
 */
export const moodHoverColorMap: Record<MoodOption, string> = {
  great: 'hover:bg-emerald-600',
  good: 'hover:bg-blue-600',
  neutral: 'hover:bg-gray-500',
  bad: 'hover:bg-orange-600',
  terrible: 'hover:bg-red-600',
};

/**
 * Get the background color class for a mood value
 * @param mood - The mood value (can be string or MoodOption)
 * @returns The background color class, or default gray if mood is invalid
 */
export function getMoodColor(mood: string | MoodOption | null | undefined): string {
  if (!mood) {
    return 'bg-gray-200';
  }
  
  // Type guard to check if mood is a valid MoodOption
  if (mood in moodColorMap) {
    return moodColorMap[mood as MoodOption];
  }
  
  return 'bg-gray-200';
}

/**
 * Get the hover color class for a mood value
 * @param mood - The mood value (can be string or MoodOption)
 * @returns The hover color class, or default gray if mood is invalid
 */
export function getMoodHoverColor(mood: string | MoodOption | null | undefined): string {
  if (!mood) {
    return 'hover:bg-gray-300';
  }
  
  // Type guard to check if mood is a valid MoodOption
  if (mood in moodHoverColorMap) {
    return moodHoverColorMap[mood as MoodOption];
  }
  
  return 'hover:bg-gray-300';
}

