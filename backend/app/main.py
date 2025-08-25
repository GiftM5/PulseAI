from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List
import asyncio
from datetime import datetime, timedelta
import logging

from .models import (
    VitalSigns, VitalsResponse, HealthRiskAssessment, 
    HistoricalData, UserProfile, MonitoringSession,
    AlertConfiguration, RiskLevel
)
from .vitals_simulator import VitalsSimulator
from .risk_assessment import AIRiskAssessment

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="PulseAI Backend API",
    description="AI-powered health monitoring backend for real-time vital signs tracking",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.0.174:3000",  # Your local network IP
        "*"  # Allow all origins for mobile testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
vitals_simulator: Optional[VitalsSimulator] = None
risk_assessor: Optional[AIRiskAssessment] = None
current_session: Optional[MonitoringSession] = None
user_profile: Optional[UserProfile] = None

def get_vitals_simulator() -> VitalsSimulator:
    """Dependency to get or create vitals simulator"""
    global vitals_simulator
    if vitals_simulator is None:
        vitals_simulator = VitalsSimulator(user_profile)
    return vitals_simulator

def get_risk_assessor() -> AIRiskAssessment:
    """Dependency to get or create risk assessor"""
    global risk_assessor
    if risk_assessor is None:
        risk_assessor = AIRiskAssessment(user_profile)
    return risk_assessor

@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    logger.info("PulseAI Backend API starting up...")
    global vitals_simulator, risk_assessor
    vitals_simulator = VitalsSimulator()
    risk_assessor = AIRiskAssessment()
    logger.info("PulseAI Backend API ready!")

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "PulseAI Backend API",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "endpoints": {
            "vitals": "/api/vitals",
            "historical": "/api/vitals/historical",
            "risk": "/api/risk",
            "profile": "/api/profile",
            "session": "/api/session"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "vitals_simulator": vitals_simulator is not None,
            "risk_assessor": risk_assessor is not None
        }
    }

@app.get("/api/vitals", response_model=VitalsResponse)
async def get_current_vitals(
    simulator: VitalsSimulator = Depends(get_vitals_simulator),
    assessor: AIRiskAssessment = Depends(get_risk_assessor)
):
    """Get current vital signs with AI risk assessment"""
    try:
        # Generate current vitals
        vitals = simulator.generate_current_vitals()
        
        # Perform risk assessment
        risk_assessment = assessor.assess_risk(vitals)
        
        # Convert to response format
        response = VitalsResponse(
            heart_rate=vitals.heart_rate,
            spo2=vitals.spo2,
            hrv=vitals.hrv,
            timestamp=vitals.timestamp,
            heart_rate_trend=vitals.heart_rate_trend,
            spo2_trend=vitals.spo2_trend,
            hrv_trend=vitals.hrv_trend,
            riskAssessment=risk_assessment
        )
        
        logger.info(f"Generated vitals: HR={vitals.heart_rate}, SpO2={vitals.spo2}, HRV={vitals.hrv}, Risk={risk_assessment.risk_level}")
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating vitals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating vitals: {str(e)}")

@app.get("/api/vitals/historical", response_model=HistoricalData)
async def get_historical_vitals(
    hours: int = 24,
    interval_minutes: int = 5,
    simulator: VitalsSimulator = Depends(get_vitals_simulator)
):
    """Get historical vital signs data"""
    try:
        if hours > 168:  # Limit to 1 week
            hours = 168
        if interval_minutes < 1:
            interval_minutes = 1
            
        # Generate historical data
        data_points = simulator.generate_historical_data(hours, interval_minutes)
        
        # Calculate summary statistics
        if data_points:
            heart_rates = [v.heart_rate for v in data_points]
            spo2_values = [v.spo2 for v in data_points]
            hrv_values = [v.hrv for v in data_points]
            
            summary = {
                "total_points": len(data_points),
                "time_range": f"{hours}h",
                "heart_rate": {
                    "min": min(heart_rates),
                    "max": max(heart_rates),
                    "avg": round(sum(heart_rates) / len(heart_rates), 1)
                },
                "spo2": {
                    "min": min(spo2_values),
                    "max": max(spo2_values),
                    "avg": round(sum(spo2_values) / len(spo2_values), 1)
                },
                "hrv": {
                    "min": min(hrv_values),
                    "max": max(hrv_values),
                    "avg": round(sum(hrv_values) / len(hrv_values), 1)
                }
            }
        else:
            summary = {}
        
        return HistoricalData(
            data_points=data_points,
            time_range=f"{hours}h",
            summary=summary
        )
        
    except Exception as e:
        logger.error(f"Error generating historical data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating historical data: {str(e)}")

@app.get("/api/risk", response_model=HealthRiskAssessment)
async def get_risk_assessment(
    simulator: VitalsSimulator = Depends(get_vitals_simulator),
    assessor: AIRiskAssessment = Depends(get_risk_assessor)
):
    """Get current AI-powered risk assessment"""
    try:
        # Get current vitals
        vitals = simulator.generate_current_vitals()
        
        # Perform risk assessment
        risk_assessment = assessor.assess_risk(vitals)
        
        return risk_assessment
        
    except Exception as e:
        logger.error(f"Error performing risk assessment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error performing risk assessment: {str(e)}")

@app.post("/api/profile")
async def update_user_profile(profile: UserProfile):
    """Update user profile for personalized monitoring"""
    try:
        global user_profile, vitals_simulator, risk_assessor
        user_profile = profile
        
        # Reinitialize simulator and assessor with new profile
        vitals_simulator = VitalsSimulator(user_profile)
        risk_assessor = AIRiskAssessment(user_profile)
        
        logger.info(f"Updated user profile: age={profile.age}, activity={profile.activity_level}")
        
        return {
            "message": "User profile updated successfully",
            "profile": profile,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@app.get("/api/profile", response_model=UserProfile)
async def get_user_profile():
    """Get current user profile"""
    global user_profile
    if user_profile is None:
        return UserProfile()
    return user_profile

@app.post("/api/session/start")
async def start_monitoring_session(session_config: MonitoringSession):
    """Start a new monitoring session"""
    try:
        global current_session
        current_session = session_config
        current_session.start_time = datetime.now()
        current_session.is_active = True
        
        logger.info(f"Started monitoring session: {session_config.session_id}")
        
        return {
            "message": "Monitoring session started",
            "session": current_session,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error starting session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error starting session: {str(e)}")

@app.post("/api/session/stop")
async def stop_monitoring_session():
    """Stop the current monitoring session"""
    try:
        global current_session
        if current_session:
            current_session.is_active = False
            logger.info(f"Stopped monitoring session: {current_session.session_id}")
            
        return {
            "message": "Monitoring session stopped",
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error stopping session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error stopping session: {str(e)}")

@app.get("/api/session/status")
async def get_session_status():
    """Get current monitoring session status"""
    global current_session
    if current_session is None:
        return {
            "active": False,
            "message": "No active monitoring session"
        }
    
    return {
        "active": current_session.is_active,
        "session": current_session,
        "uptime_minutes": (datetime.now() - current_session.start_time).total_seconds() / 60
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
