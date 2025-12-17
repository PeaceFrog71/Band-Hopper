// Pre-Calculated Route Database
// All routes that cross the Aaron Halo with exit distances for each band

import { BANDS, type AaronHaloBand } from './bands';

export interface BandExit {
  bandId: number;
  distanceFromStanton: number;   // km - Stanton marker method
  distanceToDestination: number; // km - remaining distance to destination
  distanceFromStart: number;     // km - how far traveled from start
}

export interface PreCalculatedRoute {
  id: string;                    // 'arc-l1_to_hur-l5'
  startId: string;
  destinationId: string;
  totalDistance: number;         // km (approximate)
  crossesHalo: boolean;
  bandExits: BandExit[];
}

/**
 * Pre-Calculated Route Database
 *
 * Routes are calculated based on the geometry of the Stanton system:
 * - Quantum travel follows straight lines between locations
 * - The Aaron Halo is a ring at fixed distances from Stanton marker
 * - Exit distances are where the route line crosses each band
 *
 * Note: Some routes may not cross all bands depending on angle.
 * Routes that don't cross the halo at all have crossesHalo: false.
 *
 * Distance values are approximations. For maximum accuracy, verify
 * exit distances in-game and update this database.
 */
export const ROUTES: PreCalculatedRoute[] = [
  // ARC-L1 Routes (inside halo going out)
  {
    id: 'arc-l1_to_cru-l4',
    startId: 'arc-l1',
    destinationId: 'cru-l4',
    totalDistance: 28_500_000,
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 17_798_000, distanceFromStart: 10_702_000 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 17_613_000, distanceFromStart: 10_887_000 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 17_505_000, distanceFromStart: 10_995_000 },
      { bandId: 4, distanceFromStanton: 20_188_000, distanceToDestination: 17_312_000, distanceFromStart: 11_188_000 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 14_292_609, distanceFromStart: 14_207_391 },
      { bandId: 6, distanceFromStanton: 20_471_000, distanceToDestination: 14_029_000, distanceFromStart: 14_471_000 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 13_750_000, distanceFromStart: 14_750_000 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 13_532_000, distanceFromStart: 14_968_000 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 13_438_000, distanceFromStart: 15_062_000 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 13_293_000, distanceFromStart: 15_207_000 }
    ]
  },
  {
    id: 'arc-l1_to_hur-l5',
    startId: 'arc-l1',
    destinationId: 'hur-l5',
    totalDistance: 32_000_000,
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 24_498_000, distanceFromStart: 7_502_000 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 24_313_000, distanceFromStart: 7_687_000 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 24_205_000, distanceFromStart: 7_795_000 },
      { bandId: 4, distanceFromStanton: 20_188_000, distanceToDestination: 24_012_000, distanceFromStart: 7_988_000 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 23_880_000, distanceFromStart: 8_120_000 },
      { bandId: 6, distanceFromStanton: 20_471_000, distanceToDestination: 23_729_000, distanceFromStart: 8_271_000 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 23_450_000, distanceFromStart: 8_550_000 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 23_232_000, distanceFromStart: 8_768_000 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 23_138_000, distanceFromStart: 8_862_000 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 22_993_000, distanceFromStart: 9_007_000 }
    ]
  },

  // CRU-L1 Routes (inside halo going out)
  {
    id: 'cru-l1_to_arc-l1',
    startId: 'cru-l1',
    destinationId: 'arc-l1',
    totalDistance: 26_000_000,
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 22_798_000, distanceFromStart: 3_202_000 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 22_613_000, distanceFromStart: 3_387_000 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 22_505_000, distanceFromStart: 3_495_000 },
      { bandId: 4, distanceFromStanton: 20_188_000, distanceToDestination: 22_312_000, distanceFromStart: 3_688_000 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 22_180_000, distanceFromStart: 3_820_000 },
      { bandId: 6, distanceFromStanton: 20_471_000, distanceToDestination: 22_029_000, distanceFromStart: 3_971_000 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 21_750_000, distanceFromStart: 4_250_000 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 21_532_000, distanceFromStart: 4_468_000 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 21_438_000, distanceFromStart: 4_562_000 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 21_293_000, distanceFromStart: 4_707_000 }
    ]
  },

  // HUR-L2 Routes (inside halo going out)
  {
    id: 'hur-l2_to_arc-l1',
    startId: 'hur-l2',
    destinationId: 'arc-l1',
    totalDistance: 30_000_000,
    crossesHalo: true,
    bandExits: [
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 23_298_000, distanceFromStart: 6_702_000 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 23_113_000, distanceFromStart: 6_887_000 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 23_005_000, distanceFromStart: 6_995_000 },
      { bandId: 4, distanceFromStanton: 20_188_000, distanceToDestination: 22_812_000, distanceFromStart: 7_188_000 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 22_680_000, distanceFromStart: 7_320_000 },
      { bandId: 6, distanceFromStanton: 20_471_000, distanceToDestination: 22_529_000, distanceFromStart: 7_471_000 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 22_250_000, distanceFromStart: 7_750_000 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 22_032_000, distanceFromStart: 7_968_000 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 21_938_000, distanceFromStart: 8_062_000 },
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 21_793_000, distanceFromStart: 8_207_000 }
    ]
  },

  // MIC-L1 Routes (outside halo going in)
  {
    id: 'mic-l1_to_cru-l1',
    startId: 'mic-l1',
    destinationId: 'cru-l1',
    totalDistance: 40_000_000,
    crossesHalo: true,
    bandExits: [
      { bandId: 10, distanceFromStanton: 21_207_000, distanceToDestination: 35_707_000, distanceFromStart: 4_293_000 },
      { bandId: 9, distanceFromStanton: 21_062_000, distanceToDestination: 35_562_000, distanceFromStart: 4_438_000 },
      { bandId: 8, distanceFromStanton: 20_968_000, distanceToDestination: 35_468_000, distanceFromStart: 4_532_000 },
      { bandId: 7, distanceFromStanton: 20_750_000, distanceToDestination: 35_250_000, distanceFromStart: 4_750_000 },
      { bandId: 6, distanceFromStanton: 20_471_000, distanceToDestination: 34_971_000, distanceFromStart: 5_029_000 },
      { bandId: 5, distanceFromStanton: 20_320_000, distanceToDestination: 34_820_000, distanceFromStart: 5_180_000 },
      { bandId: 4, distanceFromStanton: 20_188_000, distanceToDestination: 34_688_000, distanceFromStart: 5_312_000 },
      { bandId: 3, distanceFromStanton: 19_995_000, distanceToDestination: 34_495_000, distanceFromStart: 5_505_000 },
      { bandId: 2, distanceFromStanton: 19_887_000, distanceToDestination: 34_387_000, distanceFromStart: 5_613_000 },
      { bandId: 1, distanceFromStanton: 19_702_000, distanceToDestination: 34_202_000, distanceFromStart: 5_798_000 }
    ]
  }
];

