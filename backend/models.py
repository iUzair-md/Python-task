from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    f_name = Column(String(50), nullable=False)
    l_name = Column(String(50), nullable=False)
    email_id = Column(String(100), unique=True, nullable=False, index=True)
    phone_number = Column(String(20), nullable=False)
    address = Column(String(255), nullable=False)
    created_date = Column(DateTime(timezone=True), server_default=func.now())