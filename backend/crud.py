from sqlalchemy.orm import Session
import models, schemas

def get_asset(db: Session, asset_id: int):
    return db.query(models.Asset).filter(models.Asset.id == asset_id).first()

def get_asset_by_symbol(db: Session, symbol: str):
    return db.query(models.Asset).filter(models.Asset.symbol == symbol).first()

def get_assets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Asset).offset(skip).limit(limit).all()

def create_asset(db: Session, asset: schemas.AssetCreate):
    db_asset = models.Asset(**asset.model_dump())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

def get_lots_for_asset(db: Session, asset_id: int):
    return db.query(models.Lot).filter(models.Lot.asset_id == asset_id, models.Lot.remaining_amount > 0).order_by(models.Lot.buy_date.asc()).all()

def create_transaction(db: Session, transaction: schemas.TransactionCreate):
    db_transaction = models.Transaction(**transaction.model_dump())
    
    # Automatically fetch USD rate if missing
    if db_transaction.usd_rate is None:
        try:
            from services.data_fetcher import get_usd_try_rate
            db_transaction.usd_rate = get_usd_try_rate()
        except Exception:
            pass
            
    db.add(db_transaction)
    
    # Lot and CashLedger logic
    asset = get_asset(db, transaction.asset_id)
    if not asset:
        raise ValueError("Asset not found")

    total_cost = transaction.amount * transaction.price

    if transaction.transaction_type == "BUY":
        # Create a new lot
        db_lot = models.Lot(
            asset_id=transaction.asset_id,
            buy_date=transaction.date,
            initial_amount=transaction.amount,
            remaining_amount=transaction.amount,
            buy_price=transaction.price,
            exchange_rate=transaction.exchange_rate,
            usd_rate=db_transaction.usd_rate,
        )
        db.add(db_lot)
        
        # Deduct cash (cost + commission)
        db_cash = models.CashLedger(
            currency=asset.currency,
            transaction_type="BUY",
            amount=-(total_cost + transaction.commission),
            date=transaction.date,
            description=f"Bought {transaction.amount} of {asset.symbol}"
        )
        db.add(db_cash)

    elif transaction.transaction_type == "SELL":
        # FIFO Logic
        sell_amount = transaction.amount
        lots = get_lots_for_asset(db, transaction.asset_id)
        from services.finance import calculate_compound_inflation
        
        realized_cost = 0.0
        realized_inflation_diff = 0.0

        for lot in lots:
            if sell_amount <= 0:
                break
            
            sold_from_lot = min(sell_amount, lot.remaining_amount)
            
            # Calculate realized cost and inflation for this sold fraction
            fraction_cost = sold_from_lot * lot.buy_price
            realized_cost += fraction_cost
            
            compound_factor = calculate_compound_inflation(db, lot.buy_date, transaction.date, asset.currency)
            realized_inflation_diff += fraction_cost * (compound_factor - 1.0)

            lot.remaining_amount -= sold_from_lot
            db.add(lot) # Explicitly ensure tracked
            sell_amount -= sold_from_lot
        
        if sell_amount > 0:
            raise ValueError("Not enough lots to sell")
            
        revenue = transaction.amount * transaction.price
        
        db_transaction.realized_cost = realized_cost
        db_transaction.realized_inflation_diff = realized_inflation_diff
        db_transaction.realized_profit = revenue - realized_cost
        
        # Add cash (proceeds - commission - tax)
        db_cash = models.CashLedger(
            currency=asset.currency,
            transaction_type="SELL",
            amount=revenue - transaction.commission - transaction.tax,
            date=transaction.date,
            description=f"Sold {transaction.amount} of {asset.symbol}"
        )
        db.add(db_cash)

    elif transaction.transaction_type == "DIVIDEND":
        # Dividend: amount field = total cash received, price = 0
        db_cash = models.CashLedger(
            currency=asset.currency,
            transaction_type="DIVIDEND",
            amount=transaction.amount - transaction.tax,  # Net of withholding tax
            date=transaction.date,
            description=f"Dividend from {asset.symbol}"
        )
        db.add(db_cash)
        
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def get_cash_ledger(db: Session, currency: str = None, transaction_type: str = None, start_date=None, end_date=None, skip: int = 0, limit: int = 100):
    query = db.query(models.CashLedger)
    if currency:
        query = query.filter(models.CashLedger.currency == currency)
    if transaction_type:
        query = query.filter(models.CashLedger.transaction_type == transaction_type)
    if start_date:
        query = query.filter(models.CashLedger.date >= start_date)
    if end_date:
        query = query.filter(models.CashLedger.date <= end_date)
    
    total = query.count()
    items = query.order_by(models.CashLedger.date.desc(), models.CashLedger.id.desc()).offset(skip).limit(limit).all()
    return items, total

def update_cash_transaction(db: Session, cash_id: int, data: dict):
    db_cash = db.query(models.CashLedger).filter(models.CashLedger.id == cash_id).first()
    if not db_cash:
        return None
    
    if "amount" in data: db_cash.amount = data["amount"]
    if "date" in data: 
        from datetime import datetime
        if isinstance(data["date"], str):
            db_cash.date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        else:
            db_cash.date = data["date"]
    if "description" in data: db_cash.description = data["description"]
    if "transaction_type" in data: db_cash.transaction_type = data["transaction_type"]
    if "currency" in data: db_cash.currency = data["currency"]
    
    db.commit()
    db.refresh(db_cash)
    return db_cash

def delete_cash_transaction(db: Session, cash_id: int):
    db_cash = db.query(models.CashLedger).filter(models.CashLedger.id == cash_id).first()
    if not db_cash:
        return False
    db.delete(db_cash)
    db.commit()
    return True

def create_cash_transaction(db: Session, cash: schemas.CashLedgerCreate):
    try:
        db_cash = models.CashLedger(**cash.model_dump())
        db.add(db_cash)
        db.commit()
        db.refresh(db_cash)
        return db_cash
    except Exception as e:
        import logging
        logging.error(f"DATABASE ERROR in create_cash_transaction: {e}")
        db.rollback()
        raise e
