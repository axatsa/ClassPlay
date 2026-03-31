from sqlalchemy import Column, Integer, String, Text, DateTime
from database import Base
from datetime import datetime

class ClassGroup(Base):
    __tablename__ = "class_groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    grade = Column(String)
    student_count = Column(Integer)
    description = Column(Text, nullable=True) # AI Context
    created_at = Column(DateTime, default=datetime.utcnow)
