import { StantonLocation } from "../types/locations";

interface RouteSummaryProps {
  startLocation: StantonLocation;
  destLocation: StantonLocation;
  canReverse: boolean;
  onReverse: () => void;
  onClearRoute: () => void;
}

export function RouteSummary({
  startLocation,
  destLocation,
  canReverse,
  onReverse,
  onClearRoute,
}: RouteSummaryProps) {
  return (
    <div className="route-summary">
      <span className="route-label">Route:</span>
      <span className="route-path">
        {startLocation.shortName} → {destLocation.shortName}
      </span>
      {canReverse && (
        <button
          className="reverse-route-btn"
          onClick={onReverse}
          title="Reverse course"
          aria-label="Reverse course">
          ⇄
        </button>
      )}
      <button
        className="clear-route-btn"
        onClick={onClearRoute}
        title="Clear route"
        aria-label="Clear route">
        ✖
      </button>
    </div>
  );
}
