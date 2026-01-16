import { useState, useMemo, Fragment } from 'react';
import { getLocationById, getGroupedLocationsForDropdown } from '../types/locations';
import { BANDS } from '../types/bands';
import {
  getAvailableStartLocations,
  getAvailableDestinations,
  getRouteWithBandInfo,
  getDestinationsByBandWidth,
  calculateExitWidths
} from '../types/routes';
import { formatDistance } from '../utils/calculator';
import './RoutePlanner.css';

type PlannerMode = 'destination' | 'band';
type BandSortBy = 'number' | 'density';

interface RoutePlannerProps {
  startId: string;
  destinationId: string;
  onStartChange: (id: string) => void;
  onDestinationChange: (id: string) => void;
  onSwapRoute: () => void;
}

export function RoutePlanner({
  startId,
  destinationId,
  onStartChange,
  onDestinationChange,
  onSwapRoute
}: RoutePlannerProps) {
  const [mode, setMode] = useState<PlannerMode>('band');
  const [selectedBandId, setSelectedBandId] = useState<number | null>(null);
  const [bandSortBy, setBandSortBy] = useState<BandSortBy>('density');
  const [destModeSortBy, setDestModeSortBy] = useState<BandSortBy>('density');
  const [selectedDestBandId, setSelectedDestBandId] = useState<number | null>(null);
  const [destTableCollapsed, setDestTableCollapsed] = useState(false);
  const [bandModeCollapsed, setBandModeCollapsed] = useState(false);
  const [bandSelectorCollapsed, setBandSelectorCollapsed] = useState(false);

  // Get available start locations grouped by planet
  const groupedStarts = useMemo(() => {
    const startIds = getAvailableStartLocations();
    return getGroupedLocationsForDropdown(startIds);
  }, []);

  // Get available destinations grouped by planet (for destination mode)
  const groupedDestinations = useMemo(() => {
    if (!startId) return [];
    const destIds = getAvailableDestinations(startId);
    return getGroupedLocationsForDropdown(destIds);
  }, [startId]);

  // Get route data (for destination mode)
  const routeData = useMemo(() => {
    if (!startId || !destinationId) return null;
    return getRouteWithBandInfo(startId, destinationId);
  }, [startId, destinationId]);

  // Sort band details for destination mode (with exit widths)
  const sortedBandDetails = useMemo(() => {
    if (!routeData) return [];
    const withWidths = calculateExitWidths(routeData.route.bandExits);
    const details = routeData.bandDetails.map(({ band, exit }) => {
      const widthData = withWidths.find(w => w.bandId === band.id);
      return { band, exit, exitWidth: widthData?.exitWidth ?? 0 };
    });
    if (destModeSortBy === 'density') {
      return details.sort((a, b) => b.band.relativeDensity - a.band.relativeDensity);
    }
    return details.sort((a, b) => a.band.id - b.band.id);
  }, [routeData, destModeSortBy]);

  // Get selected band data for destination mode result display
  const selectedDestBandData = useMemo(() => {
    if (selectedDestBandId === null || !routeData) return null;
    return sortedBandDetails.find(d => d.band.id === selectedDestBandId) || null;
  }, [selectedDestBandId, routeData, sortedBandDetails]);

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

  // Check if route can be swapped (reverse route exists)
  const canSwap = useMemo(() => {
    if (!startId || !destinationId) return false;
    const availableStarts = getAvailableStartLocations();
    if (!availableStarts.includes(destinationId)) return false;
    const validDests = getAvailableDestinations(destinationId);
    return validDests.includes(startId);
  }, [startId, destinationId]);

  // Handle swap route - preserve band selection
  const handleSwap = () => {
    if (!canSwap) return;
    onSwapRoute();
  };

  // Handle start change
  const handleStartChange = (newStartId: string) => {
    onStartChange(newStartId);
    setSelectedDestBandId(null);
    setDestTableCollapsed(false);
    setBandModeCollapsed(false);
    setBandSelectorCollapsed(false);
    if (newStartId) {
      const validDests = getAvailableDestinations(newStartId);
      if (!validDests.includes(destinationId)) {
        onDestinationChange('');
      }
    } else {
      onDestinationChange('');
    }
  };

  // Handle destination change in destination mode
  const handleDestinationChange = (newDestId: string) => {
    onDestinationChange(newDestId);
    setSelectedDestBandId(null);
    setDestTableCollapsed(false);
  };

  // Handle band row click in destination mode
  const handleDestBandClick = (bandId: number) => {
    if (selectedDestBandId === bandId && destTableCollapsed) {
      // Clicking the same band again expands the table
      setDestTableCollapsed(false);
    } else {
      setSelectedDestBandId(bandId);
      setDestTableCollapsed(true);
    }
  };

  // Handle mode change
  const handleModeChange = (newMode: PlannerMode) => {
    setMode(newMode);
    // Reset selections when switching modes
    onDestinationChange('');
    setSelectedBandId(null);
    setSelectedDestBandId(null);
    setDestTableCollapsed(false);
    setBandModeCollapsed(false);
    setBandSelectorCollapsed(false);
  };

  // Handle band selection in band mode
  const handleBandSelect = (bandId: number) => {
    if (selectedBandId === bandId && bandSelectorCollapsed) {
      // Clicking the same band again expands the selector
      setBandSelectorCollapsed(false);
    } else {
      setSelectedBandId(bandId);
      onDestinationChange('');
      setBandSelectorCollapsed(true);
    }
  };

  // Handle band mode destination selection
  const handleBandDestinationSelect = (destId: string) => {
    if (destinationId === destId && bandModeCollapsed) {
      // Clicking the same destination again expands
      setBandModeCollapsed(false);
    } else {
      onDestinationChange(destId);
      setBandModeCollapsed(true);
    }
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
          className={`mode-btn ${mode === 'band' ? 'active' : ''}`}
          onClick={() => handleModeChange('band')}
        >
          By Band
        </button>
        <button
          className={`mode-btn ${mode === 'destination' ? 'active' : ''}`}
          onClick={() => handleModeChange('destination')}
        >
          By Destination
        </button>
      </div>

      {/* Start Location (both modes) - hidden when collapsed */}
      {!((mode === 'destination' && destTableCollapsed) || (mode === 'band' && bandModeCollapsed)) && (
        <div className="route-selectors">
          <div className="form-group">
            <label>Start Location</label>
            <select
              value={startId}
              onChange={(e) => handleStartChange(e.target.value)}
            >
              <option value="">Select start...</option>
              {groupedStarts.map(group => (
                <Fragment key={group.planet}>
                  {group.locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.type === 'planet' ? loc.shortName : `└ ${loc.shortName}`}
                    </option>
                  ))}
                </Fragment>
              ))}
            </select>
          </div>

          {/* Destination dropdown (destination mode only) */}
          {mode === 'destination' && (
            <div className="form-group">
              <label>Destination</label>
              <select
                value={destinationId}
                onChange={(e) => handleDestinationChange(e.target.value)}
                disabled={!startId}
              >
                <option value="">Select destination...</option>
                {groupedDestinations.map(group => (
                  <Fragment key={group.planet}>
                    {group.locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.type === 'planet' ? loc.shortName : `└ ${loc.shortName}`}
                      </option>
                    ))}
                  </Fragment>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* ===== DESTINATION MODE ===== */}
      {mode === 'destination' && routeData && startLocation && destLocation && (
        <div className="route-results">
          {/* Result Card at Top (when band selected) */}
          {selectedDestBandData && (
            <div className="dest-result-section">
              <div className="route-summary">
                <span className="route-label">Route:</span>
                <span className="route-path">
                  {startLocation.shortName} → {destLocation.shortName}
                </span>
                {canSwap && (
                  <button
                    className="swap-route-btn"
                    onClick={handleSwap}
                    title="Reverse course"
                    aria-label="Reverse course"
                  >
                    ⇄
                  </button>
                )}
              </div>

              <div
                className="exit-result clickable"
                onClick={() => setDestTableCollapsed(!destTableCollapsed)}
                title={destTableCollapsed ? 'Click to show all bands' : 'Click to collapse'}
              >
                <div className="exit-result-main">
                  <span className="exit-label">Exit at {selectedDestBandData.band.name}</span>
                  <span className="exit-distance">{formatDistance(selectedDestBandData.exit.distanceToDestination)}</span>
                </div>
                <div className={`exit-margin ${getWidthClass(selectedDestBandData.exitWidth)}`}>
                  {formatDistanceCompact(selectedDestBandData.exitWidth)} margin for error
                </div>
                <div className="collapse-hint">
                  {destTableCollapsed ? 'Tap to change band' : 'Tap to collapse'}
                </div>
              </div>

              <div className="route-instructions">
                <p className="instruction-title">How to use:</p>
                <ol>
                  <li>Start quantum travel toward <strong>{destLocation.shortName}</strong></li>
                  <li>Watch the remaining distance to your destination</li>
                  <li>Exit QT at <strong>{formatDistance(selectedDestBandData.exit.distanceToDestination)}</strong></li>
                </ol>
              </div>
            </div>
          )}

          {/* Band Table (collapsible) */}
          {!destTableCollapsed && (
            <div className="band-table">
              <div className="band-controls">
                <div className="sort-toggle">
                  <span className="sort-label">Sort:</span>
                  <button
                    className={`sort-btn ${destModeSortBy === 'density' ? 'active' : ''}`}
                    onClick={() => setDestModeSortBy('density')}
                  >
                    Density
                  </button>
                  <button
                    className={`sort-btn ${destModeSortBy === 'number' ? 'active' : ''}`}
                    onClick={() => setDestModeSortBy('number')}
                  >
                    Band #
                  </button>
                </div>
              </div>
              <div className="band-header">
                <span className="band-col-name">Band</span>
                <span className="band-col-dest">Exit at Distance</span>
                <span className="band-col-density">Density</span>
              </div>
              {sortedBandDetails.map(({ band, exit }) => (
                <div
                  key={band.id}
                  className={`band-row clickable density-${getDensityClass(band.relativeDensity)} ${selectedDestBandId === band.id ? 'selected' : ''}`}
                  onClick={() => handleDestBandClick(band.id)}
                >
                  <span className="band-col-name">{band.name}</span>
                  <span className="band-col-dest">{formatDistance(exit.distanceToDestination)}</span>
                  <span className="band-col-density">
                    <span className="density-bar" style={{ width: `${band.relativeDensity * 100}%` }} />
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Instructions when no band selected */}
          {!selectedDestBandData && (
            <div className="route-instructions">
              <p className="instruction-title">How to use:</p>
              <ol>
                <li>Click a band above to select your target</li>
                <li>Start quantum travel toward <strong>{destLocation.shortName}</strong></li>
                <li>Exit QT when it matches your target band's exit distance</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* ===== BAND MODE ===== */}
      {mode === 'band' && startId && (
        <div className="band-mode-content">
          {/* Result Display (at top when collapsed) */}
          {selectedBandDestData && destLocation && selectedBand && startLocation && (
            <div className="band-result">
              <div className="route-summary">
                <span className="route-label">Route:</span>
                <span className="route-path">
                  {startLocation.shortName} → {destLocation.shortName}
                </span>
                {canSwap && (
                  <button
                    className="swap-route-btn"
                    onClick={handleSwap}
                    title="Reverse course"
                    aria-label="Reverse course"
                  >
                    ⇄
                  </button>
                )}
              </div>

              <div
                className="exit-result clickable"
                onClick={() => setBandModeCollapsed(!bandModeCollapsed)}
                title={bandModeCollapsed ? 'Click to show options' : 'Click to collapse'}
              >
                <div className="exit-result-main">
                  <span className="exit-label">Exit at {selectedBand.name}</span>
                  <span className="exit-distance">{formatDistance(selectedBandDestData.exitDistance)}</span>
                </div>
                <div className={`exit-margin ${getWidthClass(selectedBandDestData.exitWidth)}`}>
                  {formatDistanceCompact(selectedBandDestData.exitWidth)} margin for error
                </div>
                <div className="collapse-hint">
                  {bandModeCollapsed ? 'Tap to change selection' : 'Tap to collapse'}
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

          {/* Band Selector (hidden when collapsed) */}
          {!bandModeCollapsed && (
            <div className="band-selector-section">
              <div className="band-selector-header">
                <label>{bandSelectorCollapsed ? 'Target Band' : 'Select Target Band'}</label>
                {!bandSelectorCollapsed && (
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
                )}
              </div>

              <div className="band-selector-grid">
                {(bandSelectorCollapsed && selectedBand ? [selectedBand] : sortedBands).map(band => (
                  <button
                    key={band.id}
                    className={`band-select-btn ${selectedBandId === band.id ? 'selected' : ''} density-${getDensityClass(band.relativeDensity)}`}
                    onClick={() => handleBandSelect(band.id)}
                  >
                    <span className="band-select-name">{band.name}</span>
                    <span className="band-select-density">{Math.round(band.relativeDensity * 100)}%</span>
                    {bandSelectorCollapsed && selectedBandId === band.id && (
                      <span className="band-select-hint">Tap to change</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Destination List (hidden when collapsed) */}
          {!bandModeCollapsed && selectedBandId !== null && selectedBand && (
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
  return `${Math.round(thousands)} Mm`;
}
