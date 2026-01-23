// Solar system icon SVG for map buttons
// Shared component used by RoutePlanner and WhereAmI

export function SolarSystemIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Orbits - concentric rings */}
      <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="16" cy="16" r="10.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      {/* Sun (center) */}
      <circle cx="16" cy="16" r="3" fill="currentColor" />
      {/* Planets on orbits */}
      <circle cx="22" cy="16" r="1.8" fill="currentColor" />
      <circle cx="8" cy="23" r="2" fill="currentColor" />
      <circle cx="16" cy="1.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export default SolarSystemIcon;
