"""
Custom exceptions for NIRIKSHAN database operations.
"""


class DatabaseError(Exception):
    """Base exception for database errors."""
    pass


class RecordNotFoundError(DatabaseError):
    """Raised when a requested record is not found."""
    pass


class ValidationError(DatabaseError):
    """Raised when data validation fails."""
    pass


class ConstraintViolationError(DatabaseError):
    """Raised when a database constraint is violated."""
    pass


class SpatialQueryError(DatabaseError):
    """Raised when a spatial query fails."""
    pass


class DuplicateRecordError(DatabaseError):
    """Raised when attempting to create a duplicate record."""
    pass


class ForeignKeyError(DatabaseError):
    """Raised when a foreign key constraint is violated."""
    pass
