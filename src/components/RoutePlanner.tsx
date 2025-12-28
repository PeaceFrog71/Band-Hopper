import { useState, useMemo } from 'react';
import { getLocationById } from '../types/locations';
import { BANDS } from '../types/bands';
import {
  getAvailableStartLocations,
  getAvailableDestinations,
  getRouteWithBandInfo,
  getDestinationsByBandWidth
} from '../types/routes';
import { formatDistance } from '../utils/calculator';
import './RoutePlanner.css';

type PlannerMode = 'destination' | 'band';
type BandSortBy = 'number' | 'density';

export function RoutePlanner() {
  const [mode, setMode] = useState<PlannerMode>('destination');
  const [startId, setStartId] = useState<string>('');
  const [destinationId, setDestinationId] = useState<string>('');
  const [selectedBandId, setSelectedBandId] = useState<number | null>(null);
  const [bandSortBy, setBandSortBy] = useState<BandSortBy>('density');

  // Get available start locations
  const availableStarts = useMemo(() => {
    const startIds = getAvailableStartLocations();
    return startIds
      .map(id => getLocationById(id))
      .filter((loc): loc is NonNullable<typeof loc> => loc !== null)
      .sort((a, b) => a.shortName.localeCompare(b.shortName));
  }, []);

  // Get available destinations based on selected start (for destination mode)
  const availableDestinations = useMemo(() => {
    if (!startId) return [];
    const destIds = getAvailableDestinations(startId);
    return destIds
      .map(id => getLocationById(id))
      .filter((loc): loc is NonNullable<typeof loc> => loc !== null)
      .sort((a, b) => a.shortName.localeCompare(b.shortName));
  }, [startId]);

  // Get route data (for destination mode)
  const routeData = useMemo(() => {
    if (!startId || !destinationId) return null;
    return getRouteWithBandInfo(startId, destinationId);
  }, [startId, destinationId]);

  // Get destinations sorted by band width (for band mode)
  const destinationsByWidth = useMemo(() => {
    if (!startId || selectedBandId === null) return [];
    return getDestinationsByBandWidth(startId, selectedBandId).map(d => ({
      ...d,
      location: getLocationById(d.destinationId)
    }));
  }, [startId, selectedBandId]);

  // Get sorted bands for selector
  const sortedBands = useMemo(() => {
    if (bandSortBy === 'density') {
      return [...BANDS].sort((a, b) => b.relativeDensity - a.relativeDensity);
    }
    return BANDS;
  }, [bandSortBy]);

  // Handle start change
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

  // Handle mode change
  const handleModeChange = (newMode: PlannerMode) => {
    setMode(newMode);
    // Reset selections when switching modes
    setDestinationId('');
    setSelectedBandId(null);
  };

  // Handle band mode destination selection
  const handleBandDestinationSelect = (destId: string) => {
    setDestinationId(destId);
  };

  const startLocation = startId ? getLocationById(startId) : null;
  const destLocation = destinationId ? getLocationById(destinationId) : null;
  const selectedBand = selectedBandId !== null ? BANDS.find(b => b.id === selectedBandId) : null;

  // Get the selected destination's data in band mode
  const selectedBandDestData = useMemo(() => {
    if (!destinationId || selectedBandId === null) return null;
    return destinationsByWidth.find(d => d.destinationId === destinationId) || null;
  }, [destinationId, selectedBandId, destinationsByWidth]);

  return (
    <div className="route-planner">
      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'destination' ? 'active' : ''}`}
          onClick={() => handleModeChange('destination')}
        >
          By Destination
        </button>
        <button
          className={`mode-btn ${mode === 'band' ? 'active' : ''}`}
          onClick={() => handleModeChange('band')}
        >
          By Band
        </button>
      </div>

      {/* Start Location (both modes) */}
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

        {/* Destination dropdown (destination mode only) */}
        {mode === 'destination' && (
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
        )}
      </div>

      {/* ===== DESTINATION MODE ===== */}
      {mode === 'destination' && routeData && startLocation && destLocation && (
        <div className="route-results">
          <div className="route-summary">
            <span className="route-label">Route:</span>
            <span className="route-path">
              {startLocation.shortName} → {destLocation.shortName}
            </span>
          </div>

          <div className="band-table">
            <div className="band-header">
              <span className="band-col-name">Band</span>
              <span className="band-col-dest">Exit at Distance</span>
              <span className="band-col-density">Density</span>
            </div>
            {routeData.bandDetails.map(({ band, exit }) => (
              <div key={band.id} className={`band-row density-${getDensityClass(band.relativeDensity)}`}>
                <span className="band-col-name">{band.name}</span>
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
              <li>Watch the remaining distance to your destination</li>
              <li>Exit QT when it matches your target band's exit distance</li>
            </ol>
          </div>
        </div>
      )}

      {/* ===== BAND MODE ===== */}
      {mode === 'band' && startId && (
        <div className="band-mode-content">
          {/* Band Selector */}
          <div className="band-selector-section">
            <div className="band-selector-header">
              <label>Select Target Band</label>
              <div className="band-sort-toggle">
                <button
                  className={`sort-btn ${bandSortBy === 'density' ? 'active' : ''}`}
                  onClick={() => setBandSortBy('density')}
                >
                  By Density
                </button>
                <button
                  className={`sort-btn ${bandSortBy === 'number' ? 'active' : ''}`}
                  onClick={() => setBandSortBy('number')}
                >
                  By Number
                </button>
              </div>
            </div>

            <div className="band-selector-grid">
              {sortedBands.map(band => (
                <button
                  key={band.id}
                  className={`band-select-btn ${selectedBandId === band.id ? 'selected' : ''} density-${getDensityClass(band.relativeDensity)}`}
                  onClick={() => {
                    setSelectedBandId(band.id);
                    setDestinationId(''); // Reset destination when band changes
                  }}
                >
                  <span className="band-select-name">{band.name}</span>
                  <span className="band-select-density">{Math.round(band.relativeDensity * 100)}%</span>
                </button>
              ))}
            </div>
          </div>

          {/* Destination List (sorted by width) */}
          {selectedBandId !== null && selectedBand && (
            <div className="destination-list-section">
              <div className="destination-list-header">
                <label>Destinations for {selectedBand.name}</label>
                <span className="width-hint">Sorted by exit margin (easiest first)</span>
              </div>

              {destinationsByWidth.length > 0 ? (
                <div className="destination-list">
                  {destinationsByWidth.map(dest => (
                    <button
                      key={dest.destinationId}
                      className={`destination-card ${destinationId === dest.destinationId ? 'selected' : ''}`}
                      onClick={() => handleBandDestinationSelect(dest.destinationId)}
                    >
                      <span className="dest-name">
                        {dest.location?.shortName || dest.destinationId}
                      </span>
                      <span className={`dest-width ${getWidthClass(dest.exitWidth)}`}>
                        {formatDistanceCompact(dest.exitWidth)} margin
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="no-destinations">
                  No destinations available from this start location.
                </div>
              )}
            </div>
          )}

          {/* Result Display */}
          {selectedBandDestData && destLocation && selectedBand && startLocation && (
            <div className="band-result">
              <div className="route-summary">
                <span className="route-label">Route:</span>
                <span className="route-path">
                  {startLocation.shortName} → {destLocation.shortName}
                </span>
              </div>

              <div className="exit-result">
                <div className="exit-result-main">
                  <span className="exit-label">Exit at {selectedBand.name}</span>
                  <span className="exit-distance">{formatDistance(selectedBandDestData.exitDistance)}</span>
                </div>
                <div className={`exit-margin ${getWidthClass(selectedBandDestData.exitWidth)}`}>
                  {formatDistanceCompact(selectedBandDestData.exitWidth)} margin for error
                </div>
              </div>

              <div className="route-instructions">
                <p className="instruction-title">How to use:</p>
                <ol>
                  <li>Start quantum travel toward <strong>{destLocation.shortName}</strong></li>
                  <li>Watch the remaining distance to your destination</li>
                  <li>Exit QT at <strong>{formatDistance(selectedBandDestData.exitDistance)}</strong></li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty States */}
      {mode === 'destination' && !routeData && startId && destinationId && (
        <div className="no-route">
          No route data available for this combination.
        </div>
      )}

      {!startId && (
        <div className="placeholder-message">
          {mode === 'destination'
            ? 'Select a start and destination to see exit distances for each Aaron Halo band.'
            : 'Select a start location and target band to see the best destinations.'}
        </div>
      )}

      {mode === 'band' && startId && !selectedBandId && (
        <div className="placeholder-message">
          Select a target band to see destinations sorted by easiest exit.
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

function getWidthClass(width: number): string {
  if (width >= 300_000) return 'wide';
  if (width >= 200_000) return 'normal';
  if (width >= 150_000) return 'narrow';
  return 'very-narrow';
}

function formatDistanceCompact(distanceKm: number): string {
  const thousands = distanceKm / 1_000;
  return `${Math.round(thousands)}K km`;
}
