from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routers import auth, inspections, complaints, tickets, evidence, dashboard, ml

# Import ML bridge (stub for now)
import ml_bridge

# Import repository (use mock repository for testing)
from services.repository import Repository

# Initialize repository globally
repository = Repository()

# Make repository accessible to routers
import routers.auth, routers.inspections, routers.complaints, routers.tickets, routers.evidence, routers.dashboard, routers.ml
routers.auth.set_repository(repository)
routers.inspections.set_repository(repository)
routers.complaints.set_repository(repository)
routers.tickets.set_repository(repository)
routers.evidence.set_repository(repository)
routers.dashboard.set_repository(repository)
routers.ml.set_repository(repository)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize mock data
    repository.initialize_mock_data()
    
    # Create upload directory if it doesn't exist
    upload_dir = os.getenv("UPLOAD_DIR", "./uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    yield
    
    # Shutdown: Cleanup if needed
    pass

# Create FastAPI app
app = FastAPI(
    title="NIRIKSHAN API",
    description="Construction Compliance Monitoring System API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(inspections.router, prefix="/inspections", tags=["Inspections"])
app.include_router(complaints.router, prefix="/complaints", tags=["Complaints"])
app.include_router(tickets.router, prefix="/tickets", tags=["Tickets"])
app.include_router(evidence.router, prefix="/evidence", tags=["Evidence"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(ml.router, prefix="/ml", tags=["Machine Learning"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)