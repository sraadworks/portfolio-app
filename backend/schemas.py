from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class AssetBase(BaseModel):
    symbol: str
    name: str
    asset_type: str
    currency: str
    sector: Optional[str] = "Diğer"
    manual_price: Optional[float] = None
    portfolio_id: Optional[int] = None

class AssetCreate(AssetBase):
    pass

class Asset(AssetBase):
    id: int

    class Config:
        from_attributes = True

class AssetPerformance(Asset):
    # Active (Unrealized) Metrics
    active_quantity: float
    current_price: float
    active_value: float
    active_cost: float
    active_gross_profit: float
    active_commission: float = 0.0
    active_tax: float = 0.0
    active_net_profit: float
    active_inflation_diff: float
    active_real_net_profit: float
    active_risk_margin_profit: float
    active_profit_loss_percent: float
    active_holding_days: int
    
    # USD Metrics (for TRY assets)
    active_usd_cost: float = 0.0
    active_usd_value: float = 0.0
    active_usd_profit: float = 0.0
    active_usd_percent: float = 0.0

    # Realized Metrics (from sold portions)
    realized_cost: float
    realized_revenue: float
    realized_gross_profit: float
    realized_commission: float = 0.0
    realized_tax: float = 0.0
    realized_net_profit: float
    realized_inflation_diff: float
    realized_real_net_profit: float
    realized_risk_margin_profit: float
    realized_holding_days: int

    # Total Historical Metrics (Active + Realized)
    total_cost: float
    total_dividend: float
    total_commission: float
    total_tax: float
    total_gross_profit: float
    total_net_profit: float
    total_inflation_diff: float
    total_real_net_profit: float
    total_risk_margin_profit: float
    
    risk_margin_rate: float
    portfolio_name: Optional[str] = None

class PortfolioBase(BaseModel):
    name: str
    description: Optional[str] = None

class PortfolioCreate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: int

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    transaction_type: str
    date: date
    amount: float
    price: float
    exchange_rate: float = 1.0
    commission: float = 0.0
    tax: float = 0.0
    risk_margin: float = 5.0
    usd_rate: Optional[float] = None

class TransactionCreate(TransactionBase):
    asset_id: int

class Transaction(TransactionBase):
    id: int
    asset_id: int

    class Config:
        from_attributes = True

class LotBase(BaseModel):
    buy_date: date
    initial_amount: float
    remaining_amount: float
    buy_price: float
    exchange_rate: Optional[float] = 1.0
    inflation_ref: Optional[float] = None

class LotCreate(LotBase):
    asset_id: int

class Lot(LotBase):
    id: int
    asset_id: int

    class Config:
        from_attributes = True

class CashLedgerBase(BaseModel):
    currency: str
    transaction_type: str
    amount: float
    date: date
    description: Optional[str] = None

class CashLedgerCreate(CashLedgerBase):
    pass

class CashLedger(CashLedgerBase):
    id: int

    class Config:
        from_attributes = True

class BenchmarkDataBase(BaseModel):
    date: date
    name: str
    value: float

class BenchmarkDataCreate(BenchmarkDataBase):
    pass

class BenchmarkData(BenchmarkDataBase):
    id: int

    class Config:
        from_attributes = True
