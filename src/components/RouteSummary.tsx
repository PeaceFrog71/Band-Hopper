import { StantonLocation } from '../types/locations';

interface RouteSummaryProps {
  startLocation: StantonLocation;
  destLocation: StantonLocation;
  canSwap: boolean;
  onSwap: () => void;
}

export function RouteSummary({
  startLocation,
  destLocation,
  canSwap,
  onSwap
}: RouteSummaryProps) {
  return (
    <div className="route-summary">
      <span className="route-label">Route:</span>
      <span className="route-path">
        {startLocation.shortName} → {destLocation.shortName}
      </span>
      {canSwap && (
        <button
          className="swap-route-btn"
          onClick={onSwap}
          title="Reverse course"
          aria-label="Reverse course"
        >
          ⇄
        </button>
      )}
    </div>
  );
}
