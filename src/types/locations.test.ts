// Locations Tests

import { describe, it, expect } from 'vitest';
import {
  getGroupedLocationsForDropdown,
  getLocationById,
  LOCATIONS
} from './locations';

describe('getGroupedLocationsForDropdown', () => {
  it('groups locations by planet in alphabetical order', () => {
    // Get all location IDs
    const allIds = LOCATIONS.map(loc => loc.id);
    const groups = getGroupedLocationsForDropdown(allIds);

    // Should have 4 groups (one per planet)
    expect(groups.length).toBe(4);

    // Verify alphabetical order
    expect(groups[0].planet).toBe('ArcCorp');
    expect(groups[1].planet).toBe('Crusader');
    expect(groups[2].planet).toBe('Hurston');
    expect(groups[3].planet).toBe('microTech');
  });

  it('includes planet as first location in group when available', () => {
    const allIds = LOCATIONS.map(loc => loc.id);
    const groups = getGroupedLocationsForDropdown(allIds);

    // ArcCorp group should have ArcCorp planet first
    const arccorpGroup = groups.find(g => g.planet === 'ArcCorp');
    expect(arccorpGroup).toBeDefined();
    expect(arccorpGroup!.locations[0].type).toBe('planet');
    expect(arccorpGroup!.locations[0].id).toBe('arccorp');
  });

  it('sorts L-points by number within each group', () => {
    const allIds = LOCATIONS.map(loc => loc.id);
    const groups = getGroupedLocationsForDropdown(allIds);

    // Check ArcCorp L-points are sorted L1, L2, L3, L4, L5
    const arccorpGroup = groups.find(g => g.planet === 'ArcCorp');
    const lPoints = arccorpGroup!.locations.filter(loc => loc.type !== 'planet');

    for (let i = 0; i < lPoints.length - 1; i++) {
      const currentMatch = lPoints[i].shortName.match(/L(\d+)/);
      const nextMatch = lPoints[i + 1].shortName.match(/L(\d+)/);
      if (currentMatch && nextMatch) {
        expect(parseInt(currentMatch[1])).toBeLessThan(parseInt(nextMatch[1]));
      }
    }
  });

  it('returns empty array for empty input', () => {
    const groups = getGroupedLocationsForDropdown([]);
    expect(groups).toEqual([]);
  });

  it('only includes locations that are in the input list', () => {
    // Only include ARC-L1 and ARC-L2
    const limitedIds = ['arc-l1', 'arc-l2'];
    const groups = getGroupedLocationsForDropdown(limitedIds);

    // Should only have ArcCorp group
    expect(groups.length).toBe(1);
    expect(groups[0].planet).toBe('ArcCorp');
    expect(groups[0].locations.length).toBe(2);
    expect(groups[0].locations.map(l => l.id)).toEqual(['arc-l1', 'arc-l2']);
  });

  it('excludes planets with no available L-points when planet itself is not in list', () => {
    // Only include Hurston L-points, no Crusader
    const hurstonOnly = ['hur-l1', 'hur-l2'];
    const groups = getGroupedLocationsForDropdown(hurstonOnly);

    // Should only have Hurston group
    expect(groups.length).toBe(1);
    expect(groups[0].planet).toBe('Hurston');
  });

  it('includes planet in group even if no L-points are available', () => {
    // Only include the planet itself
    const planetOnly = ['arccorp'];
    const groups = getGroupedLocationsForDropdown(planetOnly);

    expect(groups.length).toBe(1);
    expect(groups[0].planet).toBe('ArcCorp');
    expect(groups[0].locations.length).toBe(1);
    expect(groups[0].locations[0].id).toBe('arccorp');
  });
});

describe('getLocationById', () => {
  it('returns location when found', () => {
    const location = getLocationById('arc-l1');
    expect(location).not.toBeNull();
    expect(location!.shortName).toBe('ARC-L1');
  });

  it('returns null when not found', () => {
    const location = getLocationById('nonexistent');
    expect(location).toBeNull();
  });
});
