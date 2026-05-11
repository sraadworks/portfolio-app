import logging
import sys

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

import models, schemas, crud
from database import engine, get_db

try:
    logger.info("Connecting to database and creating tables...")
    models.Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully.")
    
    # Manual migration for existing databases
    from sqlalchemy import text
    with engine.connect() as conn:
        # Check assets table for portfolio_id
        try:
            conn.execute(text("SELECT portfolio_id FROM assets LIMIT 1"))
        except Exception:
            logger.info("Migration: Adding portfolio_id column to assets table...")
            try:
                conn.execute(text("ALTER TABLE assets ADD COLUMN portfolio_id INTEGER"))
                # Note: SQLite doesn't support 'REFERENCES' in ALTER TABLE easily, 
                # but we'll handle foreign keys at the application level if needed.
                conn.commit()
            except Exception as e:
                logger.error(f"Manual migration failed: {e}")
except Exception as e:
    logger.error(f"Error during database initialization: {e}")
    # Don't exit yet, let's see if FastAPI can at least start

app = FastAPI(title="Portfolio Management MVP API")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Portfolio MVP API is running"}

@app.post("/assets/", response_model=schemas.Asset)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    db_asset = crud.get_asset_by_symbol(db, symbol=asset.symbol)
    if db_asset:
        raise HTTPException(status_code=400, detail="Symbol already registered")
    return crud.create_asset(db=db, asset=asset)

