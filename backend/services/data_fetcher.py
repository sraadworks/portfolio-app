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
    Fetch the current price of an asset.
    BIST stocks need .IS appended for yfinance.
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
        fetch_symbol = f"{symbol}.IS"
        
    try:
        ticker = yf.Ticker(fetch_symbol)
        price = ticker.fast_info.get('lastPrice', None)
        if price is not None and price > 0:
            _cache[symbol] = float(price)
            return float(price)
        return 0.0
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        return 0.0
