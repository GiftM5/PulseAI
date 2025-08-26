import React from 'react'

const ReportButton = ({ vitals, scenarioRef, riskLevel }) => {
	const generate = async () => {
		try {
			const { default: jsPDF } = await import('jspdf')
			const doc = new jsPDF()
			const now = new Date()
			doc.setFontSize(18)
			doc.text('PulseAI Demo Report', 14, 20)
			doc.setFontSize(11)
			doc.text(`Generated: ${now.toLocaleString()}`, 14, 28)
			doc.text(`Scenario: ${scenarioRef?.current || 'none'}`, 14, 36)
			doc.text(`Risk: ${riskLevel}`, 14, 44)
			doc.setDrawColor(200)
			doc.line(14, 48, 196, 48)

			doc.setFontSize(14)
			doc.text('Vitals', 14, 60)
			doc.setFontSize(12)
			doc.text(`Heart Rate: ${vitals?.heartRate ?? '-'} BPM`, 14, 70)
			doc.text(`SpO₂: ${vitals?.spo2 ?? '-'} %`, 14, 78)
			doc.text(`HRV: ${vitals?.hrv ?? '-'} ms`, 14, 86)
			doc.text(`Timestamp: ${vitals?.timestamp ? new Date(vitals.timestamp).toLocaleString() : now.toLocaleString()}`, 14, 94)

			doc.setFontSize(14)
			doc.text('Notes', 14, 110)
			doc.setFontSize(11)
			doc.text('This report summarizes the current simulated vitals and scenario for demo purposes.', 14, 120, { maxWidth: 180 })

			doc.save(`PulseAI_Report_${now.getTime()}.pdf`)
		} catch (e) {
			console.error('Failed to generate PDF:', e)
		}
	}
	return (
		<button onClick={generate} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">
			📄 Generate PDF Report
		</button>
	)
}

export default ReportButton