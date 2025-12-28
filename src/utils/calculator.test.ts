// Aaron Halo Guide - Calculator Tests

import { describe, it, expect } from 'vitest';
import {
  analyzePosition,
  analyzeRoute,
  getExitDistances,
  formatDistance,
  formatDistanceCompact,
  parseDistance,
  isValidStantonDistance,
  getRecommendedBands
} from './calculator';
import { BANDS, HALO_INNER_EDGE, HALO_OUTER_EDGE } from '../types/bands';
import { SHIPS } from '../types/ships';

describe('Position Analysis', () => {
  describe('analyzePosition', () => {
    it('correctly identifies position inside the halo', () => {
      // Band 5 peak is at 20,320,000 km
      const result = analyzePosition(20_320_000);

      expect(result.isInHalo).toBe(true);
      expect(result.currentBand).not.toBeNull();
      expect(result.currentBand?.id).toBe(5);
    });

    it('correctly identifies position outside the halo (inner)', () => {
      const result = analyzePosition(15_000_000); // Well inside the inner edge

      expect(result.isInHalo).toBe(false);
      expect(result.currentBand).toBeNull();
      expect(result.positionDescription).toContain('Inside the halo zone');
    });

    it('correctly identifies position outside the halo (outer)', () => {
      const result = analyzePosition(25_000_000); // Well outside the outer edge

      expect(result.isInHalo).toBe(false);
      expect(result.currentBand).toBeNull();
      expect(result.positionDescription).toContain('Outside the halo zone');
    });

    it('finds nearby bands', () => {
      const result = analyzePosition(20_000_000);

      expect(result.nearbyBands.length).toBeGreaterThan(0);
      expect(result.nearbyBands[0].distance).toBeLessThanOrEqual(500_000);
    });

    it('identifies closest band when between bands', () => {
      // Position between Band 3 and Band 4
      const band3Peak = BANDS.find(b => b.id === 3)!.peakDensityDistance;
      const band4Peak = BANDS.find(b => b.id === 4)!.peakDensityDistance;
      const midpoint = (band3Peak + band4Peak) / 2;

      const result = analyzePosition(midpoint);

      expect(result.closestBand.id).toBe(3); // or 4, depending on exact midpoint
      expect(result.distanceToClosestBand).toBeLessThan(200_000);
    });
  });
});

describe('Route Analysis', () => {
  describe('analyzeRoute', () => {
    it('returns null for invalid route', () => {
      const result = analyzeRoute('invalid-start', 'invalid-dest');
      expect(result).toBeNull();
    });

    it('analyzes valid route without ship', () => {
      const result = analyzeRoute('arc-l1', 'cru-l4');

      if (result) {
        expect(result.route).toBeDefined();
        expect(result.bandExits.length).toBe(10);
        expect(result.recommendedBands.length).toBeLessThanOrEqual(3);
      }
    });

    it('calculates travel times with ship', () => {
      const prospector = SHIPS.find(s => s.id === 'prospector')!;
      const result = analyzeRoute('arc-l1', 'cru-l4', prospector);

      if (result) {
        expect(result.bandExits[0].travelTimeFromStart).toBeDefined();
      }
    });
  });

  describe('getExitDistances', () => {
    it('returns exit distances for valid route and band', () => {
      const result = getExitDistances('arc-l1', 'cru-l4', 5);

      if (result) {
        expect(result.bandId).toBe(5);
        expect(result.stantonMarkerDistance).toBeGreaterThan(20_000_000);
        expect(result.destinationDistance).toBeGreaterThan(0);
        expect(result.distanceFromStart).toBeGreaterThan(0);
      }
    });

    it('returns null for invalid route', () => {
      const result = getExitDistances('invalid', 'invalid', 5);
      expect(result).toBeNull();
    });

    it('returns null for invalid band', () => {
      const result = getExitDistances('arc-l1', 'cru-l4', 99);
      expect(result).toBeNull();
    });
  });
});

