// Aaron Halo Guide - Local Storage Management

const STORAGE_PREFIX = 'aaron-halo-guide_';

/**
 * User preferences stored in localStorage
 */
export interface UserPreferences {
  // Route preferences
  lastStartLocation?: string;
  lastDestination?: string;
  preferredNavigationMethod: 'stanton' | 'destination';

  // Ship preferences
  selectedShipId?: string;

  // Display preferences
  showAllBands: boolean;
  compactMode: boolean;

  // Refinery preferences
  preferredMaterialId?: string;
  distanceWeight: number; // 0-1, how much to weight distance vs yield

  // Recent routes (for quick access)
  recentRoutes: Array<{
    startId: string;
    destinationId: string;
    timestamp: number;
  }>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  preferredNavigationMethod: 'stanton',
  showAllBands: true,
  compactMode: false,
  distanceWeight: 0.3,
  recentRoutes: []
};

/**
 * Get a value from localStorage
 */
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Set a value in localStorage
 */
function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

/**
 * Remove a value from localStorage
 */
function removeItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}

/**
 * Load user preferences from localStorage
 */
export function loadPreferences(): UserPreferences {
  return getItem('preferences', DEFAULT_PREFERENCES);
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(preferences: UserPreferences): void {
  setItem('preferences', preferences);
}

/**
 * Update specific preference fields
 */
export function updatePreferences(updates: Partial<UserPreferences>): UserPreferences {
  const current = loadPreferences();
  const updated = { ...current, ...updates };
  savePreferences(updated);
  return updated;
}

/**
 * Reset preferences to defaults
 */
export function resetPreferences(): UserPreferences {
  savePreferences(DEFAULT_PREFERENCES);
  return DEFAULT_PREFERENCES;
}

/**
 * Add a route to recent routes
 */
export function addRecentRoute(startId: string, destinationId: string): void {
  const prefs = loadPreferences();

  // Remove duplicate if exists
  const filtered = prefs.recentRoutes.filter(
    r => !(r.startId === startId && r.destinationId === destinationId)
  );

  // Add new route at the beginning
  const updated = [
    { startId, destinationId, timestamp: Date.now() },
    ...filtered
  ].slice(0, 5); // Keep only 5 most recent

  updatePreferences({ recentRoutes: updated });
}

/**
 * Get recent routes
 */
export function getRecentRoutes(): UserPreferences['recentRoutes'] {
  return loadPreferences().recentRoutes;
}

/**
 * Clear recent routes
 */
export function clearRecentRoutes(): void {
  updatePreferences({ recentRoutes: [] });
}

/**
 * Save last used location selections
 */
export function saveLastRoute(startId: string, destinationId: string): void {
  updatePreferences({
    lastStartLocation: startId,
    lastDestination: destinationId
  });
}

/**
 * Get last used locations
 */
export function getLastRoute(): { startId?: string; destinationId?: string } {
  const prefs = loadPreferences();
  return {
    startId: prefs.lastStartLocation,
    destinationId: prefs.lastDestination
  };
}

/**
 * Save selected ship
 */
export function saveSelectedShip(shipId: string): void {
  updatePreferences({ selectedShipId: shipId });
}

/**
 * Get selected ship
 */
export function getSelectedShip(): string | undefined {
  return loadPreferences().selectedShipId;
}

/**
 * Save navigation method preference
 */
export function saveNavigationMethod(method: 'stanton' | 'destination'): void {
  updatePreferences({ preferredNavigationMethod: method });
}

/**
 * Get navigation method preference
 */
export function getNavigationMethod(): 'stanton' | 'destination' {
  return loadPreferences().preferredNavigationMethod;
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = STORAGE_PREFIX + 'test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all app data from localStorage
 */
export function clearAllData(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
}

/**
 * Export all preferences as JSON (for backup/debugging)
 */
export function exportPreferences(): string {
  return JSON.stringify(loadPreferences(), null, 2);
}

/**
 * Import preferences from JSON
 */
export function importPreferences(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as Partial<UserPreferences>;
    const merged = { ...DEFAULT_PREFERENCES, ...parsed };
    savePreferences(merged);
    return true;
  } catch {
    return false;
  }
}
