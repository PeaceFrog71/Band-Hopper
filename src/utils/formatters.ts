// Aaron Halo Guide - Display Formatters

/**
 * Format a number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format a percentage value
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format density as a percentage string (0-100)
 */
export function formatDensity(density: number): string {
  return `${Math.round(density * 100)}%`;
}

/**
 * Format aUEC currency value
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M aUEC`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K aUEC`;
  }
  return `${value} aUEC`;
}

/**
 * Format SCU cargo capacity
 */
export function formatCargo(scu: number): string {
  return `${scu} SCU`;
}

/**
 * Format a time duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
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
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

/**
 * Format distance for display (reusing from calculator but standalone)
 * Converts to millions of km with appropriate precision
 */
export function formatDistanceDisplay(distanceKm: number): string {
  const millions = distanceKm / 1_000_000;

  if (millions >= 10) {
    return `${millions.toFixed(1)} Gm`;
  } else if (millions >= 1) {
    return `${millions.toFixed(1)} Gm`;
  } else {
    const thousands = distanceKm / 1_000;
    if (thousands >= 100) {
      return `${thousands.toFixed(0)} Mm`;
    } else if (thousands >= 1) {
      return `${thousands.toFixed(1)} Mm`;
    }
    return `${distanceKm.toFixed(0)} km`;
  }
}

/**
 * Format distance for large display (mobile-optimized, big numbers)
 */
export function formatDistanceLarge(distanceKm: number): {
  value: string;
  unit: string;
} {
  const millions = distanceKm / 1_000_000;

  if (millions >= 1) {
    return {
      value: millions.toFixed(1),
      unit: 'Gm'
    };
  }

  const thousands = distanceKm / 1_000;
  return {
    value: thousands.toFixed(0),
    unit: 'Mm'
  };
}

/**
 * Format location name for display
 * Converts IDs like 'arc-l1' to 'ARC-L1'
 */
export function formatLocationId(id: string): string {
  return id.toUpperCase().replace(/-/g, '-');
}

/**
 * Format band name for display
 */
export function formatBandName(bandId: number): string {
  return `Band ${bandId}`;
}

/**
 * Format QT drive speed
 * Speed is in Mm/s (megameters per second)
 */
export function formatQtSpeed(speedMmPerSec: number): string {
  return `${speedMmPerSec} Mm/s`;
}

/**
 * Format yield bonus as a percentage change
 */
export function formatYieldBonus(bonus: number): string {
  const change = (bonus - 1) * 100;
  if (change > 0) {
    return `+${change.toFixed(0)}%`;
  } else if (change < 0) {
    return `${change.toFixed(0)}%`;
  }
  return '—';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format rarity for display with color class
 */
export function getRarityClass(rarity: string): string {
  switch (rarity) {
    case 'very-rare':
      return 'rarity-very-rare';
    case 'rare':
      return 'rarity-rare';
    case 'uncommon':
      return 'rarity-uncommon';
    default:
      return 'rarity-common';
  }
}

/**
 * Format rarity for display text
 */
export function formatRarity(rarity: string): string {
  switch (rarity) {
    case 'very-rare':
      return 'Very Rare';
    case 'rare':
      return 'Rare';
    case 'uncommon':
      return 'Uncommon';
    default:
      return 'Common';
  }
}
