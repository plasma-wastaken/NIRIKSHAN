## SOFTWARE REQUIREMENTS SPECIFICATION

NIRIKSHAN — AI-Powered Government Inspection & Compliance Platform

| Field | Detail |
| --- | --- |
| Document Title | SRS — NIRIKSHAN (Prototype / Hackathon Baseline) |
| Version | 1.0 |
| Team | Tanmay (Backend & Integration) · Utkarsh (Database) · Nishtha (AI/ML) |
| Owner — Integration & Naming | Tanmay |
| Contract |   |
| Related Standards | IEEE 830 SRS structure (adapted) |

This document exists so that the three modules — database, backend, and machine learning — plug into each other without naming mismatches. Every file name and variable name that crosses a module boundary is fixed here; changing it on one side without updating this document is what causes integration errors.


## 1. Introduction

## 1.1 Purpose

This SRS defines the requirements for NIRIKSHAN, a prototype government inspection and compliance platform. It fixes what each of the three team members owns, the exact file and variable names each module must use, and the data contract each module sends or receives — so the backend, database, and AI/ML pieces connect without runtime naming errors.

## 1.2 Scope

In scope: inspector workflow (assignment, geo-verification, evidence capture, offline sync), AI/CV validation and repeated-evidence detection, anomaly/fraud scoring, citizen complaint portal, automated ticketing, and a government dashboard.

Out of scope (prototype): legally binding automated enforcement, biometric identification, live integration with government databases, production-grade auth beyond JWT/RBAC.

## 1.3 Definitions

| Term | Meaning |
| --- | --- |
| PostGIS | Spatial extension for PostgreSQL used for geofence/location checks. |
| Risk Score | Numeric/classified anomaly output combining fraud-related signals for an inspection. |
| Evidence | Photo/video captured during an inspection, hashed for integrity. |
| DTO | Data Transfer Object — the exact JSON shape a module sends across an API boundary. |

## 2. System Architecture & Data Flow

The frontend/mobile app never talks to the database directly. All access goes through Tanmay's FastAPI layer, which is the only component holding database credentials. Nishtha's ML functions do not query the database either — they receive evidence/inspection data as plain arguments and return a fixed-shape dictionary that Tanmay's layer persists through Utkarsh's models.

## Pipeline:

