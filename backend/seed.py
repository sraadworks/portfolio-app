import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Asset, Transaction, Lot, CashLedger, ReferenceData
from datetime import date, timedelta

DATABASE_URL = "sqlite:///./portfolio.db"

# Drop the old database if it exists because we changed the schema
if os.path.exists("./portfolio.db"):
    os.remove("./portfolio.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Recreate tables with new schema
Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    
    # 1. Reference Data (CPI Mock Data)
    # Let's say today's CPI is 2200, and 3 months ago it was 2000.
    cpi_data = [
        ReferenceData(date=date.today().replace(day=1), cpi_value=2200.0),
        ReferenceData(date=(date.today() - timedelta(days=90)).replace(day=1), cpi_value=2000.0)
    ]
    db.add_all(cpi_data)

    # 2. Add Assets
    asset1 = Asset(symbol="THYAO", name="Türk Hava Yolları", asset_type="BIST", currency="TRY")
    asset2 = Asset(symbol="AAPL", name="Apple Inc.", asset_type="US", currency="USD")
    
    db.add(asset1)
    db.add(asset2)
    db.commit()
    db.refresh(asset1)
    db.refresh(asset2)

    # 3. Add Transactions and Lots
    # THYAO: Bought 3 months ago so it has inflation difference!
    t1 = Transaction(asset_id=asset1.id, transaction_type="BUY", amount=1000, price=225.0, date=date.today() - timedelta(days=90), commission=50.0, tax=0)
    lot1 = Lot(asset_id=asset1.id, initial_amount=1000, remaining_amount=1000, buy_price=225.0, buy_date=date.today() - timedelta(days=90))
    
    # AAPL: Bought today
    t2 = Transaction(asset_id=asset2.id, transaction_type="BUY", amount=10, price=180.0, date=date.today(), commission=2.0, tax=0)
    lot2 = Lot(asset_id=asset2.id, initial_amount=10, remaining_amount=10, buy_price=180.0, buy_date=date.today())
    
    db.add_all([t1, t2, lot1, lot2])

    # 4. Add Cash Ledger
    cash1 = CashLedger(currency="TRY", transaction_type="DEPOSIT", amount=500000.0, date=date.today(), description="Initial Deposit")
    cash2 = CashLedger(currency="TRY", transaction_type="WITHDRAW", amount=-225000.0, date=date.today() - timedelta(days=90), description="THYAO Alımı")
    cash3 = CashLedger(currency="USD", transaction_type="DEPOSIT", amount=10000.0, date=date.today(), description="Initial USD Deposit")
    cash4 = CashLedger(currency="USD", transaction_type="WITHDRAW", amount=-1800.0, date=date.today(), description="AAPL Alımı")
    
    db.add_all([cash1, cash2, cash3, cash4])
    
    db.commit()
    db.close()
    print("Database re-created and seeded successfully with new schema and mock CPI data.")

if __name__ == "__main__":
    print("Seeding database...")
    seed()
