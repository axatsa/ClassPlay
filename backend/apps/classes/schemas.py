from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClassBase(BaseModel):
    name: str
    grade: str
    student_count: int
    description: Optional[str] = None

class ClassCreate(ClassBase):
    pass

class ClassResponse(ClassBase):
    id: int
    created_at: datetime
    teacher_id: Optional[int] = None
    organization_id: Optional[int] = None

    class Config:
        from_attributes = True
