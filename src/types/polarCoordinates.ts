// Polar Coordinate Types and Calculations for Stanton System

/**
 * 2D Polar coordinate in the Stanton system
 * Using simplified 2D model (phi/elevation ignored since mostly 0)
 */
export interface PolarCoordinate {
  r: number;      // Distance from Stanton in Gm (millions of km)
  theta: number;  // Angle in degrees (0-360, can be negative)
}

/**
 * 2D Cartesian coordinate
 */
export interface CartesianCoordinate {
  x: number;
  y: number;
}

/**
 * Polar coordinate data for all Stanton system locations
 * Source: stanton_station_polar_coordinates_final.csv
 *
 * Note: Some locations may have data inconsistencies that need verification
 */
export const LOCATION_COORDINATES: Record<string, PolarCoordinate> = {
  // ArcCorp system
  'arccorp': { r: 28.91, theta: -50 },
  'arc-l1': { r: 26.02, theta: -50 },
  'arc-l2': { r: 31.81, theta: -50 },
  'arc-l3': { r: 28.92, theta: 150 },
  'arc-l4': { r: 28.91, theta: 9.99 },
  'arc-l5': { r: 28.92, theta: -110 },

  // Crusader system
  'crusader': { r: 19.14, theta: -172 },
  'cru-l1': { r: 17.23, theta: -172 },
  'cru-l3': { r: 19.14, theta: 8 },
  'cru-l4': { r: 19.14, theta: -112 },
  'cru-l5': { r: 19.14, theta: 127.98 },

  // Hurston system
  'hurston': { r: 12.85, theta: 0 },
  'hur-l1': { r: 11.56, theta: 0 },
  'hur-l2': { r: 14.13, theta: 0 },
  'hur-l4': { r: 12.84, theta: 59.98 },
  'hur-l5': { r: 12.85, theta: -60 },

  // microTech system
  'microtech': { r: 43.44, theta: 58.86 },
  'mic-l1': { r: 39.09, theta: 58.86 },
  'mic-l2': { r: 47.79, theta: 58.86 },
  'mic-l5': { r: 43.45, theta: -1.13 },

  // Jump Point Gateways
  'pyro-gateway': { r: 28.3, theta: -83.25 },
  'terra-gateway': { r: 51.57, theta: -5.88 },
  'nyx-gateway': { r: 69.55, theta: 159.35 },
};

/**
 * Convert degrees to radians
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert polar coordinates to cartesian
 */
export function polarToCartesian(polar: PolarCoordinate): CartesianCoordinate {
  const thetaRad = degreesToRadians(polar.theta);
  return {
    x: polar.r * Math.cos(thetaRad),
    y: polar.r * Math.sin(thetaRad),
  };
}

/**
 * Convert cartesian coordinates to polar
 */
export function cartesianToPolar(cart: CartesianCoordinate): PolarCoordinate {
  const r = Math.sqrt(cart.x * cart.x + cart.y * cart.y);
  const theta = Math.atan2(cart.y, cart.x) * (180 / Math.PI);
  return { r, theta };
}

/**
 * Calculate distance between two polar coordinates (in Gm)
 */
export function calculateDistance(a: PolarCoordinate, b: PolarCoordinate): number {
  const aCart = polarToCartesian(a);
  const bCart = polarToCartesian(b);

  const dx = bCart.x - aCart.x;
  const dy = bCart.y - aCart.y;

  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the position along a route at a given radius (band center)
 *
 * This finds where the line from start to destination intersects a circle
 * of the given radius around Stanton.
 *
 * @param start - Starting location polar coordinates
 * @param destination - Destination polar coordinates
 * @param targetRadius - The radius to find (e.g., band center distance in Gm)
 * @returns The polar coordinate at the intersection point
 */
export function interpolatePositionOnRoute(
  start: PolarCoordinate,
  destination: PolarCoordinate,
  targetRadius: number
): PolarCoordinate {
  // Convert to cartesian
  const startCart = polarToCartesian(start);
  const destCart = polarToCartesian(destination);

  // Direction vector from start to destination
  const dx = destCart.x - startCart.x;
  const dy = destCart.y - startCart.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // Unit direction vector
  const ux = dx / length;
  const uy = dy / length;

  // Solve for intersection with circle of targetRadius
  // Line: P = start + t * u (where t is distance along line)
  // Circle: |P|² = targetRadius²
  //
  // |start + t*u|² = r²
  // (sx + t*ux)² + (sy + t*uy)² = r²
  // (ux² + uy²)t² + 2(sx*ux + sy*uy)t + (sx² + sy²) - r² = 0
  //
  // Since u is unit vector: ux² + uy² = 1
  // t² + 2(sx*ux + sy*uy)t + (sx² + sy²) - r² = 0

  const a = 1; // ux² + uy² = 1 (unit vector)
  const b = 2 * (startCart.x * ux + startCart.y * uy);
  const c = startCart.x * startCart.x + startCart.y * startCart.y - targetRadius * targetRadius;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    // No intersection - route doesn't cross this radius
    // Return a point on the circle closest to the route midpoint
    const midX = (startCart.x + destCart.x) / 2;
    const midY = (startCart.y + destCart.y) / 2;
    const midR = Math.sqrt(midX * midX + midY * midY);
    const scale = targetRadius / midR;
    return cartesianToPolar({ x: midX * scale, y: midY * scale });
  }

  // Two solutions - pick the one in the direction of travel (positive t, closest to start)
  const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
  const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);

  // Choose t that is positive (in direction of travel) and smallest (first intersection)
  let t: number;
  if (t1 >= 0 && t2 >= 0) {
    t = Math.min(t1, t2);
  } else if (t1 >= 0) {
    t = t1;
  } else if (t2 >= 0) {
    t = t2;
  } else {
    // Both negative - route doesn't cross in direction of travel
    // Use the point on circle closest to destination
    const destR = Math.sqrt(destCart.x * destCart.x + destCart.y * destCart.y);
    const scale = targetRadius / destR;
    return cartesianToPolar({ x: destCart.x * scale, y: destCart.y * scale });
  }

  // Calculate intersection point
  const intersectX = startCart.x + t * ux;
  const intersectY = startCart.y + t * uy;

  return cartesianToPolar({ x: intersectX, y: intersectY });
}

/**
 * Get polar coordinates for a location by ID
 */
export function getLocationCoordinates(locationId: string): PolarCoordinate | null {
  return LOCATION_COORDINATES[locationId] || null;
}

/**
 * Format a polar coordinate for display
 */
export function formatPolarCoordinate(coord: PolarCoordinate): string {
  return `r=${coord.r.toFixed(2)} Gm, θ=${coord.theta.toFixed(1)}°`;
}

/**
 * Format distance for display
 */
export function formatPolarDistance(distanceGm: number): string {
  if (distanceGm >= 10) {
    return `${distanceGm.toFixed(1)} Gm`;
  } else if (distanceGm >= 1) {
    return `${distanceGm.toFixed(2)} Gm`;
  } else {
    // Less than 1 Gm, show in Mm
    return `${(distanceGm * 1000).toFixed(0)} Mm`;
  }
}