@app.delete("/assets/{asset_id}")
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = crud.get_asset(db, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    # Delete related records first
    db.query(models.Transaction).filter(models.Transaction.asset_id == asset_id).delete()
    db.query(models.Lot).filter(models.Lot.asset_id == asset_id).delete()
    db.delete(asset)
    db.commit()
    return {"message": "Deleted"}

@app.put("/assets/{asset_id}", response_model=schemas.Asset)
def update_asset(asset_id: int, asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    db_asset = crud.get_asset(db, asset_id)
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Explicitly update fields from the request
    update_data = asset.model_dump(exclude_unset=False) # Ensure we get everything
    for key, value in update_data.items():
        setattr(db_asset, key, value)
        
    db.commit()
    db.refresh(db_asset)
    return db_asset

@app.get("/portfolio/performance")
def get_portfolio_performance(db: Session = Depends(get_db)):
    from datetime import datetime, timedelta
    import math
    import yfinance as yf
    import pandas as pd
    
    # 1. Get Manual Benchmark Data from DB
    manual_benchmarks = db.query(models.BenchmarkData).all()
    bench_map = {}
    active_benchmarks = set()
    for b in manual_benchmarks:
        d_str = b.date.strftime("%Y-%m-%d")
        if d_str not in bench_map: bench_map[d_str] = {}
        bench_map[d_str][b.name] = b.value
        active_benchmarks.add(b.name)
    
    # 2. Setup date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    
    # 3. Optional: Auto-fetch BIST100 if requested or if no manual data exists but we want a default?
    # User said: "sadece Portfoyumuz olsun. Eğer biz bir karşılaştırma varlığı eklersek onunla değerlendirilsin."
    # So we only show what's in 'active_benchmarks'.
    
    data = []
    for i in range(366):
        current_date = start_date + timedelta(days=i)
        d_str = current_date.strftime("%Y-%m-%d")
        day_idx = i / 365.0
        
        # Portfolio Mock (Real calculation should happen here)
        p_val = (math.sin(day_idx * 15) * 5) + (day_idx * 20) + (i % 5)
        
        row = {
            "date": d_str,
            "Portföy": round(p_val, 2)
        }
        
        # Add manual benchmarks
        if d_str in bench_map:
            for name, val in bench_map[d_str].items():
                row[name] = val
        
        data.append(row)
    
    return {
        "data": data,
        "available_benchmarks": list(active_benchmarks)
    }

@app.get("/benchmark-data/sync/{name}")
def sync_benchmark_data(name: str, db: Session = Depends(get_db)):
    import yfinance as yf
    symbol_map = {
        "BIST100": "XU100.IS",
        "SP500": "^GSPC",
        "GOLD": "GC=F",
        "USDTRY": "USDTRY=X"
    }
    symbol = symbol_map.get(name.upper())
    if not symbol:
        raise HTTPException(status_code=400, detail="Desteklenmeyen endeks")
    
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period="1y")
    
    count = 0
    for date, row in hist.iterrows():
        d = date.date()
        val = float(row['Close'])
        # Upsert
        db_data = db.query(models.BenchmarkData).filter(models.BenchmarkData.date == d, models.BenchmarkData.name == name.upper()).first()
        if db_data:
            db_data.value = val
        else:
            db_data = models.BenchmarkData(date=d, name=name.upper(), value=val)
            db.add(db_data)
        count += 1
    
    db.commit()
    return {"message": f"{count} veri senkronize edildi", "name": name.upper()}

@app.get("/benchmark-data/", response_model=List[schemas.BenchmarkData])
def read_benchmark_data(db: Session = Depends(get_db)):
    return db.query(models.BenchmarkData).order_by(models.BenchmarkData.date.desc()).all()

@app.post("/benchmark-data/", response_model=schemas.BenchmarkData)
def create_benchmark_data(data: schemas.BenchmarkDataCreate, db: Session = Depends(get_db)):
    db_data = models.BenchmarkData(**data.dict())
    db.add(db_data)
    try:
        db.commit()
    except:
        db.rollback()
        # If exists, update
        db_data = db.query(models.BenchmarkData).filter(models.BenchmarkData.date == data.date, models.BenchmarkData.name == data.name).first()
        db_data.value = data.value
        db.commit()
    db.refresh(db_data)
    return db_data

@app.get("/assets/", response_model=List[schemas.AssetPerformance])
def read_assets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    assets = crud.get_assets(db, skip=skip, limit=limit)
    from services.data_fetcher import get_asset_price
    from services.finance import calculate_inflation_difference, calculate_compound_inflation
    from models import Transaction
    
    performances = []
    
    for asset in assets:
        lots = crud.get_lots_for_asset(db, asset.id)
        txs = db.query(Transaction).filter(Transaction.asset_id == asset.id).all()
        buy_txs = [tx for tx in txs if tx.transaction_type == 'BUY']
        sell_txs = [tx for tx in txs if tx.transaction_type == 'SELL']

        # Use amount-weighted average rates across all BUY transactions
        total_buy_amount = sum(tx.amount for tx in buy_txs) if buy_txs else 1.0
        if buy_txs and total_buy_amount > 0:
            tax_rate = sum((tx.tax or 0.0) * tx.amount for tx in buy_txs) / total_buy_amount
            mgmt_fee_rate = sum((tx.commission or 0.0) * tx.amount for tx in buy_txs) / total_buy_amount
            risk_margin_rate = sum((tx.risk_margin or 5.0) * tx.amount for tx in buy_txs) / total_buy_amount
        else:
            tax_rate = 0.0
            mgmt_fee_rate = 0.0
            risk_margin_rate = 5.0

        # 1. Realized Metrics (Kapanan/Satılan Kısımlar)
        realized_cost = sum(tx.realized_cost for tx in sell_txs)
        realized_revenue = sum(tx.amount * tx.price for tx in sell_txs)
        
        realized_inflation_diff = 0.0
        for tx in sell_txs:
             # Find approximate buy date (oldest lot for now, or improve later)
             if buy_txs:
                 oldest_buy = min(buy_txs, key=lambda x: x.date)
                 compound_factor = calculate_compound_inflation(db, oldest_buy.date, tx.date, asset.currency)
                 realized_inflation_diff += tx.realized_cost * (compound_factor - 1.0)
             else:
                 realized_inflation_diff += tx.realized_inflation_diff # Fallback
        
        realized_gross_profit = realized_revenue - realized_cost

        # Realized commission/tax: use SELL tx's own rate if set, else fall back to BUY weighted avg
        realized_commission = sum(
            max(0.0, tx.realized_profit) * ((tx.commission if tx.commission > 0 else mgmt_fee_rate) / 100.0)
            for tx in sell_txs
        )
        realized_tax = sum(
            max(0.0, tx.realized_profit - max(0.0, tx.realized_profit) * ((tx.commission if tx.commission > 0 else mgmt_fee_rate) / 100.0)) *
            ((tx.tax if tx.tax > 0 else tax_rate) / 100.0)
            for tx in sell_txs
        )
        
        realized_net_profit = realized_gross_profit - realized_commission - realized_tax
        realized_real_net_profit = realized_net_profit - realized_inflation_diff
        
        realized_risk_margin_amount = max(0.0, realized_real_net_profit) * (risk_margin_rate / 100.0)
        realized_risk_margin_profit = realized_real_net_profit - realized_risk_margin_amount
        
        realized_holding_days = 0
        if sell_txs and buy_txs:
            oldest_buy = min(buy_txs, key=lambda x: x.date).date
            latest_sell = max(sell_txs, key=lambda x: x.date).date
            realized_holding_days = (latest_sell - oldest_buy).days

        # 2. Active Metrics (Elimizde Kalan Kısımlar)
        active_quantity = sum(lot.remaining_amount for lot in lots)
        active_cost = sum(lot.remaining_amount * lot.buy_price for lot in lots)

        current_price = 0.0
        if active_quantity > 0:
            if asset.manual_price is not None and asset.manual_price > 0:
                current_price = asset.manual_price
            else:
                fetched = get_asset_price(asset.symbol, asset.asset_type)
                current_price = fetched if fetched is not None else 0.0
                if current_price == 0.0:
                     current_price = active_cost / active_quantity
                 
        active_value = active_quantity * current_price
        active_gross_profit = active_value - active_cost
        
        active_estimated_commission = max(0.0, active_gross_profit) * (mgmt_fee_rate / 100.0)
        active_profit_before_tax = active_gross_profit - active_estimated_commission
        active_estimated_tax = max(0.0, active_profit_before_tax) * (tax_rate / 100.0)
        
        active_net_profit = active_gross_profit - active_estimated_commission - active_estimated_tax
        active_inflation_diff = calculate_inflation_difference(db, lots, asset.currency)
        active_real_net_profit = active_net_profit - active_inflation_diff
        
        active_risk_margin_amount = max(0.0, active_real_net_profit) * (risk_margin_rate / 100.0)
        active_risk_margin_profit = active_real_net_profit - active_risk_margin_amount
        active_profit_loss_percent = (active_gross_profit / active_cost * 100) if active_cost > 0 else 0.0
        
        active_holding_days = 0
        if active_quantity > 0 and lots:
            oldest_lot_date = min(lots, key=lambda x: x.buy_date).buy_date
            active_holding_days = (date.today() - oldest_lot_date).days

        # 2.5 USD Performance Logic (New)
        from services.data_fetcher import get_usd_try_rate
        current_usd_rate = get_usd_try_rate()
        active_usd_cost = 0.0
        active_usd_value = 0.0
        active_usd_profit = 0.0
        active_usd_percent = 0.0

        if asset.currency == 'TRY':
            for lot in lots:
                lot_usd_rate = lot.usd_rate if (lot.usd_rate and lot.usd_rate > 0) else current_usd_rate
                active_usd_cost += (lot.remaining_amount * lot.buy_price) / lot_usd_rate
            
            active_usd_value = active_value / current_usd_rate
            active_usd_profit = active_usd_value - active_usd_cost
            active_usd_percent = (active_usd_profit / active_usd_cost * 100) if active_usd_cost > 0 else 0.0
        else:
            active_usd_cost = active_cost
            active_usd_value = active_value
            active_usd_profit = active_gross_profit
            active_usd_percent = active_profit_loss_percent

        # 3. Total Metrics (Tüm Tarihsel Performans)
        total_dividend = sum(tx.amount for tx in txs if tx.transaction_type == 'DIVIDEND')
        total_commission = active_estimated_commission + realized_commission
        total_tax = active_estimated_tax + realized_tax
        
        total_cost = sum(tx.amount * tx.price for tx in buy_txs)
        total_gross_profit = active_gross_profit + realized_gross_profit + total_dividend
        total_net_profit = total_gross_profit - total_commission - total_tax
        total_inflation_diff = active_inflation_diff + realized_inflation_diff
        total_real_net_profit = total_net_profit - total_inflation_diff
        total_risk_margin_profit = active_risk_margin_profit + realized_risk_margin_profit

        performances.append(schemas.AssetPerformance(
            id=asset.id,
            symbol=asset.symbol,
            name=asset.name,
            asset_type=asset.asset_type,
            currency=asset.currency,
            manual_price=asset.manual_price,
            
            # Active
            active_quantity=active_quantity,
            current_price=current_price,
            active_value=active_value,
            active_cost=active_cost,
            active_gross_profit=active_gross_profit,
            active_commission=active_estimated_commission,
            active_tax=active_estimated_tax,
            active_net_profit=active_net_profit,
            active_inflation_diff=active_inflation_diff,
            active_real_net_profit=active_real_net_profit,
            active_risk_margin_profit=active_risk_margin_profit,
            active_profit_loss_percent=active_profit_loss_percent,
            active_holding_days=active_holding_days,
            active_usd_cost=active_usd_cost,
            active_usd_value=active_usd_value,
            active_usd_profit=active_usd_profit,
            active_usd_percent=active_usd_percent,
            
            # Realized
            realized_cost=realized_cost,
            realized_revenue=realized_revenue,
            realized_gross_profit=realized_gross_profit,
            realized_commission=realized_commission,
            realized_tax=realized_tax,
            realized_net_profit=realized_net_profit,
            realized_inflation_diff=realized_inflation_diff,
            realized_real_net_profit=realized_real_net_profit,
            realized_risk_margin_profit=realized_risk_margin_profit,
            realized_holding_days=realized_holding_days,
            
            # Total
            total_cost=total_cost,
            total_dividend=total_dividend,
            total_commission=total_commission,
            total_tax=total_tax,
            total_gross_profit=total_gross_profit,
            total_net_profit=total_net_profit,
            total_inflation_diff=total_inflation_diff,
            total_real_net_profit=total_real_net_profit,
            total_risk_margin_profit=total_risk_margin_profit,
            
            risk_margin_rate=risk_margin_rate,
            portfolio_name=asset.portfolio.name if asset.portfolio else None
        ))
        
    return performances

@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_transaction(db=db, transaction=transaction)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/transactions/{asset_id}")
def get_transactions_for_asset(asset_id: int, db: Session = Depends(get_db)):
    txs = db.query(models.Transaction).filter(models.Transaction.asset_id == asset_id).order_by(models.Transaction.date.desc()).all()
    result = []
    for tx in txs:
        result.append({
            "id": tx.id,
            "asset_id": tx.asset_id,
            "transaction_type": tx.transaction_type,
            "amount": tx.amount,
            "price": tx.price,
            "date": str(tx.date),
            "commission": tx.commission,
            "tax": tx.tax,
            "risk_margin": tx.risk_margin,
            "usd_rate": tx.usd_rate
        })
    return result

@app.put("/transactions/{tx_id}")
def update_transaction(tx_id: int, data: dict, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update transaction fields
    if "amount" in data: tx.amount = data["amount"]
    if "price" in data: tx.price = data["price"]
    if "commission" in data: tx.commission = data["commission"]
    if "tax" in data: tx.tax = data["tax"]
    if "risk_margin" in data: tx.risk_margin = data["risk_margin"]
    if "usd_rate" in data: tx.usd_rate = data["usd_rate"]
    
    old_date = tx.date
    if "date" in data:
        from datetime import datetime
        tx.date = datetime.strptime(data["date"], "%Y-%m-%d").date()
    
    # Also update the corresponding lot's buy_price and amount if BUY
    if tx.transaction_type == "BUY":
        lot = db.query(models.Lot).filter(
            models.Lot.asset_id == tx.asset_id,
            models.Lot.buy_date == old_date
        ).first()
        if lot:
            if "price" in data: lot.buy_price = data["price"]
            if "amount" in data:
                lot.initial_amount = data["amount"]
                lot.remaining_amount = data["amount"]
            if "date" in data:
                lot.buy_date = tx.date
    
    db.commit()
    return {"message": "Updated"}

@app.delete("/transactions/{tx_id}")
def delete_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Delete corresponding lot if BUY
    if tx.transaction_type == "BUY":
        lot = db.query(models.Lot).filter(
            models.Lot.asset_id == tx.asset_id,
            models.Lot.buy_date == tx.date
        ).first()
        if lot:
            db.delete(lot)
    
    db.delete(tx)
    db.commit()
    return {"message": "Deleted"}

@app.get("/lots/{asset_id}", response_model=List[schemas.Lot])
def read_lots(asset_id: int, db: Session = Depends(get_db)):
    lots = crud.get_lots_for_asset(db, asset_id=asset_id)
    return lots

@app.get("/cash-ledger/summary")
def get_cash_summary(db: Session = Depends(get_db)):
    # Total balances per currency
    try_total = db.query(func.sum(models.CashLedger.amount)).filter(models.CashLedger.currency == "TRY").scalar() or 0.0
    usd_total = db.query(func.sum(models.CashLedger.amount)).filter(models.CashLedger.currency == "USD").scalar() or 0.0
    return {"TRY": try_total, "USD": usd_total}

@app.get("/market-data/usd-rate")
def get_current_usd_rate():
    from services.data_fetcher import get_usd_try_rate
    rate = get_usd_try_rate()
    return {"rate": rate}

@app.get("/cash-ledger/")
def read_cash_ledger(
    currency: str = None, 
    type: str = None,
    start_date: str = None,
    end_date: str = None,
    skip: int = 0, 
    limit: int = 20, 
    db: Session = Depends(get_db)
):
    from datetime import datetime
    s_date = datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else None
    e_date = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else None
    
    items, total = crud.get_cash_ledger(db, currency=currency, transaction_type=type, start_date=s_date, end_date=e_date, skip=skip, limit=limit)
    return {"items": items, "total": total}

@app.put("/cash-ledger/{cash_id}")
def update_cash_transaction(cash_id: int, data: dict, db: Session = Depends(get_db)):
    res = crud.update_cash_transaction(db, cash_id, data)
    if not res:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    return res

@app.delete("/cash-ledger/{cash_id}")
def delete_cash_transaction(cash_id: int, db: Session = Depends(get_db)):
    res = crud.delete_cash_transaction(db, cash_id)
    if not res:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    return {"message": "Deleted"}

@app.post("/cash-ledger/", response_model=schemas.CashLedger)
def create_cash_transaction(cash: schemas.CashLedgerCreate, db: Session = Depends(get_db)):
    return crud.create_cash_transaction(db=db, cash=cash)

# --- Reference Data (CPI/TÜFE) ---
@app.get("/reference-data/")
def read_reference_data(db: Session = Depends(get_db)):
    return db.query(models.ReferenceData).order_by(models.ReferenceData.date.desc()).all()

@app.post("/reference-data/")
def create_reference_data(date_str: str, cpi_value: float, currency: str = "TRY", db: Session = Depends(get_db)):
    from datetime import datetime
    d = datetime.strptime(date_str, "%Y-%m-%d").date()
    existing = db.query(models.ReferenceData).filter(
        models.ReferenceData.date == d,
        models.ReferenceData.currency == currency
    ).first()
    if existing:
        existing.cpi_value = cpi_value
        db.commit()
        return {"message": "Updated", "date": str(d), "cpi_value": cpi_value, "currency": currency}
    ref = models.ReferenceData(date=d, cpi_value=cpi_value, currency=currency)
    db.add(ref)
    db.commit()
    return {"message": "Created", "date": str(d), "cpi_value": cpi_value, "currency": currency}

@app.put("/reference-data/{ref_id}")
def update_reference_data(ref_id: int, data: dict, db: Session = Depends(get_db)):
    ref = db.query(models.ReferenceData).filter(models.ReferenceData.id == ref_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    if "cpi_value" in data:
        ref.cpi_value = data["cpi_value"]
    db.commit()
    return {"message": "Updated", "id": ref_id}

@app.delete("/reference-data/{ref_id}")
def delete_reference_data(ref_id: int, db: Session = Depends(get_db)):
    ref = db.query(models.ReferenceData).filter(models.ReferenceData.id == ref_id).first()
    if not ref:
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    db.delete(ref)
    db.commit()
    return {"message": "Deleted", "id": ref_id}

# --- Portfolios ---
@app.get("/portfolios/", response_model=List[schemas.Portfolio])
def read_portfolios(db: Session = Depends(get_db)):
    return crud.get_portfolios(db)

@app.post("/portfolios/", response_model=schemas.Portfolio)
def create_portfolio(portfolio: schemas.PortfolioCreate, db: Session = Depends(get_db)):
    return crud.create_portfolio(db=db, portfolio=portfolio)

@app.delete("/portfolios/{portfolio_id}")
def delete_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    res = crud.delete_portfolio(db, portfolio_id)
    if not res:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return {"message": "Deleted"}

@app.put("/assets/{asset_id}/portfolio")
def update_asset_portfolio(asset_id: int, portfolio_id: Optional[int] = None, db: Session = Depends(get_db)):
    # Using Optional[int] = None for clarity, but the JSON body will dictate the value.
    # Actually, let's use a simple dict for the body to be flexible
    res = crud.update_asset_portfolio(db, asset_id, portfolio_id)
    if not res:
        raise HTTPException(status_code=404, detail="Asset not found")
    return res
