'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  FileDown,
  CreditCard,
  ArrowUpRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useSaaSStore } from '@/lib/store';

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const { invoices, markInvoiceAsPaid, initialize, isInitialized } = useSaaSStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Simulación de descarga de PDF
  const handleDownloadPdf = (invoiceNumber: string) => {
    toast.success(`Descargando PDF de la factura ${invoiceNumber}...`, {
      style: {
        background: 'var(--color-card)',
        color: 'var(--color-foreground)',
        border: '1px border var(--color-border)',
      }
    });
  };

  // Simulación de registro de pago
  const handleMarkAsPaid = (invoiceId: string, invoiceNumber: string) => {
    markInvoiceAsPaid(invoiceId);
    toast.success(`Factura ${invoiceNumber} marcada como PAGADA con éxito`, {
      icon: '💰',
      style: {
        background: 'var(--color-card)',
        color: 'var(--color-foreground)',
        border: '1px border var(--color-border)',
      }
    });
  };

  // Filtrado de facturas en tiempo real
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'paid' && invoice.status === 'paid') ||
      (statusFilter === 'pending' && (invoice.status === 'sent' || invoice.status === 'draft')) ||
      (statusFilter === 'overdue' && invoice.status === 'overdue');

    return matchesSearch && matchesStatus;
  });

  // Cálculos rápidos de cabecera
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((acc, inv) => acc + inv.amount, 0);
  const totalPending = invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft' || inv.status === 'overdue').reduce((acc, inv) => acc + inv.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* ENCABEZADO & ACCIÓN DE CREAR */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Facturas
          </h1>
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
        {/* Total Emitido */}
        <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Total Facturado</span>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
              ${totalInvoiced.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Total Cobrado */}
        <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-primary dark:bg-emerald-500/5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Cobrado</span>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
              ${totalPaid.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Total Pendiente */}
        <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase">Por Cobrar</span>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-white mt-0.5">
              ${totalPending.toLocaleString()}
            </h4>
          </div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl shadow-sm">
        
        {/* BUSCADOR */}
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

        {/* TABS DE ESTADO */}
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
            Pagadas ({invoices.filter(i => i.status === 'paid').length})
          </button>
          <button 
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'pending' 
                ? 'bg-amber-500 border-amber-500 text-white dark:bg-amber-500/10 dark:border-amber-500 dark:text-amber-500 shadow-sm' 
                : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-[#0e0e0e] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            Pendientes ({invoices.filter(i => i.status === 'sent' || i.status === 'draft').length})
          </button>
          <button 
            onClick={() => setStatusFilter('overdue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'overdue' 
                ? 'bg-red-500 border-red-500 text-white dark:bg-red-500/10 dark:border-red-500 dark:text-red-400 shadow-sm' 
                : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-[#0e0e0e] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            Vencidas ({invoices.filter(i => i.status === 'overdue').length})
          </button>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE FACTURAS */}
      <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl shadow-sm overflow-hidden">
        {filteredInvoices.length > 0 ? (
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
                    
                    {/* Número de factura */}
                    <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-zinc-400" />
                      {invoice.number}
                    </td>
                    
                    {/* Cliente */}
                    <td className="py-4 px-6 font-medium text-zinc-850 dark:text-zinc-200">{invoice.client}</td>
                    
                    {/* Fecha de Emisión */}
                    <td className="py-4 px-6 text-zinc-500 dark:text-zinc-500">{invoice.issueDate}</td>
                    
                    {/* Fecha de Vencimiento */}
                    <td className="py-4 px-6 text-zinc-500 dark:text-zinc-500">{invoice.dueDate}</td>
                    
                    {/* Monto formateado */}
                    <td className="py-4 px-6 font-bold text-zinc-900 dark:text-white">
                      ${invoice.amount.toLocaleString()}
                    </td>
                    
                    {/* Estado */}
                    <td className="py-4 px-6">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                        ${invoice.status === 'paid' ? 'bg-emerald-500/10 text-primary dark:bg-emerald-500/5' : ''}
                        ${invoice.status === 'sent' ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-500' : ''}
                        ${invoice.status === 'overdue' ? 'bg-red-500/10 text-red-600 dark:bg-red-500/5 dark:text-red-400' : ''}
                        ${invoice.status === 'draft' ? 'bg-zinc-100 text-zinc-550 dark:bg-zinc-900 dark:text-zinc-400' : ''}
                      `}>
                        {invoice.statusLabel}
                      </span>
                    </td>
                    
                    {/* Acciones */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Ver Detalle */}
                        <Link 
                          href={`/invoices/${invoice.id}`}
                          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 dark:hover:text-white dark:hover:bg-zinc-900/60 transition-colors"
                          title="Ver Detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        
                        {/* Descargar PDF */}
                        <button 
                          onClick={() => handleDownloadPdf(invoice.number)}
                          className="p-2 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-emerald-500/5 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/20 transition-colors"
                          title="Descargar PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>

                        {/* Registrar Pago si no está Pagada */}
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
