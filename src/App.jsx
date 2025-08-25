import React, { useState } from 'react'
import Landing from './components/Landing'
import VitalsDashboard from './components/VitalsDashboard'
import VitalsChart from './components/VitalsChart'
import RiskAlert from './components/RiskAlert'
import CameraHeartRate from './components/CameraHeartRate'
import SimpleCameraTest from './components/SimpleCameraTest'
import BasicCameraTest from './components/BasicCameraTest'
import SuperSimpleHeartRate from './components/SuperSimpleHeartRate'
import DebugCameraTest from './components/DebugCameraTest'
import { useVitalsData } from './hooks/useVitalsData'

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [realHeartRate, setRealHeartRate] = useState(null)
  const { vitalsData, riskLevel, isLoading, updateVitalsFromCamera } = useVitalsData()

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

                {/* Debug Camera Test - Use this to troubleshoot! */}
                <DebugCameraTest />

                {/* Super Simple Heart Rate - Try this first! */}
                <SuperSimpleHeartRate onHeartRateDetected={handleHeartRateDetected} />

                {/* Basic Camera Test - Start here */}
                <BasicCameraTest />

                {/* Simple Camera Test - Try this first */}
                <SimpleCameraTest onHeartRateDetected={handleHeartRateDetected} />

                {/* Advanced Camera Heart Rate Detection */}
                <CameraHeartRate onHeartRateDetected={handleHeartRateDetected} />
              </div>

              {/* Chart */}
              <div className="lg:col-span-1">
                <VitalsChart vitalsData={vitalsData} />
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
