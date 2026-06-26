import { useState, useEffect } from "react";

/**
 * Custom hook for synchronizing state with window.localStorage
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The fallback value if no data exists
 */
export default function useLocalStorage(key, initialValue) {
  // 1. Lazy state initializer with robust error catching
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`[useLocalStorage] Error reading key "${key}":`, error);
      return initialValue;
    }
  });

  // 2. Functional state setter that writes cleanly to storage
  const setValue = (value) => {
    try {
      // Support functional updates (e.g., prev => [...prev, newItem])
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`[useLocalStorage] Error setting key "${key}":`, error);
    }
  };

  // 3. Cross-tab synchronization via the native 'storage' event listener
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key) {
        if (event.newValue === null) {
          // Key was deleted elsewhere
          setStoredValue(initialValue);
        } else {
          try {
            setStoredValue(JSON.parse(event.newValue));
          } catch (error) {
            console.error(
              `[useLocalStorage] Error parsing cross-tab sync for "${key}":`,
              error,
            );
          }
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
}
