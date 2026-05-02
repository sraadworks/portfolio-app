from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base
from datetime import date

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    name = Column(String)
    asset_type = Column(String) # BIST, US, FUND, ETF
    currency = Column(String) # TRY, USD
    sector = Column(String, default="Diğer") # Teknoloji, Havacılık, Sanayi vb.
    manual_price = Column(Float, nullable=True) # User-defined manual price

    lots = relationship("Lot", back_populates="asset")
    transactions = relationship("Transaction", back_populates="asset")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    transaction_type = Column(String) # BUY, SELL, DIVIDEND
    amount = Column(Float)
    price = Column(Float)
    date = Column(Date)
    exchange_rate = Column(Float, default=1.0)
    commission = Column(Float, default=0.0)
    tax = Column(Float, default=0.0)
    risk_margin = Column(Float, default=5.0)
    realized_cost = Column(Float, default=0.0)
    realized_inflation_diff = Column(Float, default=0.0)
    realized_profit = Column(Float, default=0.0)

    asset = relationship("Asset", back_populates="transactions")


class ReferenceData(Base):
    __tablename__ = "reference_data"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True) # e.g. 2024-01-01 for Jan 2024
    currency = Column(String, default="TRY", index=True)
    cpi_value = Column(Float) # TÜFE endeks değeri

    __table_args__ = (UniqueConstraint('date', 'currency', name='_date_currency_uc'),)


class Lot(Base):
    __tablename__ = "lots"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    buy_date = Column(Date)
    initial_amount = Column(Float)
    remaining_amount = Column(Float)
    buy_price = Column(Float)
    exchange_rate = Column(Float, default=1.0)
    inflation_ref = Column(Float, nullable=True)

    asset = relationship("Asset", back_populates="lots")


class BenchmarkData(Base):
    __tablename__ = "benchmark_data"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    name = Column(String, index=True) # BIST100, ALTIN, SP500
    value = Column(Float)

    __table_args__ = (UniqueConstraint('date', 'name', name='_date_benchmark_name_uc'),)

class CashLedger(Base):
    __tablename__ = "cash_ledger"

    id = Column(Integer, primary_key=True, index=True)
    currency = Column(String) # TRY, USD
    transaction_type = Column(String) # DEPOSIT, WITHDRAW, BUY, SELL, DIVIDEND, TAX, FEE, FX
    amount = Column(Float) # Positive for in, negative for out
    date = Column(Date, default=date.today)
    description = Column(String, nullable=True)
