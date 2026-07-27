import { useState, useEffect } from 'react';
import { safeLocalStorageGetJSON, safeLocalStorageSetJSON, isClient } from '@/lib/utils/clientUtils';
import { perfilInterface, RegistroEventoInterface, categoriaInterface } from '@/interfaces/interfaces';

/**
 * Custom hook for safely using localStorage with SSR support
 * @param key - The localStorage key
 * @param initialValue - The initial value to use
 * @returns [storedValue, setValue, isLoaded] where isLoaded indicates if the value has been loaded from localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load value from localStorage on mount (client-side only)
  useEffect(() => {
    if (isClient()) {
      const item = safeLocalStorageGetJSON<T>(key);
      if (item !== null) {
        setStoredValue(item);
      }
      setIsLoaded(true);
    }
  }, [key]);

  // Update localStorage when value changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (isClient()) {
        safeLocalStorageSetJSON(key, valueToStore);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoaded] as const;
}

/**
 * Hook specifically for managing the active profile
 */
export function useProfileLocalStorage() {
  return useLocalStorage<perfilInterface | null>("perfilActivo", null);
}

/**
 * Hook specifically for managing selected event
 */
export function useEventoLocalStorage() {
  return useLocalStorage<RegistroEventoInterface | null>("EventoSelecionado", null);
}

/**
 * Hook specifically for managing selected category
 */
export function useCategoriaLocalStorage() {
  return useLocalStorage<categoriaInterface | null>("CategoriaSelecionada", null);
}