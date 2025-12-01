export const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Convert a Date or date string into a local date key: YYYY-MM-DD
 * This uses the local timezone (getFullYear/getMonth/getDate) instead of UTC,
 * so that calendar days line up with what the user sees in the heatmap.
 */
export function toDateKeyLocal(input?: Date | string): string {
  // Fast path for strings already in correct format
  if (typeof input === 'string' && DATE_KEY_REGEX.test(input)) {
    return input;
  }

  let d: Date;

  if (typeof input === 'string') {
    d = new Date(input);
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date string');
    }
  } else {
    d = input || new Date();
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


