from configs.postgre import Base 
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, ForeignKey

class Guest(Base):
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    cointact_info = Column(String(255), nullable=True)

    orders = relationship("Order", back_populates="guest")