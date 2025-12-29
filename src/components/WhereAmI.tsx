// Where Am I Component
// Helps users identify their position in the Aaron Halo

import { useState } from 'react';
import { analyzePosition } from '../utils/calculator';
import './WhereAmI.css';

export function WhereAmI() {
  const [distanceGm, setDistanceGm] = useState<string>('');
  const [result, setResult] = useState<ReturnType<typeof analyzePosition> | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleDistanceChange = (value: string) => {
    setDistanceGm(value);

    const gm = parseFloat(value);
    if (!isNaN(gm) && gm > 0) {
      // Convert Gm to km (1 Gm = 1,000,000 km)
      const km = gm * 1_000_000;
      const analysis = analyzePosition(km);
      setResult(analysis);
    } else {
      setResult(null);
    }
  };

  const formatDensity = (density: number): string => {
    return `${Math.round(density * 100)}%`;
  };

  return (
    <div className="where-am-i">

      {/* Input */}
      <div className="form-group">
        <label htmlFor="distance-input">
          Distance to Stanton (Gm)
          <button
            className="help-icon"
            onClick={() => setShowHelp(true)}
            type="button"
            aria-label="How to find your distance"
          >
            ?
          </button>
        </label>
        <div className="input-with-unit">
          <input
            id="distance-input"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g., 20.32"
            value={distanceGm}
            onChange={(e) => handleDistanceChange(e.target.value)}
          />
          <span className="unit">Gm</span>
        </div>
        <div className="input-hint">
          Aaron Halo bands are between ~19.7 and ~21.3 Gm from Stanton
        </div>

      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowHelp(false)}>×</button>
            <h2>How to Find Your Distance</h2>
            <div className="help-section">
              <ol className="help-steps">
                <li>Open the Star Map (<kbd>F2</kbd>)</li>
                <li>Scroll out to see the full system</li>
                <li>Click on <strong>Stanton</strong> (the star)</li>
                <li>Click <strong>Set Route</strong></li>
                <li>Your distance to Stanton appears in the route panel (in Gm)</li>
              </ol>
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
                <div className="result-label">You are in</div>
                <div className="result-band">{result.currentBand.name}</div>
                <div className="result-density">
                  Density: {formatDensity(result.currentBand.relativeDensity)}
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
                <div className="result-label">Between Bands</div>
                <div className="result-band result-between">
                  Near {result.closestBand.name}
                </div>
              </div>
              <div className="result-details">
                <p>{result.positionDescription}</p>
              </div>
            </>
          ) : (
            <>
              <div className="result-main result-outside">
                <div className="result-label">Outside Aaron Halo</div>
                <div className="result-band result-warning">
                  {result.distanceFromStanton < 19_000_000 ? 'Too Close' : 'Too Far'}
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

      {/* Empty state */}
      {!result && distanceGm === '' && (
        <div className="empty-state">
          Enter your distance to Stanton to identify your position
        </div>
      )}
    </div>
  );
}
