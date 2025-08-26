import React, { useState } from 'react'
import Landing from './components/Landing'
import VitalsDashboard from './components/VitalsDashboard'
import VitalsChart from './components/VitalsChart'
import RiskAlert from './components/RiskAlert'
import WorkingHeartRate from './components/WorkingHeartRate'
import SimulationControls from './components/SimulationControls'
import RespiratoryRateSimulator from './components/RespiratoryRateSimulator'
import { useVitalsData } from './hooks/useVitalsData'

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [realHeartRate, setRealHeartRate] = useState(null)
  const { vitalsData, riskLevel, isLoading, updateVitalsFromCamera, triggerScenario, resetScenario } = useVitalsData()

  const handleHeartRateDetected = (heartRate) => {
    setRealHeartRate(heartRate)
    updateVitalsFromCamera(heartRate) // Update dashboard with real data
    console.log('Real heart rate detected:', heartRate)
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Risk Alert - shows at top when risk is detected */}
      {riskLevel && riskLevel !== 'low' && (
        <RiskAlert riskLevel={riskLevel} />
      )}
      
      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {currentView === 'landing' && (
          <Landing onGetStarted={() => setCurrentView('dashboard')} />
        )}
        
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold neon-text">
                PulseAI Dashboard
              </h1>
              <p className="text-dark-300 text-lg max-w-2xl mx-auto">
                Real-time health monitoring with AI-powered insights
              </p>
            </div>
            
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Vitals Cards */}
              <div className="lg:col-span-2 space-y-8">
                <VitalsDashboard vitalsData={vitalsData} isLoading={isLoading} />

                {/* Single Heart Rate Component (with Simulation option) */}
                <WorkingHeartRate onHeartRateDetected={handleHeartRateDetected} />

                {/* Scenario Controls */}
                <SimulationControls
                  onAnxiety={(sec) => triggerScenario('anxiety', sec)}
                  onLowSpO2={(sec) => triggerScenario('low_spo2', sec)}
                  onReset={() => resetScenario()}
                />
              </div>

              {/* Chart + Breathing */}
              <div className="lg:col-span-1 space-y-8">
                <VitalsChart vitalsData={vitalsData} />
                <RespiratoryRateSimulator />
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setCurrentView('landing')}
                className="glass-card px-6 py-3 rounded-lg hover-glow transition-all duration-300 text-primary-400 hover:text-primary-300"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
