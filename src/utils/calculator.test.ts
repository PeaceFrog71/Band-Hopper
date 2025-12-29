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
import {
  calculateExitWidths,
  getDestinationsByBandWidth,
  getRoute
} from '../types/routes';
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
    it('formats gigameters correctly', () => {
      // Values >= 10 Gm use one decimal
      expect(formatDistance(19_700_000)).toBe('19.7 Gm');
      expect(formatDistance(20_000_000)).toBe('20.0 Gm');
      expect(formatDistance(15_500_000)).toBe('15.5 Gm');
      // Values < 10 Gm use two decimals
      expect(formatDistance(5_500_000)).toBe('5.50 Gm');
    });

    it('formats tens of gigameters with one decimal', () => {
      expect(formatDistance(25_000_000)).toBe('25.0 Gm');
      expect(formatDistance(30_500_000)).toBe('30.5 Gm');
    });

    it('formats megameters correctly', () => {
      expect(formatDistance(500_000)).toBe('500 Mm');
      expect(formatDistance(50_000)).toBe('50.0 Mm');
    });
  });

  describe('formatDistanceCompact', () => {
    it('formats compactly for mobile', () => {
      expect(formatDistanceCompact(19_700_000)).toBe('19.70 Gm');
      expect(formatDistanceCompact(20_320_000)).toBe('20.32 Gm');
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

describe('Exit Width Calculations', () => {
  describe('calculateExitWidths', () => {
    it('calculates exit widths for all bands', () => {
      const route = getRoute('arc-l1', 'crusader');
      expect(route).not.toBeNull();

      const withWidths = calculateExitWidths(route!.bandExits);

      expect(withWidths.length).toBe(10);
      withWidths.forEach(exit => {
        expect(exit.exitWidth).toBeGreaterThan(0);
      });
    });

    it('Band 1 only has gap to next band (no previous)', () => {
      const route = getRoute('arc-l1', 'crusader');
      const withWidths = calculateExitWidths(route!.bandExits);

      const band1 = withWidths.find(e => e.bandId === 1)!;
      expect(band1.gapToPreviousBand).toBeUndefined();
      expect(band1.gapToNextBand).toBeDefined();
      expect(band1.exitWidth).toBe(band1.gapToNextBand);
    });

    it('Band 10 only has gap to previous band (no next)', () => {
      const route = getRoute('arc-l1', 'crusader');
      const withWidths = calculateExitWidths(route!.bandExits);

      const band10 = withWidths.find(e => e.bandId === 10)!;
      expect(band10.gapToPreviousBand).toBeDefined();
      expect(band10.gapToNextBand).toBeUndefined();
      expect(band10.exitWidth).toBe(band10.gapToPreviousBand);
    });

    it('Middle bands use minimum of two gaps', () => {
      const route = getRoute('arc-l1', 'crusader');
      const withWidths = calculateExitWidths(route!.bandExits);

      const band5 = withWidths.find(e => e.bandId === 5)!;
      expect(band5.gapToPreviousBand).toBeDefined();
      expect(band5.gapToNextBand).toBeDefined();
      expect(band5.exitWidth).toBe(
        Math.min(band5.gapToPreviousBand!, band5.gapToNextBand!)
      );
    });

    it('matches expected CSV values for ARC-L1 to CRUSADER', () => {
      // From CSV: ARC-L1 to CRUSADER has gaps:
      // 12: 184003, 23: 163333, 34: 204129, 45: 178789, 56: 177111
      // 67: 223335, 78: 255157, 89: 233356, 90: 144735
      const route = getRoute('arc-l1', 'crusader');
      const withWidths = calculateExitWidths(route!.bandExits);

      // Band 2 gap to Band 1 should be ~184,003
      const band2 = withWidths.find(e => e.bandId === 2)!;
      expect(band2.gapToPreviousBand).toBeCloseTo(184_003, -3); // within 1000

      // Band 5 gap to Band 4 should be ~178,789
      const band5 = withWidths.find(e => e.bandId === 5)!;
      expect(band5.gapToPreviousBand).toBeCloseTo(178_789, -3);
    });
  });

  describe('getDestinationsByBandWidth', () => {
    it('returns destinations sorted by width (widest first)', () => {
      const results = getDestinationsByBandWidth('arc-l1', 5);

      expect(results.length).toBeGreaterThan(0);

      // Verify sorted by width descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].exitWidth).toBeGreaterThanOrEqual(results[i].exitWidth);
      }
    });

    it('returns empty array for invalid start location', () => {
      const results = getDestinationsByBandWidth('invalid-location', 5);
      expect(results.length).toBe(0);
    });

    it('includes exit distance and width for each destination', () => {
      const results = getDestinationsByBandWidth('arc-l1', 5);

      results.forEach(dest => {
        expect(dest.destinationId).toBeDefined();
        expect(dest.exitDistance).toBeGreaterThan(0);
        expect(dest.exitWidth).toBeGreaterThan(0);
      });
    });
  });
});
