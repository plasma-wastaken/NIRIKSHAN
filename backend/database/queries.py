"""
SQLAlchemy queries for NIRIKSHAN database.
Provides spatial and business queries as required by the SRS.
"""
from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc
from geoalchemy2 import functions as geofunc
from geoalchemy2.types import Geography

from database.models import (
    Inspection, Evidence, EvidenceSimilarityResult, RiskScore,
    Complaint, Ticket, AuditEvent, Site, User,
    InspectionStatus, RiskLevel, TicketStatus, ComplaintStatus
)
from database.exceptions import SpatialQueryError


class InspectionQueries:
    """Queries related to inspections."""
    
    @staticmethod
    def get_inspections_by_inspector(db: Session, inspector_id: int) -> List[Inspection]:
        """
        Get inspections assigned to an inspector.
        
        Args:
            db: Database session
            inspector_id: User ID of the inspector
            
        Returns:
            List of inspections assigned to the inspector
        """
        return db.query(Inspection).filter(
            Inspection.inspector_id == inspector_id
        ).order_by(Inspection.started_at.desc()).all()
    
    @staticmethod
    def get_inspections_by_site(db: Session, site_id: int) -> List[Inspection]:
        """
        Get inspections for a site.
        
        Args:
            db: Database session
            site_id: Site ID
            
        Returns:
            List of inspections for the site
        """
        return db.query(Inspection).filter(
            Inspection.site_id == site_id
        ).order_by(Inspection.started_at.desc()).all()
    
    @staticmethod
    def get_high_critical_risk_inspections(db: Session) -> List[Inspection]:
        """
        Get HIGH and CRITICAL risk inspections.
        
        Args:
            db: Database session
            
        Returns:
            List of inspections with HIGH or CRITICAL risk levels
        """
        return db.query(Inspection).join(RiskScore).filter(
            RiskScore.risk_level.in_([RiskLevel.HIGH, RiskLevel.CRITICAL])
        ).order_by(RiskScore.score.desc()).all()
    
    @staticmethod
    def check_inspection_geofence(db: Session, inspection_id: int, max_distance_meters: float = 100) -> bool:
        """
        Check inspection geofence using ST_DWithin.
        Determines whether an inspection GPS point lies within N metres of its assigned site.
        
        Args:
            db: Database session
            inspection_id: Inspection ID
            max_distance_meters: Maximum distance in metres (default: 100)
            
        Returns:
            True if inspection is within geofence, False otherwise
        """
        try:
            inspection = db.query(Inspection).filter(
                Inspection.inspection_id == inspection_id
            ).first()
            
            if not inspection or not inspection.location or not inspection.site.location:
                return False
            
            # Use ST_DWithin with geography for metre-based distance
            result = db.query(
                geofunc.ST_DWithin(
                    geofunc.ST_GeographyFromText(inspection.location),
                    geofunc.ST_GeographyFromText(inspection.site.location),
                    max_distance_meters
                )
            ).scalar()
            
            return bool(result)
        except Exception as e:
            raise SpatialQueryError(f"Geofence check failed: {str(e)}")
    
    @staticmethod
    def calculate_inspection_to_site_distance(db: Session, inspection_id: int) -> Optional[float]:
        """
        Calculate the distance from the inspection point to the assigned site.
        
        Args:
            db: Database session
            inspection_id: Inspection ID
            
        Returns:
            Distance in metres, or None if location data is missing
        """
        try:
            inspection = db.query(Inspection).filter(
                Inspection.inspection_id == inspection_id
            ).first()
            
            if not inspection or not inspection.location or not inspection.site.location:
                return None
            
            # Use ST_Distance with geography for metre-based distance
            distance = db.query(
                geofunc.ST_Distance(
                    geofunc.ST_GeographyFromText(inspection.location),
                    geofunc.ST_GeographyFromText(inspection.site.location)
                )
            ).scalar()
            
            return float(distance) if distance else None
        except Exception as e:
            raise SpatialQueryError(f"Distance calculation failed: {str(e)}")
    
    @staticmethod
    def find_inspections_near_point(db: Session, latitude: float, longitude: float, max_distance_meters: float = 1000) -> List[Inspection]:
        """
        Find inspections within N metres of a geographic point.
        
        Args:
            db: Database session
            latitude: Latitude of the point
            longitude: Longitude of the point
            max_distance_meters: Maximum distance in metres (default: 1000)
            
        Returns:
            List of inspections within the specified distance
        """
        try:
            point = f'POINT({longitude} {latitude})'
            return db.query(Inspection).filter(
                and_(
                    Inspection.location.isnot(None),
                    geofunc.ST_DWithin(
                        geofunc.ST_GeographyFromText(Inspection.location),
                        geofunc.ST_GeographyFromText(f'SRID=4326;{point}'),
                        max_distance_meters
                    )
                )
            ).all()
        except Exception as e:
            raise SpatialQueryError(f"Nearby inspections query failed: {str(e)}")


