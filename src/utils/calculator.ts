// Aaron Halo Guide - Core Calculations

import {
  BANDS,
  type AaronHaloBand,
  findBandByDistance,
  findClosestBand,
  isInHalo,
  HALO_INNER_EDGE,
  HALO_OUTER_EDGE
} from '../types/bands';

import {
  type Ship,
  calculateTravelTime,
  formatTravelTime
} from '../types/ships';

import {
  type PreCalculatedRoute,
  type BandExit,
  getRoute,
  getRouteWithBandInfo
} from '../types/routes';

/**
 * Position Analysis Result
 * Detailed information about a position in relation to the Aaron Halo
 */
export interface PositionAnalysis {
  distanceFromStanton: number;
  isInHalo: boolean;
  currentBand: AaronHaloBand | null;
  closestBand: AaronHaloBand;
  distanceToClosestBand: number;
  positionDescription: string;
  nearbyBands: Array<{
    band: AaronHaloBand;
    distance: number;
    direction: 'closer' | 'further';
  }>;
}

/**
 * Analyze a position in the Stanton system relative to the Aaron Halo
 * @param distanceFromStanton - Distance from Stanton marker in km
 */
export function analyzePosition(distanceFromStanton: number): PositionAnalysis {
  const inHalo = isInHalo(distanceFromStanton);
  const currentBand = findBandByDistance(distanceFromStanton);
  const closestBand = findClosestBand(distanceFromStanton);

  // Calculate distance to closest band's peak density
  const distanceToClosestBand = Math.abs(distanceFromStanton - closestBand.peakDensityDistance);

  // Find nearby bands (within 500,000 km)
  const nearbyBands = BANDS
    .map(band => {
      const distanceToPeak = distanceFromStanton - band.peakDensityDistance;
      return {
        band,
        distance: Math.abs(distanceToPeak),
        direction: distanceToPeak > 0 ? 'closer' as const : 'further' as const
      };
    })
    .filter(item => item.distance <= 500_000)
    .sort((a, b) => a.distance - b.distance);

  // Generate position description
  let positionDescription: string;
  if (!inHalo) {
    if (distanceFromStanton < HALO_INNER_EDGE) {
      const distanceToHalo = HALO_INNER_EDGE - distanceFromStanton;
      positionDescription = `Inside the halo zone, ${formatDistance(distanceToHalo)} from Band 1`;
    } else {
      const distanceFromHalo = distanceFromStanton - HALO_OUTER_EDGE;
      positionDescription = `Outside the halo zone, ${formatDistance(distanceFromHalo)} past Band 10`;
    }
  } else if (currentBand) {
    const distanceToPeak = Math.abs(distanceFromStanton - currentBand.peakDensityDistance);
    if (distanceToPeak < 10_000) {
      positionDescription = `At ${currentBand.name} peak density`;
    } else {
      const direction = distanceFromStanton < currentBand.peakDensityDistance ? 'inner' : 'outer';
      positionDescription = `In ${currentBand.name}, ${formatDistance(distanceToPeak)} from peak (${direction} edge)`;
    }
  } else {
    // In halo but between bands
    positionDescription = `Between bands, closest to ${closestBand.name}`;
  }

  return {
    distanceFromStanton,
    isInHalo: inHalo,
    currentBand,
    closestBand,
    distanceToClosestBand,
    positionDescription,
    nearbyBands
  };
}

/**
 * Route Analysis Result
 * Complete analysis of a route through the Aaron Halo
 */
export interface RouteAnalysis {
  route: PreCalculatedRoute;
  bandExits: Array<{
    band: AaronHaloBand;
    exit: BandExit;
    travelTimeFromStart?: number;
    formattedTravelTime?: string;
  }>;
  totalTravelTime?: number;
  formattedTotalTime?: string;
  recommendedBands: AaronHaloBand[];
}

/**
 * Analyze a route through the Aaron Halo
 * @param startId - Starting location ID
 * @param destinationId - Destination location ID
 * @param ship - Optional ship for travel time calculations
 */
export function analyzeRoute(
  startId: string,
  destinationId: string,
  ship?: Ship
): RouteAnalysis | null {
  const routeInfo = getRouteWithBandInfo(startId, destinationId);
  if (!routeInfo) return null;

  const { route, bandDetails } = routeInfo;

  // Calculate travel times if ship is provided
  const bandExits = bandDetails.map(({ band, exit }) => {
    const result: RouteAnalysis['bandExits'][0] = { band, exit };

    if (ship) {
      const travelTime = calculateTravelTime(exit.distanceFromStart, ship);
      result.travelTimeFromStart = travelTime;
      result.formattedTravelTime = formatTravelTime(travelTime);
    }

    return result;
  });

  // Calculate total travel time
  let totalTravelTime: number | undefined;
  let formattedTotalTime: string | undefined;
  if (ship) {
    totalTravelTime = calculateTravelTime(route.totalDistance, ship);
    formattedTotalTime = formatTravelTime(totalTravelTime);
  }

  // Recommend bands based on density (highest density bands)
  const recommendedBands = [...bandDetails]
    .sort((a, b) => b.band.relativeDensity - a.band.relativeDensity)
    .slice(0, 3)
    .map(({ band }) => band);

  return {
    route,
    bandExits,
    totalTravelTime,
    formattedTotalTime,
    recommendedBands
  };
}

