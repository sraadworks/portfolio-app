'use server'

import { revalidatePath } from 'next/cache';

export async function addCpiEntry(formData: FormData) {
  const date_str = formData.get('date') as string;
  const cpi_value = parseFloat(formData.get('cpi_value') as string);

  const currency = formData.get('currency') as string || 'TRY';

  if (!date_str || isNaN(cpi_value)) {
    return { error: 'Geçerli bir tarih ve enflasyon oranı giriniz.' };
  }

  // Convert date to first of month format (YYYY-MM-01)
  const d = new Date(date_str);
  const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;

  const res = await fetch(`http://127.0.0.1:8000/reference-data/?date_str=${formatted}&cpi_value=${cpi_value}&currency=${currency}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const err = await res.json();
    return { error: err.detail || 'Enflasyon verisi kaydedilemedi.' };
  }

  revalidatePath('/reference-data');
  revalidatePath('/assets');
  revalidatePath('/');
  return { success: true };
}

export async function updateCpiEntry(id: number, formData: FormData) {
  const cpi_value = parseFloat(formData.get('cpi_value') as string);

  if (isNaN(cpi_value)) {
    return { error: 'Geçerli bir enflasyon oranı giriniz.' };
  }

  const res = await fetch(`http://127.0.0.1:8000/reference-data/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cpi_value }),
  });

  if (!res.ok) {
    const err = await res.json();
    return { error: err.detail || 'Güncelleme başarısız.' };
  }

  revalidatePath('/reference-data');
  revalidatePath('/assets');
  revalidatePath('/');
  return { success: true };
}

export async function deleteCpiEntry(id: number) {
  const res = await fetch(`http://127.0.0.1:8000/reference-data/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    return { error: 'Silme işlemi başarısız.' };
  }

  revalidatePath('/reference-data');
  revalidatePath('/assets');
  revalidatePath('/');
  return { success: true };
}
