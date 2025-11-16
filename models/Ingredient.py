from sqlalchemy import Column, Integer, String, Float, Enum
from sqlalchemy.orm import relationship
from configs.postgre import Base
import enum
from .enum import Unit


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True)
    unit = Column(Enum(Unit), nullable=False)  
    qunatity = Column(Float, default=0)       
    threshold = Column(Float, default=0)       # minimum before restocking

