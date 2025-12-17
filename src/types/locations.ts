// Stanton System Location Types and Data

export type LocationType = 'refinery' | 'station' | 'planet' | 'moon' | 'lagrange' | 'city';

export interface StantonLocation {
  id: string;                    // Unique identifier (e.g., 'arc-l1')
  name: string;                  // Full display name
  shortName: string;             // Abbreviated name for UI
  type: LocationType;
  distanceFromStanton: number;   // km from Stanton system marker
  hasRefinery: boolean;          // Whether this location has refinery services
  orbitalBody?: string;          // Parent body (e.g., 'ArcCorp', 'Hurston')
  description?: string;
}

/**
 * Stanton System Locations
 *
 * Includes all Lagrange points, refineries, and major destinations.
 * Distances are approximate and based on typical orbital positions.
 *
 * Note: Jump Point Gateway stations are excluded as they are too far
 * above/below the ecliptic plane to cross the Aaron Halo.
 */
export const LOCATIONS: StantonLocation[] = [
  // ArcCorp Lagrange Points
  {
    id: 'arc-l1',
    name: 'ARC-L1 Wide Forest Station',
    shortName: 'ARC-L1',
    type: 'refinery',
    distanceFromStanton: 29_500_000,
    hasRefinery: true,
    orbitalBody: 'ArcCorp',
    description: 'Refinery station at ArcCorp L1'
  },
  {
    id: 'arc-l2',
    name: 'ARC-L2 Lively Pathway Station',
    shortName: 'ARC-L2',
    type: 'station',
    distanceFromStanton: 31_000_000,
    hasRefinery: false,
    orbitalBody: 'ArcCorp'
  },
  {
    id: 'arc-l3',
    name: 'ARC-L3 Modern Express Station',
    shortName: 'ARC-L3',
    type: 'station',
    distanceFromStanton: 27_500_000,
    hasRefinery: false,
    orbitalBody: 'ArcCorp'
  },
  {
    id: 'arc-l4',
    name: 'ARC-L4 Faint Glen Station',
    shortName: 'ARC-L4',
    type: 'station',
    distanceFromStanton: 28_800_000,
    hasRefinery: false,
    orbitalBody: 'ArcCorp'
  },
  {
    id: 'arc-l5',
    name: 'ARC-L5 Yellow Core Station',
    shortName: 'ARC-L5',
    type: 'station',
    distanceFromStanton: 28_800_000,
    hasRefinery: false,
    orbitalBody: 'ArcCorp'
  },

  // Crusader Lagrange Points
  {
    id: 'cru-l1',
    name: 'CRU-L1 Ambitious Dream Station',
    shortName: 'CRU-L1',
    type: 'refinery',
    distanceFromStanton: 16_500_000,
    hasRefinery: true,
    orbitalBody: 'Crusader',
    description: 'Refinery station at Crusader L1'
  },
  {
    id: 'cru-l4',
    name: 'CRU-L4 Shallow Fields Station',
    shortName: 'CRU-L4',
    type: 'station',
    distanceFromStanton: 18_200_000,
    hasRefinery: false,
    orbitalBody: 'Crusader'
  },
  {
    id: 'cru-l5',
    name: 'CRU-L5 Beautiful Glen Station',
    shortName: 'CRU-L5',
    type: 'refinery',
    distanceFromStanton: 18_200_000,
    hasRefinery: true,
    orbitalBody: 'Crusader',
    description: 'Refinery station at Crusader L5'
  },

  // Hurston Lagrange Points
  {
    id: 'hur-l1',
    name: 'HUR-L1 Green Glade Station',
    shortName: 'HUR-L1',
    type: 'refinery',
    distanceFromStanton: 11_500_000,
    hasRefinery: true,
    orbitalBody: 'Hurston',
    description: 'Refinery station at Hurston L1'
  },
  {
    id: 'hur-l2',
    name: 'HUR-L2 Faithful Dream Station',
    shortName: 'HUR-L2',
    type: 'refinery',
    distanceFromStanton: 13_000_000,
    hasRefinery: true,
    orbitalBody: 'Hurston',
    description: 'Refinery station at Hurston L2'
  },
  {
    id: 'hur-l3',
    name: 'HUR-L3 Thundering Express Station',
    shortName: 'HUR-L3',
    type: 'station',
    distanceFromStanton: 10_000_000,
    hasRefinery: false,
    orbitalBody: 'Hurston'
  },
  {
    id: 'hur-l4',
    name: 'HUR-L4 Melodic Fields Station',
    shortName: 'HUR-L4',
    type: 'station',
    distanceFromStanton: 12_200_000,
    hasRefinery: false,
    orbitalBody: 'Hurston'
  },
  {
    id: 'hur-l5',
    name: 'HUR-L5 High Course Station',
    shortName: 'HUR-L5',
    type: 'station',
    distanceFromStanton: 12_200_000,
    hasRefinery: false,
    orbitalBody: 'Hurston'
  },

  // MicroTech Lagrange Points
  {
    id: 'mic-l1',
    name: 'MIC-L1 Shallow Frontier Station',
    shortName: 'MIC-L1',
    type: 'refinery',
    distanceFromStanton: 38_500_000,
    hasRefinery: true,
    orbitalBody: 'microTech',
    description: 'Refinery station at microTech L1'
  },
  {
    id: 'mic-l2',
    name: 'MIC-L2 Long Forest Station',
    shortName: 'MIC-L2',
    type: 'station',
    distanceFromStanton: 41_000_000,
    hasRefinery: false,
    orbitalBody: 'microTech'
  },

  // Major Planets (for reference)
  {
    id: 'hurston',
    name: 'Hurston',
    shortName: 'Hurston',
    type: 'planet',
    distanceFromStanton: 12_850_000,
    hasRefinery: false,
    description: 'Hurston Dynamics headquarters world'
  },
  {
    id: 'crusader',
    name: 'Crusader',
    shortName: 'Crusader',
    type: 'planet',
    distanceFromStanton: 18_930_000,
    hasRefinery: false,
    description: 'Gas giant, home of Orison'
  },
  {
    id: 'arccorp',
    name: 'ArcCorp',
    shortName: 'ArcCorp',
    type: 'planet',
    distanceFromStanton: 28_460_000,
    hasRefinery: false,
    description: 'Ecumenopolis, home of Area18'
  },
  {
    id: 'microtech',
    name: 'microTech',
    shortName: 'microTech',
    type: 'planet',
    distanceFromStanton: 38_850_000,
    hasRefinery: false,
    description: 'Ice world, home of New Babbage'
  }
];

/**
 * Get all refinery locations
 */
export function getRefineries(): StantonLocation[] {
  return LOCATIONS.filter(loc => loc.hasRefinery);
}

/**
 * Get all locations suitable for quantum travel endpoints
 */
export function getQuantumDestinations(): StantonLocation[] {
  return LOCATIONS.filter(loc =>
    loc.type === 'refinery' || loc.type === 'station' || loc.type === 'lagrange'
  );
}

/**
 * Find a location by ID
 */
export function getLocationById(id: string): StantonLocation | null {
  return LOCATIONS.find(loc => loc.id === id) || null;
}

/**
 * Get locations grouped by orbital body
 */
export function getLocationsByOrbitalBody(): Map<string, StantonLocation[]> {
  const grouped = new Map<string, StantonLocation[]>();

  for (const loc of LOCATIONS) {
    const body = loc.orbitalBody || 'Other';
    if (!grouped.has(body)) {
      grouped.set(body, []);
    }
    grouped.get(body)!.push(loc);
  }

  return grouped;
}
