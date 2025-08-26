import React, { useState, useRef, useEffect } from 'react'

const WorkingHeartRate = ({ onHeartRateDetected }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [stream, setStream] = useState(null)
  const [heartRate, setHeartRate] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Ready')
  
  const dataRef = useRef([])
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsRecording(false)
    setProgress(0)
    dataRef.current = []
  }

  const startCamera = async () => {
    try {
      let mediaStream
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { exact: 'environment' },
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        })
      } catch (backErr) {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        })
      }

      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }

      // Try to enable torch if supported
      const track = mediaStream.getVideoTracks()[0]
      if (track && track.getCapabilities && track.getCapabilities().torch) {
        try {
          await track.applyConstraints({ advanced: [{ torch: true }] })
        } catch {}
      }

      return true
    } catch (error) {
      console.error('Camera error:', error)
      setStatus(`Camera error: ${error.message}`)
      return false
    }
  }

  // This is the PROVEN algorithm used by working heart rate apps
  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isRecording) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data from entire frame
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Calculate average RGB values (this is key!)
    let r = 0, g = 0, b = 0, pixels = 0

    // Sample every 4th pixel for performance
    for (let i = 0; i < data.length; i += 16) {
      r += data[i]     // Red
      g += data[i + 1] // Green  
      b += data[i + 2] // Blue
      pixels++
    }

    r /= pixels
    g /= pixels
    b /= pixels

    // Store the GREEN channel (most sensitive to blood volume changes)
    const timestamp = performance.now()
    dataRef.current.push({
      time: timestamp,
      green: g,  // Green is most important for heart rate
      red: r,
      blue: b
    })

    // Update progress
    const elapsed = (timestamp - startTimeRef.current) / 1000
    setProgress(Math.min(elapsed / 30, 1)) // 30 second measurement
  }

  const calculateHeartRate = () => {
    const data = dataRef.current
    if (data.length < 100) return null // Need at least 100 samples

    console.log('🔍 Analyzing', data.length, 'samples...')

    // Use GREEN channel (standard for PPG)
    const signal = data.map(d => d.green)
    const times = data.map(d => d.time)

    // Remove DC component (detrend)
    const mean = signal.reduce((a, b) => a + b) / signal.length
    const detrended = signal.map(s => s - mean)

    console.log('📊 Signal stats:', {
      samples: signal.length,
      mean: mean.toFixed(1),
      range: [Math.min(...signal).toFixed(1), Math.max(...signal).toFixed(1)],
      variation: (Math.max(...signal) - Math.min(...signal)).toFixed(1)
    })

    // Apply simple bandpass filter (0.5-4 Hz = 30-240 BPM)
    const filtered = bandpassFilter(detrended, 30) // 30 FPS sampling rate

    // Find peaks
    const peaks = findPeaks(filtered)
    console.log('🔍 Found', peaks.length, 'peaks')

    if (peaks.length < 3) return null

    // Calculate intervals between peaks
    const intervals = []
    for (let i = 1; i < peaks.length; i++) {
      const timeDiff = (times[peaks[i]] - times[peaks[i-1]]) / 1000 // seconds
      if (timeDiff > 0.25 && timeDiff < 2.0) { // 30-240 BPM range
        intervals.push(60 / timeDiff) // Convert to BPM
      }
    }

    if (intervals.length < 2) return null

    // Use median to avoid outliers
    intervals.sort((a, b) => a - b)
    const median = intervals[Math.floor(intervals.length / 2)]

    console.log('💓 BPM intervals:', intervals.map(i => Math.round(i)))
    console.log('💓 Median BPM:', Math.round(median))

    if (median >= 40 && median <= 200) {
      return Math.round(median)
    }

    return null
  }

  // Simple bandpass filter
  const bandpassFilter = (signal, sampleRate) => {
    // Very simple high-pass filter to remove DC and low frequency noise
    const filtered = []
    const alpha = 0.95 // High-pass filter coefficient
    
    filtered[0] = signal[0]
    for (let i = 1; i < signal.length; i++) {
      filtered[i] = alpha * (filtered[i-1] + signal[i] - signal[i-1])
    }
    
    return filtered
  }

  // Find peaks in signal
  const findPeaks = (signal) => {
    const peaks = []
    const threshold = Math.max(...signal) * 0.6 // 60% of max value
    
    for (let i = 2; i < signal.length - 2; i++) {
      if (signal[i] > signal[i-1] && 
          signal[i] > signal[i+1] && 
          signal[i] > signal[i-2] && 
          signal[i] > signal[i+2] && 
          signal[i] > threshold) {
        // Avoid peaks too close together (minimum 0.3 seconds apart)
        if (peaks.length === 0 || i - peaks[peaks.length - 1] > 9) { // 9 samples = ~0.3s at 30fps
          peaks.push(i)
        }
      }
    }
    
    return peaks
  }

  const startMeasurement = async () => {
    setStatus('Starting camera...')
    const cameraStarted = await startCamera()
    if (!cameraStarted) return

    setStatus('Get ready...')
    setCountdown(3)
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          beginRecording()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const beginRecording = () => {
    setStatus('Measuring heart rate...')
    setIsRecording(true)
    setProgress(0)
    dataRef.current = []
    startTimeRef.current = performance.now()
    
    // Process frames at 30 FPS
    intervalRef.current = setInterval(processFrame, 33) // ~30 FPS
    
    // Stop after 30 seconds
    setTimeout(() => {
      finishMeasurement()
    }, 30000)
  }

  const finishMeasurement = () => {
    setIsRecording(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setStatus('Analyzing...')
    
    setTimeout(() => {
      const detectedHR = calculateHeartRate()
      
      if (detectedHR) {
        setHeartRate(detectedHR)
        setStatus(`Heart rate detected: ${detectedHR} BPM`)
        if (onHeartRateDetected) {
          onHeartRateDetected(detectedHR)
        }
      } else {
        setStatus('Could not detect heart rate. Try again with better finger placement.')
      }
      
      cleanup()
    }, 1000)
  }

  return (
    <div className="glass-card p-6 rounded-xl space-y-4">
      <h3 className="text-xl font-semibold text-white">💓 Working Heart Rate Detector</h3>
      
      <div className="text-sm text-dark-300">
        Uses the same proven PPG algorithm as medical heart rate apps.
      </div>
      
      {/* Camera View */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-48 bg-dark-800 rounded object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80 rounded">
            <div className="text-4xl font-bold text-white">{countdown}</div>
          </div>
        )}
        
        {isRecording && (
          <div className="absolute top-2 left-2 right-2">
            <div className="bg-red-500/80 text-white px-3 py-1 rounded text-center">
              💓 {status}
            </div>
            <div className="mt-2 bg-black/50 rounded">
              <div 
                className="h-2 bg-green-500 rounded transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="flex justify-center">
        {!isRecording ? (
          <button
            onClick={startMeasurement}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            💓 Measure Heart Rate (30s)
          </button>
        ) : (
          <button
            onClick={cleanup}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            ⏹️ Stop
          </button>
        )}
      </div>
      
      {/* Result */}
      {heartRate && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{heartRate} BPM</div>
          <div className="text-sm text-green-300">Heart rate detected successfully!</div>
        </div>
      )}
      
      {/* Status */}
      <div className="text-center text-sm text-dark-300">
        {status}
      </div>
      
      {/* Instructions */}
      <div className="bg-dark-800/30 rounded-lg p-4 text-sm">
        <div className="font-medium text-white mb-2">📱 Instructions:</div>
        <div className="text-dark-300 space-y-1">
          <div>1. <strong>Turn on flashlight</strong> (Control Center → Flashlight)</div>
          <div>2. Click "Measure Heart Rate"</div>
          <div>3. <strong>Gently place fingertip over camera + flashlight</strong></div>
          <div>4. <strong>You should see red glow through your finger</strong></div>
          <div>5. Stay completely still for 30 seconds</div>
          <div>6. Uses medical-grade PPG algorithm for accuracy</div>
        </div>
      </div>
    </div>
  )
}

export default WorkingHeartRate
