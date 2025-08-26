import React, { useState } from 'react'
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
import { useVitalsData } from './hooks/useVitalsData'

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [realHeartRate, setRealHeartRate] = useState(null)
  const { vitalsData, riskLevel, isLoading, updateVitalsFromCamera, triggerScenario, resetScenario, currentScenario } = useVitalsData()

  const handleHeartRateDetected = (heartRate) => {
    setRealHeartRate(heartRate)
    updateVitalsFromCamera(heartRate)
    console.log('Real heart rate detected:', heartRate)
  }

  return (
    <div className="min-h-screen gradient-bg">
      {riskLevel && riskLevel !== 'low' && (
        <RiskAlert riskLevel={riskLevel} />
      )}
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {currentView === 'landing' && (
          <Landing onGetStarted={() => setCurrentView('dashboard')} onOpenClinic={() => setCurrentView('clinic')} />
        )}
        
        {currentView === 'clinic' && (
          <ErrorBoundary>
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold neon-text">AI Clinic</h1>
                <p className="text-dark-300 text-lg max-w-2xl mx-auto">Digital reception, triage and navigation</p>
              </div>
              <AIClinic />
              <div className="flex justify-center mt-8">
                <button onClick={() => setCurrentView('landing')} className="glass-card px-6 py-3 rounded-lg hover-glow transition-all duration-300 text-primary-400 hover:text-primary-300">← Back</button>
              </div>
            </div>
          </ErrorBoundary>
        )}
        
        {currentView === 'dashboard' && (
          <ErrorBoundary>
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold neon-text">
                  PulseAI Dashboard
                </h1>
                <p className="text-dark-300 text-lg max-w-2xl mx-auto">
                  Real-time health monitoring with AI-powered insights
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <VitalsDashboard vitalsData={vitalsData} isLoading={isLoading} />
                  <WorkingHeartRate onHeartRateDetected={handleHeartRateDetected} />
                  <SimulationControls onAnxiety={(sec) => triggerScenario('anxiety', sec)} onLowSpO2={(sec) => triggerScenario('low_spo2', sec)} onReset={() => resetScenario()} />
                  <AutoDemoControls onTrigger={(scenario, sec) => triggerScenario(scenario, sec)} onReset={() => resetScenario()} />
                  <div>
                    <ReportButton vitals={vitalsData} scenarioRef={currentScenario} riskLevel={riskLevel} />
                  </div>
                </div>
                <div className="lg:col-span-1 space-y-8">
                  <VitalsChart vitalsData={vitalsData} />
                  <RespiratoryRateSimulator />
                </div>
              </div>
              <div className="flex justify-center mt-12">
                <button onClick={() => setCurrentView('landing')} className="glass-card px-6 py-3 rounded-lg hover-glow transition-all duration-300 text-primary-400 hover:text-primary-300">← Back to Home</button>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </div>
    </div>
  )
}

export default App
