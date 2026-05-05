'use server'

import { API_URL } from "../apiConfig";
import { revalidatePath } from 'next/cache';

export async function createAsset(formData: FormData) {
  const symbol = formData.get('symbol') as string;
  const name = formData.get('name') as string;
  const asset_type = formData.get('asset_type') as string;
  const currency = formData.get('currency') as string;
  const sector = formData.get('sector') as string;
  const manual_price_raw = formData.get('manual_price') as string;
  const manual_price = manual_price_raw ? parseFloat(manual_price_raw) : null;

  try {
    const res = await fetch(`${API_URL}/assets/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol,
        name,
        asset_type,
        currency,
        sector,
        manual_price,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Backend Error:', errText);
      try {
        const err = JSON.parse(errText);
        return { error: err.detail || 'Varlık oluşturulamadı.' };
      } catch {
        return { error: `Sunucu hatası: ${res.status}` };
      }
    }

    revalidatePath('/assets');
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    console.error('Fetch Error:', e);
    return { error: `Bağlantı hatası: ${e.message}` };
  }
}

export async function createTransaction(formData: FormData) {
  const asset_id = parseInt(formData.get('asset_id') as string);
  const transaction_type = formData.get('transaction_type') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const price = parseFloat(formData.get('price') as string);
  const commission = parseFloat(formData.get('commission') as string || '0');
  const tax = parseFloat(formData.get('tax') as string || '0');
  
  if (isNaN(amount) || amount <= 0 || isNaN(price) || price < 0) {
    return { error: 'Geçerli bir tutar ve fiyat giriniz.' };
  }

  const date_input = formData.get('date') as string;
  const date = date_input ? date_input : new Date().toISOString().split('T')[0];

  const res = await fetch(`${API_URL}/transactions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      asset_id,
      transaction_type,
      amount,
      price,
      date,
      exchange_rate: 1.0,
      commission,
      tax,
      risk_margin: parseFloat(formData.get('risk_margin') as string || '5'),
      usd_rate: formData.get('usd_rate') ? parseFloat(formData.get('usd_rate') as string) : null
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return { error: err.detail || 'İşlem kaydedilemedi.' };
  }

  revalidatePath('/assets');
  revalidatePath('/cash-ledger');
  revalidatePath('/');
  return { success: true };
}

export async function deleteAsset(assetId: number) {
  const res = await fetch(`${API_URL}/assets/${assetId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json();
    return { error: err.detail || 'Varlık silinemedi.' };
  }

  revalidatePath('/assets');
  revalidatePath('/');
  return { success: true };
}

export async function updateAsset(assetId: number, formData: FormData) {
  const symbol = formData.get('symbol') as string;
  const name = formData.get('name') as string;
  const asset_type = formData.get('asset_type') as string;
  const currency = formData.get('currency') as string;
  const sector = formData.get('sector') as string;
  const manual_price_raw = formData.get('manual_price') as string;
  const manual_price = manual_price_raw ? parseFloat(manual_price_raw) : null;

  const res = await fetch(`${API_URL}/assets/${assetId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, name, asset_type, currency, sector, manual_price }),
  });

  if (!res.ok) {
    const err = await res.json();
    return { error: err.detail || 'Varlık güncellenemedi.' };
  }

  revalidatePath('/assets');
  revalidatePath('/');
  return { success: true };
}
export async function getAssetTransactions(assetId: number) {
  const res = await fetch(`${API_URL}/transactions/${assetId}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function deleteTransaction(txId: number) {
  const res = await fetch(`${API_URL}/transactions/${txId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json();
    return { error: err.detail || 'İşlem silinemedi.' };
  }

  revalidatePath('/assets');
  revalidatePath('/cash-ledger');
  revalidatePath('/');
  return { success: true };
}

export async function updateTransaction(txId: number, formData: FormData) {
  const amount = parseFloat(formData.get('amount') as string);
  const price = parseFloat(formData.get('price') as string);
  const commission = parseFloat(formData.get('commission') as string || '0');
  const tax = parseFloat(formData.get('tax') as string || '0');
  const risk_margin = parseFloat(formData.get('risk_margin') as string || '5');
  const date = formData.get('date') as string;

  const payload: any = {};
  if (!isNaN(amount)) payload.amount = amount;
  if (!isNaN(price)) payload.price = price;
  if (!isNaN(commission)) payload.commission = commission;
  if (!isNaN(tax)) payload.tax = tax;
  if (!isNaN(risk_margin)) payload.risk_margin = risk_margin;
  if (date) payload.date = date;
  
  const usd_rate = formData.get('usd_rate') ? parseFloat(formData.get('usd_rate') as string) : null;
  if (usd_rate !== null && !isNaN(usd_rate)) payload.usd_rate = usd_rate;

  const res = await fetch(`${API_URL}/transactions/${txId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    return { error: err.detail || 'İşlem güncellenemedi.' };
  }

  revalidatePath('/assets');
  revalidatePath('/cash-ledger');
  revalidatePath('/');
  return { success: true };
}