Client (Web/Inspector App) FastAPI Layer (Tanmay: auth, validation, orchestration) PostgreSQL + PostGIS (Utkarsh: schema, persistence, spatial queries) ML Layer (Nishtha: CV validation, similarity/anomaly scoring, called synchronously by Tanmay's layer and never touches the DB directly).

## 3. Team Roles & Responsibilities

| # | Member | Role | Primary Responsibility |
| --- | --- | --- | --- |
| 1 | Tanmay | Backend & Integration | FastAPI REST layer, authentication/RBAC, request |
|   |   | Engineer | validation, and wiring the ML output into the database |
|   |   |   | through Pydantic schemas. Owns the naming contract in |
|   |   |   | Section 6. |
| 2 | Utkarsh | Database & Geospatial | PostgreSQL + PostGIS schema, SQLAlchemy models, |
|   |   | Engineer | migrations, geofence/proximity queries, and data integrity |
|   |   |   | (foreign keys, indexes). |
| 3 | Nishtha | AI/ML Engineer | Computer-vision compliance validation, repeated-evidence |
|   |   |   | (perceptual hash/embedding) detection, and anomaly/fraud |
|   |   |   | scoring — exposed as plain Python functions with a fixed |
|   |   |   | return shape. |


## 4. Functional Requirements (grouped by owner)

## 4.1 Backend & Integration — Owner: Tanmay

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-B1 Authenticate users and enforce role-based permissions (Citizen, Inspector, Supervisor, Dept |   | M |
|   | Admin, Govt Admin). |   |
| FR-B2 Expose REST endpoints for inspections, complaints, tickets, evidence, and dashboard |   | M |
|   | aggregation. |   |
| FR-B3 Call Nishtha's ML functions synchronously on evidence upload and persist the returned result |   | M |
|   | via Utkarsh's models — never write ML output with re-typed field names. |   |
| FR-B4 Validate every incoming payload against a Pydantic schema (Section 6) before it reaches the |   | M |
|   | database layer. |   |
| FR-B5 Handle offline-sync conflict resolution and return clear error codes to the client. |   | S |

## 4.2 Database & Geospatial — Owner: Utkarsh

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-D1 Store Inspection, Evidence, Complaint, Ticket, RiskScore, and AuditEvent tables with the |   | M |
|   | exact field names in Section 6. |   |
| FR-D2 Store site/inspection coordinates as PostGIS geometry(Point,4326) columns with a GiST |   | M |
|   | index. |   |
| FR-D3 Answer geofence checks ("is this GPS point within N metres of the assigned site") via |   | M |
|   | ST_DWithin. |   |
| FR-D4 Enforce foreign keys between Inspection | Evidence | RiskScore so orphaned rows are M |
|   | impossible. |   |
| FR-D5 Version schema changes via Alembic migrations, never manual ALTER statements. |   | S |

## 4.3 AI/ML — Owner: Nishtha

| ID | Requirement | Pri |
| --- | --- | --- |
| FR-M1 Analyze submitted evidence for configurable visual compliance indicators and return flags |   | M |
|   | with a confidence value. |   |
| FR-M2 Compare new evidence against prior evidence using perceptual hashing / embeddings and |   | M |
|   | return a similarity score. |   |
| FR-M3 Combine weighted signals (GPS mismatch, short duration, repeated evidence, metadata |   | M |
|   | inconsistency) into a single anomaly/risk score. |   |
| FR-M4 Every function returns a plain dict / Pydantic model matching the field names in Section 6 |   | M |
|   | exactly — no ad-hoc key names. |   |
| FR-M5 Report a confidence value alongside every score where feasible. |   | C |


## 5. Module & File Structure

Fixed file names so that imports resolve the same way for everyone. Do not rename a file listed here without updating the import in the other two modules.

## 5.1 Utkarsh — Database Module (/database)

```
database.py — DB engine/session (exports get_db())
models.py — SQLAlchemy models (exports the classes listed in Section 6.1)
schema.sql — PostGIS extension + initial DDL
migrations/ — Alembic migration scripts
```

## 5.2 Tanmay — Backend Module (/backend)

```
main.py — FastAPI app entry point, includes all routers
schemas.py — Pydantic DTOs (field names must mirror models.py exactly)
routers/inspections.py, routers/complaints.py, routers/tickets.py, routers/evidence.py,
routers/dashboard.py
dependencies.py — auth/RBAC dependency, exports get_current_user()
ml_bridge.py — the ONLY file allowed to import from Nishtha's ml/ package
```

## 5.3 Nishtha — AI/ML Module (/ml)

```
cv_validation.py — exports run_cv_validation(evidence_id, file_path)
similarity_detection.py — exports run_similarity_check(evidence_id, file_path)
anomaly_scoring.py — exports run_anomaly_scoring(inspection_id, signals)
ml_service.py — thin wrapper re-exporting all three functions above (this is what ml_bridge.py
imports)
models/ — trained weight files (e.g. yolo_weights.pt), never imported directly outside ml/
```

## 6. Integration Data Contracts — Exact Field Names

The rule that prevents connection errors: a field is named once, by its producer, and every consumer reuses that exact name — same case, same spelling, everywhere (Pydantic schema, SQLAlchemy model, and ML return dict).

## 6.1 Core entities & fields (owned by Utkarsh, in models.py)

| Entity | Key fields (snake_case) |
| --- | --- |
| Inspection | inspection_id, site_id, inspector_id, status, started_at, submitted_at, latitude, longitude |
| Evidence | evidence_id, inspection_id, file_path, evidence_type, captured_at, latitude, longitude, |
|   | hash_sha256 |
| EvidenceSimilarityResult | similarity_id, evidence_id, matched_evidence_id, similarity_score, method, flagged |
| RiskScore | risk_score_id, inspection_id, score, risk_level, factors, confidence, computed_at |
| Complaint | complaint_id, citizen_id, category, description, latitude, longitude, status |
| Ticket | ticket_id, complaint_id, inspection_id, owner_id, priority, status, created_at, |
|   | sla_deadline |
| AuditEvent | audit_id, entity, entity_id, action, actor_id, timestamp, before_state, after_state |

## 6.2 Enums (shared — define once, reuse everywhere)

```
RiskLevel: LOW | MEDIUM | HIGH | CRITICAL
EvidenceType: PHOTO | VIDEO
TicketStatus: OPEN | IN_PROGRESS | RESOLVED | REJECTED
UserRole: CITIZEN | INSPECTOR | SUPERVISOR | DEPT_ADMIN | GOVT_ADMIN
```


## 6.3 Nishtha Tanmay — CV Validation return contract

run_cv_validation(evidence_id: str, file_path: str) -> dict

{ "evidence_id": str, # must equal the caller's evidence_id "flags": list[str], # e.g. ["blocked_exit"] "confidence": float, # 0.0 - 1.0 "detected_issues": list[str] }

## 6.4 Nishtha Tanmay — Similarity/reuse check return contract

## run_similarity_check(evidence_id: str, file_path: str) -> dict

These five keys map 1:1 onto the EvidenceSimilarityResult columns in Section 6.1 — Tanmay's ml_bridge.py should be a direct unpack, not a manual rename.

## 6.5 Nishtha Tanmay — Anomaly/risk score return contract

## run_anomaly_scoring(inspection_id: str, signals: dict) -> dict

{ "inspection_id": str, "score": float, # 0-100 "risk_level": str, # one of RiskLevel "factors": dict, # e.g. {"gps_mismatch": 0.4, "short_duration": 0.2} "confidence": float, "computed_at": str # ISO 8601, set by Nishtha's function }

## 6.6 Tanmay Utkarsh — request DTOs (schemas.py)

Every Pydantic DTO in schemas.py must use the same field names as the matching SQLAlchemy model in models.py. Example — the incoming evidence-upload request:

server-generated fields (evidence_id, hash_sha256, and every *_score / *_level / computed_at field) are set inside the service layer — never accepted from the client, even if the client sends one.


## 7. Non-Functional Requirements

| Category | Requirement |
| --- | --- |
| Security | JWT auth on all write/admin routes; passwords hashed (bcrypt); evidence hashed with |
|   | SHA-256. |
| Performance | Geofence and dashboard queries return in under 2 seconds for prototype data volume. |
| Availability | Field/offline workflow remains usable during temporary network loss. |
| Data Integrity | Foreign keys enforced between Inspection, Evidence, RiskScore, and Ticket. |
| Auditability | Every decision/status change is appended to AuditEvent — never deleted, only appended. |
| Maintainability | Schema changes go through Alembic migrations only; naming changes must update Section |
|   | 6. |

## 8. Integration Checklist (read before wiring any connection)

- 1. Before writing a DTO or ML function, get the exact field names from the producing module in writing (this document) — do not guess a name.

- 2. Never bind an API request body directly to a SQLAlchemy model — always go through a Pydantic schema in schemas.py.

- 3. Field names are snake_case everywhere (Python side) — do not mix camelCase into models.py or ml_service.py.

- 4. Only ml_bridge.py imports from the ml/ package; only routers/*.py import from schemas.py and models.py — this keeps a rename traceable to one file.

- 5. Any score/level/timestamp field that the server computes (risk_level, computed_at, hash_sha256, confidence) is set server-side and overwritten even if a client supplies one.

- 6. Run a shared example payload past all three members before merging any change to Section 6.

End of document — NIRIKSHAN SRS v1.0
