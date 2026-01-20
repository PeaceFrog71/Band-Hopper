import { useState, useMemo, Fragment } from 'react';
import {
  getMaterialsByValue,
  getMaterialById,
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

// Default cargo mix: 30% primary, 70% secondary (no inert assumption)
const DEFAULT_PRIMARY_MIX = 0.30;
import './RefineryFinder.css';

type SelectionMode = 'closest' | 'best-yield' | 'optimal';
type PositionSource = 'route-planner' | 'where-am-i';

// Default balance between distance and yield (0.5 = equal weight)
const DEFAULT_DISTANCE_WEIGHT = 0.5;

/**
 * Format aUEC value impact for display
 * Shows sign, comma-separated number, and /SCU unit
 */
function formatValueImpact(value: number): string {
  const rounded = Math.round(value);
  const formatted = Math.abs(rounded).toLocaleString();
  if (rounded > 0) return `+${formatted}/SCU`;
  if (rounded < 0) return `-${formatted}/SCU`;
  return '0/SCU';
}

interface RefineryFinderProps {
  // From Route Planner state (lifted to App)
  startId: string;
  destinationId: string;
  selectedBandId: number | null;
  // From Where Am I state (lifted to App)
  whereAmIDistance: string;
  whereAmIAngle: string;
}

export function RefineryFinder({
  startId,
  destinationId,
  selectedBandId,
  whereAmIDistance,
  whereAmIAngle,
}: RefineryFinderProps) {
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [secondaryMaterial, setSecondaryMaterial] = useState<string>('');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('optimal');
  const [positionSource, setPositionSource] = useState<PositionSource>('route-planner');
  const [distanceWeight, setDistanceWeight] = useState(DEFAULT_DISTANCE_WEIGHT);
  const [primaryMix, setPrimaryMix] = useState(DEFAULT_PRIMARY_MIX);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selectedAlternativeId, setSelectedAlternativeId] = useState<string | null>(null);

  // Calculate actual cargo weights from slider (100% scale, no inert)
  const primaryCargoWeight = primaryMix;
  const secondaryCargoWeight = 1 - primaryMix;

  // Calculate user position based on selected source
  const userPosition = useMemo<PolarCoordinate | null>(() => {
    if (positionSource === 'where-am-i') {
      // Use Where Am I coordinates
      const r = parseFloat(whereAmIDistance);
      const theta = parseFloat(whereAmIAngle);
      if (!isNaN(r) && !isNaN(theta) && r > 0) {
        return { r, theta };
      }
      return null;
    }

    // Route Planner source - calculate from route
    if (!startId || !destinationId || selectedBandId === null) return null;

    const startCoords = getLocationCoordinates(startId);
    const destCoords = getLocationCoordinates(destinationId);
    const band = BANDS.find(b => b.id === selectedBandId);

    if (!startCoords || !destCoords || !band) return null;

    // Band center radius in Gm
    const targetRadius = band.peakDensityDistance / 1_000_000;

    return interpolatePositionOnRoute(startCoords, destCoords, targetRadius);
  }, [positionSource, startId, destinationId, selectedBandId, whereAmIDistance, whereAmIAngle]);

  // Get refinery recommendations based on mode
  const refineryResults = useMemo(() => {
    if (selectionMode === 'best-yield') {
      // Best yield mode doesn't need position, just material
      if (!selectedMaterial) return [];

      // Precompute distance lookup to avoid O(n²) complexity
      const distanceByRefineryId: Record<string, number> = userPosition
        ? findClosestRefineryByPosition(userPosition).reduce(
            (acc, cur) => {
              acc[cur.refinery.id] = cur.distanceGm;
              return acc;
            },
            {} as Record<string, number>
          )
        : {};

      // Get material base values for value-weighted scoring
      const primaryMaterialData = getMaterialById(selectedMaterial);
      const secondaryMaterialData = secondaryMaterial ? getMaterialById(secondaryMaterial) : null;
      const primaryBaseValue = primaryMaterialData?.baseValue || 0;
      const secondaryBaseValue = secondaryMaterialData?.baseValue || 0;

      const results = findBestRefineryByYield(selectedMaterial).map(r => {
        const secondaryYieldPercent = secondaryMaterial
          ? r.refinery.yieldBonuses[secondaryMaterial] || 0
          : 0;
        const combinedYieldPercent = r.yieldPercent + secondaryYieldPercent;

        // Calculate value impacts (individual = raw per-material, combined = weighted by cargo mix)
        const primaryValueImpact = (r.yieldPercent / 100) * primaryBaseValue;
        const secondaryValueImpact = secondaryMaterial
          ? (secondaryYieldPercent / 100) * secondaryBaseValue
          : 0;
        // Combined uses cargo weighting for sorting/comparison
        const combinedValueImpact = (primaryValueImpact * primaryCargoWeight) + (secondaryValueImpact * secondaryCargoWeight);

        return {
          ...r,
          distanceGm: userPosition ? (distanceByRefineryId[r.refinery.id] ?? 0) : 0,
          score: 0,
          secondaryYieldPercent,
          combinedYieldPercent,
          primaryValueImpact,
          secondaryValueImpact,
          combinedValueImpact,
        };
      });

      // Sort by value-weighted impact (considers both yield % AND material prices)
      results.sort((a, b) => b.combinedValueImpact - a.combinedValueImpact);

      // Filter to only show refineries with positive value impact
      // If no positive impacts exist, show all sorted by value (least negative first)
      const positiveResults = results.filter(r => r.combinedValueImpact > 0);
      return positiveResults.length > 0 ? positiveResults : results;
    }

    if (!userPosition) return [];

    if (selectionMode === 'closest') {
      // Pure distance mode - closest refinery regardless of yield
      // Still calculate value impacts for display
      const primaryMaterialData = selectedMaterial ? getMaterialById(selectedMaterial) : null;
      const secondaryMaterialData = secondaryMaterial ? getMaterialById(secondaryMaterial) : null;
      const primaryBaseValue = primaryMaterialData?.baseValue || 0;
      const secondaryBaseValue = secondaryMaterialData?.baseValue || 0;

      return findClosestRefineryByPosition(userPosition).map(r => {
        const yieldPercent = selectedMaterial
          ? r.refinery.yieldBonuses[selectedMaterial] || 0
          : 0;
        const secondaryYieldPercent = secondaryMaterial
          ? r.refinery.yieldBonuses[secondaryMaterial] || 0
          : 0;
        // Individual impacts = raw per-material, combined = weighted by cargo mix
        const primaryValueImpact = (yieldPercent / 100) * primaryBaseValue;
        const secondaryValueImpact = secondaryMaterial
          ? (secondaryYieldPercent / 100) * secondaryBaseValue
          : 0;
        const combinedValueImpact = (primaryValueImpact * primaryCargoWeight) + (secondaryValueImpact * secondaryCargoWeight);

        return {
          ...r,
          yieldPercent,
          secondaryYieldPercent,
          combinedYieldPercent: yieldPercent + secondaryYieldPercent,
          primaryValueImpact,
          secondaryValueImpact,
          combinedValueImpact,
          score: 0,
        };
      });
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
    return findOptimalRefinery(
      userPosition,
      selectedMaterial,
      distanceWeight,
      secondaryMaterial || undefined,
      primaryCargoWeight,
      secondaryCargoWeight
    );
  }, [userPosition, selectionMode, selectedMaterial, secondaryMaterial, distanceWeight, primaryCargoWeight, secondaryCargoWeight]);

  // Get position description
  const positionDescription = useMemo(() => {
    if (positionSource === 'where-am-i') {
      if (whereAmIDistance && whereAmIAngle) {
        return `From Where Am I: ${whereAmIDistance} Gm, ${whereAmIAngle}°`;
      }
      return 'Enter coordinates in Where Am I tab';
    }

    // Route Planner source
    if (!startId || !destinationId || selectedBandId === null) {
      return 'Select a route in Route Planner tab';
    }

    const startLoc = getLocationById(startId);
    const destLoc = getLocationById(destinationId);
    const band = BANDS.find(b => b.id === selectedBandId);

    if (!startLoc || !destLoc || !band) {
      return 'Invalid route selection';
    }

    return `${startLoc.shortName} → ${destLoc.shortName}, ${band.name}`;
  }, [positionSource, startId, destinationId, selectedBandId, whereAmIDistance, whereAmIAngle]);

  // Group materials by rarity for dropdown (alphabetized within each group)
  const materialGroups = useMemo(() => {
    const materials = getMaterialsByValue();
    const sortAlpha = (arr: typeof materials) =>
      [...arr].sort((a, b) => a.name.localeCompare(b.name));
    const groups: { rarity: string; materials: typeof materials }[] = [
      { rarity: 'Very Rare', materials: sortAlpha(materials.filter(m => m.rarity === 'very-rare')) },
      { rarity: 'Rare', materials: sortAlpha(materials.filter(m => m.rarity === 'rare')) },
      { rarity: 'Uncommon', materials: sortAlpha(materials.filter(m => m.rarity === 'uncommon')) },
      { rarity: 'Common', materials: sortAlpha(materials.filter(m => m.rarity === 'common')) },
    ];
    return groups.filter(g => g.materials.length > 0);
  }, []);

  // Determine which result to display (selected alternative or top recommendation)
  const recommendedResult = refineryResults[0];
  const selectedResult = selectedAlternativeId
    ? refineryResults.find(r => r.refinery.id === selectedAlternativeId)
    : null;
  const displayedResult = selectedResult || recommendedResult;
  const isAlternativeSelected = !!selectedResult;

  // Alternatives exclude the currently displayed result
  const alternatives = refineryResults
    .filter(r => r.refinery.id !== displayedResult?.refinery.id)
    .slice(0, 4);

  const hasPosition = !!userPosition;
  const needsMaterial = selectionMode === 'best-yield' || selectionMode === 'optimal';

  // Clear selected alternative when mode/materials change
  const handleModeChange = (mode: SelectionMode) => {
    setSelectionMode(mode);
    setSelectedAlternativeId(null);
  };

  return (
    <div className="refinery-finder">
      {/* Position Source Selector */}
      <div className="position-source">
        <label className="position-source-label">Position From:</label>
        <div className="source-toggle">
          <button
            className={`source-btn ${positionSource === 'route-planner' ? 'active' : ''}`}
            onClick={() => setPositionSource('route-planner')}
          >
            Route Planner
          </button>
          <button
            className={`source-btn ${positionSource === 'where-am-i' ? 'active' : ''}`}
            onClick={() => setPositionSource('where-am-i')}
          >
            Where Am I?
          </button>
        </div>
      </div>

      {/* Position Display */}
      <div className="position-display">
        <div className="position-label">Your Position</div>
        <div className={`position-value ${hasPosition ? '' : 'no-position'}`}>
          {positionDescription}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${selectionMode === 'closest' ? 'active' : ''}`}
          onClick={() => handleModeChange('closest')}
        >
          Closest
        </button>
        <button
          className={`mode-btn ${selectionMode === 'best-yield' ? 'active' : ''}`}
          onClick={() => handleModeChange('best-yield')}
        >
          Best Yield
        </button>
        <button
          className={`mode-btn ${selectionMode === 'optimal' ? 'active' : ''}`}
          onClick={() => handleModeChange('optimal')}
        >
          Optimal
        </button>
      </div>

      {/* Primary Result */}
      {displayedResult ? (
        <div className={`result-card primary ${isAlternativeSelected ? 'alternative-selected' : ''}`}>
          <div className="result-header">
            {isAlternativeSelected ? 'Alternative Refinery Selected' : 'Recommended Refinery'}
            {isAlternativeSelected && (
              <button
                className="clear-selection"
                onClick={() => setSelectedAlternativeId(null)}
                title="Clear selection"
              >
                ✕
              </button>
            )}
          </div>
          <div className="result-name">{displayedResult.location.shortName}</div>
          <div className="result-station">{displayedResult.refinery.name}</div>
          <div className="result-details">
            {hasPosition && (
              <div className="result-distance">
                <span className="detail-label">Distance:</span>
                <span className="detail-value">{formatPolarDistance(displayedResult.distanceGm)}</span>
              </div>
            )}
            {selectedMaterial && (
              <div className={`result-yield ${displayedResult.yieldPercent > 0 ? 'positive' : displayedResult.yieldPercent < 0 ? 'negative' : ''}`}>
                <span className="detail-label">Primary:</span>
                <span className="detail-value">
                  {displayedResult.yieldPercent > 0 ? '+' : ''}{displayedResult.yieldPercent}%
                  {'primaryValueImpact' in displayedResult && (
                    <span className="value-impact"> ({formatValueImpact(displayedResult.primaryValueImpact as number)})</span>
                  )}
                </span>
              </div>
            )}
            {secondaryMaterial && (
              <div className={`result-yield ${displayedResult.secondaryYieldPercent > 0 ? 'positive' : displayedResult.secondaryYieldPercent < 0 ? 'negative' : ''}`}>
                <span className="detail-label">Secondary:</span>
                <span className="detail-value">
                  {displayedResult.secondaryYieldPercent > 0 ? '+' : ''}{displayedResult.secondaryYieldPercent}%
                  {'secondaryValueImpact' in displayedResult && (
                    <span className="value-impact"> ({formatValueImpact(displayedResult.secondaryValueImpact as number)})</span>
                  )}
                </span>
              </div>
            )}
            {selectedMaterial && secondaryMaterial && (
              <div className={`result-yield combined ${displayedResult.combinedYieldPercent > 0 ? 'positive' : displayedResult.combinedYieldPercent < 0 ? 'negative' : ''}`}>
                <span className="detail-label">Combined:</span>
                <span className="detail-value">
                  {displayedResult.combinedYieldPercent > 0 ? '+' : ''}{displayedResult.combinedYieldPercent}%
                  {'combinedValueImpact' in displayedResult && (
                    <span className="value-impact"> ({formatValueImpact(displayedResult.combinedValueImpact as number)})</span>
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

      {/* Priority Balance Slider (Optimal mode only) */}
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

      {/* Material Selectors */}
      <div className="material-selectors">
        <div className="form-group">
          <label>Primary Material {needsMaterial && !selectedMaterial && <span className="required">*</span>}</label>
          <select
            value={selectedMaterial}
            onChange={(e) => {
              const newPrimary = e.target.value;
              setSelectedMaterial(newPrimary);
              setSelectedAlternativeId(null); // Clear selection when material changes
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
          <label>Secondary Material <span className="optional">(optional)</span></label>
          <select
            value={secondaryMaterial}
            onChange={(e) => {
              setSecondaryMaterial(e.target.value);
              setSelectedAlternativeId(null); // Clear selection when material changes
            }}
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

      {/* Cargo Mix Slider (when secondary material selected) */}
      {secondaryMaterial && (
        <div className="weight-slider">
          <label>Cargo Mix</label>
          <div className="slider-container">
            <span className="slider-label">Pri {Math.round(primaryCargoWeight * 100)}%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={primaryMix}
              onChange={(e) => setPrimaryMix(parseFloat(e.target.value))}
            />
            <span className="slider-label">Sec {Math.round(secondaryCargoWeight * 100)}%</span>
          </div>
        </div>
      )}

      {/* Laranite Warning */}
      {selectedMaterial === 'laranite' && (
        <div className="material-warning">
          <span className="warning-icon">⚠</span>
          <span><strong>WARNING:</strong> Laranite is for Losers!!!</span>
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
              {/* Column Headers */}
              {selectedMaterial && (
                <div className="alternatives-header">
                  <span className="alt-name-header">Station</span>
                  {hasPosition && <span className="alt-distance-header">Dist</span>}
                  <span className="alt-yield-header">Pri</span>
                  {secondaryMaterial && <span className="alt-yield-header">Sec</span>}
                  {secondaryMaterial && <span className="alt-value-header">/SCU</span>}
                </div>
              )}
              {alternatives.map((result) => (
                <div
                  key={result.refinery.id}
                  className="alternative-item clickable"
                  onClick={() => setSelectedAlternativeId(result.refinery.id)}
                  title="Click to select this refinery"
                >
                  <span className="alt-name">{result.location.shortName}</span>
                  {hasPosition && (
                    <span className="alt-distance">{formatPolarDistance(result.distanceGm)}</span>
                  )}
                  {selectedMaterial && (
                    <span className={`alt-yield ${result.yieldPercent > 0 ? 'positive' : result.yieldPercent < 0 ? 'negative' : ''}`}>
                      {result.yieldPercent > 0 ? '+' : ''}{result.yieldPercent}%
                    </span>
                  )}
                  {secondaryMaterial && (
                    <span className={`alt-yield ${result.secondaryYieldPercent > 0 ? 'positive' : result.secondaryYieldPercent < 0 ? 'negative' : ''}`}>
                      {result.secondaryYieldPercent > 0 ? '+' : ''}{result.secondaryYieldPercent}%
                    </span>
                  )}
                  {secondaryMaterial && 'combinedValueImpact' in result && (
                    <span className={`alt-value ${(result.combinedValueImpact as number) > 0 ? 'positive' : (result.combinedValueImpact as number) < 0 ? 'negative' : ''}`}>
                      {formatValueImpact(result.combinedValueImpact as number)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
