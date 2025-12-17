// Minable Materials Types and Data

export type MaterialRarity = 'common' | 'uncommon' | 'rare' | 'very-rare';
export type MaterialCategory = 'ore' | 'gem' | 'gas';

export interface MinableMaterial {
  id: string;
  name: string;
  category: MaterialCategory;
  rarity: MaterialRarity;
  baseValue: number;             // aUEC per SCU (approximate)
  isQuantanium: boolean;         // Special handling - explodes!
  description?: string;
}

/**
 * Minable Materials Database
 *
 * Values are approximate and may vary with game updates.
 * Focus is on materials commonly found in the Aaron Halo.
 */
export const MATERIALS: MinableMaterial[] = [
  // Very Rare
  {
    id: 'quantanium',
    name: 'Quantanium',
    category: 'ore',
    rarity: 'very-rare',
    baseValue: 88,
    isQuantanium: true,
    description: 'Highly volatile - must be refined quickly!'
  },

  // Rare
  {
    id: 'bexalite',
    name: 'Bexalite',
    category: 'ore',
    rarity: 'rare',
    baseValue: 44,
    isQuantanium: false,
    description: 'Valuable rare ore'
  },
  {
    id: 'taranite',
    name: 'Taranite',
    category: 'ore',
    rarity: 'rare',
    baseValue: 35,
    isQuantanium: false
  },
  {
    id: 'laranite',
    name: 'Laranite',
    category: 'ore',
    rarity: 'rare',
    baseValue: 30,
    isQuantanium: false
  },
  {
    id: 'agricium',
    name: 'Agricium',
    category: 'ore',
    rarity: 'rare',
    baseValue: 27,
    isQuantanium: false
  },

  // Uncommon
  {
    id: 'hephaestanite',
    name: 'Hephaestanite',
    category: 'ore',
    rarity: 'uncommon',
    baseValue: 15,
    isQuantanium: false
  },
  {
    id: 'titanium',
    name: 'Titanium',
    category: 'ore',
    rarity: 'uncommon',
    baseValue: 9,
    isQuantanium: false
  },
  {
    id: 'borase',
    name: 'Borase',
    category: 'ore',
    rarity: 'uncommon',
    baseValue: 8,
    isQuantanium: false
  },

  // Common
  {
    id: 'beryl',
    name: 'Beryl',
    category: 'gem',
    rarity: 'common',
    baseValue: 4,
    isQuantanium: false
  },
  {
    id: 'gold',
    name: 'Gold',
    category: 'ore',
    rarity: 'common',
    baseValue: 6,
    isQuantanium: false
  },
  {
    id: 'copper',
    name: 'Copper',
    category: 'ore',
    rarity: 'common',
    baseValue: 5,
    isQuantanium: false
  },
  {
    id: 'tungsten',
    name: 'Tungsten',
    category: 'ore',
    rarity: 'common',
    baseValue: 4,
    isQuantanium: false
  },
  {
    id: 'aluminium',
    name: 'Aluminium',
    category: 'ore',
    rarity: 'common',
    baseValue: 1,
    isQuantanium: false
  },
  {
    id: 'corundum',
    name: 'Corundum',
    category: 'gem',
    rarity: 'common',
    baseValue: 3,
    isQuantanium: false
  },
  {
    id: 'quartz',
    name: 'Quartz',
    category: 'gem',
    rarity: 'common',
    baseValue: 2,
    isQuantanium: false
  }
];

/**
 * Get materials sorted by value (highest first)
 */
export function getMaterialsByValue(): MinableMaterial[] {
  return [...MATERIALS].sort((a, b) => b.baseValue - a.baseValue);
}

/**
 * Get materials by rarity
 */
export function getMaterialsByRarity(rarity: MaterialRarity): MinableMaterial[] {
  return MATERIALS.filter(m => m.rarity === rarity);
}

/**
 * Get material by ID
 */
export function getMaterialById(id: string): MinableMaterial | null {
  return MATERIALS.find(m => m.id === id) || null;
}

/**
 * Get only valuable materials (for refinery finder priority)
 */
export function getValuableMaterials(): MinableMaterial[] {
  return MATERIALS.filter(m => m.rarity === 'rare' || m.rarity === 'very-rare');
}
