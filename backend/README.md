# PulseAI Backend API

AI-powered health monitoring backend that provides real-time vital signs simulation and intelligent risk assessment.

## Features

- **Real-time Vital Signs**: Heart Rate, SpO₂, and HRV monitoring
- **AI Risk Assessment**: Intelligent analysis with early warning system
- **Realistic Simulation**: Sophisticated vital signs simulation with circadian rhythms
- **User Profiles**: Personalized monitoring based on age, activity level, and health conditions
- **Historical Data**: Trend analysis and pattern recognition
- **RESTful API**: Clean, well-documented endpoints
- **CORS Support**: Ready for frontend integration

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the Server

```bash
python run.py
```

The server will start at `http://127.0.0.1:8000`

### 3. View API Documentation

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

## API Endpoints

### Core Endpoints

- `GET /api/vitals` - Get current vital signs with AI risk assessment
- `GET /api/vitals/historical` - Get historical vital signs data
- `GET /api/risk` - Get current AI-powered risk assessment

### User Management

- `POST /api/profile` - Update user profile for personalized monitoring
- `GET /api/profile` - Get current user profile

### Session Management

- `POST /api/session/start` - Start monitoring session
- `POST /api/session/stop` - Stop monitoring session
- `GET /api/session/status` - Get session status

### Health Check

- `GET /health` - API health check
- `GET /` - API information

## Example Usage

### Get Current Vitals

```bash
curl http://127.0.0.1:8000/api/vitals
```

Response:
```json
{
  "heartRate": 72,
  "spo2": 98.5,
  "hrv": 35,
  "timestamp": "2024-01-15T10:30:00",
  "heartRateTrend": 2.0,
  "spo2Trend": 0.1,
  "hrvTrend": -1.0,
  "riskAssessment": {
    "risk_level": "low",
    "risk_score": 0.5,
    "primary_concerns": [],
    "recommendations": [
      "Continue current activities",
      "Maintain healthy lifestyle habits"
    ],
    "confidence": 0.85
  }
}
```

### Update User Profile

```bash
curl -X POST http://127.0.0.1:8000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "gender": "male",
    "activity_level": "active",
    "weight": 75.0,
    "height": 180.0
  }'
```

## AI Risk Assessment

The backend includes a sophisticated AI risk assessment engine that:

- **Analyzes Current Vitals**: Compares against medical guidelines
- **Tracks Trends**: Identifies concerning patterns in vital signs
- **Pattern Recognition**: Detects sustained abnormal readings
- **Personalized Thresholds**: Adjusts based on user profile
- **Actionable Recommendations**: Provides specific guidance

### Risk Levels

- **Low Risk**: All vitals within normal range
- **Medium Risk**: Some concerns detected, monitoring recommended
- **High Risk**: Immediate attention may be required

## Data Simulation

The vitals simulator provides realistic health data with:

- **Circadian Rhythms**: Natural daily variations in vital signs
- **Random Events**: Stress and exercise events that affect readings
- **User Profile Integration**: Personalized baseline values
- **Medical Accuracy**: Based on clinical guidelines and research

## Development

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic data models
│   ├── vitals_simulator.py  # Vital signs simulation engine
│   └── risk_assessment.py   # AI risk assessment engine
├── requirements.txt         # Python dependencies
├── run.py                  # Server startup script
└── README.md               # This file
```

### Adding New Features

1. **New Endpoints**: Add to `main.py`
2. **Data Models**: Define in `models.py`
3. **Business Logic**: Create new modules in `app/`
4. **Dependencies**: Update `requirements.txt`

## Integration with Frontend

The backend is designed to work seamlessly with the PulseAI React frontend:

1. **CORS Configured**: Allows requests from `localhost:3000`
2. **JSON Responses**: All endpoints return JSON data
3. **Error Handling**: Consistent error responses
4. **Real-time Ready**: Supports polling for live updates

## Monitoring and Logging

- **Structured Logging**: All operations are logged
- **Health Checks**: Monitor API status
- **Error Tracking**: Detailed error information
- **Performance Metrics**: Request timing and success rates

## Security Considerations

- **Input Validation**: All inputs validated with Pydantic
- **Error Handling**: Secure error messages
- **CORS Configuration**: Restricted to known origins
- **Rate Limiting**: Can be added for production use

## Production Deployment

For production deployment:

1. **Environment Variables**: Use for configuration
2. **Database Integration**: Replace simulation with real data
3. **Authentication**: Add user authentication
4. **Rate Limiting**: Implement API rate limiting
5. **Monitoring**: Add application monitoring
6. **SSL/TLS**: Enable HTTPS

## License

MIT License - see LICENSE file for details.
