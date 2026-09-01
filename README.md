# NIRIKSHAN - Construction Compliance Monitoring System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)

## 🏗️ Overview

NIRIKSHAN is a comprehensive construction compliance monitoring system that leverages modern web technologies and machine learning to streamline construction site inspections, evidence management, and compliance reporting. The system provides real-time AI-powered analysis to assist inspectors and supervisors in making informed decisions.

## ✨ Key Features

### 🔍 Smart Inspection Management
- **Digital Inspection Workflows**: Streamlined inspection creation, management, and submission
- **Geospatial Tracking**: GPS-based location tracking for inspection sites
- **Evidence Management**: Upload and manage photos, videos, and documents
- **Multi-language Support**: Hindi and English language support

### 🤖 AI-Powered Analysis
- **Risk Scoring**: ML-based risk assessment for construction sites
- **Anomaly Detection**: Automatic detection of unusual patterns in evidence
- **Computer Vision Validation**: Image integrity and compliance checking
- **Similarity Detection**: Identify potential duplicate evidence

### 👥 Role-Based Access Control
- **Citizens**: File complaints and track progress
- **Inspectors**: Conduct inspections and submit evidence
- **Supervisors**: Review inspections and approve submissions
- **Department Admins**: Manage users and system configuration
- **Government Admins**: System-wide oversight and reporting

### 📊 Comprehensive Dashboard
- **Real-time Statistics**: Track inspection metrics and compliance rates
- **Interactive Maps**: Visual representation of inspection locations
- **Performance Analytics**: Monitor inspector performance and site compliance
- **SLA Tracking**: Monitor complaint resolution timelines

## 🏗️ Architecture

```
NIRIKSHAN/
├── backend/                 # FastAPI backend server
│   ├── routers/           # API endpoints
│   ├── services/          # Business logic
│   ├── database/          # Database models and migrations
│   ├── ml_integration.py   # ML model integration
│   └── main.py            # Application entry point
├── nirikshan-frontend/    # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/     # API services
│   │   └── context/      # React context providers
│   └── public/            # Static assets
├── nirikshan ml/          # Trained ML models
│   ├── nirikshan_ml_model.pkl
│   ├── nirikshan_isolation_forest.pkl
│   ├── nirikshan_scaler.pkl
│   └── dataset1.csv
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- **Backend**: Python 3.11+
- **Frontend**: Node.js 18+
- **Database**: PostgreSQL 14+ (optional, uses mock data by default)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the backend server**
   ```bash
   python main.py
   ```

The backend will start on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd nirikshan-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:5173`

### ML Integration Setup

The ML models are pre-trained and included in the `nirikshan ml/` directory. To test the ML integration:

```bash
cd backend
python test_ml_integration.py
```

## 🔐 Default Credentials

For testing purposes, use these credentials:

| Role | Username | Password |
|------|----------|----------|
| Inspector | inspector001 | password123 |
| Supervisor | supervisor001 | password123 |
| Department Admin | admin001 | password123 |
| Citizen | citizen001 | password123 |

## 📋 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation (Swagger UI).

### Key API Endpoints

- **Authentication**: `/auth/login`
- **Inspections**: `/inspections`
- **Complaints**: `/complaints`
- **Evidence**: `/evidence`
- **ML Analysis**: `/ml/anomaly-scoring`, `/ml/cv-validation`, `/ml/similarity-check`
- **Dashboard**: `/dashboard`

## 🤖 Machine Learning Features

### ML Models Used

1. **Random Forest Classifier**: Risk scoring based on inspection features
2. **Isolation Forest**: Anomaly detection for unusual patterns
3. **StandardScaler**: Feature normalization for consistent input

### ML Capabilities

- **Risk Assessment**: Calculate overall risk scores (0-100) with confidence levels
- **Anomaly Detection**: Flag unusual evidence patterns automatically
- **Similarity Analysis**: Detect potential duplicate evidence using cosine similarity
- **Computer Vision**: Validate image integrity and compliance

### ML Integration

The system provides automatic fallback mechanisms:
1. **Primary**: Use trained ML models
2. **Secondary**: Rule-based detection if ML models fail
3. **Tertiary**: Mock data if ML service is unavailable

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI 0.115
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with bcrypt password hashing
- **ML**: scikit-learn, pandas, numpy
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Maps**: Leaflet with React Leaflet
- **State Management**: React Context API
- **HTTP Client**: Axios

### DevOps
- **Version Control**: Git
- **Package Management**: pip (Python), npm (Node.js)
- **Code Quality**: ESLint, Prettier, Oxlint

## 📁 Project Structure

### Backend Structure
```
backend/
├── routers/              # API route handlers
│   ├── auth.py          # Authentication endpoints
│   ├── inspections.py   # Inspection management
│   ├── complaints.py    # Complaint handling
│   ├── evidence.py      # Evidence upload/management
│   ├── ml.py            # ML analysis endpoints
│   └── dashboard.py     # Dashboard statistics
├── services/            # Business logic
│   ├── repository.py    # Data access layer
│   └── database_repository.py  # Database implementation
├── database/            # Database configuration
│   ├── models.py        # SQLAlchemy models
│   ├── migrations/      # Alembic migrations
│   └── seed.py          # Database seeding
├── data/                # Mock data
│   └── mock_data.py     # Sample data for testing
├── ml_integration.py    # ML model integration
├── ml_bridge.py        # ML API bridge
├── dependencies.py      # Dependency injection
├── schemas.py          # Pydantic schemas
└── main.py             # Application entry point
```

### Frontend Structure
```
nirikshan-frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── ui/         # UI components (Card, Button, etc.)
│   │   └── layout/     # Layout components
│   ├── pages/          # Page components
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Inspections.tsx
│   │   └── AnalysisResult.tsx
│   ├── services/       # API services
│   │   ├── api.ts      # HTTP client
│   │   └── mlService.ts  # ML service
│   ├── context/        # React contexts
│   │   ├── AuthContext.tsx
│   │   └── LanguageContext.tsx
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript types
│   └── i18n/           # Internationalization
├── public/             # Static assets
└── package.json        # Dependencies
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest
```

### ML Integration Testing
```bash
cd backend
python test_ml_integration.py
```

### Frontend Testing
```bash
cd nirikshan-frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nirikshan

# JWT Secret
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:5173

# File Upload
UPLOAD_DIR=./uploads

# API
PORT=8000
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=false
```

## 🚢 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations: `alembic upgrade head`
4. Seed database: `python -m database.seed`
5. Deploy using Gunicorn or similar WSGI server

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist/` folder to your web server
3. Configure reverse proxy for API routing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Development Team**: NIRIKSHAN Development Team
- **Project Sponsor**: Government Construction Compliance Authority

## 📞 Support

For support, please contact:
- Email: support@nirikshan.gov.in
- Documentation: See individual component READMEs
- Issues: Please use the GitHub issue tracker

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Basic inspection management
- ✅ Evidence upload and management
- ✅ ML-powered risk analysis
- ✅ Multi-language support

### Phase 2 (Upcoming)
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Real-time notifications
- [ ] Integration with government databases

### Phase 3 (Future)
- [ ] Blockchain-based evidence verification
- [ ] Advanced computer vision models
- [ ] Predictive maintenance features
- [ ] API for third-party integrations

## 🙏 Acknowledgments

- Government Construction Compliance Authority for sponsorship
- Open-source community for excellent tools and libraries
- Testing team for valuable feedback

---

**Note**: This is a government project for construction compliance monitoring. All data and features are designed to comply with government regulations and standards.