class SiteQueries:
    """Queries related to sites."""
    
    @staticmethod
    def find_sites_near_point(db: Session, latitude: float, longitude: float, max_distance_meters: float = 5000) -> List[Site]:
        """
        Find sites within N metres of a point.
        
        Args:
            db: Database session
            latitude: Latitude of the point
            longitude: Longitude of the point
            max_distance_meters: Maximum distance in metres (default: 5000)
            
        Returns:
            List of sites within the specified distance
        """
        try:
            point = f'POINT({longitude} {latitude})'
            return db.query(Site).filter(
                and_(
                    Site.location.isnot(None),
                    Site.is_active == True,
                    geofunc.ST_DWithin(
                        geofunc.ST_GeographyFromText(Site.location),
                        geofunc.ST_GeographyFromText(f'SRID=4326;{point}'),
                        max_distance_meters
                    )
                )
            ).all()
        except Exception as e:
            raise SpatialQueryError(f"Nearby sites query failed: {str(e)}")
    
    @staticmethod
    def find_nearby_complaints(db: Session, site_id: int, max_distance_meters: float = 1000) -> List[Complaint]:
        """
        Find complaints within N metres of a site.
        
        Args:
            db: Database session
            site_id: Site ID
            max_distance_meters: Maximum distance in metres (default: 1000)
            
        Returns:
            List of complaints within the specified distance
        """
        try:
            site = db.query(Site).filter(Site.site_id == site_id).first()
            if not site or not site.location:
                return []
            
            return db.query(Complaint).filter(
                and_(
                    Complaint.location.isnot(None),
                    geofunc.ST_DWithin(
                        geofunc.ST_GeographyFromText(Complaint.location),
                        geofunc.ST_GeographyFromText(site.location),
                        max_distance_meters
                    )
                )
            ).all()
        except Exception as e:
            raise SpatialQueryError(f"Nearby complaints query failed: {str(e)}")
    
    @staticmethod
    def get_site_inspection_history(db: Session, site_id: int) -> List[Inspection]:
        """
        Get site inspection history.
        
        Args:
            db: Database session
            site_id: Site ID
            
        Returns:
            List of all inspections for the site
        """
        return db.query(Inspection).filter(
            Inspection.site_id == site_id
        ).order_by(Inspection.started_at.desc()).all()
    
    @staticmethod
    def find_sites_with_repeated_high_risk_inspections(db: Session, risk_threshold: int = 70, min_inspections: int = 3) -> List[Site]:
        """
        Find sites with repeated/high-risk inspections.
        
        Args:
            db: Database session
            risk_threshold: Minimum risk score to consider high-risk (default: 70)
            min_inspections: Minimum number of high-risk inspections (default: 3)
            
        Returns:
            List of sites with repeated high-risk inspections
        """
        from sqlalchemy import subquery
        
        high_risk_inspections = db.query(
            Inspection.site_id,
            func.count(Inspection.inspection_id).label('high_risk_count')
        ).join(RiskScore).filter(
            RiskScore.score >= risk_threshold
        ).group_by(Inspection.site_id).subquery()
        
        return db.query(Site).join(
            high_risk_inspections, Site.site_id == high_risk_inspections.c.site_id
        ).filter(
            high_risk_inspections.c.high_risk_count >= min_inspections
        ).all()


class EvidenceQueries:
    """Queries related to evidence."""
    
    @staticmethod
    def find_duplicate_reuse_evidence(db: Session) -> List[Evidence]:
        """
        Find evidence with duplicate/reuse flags.
        
        Args:
            db: Database session
            
        Returns:
            List of evidence that has been flagged as similar/duplicate
        """
        return db.query(Evidence).join(EvidenceSimilarityResult).filter(
            EvidenceSimilarityResult.flagged == True
        ).distinct().all()
    
    @staticmethod
    def find_inspections_with_flagged_evidence(db: Session) -> List[Inspection]:
        """
        Find inspections containing flagged evidence.
        
        Args:
            db: Database session
            
        Returns:
            List of inspections that have flagged evidence
        """
        return db.query(Inspection).join(Evidence).join(
            EvidenceSimilarityResult
        ).filter(
            EvidenceSimilarityResult.flagged == True
        ).distinct().all()


