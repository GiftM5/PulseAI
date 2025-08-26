from pydantic import BaseModel, Field, validator
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class VitalSigns(BaseModel):
    """Model for current vital signs data"""
    heart_rate: int = Field(
        ..., 
        ge=30, 
        le=200, 
        description="Heart rate in beats per minute"
    )
    spo2: float = Field(
        ..., 
        ge=70.0, 
        le=100.0, 
        description="Blood oxygen saturation percentage"
    )
    hrv: int = Field(
        ..., 
        ge=5, 
        le=100, 
        description="Heart rate variability in milliseconds"
    )
    timestamp: datetime = Field(
        default_factory=datetime.now,
        description="Timestamp when the measurement was taken"
    )
    heart_rate_trend: Optional[float] = Field(
        default=0.0,
        description="Heart rate trend compared to previous reading"
    )
    spo2_trend: Optional[float] = Field(
        default=0.0,
        description="SpO2 trend compared to previous reading"
    )
    hrv_trend: Optional[float] = Field(
        default=0.0,
        description="HRV trend compared to previous reading"
    )

    @validator('spo2')
    def validate_spo2(cls, v):
        return round(v, 1)

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class HealthRiskAssessment(BaseModel):
    """Model for AI-powered health risk assessment"""
    risk_level: RiskLevel
    risk_score: float = Field(
        ..., 
        ge=0.0, 
        le=10.0, 
        description="Risk score from 0 (low) to 10 (high)"
    )
    primary_concerns: List[str] = Field(
        default_factory=list,
        description="List of primary health concerns identified"
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="AI-generated recommendations"
    )
    confidence: float = Field(
        ..., 
        ge=0.0, 
        le=1.0, 
        description="Confidence level of the assessment"
    )
    factors: dict = Field(
        default_factory=dict,
        description="Contributing factors to the risk assessment"
    )

class VitalsResponse(BaseModel):
    """Complete response model including vitals and risk assessment"""
    heartRate: int = Field(alias="heart_rate")
    spo2: float
    hrv: int
    timestamp: datetime
    heartRateTrend: float = Field(alias="heart_rate_trend")
    spo2Trend: float = Field(alias="spo2_trend")
    hrvTrend: float = Field(alias="hrv_trend")
    riskAssessment: Optional[HealthRiskAssessment] = None

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class HistoricalData(BaseModel):
    """Model for historical vital signs data"""
    data_points: List[VitalSigns]
    time_range: str = Field(
        ...,
        description="Time range of the data (e.g., '1h', '6h', '24h')"
    )
    summary: dict = Field(
        default_factory=dict,
        description="Statistical summary of the data"
    )

class UserProfile(BaseModel):
    """Model for user health profile"""
    age: Optional[int] = Field(None, ge=1, le=150)
    gender: Optional[Literal["male", "female", "other"]] = None
    weight: Optional[float] = Field(None, ge=20.0, le=300.0, description="Weight in kg")
    height: Optional[float] = Field(None, ge=50.0, le=250.0, description="Height in cm")
    activity_level: Optional[Literal["sedentary", "light", "moderate", "active", "very_active"]] = None
    medical_conditions: Optional[List[str]] = Field(default_factory=list)
    medications: Optional[List[str]] = Field(default_factory=list)

class MonitoringSession(BaseModel):
    """Model for monitoring session configuration"""
    session_id: str
    user_profile: Optional[UserProfile] = None
    start_time: datetime = Field(default_factory=datetime.now)
    duration_minutes: int = Field(default=60, ge=1, le=1440)
    sampling_interval_seconds: int = Field(default=5, ge=1, le=60)
    is_active: bool = True

class AlertConfiguration(BaseModel):
    """Model for alert thresholds and configuration"""
    heart_rate_min: int = Field(default=50, ge=30, le=80)
    heart_rate_max: int = Field(default=120, ge=100, le=200)
    spo2_min: float = Field(default=95.0, ge=80.0, le=98.0)
    hrv_min: int = Field(default=20, ge=5, le=40)
    enable_trend_alerts: bool = Field(default=True)
    alert_cooldown_minutes: int = Field(default=5, ge=1, le=60)

class CameraHeartRateInput(BaseModel):
    """Incoming camera heart rate reading from the web app"""
    heart_rate: int = Field(..., ge=30, le=220)
    method: Optional[str] = Field(default=None, description="Detection algorithm identifier")
    signal_quality: Optional[str] = Field(default=None, description="Qualitative signal quality")
    device: Optional[str] = Field(default=None, description="Device info or user agent")
    timestamp: datetime = Field(default_factory=datetime.now)

class CameraHeartRateReading(BaseModel):
    """Stored/served camera heart rate reading"""
    heart_rate: int
    method: Optional[str] = None
    signal_quality: Optional[str] = None
    device: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

# AI Clinic models
class TriageInput(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    language: Optional[str] = Field(default="en")
    cough_days: Optional[int] = Field(default=0, ge=0, le=60)
    fever: Optional[bool] = Field(default=False)
    night_sweats: Optional[bool] = Field(default=False)
    weight_loss: Optional[bool] = Field(default=False)
    breathlessness: Optional[bool] = Field(default=False)
    chest_pain: Optional[bool] = Field(default=False)
    other: Optional[str] = None

class TriageResult(BaseModel):
    risk_level: RiskLevel
    score: int = 0
    summary: str
    recommendations: List[str] = Field(default_factory=list)
    timestamp: datetime = Field(default_factory=datetime.now)

class AppointmentRequest(BaseModel):
    name: str
    phone: Optional[str] = None
    id_number: Optional[str] = None
    preferred_time: Optional[str] = None
    reason: Optional[str] = None

class Appointment(BaseModel):
    id: str
    name: str
    phone: Optional[str] = None
    preferred_time: Optional[str] = None
    reason: Optional[str] = None
    status: Literal["booked", "pending", "cancelled"] = "booked"
    created_at: datetime = Field(default_factory=datetime.now)
