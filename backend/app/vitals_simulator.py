import random
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from .models import VitalSigns, UserProfile
import math

class VitalsSimulator:
    """
    Sophisticated vital signs simulator that generates realistic health data
    with circadian rhythms, stress events, and medical patterns.
    """
    
    def __init__(self, user_profile: Optional[UserProfile] = None):
        self.user_profile = user_profile or UserProfile()
        self.session_start = datetime.now()
        self.previous_vitals: Optional[VitalSigns] = None
        self.stress_event_active = False
        self.stress_event_end_time = None
        self.exercise_event_active = False
        self.exercise_event_end_time = None
        
        # Base values adjusted for user profile
        self.base_heart_rate = self._calculate_base_heart_rate()
        self.base_spo2 = self._calculate_base_spo2()
        self.base_hrv = self._calculate_base_hrv()
        
        # Noise parameters for realistic variation
        self.hr_noise_std = 3.0
        self.spo2_noise_std = 0.5
        self.hrv_noise_std = 4.0

    def _normal_random(self, mean: float = 0.0, std: float = 1.0) -> float:
        """Generate a random number from normal distribution using Box-Muller transform"""
        if not hasattr(self, '_spare_random'):
            self._spare_random = None

        if self._spare_random is not None:
            result = self._spare_random
            self._spare_random = None
            return mean + result * std

        # Box-Muller transform
        u1 = random.random()
        u2 = random.random()

        z0 = math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)
        z1 = math.sqrt(-2.0 * math.log(u1)) * math.sin(2.0 * math.pi * u2)

        self._spare_random = z1
        return mean + z0 * std
        
    def _calculate_base_heart_rate(self) -> float:
        """Calculate base heart rate based on user profile"""
        base = 70.0  # Default resting heart rate
        
        if self.user_profile.age:
            # Age adjustment: HR tends to decrease slightly with age
            if self.user_profile.age > 60:
                base -= 5
            elif self.user_profile.age < 25:
                base += 5
                
        if self.user_profile.activity_level:
            activity_adjustments = {
                "sedentary": 5,
                "light": 2,
                "moderate": 0,
                "active": -3,
                "very_active": -8
            }
            base += activity_adjustments.get(self.user_profile.activity_level, 0)
            
        return max(50, min(90, base))
    
    def _calculate_base_spo2(self) -> float:
        """Calculate base SpO2 based on user profile"""
        base = 98.5
        
        # Medical conditions that might affect SpO2
        if self.user_profile.medical_conditions:
            respiratory_conditions = ["asthma", "copd", "pneumonia", "covid"]
            if any(condition.lower() in respiratory_conditions 
                   for condition in self.user_profile.medical_conditions):
                base -= random.uniform(1.0, 3.0)
                
        return max(94.0, min(100.0, base))
    
    def _calculate_base_hrv(self) -> float:
        """Calculate base HRV based on user profile"""
        base = 35.0
        
        if self.user_profile.age:
            # HRV decreases with age
            age_factor = max(0.5, 1.0 - (self.user_profile.age - 25) * 0.01)
            base *= age_factor
            
        if self.user_profile.activity_level:
            activity_multipliers = {
                "sedentary": 0.8,
                "light": 0.9,
                "moderate": 1.0,
                "active": 1.2,
                "very_active": 1.4
            }
            base *= activity_multipliers.get(self.user_profile.activity_level, 1.0)
            
        return max(15, min(60, base))
    
    def _get_circadian_factor(self, current_time: datetime) -> Dict[str, float]:
        """Calculate circadian rhythm effects on vital signs"""
        hour = current_time.hour + current_time.minute / 60.0
        
        # Heart rate circadian pattern (lower at night, higher during day)
        hr_circadian = 1.0 + 0.15 * math.sin(2 * math.pi * (hour - 6) / 24)
        
        # SpO2 is relatively stable but slightly lower during sleep
        spo2_circadian = 1.0 - 0.005 * math.cos(2 * math.pi * (hour - 3) / 24)
        
        # HRV is higher during rest/sleep, lower during active hours
        hrv_circadian = 1.0 + 0.3 * math.cos(2 * math.pi * (hour - 14) / 24)
        
        return {
            "heart_rate": hr_circadian,
            "spo2": spo2_circadian,
            "hrv": hrv_circadian
        }
    
    def _trigger_random_events(self) -> None:
        """Randomly trigger stress or exercise events"""
        current_time = datetime.now()
        
        # End active events if time has passed
        if (self.stress_event_active and 
            current_time > self.stress_event_end_time):
            self.stress_event_active = False
            
        if (self.exercise_event_active and 
            current_time > self.exercise_event_end_time):
            self.exercise_event_active = False
        
        # Trigger new events randomly
        if not self.stress_event_active and random.random() < 0.02:  # 2% chance
            self.stress_event_active = True
            self.stress_event_end_time = current_time + timedelta(
                minutes=random.randint(5, 20)
            )
            
        if not self.exercise_event_active and random.random() < 0.01:  # 1% chance
            self.exercise_event_active = True
            self.exercise_event_end_time = current_time + timedelta(
                minutes=random.randint(10, 30)
            )
    
    def _apply_event_effects(self, base_values: Dict[str, float]) -> Dict[str, float]:
        """Apply effects of active events (stress, exercise) to vital signs"""
        if self.stress_event_active:
            base_values["heart_rate"] *= random.uniform(1.15, 1.35)
            base_values["spo2"] *= random.uniform(0.98, 1.0)
            base_values["hrv"] *= random.uniform(0.6, 0.8)
            
        if self.exercise_event_active:
            base_values["heart_rate"] *= random.uniform(1.4, 1.8)
            base_values["spo2"] *= random.uniform(0.95, 0.98)
            base_values["hrv"] *= random.uniform(1.1, 1.3)
            
        return base_values
    
    def _add_realistic_noise(self, values: Dict[str, float]) -> Dict[str, float]:
        """Add realistic noise and variation to vital signs"""
        values["heart_rate"] += self._normal_random(0, self.hr_noise_std)
        values["spo2"] += self._normal_random(0, self.spo2_noise_std)
        values["hrv"] += self._normal_random(0, self.hrv_noise_std)

        return values
    
    def _calculate_trends(self, current_vitals: VitalSigns) -> Tuple[float, float, float]:
        """Calculate trends compared to previous reading"""
        if not self.previous_vitals:
            return 0.0, 0.0, 0.0
            
        hr_trend = current_vitals.heart_rate - self.previous_vitals.heart_rate
        spo2_trend = current_vitals.spo2 - self.previous_vitals.spo2
        hrv_trend = current_vitals.hrv - self.previous_vitals.hrv
        
        return hr_trend, spo2_trend, hrv_trend
    
    def generate_current_vitals(self) -> VitalSigns:
        """Generate current vital signs with realistic patterns"""
        current_time = datetime.now()
        
        # Trigger random events
        self._trigger_random_events()
        
        # Get circadian effects
        circadian_factors = self._get_circadian_factor(current_time)
        
        # Calculate base values with circadian rhythm
        base_values = {
            "heart_rate": self.base_heart_rate * circadian_factors["heart_rate"],
            "spo2": self.base_spo2 * circadian_factors["spo2"],
            "hrv": self.base_hrv * circadian_factors["hrv"]
        }
        
        # Apply event effects
        base_values = self._apply_event_effects(base_values)
        
        # Add realistic noise
        base_values = self._add_realistic_noise(base_values)
        
        # Ensure values are within realistic bounds
        heart_rate = max(40, min(180, int(round(base_values["heart_rate"]))))
        spo2 = max(85.0, min(100.0, round(base_values["spo2"], 1)))
        hrv = max(10, min(80, int(round(base_values["hrv"]))))
        
        # Create vitals object
        current_vitals = VitalSigns(
            heart_rate=heart_rate,
            spo2=spo2,
            hrv=hrv,
            timestamp=current_time
        )
        
        # Calculate trends
        hr_trend, spo2_trend, hrv_trend = self._calculate_trends(current_vitals)
        current_vitals.heart_rate_trend = hr_trend
        current_vitals.spo2_trend = spo2_trend
        current_vitals.hrv_trend = hrv_trend
        
        # Store for next trend calculation
        self.previous_vitals = current_vitals
        
        return current_vitals
    
    def generate_historical_data(self, hours: int = 24, interval_minutes: int = 5) -> List[VitalSigns]:
        """Generate historical vital signs data"""
        data_points = []
        start_time = datetime.now() - timedelta(hours=hours)
        
        for i in range(0, hours * 60, interval_minutes):
            timestamp = start_time + timedelta(minutes=i)
            
            # Simulate data for this timestamp
            circadian_factors = self._get_circadian_factor(timestamp)
            
            # Add some random events in historical data
            stress_factor = 1.0
            exercise_factor = 1.0
            
            if random.random() < 0.05:  # 5% chance of stress event
                stress_factor = random.uniform(1.2, 1.4)
            elif random.random() < 0.03:  # 3% chance of exercise event
                exercise_factor = random.uniform(1.5, 1.8)
            
            # Calculate values
            heart_rate = self.base_heart_rate * circadian_factors["heart_rate"] * stress_factor * exercise_factor
            heart_rate += self._normal_random(0, self.hr_noise_std)
            heart_rate = max(50, min(150, int(round(heart_rate))))

            spo2 = self.base_spo2 * circadian_factors["spo2"]
            if stress_factor > 1.0 or exercise_factor > 1.0:
                spo2 *= random.uniform(0.96, 0.99)
            spo2 += self._normal_random(0, self.spo2_noise_std)
            spo2 = max(90.0, min(100.0, round(spo2, 1)))

            hrv = self.base_hrv * circadian_factors["hrv"]
            if stress_factor > 1.0:
                hrv *= random.uniform(0.7, 0.9)
            elif exercise_factor > 1.0:
                hrv *= random.uniform(1.1, 1.3)
            hrv += self._normal_random(0, self.hrv_noise_std)
            hrv = max(15, min(70, int(round(hrv))))
            
            vitals = VitalSigns(
                heart_rate=heart_rate,
                spo2=spo2,
                hrv=hrv,
                timestamp=timestamp
            )
            
            data_points.append(vitals)
        
        return data_points
