import { useState, useMemo, Fragment } from 'react';
import { getLocationById, getGroupedLocationsForDropdown, type StantonLocation } from '../types/locations';
import { BANDS } from '../types/bands';
import {
  getAvailableStartLocations,
  getAvailableDestinations,
  getRouteWithBandInfo,
  getDestinationsByBandWidth,
  calculateExitWidths
} from '../types/routes';
import { formatDistance } from '../utils/calculator';
import { RouteSummary } from './RouteSummary';
import './RoutePlanner.css';

// Helper to format location name for dropdowns (with note suffix if applicable)
function formatLocationName(loc: StantonLocation, indent = true): string {
  const prefix = indent && loc.type !== 'planet' ? '└ ' : '';
  const suffix = loc.note ? ' *Not on Map (HUD Targeting ONLY)' : '';
  return `${prefix}${loc.shortName}${suffix}`;
}

// Reusable component for location notes/tips
function LocationTip({ startLocation, destLocation }: { startLocation: StantonLocation | null; destLocation: StantonLocation | null }) {
  if (!startLocation?.note && !destLocation?.note) return null;

  return (
    <div className="location-tip">
      <span className="tip-icon">ℹ</span>
      <span>
        {startLocation?.note && (
          <>
            <strong>{startLocation.shortName}:</strong> {startLocation.note}
            {destLocation?.note && <br />}
          </>
        )}
        {destLocation?.note && (
          <>
            <strong>{destLocation.shortName}:</strong> {destLocation.note}
          </>
        )}
      </span>
    </div>
  );
}

type PlannerMode = 'destination' | 'band';
type BandSortBy = 'number' | 'density' | 'opportunity';

interface RoutePlannerProps {
  startId: string;
  destinationId: string;
  selectedBandId: number | null;
  onStartChange: (id: string) => void;
  onDestinationChange: (id: string) => void;
  onSelectedBandChange: (bandId: number | null) => void;
  onSwapRoute: () => void;
}

