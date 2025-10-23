
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determines the current financial year string.
 * The financial year starts on April 1st.
 * @returns {string} The financial year in "YYYY-YY" format (e.g., "2024-25").
 */
export function getCurrentFinancialYear(): string {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed (January is 0)
  let startYear = now.getFullYear();

  // If the current month is before April (i.e., Jan, Feb, Mar), the financial year started last year.
  if (currentMonth < 3) {
    startYear -= 1;
  }

  const endYear = (startYear + 1).toString().slice(-2);
  return `${startYear}-${endYear}`;
}
