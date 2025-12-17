// Ship and Quantum Drive Types and Data

export type ShipCategory = 'mining' | 'hauler' | 'fighter' | 'exploration' | 'multi-role' | 'other';
export type ShipSize = 'small' | 'medium' | 'large' | 'capital';

export interface QuantumDrive {
  id: string;
  name: string;
  manufacturer: string;
  size: number;                  // 1 = small, 2 = medium, 3 = large
  speed: number;                 // Megameters per second (Mm/s) - in-game unit
  spoolTime: number;             // Seconds to spool
  fuelCapacity: number;          // Quantum fuel capacity
  fuelRate: number;              // Fuel consumption rate
}

export interface Ship {
  id: string;
  name: string;
  manufacturer: string;
  category: ShipCategory;
  size: ShipSize;
  defaultQtDrive: QuantumDrive;
  cargoCapacity: number;         // SCU
  description?: string;
}

/**
 * Quantum Drive Database
 *
 * Speed is in Megameters per second (Mm/s).
 * 1 Mm/s = 1,000 km/s
 *
 * These are approximate values that may change with game updates.
 */
export const QUANTUM_DRIVES: QuantumDrive[] = [
  // Size 1 (Small ships)
  {
    id: 'expedition',
    name: 'Expedition',
    manufacturer: 'Wei-Tek',
    size: 1,
    speed: 86.0,    // Mm/s
    spoolTime: 4.5,
    fuelCapacity: 583,
    fuelRate: 47.5
  },
  {
    id: 'atlas',
    name: 'Atlas',
    manufacturer: 'ArcCorp',
    size: 1,
    speed: 103.0,
    spoolTime: 5.3,
    fuelCapacity: 583,
    fuelRate: 56.8
  },
  {
    id: 'beacon',
    name: 'Beacon',
    manufacturer: 'Tarsus',
    size: 1,
    speed: 90.0,
    spoolTime: 4.8,
    fuelCapacity: 583,
    fuelRate: 50.0
  },

  // Size 2 (Medium ships)
  {
    id: 'voyage',
    name: 'Voyage',
    manufacturer: 'Wei-Tek',
    size: 2,
    speed: 79.0,
    spoolTime: 5.8,
    fuelCapacity: 1400,
    fuelRate: 87.0
  },
  {
    id: 'hemera',
    name: 'Hemera',
    manufacturer: 'Tarsus',
    size: 2,
    speed: 95.0,
    spoolTime: 6.5,
    fuelCapacity: 1400,
    fuelRate: 105.0
  },

  // Size 3 (Large ships)
  {
    id: 'odyssey',
    name: 'Odyssey',
    manufacturer: 'Wei-Tek',
    size: 3,
    speed: 74.0,
    spoolTime: 7.2,
    fuelCapacity: 3500,
    fuelRate: 210.0
  }
];

/**
 * Ship Database
 *
 * Focus on mining ships and common haulers for Aaron Halo runs.
 */
export const SHIPS: Ship[] = [
  // Mining Ships
  {
    id: 'prospector',
    name: 'MISC Prospector',
    manufacturer: 'MISC',
    category: 'mining',
    size: 'small',
    defaultQtDrive: QUANTUM_DRIVES.find(qd => qd.id === 'expedition')!,
    cargoCapacity: 32,
    description: 'Solo mining ship - Size 1 lasers only'
  },
  {
    id: 'mole',
    name: 'Argo MOLE',
    manufacturer: 'Argo Astronautics',
    category: 'mining',
    size: 'medium',
    defaultQtDrive: QUANTUM_DRIVES.find(qd => qd.id === 'voyage')!,
    cargoCapacity: 96,
    description: 'Multi-crew mining ship - Size 2 lasers'
  },

  // Haulers (for transporting ore to refinery)
  {
    id: 'freelancer',
    name: 'MISC Freelancer',
    manufacturer: 'MISC',
    category: 'hauler',
    size: 'medium',
    defaultQtDrive: QUANTUM_DRIVES.find(qd => qd.id === 'voyage')!,
    cargoCapacity: 66,
    description: 'Versatile hauler'
  },
  {
    id: 'freelancer-max',
    name: 'MISC Freelancer MAX',
    manufacturer: 'MISC',
    category: 'hauler',
    size: 'medium',
    defaultQtDrive: QUANTUM_DRIVES.find(qd => qd.id === 'voyage')!,
    cargoCapacity: 120,
    description: 'Maximum cargo variant'
  },
  {
    id: 'cutlass-black',
    name: 'Drake Cutlass Black',
    manufacturer: 'Drake Interplanetary',
    category: 'multi-role',
    size: 'medium',
    defaultQtDrive: QUANTUM_DRIVES.find(qd => qd.id === 'voyage')!,
    cargoCapacity: 46,
    description: 'Versatile multi-role ship'
  },
  {
    id: 'caterpillar',
    name: 'Drake Caterpillar',
    manufacturer: 'Drake Interplanetary',
    category: 'hauler',
    size: 'large',
    defaultQtDrive: QUANTUM_DRIVES.find(qd => qd.id === 'odyssey')!,
    cargoCapacity: 576,
    description: 'Large cargo hauler'
  },
  {
    id: 'c2-hercules',
    name: 'Crusader C2 Hercules',
    manufacturer: 'Crusader Industries',
    category: 'hauler',
    size: 'large',
    defaultQtDrive: QUANTUM_DRIVES.find(qd => qd.id === 'odyssey')!,
    cargoCapacity: 696,
    description: 'Heavy cargo transport'
  }
];

/**
 * Get ship by ID
 */
export function getShipById(id: string): Ship | null {
  return SHIPS.find(s => s.id === id) || null;
}

/**
 * Get ships by category
 */
export function getShipsByCategory(category: ShipCategory): Ship[] {
  return SHIPS.filter(s => s.category === category);
}

/**
 * Get mining ships
 */
export function getMiningShips(): Ship[] {
  return getShipsByCategory('mining');
}

/**
 * Calculate travel time for a given distance and ship
 * @param distanceKm - Distance in kilometers
 * @param ship - Ship with QT drive
 * @returns Time in seconds
 */
export function calculateTravelTime(distanceKm: number, ship: Ship): number {
  // Convert km to Mm (divide by 1,000,000 to get megameters)
  // Then divide by speed (Mm/s) to get seconds
  const distanceMm = distanceKm / 1_000_000;
  const travelTime = distanceMm / ship.defaultQtDrive.speed;

  // Add spool time
  return travelTime + ship.defaultQtDrive.spoolTime;
}

/**
 * Format travel time for display
 */
export function formatTravelTime(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
