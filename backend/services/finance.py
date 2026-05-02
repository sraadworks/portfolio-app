from sqlalchemy.orm import Session
from models import ReferenceData, Lot
from datetime import date
import calendar


def get_monthly_rate(db: Session, year: int, month: int, currency: str = "TRY") -> float:
    """
    Returns the monthly inflation rate (%) for the given year/month and currency.
    Data is stored with date as the 1st of each month.
    Returns 0.0 if no data exists for that month.
    """
    target_date = date(year, month, 1)
    ref = db.query(ReferenceData).filter(
        ReferenceData.date == target_date,
        ReferenceData.currency == currency
    ).first()
    if ref:
        return ref.cpi_value  # e.g. 2.9 means 2.9%
    return 0.0


def calculate_compound_inflation(db: Session, start_date: date, end_date: date, currency: str = "TRY") -> float:
    """
    Aylık bileşik enflasyon çarpanını hesaplar (start_date → end_date) belirli bir para birimi için.
    """
    if start_date >= end_date:
        return 1.0

    compound_factor = 1.0
    current_year = start_date.year
    current_month = start_date.month

    while True:
        days_in_month = calendar.monthrange(current_year, current_month)[1]
        month_start = date(current_year, current_month, 1)
        month_end = date(current_year, current_month, days_in_month)

        # Bu ay içinde varlığın elde tutulduğu dönemin başlangıcı
        period_start = max(start_date, month_start)

        # Bu ay içinde varlığın elde tutulduğu dönemin bitişi (exclusive)
        if end_date > month_end:
            # Ay sonunu geçtik → bir sonraki ayın 1'ine kadar
            next_month = current_month + 1
            next_year = current_year
            if next_month > 12:
                next_month = 1
                next_year += 1
            period_end_exclusive = date(next_year, next_month, 1)
        else:
            # end_date bu ayın içinde → end_date'e kadar (exclusive)
            period_end_exclusive = end_date

        effective_days = (period_end_exclusive - period_start).days

        if effective_days > 0:
            monthly_rate = get_monthly_rate(db, current_year, current_month, currency)
            if monthly_rate != 0.0:
                # Kısmi ay oranı: (1 + aylık_oran/100) ^ (gün/aydaki_gün)
                fraction = effective_days / days_in_month
                month_factor = (1 + monthly_rate / 100.0) ** fraction
                compound_factor *= month_factor

        # Sonraki aya geç
        current_month += 1
        if current_month > 12:
            current_month = 1
            current_year += 1

        # end_date'i geçtiysek dur
        if date(current_year, current_month, 1) > end_date:
            break

    return compound_factor


def calculate_inflation_difference(db: Session, lots: list[Lot], currency: str = "TRY") -> float:
    """
    Tüm aktif lotlar için toplam enflasyon erimesini hesaplar.
    Varlığın para birimine göre (TRY veya USD) enflasyon oranı kullanılır.
    """
    today = date.today()
    total_erosion = 0.0

    for lot in lots:
        if lot.remaining_amount <= 0:
            continue

        principal = lot.remaining_amount * lot.buy_price
        compound_factor = calculate_compound_inflation(db, lot.buy_date, today, currency)
        erosion = principal * (compound_factor - 1.0)
        total_erosion += erosion

    return total_erosion
