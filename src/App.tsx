import { useState, useEffect } from 'react'
import './App.css'
import pfLogo from './assets/PFlogo.png'
import { RoutePlanner } from './components/RoutePlanner'
import { WhereAmI } from './components/WhereAmI'
import { RefineryFinder } from './components/RefineryFinder'
import UserMenu from './components/UserMenu'
import AuthModal from './components/AuthModal'
import { useAuth } from './contexts/AuthContext'

const version = __APP_VERSION__

// Help text for each tab
const helpText: Record<string, string> = {
  route: 'Select your start, desired Halo band and target destination to calculate exit distances.',
  whereami: 'Enter your coordinates from the star map to identify your position in the Aaron Halo.',
  refinery: 'Find the best refinery based on your mined material and location.'
}

function App() {
  const [activeTab, setActiveTab] = useState<'route' | 'whereami' | 'refinery'>('route')
  const [showHelp, setShowHelp] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { isConfigured } = useAuth()

  // Lifted route state - persists across tab switches
  const [startId, setStartId] = useState<string>('')
  const [destinationId, setDestinationId] = useState<string>('')
  const [selectedBandId, setSelectedBandId] = useState<number | null>(null)

  // Lifted Where Am I state - used by both WhereAmI and RefineryFinder
  const [whereAmIDistance, setWhereAmIDistance] = useState<string>('')
  const [whereAmIAngle, setWhereAmIAngle] = useState<string>('')
  const [showWhereAmIHelp, setShowWhereAmIHelp] = useState(false)

  // Swap start and destination
  const handleSwapRoute = () => {
    const tempStart = startId
    setStartId(destinationId)
    setDestinationId(tempStart)
  }

  // Close help modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showHelp) {
        setShowHelp(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showHelp])

  return (
    <div className={`app app-bg-${activeTab}`}>
      <header className="app-header">
        <a href="https://peacefroggaming.com" target="_blank" rel="noopener noreferrer" title="PeaceFrog Gaming">
          <img src={pfLogo} alt="PeaceFrog Gaming" className="header-logo" />
        </a>
        <div className="header-title">
          <h1>Band Hopper</h1>
          <span className="subtitle">Aaron Halo Mining Navigator</span>
          <span className="version">v{version}</span>
          <a
            href="https://forms.gle/xbCK6DF3iYUHW6Hn6"
            target="_blank"
            rel="noopener noreferrer"
            className="feedback-link"
          >
            Bug Report / Feature Requests / Feedback
          </a>
        </div>
        <div className="header-actions">
          {isConfigured && (
            <UserMenu onSignInClick={() => setShowAuthModal(true)} />
          )}
          <a
            href="https://ko-fi.com/peacefroggaming"
            target="_blank"
            rel="noopener noreferrer"
            className="kofi-link"
          >
            <img src="/rieger-icon.png" alt="" />
            <span>Support on Ko-fi</span>
          </a>
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

        {/* Tab Content - Using CSS display to keep components mounted and preserve state */}
        <div className="panel" style={{ display: activeTab === 'route' ? 'block' : 'none' }}>
          <div className="panel-header">
            <h2>Route Planner</h2>
            <button
              className="help-icon-header"
              onClick={() => setShowHelp(true)}
              type="button"
              aria-label="Help"
            >
              ?
            </button>
          </div>
          <p className="text-muted">Select your start, desired Halo band and target destination to calculate exit distances.</p>
          <RoutePlanner
            startId={startId}
            destinationId={destinationId}
            selectedBandId={selectedBandId}
            onStartChange={setStartId}
            onDestinationChange={setDestinationId}
            onSelectedBandChange={setSelectedBandId}
            onSwapRoute={handleSwapRoute}
          />
        </div>

        <div className="panel" style={{ display: activeTab === 'whereami' ? 'block' : 'none' }}>
          <div className="panel-header">
            <h2>Where Am I?</h2>
            <button
              className="help-icon-header"
              onClick={() => setShowWhereAmIHelp(true)}
              type="button"
              aria-label="How to find your coordinates"
            >
              ?
            </button>
          </div>
          <p className="text-muted">Enter your coordinates from the star map to identify your position.</p>
          <WhereAmI
            distanceGm={whereAmIDistance}
            angleTheta={whereAmIAngle}
            showHelp={showWhereAmIHelp}
            onDistanceChange={setWhereAmIDistance}
            onAngleChange={setWhereAmIAngle}
            onShowHelpChange={setShowWhereAmIHelp}
          />
        </div>

        <div className="panel" style={{ display: activeTab === 'refinery' ? 'block' : 'none' }}>
          <div className="panel-header">
            <h2>Refinery Finder</h2>
            <button
              className="help-icon-header"
              onClick={() => setShowHelp(true)}
              type="button"
              aria-label="Help"
            >
              ?
            </button>
          </div>
          <p className="text-muted">Find the best refinery based on your mined material and location.</p>
          <RefineryFinder
            startId={startId}
            destinationId={destinationId}
            selectedBandId={selectedBandId}
            whereAmIDistance={whereAmIDistance}
            whereAmIAngle={whereAmIAngle}
          />
        </div>

        {/* Help Modal - Mobile only */}
        {showHelp && (
          <div className="help-modal-overlay" onClick={() => setShowHelp(false)} role="presentation">
            <div className="help-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
              <button className="help-modal-close" onClick={() => setShowHelp(false)} aria-label="Close">×</button>
              <h3 id="help-modal-title">Help</h3>
              <p>{helpText[activeTab]}</p>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Data source: <a href="https://cstone.space/resources/knowledge-base/36" target="_blank" rel="noopener noreferrer">CaptSheppard's Aaron Halo Travel Routes</a>
        </p>
        <p>Made by <a href="https://peacefroggaming.com" target="_blank" rel="noopener noreferrer">PeaceFrog Gaming</a></p>
        <a
          href="https://ko-fi.com/peacefroggaming"
          target="_blank"
          rel="noopener noreferrer"
          className="kofi-link-mobile"
        >
          Support on Ko-fi
        </a>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  )
}

export default App
