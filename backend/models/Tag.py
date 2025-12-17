from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from configs.postgre import Base

# Association table for many-to-many relationship between dishes and tags
dish_tags_association = Table(
    'dish_tags',
    Base.metadata,
    Column('dish_id', Integer, ForeignKey('dishes.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)

    # Many-to-many relationship with dishes
    dishes = relationship(
        "Dish",
        secondary=dish_tags_association,
        back_populates="tags"
    )

    def __repr__(self):
        return f"<Tag(id={self.id}, name='{self.name}')>"