/**
 * Calculate exit distance for a specific band on a route
 * Returns both Stanton marker and destination distance methods
 */
export interface ExitDistances {
  bandId: number;
  bandName: string;
  stantonMarkerDistance: number;
  destinationDistance: number;
  distanceFromStart: number;
  formattedStantonDistance: string;
  formattedDestinationDistance: string;
  formattedDistanceFromStart: string;
}

/**
 * Get exit distances for a specific band on a route
 */
export function getExitDistances(
  startId: string,
  destinationId: string,
  bandId: number
): ExitDistances | null {
  const route = getRoute(startId, destinationId);
  if (!route) return null;

  const bandExit = route.bandExits.find(be => be.bandId === bandId);
  if (!bandExit) return null;

  const band = BANDS.find(b => b.id === bandId);
  if (!band) return null;

  return {
    bandId,
    bandName: band.name,
    stantonMarkerDistance: bandExit.distanceFromStanton,
    destinationDistance: bandExit.distanceToDestination,
    distanceFromStart: bandExit.distanceFromStart,
    formattedStantonDistance: formatDistance(bandExit.distanceFromStanton),
    formattedDestinationDistance: formatDistance(bandExit.distanceToDestination),
    formattedDistanceFromStart: formatDistance(bandExit.distanceFromStart)
  };
}

/**
 * Format distance for display
 * Converts to millions of km with appropriate precision
 */
export function formatDistance(distanceKm: number): string {
  const millions = distanceKm / 1_000_000;

  if (millions >= 10) {
    return `${millions.toFixed(1)}M km`;
  } else if (millions >= 1) {
    return `${millions.toFixed(2)}M km`;
  } else {
    // Less than 1 million km, show in thousands
    const thousands = distanceKm / 1_000;
    if (thousands >= 100) {
      return `${thousands.toFixed(0)}K km`;
    } else {
      return `${thousands.toFixed(1)}K km`;
    }
  }
}

/**
 * Format distance for compact display (mobile-friendly)
 */
export function formatDistanceCompact(distanceKm: number): string {
  const millions = distanceKm / 1_000_000;
  return `${millions.toFixed(2)}M`;
}

/**
 * Parse a distance string back to km
 * Handles formats like "19.7M km", "19.7M", "500K km", "500000"
 */
export function parseDistance(input: string): number | null {
  const trimmed = input.trim().toLowerCase().replace(/,/g, '');

  // Try millions format (19.7M or 19.7M km)
  const millionsMatch = trimmed.match(/^([\d.]+)\s*m\s*(km)?$/i);
  if (millionsMatch) {
    const value = parseFloat(millionsMatch[1]);
    if (!isNaN(value)) {
      return value * 1_000_000;
    }
  }

  // Try thousands format (500K or 500K km)
  const thousandsMatch = trimmed.match(/^([\d.]+)\s*k\s*(km)?$/i);
  if (thousandsMatch) {
    const value = parseFloat(thousandsMatch[1]);
    if (!isNaN(value)) {
      return value * 1_000;
    }
  }

  // Try plain number (with optional km suffix)
  const plainMatch = trimmed.match(/^([\d.]+)\s*(km)?$/);
  if (plainMatch) {
    const value = parseFloat(plainMatch[1]);
    if (!isNaN(value)) {
      return value;
    }
  }

  return null;
}

/**
 * Validate if a distance is within the Stanton system
 * Max distance is roughly the outer edge of the system (~45M km)
 */
export function isValidStantonDistance(distanceKm: number): boolean {
  return distanceKm >= 0 && distanceKm <= 50_000_000;
}

/**
 * Get band recommendation based on target material and mining preferences
 */
export interface BandRecommendation {
  band: AaronHaloBand;
  score: number;
  reason: string;
}

export function getRecommendedBands(
  prioritizeDensity: boolean = true,
  avoidEdges: boolean = true
): BandRecommendation[] {
  return BANDS
    .map(band => {
      let score = band.relativeDensity;
      let reasons: string[] = [];

      if (prioritizeDensity && band.relativeDensity >= 0.8) {
        score += 0.2;
        reasons.push('High density');
      }

      if (avoidEdges) {
        // Bands 1 and 10 are edge bands
        if (band.id === 1 || band.id === 10) {
          score -= 0.1;
          reasons.push('Edge band');
        }
      }

      // Bonus for bands with good descriptions
      if (band.description?.includes('Highest') || band.description?.includes('Peak')) {
        score += 0.1;
        reasons.push(band.description);
      }

      return {
        band,
        score,
        reason: reasons.join(', ') || 'Standard density'
      };
    })
    .sort((a, b) => b.score - a.score);
}

// Re-export commonly used functions from other modules
export {
  calculateTravelTime,
  formatTravelTime,
  findBandByDistance,
  findClosestBand,
  isInHalo,
  getPositionContext
};
