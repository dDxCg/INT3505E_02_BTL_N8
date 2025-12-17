from configs.postgre import Base
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Numeric

class Dish(Base):
    __tablename__ = "dishes"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)  # URL to Supabase storage

    order_items = relationship("OrderItem", back_populates="dish")

    # Many-to-many relationship with tags
    tags = relationship(
        "Tag",
        secondary="dish_tags",
        back_populates="dishes"
    )