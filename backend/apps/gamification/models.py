from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from database import Base
from datetime import datetime

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    xp = Column(Integer, default=0)
    coins = Column(Integer, default=0)
    level = Column(Integer, default=1)

class DailyProgress(Base):
    __tablename__ = "daily_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(DateTime, index=True)
    total_xp_today = Column(Integer, default=0)
    total_coins_today = Column(Integer, default=0)
    activity_history = Column(Text) # JSON string

class XPTransaction(Base):
    __tablename__ = "xp_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    activity_type = Column(String)
    activity_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class CoinTransaction(Base):
    __tablename__ = "coin_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Integer)
    transaction_type = Column(String) # "reward" or "purchase"
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class SeasonStats(Base):
    __tablename__ = "season_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    season_name = Column(String)
    total_xp = Column(Integer, default=0)

class ShopItem(Base):
    __tablename__ = "shop_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    price = Column(Integer)
    category = Column(String)
    image_url = Column(String, nullable=True)

class Purchase(Base):
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_id = Column(Integer, ForeignKey("shop_items.id"))
    price_paid = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
