// Aaron Halo Guide - Utilities Exports

// Calculator functions
export {
  analyzePosition,
  analyzeRoute,
  getExitDistances,
  formatDistance,
  formatDistanceCompact,
  parseDistance,
  isValidStantonDistance,
  getRecommendedBands,
  calculateTravelTime,
  formatTravelTime,
  findBandByDistance,
  findClosestBand,
  isInHalo,
  getPositionContext,
  type PositionAnalysis,
  type RouteAnalysis,
  type ExitDistances,
  type BandRecommendation
} from './calculator';

// Display formatters
export {
  formatNumber,
  formatPercent,
  formatDensity,
  formatCurrency,
  formatCargo,
  formatDuration,
  formatDistanceDisplay,
  formatDistanceLarge,
  formatLocationId,
  formatBandName,
  formatQtSpeed,
  formatYieldBonus,
  truncate,
  getRarityClass,
  formatRarity
} from './formatters';

// Storage utilities
export {
  loadPreferences,
  savePreferences,
  updatePreferences,
  resetPreferences,
  addRecentRoute,
  getRecentRoutes,
  clearRecentRoutes,
  saveLastRoute,
  getLastRoute,
  saveSelectedShip,
  getSelectedShip,
  saveNavigationMethod,
  getNavigationMethod,
  isStorageAvailable,
  clearAllData,
  exportPreferences,
  importPreferences,
  type UserPreferences
} from './storage';
