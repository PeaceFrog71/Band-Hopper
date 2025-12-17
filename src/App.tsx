import { useState, useMemo } from 'react'
import './App.css'
import pfLogo from './assets/PFlogo.png'
import { RoutePlanner } from './components/RoutePlanner'
import { analyzePosition, parseDistance, formatDistance } from './utils/calculator'
import { HALO_INNER_EDGE, HALO_OUTER_EDGE } from './types/bands'

const version = '1.2.0'

function App() {
  const [activeTab, setActiveTab] = useState<'route' | 'whereami' | 'refinery'>('route')
  const [distanceInput, setDistanceInput] = useState<string>('')

  // Analyze position when input changes
  const positionAnalysis = useMemo(() => {
    if (!distanceInput.trim()) return null;

    // Try parsing the input
    const distance = parseDistance(distanceInput);
    if (distance === null || distance <= 0) return null;

    return analyzePosition(distance);
  }, [distanceInput]);

  return (
    <div className="app">
      <header className="app-header">
        <a href="https://peacefroggaming.com" target="_blank" rel="noopener noreferrer" title="PeaceFrog Gaming">
          <img src={pfLogo} alt="PeaceFrog Gaming" className="header-logo" />
        </a>
        <div className="header-title">
          <h1>Band Hopper</h1>
          <span className="subtitle">Aaron Halo Mining Navigator</span>
          <span className="version">v{version}</span>
        </div>
      </header>

      <main className="app-content">
        {/* Tab Navigation */}
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'route' ? 'active' : ''}`}
            onClick={() => setActiveTab('route')}
          >
            Route Planner
          </button>
          <button
            className={`tab-btn ${activeTab === 'whereami' ? 'active' : ''}`}
            onClick={() => setActiveTab('whereami')}
          >
            Where Am I?
          </button>
          <button
            className={`tab-btn ${activeTab === 'refinery' ? 'active' : ''}`}
            onClick={() => setActiveTab('refinery')}
          >
            Refinery Finder
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'route' && (
          <div className="panel">
            <h2>Route Planner</h2>
            <p className="text-muted">Select your start and destination to calculate exit distances for each Aaron Halo band.</p>
            <RoutePlanner />
          </div>
        )}

        {activeTab === 'whereami' && (
          <div className="panel">
            <h2>Where Am I?</h2>
            <p className="text-muted">Enter your current distance to the Stanton marker to find your position in the Aaron Halo.</p>

            <div className="form-group">
              <label>Distance to Stanton (km)</label>
              <input
                type="text"
                placeholder="e.g., 20300000 or 20.3M"
                value={distanceInput}
                onChange={(e) => setDistanceInput(e.target.value)}
              />
              <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                Accepts: plain numbers, "20.3M km", or "20300K"
              </span>
            </div>

            {positionAnalysis && (
              <div className="position-results">
                <div className="display-label">Current Position</div>
                <div className={`display-large ${positionAnalysis.isInHalo ? 'text-success' : 'text-warning'}`}>
                  {positionAnalysis.currentBand
                    ? positionAnalysis.currentBand.name
                    : positionAnalysis.isInHalo
                      ? 'Between Bands'
                      : 'Outside Halo'}
                </div>

                <div className="position-details">
                  <p>{positionAnalysis.positionDescription}</p>

                  {positionAnalysis.currentBand && (
                    <div className="band-info">
                      <span className="info-label">Band Range:</span>
                      <span className="info-value">
                        {formatDistance(positionAnalysis.currentBand.innerDistance)} - {formatDistance(positionAnalysis.currentBand.outerDistance)}
                      </span>
                    </div>
                  )}

                  {positionAnalysis.currentBand && (
                    <div className="band-info">
                      <span className="info-label">Density:</span>
                      <span className="info-value">
                        {Math.round(positionAnalysis.currentBand.relativeDensity * 100)}%
                      </span>
                    </div>
                  )}

                  {!positionAnalysis.isInHalo && (
                    <div className="halo-range-hint">
                      <span className="info-label">Aaron Halo Range:</span>
                      <span className="info-value">
                        {formatDistance(HALO_INNER_EDGE)} - {formatDistance(HALO_OUTER_EDGE)}
                      </span>
                    </div>
                  )}

                  {positionAnalysis.nearbyBands.length > 0 && !positionAnalysis.currentBand && (
                    <div className="nearby-bands">
                      <span className="info-label">Closest Band:</span>
                      <span className="info-value">
                        {positionAnalysis.closestBand.name} ({formatDistance(positionAnalysis.distanceToClosestBand)} away)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!positionAnalysis && distanceInput.trim() && (
              <div className="text-warning" style={{ textAlign: 'center', padding: '1rem' }}>
                Enter a valid distance (e.g., 20300000 or 20.3M)
              </div>
            )}

            {!distanceInput.trim() && (
              <div className="placeholder-message">
                Enter your distance to Stanton to see your position in the Aaron Halo.
              </div>
            )}
          </div>
        )}

        {activeTab === 'refinery' && (
          <div className="panel">
            <h2>Refinery Finder</h2>
            <p className="text-muted">Find the best refinery based on your mined material and location.</p>

            <div className="form-group">
              <label>Material Mined</label>
              <select>
                <option value="">Select material...</option>
                <option value="quantanium">Quantanium</option>
                <option value="agricium">Agricium</option>
                <option value="laranite">Laranite</option>
                <option value="bexalite">Bexalite</option>
              </select>
            </div>

            <div className="display-label">Recommended Refinery</div>
            <div className="display-large">ARC-L1</div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Data source: <a href="https://cstone.space/resources/knowledge-base/36" target="_blank" rel="noopener noreferrer">CaptSheppard's Aaron Halo Travel Routes</a>
        </p>
        <p>Made by <a href="https://peacefroggaming.com" target="_blank" rel="noopener noreferrer">PeaceFrog Gaming</a></p>
      </footer>
    </div>
  )
}

export default App
