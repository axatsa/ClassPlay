from pydantic import BaseModel
from typing import Optional

class StudentProfileResponse(BaseModel):
    xp: int
    coins: int
    level: int
    
    class Config:
        from_attributes = True

class ActivityCompletionRequest(BaseModel):
    activity_type: str
    activity_id: str

class ShopItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: int
    category: str
    image_url: Optional[str] = None

class ShopItemResponse(ShopItemBase):
    id: Optional[int] = None
    
    class Config:
        from_attributes = True

class PurchaseRequest(BaseModel):
    item_id: int
