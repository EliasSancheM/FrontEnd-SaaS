import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Invoice, InvoiceStatus, Paginated } from './types';

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface CreateInvoiceInput {
  client_id: number;
  number: string;
  issue_date: string;
  due_date?: string | null;
  status?: InvoiceStatus;
  currency?: string;
  tax_rate?: number;
  notes?: string | null;
  items: InvoiceItemInput[];
}

const invoicesKey = ['invoices'] as const;

/** Lista de facturas del tenant (primera página). */
export function useInvoices() {
  return useQuery({
    queryKey: invoicesKey,
    queryFn: async (): Promise<Invoice[]> => {
      const { data } = await api.get<Paginated<Invoice>>('/invoices');
      return data.data;
    },
  });
}

/** Una factura con cliente, items y pagos (endpoint show). */
export function useInvoice(id: number | string | undefined) {
  return useQuery({
    queryKey: ['invoices', Number(id)],
    enabled: id !== undefined && id !== null && id !== '',
    queryFn: async (): Promise<Invoice> => {
      const { data } = await api.get<Invoice>(`/invoices/${id}`);
      return data;
    },
  });
}

/**
 * Crea la cabecera de la factura y luego sus items. El backend deriva
 * subtotal/tax_total/total a partir de los items y la tasa de IVA.
 */
export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateInvoiceInput): Promise<Invoice> => {
      const { items, ...header } = input;
      const { data: invoice } = await api.post<Invoice>('/invoices', {
        ...header,
        currency: header.currency ?? 'CLP',
        tax_rate: header.tax_rate ?? 19,
        status: header.status ?? 'sent',
      });

      for (let i = 0; i < items.length; i++) {
        await api.post('/invoice-items', {
          invoice_id: invoice.id,
          description: items[i].description,
          quantity: items[i].quantity,
          unit_price: items[i].unit_price,
          total: items[i].quantity * items[i].unit_price,
          sort_order: i,
        });
      }

      return invoice;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: invoicesKey }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: Partial<Invoice> }): Promise<Invoice> => {
      const { data } = await api.put<Invoice>(`/invoices/${id}`, input);
      return data;
    },
    onSuccess: (invoice) => {
      qc.invalidateQueries({ queryKey: invoicesKey });
      qc.invalidateQueries({ queryKey: ['invoices', invoice.id] });
    },
  });
}

/** Marca una factura como pagada (PUT status=paid). */
export function useMarkInvoicePaid() {
  const update = useUpdateInvoice();
  return {
    ...update,
    mutate: (id: number, opts?: Parameters<typeof update.mutate>[1]) =>
      update.mutate({ id, input: { status: 'paid' } }, opts),
  };
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/invoices/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: invoicesKey }),
  });
}

/**
 * Descarga el PDF de una factura. Se hace vía axios (no <a href>) para que
 * viaje el token Bearer de Sanctum en el header Authorization.
 */
export async function downloadInvoicePdf(id: number, number: string): Promise<void> {
  const { data } = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = `factura-${number}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/** Envía la factura por correo (POST /invoices/{id}/send). */
export async function sendInvoice(id: number): Promise<void> {
  await api.post(`/invoices/${id}/send`);
}
