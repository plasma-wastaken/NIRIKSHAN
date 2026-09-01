# ML Integration Guide for NIRIKSHAN

This guide explains how the ML integration works in the NIRIKSHAN platform.

## ML Components

### 1. ML Models Location
The trained ML models are located in: `nirikshan ml/`
- `nirikshan_ml_model.pkl` - Main ML model for risk scoring (Random Forest Classifier)
- `nirikshan_isolation_forest.pkl` - Isolation Forest for anomaly detection
- `nirikshan_scaler.pkl` - Feature scaler for preprocessing (StandardScaler)
- `nirikshan_features.pkl` - Feature names and metadata
- `dataset1.csv` - Training dataset (synthetic construction inspection data)

**Note**: The models were trained using synthetic construction inspection data and are ready for use.

### 2. ML Integration Module
`backend/ml_integration.py` provides:
- `MLIntegration` class that loads and uses trained models
- Anomaly detection using Isolation Forest
- Risk scoring using the main ML model
- Similarity detection for evidence
- Fallback to rule-based methods if models fail

### 3. ML Bridge
`backend/ml_bridge.py` bridges the backend API with ML integration:
- `run_cv_validation()` - Computer vision validation
- `run_similarity_check()` - Evidence similarity detection
- `run_anomaly_scoring()` - Anomaly and risk scoring
- Maintains SRS contract compliance

### 4. ML API Endpoints
`backend/routers/ml.py` provides REST API endpoints:
- `POST /ml/cv-validation` - Run CV validation on evidence
- `POST /ml/similarity-check` - Run similarity check
- `POST /ml/anomaly-scoring` - Run anomaly scoring on inspection
- `GET /ml/models/status` - Check ML models status
- `POST /ml/models/reload` - Reload ML models (admin only)

### 5. Frontend Integration
`nirikshan-frontend/src/services/mlService.ts` provides:
- ML service functions to call backend ML endpoints
- Type-safe interfaces for ML requests/responses
- Automatic fallback to mock data if backend unavailable

## How It Works

### Inspection Analysis Flow

1. **Evidence Collection**: Inspector captures evidence (photos/videos)
2. **ML Processing**: Evidence is sent to ML endpoints
3. **CV Validation**: Images checked for integrity and compliance
4. **Similarity Check**: Evidence compared against historical database
5. **Anomaly Detection**: ML models detect potential anomalies
6. **Risk Scoring**: Overall risk score and level calculated
7. **Results Display**: Results shown in frontend analysis page

### Fallback Mechanism

The system has multiple fallback layers:
1. **Primary**: Use trained ML models from `nirikshan ml/`
2. **Secondary**: Rule-based detection if ML models fail
3. **Tertiary**: Mock data if ML service unavailable

## Setup Instructions

### 1. Install ML Dependencies
```bash
cd backend
pip install -r requirements.txt
```

This installs:
- numpy>=1.24.0
- pandas>=2.0.0
- scikit-learn>=1.3.0
- joblib>=1.3.0

### 2. Verify ML Models
Ensure the following files exist in `nirikshan ml/`:
- nirikshan_ml_model.pkl
- nirikshan_isolation_forest.pkl
- nirikshan_scaler.pkl
- nirikshan_features.pkl
- dataset1.csv

### 3. Start Backend Server
```bash
cd backend
python main.py
```

The server will start on `http://localhost:8000`

### 4. Test ML Integration
You can test the ML integration using the provided test script:

```bash
cd backend
python test_ml_integration.py
```

This will:
- Test health endpoint
- Login as supervisor
- Check ML models status
- Test anomaly scoring
- Test CV validation
- Test similarity check

Alternatively, visit `http://localhost:8000/docs` to test the ML endpoints manually:
- GET `/ml/models/status` - Check if models are loaded (requires Supervisor/Admin role)
- POST `/ml/models/reload` - Reload models (admin only)
- POST `/ml/anomaly-scoring` - Run anomaly scoring on inspection
- POST `/ml/cv-validation` - Run CV validation on evidence
- POST `/ml/similarity-check` - Run similarity check on evidence

### 4. Test Frontend Integration
```bash
cd nirikshan-frontend
npm run dev
```

Navigate to an inspection and go to the analysis page. The system will:
1. Try to call real ML service
2. Fall back to mock data if unavailable
3. Display results accordingly

## ML Features

### Anomaly Detection
- Uses Isolation Forest algorithm
- Detects unusual patterns in evidence
- Flags location anomalies, time inconsistencies
- Provides anomaly scores and confidence levels

### Risk Scoring
- Uses trained ML model
- Calculates overall risk score (0-100)
- Determines risk level (LOW, MEDIUM, HIGH, CRITICAL)
- Analyzes contributing factors
- Provides confidence scores

### Similarity Detection
- Compares evidence against historical database
- Uses cosine similarity for feature comparison
- Flags potential duplicate evidence
- Provides similarity scores

