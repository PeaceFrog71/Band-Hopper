import { useState, useMemo, Fragment } from 'react';
import {
  getMaterialsByValue,
  type PolarCoordinate,
  getLocationCoordinates,
  interpolatePositionOnRoute,
  formatPolarDistance,
  findClosestRefineryByPosition,
  findBestRefineryByYield,
  findOptimalRefinery,
  BANDS,
  getLocationById,
} from '../types';
import './RefineryFinder.css';

type SelectionMode = 'closest' | 'best-yield' | 'optimal';

/**
 * Format aUEC value impact for display
 * Shows sign and comma-separated number
 */
function formatValueImpact(value: number): string {
  const rounded = Math.round(value);
  const formatted = Math.abs(rounded).toLocaleString();
  if (rounded > 0) return `+${formatted}`;
  if (rounded < 0) return `-${formatted}`;
  return '0';
}

interface RefineryFinderProps {
  // From Route Planner state (lifted to App)
  startId: string;
  destinationId: string;
  selectedBandId: number | null;
}

export function RefineryFinder({
  startId,
  destinationId,
  selectedBandId,
}: RefineryFinderProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [secondaryMaterial, setSecondaryMaterial] = useState<string>('');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('optimal');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manualR, setManualR] = useState<string>('');
  const [manualTheta, setManualTheta] = useState<string>('');
  const [distanceWeight, setDistanceWeight] = useState(0.5);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Calculate user position from route + band
  const userPosition = useMemo<PolarCoordinate | null>(() => {
    // Check for manual coordinates first
    if (showAdvanced && manualR && manualTheta) {
      const r = parseFloat(manualR);
      const theta = parseFloat(manualTheta);
      if (!isNaN(r) && !isNaN(theta)) {
        return { r, theta };
      }
    }

    // Otherwise calculate from route
    if (!startId || !destinationId || selectedBandId === null) return null;

    const startCoords = getLocationCoordinates(startId);
    const destCoords = getLocationCoordinates(destinationId);
    const band = BANDS.find(b => b.id === selectedBandId);

    if (!startCoords || !destCoords || !band) return null;

    // Band center radius in Gm
    const targetRadius = band.peakDensityDistance / 1_000_000;

    return interpolatePositionOnRoute(startCoords, destCoords, targetRadius);
  }, [startId, destinationId, selectedBandId, showAdvanced, manualR, manualTheta]);

  // Get refinery recommendations based on mode
  const refineryResults = useMemo(() => {
    if (selectionMode === 'best-yield') {
      // Best yield mode doesn't need position, just material
      if (!selectedMaterial) return [];
      const results = findBestRefineryByYield(selectedMaterial).map(r => ({
        ...r,
        distanceGm: userPosition
          ? findClosestRefineryByPosition(userPosition).find(
              c => c.refinery.id === r.refinery.id
            )?.distanceGm ?? 0
          : 0,
        score: 0,
        secondaryYieldPercent: secondaryMaterial
          ? r.refinery.yieldBonuses[secondaryMaterial] || 0
          : 0,
        combinedYieldPercent: r.yieldPercent + (secondaryMaterial
          ? r.refinery.yieldBonuses[secondaryMaterial] || 0
          : 0),
      }));
      // Filter to only show refineries with positive yields (bonuses)
      // If no positive yields exist, show all but they'll be sorted by yield (least negative first)
      const positiveResults = results.filter(r => r.yieldPercent > 0);
      return positiveResults.length > 0 ? positiveResults : results;
    }

    if (!userPosition) return [];

    if (selectionMode === 'closest') {
      // Pure distance mode - closest refinery regardless of yield
      return findClosestRefineryByPosition(userPosition).map(r => ({
        ...r,
        yieldPercent: selectedMaterial
          ? r.refinery.yieldBonuses[selectedMaterial] || 0
          : 0,
        secondaryYieldPercent: secondaryMaterial
          ? r.refinery.yieldBonuses[secondaryMaterial] || 0
          : 0,
        combinedYieldPercent: (selectedMaterial ? r.refinery.yieldBonuses[selectedMaterial] || 0 : 0)
          + (secondaryMaterial ? r.refinery.yieldBonuses[secondaryMaterial] || 0 : 0),
        score: 0,
      }));
    }

    // Optimal mode
    if (!selectedMaterial) {
      // Without material, just use distance
      return findClosestRefineryByPosition(userPosition).map(r => ({
        ...r,
        yieldPercent: 0,
        secondaryYieldPercent: 0,
        combinedYieldPercent: 0,
        score: 0,
      }));
    }

    // Use the optimal scoring algorithm which balances distance and yield
    return findOptimalRefinery(userPosition, selectedMaterial, distanceWeight, secondaryMaterial || undefined);
  }, [userPosition, selectionMode, selectedMaterial, secondaryMaterial, distanceWeight]);

  // Get position description
  const positionDescription = useMemo(() => {
    if (showAdvanced && manualR && manualTheta) {
      return `Manual: r=${manualR} Gm, θ=${manualTheta}°`;
    }

    if (!startId || !destinationId || selectedBandId === null) {
      return 'Select a route in Route Planner to calculate position';
    }

    const startLoc = getLocationById(startId);
    const destLoc = getLocationById(destinationId);
    const band = BANDS.find(b => b.id === selectedBandId);

    if (!startLoc || !destLoc || !band) {
      return 'Invalid route selection';
    }

    return `${startLoc.shortName} → ${destLoc.shortName}, ${band.name}`;
  }, [startId, destinationId, selectedBandId, showAdvanced, manualR, manualTheta]);

  // Group materials by rarity for dropdown
  const materialGroups = useMemo(() => {
    const sorted = getMaterialsByValue();
    const groups: { rarity: string; materials: typeof sorted }[] = [
      { rarity: 'Very Rare', materials: sorted.filter(m => m.rarity === 'very-rare') },
      { rarity: 'Rare', materials: sorted.filter(m => m.rarity === 'rare') },
      { rarity: 'Uncommon', materials: sorted.filter(m => m.rarity === 'uncommon') },
      { rarity: 'Common', materials: sorted.filter(m => m.rarity === 'common') },
    ];
    return groups.filter(g => g.materials.length > 0);
  }, []);

  const topResult = refineryResults[0];
  const alternatives = refineryResults.slice(1, 5);
  const hasPosition = !!userPosition;
  const needsMaterial = selectionMode === 'best-yield' || selectionMode === 'optimal';

  return (
    <div className="refinery-finder">
      {/* Position Display */}
      <div className="position-display">
        <div className="position-label">Your Position</div>
        <div className={`position-value ${hasPosition ? '' : 'no-position'}`}>
          {positionDescription}
        </div>
        {userPosition && (
          <div className="position-coords">
            r = {userPosition.r.toFixed(2)} Gm, θ = {userPosition.theta.toFixed(1)}°
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${selectionMode === 'closest' ? 'active' : ''}`}
          onClick={() => setSelectionMode('closest')}
        >
          Closest
        </button>
        <button
          className={`mode-btn ${selectionMode === 'best-yield' ? 'active' : ''}`}
          onClick={() => setSelectionMode('best-yield')}
        >
          Best Yield
        </button>
        <button
          className={`mode-btn ${selectionMode === 'optimal' ? 'active' : ''}`}
          onClick={() => setSelectionMode('optimal')}
        >
          Optimal
        </button>
      </div>

      {/* Material Selectors */}
      <div className="material-selectors">
        <div className="form-group">
          <label>Primary Ore {needsMaterial && !selectedMaterial && <span className="required">*</span>}</label>
          <select
            value={selectedMaterial}
            onChange={(e) => {
              const newPrimary = e.target.value;
              setSelectedMaterial(newPrimary);
              // Clear secondary if it matches the new primary
              if (newPrimary === secondaryMaterial) {
                setSecondaryMaterial('');
              }
            }}
          >
            <option value="">Select material...</option>
            {materialGroups.map(group => (
              <Fragment key={group.rarity}>
                <option disabled className="option-group-header">── {group.rarity} ──</option>
                {group.materials.map(mat => (
                  <option key={mat.id} value={mat.id}>
                    {mat.name}
                  </option>
                ))}
              </Fragment>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Secondary Ore <span className="optional">(optional)</span></label>
          <select
            value={secondaryMaterial}
            onChange={(e) => setSecondaryMaterial(e.target.value)}
          >
            <option value="">None</option>
            {materialGroups.map(group => (
              <Fragment key={group.rarity}>
                <option disabled className="option-group-header">── {group.rarity} ──</option>
                {group.materials.map(mat => (
                  <option key={mat.id} value={mat.id} disabled={mat.id === selectedMaterial}>
                    {mat.name}
                  </option>
                ))}
              </Fragment>
            ))}
          </select>
        </div>
      </div>

      {/* Distance Weight Slider (Optimal mode only) */}
      {selectionMode === 'optimal' && (
        <div className="weight-slider">
          <label>Priority Balance</label>
          <div className="slider-container">
            <span className="slider-label">Yield</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={distanceWeight}
              onChange={(e) => setDistanceWeight(parseFloat(e.target.value))}
            />
            <span className="slider-label">Distance</span>
          </div>
        </div>
      )}

      {/* Primary Result */}
      {topResult ? (
        <div className="result-card primary">
          <div className="result-header">Recommended Refinery</div>
          <div className="result-name">{topResult.location.shortName}</div>
          <div className="result-station">{topResult.refinery.name}</div>
          <div className="result-details">
            {hasPosition && (
              <div className="result-distance">
                <span className="detail-label">Distance:</span>
                <span className="detail-value">{formatPolarDistance(topResult.distanceGm)}</span>
              </div>
            )}
            {selectedMaterial && (
              <div className={`result-yield ${topResult.yieldPercent > 0 ? 'positive' : topResult.yieldPercent < 0 ? 'negative' : ''}`}>
                <span className="detail-label">Primary:</span>
                <span className="detail-value">
                  {topResult.yieldPercent > 0 ? '+' : ''}{topResult.yieldPercent}%
                  {'primaryValueImpact' in topResult && (
                    <span className="value-impact"> ({formatValueImpact(topResult.primaryValueImpact as number)})</span>
                  )}
                </span>
              </div>
            )}
            {secondaryMaterial && (
              <div className={`result-yield ${topResult.secondaryYieldPercent > 0 ? 'positive' : topResult.secondaryYieldPercent < 0 ? 'negative' : ''}`}>
                <span className="detail-label">Secondary:</span>
                <span className="detail-value">
                  {topResult.secondaryYieldPercent > 0 ? '+' : ''}{topResult.secondaryYieldPercent}%
                  {'secondaryValueImpact' in topResult && (
                    <span className="value-impact"> ({formatValueImpact(topResult.secondaryValueImpact as number)})</span>
                  )}
                </span>
              </div>
            )}
            {selectedMaterial && secondaryMaterial && (
              <div className={`result-yield combined ${topResult.combinedYieldPercent > 0 ? 'positive' : topResult.combinedYieldPercent < 0 ? 'negative' : ''}`}>
                <span className="detail-label">Combined:</span>
                <span className="detail-value">
                  {topResult.combinedYieldPercent > 0 ? '+' : ''}{topResult.combinedYieldPercent}%
                  {'combinedValueImpact' in topResult && (
                    <span className="value-impact"> ({formatValueImpact(topResult.combinedValueImpact as number)} aUEC)</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="result-card empty">
          <div className="result-header">Recommended Refinery</div>
          <div className="result-name">---</div>
          <div className="result-hint">
            {!hasPosition && selectionMode !== 'best-yield'
              ? 'Select a route in Route Planner first'
              : needsMaterial && !selectedMaterial
              ? 'Select a material to see recommendations'
              : 'No refineries found'}
          </div>
        </div>
      )}

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="alternatives-section">
          <button
            className="alternatives-toggle"
            onClick={() => setShowAlternatives(!showAlternatives)}
          >
            {showAlternatives ? '▼' : '▶'} Alternatives ({alternatives.length})
          </button>
          {showAlternatives && (
            <div className="alternatives-list">
              {alternatives.map((result, idx) => (
                <div key={result.refinery.id} className="alternative-item">
                  <span className="alt-rank">{idx + 2}.</span>
                  <span className="alt-name">{result.location.shortName}</span>
                  {hasPosition && (
                    <span className="alt-distance">{formatPolarDistance(result.distanceGm)}</span>
                  )}
                  {selectedMaterial && !secondaryMaterial && (
                    <span className={`alt-yield ${result.yieldPercent > 0 ? 'positive' : result.yieldPercent < 0 ? 'negative' : ''}`}>
                      {result.yieldPercent > 0 ? '+' : ''}{result.yieldPercent}%
                    </span>
                  )}
                  {selectedMaterial && secondaryMaterial && (
                    <span className={`alt-yield ${result.combinedYieldPercent > 0 ? 'positive' : result.combinedYieldPercent < 0 ? 'negative' : ''}`}>
                      {result.combinedYieldPercent > 0 ? '+' : ''}{result.combinedYieldPercent}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Advanced Toggle */}
      <div className="advanced-section">
        <button
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? '▼' : '▶'} Advanced (Manual Coordinates)
        </button>
        {showAdvanced && (
          <div className="advanced-inputs">
            <p className="advanced-hint">
              Enter your ship's coordinates from the in-game map to override the calculated position.
            </p>
            <div className="coord-inputs">
              <div className="form-group">
                <label>r (Gm)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 20.32"
                  value={manualR}
                  onChange={(e) => setManualR(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>θ (degrees)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., -45"
                  value={manualTheta}
                  onChange={(e) => setManualTheta(e.target.value)}
                />
              </div>
            </div>
            {manualR && manualTheta && (
              <button
                className="clear-coords-btn"
                onClick={() => {
                  setManualR('');
                  setManualTheta('');
                }}
              >
                Clear Manual Coordinates
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
