from configs.postgre import Base 
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, String, ForeignKey

class TableStatus(Base):
    __tablename__ = "table_statuses"

    id = Column(Integer, primary_key=True)
    status = Column(String(255), nullable=False, unique=True)

    tables = relationship("Table", back_populates="status")

class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True)
    number = Column(String(255), unique=True, nullable=False)
    seats = Column(Integer, nullable=False)
    status_id = Column(Integer, ForeignKey("table_statuses.id"))

    orders = relationship("Order", back_populates="table", cascade="all, delete-orphan")
    status = relationship("TableStatus", back_populates="tables")