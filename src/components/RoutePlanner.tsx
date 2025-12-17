import { useState, useMemo } from 'react';
import { getLocationById } from '../types/locations';
import { getAvailableStartLocations, getAvailableDestinations, getRouteWithBandInfo } from '../types/routes';
import { formatDistance } from '../utils/calculator';
import './RoutePlanner.css';

export function RoutePlanner() {
  const [startId, setStartId] = useState<string>('');
  const [destinationId, setDestinationId] = useState<string>('');

  // Get available start locations
  const availableStarts = useMemo(() => {
    const startIds = getAvailableStartLocations();
    return startIds
      .map(id => getLocationById(id))
      .filter((loc): loc is NonNullable<typeof loc> => loc !== null)
      .sort((a, b) => a.shortName.localeCompare(b.shortName));
  }, []);

  // Get available destinations based on selected start
  const availableDestinations = useMemo(() => {
    if (!startId) return [];
    const destIds = getAvailableDestinations(startId);
    return destIds
      .map(id => getLocationById(id))
      .filter((loc): loc is NonNullable<typeof loc> => loc !== null)
      .sort((a, b) => a.shortName.localeCompare(b.shortName));
  }, [startId]);

  // Get route data
  const routeData = useMemo(() => {
    if (!startId || !destinationId) return null;
    return getRouteWithBandInfo(startId, destinationId);
  }, [startId, destinationId]);

  // Handle start change - reset destination if not valid
  const handleStartChange = (newStartId: string) => {
    setStartId(newStartId);
    if (newStartId) {
      const validDests = getAvailableDestinations(newStartId);
      if (!validDests.includes(destinationId)) {
        setDestinationId('');
      }
    } else {
      setDestinationId('');
    }
  };

  const startLocation = startId ? getLocationById(startId) : null;
  const destLocation = destinationId ? getLocationById(destinationId) : null;

  return (
    <div className="route-planner">
      <div className="route-selectors">
        <div className="form-group">
          <label>Start Location</label>
          <select
            value={startId}
            onChange={(e) => handleStartChange(e.target.value)}
          >
            <option value="">Select start...</option>
            {availableStarts.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.shortName} - {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Destination</label>
          <select
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            disabled={!startId}
          >
            <option value="">Select destination...</option>
            {availableDestinations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.shortName} - {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {routeData && startLocation && destLocation && (
        <div className="route-results">
          <div className="route-summary">
            <span className="route-label">Route:</span>
            <span className="route-path">
              {startLocation.shortName} → {destLocation.shortName}
            </span>
            <span className="route-distance">
              {formatDistance(routeData.route.totalDistance)}
            </span>
          </div>

          <div className="band-table">
            <div className="band-header">
              <span className="band-col-name">Band</span>
              <span className="band-col-stanton">Stanton Marker</span>
              <span className="band-col-dest">To Destination</span>
              <span className="band-col-density">Density</span>
            </div>
            {routeData.bandDetails.map(({ band, exit }) => (
              <div key={band.id} className={`band-row density-${getDensityClass(band.relativeDensity)}`}>
                <span className="band-col-name">{band.name}</span>
                <span className="band-col-stanton">{formatDistance(exit.distanceFromStanton)}</span>
                <span className="band-col-dest">{formatDistance(exit.distanceToDestination)}</span>
                <span className="band-col-density">
                  <span className="density-bar" style={{ width: `${band.relativeDensity * 100}%` }} />
                </span>
              </div>
            ))}
          </div>

          <div className="route-instructions">
            <p className="instruction-title">How to use:</p>
            <ol>
              <li>Start quantum travel toward <strong>{destLocation.shortName}</strong></li>
              <li>Open MobiGlas and select the <strong>Stanton</strong> marker</li>
              <li>Watch the distance to Stanton marker</li>
              <li>Exit QT when it matches your target band distance</li>
            </ol>
          </div>
        </div>
      )}

      {!routeData && startId && destinationId && (
        <div className="no-route">
          No route data available for this combination.
        </div>
      )}

      {!startId && (
        <div className="placeholder-message">
          Select a start and destination to see exit distances for each Aaron Halo band.
        </div>
      )}
    </div>
  );
}

function getDensityClass(density: number): string {
  if (density >= 0.9) return 'high';
  if (density >= 0.7) return 'medium';
  return 'low';
}
