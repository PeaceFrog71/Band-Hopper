// Stanton System Map - Interactive visualization of the Stanton system
// Shows planets, stations, Aaron Halo bands, and user position/route
// Styled to match Star Citizen's in-game star map aesthetic

import type React from 'react';
import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { BANDS, HALO_INNER_EDGE, HALO_OUTER_EDGE } from '../types/bands';
import { LOCATIONS } from '../types/locations';
import { LOCATION_COORDINATES, interpolatePositionOnRoute } from '../types/polarCoordinates';
import { getRoute } from '../types/routes';

// Planet colors - cyan/teal glow style matching SC star map
const PLANET_COLORS: Record<string, string> = {
  hurston: '#4ecdc4',    // Teal (desert world)
  crusader: '#5dade2',   // Light blue (gas giant)
  arccorp: '#45b7aa',    // Cyan-teal (urban world)
  microtech: '#7fb3d3',  // Ice blue
};

// Zoom presets - define viewable range in km
type ZoomLevel = 'system' | 'halo';

interface ZoomConfig {
  label: string;
  maxRadius: number;  // km - outer edge of view
  minRadius: number;  // km - inner edge (for halo view)
}

const ZOOM_LEVELS: Record<ZoomLevel, ZoomConfig> = {
  system: {
    label: 'System View',
    maxRadius: 45_000_000,  // Show up to MIC-L2
    minRadius: 0,
  },
  halo: {
    label: 'Halo View',
    maxRadius: HALO_OUTER_EDGE + 500_000,  // Just past band 10
    minRadius: HALO_INNER_EDGE - 500_000,  // Just inside band 1
  },
};

export interface MapPosition {
  distanceFromStanton: number;
  angle?: number;  // Optional angle in degrees (theta from polar coordinates)
  label?: string;
}

export interface MapRoute {
  start: MapPosition;
  destination: MapPosition;
  bandExitDistance?: number;  // Distance where user should exit QT
}

interface StantonSystemMapProps {
  position?: MapPosition;        // Current position to highlight
  route?: MapRoute;              // Route to display
  zoomLevel?: ZoomLevel;         // Current zoom level
  onZoomChange?: (level: ZoomLevel) => void;
  showLabels?: boolean;          // Show planet/station labels
  showLegend?: boolean;          // Show the legend (default true)
}

// Initial zoom scale for each view level
const INITIAL_ZOOM_SCALE: Record<ZoomLevel, number> = {
  system: 1,
  halo: 2.0,  // Start zoomed in, centered on exit point (max is 2.5)
};

// Halo center distance for auto-centering in halo view
const HALO_CENTER_DISTANCE = (HALO_INNER_EDGE + HALO_OUTER_EDGE) / 2; // ~20.5 Gm

