/**
 * Utility functions for client-side operations
 */

/**
 * Check if we're running on the client side
 */
export const isClient = (): boolean => typeof window !== 'undefined';

/**
 * Safely get an item from localStorage
 * Returns null if not on client or if there's an error
 */
export const safeLocalStorageGet = (key: string): string | null => {
  if (!isClient()) return null;
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error accessing localStorage for key "${key}":`, error);
    return null;
  }
};

/**
 * Safely set an item in localStorage
 * Does nothing if not on client or if there's an error
 */
export const safeLocalStorageSet = (key: string, value: string): void => {
  if (!isClient()) return;
  
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error setting localStorage for key "${key}":`, error);
  }
};

/**
 * Safely remove an item from localStorage
 * Does nothing if not on client or if there's an error
 */
export const safeLocalStorageRemove = (key: string): void => {
  if (!isClient()) return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage for key "${key}":`, error);
  }
};

/**
 * Safely parse JSON from localStorage
 * Returns null if not on client, key doesn't exist, or parsing fails
 */
export const safeLocalStorageGetJSON = <T>(key: string): T | null => {
  const item = safeLocalStorageGet(key);
  if (!item) return null;
  
  try {
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error parsing JSON from localStorage for key "${key}":`, error);
    return null;
  }
};

/**
 * Safely stringify and set JSON in localStorage
 * Does nothing if not on client or if there's an error
 */
export const safeLocalStorageSetJSON = <T>(key: string, value: T): void => {
  try {
    const stringValue = JSON.stringify(value);
    safeLocalStorageSet(key, stringValue);
  } catch (error) {
    console.error(`Error stringifying JSON for localStorage key "${key}":`, error);
  }
};