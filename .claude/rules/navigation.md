---
paths: src/utils/calculator.ts, src/utils/calculator.test.ts
---

# Navigation Calculation Rules

## Core Concepts

### Aaron Halo Structure
The Aaron Halo is an asteroid belt with 10 bands at fixed distances from the Stanton map marker:
- Inner edge: ~19,673,000 km
- Outer edge: ~21,298,000 km
- Each band has varying asteroid density

### Navigation Methods

**1. Stanton Marker Method (Preferred)**
- Use distance to Stanton system marker as reference
- Works for any route crossing the belt
- Most reliable and consistent

**2. Destination Distance Method**
- Use remaining distance to destination
- Specific to each route
- Pre-calculated for all valid routes

## Key Calculations

### Band Position Detection
```typescript
function findCurrentBand(distanceToStanton: number): Band | null {
  // Check each band's inner/outer range
  return BANDS.find(band =>
    distanceToStanton >= band.innerDistance &&
    distanceToStanton <= band.outerDistance
  ) || null;
}
```

### Route Exit Distance
```typescript
// Pre-calculated route lookup
function getExitDistance(
  startId: string,
  destId: string,
  bandId: number
): { stantonMethod: number; destMethod: number } | null {
  const route = ROUTES.find(r =>
    r.startId === startId && r.destinationId === destId
  );
  if (!route) return null;

  const exit = route.bandExits.find(e => e.bandId === bandId);
  return exit ? {
    stantonMethod: exit.distanceFromStanton,
    destMethod: exit.distanceToDestination
  } : null;
}
```

### Travel Time
```typescript
function calculateTravelTime(distance: number, qtSpeed: number): number {
  return distance / qtSpeed; // Returns seconds
}
```

## Data Accuracy

- Band distances from CaptSheppard's density survey (cstone.space)
- Route data verified against in-game measurements where possible
- QT drive speeds from Star Citizen ship database

## Testing Requirements

- Test all band boundary conditions (inner edge, outer edge, between bands)
- Test route calculations against known values from PDF
- Verify "Where Am I?" feature with sample distances
- Test refinery distance calculations
