import yfinance as yf
import requests
import xml.etree.ElementTree as ET
from datetime import date

# Cache to avoid excessive API calls
_cache = {}
_cache_date = None

def get_usd_try_rate():
    global _cache, _cache_date
    today = date.today()
    if _cache_date == today and 'USD_TRY' in _cache:
        return _cache['USD_TRY']
        
    try:
        # TCMB today.xml
        response = requests.get('https://www.tcmb.gov.tr/kurlar/today.xml', timeout=10)
        tree = ET.fromstring(response.content)
        for currency in tree.findall('Currency'):
            if currency.get('CurrencyCode') == 'USD':
                selling = currency.find('ForexSelling').text
                rate = float(selling.replace(',', '.'))
                _cache['USD_TRY'] = rate
                _cache_date = today
                return rate
    except Exception as e:
        print(f"TCMB error: {e}")
        
    # Fallback to yfinance if TCMB fails
    try:
        ticker = yf.Ticker("TRY=X")
        rate = ticker.fast_info['lastPrice']
        _cache['USD_TRY'] = rate
        _cache_date = today
        return rate
    except Exception:
        return 32.5 # Ultimate fallback MVP

def get_asset_price(symbol: str, asset_type: str):
    """
    Fetch the current price of an asset with multiple fallback methods.
    Does NOT cache 0.0 values to allow retries.
    """
    global _cache, _cache_date
    today = date.today()
    if _cache_date != today:
        _cache = {}
        _cache_date = today
        
    if symbol in _cache:
        return _cache[symbol]

    fetch_symbol = symbol
    if asset_type == 'BIST':
        # Ensure .IS is appended for BIST stocks
        if not symbol.upper().endswith(".IS"):
            fetch_symbol = f"{symbol.upper()}.IS"
        else:
            fetch_symbol = symbol.upper()
    else:
        fetch_symbol = symbol.upper()
        
    print(f"DEBUG: [Price Fetch] Starting for {fetch_symbol} (Type: {asset_type})")

    try:
        ticker = yf.Ticker(fetch_symbol)
        price = 0.0
        
        # Method 1: Fast Info (Quickest)
        try:
            p = ticker.fast_info.get('lastPrice', None)
            if p and p > 0 and not (isinstance(p, float) and (p != p)):
                price = float(p)
                print(f"DEBUG: [Price Fetch] Method 1 (FastInfo) success for {fetch_symbol}: {price}")
        except Exception as e:
            print(f"DEBUG: [Price Fetch] Method 1 failed for {fetch_symbol}: {e}")

        # Method 2: History (Most Reliable)
        if price <= 0:
            try:
                hist = ticker.history(period="1d")
                if not hist.empty:
                    price = float(hist['Close'].iloc[-1])
                    print(f"DEBUG: [Price Fetch] Method 2 (History) success for {fetch_symbol}: {price}")
            except Exception as e:
                print(f"DEBUG: [Price Fetch] Method 2 failed for {fetch_symbol}: {e}")

        # Method 3: Info (Fallback)
        if price <= 0:
            try:
                p = ticker.info.get('currentPrice') or ticker.info.get('regularMarketPrice')
                if p:
                    price = float(p)
                    print(f"DEBUG: [Price Fetch] Method 3 (Info) success for {fetch_symbol}: {price}")
            except Exception as e:
                print(f"DEBUG: [Price Fetch] Method 3 failed for {fetch_symbol}: {e}")

        if price > 0:
            _cache[symbol] = price
            return price
        
        print(f"WARNING: [Price Fetch] All methods FAILED for {fetch_symbol}")
        return 0.0
    except Exception as e:
        print(f"CRITICAL: [Price Fetch] Fatal error for {fetch_symbol}: {e}")
        return 0.0