class TicketQueries:
    """Queries related to tickets."""
    
    @staticmethod
    def find_open_tickets(db: Session) -> List[Ticket]:
        """
        Find open tickets.
        
        Args:
            db: Database session
            
        Returns:
            List of tickets with OPEN status
        """
        return db.query(Ticket).filter(
            Ticket.status == TicketStatus.OPEN
        ).order_by(Ticket.created_at.desc()).all()
    
    @staticmethod
    def find_overdue_tickets(db: Session) -> List[Ticket]:
        """
        Find overdue tickets where sla_deadline has passed.
        
        Args:
            db: Database session
            
        Returns:
            List of tickets that are overdue
        """
        return db.query(Ticket).filter(
            and_(
                Ticket.sla_deadline.isnot(None),
                Ticket.sla_deadline < datetime.utcnow(),
                Ticket.status.in_([TicketStatus.OPEN, TicketStatus.IN_PROGRESS])
            )
        ).order_by(Ticket.sla_deadline.asc()).all()


class DashboardQueries:
    """Queries for dashboard analytics."""
    
    @staticmethod
    def get_inspection_counts(db: Session) -> dict:
        """
        Get dashboard inspection counts by status.
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with inspection counts by status
        """
        counts = db.query(
            Inspection.status,
            func.count(Inspection.inspection_id)
        ).group_by(Inspection.status).all()
        
        return {status.value: count for status, count in counts}
    
    @staticmethod
    def get_flagged_inspection_counts(db: Session) -> int:
        """
        Get flagged inspection counts.
        
        Args:
            db: Database session
            
        Returns:
            Count of inspections with flagged evidence
        """
        return db.query(Inspection).join(Evidence).join(
            EvidenceSimilarityResult
        ).filter(
            EvidenceSimilarityResult.flagged == True
        ).distinct().count()
    
    @staticmethod
    def get_complaint_counts_by_status(db: Session) -> dict:
        """
        Get complaint counts by status.
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with complaint counts by status
        """
        counts = db.query(
            Complaint.status,
            func.count(Complaint.complaint_id)
        ).group_by(Complaint.status).all()
        
        return {status.value: count for status, count in counts}
    
    @staticmethod
    def get_ticket_counts_by_status(db: Session) -> dict:
        """
        Get ticket counts by status.
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with ticket counts by status
        """
        counts = db.query(
            Ticket.status,
            func.count(Ticket.ticket_id)
        ).group_by(Ticket.status).all()
        
        return {status.value: count for status, count in counts}


class AuditQueries:
    """Queries related to audit events."""
    
    @staticmethod
    def get_audit_history(db: Session, entity: str, entity_id: int) -> List[AuditEvent]:
        """
        Get audit history for an entity.
        
        Args:
            db: Database session
            entity: Entity type (e.g., 'inspection', 'evidence', 'ticket')
            entity_id: Entity ID
            
        Returns:
            List of audit events for the entity
        """
        return db.query(AuditEvent).filter(
            and_(
                AuditEvent.entity == entity,
                AuditEvent.entity_id == entity_id
            )
        ).order_by(AuditEvent.timestamp.desc()).all()


class UserQueries:
    """Queries related to users."""
    
    @staticmethod
    def find_inspectors_with_high_flagged_counts(db: Session, threshold: int = 5) -> List[User]:
        """
        Find inspectors with unusually high flagged-evidence counts.
        
        Args:
            db: Database session
            threshold: Minimum number of flagged evidence to consider unusually high (default: 5)
            
        Returns:
            List of inspectors with high flagged-evidence counts
        """
        from sqlalchemy import subquery
        
        flagged_counts = db.query(
            Inspection.inspector_id,
            func.count(EvidenceSimilarityResult.similarity_id).label('flagged_count')
        ).join(Evidence).join(
            EvidenceSimilarityResult
        ).filter(
            EvidenceSimilarityResult.flagged == True
        ).group_by(Inspection.inspector_id).subquery()
        
        return db.query(User).join(
            flagged_counts, User.user_id == flagged_counts.c.inspector_id
        ).filter(
            flagged_counts.c.flagged_count >= threshold
        ).all()
