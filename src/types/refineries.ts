// Refinery Types and Data

import { getLocationById, type StantonLocation } from './locations';

export interface MaterialBonus {
  materialId: string;
  yieldBonus: number;            // 1.05 = +5% yield, 0.95 = -5%
  timeModifier: number;          // 0.9 = 10% faster, 1.1 = 10% slower
}

export interface Refinery {
  id: string;
  locationId: string;            // Links to StantonLocation
  name: string;
  operator: string;              // Company operating the refinery
  specialization?: string;       // What this refinery is known for
  materialBonuses: MaterialBonus[];
}

/**
 * Refinery Database
 *
 * Note: Refinery bonuses are simplified for MVP. In-game, refineries may have
 * different processing methods (Dinyx Solventation, Ferron Exchange, etc.)
 * with varying yield/time tradeoffs.
 *
 * For now, we focus on location convenience and basic material preferences.
 */
export const REFINERIES: Refinery[] = [
  {
    id: 'arc-l1-refinery',
    locationId: 'arc-l1',
    name: 'ARC-L1 Wide Forest Station',
    operator: 'Shubin Interstellar',
    specialization: 'General processing',
    materialBonuses: [
      { materialId: 'quantanium', yieldBonus: 1.0, timeModifier: 1.0 },
      { materialId: 'agricium', yieldBonus: 1.02, timeModifier: 0.98 },
      { materialId: 'laranite', yieldBonus: 1.0, timeModifier: 1.0 }
    ]
  },
  {
    id: 'cru-l1-refinery',
    locationId: 'cru-l1',
    name: 'CRU-L1 Ambitious Dream Station',
    operator: 'Shubin Interstellar',
    specialization: 'General processing',
    materialBonuses: [
      { materialId: 'quantanium', yieldBonus: 1.0, timeModifier: 1.0 },
      { materialId: 'bexalite', yieldBonus: 1.02, timeModifier: 0.98 }
    ]
  },
  {
    id: 'cru-l5-refinery',
    locationId: 'cru-l5',
    name: 'CRU-L5 Beautiful Glen Station',
    operator: 'Shubin Interstellar',
    specialization: 'Quantanium processing',
    materialBonuses: [
      { materialId: 'quantanium', yieldBonus: 1.03, timeModifier: 0.95 },
      { materialId: 'taranite', yieldBonus: 1.01, timeModifier: 1.0 }
    ]
  },
  {
    id: 'hur-l1-refinery',
    locationId: 'hur-l1',
    name: 'HUR-L1 Green Glade Station',
    operator: 'Shubin Interstellar',
    specialization: 'General processing',
    materialBonuses: [
      { materialId: 'quantanium', yieldBonus: 1.0, timeModifier: 1.0 },
      { materialId: 'titanium', yieldBonus: 1.02, timeModifier: 0.98 }
    ]
  },
  {
    id: 'hur-l2-refinery',
    locationId: 'hur-l2',
    name: 'HUR-L2 Faithful Dream Station',
    operator: 'Shubin Interstellar',
    specialization: 'General processing',
    materialBonuses: [
      { materialId: 'quantanium', yieldBonus: 1.0, timeModifier: 1.0 },
      { materialId: 'laranite', yieldBonus: 1.02, timeModifier: 0.98 }
    ]
  },
  {
    id: 'mic-l1-refinery',
    locationId: 'mic-l1',
    name: 'MIC-L1 Shallow Frontier Station',
    operator: 'Shubin Interstellar',
    specialization: 'General processing',
    materialBonuses: [
      { materialId: 'quantanium', yieldBonus: 1.0, timeModifier: 1.0 },
      { materialId: 'hephaestanite', yieldBonus: 1.02, timeModifier: 0.98 }
    ]
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
 * Find the best refinery for a specific material
 * Returns refineries sorted by yield bonus for that material
 */
export function findBestRefineryForMaterial(materialId: string): Refinery[] {
  return [...REFINERIES].sort((a, b) => {
    const bonusA = a.materialBonuses.find(mb => mb.materialId === materialId)?.yieldBonus || 1.0;
    const bonusB = b.materialBonuses.find(mb => mb.materialId === materialId)?.yieldBonus || 1.0;
    return bonusB - bonusA;
  });
}

/**
 * Find closest refinery from a given position (distance to Stanton marker)
 */
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

/**
 * Find optimal refinery considering both distance and material bonus
 * Balances convenience with yield
 */
export function findOptimalRefinery(
  distanceToStanton: number,
  materialId: string,
  maxDistanceWeight: number = 0.3 // How much to weight distance vs yield (0 = only yield, 1 = only distance)
): {
  refinery: Refinery;
  location: StantonLocation;
  score: number;
  distanceFromPosition: number;
  yieldBonus: number;
}[] {
  const results: {
    refinery: Refinery;
    location: StantonLocation;
    score: number;
    distanceFromPosition: number;
    yieldBonus: number;
  }[] = [];

  // Find max distance for normalization
  let maxDistance = 0;
  for (const refinery of REFINERIES) {
    const location = getLocationById(refinery.locationId);
    if (location) {
      const distance = Math.abs(location.distanceFromStanton - distanceToStanton);
      if (distance > maxDistance) maxDistance = distance;
    }
  }

  for (const refinery of REFINERIES) {
    const location = getLocationById(refinery.locationId);
    if (!location) continue;

    const distance = Math.abs(location.distanceFromStanton - distanceToStanton);
    const yieldBonus = refinery.materialBonuses.find(mb => mb.materialId === materialId)?.yieldBonus || 1.0;

    // Normalize distance (0 = closest, 1 = farthest)
    const normalizedDistance = maxDistance > 0 ? distance / maxDistance : 0;

    // Calculate score (higher is better)
    // Yield bonus contributes positively, distance contributes negatively
    const distanceScore = 1 - normalizedDistance;
    const yieldScore = (yieldBonus - 1) * 10 + 1; // Scale yield bonus to be comparable

    const score = (yieldScore * (1 - maxDistanceWeight)) + (distanceScore * maxDistanceWeight);

    results.push({
      refinery,
      location,
      score,
      distanceFromPosition: distance,
      yieldBonus
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
