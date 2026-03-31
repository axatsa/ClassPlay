from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrganizationBase(BaseModel):
    name: str
    contact_person: str
    license_seats: int
    expires_at: datetime
    status: str

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: int
    used_seats: int
    
    class Config:
        from_attributes = True

class PaymentBase(BaseModel):
    amount: int
    currency: str
    method: str
    status: str
    period: str
    organization_id: int

class PaymentCreate(PaymentBase):
    pass

class PaymentResponse(PaymentBase):
    id: int
    date: datetime
    org_name: Optional[str] = None

    class Config:
        from_attributes = True

class CreateTeacherRequest(BaseModel):
    email: str
    password: str
    full_name: str

class TokenUsageStats(BaseModel):
    user_id: int
    full_name: str
    email: str
    total_tokens: int
    last_active: str | None
