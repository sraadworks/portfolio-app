'use server'

import { API_URL } from "../apiConfig";
import { revalidatePath } from 'next/cache';

export async function createCashTransaction(formData: FormData) {
  const currency = formData.get('currency') as string;
  const transaction_type = formData.get('transaction_type') as string;
  const amountStr = formData.get('amount') as string;
  const description = formData.get('description') as string;

  const rawAmount = parseFloat(amountStr);
  if (isNaN(rawAmount) || rawAmount <= 0) {
    return { error: 'Geçerli bir tutar giriniz.' };
  }

  // If it's a withdraw, the amount should be negative in the ledger based on our backend logic.
  // Wait, the backend doesn't automatically negate unless we pass it. Let's send negative for WITHDRAW.
  const amount = transaction_type === 'WITHDRAW' ? -rawAmount : rawAmount;
  
  // Also we need to send today's date, but backend defaults to today.
  const date = new Date().toISOString().split('T')[0];

  try {
    const res = await fetch(`${API_URL}/cash-ledger/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currency,
        transaction_type,
        amount,
        date,
        description,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Backend Error:', errText);
      try {
        const err = JSON.parse(errText);
        return { error: err.detail || 'İşlem kaydedilemedi.' };
      } catch {
        return { error: `Sunucu hatası: ${res.status}` };
      }
    }

    revalidatePath('/cash-ledger');
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    console.error('Fetch Error:', e);
    return { error: `Bağlantı hatası: ${e.message}` };
  }
}

export async function updateCashTransaction(id: number, data: any) {
  const res = await fetch(`${API_URL}/cash-ledger/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    return { error: 'Güncelleme başarısız.' };
  }

  revalidatePath('/cash-ledger');
  revalidatePath('/');
  return { success: true };
}

export async function deleteCashTransaction(id: number) {
  const res = await fetch(`${API_URL}/cash-ledger/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    return { error: 'Silme işlemi başarısız.' };
  }

  revalidatePath('/cash-ledger');
  revalidatePath('/');
  return { success: true };
}
