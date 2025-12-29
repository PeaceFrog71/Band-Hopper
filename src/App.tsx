import { useState } from 'react'
import './App.css'
import pfLogo from './assets/PFlogo.png'
import { RoutePlanner } from './components/RoutePlanner'
import { WhereAmI } from './components/WhereAmI'

const version = '1.4.1'

function App() {
  const [activeTab, setActiveTab] = useState<'route' | 'whereami' | 'refinery'>('route')

  // Lifted route state - persists across tab switches
  const [startId, setStartId] = useState<string>('')
  const [destinationId, setDestinationId] = useState<string>('')

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
            <RoutePlanner
              startId={startId}
              destinationId={destinationId}
              onStartChange={setStartId}
              onDestinationChange={setDestinationId}
            />
          </div>
        )}

        {activeTab === 'whereami' && (
          <div className="panel">
            <h2>Where Am I?</h2>
            <p className="text-muted">Enter your distance to Stanton to identify which Aaron Halo band you're in.</p>
            <WhereAmI />
          </div>
        )}

        {activeTab === 'refinery' && (
          <div className="panel panel-not-implemented">
            <div className="not-implemented-stamp">Coming Soon</div>
            <h2>Refinery Finder</h2>
            <p className="text-muted">Find the best refinery based on your mined material and location.</p>

            <div className="form-group">
              <label>Material Mined</label>
              <select disabled>
                <option value="">Select material...</option>
                <option value="quantanium">Quantanium</option>
                <option value="agricium">Agricium</option>
                <option value="laranite">Laranite</option>
                <option value="bexalite">Bexalite</option>
              </select>
            </div>

            <div className="display-label">Recommended Refinery</div>
            <div className="display-large">---</div>
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
