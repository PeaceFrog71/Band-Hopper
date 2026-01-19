// Polar Coordinates Tests
// Test data from: ref data/Test for Polar Coordinates Band Hopper.csv

import { describe, it, expect } from 'vitest';
import {
  calculateDistance,
  findClosestRefineryByPosition,
  findBestRefineryByYield,
  findOptimalRefinery,
  type PolarCoordinate
} from './';

describe('findClosestRefineryByPosition', () => {
  // Test case 1: Position at r=43.29 Gm, θ=-87° should find Pyro Gateway as nearest
  it('finds Pyro Gateway as nearest refinery from position (43.29, -87°)', () => {
    const position: PolarCoordinate = { r: 43.29, theta: -87 };
    const results = findClosestRefineryByPosition(position);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].refinery.locationId).toBe('pyro-gateway');
  });

  // Test case 2: Position at r=23.2 Gm, θ=-82° should find Pyro Gateway as nearest
  it('finds Pyro Gateway as nearest refinery from position (23.2, -82°)', () => {
    const position: PolarCoordinate = { r: 23.2, theta: -82 };
    const results = findClosestRefineryByPosition(position);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].refinery.locationId).toBe('pyro-gateway');
  });

  // Test case 3: Position at r=29.3 Gm, θ=18° should find ARC-L4 as nearest
  it('finds ARC-L4 as nearest refinery from position (29.3, 18°)', () => {
    const position: PolarCoordinate = { r: 29.3, theta: 18 };
    const results = findClosestRefineryByPosition(position);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].refinery.locationId).toBe('arc-l4');
  });

  // Test case 4: Position at r=25 Gm, θ=64° should find MIC-L1 as nearest
  it('finds MIC-L1 as nearest refinery from position (25, 64°)', () => {
    const position: PolarCoordinate = { r: 25, theta: 64 };
    const results = findClosestRefineryByPosition(position);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].refinery.locationId).toBe('mic-l1');
  });

  // Test case 5: Position at r=19 Gm, θ=-148° should find CRU-L1 as nearest
  it('finds CRU-L1 as nearest refinery from position (19, -148°)', () => {
    const position: PolarCoordinate = { r: 19, theta: -148 };
    const results = findClosestRefineryByPosition(position);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].refinery.locationId).toBe('cru-l1');
  });

  // Test case 6: Position at r=59.5 Gm, θ=157.5° should find Nyx Gateway as nearest
  it('finds Nyx Gateway as nearest refinery from position (59.5, 157.5°)', () => {
    const position: PolarCoordinate = { r: 59.5, theta: 157.5 };
    const results = findClosestRefineryByPosition(position);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].refinery.locationId).toBe('nyx-gateway');
  });

  it('returns all refineries sorted by distance', () => {
    const position: PolarCoordinate = { r: 20, theta: 0 };
    const results = findClosestRefineryByPosition(position);

    // Should return all 12 refineries (9 L-points + 3 gateways)
    expect(results.length).toBe(12);

    // Should be sorted by distance (ascending)
    for (let i = 1; i < results.length; i++) {
      expect(results[i].distanceGm).toBeGreaterThanOrEqual(results[i - 1].distanceGm);
    }
  });
});

