import { useState } from 'react'
import './App.css'

// Placeholder - will be replaced with actual components
function App() {
  const [activeTab, setActiveTab] = useState<'route' | 'whereami' | 'refinery'>('route')

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Band Hopper</h1>
            <span className="subtitle">Aaron Halo Mining Navigator</span>
          </div>
          <span className="version">v1.1.0</span>
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

            <div className="form-group">
              <label>Start Location</label>
              <select>
                <option value="">Select start...</option>
                <option value="arc-l1">ARC-L1 Wide Forest Station</option>
                <option value="hur-l2">HUR-L2 Faithful Dream Station</option>
                <option value="cru-l1">CRU-L1 Ambitious Dream Station</option>
              </select>
            </div>

            <div className="form-group">
              <label>Destination</label>
              <select>
                <option value="">Select destination...</option>
                <option value="hur-l5">HUR-L5 High Course Station</option>
                <option value="cru-l4">CRU-L4 Shallow Fields Station</option>
                <option value="arc-l3">ARC-L3 Modern Express Station</option>
              </select>
            </div>

            {/* Placeholder for results */}
            <div className="display-label">Exit Distance to Band 5</div>
            <div className="display-large">14,292,609 km</div>
          </div>
        )}

        {activeTab === 'whereami' && (
          <div className="panel">
            <h2>Where Am I?</h2>
            <p className="text-muted">Enter your current distance to the Stanton marker to find your position in the Aaron Halo.</p>

            <div className="form-group">
              <label>Distance to Stanton (km)</label>
              <input type="number" placeholder="e.g., 20300000" />
            </div>

            <div className="display-label">Current Position</div>
            <div className="display-large text-success">Band 5</div>
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
