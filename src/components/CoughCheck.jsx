import React, { useEffect, useRef, useState } from 'react'

const CoughCheck = ({ onResult }) => {
	const [recording, setRecording] = useState(false)
	const [permissionError, setPermissionError] = useState('')
	const [coughEvents, setCoughEvents] = useState(0)
	const [status, setStatus] = useState('Ready')
	const streamRef = useRef(null)
	const audioCtxRef = useRef(null)
	const sourceRef = useRef(null)
	const analyserRef = useRef(null)
	const rafRef = useRef(null)
	const refractoryUntilRef = useRef(0)

	useEffect(() => {
		return () => stop()
	}, [])

	const start = async () => {
		setPermissionError('')
		setCoughEvents(0)
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			streamRef.current = stream
			audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
			sourceRef.current = audioCtxRef.current.createMediaStreamSource(stream)
			analyserRef.current = audioCtxRef.current.createAnalyser()
			analyserRef.current.fftSize = 1024
			sourceRef.current.connect(analyserRef.current)
			setRecording(true)
			setStatus('Recording cough (10s)...')
			refractoryUntilRef.current = 0
			loop()
			setTimeout(() => finish(), 10000)
		} catch (e) {
			setPermissionError(e.message)
		}
	}

	const stop = () => {
		if (rafRef.current) cancelAnimationFrame(rafRef.current)
		rafRef.current = null
		if (sourceRef.current) {
			try { sourceRef.current.disconnect() } catch {}
		}
		if (audioCtxRef.current) {
			try { audioCtxRef.current.close() } catch {}
		}
		if (streamRef.current) {
			streamRef.current.getTracks().forEach(t => t.stop())
		}
		audioCtxRef.current = null
		sourceRef.current = null
		analyserRef.current = null
		streamRef.current = null
		setRecording(false)
	}

	const finish = () => {
		stop()
		const detected = coughEvents >= 2
		setStatus(detected ? `Cough detected (${coughEvents} events)` : 'No cough detected')
		if (onResult) onResult({ coughDetected: detected, coughEvents })
	}

	const loop = () => {
		const analyser = analyserRef.current
		if (!analyser) return
		const bufferLen = analyser.fftSize
		const data = new Uint8Array(bufferLen)
		analyser.getByteTimeDomainData(data)
		// Compute RMS energy (0..1)
		let sum = 0
		for (let i = 0; i < bufferLen; i++) {
			const centered = (data[i] - 128) / 128
			sum += centered * centered
		}
		const rms = Math.sqrt(sum / bufferLen)
		const now = performance.now()
		// Threshold & refractory (~500ms)
		const threshold = 0.085 // tweakable sensitivity
		if (rms > threshold && now > refractoryUntilRef.current) {
			setCoughEvents(prev => prev + 1)
			refractoryUntilRef.current = now + 500
		}
		rafRef.current = requestAnimationFrame(loop)
	}

	return (
		<div className="glass-card p-6 rounded-xl space-y-3">
			<h3 className="text-xl font-semibold text-white">🗣️ Cough Check</h3>
			<p className="text-dark-300 text-sm">Record 10s. Keep 10–20 cm from mouth in a quiet room.</p>
			<div className="flex items-center gap-3">
				{!recording ? (
					<button onClick={start} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Record (10s)</button>
				) : (
					<button onClick={finish} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Stop</button>
				)}
				<div className="text-sm text-dark-300">Events: {coughEvents}</div>
			</div>
			{permissionError && <div className="text-red-400 text-sm">Mic error: {permissionError}</div>}
			<div className="text-sm text-dark-300">{status}</div>
		</div>
	)
}

export default CoughCheck