### CV Validation
- Validates image integrity
- Checks for common issues
- Provides compliance flags
- Confidence scoring

## Model Training (For Reference)

The models were trained using:
- **Dataset**: Synthetic construction inspection data (1000 normal samples + 50 anomalies)
- **Features**: Location accuracy, time validity, evidence count, site risk score, inspection type, location variance, time variance
- **Algorithms**: 
  - Isolation Forest for anomaly detection
  - Random Forest Classifier for risk scoring
  - StandardScaler for feature normalization
- **Tools**: scikit-learn, pandas, numpy
- **Performance**: Risk model accuracy ~91% on test data

### Model Details
- **Risk Model**: Random Forest with 100 estimators, max depth 10
- **Anomaly Detection**: Isolation Forest with 10% contamination rate
- **Feature Scaling**: StandardScaler for normalizing input features
- **Risk Levels**: LOW, MEDIUM, HIGH, CRITICAL (based on risk score thresholds)

## API Usage Examples

### Run Anomaly Scoring
```bash
curl -X POST "http://localhost:8000/ml/anomaly-scoring" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "inspection_id": "INS-1001",
    "evidence_data": [
      {
        "evidence_id": "EV-1",
        "file_path": "/uploads/ins1/evidence1.jpg",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "captured_at": "2026-08-30T10:00:00Z"
      }
    ]
  }'
```

### Check Models Status
```bash
curl -X GET "http://localhost:8000/ml/models/status" \
  -H "Authorization: Bearer <token>"
```

**Test Credentials for ML Endpoints:**
- Username: `supervisor001`
- Password: `password123`
- Role: SUPERVISOR (has access to ML endpoints)

## Current Integration Status

✅ **ML Integration Status: ACTIVE**

- ✅ ML models trained and saved in `nirikshan ml/` directory
- ✅ Backend ML integration module (`ml_integration.py`) operational
- ✅ ML bridge module (`ml_bridge.py`) connecting API to ML
- ✅ ML API endpoints (`routers/ml.py`) configured and working
- ✅ Frontend ML service (`mlService.ts`) integrated
- ✅ Analysis result page configured to use real ML with fallback
- ✅ Test script (`test_ml_integration.py`) available for validation

## Integration Architecture

```
Frontend (AnalysisResult.tsx)
    ↓ mlService.ts
Backend API (routers/ml.py)
    ↓ ml_bridge.py
ML Integration (ml_integration.py)
    ↓ Trained Models (nirikshan ml/)
```

## Troubleshooting

### Models Not Loading
- Check file paths in `ml_integration.py` (should point to `nirikshan ml/`)
- Ensure pickle files are accessible and not corrupted
- Check file permissions on the `nirikshan ml/` directory
- Verify Python version compatibility (Python 3.11+)

### ML Service Unavailable
- Check if backend is running on port 8000
- Check ML endpoints in `/docs` (requires authentication)
- Verify CORS configuration in `main.py`
- Check authentication - use supervisor001 credentials for ML endpoints

### Analysis Page Not Working
- Check browser console for errors
- Verify backend is accessible at `http://localhost:8000`
- Check if ML service returns errors (network tab in browser)
- Verify mock data fallback is working (should display if ML fails)

### Permission Errors
- ML endpoints require INSPECTOR, SUPERVISOR, or ADMIN role
- Model management endpoints require ADMIN role
- Use `supervisor001` / `password123` for testing ML endpoints
- Use `admin001` / `password123` for model management

## Performance Considerations

- ML models are loaded once at startup
- Model reloading available without restart
- Fallback mechanisms ensure system continues working
- Caching can be added for frequently used results

## Security

- ML endpoints are protected by authentication
- Admin-only endpoints for model management
- File paths are validated before processing
- Input sanitization for all ML inputs

## Future Enhancements

- Real-time model retraining
- Additional ML models for specific use cases
- Model versioning and A/B testing
- Performance monitoring and metrics
- GPU acceleration for faster inference

## Quick Start Guide

1. **Start Backend:**
   ```bash
   cd backend
   python main.py
   ```

2. **Test ML Integration:**
   ```bash
   python test_ml_integration.py
   ```

3. **Start Frontend:**
   ```bash
   cd nirikshan-frontend
   npm run dev
   ```

4. **Access Analysis:**
   - Login as inspector
   - Navigate to an inspection
   - Add evidence
   - Click "Run AI Analysis"
   - View ML-powered risk assessment

## Files Reference

- `backend/ml_integration.py` - Core ML integration logic
- `backend/ml_bridge.py` - API bridge for ML operations
- `backend/routers/ml.py` - ML API endpoints
- `backend/test_ml_integration.py` - Integration test script
- `nirikshan-frontend/src/services/mlService.ts` - Frontend ML service
- `nirikshan-frontend/src/pages/AnalysisResult.tsx` - Analysis UI
- `nirikshan ml/` - Trained ML models directory