describe('calculateDistance', () => {
  it('calculates zero distance for same position', () => {
    const pos: PolarCoordinate = { r: 20, theta: 45 };
    const distance = calculateDistance(pos, pos);

    expect(distance).toBeCloseTo(0, 5);
  });

  it('calculates correct distance for positions on same angle', () => {
    const pos1: PolarCoordinate = { r: 10, theta: 0 };
    const pos2: PolarCoordinate = { r: 20, theta: 0 };
    const distance = calculateDistance(pos1, pos2);

    // Straight line difference
    expect(distance).toBeCloseTo(10, 5);
  });

  it('calculates correct distance for positions at opposite angles', () => {
    const pos1: PolarCoordinate = { r: 10, theta: 0 };
    const pos2: PolarCoordinate = { r: 10, theta: 180 };
    const distance = calculateDistance(pos1, pos2);

    // Diameter of circle with radius 10
    expect(distance).toBeCloseTo(20, 5);
  });

  it('calculates correct distance for 90 degree separation', () => {
    const pos1: PolarCoordinate = { r: 10, theta: 0 };
    const pos2: PolarCoordinate = { r: 10, theta: 90 };
    const distance = calculateDistance(pos1, pos2);

    // sqrt(10² + 10²) = sqrt(200) ≈ 14.14
    expect(distance).toBeCloseTo(Math.sqrt(200), 5);
  });
});

describe('findBestRefineryByYield', () => {
  it('returns refineries sorted by yield bonus (highest first)', () => {
    const results = findBestRefineryByYield('quantanium');

    // Should be sorted descending by yield
    for (let i = 1; i < results.length; i++) {
      expect(results[i].yieldPercent).toBeLessThanOrEqual(results[i - 1].yieldPercent);
    }
  });

  it('returns 0 yield for materials with no bonus defined', () => {
    const results = findBestRefineryByYield('nonexistent-material');

    // All refineries should have 0 yield for unknown material
    results.forEach(r => {
      expect(r.yieldPercent).toBe(0);
    });
  });

  it('includes location data for each refinery', () => {
    const results = findBestRefineryByYield('gold');

    results.forEach(r => {
      expect(r.location).toBeDefined();
      expect(r.location.id).toBe(r.refinery.locationId);
    });
  });

  it('returns all refineries', () => {
    const results = findBestRefineryByYield('quantanium');

    // Should return all 12 refineries
    expect(results.length).toBe(12);
  });
});

describe('findOptimalRefinery', () => {
  it('returns refineries sorted by score (highest first)', () => {
    const position: PolarCoordinate = { r: 20, theta: 0 };
    const results = findOptimalRefinery(position, 'quantanium');

    // Should be sorted descending by score
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });

  it('weights distance more when distanceWeight is high', () => {
    const position: PolarCoordinate = { r: 12.85, theta: 0 }; // Near HUR-L1

    // High distance weight (0.9) should favor closest refineries
    const distanceResults = findOptimalRefinery(position, 'quantanium', 0.9);
    // Low distance weight (0.1) should favor best yields
    const yieldResults = findOptimalRefinery(position, 'quantanium', 0.1);

    // With high distance weight, closest refinery should rank higher
    // With low distance weight, best yield refinery should rank higher
    // These should produce different top results
    expect(distanceResults[0].distanceGm).toBeLessThanOrEqual(yieldResults[0].distanceGm);
  });

  it('calculates value impact based on material base value', () => {
    const position: PolarCoordinate = { r: 20, theta: 0 };
    const results = findOptimalRefinery(position, 'quantanium');

    results.forEach(r => {
      expect(r.primaryValueImpact).toBeDefined();
      expect(typeof r.primaryValueImpact).toBe('number');
    });
  });

  it('handles secondary material in calculations', () => {
    const position: PolarCoordinate = { r: 20, theta: 0 };
    const results = findOptimalRefinery(position, 'quantanium', 0.5, 'gold');

    results.forEach(r => {
      expect(r.secondaryYieldPercent).toBeDefined();
      expect(r.combinedYieldPercent).toBe(r.yieldPercent + r.secondaryYieldPercent);
    });
  });

  it('returns all refineries with distance and yield data', () => {
    const position: PolarCoordinate = { r: 20, theta: 0 };
    const results = findOptimalRefinery(position, 'quantanium');

    expect(results.length).toBe(12); // 9 L-points + 3 gateways
    results.forEach(r => {
      expect(r.distanceGm).toBeGreaterThanOrEqual(0);
      expect(r.location).toBeDefined();
    });
  });
});
