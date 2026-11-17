import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Landing from './components/Landing'
import VitalsDashboard from './components/VitalsDashboard'
import VitalsChart from './components/VitalsChart'
import RiskAlert from './components/RiskAlert'
import WorkingHeartRate from './components/WorkingHeartRate'
import SimulationControls from './components/SimulationControls'
import RespiratoryRateSimulator from './components/RespiratoryRateSimulator'
import AutoDemoControls from './components/AutoDemoControls'
import ReportButton from './components/ReportButton'
import ErrorBoundary from './components/ErrorBoundary'
import AIClinic from './components/AIClinic'
import LearnMore from './components/LearnMore'
import Login from './components/Login'
import { useVitalsData } from './hooks/useVitalsData'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

function NavBar({ currentView, user, onNav, onLogout }) {
  const navItems = [
    { id: 'landing', label: 'Home' },
    { id: 'clinic', label: 'AI Clinic', protected: true },
    { id: 'dashboard', label: 'Dashboard', protected: true },
    { id: 'learn', label: 'Learn More' },
  ]

  return (
    <nav className="nav-bar">
      <button onClick={() => onNav('landing')} className="flex items-center gap-2 group">
        <img src="/pulse-icon.svg" alt="PulseAI" className="w-7 h-7" />
        <span className="font-bold text-white tracking-tight text-lg">PulseAI</span>
      </button>

      <div className="hidden md:flex items-center gap-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => item.protected && !user ? onNav('login') : onNav(item.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentView === item.id
                ? 'bg-white/10 text-white'
                : 'text-dark-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-xs text-dark-400 hidden sm:block">{user.phone}</span>
            <button onClick={onLogout} className="btn-ghost text-sm py-2 px-4">
              Sign out
            </button>
          </div>
        ) : (
          <button onClick={() => onNav('login')} className="btn-primary text-sm py-2 px-5">
            Sign in
          </button>
        )}
      </div>
    </nav>
  )
}

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [user, setUser] = useState(null)
  const [realHeartRate, setRealHeartRate] = useState(null)
  const { vitalsData, riskLevel, isLoading, updateVitalsFromCamera, triggerScenario, resetScenario, currentScenario } = useVitalsData()

  const handleNav = (view) => setCurrentView(view)

  const handleLogin = (u) => {
    setUser(u)
    setCurrentView(u._redirect || 'clinic')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('landing')
  }

  const handleHeartRateDetected = (hr) => {
    setRealHeartRate(hr)
    updateVitalsFromCamera(hr)
  }

  // Protected route guard
  const requireAuth = (view) => {
    if (!user) {
      setCurrentView('login')
      return false
    }
    setCurrentView(view)
    return true
  }

  return (
    <div className="gradient-bg min-h-screen">
      {riskLevel && riskLevel !== 'low' && <RiskAlert riskLevel={riskLevel} />}

      <NavBar
        currentView={currentView}
        user={user}
        onNav={(view) => {
          const protectedViews = ['clinic', 'dashboard']
          if (protectedViews.includes(view) && !user) {
            // Store intended destination
            setCurrentView('login')
          } else {
            setCurrentView(view)
          }
        }}
        onLogout={handleLogout}
      />

      <div className="page-container max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {currentView === 'landing' && (
            <motion.div key="landing" {...pageVariants}>
              <Landing
                onGetStarted={() => requireAuth('dashboard')}
                onOpenClinic={() => requireAuth('clinic')}
                onOpenLearn={() => setCurrentView('learn')}
                onOpenLogin={() => setCurrentView('login')}
                user={user}
              />
            </motion.div>
          )}

          {currentView === 'learn' && (
            <motion.div key="learn" {...pageVariants}>
              <ErrorBoundary>
                <LearnMore onBack={() => setCurrentView('landing')} />
              </ErrorBoundary>
            </motion.div>
          )}

          {currentView === 'login' && (
            <motion.div key="login" {...pageVariants}>
              <ErrorBoundary>
                <Login
                  onLogin={handleLogin}
                  onBack={() => setCurrentView('landing')}
                />
              </ErrorBoundary>
            </motion.div>
          )}

          {currentView === 'clinic' && user && (
            <motion.div key="clinic" {...pageVariants}>
              <ErrorBoundary>
                <div className="space-y-8">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">AI Clinic</h1>
                    <p className="text-dark-400 text-sm">Digital reception, symptom checking and navigation</p>
                  </div>
                  <AIClinic />
                </div>
              </ErrorBoundary>
            </motion.div>
          )}

          {currentView === 'dashboard' && user && (
            <motion.div key="dashboard" {...pageVariants}>
              <ErrorBoundary>
                <div className="space-y-8">
                  <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-dark-400 text-sm">Real-time health monitoring with AI-powered insights</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <VitalsDashboard vitalsData={vitalsData} isLoading={isLoading} />
                      <WorkingHeartRate onHeartRateDetected={handleHeartRateDetected} />
                      <SimulationControls
                        onAnxiety={(sec) => triggerScenario('anxiety', sec)}
                        onLowSpO2={(sec) => triggerScenario('low_spo2', sec)}
                        onReset={resetScenario}
                      />
                      <AutoDemoControls
                        onTrigger={(scenario, sec) => triggerScenario(scenario, sec)}
                        onReset={resetScenario}
                      />
                      <ReportButton vitals={vitalsData} scenarioRef={currentScenario} riskLevel={riskLevel} />
                    </div>
                    <div className="lg:col-span-1 space-y-8">
                      <VitalsChart vitalsData={vitalsData} />
                      <RespiratoryRateSimulator />
                    </div>
                  </div>
                </div>
              </ErrorBoundary>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
