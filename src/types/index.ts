// Aaron Halo Guide - Type Exports
// Central export file for all types and data

// Band Types and Data
export {
  type AaronHaloBand,
  BANDS,
  HALO_INNER_EDGE,
  HALO_OUTER_EDGE,
  findBandByDistance,
  findClosestBand,
  isInHalo,
  getPositionContext
} from './bands';

// Location Types and Data
export {
  type LocationType,
  type StantonLocation,
  LOCATIONS,
  getRefineries,
  getQuantumDestinations,
  getLocationById,
  getLocationsByOrbitalBody
} from './locations';

// Material Types and Data
export {
  type MaterialRarity,
  type MaterialCategory,
  type MinableMaterial,
  MATERIALS,
  getMaterialsByValue,
  getMaterialsByRarity,
  getMaterialById,
  getValuableMaterials
} from './materials';

// Refinery Types and Data
export {
  type Refinery,
  REFINERIES,
  getRefineryById,
  getRefineryByLocationId,
  getRefineryWithLocation,
  getYieldBonus,
  findBestRefineryByYield,
  findClosestRefineryByPosition,
  findBestRefineryForMaterial,
  findClosestRefinery,
  findOptimalRefinery
} from './refineries';

// Polar Coordinate Types and Data
export {
  type PolarCoordinate,
  type CartesianCoordinate,
  LOCATION_COORDINATES,
  polarToCartesian,
  cartesianToPolar,
  calculateDistance,
  interpolatePositionOnRoute,
  getLocationCoordinates,
  formatPolarCoordinate,
  formatPolarDistance
} from './polarCoordinates';

// Ship and QT Drive Types and Data
export {
  type ShipCategory,
  type ShipSize,
  type QuantumDrive,
  type Ship,
  QUANTUM_DRIVES,
  SHIPS,
  getShipById,
  getShipsByCategory,
  getMiningShips,
  calculateTravelTime,
  formatTravelTime
} from './ships';

// Route Types and Data
export {
  type BandExit,
  type PreCalculatedRoute,
  ROUTES,
  getRoute,
  getRoutesFromLocation,
  getRoutesToLocation,
  getBandExit,
  getAvailableStartLocations,
  getAvailableDestinations,
  routeExists,
  getRouteWithBandInfo
} from './routes';