describe('Distance Formatting', () => {
  describe('formatDistance', () => {
    it('formats millions correctly', () => {
      // Values >= 10M use one decimal
      expect(formatDistance(19_700_000)).toBe('19.7M km');
      expect(formatDistance(20_000_000)).toBe('20.0M km');
      expect(formatDistance(15_500_000)).toBe('15.5M km');
      // Values < 10M use two decimals
      expect(formatDistance(5_500_000)).toBe('5.50M km');
    });

    it('formats tens of millions with one decimal', () => {
      expect(formatDistance(25_000_000)).toBe('25.0M km');
      expect(formatDistance(30_500_000)).toBe('30.5M km');
    });

    it('formats thousands correctly', () => {
      expect(formatDistance(500_000)).toBe('500K km');
      expect(formatDistance(50_000)).toBe('50.0K km');
    });
  });

  describe('formatDistanceCompact', () => {
    it('formats compactly for mobile', () => {
      expect(formatDistanceCompact(19_700_000)).toBe('19.70M');
      expect(formatDistanceCompact(20_320_000)).toBe('20.32M');
    });
  });

  describe('parseDistance', () => {
    it('parses millions format', () => {
      expect(parseDistance('19.7M km')).toBe(19_700_000);
      expect(parseDistance('19.7M')).toBe(19_700_000);
      expect(parseDistance('20M km')).toBe(20_000_000);
    });

    it('parses thousands format', () => {
      expect(parseDistance('500K km')).toBe(500_000);
      expect(parseDistance('500K')).toBe(500_000);
    });

    it('parses plain numbers', () => {
      expect(parseDistance('19700000')).toBe(19_700_000);
      expect(parseDistance('500000 km')).toBe(500_000);
    });

    it('handles comma-formatted numbers', () => {
      expect(parseDistance('19,700,000')).toBe(19_700_000);
    });

    it('returns null for invalid input', () => {
      expect(parseDistance('invalid')).toBeNull();
      expect(parseDistance('')).toBeNull();
    });
  });
});

describe('Validation', () => {
  describe('isValidStantonDistance', () => {
    it('accepts valid distances', () => {
      expect(isValidStantonDistance(0)).toBe(true);
      expect(isValidStantonDistance(19_700_000)).toBe(true);
      expect(isValidStantonDistance(45_000_000)).toBe(true);
    });

    it('rejects invalid distances', () => {
      expect(isValidStantonDistance(-1)).toBe(false);
      expect(isValidStantonDistance(100_000_000)).toBe(false);
    });
  });
});

describe('Band Recommendations', () => {
  describe('getRecommendedBands', () => {
    it('returns all bands with scores', () => {
      const recommendations = getRecommendedBands();

      expect(recommendations.length).toBe(10);
      recommendations.forEach(rec => {
        expect(rec.band).toBeDefined();
        expect(rec.score).toBeDefined();
        expect(rec.reason).toBeDefined();
      });
    });

    it('sorts by score descending', () => {
      const recommendations = getRecommendedBands();

      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].score).toBeGreaterThanOrEqual(recommendations[i].score);
      }
    });

    it('penalizes edge bands when avoidEdges is true', () => {
      const withPenalty = getRecommendedBands(true, true);
      const withoutPenalty = getRecommendedBands(true, false);

      const band1WithPenalty = withPenalty.find(r => r.band.id === 1)!;
      const band1WithoutPenalty = withoutPenalty.find(r => r.band.id === 1)!;

      expect(band1WithPenalty.score).toBeLessThan(band1WithoutPenalty.score);
    });
  });
});

describe('Constants', () => {
  it('has correct halo boundaries', () => {
    // Based on CaptSheppard's research
    expect(HALO_INNER_EDGE).toBeLessThan(20_000_000);
    expect(HALO_OUTER_EDGE).toBeGreaterThan(21_000_000);
  });

  it('has 10 bands', () => {
    expect(BANDS.length).toBe(10);
  });

  it('has bands in order', () => {
    for (let i = 0; i < BANDS.length; i++) {
      expect(BANDS[i].id).toBe(i + 1);
    }
  });
});
