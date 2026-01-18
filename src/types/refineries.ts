// Refinery Types and Data

import { getLocationById, type StantonLocation } from './locations';
import {
  type PolarCoordinate,
  getLocationCoordinates,
  calculateDistance
} from './polarCoordinates';
import { getMaterialById } from './materials';

/**
 * Refinery with yield bonus data
 */
export interface Refinery {
  id: string;
  locationId: string;            // Links to StantonLocation
  name: string;                  // Station name from CSV
  operator: string;              // Company operating the refinery
  yieldBonuses: Record<string, number>;  // materialId -> percentage (3 = +3%, -6 = -6%)
}

/**
 * Refinery Database
 *
 * Yield bonuses sourced from: ref data/refinery yield bonuses.csv
 * Values are percentages (positive = bonus, negative = penalty)
 */
export const REFINERIES: Refinery[] = [
  {
    id: 'arc-l1-refinery',
    locationId: 'arc-l1',
    name: 'Wide Forest Station',
    operator: 'Shubin Interstellar',
    yieldBonuses: {
      'quantanium': 3,
      'taranite': -6,
      'laranite': -2,
      'beryl': 7,
      'hephaestanite': -4,
      'titanium': 5,
      'iron': 1,
      'quartz': 11,
      'corundum': -4,
      'aluminium': -5,
    }
  },
  {
    id: 'arc-l2-refinery',
    locationId: 'arc-l2',
    name: 'Lively Pathway Station',
    operator: 'Shubin Interstellar',
    yieldBonuses: {
      'quantanium': 3,
      'bexalite': 2,
      'gold': 7,
      'borase': 2,
      'hephaestanite': -8,
      'tungsten': -6,
      'titanium': 3,
      'corundum': -3,
      'copper': 6,
    }
  },
  {
    id: 'arc-l4-refinery',
    locationId: 'arc-l4',
    name: 'Faint Glen Station',
    operator: 'Shubin Interstellar',
    yieldBonuses: {
      'taranite': 5,
      'gold': -4,
      'beryl': -4,
      'agricium': -4,
      'hephaestanite': -5,
      'tungsten': -5,
      'titanium': -2,
      'quartz': -2,
      'corundum': -9,
      'copper': -4,
      'aluminium': -3,
    }
  },
  {
    id: 'cru-l1-refinery',
    locationId: 'cru-l1',
    name: 'Ambitious Dream Station',
    operator: 'Shubin Interstellar',
    yieldBonuses: {
      'bexalite': -6,
      'gold': -6,
      'laranite': -8,
      'beryl': 7,
      'hephaestanite': -2,
      'tungsten': 2,
      'titanium': -1,
      'iron': 2,
      'corundum': 7,
    }
  },
  {
    id: 'hur-l1-refinery',
    locationId: 'hur-l1',
    name: 'Green Glade Station',
    operator: 'Shubin Interstellar',
    yieldBonuses: {
      'quantanium': 2,
      'bexalite': -2,
      'gold': -3,
      'borase': 1,
      'laranite': 2,
      'agricium': -8,
      'tungsten': 4,
      'iron': -5,
      'corundum': -5,
      'copper': -5,
      'aluminium': -4,
    }
  },
  {
    id: 'hur-l2-refinery',
    locationId: 'hur-l2',
    name: 'Faithful Dream Station',
    operator: 'Shubin Interstellar',
    yieldBonuses: {
      'quantanium': 2,
      'taranite': -3,
      'gold': 1,
      'laranite': -1,
      'beryl': 1,
      'agricium': -2,
      'corundum': 1,
      'copper': -3,
    }
  },
  {
    id: 'mic-l1-refinery',
    locationId: 'mic-l1',
    name: 'Shallow Frontier Station',
    operator: 'Shubin Interstellar',
    yieldBonuses: {
      'gold': 1,
      'laranite': 2,
      'beryl': -6,
      'agricium': 8,
      'quartz': -3,
      'corundum': 2,
      'copper': 4,
      'aluminium': 7,
    }
  },
  {
    id: 'mic-l2-refinery',
    locationId: 'mic-l2',
    name: 'Long Forest Station',
    operator: 'Shubin Interstellar',
    yieldBonuses: {
      'quantanium': 1,
      'bexalite': 9,
      'gold': 9,
      'borase': -3,
      'laranite': -1,
      'beryl': -8,
      'tungsten': 9,
      'titanium': 6,
      'quartz': -5,
      'corundum': 6,
      'copper': 2,
    }
  },
  {
    id: 'mic-l5-refinery',
    locationId: 'mic-l5',
    name: 'Modern Icarus Station',
    operator: 'Shubin Interstellar',
    yieldBonuses: {
      'savrilium': 6,
      'lindinium': 7,
      'bexalite': 12,
      'borase': 9,
      'hephaestanite': 8,
      'titanium': 13,
      'torite': 8,
      'iron': 8,
      'copper': 9,
    }
  },

  // Jump Point Gateway Refineries
  {
    id: 'pyro-gateway-refinery',
    locationId: 'pyro-gateway',
    name: 'Pyro Gateway',
    operator: 'Gateway Services',
    yieldBonuses: {
      'bexalite': -6,
      'gold': -6,
      'laranite': -8,
      'beryl': 7,
      'hephaestanite': -2,
      'tungsten': 2,
      'titanium': -1,
      'iron': 2,
      'corundum': 7,
    }
  },
  {
    id: 'terra-gateway-refinery',
    locationId: 'terra-gateway',
    name: 'Terra Gateway',
    operator: 'Gateway Services',
    yieldBonuses: {
      'gold': 1,
      'laranite': 2,
      'beryl': -6,
      'agricium': 8,
      'quartz': -3,
      'corundum': 2,
      'copper': 4,
      'aluminium': 7,
    }
  },
  {
    id: 'nyx-gateway-refinery',
    locationId: 'nyx-gateway',
    name: 'Nyx Gateway',
    operator: 'Gateway Services',
    yieldBonuses: {
      'quantanium': 3,
      'taranite': -6,
      'bexalite': -2,
      'gold': -3,
      'borase': 1,
      'laranite': -2,
      'beryl': 7,
      'agricium': -8,
      'hephaestanite': -4,
      'tungsten': 4,
      'titanium': 5,
      'iron': 1,
      'quartz': 11,
      'corundum': -4,
      'copper': -5,
      'aluminium': -5,
    }
  }
];

