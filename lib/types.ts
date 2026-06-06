/**
 * Tipos que reflejan EXACTAMENTE las respuestas de la API de Laravel.
 * No inventar campos: si el backend no lo devuelve, no va aquí.
 */

export type ClientStatus = 'active' | 'inactive';

export interface Client {
  id: number;
  tenant_id: number;
  name: string;
  rut: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceItem {
  id: number;
  tenant_id: number;
  invoice_id: number;
  description: string;
  quantity: string;
  unit_price: string;
  total: string;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  tenant_id: number;
  client_id: number;
  number: string;
  issue_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  currency: string;
  tax_rate: string;
  subtotal: string;
  tax_total: string;
  total: string;
  notes: string | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  // Cargados por /invoices/{id} (show)
  client?: Client;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export type PaymentProvider = 'manual' | 'mercadopago' | 'paypal';

export interface Payment {
  id: number;
  tenant_id: number;
  invoice_id: number;
  provider: PaymentProvider;
  provider_payment_id: string | null;
  paypal_order_id: string | null;
  paypal_payer_id: string | null;
  amount: string;
  status: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Envoltura estándar de Laravel paginate(). */
export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
