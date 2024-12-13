/**
 * Check if code is running in a browser environment.
 * @returns {boolean} true if browser, otherwise false.
 */
export const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined';

/**
 * Checks if a value is a boolean or a string representation of a boolean.
 *
 * This function is particularly useful for checking environment variables
 * which are often stored as strings.
 *
 * @param value - The value to check. Can be of any type.
 * @returns true if the value is boolean true or the string 'true' (case-insensitive),
 *          false for all other inputs.
 *
 * @example
 * console.log(isBoolean(true));           // Output: true
 * console.log(isBoolean('true'));         // Output: true
 * console.log(isBoolean('TRUE'));         // Output: true
 * console.log(isBoolean('True'));         // Output: true
 * console.log(isBoolean(false));          // Output: false
 * console.log(isBoolean('false'));        // Output: false
 * console.log(isBoolean(''));             // Output: false
 * console.log(isBoolean('hello'));        // Output: false
 * console.log(isBoolean(1));              // Output: false
 * console.log(isBoolean(null));           // Output: false
 * console.log(isBoolean(undefined));      // Output: false
 */
export const isBoolean = (value: unknown): boolean => {
  try {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
  } catch (err) {
    console.error('Error in isBoolean check:', err);
    return false;
  }
  return false;
};
