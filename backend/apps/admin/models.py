from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    contact_person = Column(String)
    license_seats = Column(Integer, default=10)
    used_seats = Column(Integer, default=0)
    expires_at = Column(DateTime)
    status = Column(String, default="active") # active, expiring, expired, blocked

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    amount = Column(Integer)
    currency = Column(String, default="USD")
    date = Column(DateTime, default=datetime.utcnow)
    method = Column(String)
    status = Column(String, default="paid") # paid, pending, failed
    period = Column(String) # e.g. "2025-2026"

    organization = relationship("Organization")

    @property
    def org_name(self):
        return self.organization.name if self.organization else "Unknown"