export function RoutePlanner({
  startId,
  destinationId,
  selectedBandId,
  onStartChange,
  onDestinationChange,
  onSelectedBandChange,
  onSwapRoute
}: RoutePlannerProps) {
  const [mode, setMode] = useState<PlannerMode>('band');
  const [bandSortBy, setBandSortBy] = useState<BandSortBy>('number');
  const [destModeSortBy, setDestModeSortBy] = useState<BandSortBy>('number');
  const [selectedDestBandId, setSelectedDestBandId] = useState<number | null>(null);
  const [destTableCollapsed, setDestTableCollapsed] = useState(false);
  const [bandModeCollapsed, setBandModeCollapsed] = useState(false);
  const [bandSelectorCollapsed, setBandSelectorCollapsed] = useState(false);
  const [showSortInfo, setShowSortInfo] = useState(false);

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
    switch (destModeSortBy) {
      case 'density':
        return details.sort((a, b) => b.band.relativeDensity - a.band.relativeDensity);
      case 'opportunity':
        return details.sort((a, b) => b.band.miningOpportunity - a.band.miningOpportunity);
      case 'number':
      default:
        return details.sort((a, b) => a.band.id - b.band.id);
    }
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
    switch (bandSortBy) {
      case 'density':
        return [...BANDS].sort((a, b) => b.relativeDensity - a.relativeDensity);
      case 'opportunity':
        return [...BANDS].sort((a, b) => b.miningOpportunity - a.miningOpportunity);
      case 'number':
      default:
        return BANDS;
    }
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
      onSelectedBandChange(bandId); // Also update lifted state for RefineryFinder
      setDestTableCollapsed(true);
    }
  };

  // Handle mode change - preserve selections when switching
  const handleModeChange = (newMode: PlannerMode) => {
    setMode(newMode);

    // Preserve state when switching modes
    if (newMode === 'destination') {
      // Switching to destination mode: sync selectedDestBandId with lifted state
      setSelectedDestBandId(selectedBandId);
      // Collapse if we have a complete selection
      if (startId && destinationId && selectedBandId !== null) {
        setDestTableCollapsed(true);
      } else {
        setDestTableCollapsed(false);
      }
    } else {
      // Switching to band mode: lifted state already has bandId
      // Collapse if we have a complete selection
      if (startId && selectedBandId !== null && destinationId) {
        setBandModeCollapsed(true);
        setBandSelectorCollapsed(true);
      } else if (startId && selectedBandId !== null) {
        setBandSelectorCollapsed(true);
        setBandModeCollapsed(false);
      } else {
        setBandModeCollapsed(false);
        setBandSelectorCollapsed(false);
      }
    }
  };

  // Handle band selection in band mode
  const handleBandSelect = (bandId: number) => {
    if (selectedBandId === bandId && bandSelectorCollapsed) {
      // Clicking the same band again expands the selector
      setBandSelectorCollapsed(false);
    } else {
      onSelectedBandChange(bandId);
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
                      {formatLocationName(loc)}
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
                        {formatLocationName(loc)}
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
              <RouteSummary
                startLocation={startLocation}
                destLocation={destLocation}
                canSwap={canSwap}
                onSwap={handleSwap}
              />

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

              <LocationTip startLocation={startLocation} destLocation={destLocation} />

              <div className="route-instructions">
                <p className="instruction-title">How to use:</p>
                <ol>
                  <li>Start quantum travel toward <strong>{destLocation.shortName}</strong></li>
                  <li>Watch the remaining distance to your destination</li>
                  <li>Exit QT at <strong>{formatDistance(selectedDestBandData.exit.distanceToDestination)}</strong></li>
                </ol>
                <p className="instruction-tip">
                  <strong>Pro tip:</strong> Drop out 0.1–0.2 Gm early, then restart QT. The slower acceleration makes timing your exit easier.
                </p>
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
                    className={`sort-btn ${destModeSortBy === 'number' ? 'active' : ''}`}
                    onClick={() => setDestModeSortBy('number')}
                  >
                    <span className="number-label">Band #</span>
                  </button>
                  <button
                    className={`sort-btn ${destModeSortBy === 'density' ? 'active' : ''}`}
                    onClick={() => setDestModeSortBy('density')}
                  >
                    <span className="density-label">Density</span>
                  </button>
                  <button
                    className={`sort-btn ${destModeSortBy === 'opportunity' ? 'active' : ''}`}
                    onClick={() => setDestModeSortBy('opportunity')}
                  >
                    <span className="opportunity-label">Mining Opp.</span>
                  </button>
                  <span
                    className="sort-info-icon"
                    role="button"
                    tabIndex={0}
                    aria-label="Show sort information"
                    onClick={() => setShowSortInfo(!showSortInfo)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowSortInfo(!showSortInfo);
                      }
                    }}
                  >ⓘ</span>
                  {showSortInfo && (
                    <>
                      <div className="sort-info-overlay" onClick={() => setShowSortInfo(false)} />
                      <div className="sort-info-popup">
                        <div className="sort-info-content">
                          <div className="sort-info-row"><span className="number-label">Band #</span>: Sort by band number 1-10.</div>
                          <div className="sort-info-row"><span className="density-label">Density</span> (D): Percentage of max peak asteroid concentration.</div>
                          <div className="sort-info-row"><span className="opportunity-label">Mining Opp.</span> (MO): Total mining potential (density × band width).</div>
                        </div>
                        <button className="sort-info-close" onClick={() => setShowSortInfo(false)}>Got it</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="band-header">
                <span className="band-col-name">Band</span>
                <span className="band-col-dest">Exit at Distance</span>
                <span className="band-col-density">
                  {destModeSortBy === 'opportunity' ? (
                    <><span className="legend-m">MO</span> / <span className="legend-d">D</span></>
                  ) : (
                    <><span className="legend-d">D</span> / <span className="legend-m">MO</span></>
                  )}
                </span>
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
                    <div className="dual-bars">
                      {destModeSortBy === 'opportunity' ? (
                        <>
                          <div className="bar-row">
                            <span className="bar-label">MO</span>
                            <span className="opportunity-bar" style={{ width: `${band.miningOpportunity * 100}%` }} />
                          </div>
                          <div className="bar-row">
                            <span className="bar-label">D</span>
                            <span className="density-bar" style={{ width: `${band.relativeDensity * 100}%` }} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bar-row">
                            <span className="bar-label">D</span>
                            <span className="density-bar" style={{ width: `${band.relativeDensity * 100}%` }} />
                          </div>
                          <div className="bar-row">
                            <span className="bar-label">MO</span>
                            <span className="opportunity-bar" style={{ width: `${band.miningOpportunity * 100}%` }} />
                          </div>
                        </>
                      )}
                    </div>
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
              <RouteSummary
                startLocation={startLocation}
                destLocation={destLocation}
                canSwap={canSwap}
                onSwap={handleSwap}
              />

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

              <LocationTip startLocation={startLocation} destLocation={destLocation} />

              <div className="route-instructions">
                <p className="instruction-title">How to use:</p>
                <ol>
                  <li>Start quantum travel toward <strong>{destLocation.shortName}</strong></li>
                  <li>Watch the remaining distance to your destination</li>
                  <li>Exit QT at <strong>{formatDistance(selectedBandDestData.exitDistance)}</strong></li>
                </ol>
                <p className="instruction-tip">
                  <strong>Pro tip:</strong> Drop out 0.1–0.2 Gm early, then restart QT. The slower acceleration makes timing your exit easier.
                </p>
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
                      className={`sort-btn ${bandSortBy === 'number' ? 'active' : ''}`}
                      onClick={() => setBandSortBy('number')}
                    >
                      <span className="number-label">Band #</span>
                    </button>
                    <button
                      className={`sort-btn ${bandSortBy === 'density' ? 'active' : ''}`}
                      onClick={() => setBandSortBy('density')}
                    >
                      <span className="density-label">Density</span>
                    </button>
                    <button
                      className={`sort-btn ${bandSortBy === 'opportunity' ? 'active' : ''}`}
                      onClick={() => setBandSortBy('opportunity')}
                    >
                      <span className="opportunity-label">Mining Opp.</span>
                    </button>
                    <span
                      className="sort-info-icon"
                      role="button"
                      tabIndex={0}
                      aria-label="Show sort information"
                      onClick={() => setShowSortInfo(!showSortInfo)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setShowSortInfo(!showSortInfo);
                        }
                      }}
                    >
                      ⓘ
                    </span>
                    {showSortInfo && (
                      <>
                        <div className="sort-info-overlay" onClick={() => setShowSortInfo(false)} />
                        <div className="sort-info-popup">
                          <div className="sort-info-content">
                            <div className="sort-info-row"><span className="number-label">Band #</span>: Sort by band number 1-10.</div>
                            <div className="sort-info-row"><span className="density-label">Density</span> (D): Percentage of max peak asteroid concentration.</div>
                            <div className="sort-info-row"><span className="opportunity-label">Mining Opp.</span> (MO): Total mining potential (density × band width).</div>
                          </div>
                          <button className="sort-info-close" onClick={() => setShowSortInfo(false)}>Got it</button>
                        </div>
                      </>
                    )}
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
                    <div className="band-select-bars">
                      {bandSortBy === 'opportunity' ? (
                        <>
                          <div className="bar-row">
                            <span className="bar-label">MO</span>
                            <span className="opportunity-bar" style={{ width: `${band.miningOpportunity * 100}%` }} />
                          </div>
                          <div className="bar-row">
                            <span className="bar-label">D</span>
                            <span className="density-bar" style={{ width: `${band.relativeDensity * 100}%` }} />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bar-row">
                            <span className="bar-label">D</span>
                            <span className="density-bar" style={{ width: `${band.relativeDensity * 100}%` }} />
                          </div>
                          <div className="bar-row">
                            <span className="bar-label">MO</span>
                            <span className="opportunity-bar" style={{ width: `${band.miningOpportunity * 100}%` }} />
                          </div>
                        </>
                      )}
                    </div>
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
                        {dest.location ? formatLocationName(dest.location, false) : dest.destinationId}
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
