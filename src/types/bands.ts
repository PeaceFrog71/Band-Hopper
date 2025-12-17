// Aaron Halo Band Types and Data
// Source: CaptSheppard's Aaron Halo Travel Routes (cstone.space)

export interface AaronHaloBand {
  id: number;                    // Band 1-10
  name: string;                  // Display name
  innerDistance: number;         // km from Stanton marker (inner edge)
  outerDistance: number;         // km from Stanton marker (outer edge)
  peakDensityDistance: number;   // km - most asteroids (best mining)
  relativeDensity: number;       // 0-1 scale (1 = highest density)
  description?: string;          // Optional notes about this band
}

/**
 * Aaron Halo Band Data
 *
 * The Aaron Halo consists of 10 bands between ~19.67M and ~21.3M km from Stanton.
 * Distances are based on CaptSheppard's density survey which mapped 1746 data points.
 *
 * Note: Bands 2/3 and 5/6 were previously thought to be single bands but are now
 * known to be distinct bands with different density peaks.
 */
export const BANDS: AaronHaloBand[] = [
  {
    id: 1,
    name: 'Band 1',
    innerDistance: 19_673_000,
    outerDistance: 19_715_000,
    peakDensityDistance: 19_702_000,
    relativeDensity: 0.5,
    description: 'Inner edge of the Aaron Halo'
  },
  {
    id: 2,
    name: 'Band 2',
    innerDistance: 19_815_000,
    outerDistance: 19_914_000,
    peakDensityDistance: 19_887_000,
    relativeDensity: 0.65,
    description: 'Moderate density'
  },
  {
    id: 3,
    name: 'Band 3',
    innerDistance: 19_914_000,
    outerDistance: 19_995_000,
    peakDensityDistance: 19_995_000,
    relativeDensity: 0.7,
    description: 'Good density, often grouped with Band 2'
  },
  {
    id: 4,
    name: 'Band 4',
    innerDistance: 20_071_000,
    outerDistance: 20_179_000,
    peakDensityDistance: 20_188_000,
    relativeDensity: 0.55,
    description: 'Lower density transition zone'
  },
  {
    id: 5,
    name: 'Band 5',
    innerDistance: 20_230_000,
    outerDistance: 20_407_000,
    peakDensityDistance: 20_320_000,
    relativeDensity: 0.9,
    description: 'High density - popular mining band'
  },
  {
    id: 6,
    name: 'Band 6',
    innerDistance: 20_407_000,
    outerDistance: 20_540_000,
    peakDensityDistance: 20_471_000,
    relativeDensity: 0.75,
    description: 'Good density, often grouped with Band 5'
  },
  {
    id: 7,
    name: 'Band 7',
    innerDistance: 20_540_000,
    outerDistance: 20_881_000,
    peakDensityDistance: 20_962_000,
    relativeDensity: 1.0,
    description: 'Highest density - peak asteroid concentration'
  },
  {
    id: 8,
    name: 'Band 8',
    innerDistance: 20_881_000,
    outerDistance: 21_046_000,
    peakDensityDistance: 20_968_000,
    relativeDensity: 0.85,
    description: 'High density'
  },
  {
    id: 9,
    name: 'Band 9',
    innerDistance: 21_046_000,
    outerDistance: 21_132_000,
    peakDensityDistance: 21_062_000,
    relativeDensity: 0.6,
    description: 'Moderate density'
  },
  {
    id: 10,
    name: 'Band 10',
    innerDistance: 21_132_000,
    outerDistance: 21_298_000,
    peakDensityDistance: 21_207_000,
    relativeDensity: 0.55,
    description: 'Outer edge of the Aaron Halo'
  }
];

// Aaron Halo boundaries
export const HALO_INNER_EDGE = 19_673_000;  // km from Stanton
export const HALO_OUTER_EDGE = 21_298_000;  // km from Stanton

/**
 * Find which band a position is in based on distance to Stanton marker
 */
export function findBandByDistance(distanceToStanton: number): AaronHaloBand | null {
  return BANDS.find(band =>
    distanceToStanton >= band.innerDistance &&
    distanceToStanton <= band.outerDistance
  ) || null;
}

/**
 * Find the closest band to a given distance (for "between bands" positions)
 */
export function findClosestBand(distanceToStanton: number): AaronHaloBand {
  let closestBand = BANDS[0];
  let closestDistance = Math.abs(distanceToStanton - BANDS[0].peakDensityDistance);

  for (const band of BANDS) {
    const distance = Math.abs(distanceToStanton - band.peakDensityDistance);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestBand = band;
    }
  }

  return closestBand;
}

/**
 * Check if a distance is within the Aaron Halo
 */
export function isInHalo(distanceToStanton: number): boolean {
  return distanceToStanton >= HALO_INNER_EDGE && distanceToStanton <= HALO_OUTER_EDGE;
}

/**
 * Get position context for a given distance
 */
export function getPositionContext(distanceToStanton: number): {
  inHalo: boolean;
  band: AaronHaloBand | null;
  closestBand: AaronHaloBand;
  distanceToClosestPeak: number;
  isInsideInner: boolean;
  isOutsideOuter: boolean;
} {
  const inHalo = isInHalo(distanceToStanton);
  const band = findBandByDistance(distanceToStanton);
  const closestBand = findClosestBand(distanceToStanton);
  const distanceToClosestPeak = distanceToStanton - closestBand.peakDensityDistance;

  return {
    inHalo,
    band,
    closestBand,
    distanceToClosestPeak,
    isInsideInner: distanceToStanton < HALO_INNER_EDGE,
    isOutsideOuter: distanceToStanton > HALO_OUTER_EDGE
  };
}