export function StantonSystemMap({
  position,
  route,
  zoomLevel = 'system',
  onZoomChange,
  showLabels = true,
  showLegend = true,
}: StantonSystemMapProps) {
  const zoom = ZOOM_LEVELS[zoomLevel];

  // Mouse wheel zoom state - start with appropriate zoom for view level
  const [zoomScale, setZoomScale] = useState(INITIAL_ZOOM_SCALE[zoomLevel]);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Touch state for pinch-to-zoom and drag-to-pan
  const lastTouchPos = useRef({ x: 0, y: 0 });
  const lastPinchDistance = useRef<number | null>(null);

  // Handle mouse wheel zoom - halo view has limited zoom out
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const minZoom = zoomLevel === 'halo' ? 0.8 : 0.5;  // Halo can't zoom out much
    const maxZoom = zoomLevel === 'halo' ? 2.5 : 3;    // But can zoom in more
    setZoomScale(prev => Math.min(Math.max(prev + delta, minZoom), maxZoom));
  }, [zoomLevel]);

  // Handle mouse drag for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    setPanOffset(prev => ({
      x: prev.x + dx / zoomScale,
      y: prev.y + dy / zoomScale,
    }));
  }, [zoomScale]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Touch event handlers for mobile pinch-to-zoom and drag-to-pan
  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: React.TouchList): { x: number; y: number } => {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent page zoom
    const touches = e.touches;
    if (touches.length === 2) {
      // Pinch start
      lastPinchDistance.current = getTouchDistance(touches);
    }
    lastTouchPos.current = getTouchCenter(touches);
    isDragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent page zoom
    const touches = e.touches;

    if (touches.length === 2 && lastPinchDistance.current !== null) {
      // Pinch zoom
      const newDistance = getTouchDistance(touches);
      const delta = (newDistance - lastPinchDistance.current) * 0.01;
      const minZoom = zoomLevel === 'halo' ? 0.8 : 0.5;
      const maxZoom = zoomLevel === 'halo' ? 2.5 : 3;
      setZoomScale(prev => Math.min(Math.max(prev + delta, minZoom), maxZoom));
      lastPinchDistance.current = newDistance;
    }

    // Pan (works with 1 or 2 fingers)
    if (isDragging.current) {
      const touchCenter = getTouchCenter(touches);
      const dx = touchCenter.x - lastTouchPos.current.x;
      const dy = touchCenter.y - lastTouchPos.current.y;
      lastTouchPos.current = touchCenter;
      setPanOffset(prev => ({
        x: prev.x + dx / zoomScale,
        y: prev.y + dy / zoomScale,
      }));
    }
  }, [zoomLevel, zoomScale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      lastPinchDistance.current = null;
    }
    if (e.touches.length === 0) {
      isDragging.current = false;
    }
  }, []);

  // Reset zoom/pan when zoom level preset changes
  const handleZoomPresetChange = useCallback((level: ZoomLevel) => {
    setZoomScale(INITIAL_ZOOM_SCALE[level]);
    setPanOffset({ x: 0, y: 0 });
    onZoomChange?.(level);
  }, [onZoomChange]);

  // Calculate center angle for halo view (used for centering and arc rendering)
  // Uses exit point angle if route exists, or position angle for Where Am I
  const centerAngleRad = useMemo(() => {
    if (route?.bandExitDistance) {
      const startCoords = LOCATION_COORDINATES[route.start.label?.toLowerCase().replace(/\s+/g, '-') || ''];
      const destCoords = LOCATION_COORDINATES[route.destination.label?.toLowerCase().replace(/\s+/g, '-') || ''];
      if (startCoords && destCoords) {
        const exitDistanceGm = route.bandExitDistance / 1_000_000;
        const exitPolar = interpolatePositionOnRoute(startCoords, destCoords, exitDistanceGm);
        return -exitPolar.theta * (Math.PI / 180); // Negate for SVG
      }
    } else if (position?.angle !== undefined) {
      // Use position angle for Where Am I view
      return -position.angle * (Math.PI / 180); // Negate for SVG
    }
    return -Math.PI / 4; // Default: 45 degrees
  }, [route?.bandExitDistance, route?.start.label, route?.destination.label, position?.angle]);

  // Calculate pan offset to center on target point (exit point or position for Where Am I)
  const getHaloCenterPan = useCallback(() => {
    const svgSize = 600;
    const ctr = svgSize / 2;
    const pad = 50;
    const maxR = (svgSize - pad * 2) / 2;

    // Calculate where the target point would be
    // Use exit distance, position distance, or halo center as fallback
    const haloRange = ZOOM_LEVELS.halo.maxRadius - ZOOM_LEVELS.halo.minRadius;
    const targetDist = route?.bandExitDistance || position?.distanceFromStanton || HALO_CENTER_DISTANCE;
    const distFromInner = targetDist - ZOOM_LEVELS.halo.minRadius;
    const normalized = distFromInner / haloRange;
    const minSvgR = maxR * 0.3;
    const maxSvgR = maxR * 0.95;
    const targetSvgRadius = minSvgR + normalized * (maxSvgR - minSvgR);

    // Calculate target point position
    const targetX = ctr + targetSvgRadius * Math.cos(centerAngleRad);
    const targetY = ctr + targetSvgRadius * Math.sin(centerAngleRad);

    // Pan to center on the target point
    return { x: ctr - targetX, y: ctr - targetY };
  }, [route?.bandExitDistance, position?.distanceFromStanton, centerAngleRad]);

  // Reset zoom scale and pan offset when zoom level changes
  useEffect(() => {
    setZoomScale(INITIAL_ZOOM_SCALE[zoomLevel]);
    setPanOffset(zoomLevel === 'halo' ? getHaloCenterPan() : { x: 0, y: 0 });
  }, [zoomLevel, getHaloCenterPan]);

  // SVG dimensions and scaling - larger for better visibility
  const size = 600;
  const center = size / 2;
  const padding = 50;
  const maxSvgRadius = (size - padding * 2) / 2;

  // Scale function: convert km to SVG coordinates
  // System view uses linear scaling from center
  // Halo view maps the halo range to spread bands across the view
  const scaleRadius = (kmDistance: number): number => {
    if (zoomLevel === 'halo') {
      // Map halo distance range to SVG radius
      // Inner edge of halo maps to small radius, outer edge to large radius
      const haloRange = zoom.maxRadius - zoom.minRadius;
      const distFromInner = kmDistance - zoom.minRadius;
      const normalized = distFromInner / haloRange;

      // Use most of the SVG radius for the halo bands (leave some margin)
      const minSvgR = maxSvgRadius * 0.3;  // Inner edge at 30% of radius
      const maxSvgR = maxSvgRadius * 0.95; // Outer edge at 95% of radius
      return minSvgR + normalized * (maxSvgR - minSvgR);
    }

    // Linear scaling for system view
    return (kmDistance / zoom.maxRadius) * maxSvgRadius;
  };

  // Get planets to display (filter by zoom level visibility)
  // In halo view, include planets close to the belt for reference
  const HALO_MARGIN = 2_000_000; // 2 Gm margin for nearby locations
  const planets = useMemo(() => {
    return LOCATIONS
      .filter(loc => loc.type === 'planet')
      .filter(loc => {
        // In halo view, show planets within range or close to it
        if (zoomLevel === 'halo') {
          return loc.distanceFromStanton >= (zoom.minRadius - HALO_MARGIN) &&
                 loc.distanceFromStanton <= (zoom.maxRadius + HALO_MARGIN);
        }
        return loc.distanceFromStanton <= zoom.maxRadius;
      })
      .map(planet => ({
        ...planet,
        color: PLANET_COLORS[planet.id] || '#ffffff',
        radius: scaleRadius(planet.distanceFromStanton),
      }));
  }, [zoomLevel]);

  // Calculate planet positions for collision detection
  const planetPositions = useMemo(() => {
    return planets.map(planet => {
      const coords = LOCATION_COORDINATES[planet.id];
      if (!coords) return null;
      const angle = -coords.theta * (Math.PI / 180);
      const x = center + planet.radius * Math.cos(angle);
      const y = center + planet.radius * Math.sin(angle);
      const isInLowerHalf = y > center;
      return { id: planet.id, x, y, labelAbove: isInLowerHalf };
    }).filter(Boolean) as { id: string; x: number; y: number; labelAbove: boolean }[];
  }, [planets, center]);

  // Helper to get label position for stations - opposite side from nearby planet
  const getStationLabelPosition = useCallback((x: number, y: number) => {
    const nearbyThreshold = 60; // pixels - how close is "near" a planet
    for (const planet of planetPositions) {
      const dx = Math.abs(x - planet.x);
      const dy = Math.abs(y - planet.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < nearbyThreshold) {
        // Near a planet - put label on opposite side from planet label
        // If planet label is above, put station label below and vice versa
        return { yOffset: planet.labelAbove ? 16 : -14, xOffset: 0 };
      }
    }
    // Not near any planet - default to above
    return { yOffset: -14, xOffset: 0 };
  }, [planetPositions]);

  // Get stations/L-points to display (only in system view or if in halo range)
  const stations = useMemo(() => {
    return LOCATIONS
      .filter(loc => loc.type === 'refinery' || loc.type === 'station')
      .filter(loc => {
        if (zoomLevel === 'system') return loc.distanceFromStanton <= zoom.maxRadius;
        // In halo view, show stations within range or close to it
        return loc.distanceFromStanton >= (zoom.minRadius - HALO_MARGIN) &&
               loc.distanceFromStanton <= (zoom.maxRadius + HALO_MARGIN);
      })
      .map(station => ({
        ...station,
        radius: scaleRadius(station.distanceFromStanton),
        // Calculate angle based on orbital body (spread around the orbit)
        angle: getStationAngle(station.id, station.orbitalBody),
      }));
  }, [zoomLevel]);

  // Generate band arcs for Aaron Halo
  // Halo view maps the full band range to SVG space for maximum spread
  const bandArcs = useMemo(() => {
    // Only show bands if they're in view
    if (zoomLevel === 'system' && HALO_OUTER_EDGE > zoom.maxRadius) return [];

    return BANDS.map(band => {
      const innerR = scaleRadius(band.innerDistance);
      const outerR = scaleRadius(band.outerDistance);

      // Color based on density (green intensity)
      const intensity = Math.floor(band.relativeDensity * 200 + 55);
      const color = `rgba(0, ${intensity}, ${Math.floor(intensity * 0.6)}, 0.6)`;

      return {
        ...band,
        innerRadius: innerR,
        outerRadius: outerR,
        color,
      };
    });
  }, [zoomLevel]);

  // Position marker coordinates
  const positionMarker = useMemo(() => {
    if (!position) return null;
    const r = scaleRadius(position.distanceFromStanton);
    // Use provided angle or default to top (-90 degrees)
    // Negate theta for SVG coordinate system (Y points down in SVG)
    const angleDeg = position.angle !== undefined ? -position.angle : -90;
    const angleRad = angleDeg * (Math.PI / 180);
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad),
      label: position.label || 'You',
    };
  }, [position, zoomLevel]);

  // Route visualization
  const routeElements = useMemo(() => {
    if (!route) return null;

    const startR = scaleRadius(route.start.distanceFromStanton);
    const destR = scaleRadius(route.destination.distanceFromStanton);

    // Use actual location angles based on their names
    const startAngle = getLocationAngle(route.start.label || '');
    const destAngle = getLocationAngle(route.destination.label || '');

    const startX = center + startR * Math.cos(startAngle);
    const startY = center + startR * Math.sin(startAngle);
    const destX = center + destR * Math.cos(destAngle);
    const destY = center + destR * Math.sin(destAngle);

    // Band exit point (if specified)
    let exitPoint = null;      // For system view - on the flight path line
    let exitPointHalo = null;  // For halo view - at polar coordinate position
    let exitBandId: number | null = null;
    if (route.bandExitDistance) {
      // Get start and destination polar coordinates
      const startCoords = LOCATION_COORDINATES[route.start.label?.toLowerCase().replace(/\s+/g, '-') || ''];
      const destCoords = LOCATION_COORDINATES[route.destination.label?.toLowerCase().replace(/\s+/g, '-') || ''];

      // System view: Find where the flight path line intersects the exit radius circle
      // This is a line-circle intersection problem
      const exitR = scaleRadius(route.bandExitDistance);

      // Line from start to destination: P = start + t * (dest - start)
      // Circle: |P - center|² = exitR²
      // Solve for t where the line crosses the circle

      // Translate to center-relative coordinates
      const sx = startX - center;
      const sy = startY - center;
      const dx = destX - startX;
      const dy = destY - startY;

      // Quadratic equation: at² + bt + c = 0
      // where a = dx² + dy², b = 2(sx*dx + sy*dy), c = sx² + sy² - r²
      const a = dx * dx + dy * dy;
      const b = 2 * (sx * dx + sy * dy);
      const c = sx * sx + sy * sy - exitR * exitR;

      const discriminant = b * b - 4 * a * c;

      if (discriminant >= 0 && a > 0) {
        // Find the intersection point(s)
        const sqrtDisc = Math.sqrt(discriminant);
        const t1 = (-b - sqrtDisc) / (2 * a);
        const t2 = (-b + sqrtDisc) / (2 * a);

        // Choose the t value that's between 0 and 1 (on the line segment)
        // Prefer the one closer to start (smaller positive t)
        let t: number | null = null;
        if (t1 >= 0 && t1 <= 1) t = t1;
        else if (t2 >= 0 && t2 <= 1) t = t2;
        else if (t1 >= 0) t = t1; // Allow slightly outside segment
        else if (t2 >= 0) t = t2;

        if (t !== null) {
          exitPoint = {
            x: startX + t * dx,
            y: startY + t * dy,
          };
        }
      }

      // Halo view: Use proper polar coordinate math
      if (startCoords && destCoords) {
        const exitDistanceGm = route.bandExitDistance / 1_000_000;
        const exitPolar = interpolatePositionOnRoute(startCoords, destCoords, exitDistanceGm);
        const exitAngle = -exitPolar.theta * (Math.PI / 180);
        const exitR = scaleRadius(route.bandExitDistance);

        exitPointHalo = {
          x: center + exitR * Math.cos(exitAngle),
          y: center + exitR * Math.sin(exitAngle),
        };
      } else {
        // Fallback: use the line-based calculation
        exitPointHalo = exitPoint;
      }

      // Find which band this exit distance corresponds to
      const exitDistanceKm = route.bandExitDistance;
      const matchingBand = BANDS.find(band =>
        exitDistanceKm >= band.innerDistance && exitDistanceKm <= band.outerDistance
      );
      // If not exactly in a band, find the closest one
      if (matchingBand) {
        exitBandId = matchingBand.id;
      } else {
        // Find closest band by peak density distance
        let closestBand = BANDS[0];
        let minDistance = Math.abs(exitDistanceKm - BANDS[0].peakDensityDistance);
        for (const band of BANDS) {
          const dist = Math.abs(exitDistanceKm - band.peakDensityDistance);
          if (dist < minDistance) {
            minDistance = dist;
            closestBand = band;
          }
        }
        exitBandId = closestBand.id;
      }
    }

    // Determine which reference is closer along the route (for halo view)
    // Use actual route distances, not radial distance from Stanton
    let closestRef: 'start' | 'destination' = 'destination';
    if (route.bandExitDistance && exitBandId !== null) {
      // Look up the actual route data
      const startId = route.start.label?.toLowerCase().replace(/\s+/g, '-') || '';
      const destId = route.destination.label?.toLowerCase().replace(/\s+/g, '-') || '';
      const routeData = getRoute(startId, destId);
      if (routeData) {
        const bandExit = routeData.bandExits.find(be => be.bandId === exitBandId);
        if (bandExit) {
          // Compare distance traveled from start vs remaining distance to destination
          closestRef = bandExit.distanceFromStart <= bandExit.distanceToDestination ? 'start' : 'destination';
        }
      }
    }

    return {
      startX, startY, startLabel: route.start.label || 'Start',
      destX, destY, destLabel: route.destination.label || 'Destination',
      exitPoint,
      exitPointHalo,
      exitBandId,
      closestRef, // 'start' or 'destination'
    };
  }, [route, zoomLevel]);

  return (
    <div className="stanton-map">
      {/* Zoom controls */}
      <div className="map-zoom-controls">
        {onZoomChange && (Object.keys(ZOOM_LEVELS) as ZoomLevel[]).map(level => (
          <button
            key={level}
            className={`zoom-btn ${zoomLevel === level ? 'active' : ''}`}
            onClick={() => handleZoomPresetChange(level)}
          >
            {ZOOM_LEVELS[level].label}
          </button>
        ))}
        {(() => {
          const defaultPan = zoomLevel === 'halo' ? getHaloCenterPan() : { x: 0, y: 0 };
          const isAtDefaultZoom = zoomScale === INITIAL_ZOOM_SCALE[zoomLevel];
          const isAtDefaultPan = Math.abs(panOffset.x - defaultPan.x) < 1 && Math.abs(panOffset.y - defaultPan.y) < 1;
          return !isAtDefaultZoom || !isAtDefaultPan;
        })() && (
          <button
            className="zoom-btn reset"
            onClick={() => {
              setZoomScale(INITIAL_ZOOM_SCALE[zoomLevel]);
              // Re-center on exit point for halo view, origin for system view
              setPanOffset(zoomLevel === 'halo' ? getHaloCenterPan() : { x: 0, y: 0 });
            }}
          >
            Reset
          </button>
        )}
      </div>
      <div className="map-zoom-hint">Scroll or pinch to zoom, drag to pan</div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className="system-map-svg"
        role="img"
        aria-label="Stanton System Map"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{ cursor: isDragging.current ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        {/* Definitions for gradients and filters */}
        <defs>
          {/* Star glow gradient */}
          <radialGradient id="starGlow">
            <stop offset="0%" stopColor="#fffef0" />
            <stop offset="20%" stopColor="#fff4c4" />
            <stop offset="50%" stopColor="#ffd700" />
            <stop offset="80%" stopColor="#ff8c00" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
          </radialGradient>

          {/* Planet glow filter */}
          <filter id="planetGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Orbital ring glow */}
          <filter id="orbitGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Aaron Halo gradient - asteroid belt look */}
          <radialGradient id="haloGradient" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="#1a3a3a" stopOpacity="0" />
            <stop offset="90%" stopColor="#2a4a4a" stopOpacity="0.3" />
            <stop offset="95%" stopColor="#3a5a5a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2a4a4a" stopOpacity="0.3" />
          </radialGradient>
        </defs>

        {/* Space background */}
        <rect x="0" y="0" width={size} height={size} fill="#0a1a1a" />

        {/* Scattered stars */}
        {Array.from({ length: 80 }).map((_, i) => {
          const starX = (i * 97 + 23) % size;
          const starY = (i * 71 + 17) % size;
          const starSize = (i % 3) * 0.3 + 0.5;
          const opacity = (i % 5) * 0.1 + 0.3;
          return (
            <circle
              key={`star-${i}`}
              cx={starX}
              cy={starY}
              r={starSize}
              fill="#ffffff"
              opacity={opacity}
            />
          );
        })}

        {/* Zoomable/pannable content group */}
        <g transform={`translate(${center + panOffset.x}, ${center + panOffset.y}) scale(${zoomScale}) translate(${-center}, ${-center})`}>

        {/* Planet orbital rings - cyan style */}
        {planets.map(planet => (
          <circle
            key={`orbit-${planet.id}`}
            cx={center}
            cy={center}
            r={planet.radius}
            fill="none"
            stroke="#1a6b6b"
            strokeWidth="1"
            filter="url(#orbitGlow)"
            opacity={0.8}
          />
        ))}

        {/* Aaron Halo - asteroid belt visualization */}
        {bandArcs.length > 0 && (
          <g className="aaron-halo">
            {/* System view: single uniform transparent ring */}
            {zoomLevel === 'system' && (() => {
              // Calculate the center of the entire halo (average of all bands)
              const innermost = Math.min(...bandArcs.map(b => b.innerRadius));
              const outermost = Math.max(...bandArcs.map(b => b.outerRadius));
              const haloMidRadius = (innermost + outermost) / 2;
              const haloWidth = outermost - innermost;

              return (
                <circle
                  cx={center}
                  cy={center}
                  r={haloMidRadius}
                  fill="none"
                  stroke="rgba(80, 200, 180, 0.35)"
                  strokeWidth={haloWidth}
                />
              );
            })()}

            {/* Halo view: individual band rings with density coloring and proportional widths */}
            {zoomLevel === 'halo' && bandArcs.map(band => {
              const midRadius = (band.innerRadius + band.outerRadius) / 2;
              const intensity = band.relativeDensity;
              // Cyan-green color based on density
              const color = `rgba(${Math.floor(40 + intensity * 60)}, ${Math.floor(180 + intensity * 75)}, ${Math.floor(160 + intensity * 60)}, ${0.4 + intensity * 0.4})`;
              // Use actual band width for stroke (proportional to real dimensions)
              const strokeW = Math.max(band.outerRadius - band.innerRadius, 4);

              return (
                <circle
                  key={`band-${band.id}`}
                  cx={center}
                  cy={center}
                  r={midRadius}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeW}
                />
              );
            })}

            {/* Halo label (system view only) */}
            {zoomLevel === 'system' && showLabels && (
              <g transform={`translate(${center}, ${center + scaleRadius(20_500_000) + 25})`}>
                <text
                  x="0"
                  y="0"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="map-label"
                >
                  AARON HALO
                </text>
                <text
                  x="0"
                  y="14"
                  fill="#6b9a9a"
                  fontSize="9"
                  textAnchor="middle"
                  className="map-label"
                >
                  ASTEROID BELT
                </text>
              </g>
            )}

            {/* Band labels (halo view only) - positioned near exit point or position marker */}
            {zoomLevel === 'halo' && showLabels && (() => {
              // Calculate angle for positioning band labels
              let markerAngleDeg = -75; // Default angle if no route or position
              if (route?.bandExitDistance) {
                // Use route exit point angle
                const startCoords = LOCATION_COORDINATES[route.start.label?.toLowerCase().replace(/\s+/g, '-') || ''];
                const destCoords = LOCATION_COORDINATES[route.destination.label?.toLowerCase().replace(/\s+/g, '-') || ''];
                if (startCoords && destCoords) {
                  const exitDistanceGm = route.bandExitDistance / 1_000_000;
                  const exitPolar = interpolatePositionOnRoute(startCoords, destCoords, exitDistanceGm);
                  markerAngleDeg = -exitPolar.theta; // Negate for SVG
                }
              } else if (position?.angle !== undefined) {
                // Use position marker angle (for Where Am I view)
                markerAngleDeg = -position.angle; // Negate for SVG
              }

              // Find center band index to base offsets on distance from it
              let centerBandIdx = 4; // Default to middle (band 5)
              if (routeElements?.exitBandId) {
                // Use route exit band
                const exitBandIndex = bandArcs.findIndex(b => b.id === routeElements.exitBandId);
                centerBandIdx = exitBandIndex >= 0 ? exitBandIndex : 4;
              } else if (position && position.distanceFromStanton > 0) {
                // Find nearest band to position (for Where Am I view)
                const posDistKm = position.distanceFromStanton;
                let minDist = Infinity;
                bandArcs.forEach((band, idx) => {
                  const bandMidKm = (band.innerDistance + band.outerDistance) / 2;
                  const dist = Math.abs(posDistKm - bandMidKm);
                  if (dist < minDist) {
                    minDist = dist;
                    centerBandIdx = idx;
                  }
                });
              }

              return bandArcs.map((band, index) => {
                // Position label slightly outward from center of the band
                const labelR = (band.innerRadius + band.outerRadius) / 2 + 2;
                // Offset based on distance from center band - center band closest, furthest bands get more offset
                // Distance from center band (0 for center band, 1 for adjacent, etc.)
                const distanceFromCenter = Math.abs(index - centerBandIdx);
                // Base offset of 15° to clear the X marker (moved down slightly), then add 5° for each band away from center
                const angularOffset = 15 + distanceFromCenter * 5;
                const labelAngle = (markerAngleDeg + angularOffset) * (Math.PI / 180);
                // Use darker color for band 5 (brightest band)
                const labelColor = band.id === 5 ? '#006688' : '#00d9ff';
                return (
                  <text
                    key={`label-${band.id}`}
                    x={center + labelR * Math.cos(labelAngle)}
                    y={center + labelR * Math.sin(labelAngle)}
                    fill={labelColor}
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="map-label"
                  >
                    {band.id}
                  </text>
                );
              });
            })()}
          </g>
        )}

        {/* Stanton star (center) - glowing sun */}
        <g className="stanton-star">
          {zoomLevel === 'system' ? (
            <>
              <circle cx={center} cy={center} r="25" fill="url(#starGlow)" />
              <circle cx={center} cy={center} r="12" fill="#fffef8" />
              {showLabels && (
                <g transform={`translate(${center}, ${center - 35})`}>
                  <text
                    x="0"
                    y="0"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="map-label"
                  >
                    STANTON
                  </text>
                  <text
                    x="0"
                    y="12"
                    fill="#b8a060"
                    fontSize="9"
                    textAnchor="middle"
                    className="map-label"
                  >
                    STAR
                  </text>
                </g>
              )}
            </>
          ) : (
            <>
              {/* Smaller star marker for halo view */}
              <circle cx={center} cy={center} r="8" fill="url(#starGlow)" />
              <circle cx={center} cy={center} r="4" fill="#fffef8" />
              {showLabels && (
                <text
                  x={center}
                  y={center - 12}
                  fill="#b8a060"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="map-label"
                >
                  STANTON
                </text>
              )}
            </>
          )}
        </g>

        {/* Planet markers with glow rings */}
        {planets.map(planet => {
          const angle = getPlanetAngle(planet.id);
          const x = center + planet.radius * Math.cos(angle);
          const y = center + planet.radius * Math.sin(angle);
          const planetSize = zoomLevel === 'system' ? 10 : 6;

          return (
            <g key={planet.id} filter="url(#planetGlow)">
              {/* Planet glow ring */}
              <circle
                cx={x}
                cy={y}
                r={planetSize + 4}
                fill="none"
                stroke={planet.color}
                strokeWidth="1"
                opacity={0.6}
              />
              {/* Planet body */}
              <circle
                cx={x}
                cy={y}
                r={planetSize}
                fill={planet.color}
              />
              {/* Planet highlight */}
              <circle
                cx={x - planetSize * 0.3}
                cy={y - planetSize * 0.3}
                r={planetSize * 0.3}
                fill="#ffffff"
                opacity={0.4}
              />
              {/* Planet label */}
              {showLabels && (() => {
                // Determine label color based on route start/destination
                const normalizedId = planet.id.toLowerCase();
                const startId = route?.start.label?.toLowerCase().replace(/\s+/g, '-');
                const destId = route?.destination.label?.toLowerCase().replace(/\s+/g, '-');

                let labelColor = '#ffffff'; // Default white
                if (startId && normalizedId === startId) {
                  labelColor = '#00ff88'; // Green for start
                } else if (destId && normalizedId === destId) {
                  labelColor = '#ffa500'; // Gold for destination
                }

                // Position label above if planet is in lower half, below if in upper half
                const isInLowerHalf = y > center;
                const labelY = isInLowerHalf ? y - planetSize - 8 : y + planetSize + 12;

                return (
                  <text
                    x={x}
                    y={labelY}
                    fill={labelColor}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline={isInLowerHalf ? 'auto' : 'hanging'}
                    className="map-label"
                  >
                    {planet.shortName.toUpperCase()}
                  </text>
                );
              })()}
            </g>
          );
        })}

        {/* Station markers (smaller dots) */}
        {zoomLevel === 'system' && stations.slice(0, 12).map(station => {
          const x = center + station.radius * Math.cos(station.angle);
          const y = center + station.radius * Math.sin(station.angle);

          return (
            <circle
              key={station.id}
              cx={x}
              cy={y}
              r={3}
              fill={station.hasRefinery ? '#00d9ff' : '#4a7a7a'}
              opacity={0.9}
            />
          );
        })}

        {/* Route visualization */}
        {routeElements && (
          <g className="route-layer">
            {/* System view: show route line with start/destination markers */}
            {zoomLevel === 'system' && (
              <>
                {/* Route path - orange directional line like SC */}
                <line
                  x1={routeElements.startX}
                  y1={routeElements.startY}
                  x2={routeElements.destX}
                  y2={routeElements.destY}
                  stroke="#ff8c00"
                  strokeWidth="2"
                  markerEnd="url(#arrowHead)"
                />

                {/* Arrow head marker */}
                <defs>
                  <marker
                    id="arrowHead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#ff8c00" />
                  </marker>
                </defs>

                {/* Start point - green with glow */}
                {(() => {
                  // Check if start is a planet (planets have colored labels already)
                  const startId = route?.start.label?.toLowerCase().replace(/\s+/g, '-') || '';
                  const isPlanet = ['hurston', 'crusader', 'arccorp', 'microtech'].includes(startId);
                  // Get label position - stations near planets go on opposite side
                  const labelOffset = getStationLabelPosition(routeElements.startX, routeElements.startY);
                  return (
                    <>
                      <circle
                        cx={routeElements.startX}
                        cy={routeElements.startY}
                        r="8"
                        fill="#00ff88"
                        opacity={0.3}
                      />
                      <circle
                        cx={routeElements.startX}
                        cy={routeElements.startY}
                        r="5"
                        fill="#00ff88"
                      />
                      {showLabels && !isPlanet && (
                        <text
                          x={routeElements.startX + labelOffset.xOffset}
                          y={routeElements.startY + labelOffset.yOffset}
                          fill="#00ff88"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="map-label"
                        >
                          {routeElements.startLabel}
                        </text>
                      )}
                    </>
                  );
                })()}

                {/* Destination point - orange with glow */}
                {(() => {
                  // Check if destination is a planet (planets have colored labels already)
                  const destId = route?.destination.label?.toLowerCase().replace(/\s+/g, '-') || '';
                  const isPlanet = ['hurston', 'crusader', 'arccorp', 'microtech'].includes(destId);
                  // Get label position - stations near planets go on opposite side
                  const labelOffset = getStationLabelPosition(routeElements.destX, routeElements.destY);
                  return (
                    <>
                      <circle
                        cx={routeElements.destX}
                        cy={routeElements.destY}
                        r="8"
                        fill="#ffa500"
                        opacity={0.3}
                      />
                      <circle
                        cx={routeElements.destX}
                        cy={routeElements.destY}
                        r="5"
                        fill="#ffa500"
                      />
                      {showLabels && !isPlanet && (
                        <text
                          x={routeElements.destX + labelOffset.xOffset}
                          y={routeElements.destY + labelOffset.yOffset}
                          fill="#ffa500"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="map-label"
                        >
                          {routeElements.destLabel}
                        </text>
                      )}
                    </>
                  );
                })()}

                {/* Exit point marker - red target (system view) */}
                {routeElements.exitPoint && (
                  <g>
                    <circle
                      cx={routeElements.exitPoint.x}
                      cy={routeElements.exitPoint.y}
                      r="10"
                      fill="#ff3366"
                      opacity={0.2}
                    />
                    <circle
                      cx={routeElements.exitPoint.x}
                      cy={routeElements.exitPoint.y}
                      r="6"
                      fill="none"
                      stroke="#ff3366"
                      strokeWidth="2"
                    />
                    <circle
                      cx={routeElements.exitPoint.x}
                      cy={routeElements.exitPoint.y}
                      r="2"
                      fill="#ff3366"
                    />
                    {showLabels && (
                      <text
                        x={routeElements.exitPoint.x}
                        y={routeElements.exitPoint.y + 18}
                        fill="#ff3366"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="map-label"
                      >
                        EXIT HERE
                      </text>
                    )}
                  </g>
                )}
              </>
            )}

            {/* Halo view: show X marks the spot with only the closest reference */}
            {zoomLevel === 'halo' && (
              <g>
                {/* Show the closest reference point at its actual radial position */}
                {routeElements.exitPointHalo && route && (() => {
                  const isStart = routeElements.closestRef === 'start';
                  const refLabel = isStart ? routeElements.startLabel : routeElements.destLabel;
                  const refColor = isStart ? '#00ff88' : '#ffa500';

                  // Get the reference location's actual coordinates
                  const refLocId = isStart
                    ? route.start.label?.toLowerCase().replace(/\s+/g, '-') || ''
                    : route.destination.label?.toLowerCase().replace(/\s+/g, '-') || '';
                  const refCoords = LOCATION_COORDINATES[refLocId];

                  // Get the actual distance from Stanton for the reference point
                  const refDistFromStanton = isStart
                    ? route.start.distanceFromStanton
                    : route.destination.distanceFromStanton;

                  // Calculate the SVG radius of the band edges
                  const haloRange = ZOOM_LEVELS.halo.maxRadius - ZOOM_LEVELS.halo.minRadius;
                  const innerBandNorm = (HALO_INNER_EDGE - ZOOM_LEVELS.halo.minRadius) / haloRange;
                  const outerBandNorm = (HALO_OUTER_EDGE - ZOOM_LEVELS.halo.minRadius) / haloRange;
                  const minSvgR = maxSvgRadius * 0.3;
                  const maxSvgR = maxSvgRadius * 0.95;
                  const innerBandRadius = minSvgR + innerBandNorm * (maxSvgR - minSvgR);
                  const outerBandRadius = minSvgR + outerBandNorm * (maxSvgR - minSvgR);

                  // Use the reference's actual theta angle for positioning
                  // If we have coordinates, use them; otherwise fall back to exit point direction
                  let refAngleRad: number;
                  if (refCoords) {
                    refAngleRad = -refCoords.theta * (Math.PI / 180); // Negate for SVG
                  } else {
                    // Fall back to direction from center to exit point
                    const exitX = routeElements.exitPointHalo.x;
                    const exitY = routeElements.exitPointHalo.y;
                    refAngleRad = Math.atan2(exitY - center, exitX - center);
                  }

                  // If reference is closer to Stanton than halo, place inside bands; otherwise outside
                  const isInsideHalo = refDistFromStanton < HALO_CENTER_DISTANCE;
                  const refDist = isInsideHalo
                    ? innerBandRadius - 25  // Just inside the inner band edge
                    : outerBandRadius + 25; // Just outside the outer band edge

                  const refX = center + refDist * Math.cos(refAngleRad);
                  const refY = center + refDist * Math.sin(refAngleRad);

                  // Position label on left or right based on reference point position
                  const isOnRight = refX > center;

                  return (
                    <>
                      <circle cx={refX} cy={refY} r="6" fill={refColor} opacity={0.3} />
                      <circle cx={refX} cy={refY} r="4" fill={refColor} />
                      {showLabels && (
                        <text
                          x={isOnRight ? refX + 10 : refX - 10}
                          y={refY + 3}
                          fill={refColor}
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor={isOnRight ? 'start' : 'end'}
                          className="map-label"
                        >
                          {refLabel}
                        </text>
                      )}
                    </>
                  );
                })()}

                {/* X marks the spot */}
                {routeElements.exitPointHalo && (
                  <>
                    <circle
                      cx={routeElements.exitPointHalo.x}
                      cy={routeElements.exitPointHalo.y}
                      r="18"
                      fill="#ff3366"
                      opacity={0.2}
                    />
                    {/* X shape */}
                    <line
                      x1={routeElements.exitPointHalo.x - 12}
                      y1={routeElements.exitPointHalo.y - 12}
                      x2={routeElements.exitPointHalo.x + 12}
                      y2={routeElements.exitPointHalo.y + 12}
                      stroke="#ff3366"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <line
                      x1={routeElements.exitPointHalo.x + 12}
                      y1={routeElements.exitPointHalo.y - 12}
                      x2={routeElements.exitPointHalo.x - 12}
                      y2={routeElements.exitPointHalo.y + 12}
                      stroke="#ff3366"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    {/* Label - position above if in lower half, below if in upper half */}
                    {showLabels && (
                      <text
                        x={routeElements.exitPointHalo.x}
                        y={routeElements.exitPointHalo.y > center
                          ? routeElements.exitPointHalo.y - 24
                          : routeElements.exitPointHalo.y + 28}
                        fill="#ff3366"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="map-label"
                      >
                        YOU ARE HERE
                      </text>
                    )}
                  </>
                )}
              </g>
            )}
          </g>
        )}

        {/* Position marker (user location) - red X marker (same style as route exit point) */}
        {positionMarker && (
          <g className="position-marker">
            {/* Outer glow */}
            <circle
              cx={positionMarker.x}
              cy={positionMarker.y}
              r="18"
              fill="#ff3366"
              opacity={0.2}
            />
            {/* X shape */}
            <line
              x1={positionMarker.x - 12}
              y1={positionMarker.y - 12}
              x2={positionMarker.x + 12}
              y2={positionMarker.y + 12}
              stroke="#ff3366"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <line
              x1={positionMarker.x + 12}
              y1={positionMarker.y - 12}
              x2={positionMarker.x - 12}
              y2={positionMarker.y + 12}
              stroke="#ff3366"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Label - position above if in lower half, below if in upper half */}
            {showLabels && (
              <text
                x={positionMarker.x}
                y={positionMarker.y > center
                  ? positionMarker.y - 24
                  : positionMarker.y + 28}
                fill="#ff3366"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                className="map-label"
              >
                {positionMarker.label.toUpperCase()}
              </text>
            )}
          </g>
        )}

        </g>
        {/* End of zoomable content */}

        {/* Legend - SC style (fixed position, not affected by zoom/pan) */}
        {showLegend && route && (
          <g className="map-legend" transform={`translate(10, ${size - 55})`}>
            <rect x="0" y="0" width="110" height="50" fill="#0a1a1a" fillOpacity="0.9" rx="4" stroke="#1a4a4a" strokeWidth="1" />
            <circle cx="14" cy="16" r="5" fill="#00ff88" />
            <text x="28" y="20" fill="#ffffff" fontSize="11">Start</text>
            <circle cx="14" cy="36" r="5" fill="#ffa500" />
            <text x="28" y="40" fill="#ffffff" fontSize="11">Destination</text>
          </g>
        )}
      </svg>
    </div>
  );
}

