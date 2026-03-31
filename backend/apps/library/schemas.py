from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SavedResourceBase(BaseModel):
    title: str
    type: str # math, crossword
    content: str

class SavedResourceCreate(SavedResourceBase):
    pass

class SavedResourceResponse(SavedResourceBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class StorybookRequest(BaseModel):
    title: Optional[str] = ""
    topic: str
    age_group: Optional[str] = "7-10"
    language: Optional[str] = "Russian"
    genre: Optional[str] = "fairy tale"