/**
 * Get refinery by ID
 */
export function getRefineryById(id: string): Refinery | null {
  return REFINERIES.find(r => r.id === id) || null;
}

/**
 * Get refinery by location ID
 */
export function getRefineryByLocationId(locationId: string): Refinery | null {
  return REFINERIES.find(r => r.locationId === locationId) || null;
}

/**
 * Get refinery with its location data
 */
export function getRefineryWithLocation(refineryId: string): {
  refinery: Refinery;
  location: StantonLocation;
} | null {
  const refinery = getRefineryById(refineryId);
  if (!refinery) return null;

  const location = getLocationById(refinery.locationId);
  if (!location) return null;

  return { refinery, location };
}

/**
 * Get yield bonus for a material at a refinery
 * Returns percentage (3 = +3%, -6 = -6%, 0 = no bonus)
 */
export function getYieldBonus(refinery: Refinery, materialId: string): number {
  return refinery.yieldBonuses[materialId] || 0;
}

/**
 * Find the best refinery for a specific material by yield bonus
 * Returns refineries sorted by yield bonus (highest first)
 */
export function findBestRefineryByYield(materialId: string): {
  refinery: Refinery;
  location: StantonLocation;
  yieldPercent: number;
}[] {
  const results: {
    refinery: Refinery;
    location: StantonLocation;
    yieldPercent: number;
  }[] = [];

  for (const refinery of REFINERIES) {
    const location = getLocationById(refinery.locationId);
    if (!location) continue;

    const yieldPercent = refinery.yieldBonuses[materialId] || 0;

    results.push({
      refinery,
      location,
      yieldPercent
    });
  }

  return results.sort((a, b) => b.yieldPercent - a.yieldPercent);
}

/**
 * Find closest refinery from a position using polar coordinates
 * Returns refineries sorted by distance (closest first)
 */
export function findClosestRefineryByPosition(
  userPosition: PolarCoordinate
): {
  refinery: Refinery;
  location: StantonLocation;
  distanceGm: number;
}[] {
  const results: {
    refinery: Refinery;
    location: StantonLocation;
    distanceGm: number;
  }[] = [];

  for (const refinery of REFINERIES) {
    const location = getLocationById(refinery.locationId);
    if (!location) continue;

    const refineryCoords = getLocationCoordinates(refinery.locationId);
    if (!refineryCoords) continue;

    const distanceGm = calculateDistance(userPosition, refineryCoords);

    results.push({
      refinery,
      location,
      distanceGm
    });
  }

  return results.sort((a, b) => a.distanceGm - b.distanceGm);
}

/**
 * Find optimal refinery considering both distance and yield bonus
 * Uses polar coordinates for accurate distance calculation
 * Value-weighted scoring uses 50/50 split assumption for primary/secondary
 *
 * @param userPosition - User's position in polar coordinates
 * @param materialId - Primary material being refined (or empty for distance-only)
 * @param distanceWeight - How much to weight distance vs yield (0 = only yield, 1 = only distance)
 * @param secondaryMaterialId - Optional secondary material to include in yield calculation
 */
