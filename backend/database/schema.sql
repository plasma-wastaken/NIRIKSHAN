-- NIRIKSHAN Database Schema
-- AI-Powered Government Inspection & Compliance Platform
-- This schema matches the SQLAlchemy models in models.py

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Official enums from SRS
CREATE TYPE user_role AS ENUM ('CITIZEN', 'INSPECTOR', 'SUPERVISOR', 'ADMIN');
CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE evidence_type AS ENUM ('PHOTO', 'VIDEO');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- Implementation enums (not in SRS, but required for functionality)
CREATE TYPE inspection_status AS ENUM ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE complaint_status AS ENUM ('PENDING', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED');
CREATE TYPE site_type AS ENUM ('SCHOOL', 'RESTAURANT', 'HOSPITAL', 'WELFARE_CENTER', 'OTHER');
CREATE TYPE active_status AS ENUM ('ACTIVE', 'INACTIVE');

-- ============================================================================
-- SUPPORTING TABLES
-- ============================================================================

-- Department table (required for referential integrity)
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User table (required for referential integrity)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Site table (required for referential integrity)
CREATE TABLE sites (
    site_id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    site_type site_type NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOMETRY(POINT, 4326),
    department_id INTEGER NOT NULL REFERENCES departments(department_id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- CORE TABLES (from SRS Section 6)
-- ============================================================================

-- Inspection table
CREATE TABLE inspections (
    inspection_id SERIAL PRIMARY KEY,
    site_id INTEGER NOT NULL REFERENCES sites(site_id) ON DELETE RESTRICT,
    inspector_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    status inspection_status NOT NULL DEFAULT 'DRAFT',
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location GEOMETRY(POINT, 4326)
);

-- Evidence table
CREATE TABLE evidence (
    evidence_id SERIAL PRIMARY KEY,
    inspection_id INTEGER NOT NULL REFERENCES inspections(inspection_id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    evidence_type evidence_type NOT NULL,
    captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    hash_sha256 VARCHAR(64) NOT NULL,
    location GEOMETRY(POINT, 4326),
    CONSTRAINT check_sha256_length CHECK (LENGTH(hash_sha256) = 64)
);

-- EvidenceSimilarityResult table
CREATE TABLE evidence_similarity_results (
    similarity_id SERIAL PRIMARY KEY,
    evidence_id INTEGER NOT NULL REFERENCES evidence(evidence_id) ON DELETE CASCADE,
    matched_evidence_id INTEGER NOT NULL REFERENCES evidence(evidence_id) ON DELETE CASCADE,
    similarity_score DOUBLE PRECISION NOT NULL,
    method VARCHAR(50) NOT NULL,
    flagged BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT check_similarity_score_range CHECK (similarity_score >= 0.0 AND similarity_score <= 1.0),
    CONSTRAINT check_no_self_match CHECK (evidence_id != matched_evidence_id)
);

-- RiskScore table
CREATE TABLE risk_scores (
    risk_score_id SERIAL PRIMARY KEY,
    inspection_id INTEGER NOT NULL REFERENCES inspections(inspection_id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    risk_level risk_level NOT NULL,
    factors TEXT NOT NULL, -- JSON stored as text
    confidence DOUBLE PRECISION NOT NULL,
    computed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_risk_score_range CHECK (score >= 0 AND score <= 100),
    CONSTRAINT check_confidence_range CHECK (confidence >= 0.0 AND confidence <= 1.0)
);

-- Complaint table
CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    citizen_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status complaint_status NOT NULL DEFAULT 'PENDING',
    location GEOMETRY(POINT, 4326),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ticket table
CREATE TABLE tickets (
    ticket_id SERIAL PRIMARY KEY,
    complaint_id INTEGER REFERENCES complaints(complaint_id) ON DELETE SET NULL,
    inspection_id INTEGER REFERENCES inspections(inspection_id) ON DELETE SET NULL,
    owner_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    status ticket_status NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sla_deadline TIMESTAMP,
    CONSTRAINT check_ticket_source CHECK (complaint_id IS NOT NULL OR inspection_id IS NOT NULL),
    CONSTRAINT check_priority_range CHECK (priority >= 1 AND priority <= 4)
);

-- AuditEvent table (append-only)
CREATE TABLE audit_events (
    audit_id SERIAL PRIMARY KEY,
    entity VARCHAR(100) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    before_state TEXT, -- JSON stored as text
    after_state TEXT -- JSON stored as text
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_department ON users(department_id);

-- Site indexes
CREATE INDEX idx_site_department ON sites(department_id);
CREATE INDEX idx_site_location ON sites USING GIST(location);
CREATE INDEX idx_site_active ON sites(is_active);

-- Inspection indexes
CREATE INDEX idx_inspection_site ON inspections(site_id);
CREATE INDEX idx_inspection_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspection_status ON inspections(status);
CREATE INDEX idx_inspection_started ON inspections(started_at);
CREATE INDEX idx_inspection_submitted ON inspections(submitted_at);
CREATE INDEX idx_inspection_location ON inspections USING GIST(location);

-- Evidence indexes
CREATE INDEX idx_evidence_inspection ON evidence(inspection_id);
CREATE INDEX idx_evidence_hash ON evidence(hash_sha256);
CREATE INDEX idx_evidence_type ON evidence(evidence_type);
CREATE INDEX idx_evidence_location ON evidence USING GIST(location);

-- EvidenceSimilarityResult indexes
CREATE INDEX idx_similarity_evidence ON evidence_similarity_results(evidence_id);
CREATE INDEX idx_similarity_matched ON evidence_similarity_results(matched_evidence_id);
CREATE INDEX idx_similarity_flagged ON evidence_similarity_results(flagged);

-- RiskScore indexes
CREATE INDEX idx_risk_inspection ON risk_scores(inspection_id);
CREATE INDEX idx_risk_level ON risk_scores(risk_level);
CREATE INDEX idx_risk_score ON risk_scores(score);

-- Complaint indexes
CREATE INDEX idx_complaint_citizen ON complaints(citizen_id);
CREATE INDEX idx_complaint_status ON complaints(status);
CREATE INDEX idx_complaint_location ON complaints USING GIST(location);

-- Ticket indexes
CREATE INDEX idx_ticket_complaint ON tickets(complaint_id);
CREATE INDEX idx_ticket_inspection ON tickets(inspection_id);
CREATE INDEX idx_ticket_owner ON tickets(owner_id);
CREATE INDEX idx_ticket_status ON tickets(status);
CREATE INDEX idx_ticket_sla ON tickets(sla_deadline);

-- AuditEvent indexes
CREATE INDEX idx_audit_entity ON audit_events(entity, entity_id);
CREATE INDEX idx_audit_actor ON audit_events(actor_id);
CREATE INDEX idx_audit_timestamp ON audit_events(timestamp);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for tables with updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
