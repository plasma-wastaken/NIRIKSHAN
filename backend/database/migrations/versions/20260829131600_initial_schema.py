"""Initial schema creation for NIRIKSHAN database

Revision ID: 20260829131600
Revises: 
Create Date: 2026-08-29 13:16:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20260829131600'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable PostGIS extension
    op.execute('CREATE EXTENSION IF NOT EXISTS postgis')
    
    # Create enum types
    user_role_enum = postgresql.ENUM('CITIZEN', 'INSPECTOR', 'SUPERVISOR', 'ADMIN', name='user_role')
    user_role_enum.create(op.get_bind())
    
    risk_level_enum = postgresql.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL', name='risk_level')
    risk_level_enum.create(op.get_bind())
    
    evidence_type_enum = postgresql.ENUM('PHOTO', 'VIDEO', name='evidence_type')
    evidence_type_enum.create(op.get_bind())
    
    ticket_status_enum = postgresql.ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', name='ticket_status')
    ticket_status_enum.create(op.get_bind())
    
    inspection_status_enum = postgresql.ENUM('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', name='inspection_status')
    inspection_status_enum.create(op.get_bind())
    
    complaint_status_enum = postgresql.ENUM('PENDING', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED', name='complaint_status')
    complaint_status_enum.create(op.get_bind())
    
    site_type_enum = postgresql.ENUM('SCHOOL', 'RESTAURANT', 'HOSPITAL', 'WELFARE_CENTER', 'OTHER', name='site_type')
    site_type_enum.create(op.get_bind())
    
    active_status_enum = postgresql.ENUM('ACTIVE', 'INACTIVE', name='active_status')
    active_status_enum.create(op.get_bind())
    
    # Create departments table
    op.create_table(
        'departments',
        sa.Column('department_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('department_id'),
        sa.UniqueConstraint('name')
    )
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('user_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('full_name', sa.String(length=200), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', user_role_enum, nullable=False),
        sa.Column('department_id', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['department_id'], ['departments.department_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('user_id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('idx_user_department', 'users', ['department_id'])
    op.create_index('idx_user_email', 'users', ['email'])
    op.create_index('idx_user_role', 'users', ['role'])
    
    # Create sites table
    op.create_table(
        'sites',
        sa.Column('site_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('site_type', site_type_enum, nullable=False),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('location', postgresql.GEOMETRY(geometry_type='POINT', srid=4326), nullable=True),
        sa.Column('department_id', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['department_id'], ['departments.department_id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('site_id')
    )
    op.create_index('idx_site_active', 'sites', ['is_active'])
    op.create_index('idx_site_department', 'sites', ['department_id'])
    op.create_index('idx_site_location', 'sites', ['location'], postgresql_using='gist')
    
    # Create inspections table
    op.create_table(
        'inspections',
        sa.Column('inspection_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('site_id', sa.Integer(), nullable=False),
        sa.Column('inspector_id', sa.Integer(), nullable=False),
        sa.Column('status', inspection_status_enum, nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('location', postgresql.GEOMETRY(geometry_type='POINT', srid=4326), nullable=True),
        sa.ForeignKeyConstraint(['inspector_id'], ['users.user_id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['site_id'], ['sites.site_id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('inspection_id')
    )
    op.create_index('idx_inspection_inspector', 'inspections', ['inspector_id'])
    op.create_index('idx_inspection_location', 'inspections', ['location'], postgresql_using='gist')
    op.create_index('idx_inspection_site', 'inspections', ['site_id'])
    op.create_index('idx_inspection_started', 'inspections', ['started_at'])
    op.create_index('idx_inspection_status', 'inspections', ['status'])
    op.create_index('idx_inspection_submitted', 'inspections', ['submitted_at'])
    
    # Create evidence table
    op.create_table(
        'evidence',
        sa.Column('evidence_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('inspection_id', sa.Integer(), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('evidence_type', evidence_type_enum, nullable=False),
        sa.Column('captured_at', sa.DateTime(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('hash_sha256', sa.String(length=64), nullable=False),
        sa.Column('location', postgresql.GEOMETRY(geometry_type='POINT', srid=4326), nullable=True),
        sa.CheckConstraint('LENGTH(hash_sha256) = 64', name='check_sha256_length'),
        sa.ForeignKeyConstraint(['inspection_id'], ['inspections.inspection_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('evidence_id')
    )
    op.create_index('idx_evidence_hash', 'evidence', ['hash_sha256'])
    op.create_index('idx_evidence_inspection', 'evidence', ['inspection_id'])
    op.create_index('idx_evidence_location', 'evidence', ['location'], postgresql_using='gist')
    op.create_index('idx_evidence_type', 'evidence', ['evidence_type'])
    
    # Create evidence_similarity_results table
    op.create_table(
        'evidence_similarity_results',
        sa.Column('similarity_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('evidence_id', sa.Integer(), nullable=False),
        sa.Column('matched_evidence_id', sa.Integer(), nullable=False),
        sa.Column('similarity_score', sa.Float(), nullable=False),
        sa.Column('method', sa.String(length=50), nullable=False),
        sa.Column('flagged', sa.Boolean(), nullable=False),
        sa.CheckConstraint('evidence_id != matched_evidence_id', name='check_no_self_match'),
        sa.CheckConstraint('similarity_score >= 0.0 AND similarity_score <= 1.0', name='check_similarity_score_range'),
        sa.ForeignKeyConstraint(['evidence_id'], ['evidence.evidence_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['matched_evidence_id'], ['evidence.evidence_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('similarity_id')
    )
    op.create_index('idx_similarity_evidence', 'evidence_similarity_results', ['evidence_id'])
    op.create_index('idx_similarity_flagged', 'evidence_similarity_results', ['flagged'])
    op.create_index('idx_similarity_matched', 'evidence_similarity_results', ['matched_evidence_id'])
    
    # Create risk_scores table
    op.create_table(
        'risk_scores',
        sa.Column('risk_score_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('inspection_id', sa.Integer(), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('risk_level', risk_level_enum, nullable=False),
        sa.Column('factors', sa.Text(), nullable=False),
        sa.Column('confidence', sa.Float(), nullable=False),
        sa.Column('computed_at', sa.DateTime(), nullable=False),
        sa.CheckConstraint('confidence >= 0.0 AND confidence <= 1.0', name='check_confidence_range'),
        sa.CheckConstraint('score >= 0 AND score <= 100', name='check_risk_score_range'),
        sa.ForeignKeyConstraint(['inspection_id'], ['inspections.inspection_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('risk_score_id')
    )
    op.create_index('idx_risk_inspection', 'risk_scores', ['inspection_id'])
    op.create_index('idx_risk_level', 'risk_scores', ['risk_level'])
    op.create_index('idx_risk_score', 'risk_scores', ['score'])
    
    # Create complaints table
    op.create_table(
        'complaints',
        sa.Column('complaint_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('citizen_id', sa.Integer(), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('status', complaint_status_enum, nullable=False),
        sa.Column('location', postgresql.GEOMETRY(geometry_type='POINT', srid=4326), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['citizen_id'], ['users.user_id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('complaint_id')
    )
    op.create_index('idx_complaint_citizen', 'complaints', ['citizen_id'])
    op.create_index('idx_complaint_location', 'complaints', ['location'], postgresql_using='gist')
    op.create_index('idx_complaint_status', 'complaints', ['status'])
    
    # Create tickets table
    op.create_table(
        'tickets',
        sa.Column('ticket_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('complaint_id', sa.Integer(), nullable=True),
        sa.Column('inspection_id', sa.Integer(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=True),
        sa.Column('priority', sa.Integer(), nullable=False),
        sa.Column('status', ticket_status_enum, nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('sla_deadline', sa.DateTime(), nullable=True),
        sa.CheckConstraint('(complaint_id IS NOT NULL) OR (inspection_id IS NOT NULL)', name='check_ticket_source'),
        sa.CheckConstraint('priority >= 1 AND priority <= 4', name='check_priority_range'),
        sa.ForeignKeyConstraint(['complaint_id'], ['complaints.complaint_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['inspection_id'], ['inspections.inspection_id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['owner_id'], ['users.user_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('ticket_id')
    )
    op.create_index('idx_ticket_complaint', 'tickets', ['complaint_id'])
    op.create_index('idx_ticket_inspection', 'tickets', ['inspection_id'])
    op.create_index('idx_ticket_owner', 'tickets', ['owner_id'])
    op.create_index('idx_ticket_sla', 'tickets', ['sla_deadline'])
    op.create_index('idx_ticket_status', 'tickets', ['status'])
    
    # Create audit_events table
    op.create_table(
        'audit_events',
        sa.Column('audit_id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('entity', sa.String(length=100), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('actor_id', sa.Integer(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('before_state', sa.Text(), nullable=True),
        sa.Column('after_state', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['actor_id'], ['users.user_id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('audit_id')
    )
    op.create_index('idx_audit_actor', 'audit_events', ['actor_id'])
    op.create_index('idx_audit_entity', 'audit_events', ['entity', 'entity_id'])
    op.create_index('idx_audit_timestamp', 'audit_events', ['timestamp'])
    
    # Create triggers for updated_at
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)
    
    op.execute("""
        CREATE TRIGGER update_departments_updated_at 
        BEFORE UPDATE ON departments
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    op.execute("""
        CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    op.execute("""
        CREATE TRIGGER update_sites_updated_at 
        BEFORE UPDATE ON sites
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    op.execute("""
        CREATE TRIGGER update_complaints_updated_at 
        BEFORE UPDATE ON complaints
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)


def downgrade() -> None:
    # Drop triggers
    op.execute('DROP TRIGGER IF EXISTS update_complaints_updated_at ON complaints')
    op.execute('DROP TRIGGER IF EXISTS update_sites_updated_at ON sites')
    op.execute('DROP TRIGGER IF EXISTS update_users_updated_at ON users')
    op.execute('DROP TRIGGER IF EXISTS update_departments_updated_at ON departments')
    op.execute('DROP FUNCTION IF EXISTS update_updated_at_column()')
    
    # Drop tables
    op.drop_index('idx_audit_timestamp', table_name='audit_events')
    op.drop_index('idx_audit_entity', table_name='audit_events')
    op.drop_index('idx_audit_actor', table_name='audit_events')
    op.drop_table('audit_events')
    
    op.drop_index('idx_ticket_status', table_name='tickets')
    op.drop_index('idx_ticket_sla', table_name='tickets')
    op.drop_index('idx_ticket_owner', table_name='tickets')
    op.drop_index('idx_ticket_inspection', table_name='tickets')
    op.drop_index('idx_ticket_complaint', table_name='tickets')
    op.drop_table('tickets')
    
    op.drop_index('idx_complaint_status', table_name='complaints')
    op.drop_index('idx_complaint_location', table_name='complaints')
    op.drop_index('idx_complaint_citizen', table_name='complaints')
    op.drop_table('complaints')
    
    op.drop_index('idx_risk_score', table_name='risk_scores')
    op.drop_index('idx_risk_level', table_name='risk_scores')
    op.drop_index('idx_risk_inspection', table_name='risk_scores')
    op.drop_table('risk_scores')
    
    op.drop_index('idx_similarity_matched', table_name='evidence_similarity_results')
    op.drop_index('idx_similarity_flagged', table_name='evidence_similarity_results')
    op.drop_index('idx_similarity_evidence', table_name='evidence_similarity_results')
    op.drop_table('evidence_similarity_results')
    
    op.drop_index('idx_evidence_type', table_name='evidence')
    op.drop_index('idx_evidence_location', table_name='evidence')
    op.drop_index('idx_evidence_inspection', table_name='evidence')
    op.drop_index('idx_evidence_hash', table_name='evidence')
    op.drop_table('evidence')
    
    op.drop_index('idx_inspection_submitted', table_name='inspections')
    op.drop_index('idx_inspection_status', table_name='inspections')
    op.drop_index('idx_inspection_started', table_name='inspections')
    op.drop_index('idx_inspection_site', table_name='inspections')
    op.drop_index('idx_inspection_location', table_name='inspections')
    op.drop_index('idx_inspection_inspector', table_name='inspections')
    op.drop_table('inspections')
    
    op.drop_index('idx_site_location', table_name='sites')
    op.drop_index('idx_site_department', table_name='sites')
    op.drop_index('idx_site_active', table_name='sites')
    op.drop_table('sites')
    
    op.drop_index('idx_user_role', table_name='users')
    op.drop_index('idx_user_email', table_name='users')
    op.drop_index('idx_user_department', table_name='users')
    op.drop_table('users')
    
    op.drop_table('departments')
    
    # Drop enum types
    postgresql.ENUM(name='active_status').drop(op.get_bind())
    postgresql.ENUM(name='site_type').drop(op.get_bind())
    postgresql.ENUM(name='complaint_status').drop(op.get_bind())
    postgresql.ENUM(name='inspection_status').drop(op.get_bind())
    postgresql.ENUM(name='ticket_status').drop(op.get_bind())
    postgresql.ENUM(name='evidence_type').drop(op.get_bind())
    postgresql.ENUM(name='risk_level').drop(op.get_bind())
    postgresql.ENUM(name='user_role').drop(op.get_bind())
    
    # Drop PostGIS extension
    op.execute('DROP EXTENSION IF EXISTS postgis')
