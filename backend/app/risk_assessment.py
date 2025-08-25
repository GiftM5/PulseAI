from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from .models import VitalSigns, HealthRiskAssessment, RiskLevel, UserProfile
import statistics
import math

class AIRiskAssessment:
    """
    AI-powered risk assessment engine that analyzes vital signs patterns
    and provides early warning for potential health issues.
    """
    
    def __init__(self, user_profile: UserProfile = None):
        self.user_profile = user_profile or UserProfile()
        self.historical_data: List[VitalSigns] = []
        
        # Risk thresholds based on medical guidelines
        self.risk_thresholds = {
            "heart_rate": {
                "low": (60, 100),
                "medium": (50, 120),
                "high": (40, 150)
            },
            "spo2": {
                "high": 95.0,
                "medium": 92.0,
                "low": 88.0
            },
            "hrv": {
                "low": 20,
                "medium": 15,
                "high": 10
            }
        }
        
        # Adjust thresholds based on user profile
        self._adjust_thresholds_for_user()

    def _calculate_correlation(self, x: List[float], y: List[float]) -> float:
        """Calculate Pearson correlation coefficient"""
        if len(x) != len(y) or len(x) < 2:
            return None

        n = len(x)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(x[i] * x[i] for i in range(n))
        sum_y2 = sum(y[i] * y[i] for i in range(n))

        numerator = n * sum_xy - sum_x * sum_y
        denominator = math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y))

        if denominator == 0:
            return None

        return numerator / denominator
    
    def _adjust_thresholds_for_user(self):
        """Adjust risk thresholds based on user profile"""
        if not self.user_profile:
            return
            
        # Age adjustments
        if self.user_profile.age:
            if self.user_profile.age > 65:
                # Older adults may have slightly different normal ranges
                self.risk_thresholds["heart_rate"]["low"] = (55, 95)
                self.risk_thresholds["hrv"]["low"] = 15
            elif self.user_profile.age < 25:
                # Younger adults typically have higher HRV
                self.risk_thresholds["hrv"]["low"] = 25
        
        # Activity level adjustments
        if self.user_profile.activity_level == "very_active":
            # Athletes may have lower resting heart rates
            self.risk_thresholds["heart_rate"]["low"] = (45, 95)
            self.risk_thresholds["hrv"]["low"] = 30
        elif self.user_profile.activity_level == "sedentary":
            # Sedentary individuals may have higher resting heart rates
            self.risk_thresholds["heart_rate"]["low"] = (65, 105)
    
    def _assess_current_vitals(self, vitals: VitalSigns) -> Tuple[float, List[str], Dict]:
        """Assess current vital signs and return risk score and concerns"""
        risk_score = 0.0
        concerns = []
        factors = {}
        
        # Heart Rate Assessment
        hr_min, hr_max = self.risk_thresholds["heart_rate"]["low"]
        if vitals.heart_rate < hr_min or vitals.heart_rate > hr_max:
            if vitals.heart_rate < 50 or vitals.heart_rate > 120:
                risk_score += 3.0
                if vitals.heart_rate < 50:
                    concerns.append("Bradycardia (slow heart rate) detected")
                else:
                    concerns.append("Tachycardia (fast heart rate) detected")
            else:
                risk_score += 1.5
                concerns.append("Heart rate outside normal range")
            factors["heart_rate_risk"] = True
        
        # SpO2 Assessment
        if vitals.spo2 < self.risk_thresholds["spo2"]["high"]:
            if vitals.spo2 < self.risk_thresholds["spo2"]["medium"]:
                if vitals.spo2 < self.risk_thresholds["spo2"]["low"]:
                    risk_score += 4.0
                    concerns.append("Severe hypoxemia (critically low oxygen)")
                else:
                    risk_score += 2.5
                    concerns.append("Moderate hypoxemia (low oxygen levels)")
            else:
                risk_score += 1.0
                concerns.append("Mild oxygen desaturation")
            factors["spo2_risk"] = True
        
        # HRV Assessment
        if vitals.hrv < self.risk_thresholds["hrv"]["low"]:
            if vitals.hrv < self.risk_thresholds["hrv"]["high"]:
                risk_score += 2.0
                concerns.append("Very low heart rate variability")
            else:
                risk_score += 1.0
                concerns.append("Low heart rate variability")
            factors["hrv_risk"] = True
        
        return risk_score, concerns, factors
    
    def _assess_trends(self, vitals: VitalSigns) -> Tuple[float, List[str], Dict]:
        """Assess trends in vital signs"""
        risk_score = 0.0
        concerns = []
        factors = {}
        
        # Rapid heart rate changes
        if abs(vitals.heart_rate_trend) > 15:
            risk_score += 1.0
            concerns.append("Rapid heart rate change detected")
            factors["hr_trend_risk"] = True
        
        # SpO2 dropping trend
        if vitals.spo2_trend < -2.0:
            risk_score += 2.0
            concerns.append("Declining oxygen saturation")
            factors["spo2_trend_risk"] = True
        
        # HRV declining trend
        if vitals.hrv_trend < -10:
            risk_score += 1.0
            concerns.append("Decreasing heart rate variability")
            factors["hrv_trend_risk"] = True
        
        return risk_score, concerns, factors
    
    def _assess_patterns(self, recent_data: List[VitalSigns]) -> Tuple[float, List[str], Dict]:
        """Assess patterns in recent vital signs data"""
        if len(recent_data) < 3:
            return 0.0, [], {}
        
        risk_score = 0.0
        concerns = []
        factors = {}
        
        # Extract values for pattern analysis
        heart_rates = [v.heart_rate for v in recent_data]
        spo2_values = [v.spo2 for v in recent_data]
        hrv_values = [v.hrv for v in recent_data]
        
        # Check for sustained abnormal values
        hr_abnormal_count = sum(1 for hr in heart_rates if hr < 60 or hr > 100)
        if hr_abnormal_count >= len(heart_rates) * 0.7:  # 70% of readings abnormal
            risk_score += 1.5
            concerns.append("Sustained abnormal heart rate pattern")
            factors["sustained_hr_abnormal"] = True
        
        spo2_low_count = sum(1 for spo2 in spo2_values if spo2 < 95)
        if spo2_low_count >= len(spo2_values) * 0.5:  # 50% of readings low
            risk_score += 2.0
            concerns.append("Persistent low oxygen saturation")
            factors["persistent_low_spo2"] = True
        
        # Check for high variability (could indicate instability)
        hr_std = statistics.stdev(heart_rates) if len(heart_rates) > 1 else 0
        if hr_std > 15:
            risk_score += 1.0
            concerns.append("High heart rate variability pattern")
            factors["high_hr_variability"] = True
        
        # Check for declining trends over time
        if len(recent_data) >= 5:
            # Simple linear trend analysis
            time_points = list(range(len(recent_data)))

            # Calculate simple correlation for heart rate trend
            hr_correlation = self._calculate_correlation(time_points, heart_rates)
            if hr_correlation is not None and abs(hr_correlation) > 0.7:
                if hr_correlation > 0.7:  # Increasing trend
                    risk_score += 1.0
                    concerns.append("Sustained increasing heart rate trend")
                    factors["increasing_hr_trend"] = True
        
        return risk_score, concerns, factors
    
    def _generate_recommendations(self, risk_level: RiskLevel, concerns: List[str], factors: Dict) -> List[str]:
        """Generate AI-powered recommendations based on assessment"""
        recommendations = []
        
        if risk_level == RiskLevel.HIGH:
            recommendations.extend([
                "Seek immediate medical attention",
                "Avoid strenuous physical activity",
                "Monitor symptoms closely",
                "Consider calling emergency services if symptoms worsen"
            ])
        elif risk_level == RiskLevel.MEDIUM:
            recommendations.extend([
                "Take a break and rest in a comfortable position",
                "Practice deep breathing exercises",
                "Stay hydrated with water",
                "Consider contacting your healthcare provider"
            ])
        else:  # LOW risk
            recommendations.extend([
                "Continue current activities",
                "Maintain healthy lifestyle habits",
                "Stay hydrated and get adequate rest",
                "Regular monitoring is beneficial"
            ])
        
        # Specific recommendations based on factors
        if factors.get("heart_rate_risk"):
            if "Bradycardia" in " ".join(concerns):
                recommendations.append("Avoid sudden position changes")
            elif "Tachycardia" in " ".join(concerns):
                recommendations.append("Practice relaxation techniques")
        
        if factors.get("spo2_risk"):
            recommendations.extend([
                "Ensure good posture for optimal breathing",
                "Consider gentle breathing exercises",
                "Avoid environments with poor air quality"
            ])
        
        if factors.get("hrv_risk"):
            recommendations.extend([
                "Focus on stress reduction techniques",
                "Ensure adequate sleep quality",
                "Consider meditation or mindfulness practices"
            ])
        
        return recommendations[:6]  # Limit to 6 recommendations
    
    def assess_risk(self, current_vitals: VitalSigns, recent_data: List[VitalSigns] = None) -> HealthRiskAssessment:
        """
        Perform comprehensive risk assessment based on current vitals and recent data
        """
        if recent_data is None:
            recent_data = self.historical_data[-10:] if self.historical_data else []
        
        # Add current vitals to historical data
        self.historical_data.append(current_vitals)
        if len(self.historical_data) > 100:  # Keep last 100 readings
            self.historical_data = self.historical_data[-100:]
        
        total_risk_score = 0.0
        all_concerns = []
        all_factors = {}
        
        # Assess current vitals
        current_risk, current_concerns, current_factors = self._assess_current_vitals(current_vitals)
        total_risk_score += current_risk
        all_concerns.extend(current_concerns)
        all_factors.update(current_factors)
        
        # Assess trends
        trend_risk, trend_concerns, trend_factors = self._assess_trends(current_vitals)
        total_risk_score += trend_risk
        all_concerns.extend(trend_concerns)
        all_factors.update(trend_factors)
        
        # Assess patterns if we have enough data
        if recent_data:
            pattern_risk, pattern_concerns, pattern_factors = self._assess_patterns(recent_data + [current_vitals])
            total_risk_score += pattern_risk
            all_concerns.extend(pattern_concerns)
            all_factors.update(pattern_factors)
        
        # Determine risk level
        if total_risk_score >= 4.0:
            risk_level = RiskLevel.HIGH
        elif total_risk_score >= 2.0:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW
        
        # Calculate confidence based on data availability and consistency
        confidence = min(1.0, 0.5 + len(recent_data) * 0.05)  # Higher confidence with more data
        
        # Generate recommendations
        recommendations = self._generate_recommendations(risk_level, all_concerns, all_factors)
        
        return HealthRiskAssessment(
            risk_level=risk_level,
            risk_score=min(10.0, total_risk_score),
            primary_concerns=list(set(all_concerns))[:5],  # Remove duplicates, limit to 5
            recommendations=recommendations,
            confidence=confidence,
            factors=all_factors
        )
