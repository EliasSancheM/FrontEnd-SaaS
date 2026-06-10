'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  DollarSign,
  Clock,
  CheckCircle2,
  Eye,
  FileDown,
  CreditCard,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useInvoices, useMarkInvoicePaid, downloadInvoicePdf } from '@/lib/invoices';
import { useClients } from '@/lib/clients';
import { money, invoiceStatusLabel, toNumber } from '@/lib/format';

const toastStyle = {
  style: {
    background: 'var(--color-card)',
    color: 'var(--color-foreground)',
    border: '1px solid var(--color-border)',
  },
};

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const { data: invoices = [], isLoading, isError, refetch } = useInvoices();
  const { data: clients = [] } = useClients();
  const markPaid = useMarkInvoicePaid();

  // Mapa id -> nombre de cliente para mostrar la razón social en la tabla.
  const clientName = useMemo(() => {
    const map = new Map<number, string>();
    clients.forEach((c) => map.set(c.id, c.name));
    return (id: number) => map.get(id) ?? `Cliente #${id}`;
  }, [clients]);

  const handleDownloadPdf = async (id: number, number: string) => {
    const t = toast.loading(`Generando PDF de ${number}...`, toastStyle);
    try {
      await downloadInvoicePdf(id, number);
      toast.success(`PDF de ${number} descargado`, { id: t, ...toastStyle });
    } catch {
      toast.error('No se pudo descargar el PDF', { id: t, ...toastStyle });
    }
  };

  const handleMarkAsPaid = (id: number, number: string) => {
    markPaid.mutate(id, {
      onSuccess: () => toast.success(`Factura ${number} marcada como PAGADA`, { icon: '💰', ...toastStyle }),
      onError: () => toast.error('No se pudo actualizar la factura', toastStyle),
    });
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      invoice.number.toLowerCase().includes(term) ||
      clientName(invoice.client_id).toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'paid' && invoice.status === 'paid') ||
      (statusFilter === 'pending' && (invoice.status === 'sent' || invoice.status === 'draft')) ||
      (statusFilter === 'overdue' && invoice.status === 'overdue');
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((acc, inv) => acc + toNumber(inv.total), 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((acc, inv) => acc + toNumber(inv.total), 0);
  const totalPending = invoices
    .filter((i) => i.status === 'sent' || i.status === 'draft' || i.status === 'overdue')
    .reduce((acc, inv) => acc + toNumber(inv.total), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* ENCABEZADO & ACCIÓN DE CREAR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Facturas</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Administra tus ingresos, estados de facturación y cobros electrónicos integrados.
          </p>
        </div>
        <div>
          <Link
            href="/invoices/create"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Nueva Factura
          </Link>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN FINANCIERO RÁPIDO */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Total Facturado</span>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">{money(totalInvoiced)}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-primary dark:bg-emerald-500/5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Cobrado</span>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">{money(totalPaid)}</h4>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Por Cobrar</span>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">{money(totalPending)}</h4>
          </div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl shadow-sm">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por número de factura o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 dark:focus:bg-[#0a0a0a] text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'all'
                ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-black shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-[#0e0e0e] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            Todas ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'paid'
                ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-[#0e0e0e] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            Pagadas ({invoices.filter((i) => i.status === 'paid').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'pending'
                ? 'bg-amber-500 border-amber-500 text-white dark:bg-amber-500/10 dark:border-amber-500 dark:text-amber-500 shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-[#0e0e0e] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            Pendientes ({invoices.filter((i) => i.status === 'sent' || i.status === 'draft').length})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'overdue'
                ? 'bg-red-500 border-red-500 text-white dark:bg-red-500/10 dark:border-red-500 dark:text-red-400 shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-[#0e0e0e] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            Vencidas ({invoices.filter((i) => i.status === 'overdue').length})
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE FACTURAS */}
      <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-500 dark:text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="mt-4 text-sm font-medium">Cargando facturas...</p>
          </div>
        ) : isError ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No se pudieron cargar las facturas</h3>
            <button
              onClick={() => refetch()}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/95 transition-all"
            >
              Reintentar
            </button>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#0b0b0b] text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Factura</th>
                  <th className="py-4 px-6">Cliente</th>
                  <th className="py-4 px-6">Fecha Emisión</th>
                  <th className="py-4 px-6">Vencimiento</th>
                  <th className="py-4 px-6">Monto</th>
                  <th className="py-4 px-6">Estado</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-zinc-400" />
                      {invoice.number}
                    </td>
                    <td className="py-4 px-6 font-medium text-zinc-850 dark:text-zinc-200">{clientName(invoice.client_id)}</td>
                    <td className="py-4 px-6 text-zinc-500 dark:text-zinc-500">{invoice.issue_date}</td>
                    <td className="py-4 px-6 text-zinc-500 dark:text-zinc-500">{invoice.due_date ?? '—'}</td>
                    <td className="py-4 px-6 font-bold text-zinc-900 dark:text-white">{money(invoice.total)}</td>
                    <td className="py-4 px-6">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                        ${invoice.status === 'paid' ? 'bg-emerald-500/10 text-primary dark:bg-emerald-500/5' : ''}
                        ${invoice.status === 'sent' ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-500' : ''}
                        ${invoice.status === 'overdue' ? 'bg-red-500/10 text-red-600 dark:bg-red-500/5 dark:text-red-400' : ''}
                        ${invoice.status === 'draft' ? 'bg-zinc-100 text-zinc-550 dark:bg-zinc-900 dark:text-zinc-400' : ''}
                        ${invoice.status === 'cancelled' ? 'bg-zinc-100 text-zinc-550 dark:bg-zinc-900 dark:text-zinc-400' : ''}
                      `}>
                        {invoiceStatusLabel(invoice.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 dark:hover:text-white dark:hover:bg-zinc-900/60 transition-colors"
                          title="Ver Detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDownloadPdf(invoice.id, invoice.number)}
                          className="p-2 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-emerald-500/5 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/20 transition-colors"
                          title="Descargar PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkAsPaid(invoice.id, invoice.number)}
                            className="p-2 rounded-lg text-zinc-500 hover:text-blue-650 hover:bg-blue-500/5 dark:hover:text-blue-400 dark:hover:bg-blue-950/20 transition-colors"
                            title="Registrar Pago"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No hay facturas registradas</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-2">
              Intenta cambiar tus filtros de búsqueda o emite tu primera factura en el botón de arriba.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
