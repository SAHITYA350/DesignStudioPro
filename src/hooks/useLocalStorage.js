import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        // Check if window.storage is available
        if (window.storage && typeof window.storage.get === 'function') {
          // Try window.storage first
          try {
            const result = await window.storage.get(key);
            if (result && result.value) {
              // Try to parse as JSON, if it fails, use the raw value
              try {
                setStoredValue(JSON.parse(result.value));
              } catch (parseError) {
                // If JSON parse fails, use the raw string value
                setStoredValue(result.value);
                
              }
              setLoading(false);
              return;
            }
          } catch (storageError) {
            console.warn(`window.storage not available for ${key}, falling back to localStorage ${storageError}`);
          }
        }
        
        // Fallback to localStorage
        const item = localStorage.getItem(key);
        if (item) {
          try {
            setStoredValue(JSON.parse(item));
          } catch (parseError) {
            // If JSON parse fails, use the raw string value
            setStoredValue(item);
          }
        }
      } catch (error) {
        console.error(`Error loading ${key} from storage:`, error);
        // Use initial value on error
        setStoredValue(initialValue);
      } finally {
        setLoading(false);
      }
    };
    
    loadValue();
  }, [key, initialValue]);

  const setValue = async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Store as JSON if it's an object, otherwise store as plain string
      const storageValue = typeof valueToStore === 'string' 
        ? valueToStore 
        : JSON.stringify(valueToStore);
      
      // Try window.storage first
      if (window.storage && typeof window.storage.set === 'function') {
        try {
          await window.storage.set(key, storageValue);
          return;
        } catch (storageError) {
          console.warn(`window.storage.set failed for ${key}, falling back to localStorage ${storageError}`);
        }
      }
      
      // Fallback to localStorage
      localStorage.setItem(key, storageValue);
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  };

  return [storedValue, setValue, loading];
}