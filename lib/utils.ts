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

/**
 * Generates a unique identifier by combining a timestamp with a random component.
 * The UUID consists of two parts:
 * - A hexadecimal timestamp (based on current time)
 * - A random 8-character hexadecimal string
 *
 * @returns {string} A string in the format 'timestamp-random' where both components are hexadecimal
 * @example
 * // Returns something like "18c1278b300-f9b438e1"
 * const uuid = generateUuid();
 */
export function generateUuid(): string {
  const timestamp = Date.now().toString(16);
  const random = Math.random().toString(16).slice(2, 10);
  return `${timestamp}-${random}`;
}

/**
 * Converts any input value into an array safely, handling various edge cases.
 *
 * @param args - The value to convert to an array. Can be of any type (null, undefined, array, object, or primitive).
 * @returns An array containing the input value(s)
 *
 * @description
 * This function handles the following cases:
 * - null/undefined → returns empty array
 * - existing array → returns the original array
 * - object → returns single-element array containing the object
 * - primitive values → returns single-element array containing the value
 *
 * @example
 * // Handling null/undefined
 * safeArrayConversion(null)       // returns []
 * safeArrayConversion(undefined)  // returns []
 *
 * @example
 * // Handling arrays
 * safeArrayConversion([1, 2, 3])  // returns [1, 2, 3]
 * safeArrayConversion([])         // returns []
 *
 * @example
 * // Handling objects
 * safeArrayConversion({ id: 1 })  // returns [{ id: 1 }]
 *
 * @example
 * // Handling primitives
 * safeArrayConversion('test')     // returns ['test']
 * safeArrayConversion(42)         // returns [42]
 * safeArrayConversion(true)       // returns [true]
 *
 * @throws {never} This function never throws - it handles all error cases internally
 */
export function safeArrayConversion(args: unknown): unknown[] {
  if (args === undefined || args === null) {
    return [];
  }
  if (Array.isArray(args)) {
    return args;
  }
  if (typeof args === 'object') {
    try {
      // This might still cause issues with circular references
      return [args];
    } catch (error) {
      console.error('Error converting object to array:', error);
      return [`[Unprocessable object: ${typeof args}]`];
    }
  }
  return [args];
}