/**
 * Get route by start and destination IDs
 */
export function getRoute(startId: string, destinationId: string): PreCalculatedRoute | null {
  return ROUTES.find(r =>
    r.startId === startId && r.destinationId === destinationId
  ) || null;
}

/**
 * Get all routes from a starting location
 */
export function getRoutesFromLocation(startId: string): PreCalculatedRoute[] {
  return ROUTES.filter(r => r.startId === startId);
}

/**
 * Get all routes to a destination
 */
export function getRoutesToLocation(destinationId: string): PreCalculatedRoute[] {
  return ROUTES.filter(r => r.destinationId === destinationId);
}

/**
 * Get band exit data for a specific route and band
 */
export function getBandExit(
  startId: string,
  destinationId: string,
  bandId: number
): BandExit | null {
  const route = getRoute(startId, destinationId);
  if (!route) return null;

  return route.bandExits.find(be => be.bandId === bandId) || null;
}

/**
 * Get all available start locations that have routes
 */
export function getAvailableStartLocations(): string[] {
  const startIds = new Set<string>();
  for (const route of ROUTES) {
    startIds.add(route.startId);
  }
  return Array.from(startIds);
}

/**
 * Get available destinations from a given start location
 */
export function getAvailableDestinations(startId: string): string[] {
  return getRoutesFromLocation(startId).map(r => r.destinationId);
}

/**
 * Check if a route exists between two locations
 */
export function routeExists(startId: string, destinationId: string): boolean {
  return getRoute(startId, destinationId) !== null;
}

/**
 * Get band information with exit data for display
 */
export function getRouteWithBandInfo(
  startId: string,
  destinationId: string
): {
  route: PreCalculatedRoute;
  bandDetails: Array<{
    band: AaronHaloBand;
    exit: BandExit;
  }>;
} | null {
  const route = getRoute(startId, destinationId);
  if (!route) return null;

  const bandDetails = route.bandExits.map(exit => {
    const band = BANDS.find(b => b.id === exit.bandId);
    if (!band) throw new Error(`Band ${exit.bandId} not found`);
    return { band, exit };
  });

  return { route, bandDetails };
}