// Helper: Get angle for any location using verified polar coordinates
// Note: Negate theta for SVG coordinate system (Y points down in SVG)
function getAngleForLocation(locationId: string): number {
  const coords = LOCATION_COORDINATES[locationId];
  if (coords) {
    // Negate for SVG coordinate system where Y points down
    return -coords.theta * (Math.PI / 180);
  }
  return 0;
}

// Helper: Get consistent angle for planet placement
function getPlanetAngle(planetId: string): number {
  return getAngleForLocation(planetId);
}

// Helper: Get angle for station placement using verified coordinates
function getStationAngle(stationId: string, _orbitalBody?: string): number {
  return getAngleForLocation(stationId);
}

// Helper: Get angle for any location based on its label/name
function getLocationAngle(label: string): number {
  // Convert label to location ID format (e.g., "ARC-L1" -> "arc-l1")
  const locationId = label.toLowerCase().replace(/\s+/g, '-');

  // Try exact match first
  if (LOCATION_COORDINATES[locationId]) {
    return getAngleForLocation(locationId);
  }

  // Try common variations
  const variations = [
    locationId,
    locationId.replace(/-/g, ''),  // "arcl1"
    locationId.replace('l', '-l'), // ensure "arc-l1" format
  ];

  for (const variant of variations) {
    if (LOCATION_COORDINATES[variant]) {
      return getAngleForLocation(variant);
    }
  }

  // Default
  return 0;
}

export default StantonSystemMap;