export function findOptimalRefinery(
  userPosition: PolarCoordinate,
  materialId: string,
  distanceWeight: number = 0.5,
  secondaryMaterialId?: string
): {
  refinery: Refinery;
  location: StantonLocation;
  score: number;
  distanceGm: number;
  yieldPercent: number;
  secondaryYieldPercent: number;
  combinedYieldPercent: number;
  primaryValueImpact: number;      // aUEC/SCU impact from primary yield
  secondaryValueImpact: number;    // aUEC/SCU impact from secondary yield
  combinedValueImpact: number;     // Total aUEC/SCU impact (weighted 50/50)
}[] {
  // Get material base values for value-weighted scoring
  const primaryMaterial = getMaterialById(materialId);
  const secondaryMaterial = secondaryMaterialId ? getMaterialById(secondaryMaterialId) : null;
  const primaryBaseValue = primaryMaterial?.baseValue || 0;
  const secondaryBaseValue = secondaryMaterial?.baseValue || 0;

  // 50/50 split assumption: each material contributes half of the load
  const primaryWeight = secondaryMaterialId ? 0.5 : 1.0;
  const secondaryWeight = secondaryMaterialId ? 0.5 : 0;

  const results: {
    refinery: Refinery;
    location: StantonLocation;
    score: number;
    distanceGm: number;
    yieldPercent: number;
    secondaryYieldPercent: number;
    combinedYieldPercent: number;
    primaryValueImpact: number;
    secondaryValueImpact: number;
    combinedValueImpact: number;
  }[] = [];

  // First pass: calculate distances and find value impact range
  const distances: { refinery: Refinery; location: StantonLocation; distanceGm: number }[] = [];
  let maxDistance = 0;
  let maxValueImpact = -Infinity;
  let minValueImpact = Infinity;

  for (const refinery of REFINERIES) {
    const location = getLocationById(refinery.locationId);
    if (!location) continue;

    const refineryCoords = getLocationCoordinates(refinery.locationId);
    if (!refineryCoords) continue;

    const distanceGm = calculateDistance(userPosition, refineryCoords);
    distances.push({ refinery, location, distanceGm });

    if (distanceGm > maxDistance) maxDistance = distanceGm;

    // Calculate value-weighted impact for scoring
    const primaryYield = refinery.yieldBonuses[materialId] || 0;
    const secondaryYield = secondaryMaterialId ? (refinery.yieldBonuses[secondaryMaterialId] || 0) : 0;

    // Value impact = (yield% / 100) * baseValue * weight
    const primaryImpact = (primaryYield / 100) * primaryBaseValue * primaryWeight;
    const secondaryImpact = (secondaryYield / 100) * secondaryBaseValue * secondaryWeight;
    const combinedImpact = primaryImpact + secondaryImpact;

    if (combinedImpact > maxValueImpact) maxValueImpact = combinedImpact;
    if (combinedImpact < minValueImpact) minValueImpact = combinedImpact;
  }

  // Second pass: calculate scores using value-weighted impact
  const valueRange = maxValueImpact - minValueImpact || 1; // Avoid division by zero

  for (const { refinery, location, distanceGm } of distances) {
    const yieldPercent = refinery.yieldBonuses[materialId] || 0;
    const secondaryYieldPercent = secondaryMaterialId ? (refinery.yieldBonuses[secondaryMaterialId] || 0) : 0;
    const combinedYieldPercent = yieldPercent + secondaryYieldPercent;

    // Calculate aUEC/SCU value impacts
    const primaryValueImpact = (yieldPercent / 100) * primaryBaseValue;
    const secondaryValueImpact = (secondaryYieldPercent / 100) * secondaryBaseValue;
    // Combined uses 50/50 weighting
    const combinedValueImpact = (primaryValueImpact * primaryWeight) + (secondaryValueImpact * secondaryWeight);

    // Normalize distance (0 = closest, 1 = farthest)
    const normalizedDistance = maxDistance > 0 ? distanceGm / maxDistance : 0;
    const distanceScore = 1 - normalizedDistance; // Higher is better (closer)

    // Normalize value impact (0 to 1 range, higher is better)
    const normalizedValue = (combinedValueImpact - minValueImpact) / valueRange;
    const valueScore = normalizedValue;

    // Combined score (0-1 range, higher is better)
    const score = (valueScore * (1 - distanceWeight)) + (distanceScore * distanceWeight);

    results.push({
      refinery,
      location,
      score,
      distanceGm,
      yieldPercent,
      secondaryYieldPercent,
      combinedYieldPercent,
      primaryValueImpact,
      secondaryValueImpact,
      combinedValueImpact
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

// Legacy function for backward compatibility
export function findClosestRefinery(distanceToStanton: number): {
  refinery: Refinery;
  location: StantonLocation;
  distanceFromPosition: number;
} | null {
  let closest: { refinery: Refinery; location: StantonLocation; distanceFromPosition: number } | null = null;

  for (const refinery of REFINERIES) {
    const location = getLocationById(refinery.locationId);
    if (!location) continue;

    const distance = Math.abs(location.distanceFromStanton - distanceToStanton);

    if (!closest || distance < closest.distanceFromPosition) {
      closest = {
        refinery,
        location,
        distanceFromPosition: distance
      };
    }
  }

  return closest;
}

// Legacy function - returns simplified material bonus for backward compatibility
export function findBestRefineryForMaterial(materialId: string): Refinery[] {
  return [...REFINERIES].sort((a, b) => {
    const bonusA = a.yieldBonuses[materialId] || 0;
    const bonusB = b.yieldBonuses[materialId] || 0;
    return bonusB - bonusA;
  });
}
