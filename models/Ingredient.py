from sqlalchemy import Column, ForeignKey, Integer, String, Float
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

