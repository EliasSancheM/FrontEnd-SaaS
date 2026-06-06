import { api } from './api';
import type { Payment, PaymentProvider } from './types';

interface CheckoutResponse {
  checkout_url: string;
  [key: string]: unknown;
}

/**
 * Inicia un cobro online real: crea el Payment, pide el checkout a la pasarela
 * y devuelve la URL a la que se debe redirigir al pagador.
 *
 * Requiere credenciales de MercadoPago/PayPal configuradas en el backend.
 */
export async function startCheckout(
  invoiceId: number,
  amount: number,
  provider: Exclude<PaymentProvider, 'manual'>
): Promise<string> {
  const { data: payment } = await api.post<Payment>('/payments', {
    invoice_id: invoiceId,
    provider,
    amount,
    status: 'pending',
  });

  const { data } = await api.post<CheckoutResponse>(`/payments/${payment.id}/checkout`);

  if (!data.checkout_url) {
    throw new Error('La pasarela no devolvió una URL de pago.');
  }

  return data.checkout_url;
}
