// Minable Materials Types and Data

export type MaterialRarity = 'common' | 'uncommon' | 'rare' | 'very-rare';
export type MaterialCategory = 'ore' | 'gem' | 'gas';

export interface MinableMaterial {
  id: string;
  name: string;
  category: MaterialCategory;
  rarity: MaterialRarity;
  baseValue: number;             // aUEC per SCU (refined value)
  isQuantanium: boolean;         // Special handling - explodes!
  description?: string;
}

/**
 * Minable Materials Database
 *
 * Values are refined aUEC per SCU from spot prices (2025-01-18).
 * Materials are grouped by rarity and alphabetized within each group.
 */
export const MATERIALS: MinableMaterial[] = [
  // Very Rare (alphabetized)
  {
    id: 'quantanium',
    name: 'Quantanium',
    category: 'ore',
    rarity: 'very-rare',
    baseValue: 94378,
    isQuantanium: true,
    description: 'Highly volatile - must be refined quickly!'
  },
  {
    id: 'riccite',
    name: 'Riccite',
    category: 'ore',
    rarity: 'very-rare',
    baseValue: 109957,
    isQuantanium: false
  },
  {
    id: 'savrilium',
    name: 'Savrilium',
    category: 'ore',
    rarity: 'very-rare',
    baseValue: 101208,
    isQuantanium: false
  },
  {
    id: 'stileron',
    name: 'Stileron',
    category: 'ore',
    rarity: 'very-rare',
    baseValue: 105473,
    isQuantanium: false
  },

  // Rare (alphabetized)
  {
    id: 'bexalite',
    name: 'Bexalite',
    category: 'ore',
    rarity: 'rare',
    baseValue: 20440,
    isQuantanium: false,
    description: 'Valuable rare ore'
  },
  {
    id: 'lindinium',
    name: 'Lindinium',
    category: 'ore',
    rarity: 'rare',
    baseValue: 24292,
    isQuantanium: false
  },
  {
    id: 'taranite',
    name: 'Taranite',
    category: 'ore',
    rarity: 'rare',
    baseValue: 22417,
    isQuantanium: false
  },

  // Uncommon (alphabetized)
  {
    id: 'agricium',
    name: 'Agricium',
    category: 'ore',
    rarity: 'uncommon',
    baseValue: 4664,
    isQuantanium: false
  },
  {
    id: 'beryl',
    name: 'Beryl',
    category: 'gem',
    rarity: 'uncommon',
    baseValue: 5644,
    isQuantanium: false
  },
  {
    id: 'borase',
    name: 'Borase',
    category: 'ore',
    rarity: 'uncommon',
    baseValue: 7871,
    isQuantanium: false
  },
  {
    id: 'gold',
    name: 'Gold',
    category: 'ore',
    rarity: 'uncommon',
    baseValue: 8376,
    isQuantanium: false
  },
  {
    id: 'hephaestanite',
    name: 'Hephaestanite',
    category: 'ore',
    rarity: 'uncommon',
    baseValue: 4465,
    isQuantanium: false
  },
  {
    id: 'laranite',
    name: 'Laranite',
    category: 'ore',
    rarity: 'uncommon',
    baseValue: 6078,
    isQuantanium: false
  },

  // Common (alphabetized)
  {
    id: 'aluminium',
    name: 'Aluminium',
    category: 'ore',
    rarity: 'common',
    baseValue: 1960,
    isQuantanium: false
  },
  {
    id: 'copper',
    name: 'Copper',
    category: 'ore',
    rarity: 'common',
    baseValue: 2041,
    isQuantanium: false
  },
  {
    id: 'corundum',
    name: 'Corundum',
    category: 'gem',
    rarity: 'common',
    baseValue: 2046,
    isQuantanium: false
  },
  {
    id: 'ice',
    name: 'Ice',
    category: 'gas',
    rarity: 'common',
    baseValue: 2910,
    isQuantanium: false
  },
  {
    id: 'iron',
    name: 'Iron',
    category: 'ore',
    rarity: 'common',
    baseValue: 2316,
    isQuantanium: false
  },
  {
    id: 'quartz',
    name: 'Quartz',
    category: 'gem',
    rarity: 'common',
    baseValue: 2189,
    isQuantanium: false
  },
  {
    id: 'silicon',
    name: 'Silicon',
    category: 'ore',
    rarity: 'common',
    baseValue: 1394,
    isQuantanium: false
  },
  {
    id: 'tin',
    name: 'Tin',
    category: 'ore',
    rarity: 'common',
    baseValue: 1871,
    isQuantanium: false
  },
  {
    id: 'titanium',
    name: 'Titanium',
    category: 'ore',
    rarity: 'common',
    baseValue: 2569,
    isQuantanium: false
  },
  {
    id: 'torite',
    name: 'Torite',
    category: 'ore',
    rarity: 'common',
    baseValue: 2417,
    isQuantanium: false
  },
  {
    id: 'tungsten',
    name: 'Tungsten',
    category: 'ore',
    rarity: 'common',
    baseValue: 4050,
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
