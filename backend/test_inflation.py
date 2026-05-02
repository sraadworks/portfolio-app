"""
Test: Bileşik enflasyon hesaplama motoru doğrulama.

Senaryo:
- 5000 TL yatırım, 15 Ocak 2026'da alındı
- Bugün: 1 Mayıs 2026
- Aylık enflasyon oranları:
  Ocak: %2.9
  Şubat: %3.1
  Mart: %2.5
  Nisan: %2.0

Beklenen hesaplama:
  Ocak: 17/31 gün → (1.029)^(17/31)
  Şubat: 28/28 gün → (1.031)^1
  Mart: 31/31 gün → (1.025)^1
  Nisan: 30/30 gün → (1.020)^1
  
  Bileşik çarpan = hepsinin çarpımı
  Erime = 5000 × (çarpan - 1)
"""

from datetime import date
import calendar

# Simulate the exact same logic as finance.py
monthly_rates = {
    (2026, 1): 2.9,   # Ocak %2.9
    (2026, 2): 3.1,   # Şubat %3.1
    (2026, 3): 2.5,   # Mart %2.5
    (2026, 4): 2.0,   # Nisan %2.0
}

start_date = date(2026, 1, 15)
end_date = date(2026, 5, 1)
principal = 5000.0

compound_factor = 1.0
current_year = start_date.year
current_month = start_date.month

print("=" * 70)
print(f"Alış Tarihi: {start_date}")
print(f"Bugün:       {end_date}")
print(f"Ana Para:    {principal:,.2f} TL")
print("=" * 70)

while True:
    days_in_month = calendar.monthrange(current_year, current_month)[1]
    month_start = date(current_year, current_month, 1)
    month_end = date(current_year, current_month, days_in_month)

    period_start = max(start_date, month_start)

    if end_date > month_end:
        next_month = current_month + 1
        next_year = current_year
        if next_month > 12:
            next_month = 1
            next_year += 1
        period_end_exclusive = date(next_year, next_month, 1)
    else:
        period_end_exclusive = end_date

    effective_days = (period_end_exclusive - period_start).days
    monthly_rate = monthly_rates.get((current_year, current_month), 0.0)

    if effective_days > 0 and monthly_rate != 0.0:
        fraction = effective_days / days_in_month
        month_factor = (1 + monthly_rate / 100.0) ** fraction
        compound_factor *= month_factor
        print(f"  {current_year}-{current_month:02d}: oran=%{monthly_rate:.2f}, "
              f"gün={effective_days}/{days_in_month}, "
              f"pay={fraction:.4f}, "
              f"çarpan={month_factor:.6f}")
    elif effective_days > 0:
        print(f"  {current_year}-{current_month:02d}: VERİ YOK, gün={effective_days}/{days_in_month}")
    else:
        print(f"  {current_year}-{current_month:02d}: 0 gün (atlandı)")

    current_month += 1
    if current_month > 12:
        current_month = 1
        current_year += 1

    if date(current_year, current_month, 1) > end_date:
        break

print("=" * 70)
print(f"Toplam Bileşik Çarpan: {compound_factor:.6f}")
print(f"Toplam Enflasyon Oranı: %{(compound_factor - 1) * 100:.4f}")
print(f"Enflasyon Erimesi: {principal * (compound_factor - 1):,.2f} TL")
print(f"5000 TL'nin bugünkü reel değeri: {principal / compound_factor:,.2f} TL")
print("=" * 70)

# Manuel doğrulama
print("\n--- MANUEL DOĞRULAMA ---")
ocak = (1.029) ** (17/31)
subat = (1.031) ** 1
mart = (1.025) ** 1
nisan = (1.020) ** 1
manual = ocak * subat * mart * nisan
print(f"  Ocak çarpanı:  {ocak:.6f} [(1.029)^(17/31)]")
print(f"  Şubat çarpanı: {subat:.6f} [(1.031)^1]")
print(f"  Mart çarpanı:  {mart:.6f} [(1.025)^1]")
print(f"  Nisan çarpanı: {nisan:.6f} [(1.020)^1]")
print(f"  Manuel Bileşik: {manual:.6f}")
print(f"  Motor Bileşik:  {compound_factor:.6f}")
print(f"  Eşleşme: {'✅ DOĞRU' if abs(manual - compound_factor) < 0.000001 else '❌ HATALI'}")
