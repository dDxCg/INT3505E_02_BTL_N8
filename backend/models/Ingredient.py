from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Float
from sqlalchemy.orm import relationship
from configs.postgre import Base

class IngredientUnit(Base):
    __tablename__ = "ingredient_units"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

    ingredients = relationship("Ingredient", back_populates="unit")

class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True)
    unit_id = Column(Integer, ForeignKey("ingredient_units.id"), nullable=False)
    quantity = Column(Float, default=0)       
    threshold = Column(Float, default=0)       # minimum before restocking

    unit = relationship("IngredientUnit", back_populates="ingredients")
    histories = relationship(
        "IngredientHistory",
        back_populates="ingredient",
        cascade="all, delete-orphan"
    )


class IngredientHistory(Base):
    __tablename__ = "ingredient_histories"

    id = Column(Integer, primary_key=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
    old_quantity = Column(Float, nullable=False)
    new_quantity = Column(Float, nullable=False)
    quantity_change = Column(Float, nullable=False)  
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)    

    ingredient = relationship("Ingredient", back_populates="histories")
