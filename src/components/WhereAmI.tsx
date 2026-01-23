// Where Am I Component
// Helps users identify their position in the Aaron Halo

import { useState, useMemo } from 'react';
import { analyzePosition } from '../utils/calculator';
import { MapModal } from './MapModal';
import './WhereAmI.css';

// Import the help screenshot
import helpScreenshot from '../../ref data/Where Am I Help Screen.png';

// Solar system icon SVG for map button (matches RoutePlanner)
function SolarSystemIcon() {
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

interface WhereAmIProps {
  distanceGm: string;
  angleTheta: string;
  showHelp: boolean;
  onDistanceChange: (value: string) => void;
  onAngleChange: (value: string) => void;
  onShowHelpChange: (show: boolean) => void;
}

export function WhereAmI({
  distanceGm,
  angleTheta,
  showHelp,
  onDistanceChange,
  onAngleChange,
  onShowHelpChange,
}: WhereAmIProps) {
  const [showMap, setShowMap] = useState(false);

  // Analyze position based on distance
  const result = useMemo(() => {
    const gm = parseFloat(distanceGm);
    if (!isNaN(gm) && gm > 0) {
      // Convert Gm to km (1 Gm = 1,000,000 km)
      const km = gm * 1_000_000;
      return analyzePosition(km);
    }
    return null;
  }, [distanceGm]);

  const formatDensity = (density: number): string => {
    return `${Math.round(density * 100)}%`;
  };

  return (
    <div className="where-am-i">

      {/* Coordinate Inputs */}
      <div className="coordinate-inputs">
        <div className="form-group">
          <label htmlFor="distance-input">
            Distance (Gm)
          </label>
          <div className="input-with-unit">
            <input
              id="distance-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 20.32"
              value={distanceGm}
              onChange={(e) => onDistanceChange(e.target.value)}
            />
            <span className="unit">Gm</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="angle-input">
            Angle (°)
          </label>
          <div className="input-with-unit">
            <input
              id="angle-input"
              type="number"
              step="0.1"
              placeholder="e.g., -49.99"
              value={angleTheta}
              onChange={(e) => onAngleChange(e.target.value)}
            />
            <span className="unit">°</span>
          </div>
        </div>
      </div>

      <div className="input-hint">
        Aaron Halo bands are between ~19.7 and ~21.3 Gm from Stanton
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="help-overlay" onClick={() => onShowHelpChange(false)}>
          <div className="help-modal help-modal-large" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => onShowHelpChange(false)}>×</button>
            <h2>How to Find Your Coordinates</h2>
            <div className="help-section">
              <ol className="help-steps">
                <li>Open the Star Map (<kbd>F2</kbd>)</li>
                <li>Your coordinates are shown at the bottom of the screen</li>
              </ol>
              <div className="help-screenshot">
                <img src={helpScreenshot} alt="Screenshot showing coordinate location in Star Citizen" />
              </div>
              <p className="help-note">
                You'll see three values at the bottom. Use the <strong>second angle</strong> (e.g., -49.99°)
                and the <strong>distance</strong> (e.g., 31.81 Gm). The first angle (usually close to 0°) can be ignored.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="position-result">
          {result.currentBand ? (
            <>
              <div className="result-main">
                <div className="result-info">
                  <div className="result-label">You are in</div>
                  <div className="result-band">{result.currentBand.name}</div>
                  <div className="result-density">
                    Density: {formatDensity(result.currentBand.relativeDensity)}
                  </div>
                </div>
                <div className="map-btn-container">
                  <button
                    className="map-icon-btn"
                    onClick={() => setShowMap(true)}
                    title="View Map"
                    aria-label="View Map"
                  >
                    <SolarSystemIcon />
                  </button>
                  <span className="map-btn-label">MAP</span>
                </div>
              </div>
              <div className="result-details">
                <p>{result.positionDescription}</p>
                {result.currentBand.description && (
                  <p className="band-description">{result.currentBand.description}</p>
                )}
              </div>
            </>
          ) : result.isInHalo ? (
            <>
              <div className="result-main">
                <div className="result-info">
                  <div className="result-label">Between Bands</div>
                  <div className="result-band result-between">
                    Near {result.closestBand.name}
                  </div>
                </div>
                <div className="map-btn-container">
                  <button
                    className="map-icon-btn"
                    onClick={() => setShowMap(true)}
                    title="View Map"
                    aria-label="View Map"
                  >
                    <SolarSystemIcon />
                  </button>
                  <span className="map-btn-label">MAP</span>
                </div>
              </div>
              <div className="result-details">
                <p>{result.positionDescription}</p>
              </div>
            </>
          ) : (
            <>
              <div className="result-main result-outside">
                <div className="result-info">
                  <div className="result-label">Outside Aaron Halo</div>
                  <div className="result-band result-warning">
                    {result.distanceFromStanton < 19_000_000 ? 'Too Close' : 'Too Far'}
                  </div>
                </div>
                <div className="map-btn-container">
                  <button
                    className="map-icon-btn"
                    onClick={() => setShowMap(true)}
                    title="View Map"
                    aria-label="View Map"
                  >
                    <SolarSystemIcon />
                  </button>
                  <span className="map-btn-label">MAP</span>
                </div>
              </div>
              <div className="result-details">
                <p>{result.positionDescription}</p>
                <p className="nearest-band">
                  Nearest band: {result.closestBand.name} ({(result.distanceToClosestBand / 1_000_000).toFixed(2)} Gm away)
                </p>
              </div>
            </>
          )}

          {/* Nearby bands */}
          {result.nearbyBands.length > 1 && (
            <div className="nearby-bands">
              <div className="nearby-title">Nearby Bands</div>
              <div className="nearby-list">
                {result.nearbyBands.slice(0, 3).map(({ band, distance, direction }) => (
                  <div key={band.id} className="nearby-item">
                    <span className="nearby-name">{band.name}</span>
                    <span className="nearby-distance">
                      {(distance / 1_000_000).toFixed(2)} Gm {direction === 'closer' ? 'inward' : 'outward'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Map Modal */}
      <MapModal
        isOpen={showMap}
        onClose={() => setShowMap(false)}
        position={{
          distanceFromStanton: result?.distanceFromStanton ?? 0,
          angle: angleTheta ? parseFloat(angleTheta) : undefined,
          label: 'You',
        }}
        title="Your Position in Stanton"
        initialZoom={result?.isInHalo ? 'halo' : 'system'}
      />

      {/* Empty state */}
      {!result && distanceGm === '' && (
        <div className="empty-state">
          Enter your coordinates to identify your position in the Aaron Halo
        </div>
      )}
    </div>
  );
}
